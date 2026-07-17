"use server";

import { revalidatePath } from "next/cache";
import { getCurrentSession } from "@/features/admin-auth/session";
import { CategorieRepository } from "@/lib/db/categorie-repository";
import { ContenuEditorialRepository } from "@/lib/db/contenu-editorial-repository";

// Server Actions de Gestion des catégories (server-actions-specification.md §4.2-§4.4).
// Chacune revérifie elle-même la Session administrateur (security-specification.md §3),
// indépendamment de la garde déjà appliquée en amont (proxy.ts + layout.tsx). Signature
// directement compatible avec useActionState (formulaire de création) ou avec .bind(null, id)
// + useActionState (formulaire d'édition/suppression par ligne) : aucune couche de pont
// FormData supplémentaire n'est nécessaire, ces fonctions sont déjà l'action de formulaire.
export type CategoryActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
  // Valeurs soumises, restituées au formulaire en cas d'échec — nécessaire car React
  // réinitialise lui-même les champs non contrôlés dès qu'une Server Action liée à un
  // <form> se résout (constat déjà fait sur le formulaire de connexion).
  values?: { nom: string; slug: string; descriptionCourte: string };
};

async function ensureAdministrateurAuthentifie(): Promise<void> {
  const session = await getCurrentSession();
  if (!session.authenticated) {
    throw new Error("Accès refusé : aucune Session administrateur valide.");
  }
}

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function lireChampsFormulaire(formData: FormData): { nom: string; slug: string; descriptionCourte: string } {
  return {
    nom: String(formData.get("nom") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    descriptionCourte: String(formData.get("descriptionCourte") ?? "").trim(),
  };
}

export async function createCategory(
  _previousState: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
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

  const [categorieExistanteParNom, categorieExistanteParSlug] = await Promise.all([
    CategorieRepository.findByNom(values.nom),
    CategorieRepository.findBySlug(slug),
  ]);

  if (categorieExistanteParNom) {
    return { status: "error", message: "Ce nom de catégorie est déjà utilisé.", values };
  }
  if (categorieExistanteParSlug) {
    return { status: "error", message: "Ce slug est déjà utilisé.", values };
  }

  await CategorieRepository.create({ nom: values.nom, slug, descriptionCourte });
  revalidatePath("/admin/categories");

  return { status: "success", message: "Catégorie créée." };
}

export async function updateCategory(
  id: string,
  _previousState: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  await ensureAdministrateurAuthentifie();

  const existante = await CategorieRepository.findById(id);
  if (!existante) {
    return { status: "error", message: "Catégorie introuvable." };
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
    const categorieExistanteParNom = await CategorieRepository.findByNom(values.nom);
    if (categorieExistanteParNom && categorieExistanteParNom.id !== id) {
      return { status: "error", message: "Ce nom de catégorie est déjà utilisé.", values };
    }
  }

  if (slug !== existante.slug) {
    const categorieExistanteParSlug = await CategorieRepository.findBySlug(slug);
    if (categorieExistanteParSlug && categorieExistanteParSlug.id !== id) {
      return { status: "error", message: "Ce slug est déjà utilisé.", values };
    }
  }

  await CategorieRepository.update(id, { nom: values.nom, slug, descriptionCourte });
  revalidatePath("/admin/categories");

  return { status: "success", message: "Catégorie mise à jour." };
}

export async function deleteCategory(
  id: string,
  _previousState: CategoryActionState,
  _formData: FormData
): Promise<CategoryActionState> {
  await ensureAdministrateurAuthentifie();

  const existante = await CategorieRepository.findById(id);
  if (!existante) {
    return { status: "error", message: "Catégorie introuvable." };
  }

  // Revérifié côté serveur — jamais fié au seul état désactivé côté UI.
  const estReferencee = await ContenuEditorialRepository.existsByCategorieId(id);
  if (estReferencee) {
    return {
      status: "error",
      message: "Cette catégorie est associée à au moins un contenu et ne peut pas être supprimée.",
    };
  }

  await CategorieRepository.delete(id);
  revalidatePath("/admin/categories");

  return { status: "success", message: "Catégorie supprimée." };
}
