"use server";

import { z } from "zod";
import { ContenuEditorialRepository } from "@/lib/db/contenu-editorial-repository";
import { ensureAdministrateurAuthentifie, refusSiCompteDemo } from "@/lib/auth/require-admin-session";
import { uploadImage, ImageValidationError } from "@/lib/media/upload-image";
import { revalidateArticleSurfaces, toArticleSurfaceState } from "@/features/articles/revalidate-article-surfaces";

// Orchestration Article + Média (Lot 7) : Server Action → Validation → Autorisation →
// uploadImage() (lib/media, Lot 6) → Repository → résultat utilisateur. Fichier séparé de
// article-actions.ts (Lot 5), volontairement non modifié. Aucun accès Prisma direct ici :
// uniquement ContenuEditorialRepository. Hors périmètre : UI, composants React,
// revalidation Next.js, nettoyage des fichiers R2 orphelins en cas d'échec de persistance.
export type ArticleMediaActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
  errors?: Record<string, string>;
};

const GENERIC_ERROR_MESSAGE = "Une erreur est survenue, veuillez réessayer.";
const NOT_FOUND_MESSAGE = "Contenu introuvable.";

// Validation locale, propre à ce fichier — n'étend ni ne modifie articleFieldsSchema
// (article-schema.ts, Lot 4), qui reste inchangé (décision d'architecture validée).
const mainImageFieldsSchema = z.object({
  imageAltText: z.string().trim().min(1, "Le texte alternatif de l'image est requis."),
});

// DETTE DOCUMENTÉE (décision d'architecture validée, Lot 7) : `updateArticle`
// (article-actions.ts, Lot 5) et `articleFieldsSchema` (article-schema.ts, Lot 4)
// continuent d'accepter `imagePrincipaleUrl` comme simple chaîne saisie manuellement —
// coexistence temporaire et volontaire avec cette Server Action d'upload, qui applique
// des garanties de sécurité strictement supérieures (validation par octets de signature,
// jamais une URL de confiance non vérifiée). Migration future vers un chemin exclusif
// « upload-only » à trancher séparément — non traitée par ce lot.
export async function uploadMainImage(
  id: string,
  _previousState: ArticleMediaActionState,
  formData: FormData
): Promise<ArticleMediaActionState> {
  await ensureAdministrateurAuthentifie();
  const refusDemo = await refusSiCompteDemo();
  if (refusDemo) return refusDemo;

  const existante = await ContenuEditorialRepository.findById(id);
  if (!existante) {
    return { status: "error", message: NOT_FOUND_MESSAGE };
  }

  const analyse = mainImageFieldsSchema.safeParse({
    imageAltText: formData.get("imageAltText"),
  });
  if (!analyse.success) {
    const message = analyse.error.issues[0]?.message ?? GENERIC_ERROR_MESSAGE;
    return { status: "error", message, errors: { imageAltText: message } };
  }

  const fichier = formData.get("image");
  if (!(fichier instanceof File) || fichier.size === 0) {
    return { status: "error", message: "Une image est requise." };
  }

  let televerse: Awaited<ReturnType<typeof uploadImage>>;
  try {
    const buffer = Buffer.from(await fichier.arrayBuffer());
    televerse = await uploadImage(buffer);
  } catch (error) {
    // Messages ImageValidationError conçus pour être affichés tels quels (taille, SVG,
    // format non autorisé) — seule exception délibérée au principe « jamais l'erreur
    // brute » : ce ne sont pas des erreurs Prisma/réseau, mais des rejets de validation
    // applicative avec un message déjà pensé pour l'utilisateur (lib/media, Lot 6).
    if (error instanceof ImageValidationError) {
      return { status: "error", message: error.message };
    }
    return { status: "error", message: GENERIC_ERROR_MESSAGE };
  }

  try {
    await ContenuEditorialRepository.updateMainImage(id, {
      imagePrincipaleUrl: televerse.url,
      imageAltText: analyse.data.imageAltText,
      imageLargeur: televerse.largeur,
      imageHauteur: televerse.hauteur,
    });
  } catch {
    return { status: "error", message: GENERIC_ERROR_MESSAGE };
  }

  // Un changement d'image ne modifie ni le slug, ni le statut, ni la catégorie/zone —
  // l'état avant/après est donc identique pour la revalidation, qui n'a besoin que de
  // savoir si l'article est actuellement visible publiquement pour décider quoi invalider.
  const etat = toArticleSurfaceState(existante);
  revalidateArticleSurfaces(etat, etat);

  return { status: "success", message: "Image principale mise à jour." };
}
