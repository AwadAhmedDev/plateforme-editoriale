"use server";

import { revalidatePath } from "next/cache";
import { ZoneGeographiqueRepository } from "@/lib/db/zone-geographique-repository";
import { ContenuEditorialRepository } from "@/lib/db/contenu-editorial-repository";
import { ensureAdministrateurAuthentifie } from "@/lib/auth/require-admin-session";
import { slugify } from "@/lib/slug";

// Server Actions de Gestion des zones géographiques (server-actions-specification.md §5,
// symétrique de §4.2-§4.4). Chacune revérifie elle-même la Session administrateur
// (security-specification.md §3), indépendamment de la garde déjà appliquée en amont
// (proxy.ts + layout.tsx). Signature directement compatible avec useActionState (formulaire
// de création) ou avec .bind(null, id) + useActionState (formulaire d'édition/suppression
// par ligne) : aucune couche de pont FormData supplémentaire n'est nécessaire, ces fonctions
// sont déjà l'action de formulaire.
export type ZoneActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
  // Valeurs soumises, restituées au formulaire en cas d'échec — nécessaire car React
  // réinitialise lui-même les champs non contrôlés dès qu'une Server Action liée à un
  // <form> se résout (constat déjà fait sur le formulaire de connexion).
  values?: { nom: string; slug: string; descriptionCourte: string };
};

function lireChampsFormulaire(formData: FormData): { nom: string; slug: string; descriptionCourte: string } {
  return {
    nom: String(formData.get("nom") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    descriptionCourte: String(formData.get("descriptionCourte") ?? "").trim(),
  };
}

export async function createZone(
  _previousState: ZoneActionState,
  formData: FormData
): Promise<ZoneActionState> {
  await ensureAdministrateurAuthentifie();

  const values = lireChampsFormulaire(formData);
  const descriptionCourte = values.descriptionCourte.length > 0 ? values.descriptionCourte : null;

  if (values.nom.length === 0) {
    return { status: "error", message: "Le nom est requis.", values };
  }

  const slug = slugify(values.slug.length > 0 ? values.slug : values.nom);
  if (slug.length === 0) {
    return { status: "error", message: "Le nom doit contenir au moins une lettre ou un chiffre.", values };
  }

  const [zoneExistanteParNom, zoneExistanteParSlug] = await Promise.all([
    ZoneGeographiqueRepository.findByNom(values.nom),
    ZoneGeographiqueRepository.findBySlug(slug),
  ]);

  if (zoneExistanteParNom) {
    return { status: "error", message: "Ce nom de zone géographique est déjà utilisé.", values };
  }
  if (zoneExistanteParSlug) {
    return { status: "error", message: "Ce slug est déjà utilisé.", values };
  }

  await ZoneGeographiqueRepository.create({ nom: values.nom, slug, descriptionCourte });
  revalidatePath("/admin/categories");

  return { status: "success", message: "Zone géographique créée." };
}

export async function updateZone(
  id: string,
  _previousState: ZoneActionState,
  formData: FormData
): Promise<ZoneActionState> {
  await ensureAdministrateurAuthentifie();

  const existante = await ZoneGeographiqueRepository.findById(id);
  if (!existante) {
    return { status: "error", message: "Zone géographique introuvable." };
  }

  const values = lireChampsFormulaire(formData);
  const descriptionCourte = values.descriptionCourte.length > 0 ? values.descriptionCourte : null;

  if (values.nom.length === 0) {
    return { status: "error", message: "Le nom est requis.", values };
  }

  const slug = slugify(values.slug.length > 0 ? values.slug : values.nom);
  if (slug.length === 0) {
    return { status: "error", message: "Le nom doit contenir au moins une lettre ou un chiffre.", values };
  }

  if (values.nom !== existante.nom) {
    const zoneExistanteParNom = await ZoneGeographiqueRepository.findByNom(values.nom);
    if (zoneExistanteParNom && zoneExistanteParNom.id !== id) {
      return { status: "error", message: "Ce nom de zone géographique est déjà utilisé.", values };
    }
  }

  if (slug !== existante.slug) {
    const zoneExistanteParSlug = await ZoneGeographiqueRepository.findBySlug(slug);
    if (zoneExistanteParSlug && zoneExistanteParSlug.id !== id) {
      return { status: "error", message: "Ce slug est déjà utilisé.", values };
    }
  }

  await ZoneGeographiqueRepository.update(id, { nom: values.nom, slug, descriptionCourte });
  revalidatePath("/admin/categories");

  return { status: "success", message: "Zone géographique mise à jour." };
}

export async function deleteZone(
  id: string,
  _previousState: ZoneActionState,
  _formData: FormData
): Promise<ZoneActionState> {
  await ensureAdministrateurAuthentifie();

  const existante = await ZoneGeographiqueRepository.findById(id);
  if (!existante) {
    return { status: "error", message: "Zone géographique introuvable." };
  }

  // Revérifié côté serveur — jamais fié au seul état désactivé côté UI.
  const estReferencee = await ContenuEditorialRepository.existsByZoneId(id);
  if (estReferencee) {
    return {
      status: "error",
      message: "Cette zone géographique est associée à au moins un contenu et ne peut pas être supprimée.",
    };
  }

  await ZoneGeographiqueRepository.delete(id);
  revalidatePath("/admin/categories");

  return { status: "success", message: "Zone géographique supprimée." };
}
