import { revalidatePath } from "next/cache";
import type { StatutContenu } from "@prisma/client";
import type { ArticleForEdit } from "@/lib/db/contenu-editorial-repository";

// Revalidation centralisée des surfaces publiques après mutation d'un Contenu éditorial
// (Lot 8, décision d'architecture validée) — point d'entrée unique appelé par les Server
// Actions (article-actions.ts, article-media-actions.ts) ; jamais de revalidatePath()
// dispersé directement dans une action. Calcule les chemins à partir de l'état AVANT et
// APRÈS la mutation : un changement de Catégorie/Zone sur un article déjà publié invalide
// l'ancienne ET la nouvelle page concernée, pas seulement la nouvelle (risque déjà
// identifié en architecture : « un oubli entraînerait un contenu public périmé »).
export type ArticleSurfaceState = {
  slug: string;
  statut: StatutContenu;
  categorieSlug: string | null;
  zoneSlug: string | null;
};

// Construit l'état pertinent à partir d'une lecture repository déjà enrichie (findById,
// Lot 1 étendu au Lot 8) — aucun appel supplémentaire à CategorieRepository/
// ZoneGeographiqueRepository : la donnée transite uniquement via ce mapping.
export function toArticleSurfaceState(article: ArticleForEdit): ArticleSurfaceState {
  return {
    slug: article.slug,
    statut: article.statut,
    categorieSlug: article.categorie?.slug ?? null,
    zoneSlug: article.zone?.slug ?? null,
  };
}

// Publié et Archivé conservent tous deux une page de détail accessible en direct (DR-001)
// — jamais Brouillon.
function aPageDetailDirecte(etat: ArticleSurfaceState | null): etat is ArticleSurfaceState {
  return etat !== null && (etat.statut === "publie" || etat.statut === "archive");
}

// Seul Publié apparaît dans les surfaces de découverte (listes, recherche, Catégorie,
// Zone, Accueil, sitemap) — Archivé en est explicitement exclu (DR-001).
function estDansLesSurfacesDeDecouverte(etat: ArticleSurfaceState | null): etat is ArticleSurfaceState {
  return etat !== null && etat.statut === "publie";
}

export function revalidateArticleSurfaces(
  avant: ArticleSurfaceState | null,
  apres: ArticleSurfaceState | null
): void {
  const chemins = new Set<string>();

  if (aPageDetailDirecte(avant)) chemins.add(`/articles/${avant.slug}`);
  if (aPageDetailDirecte(apres)) chemins.add(`/articles/${apres.slug}`);

  if (estDansLesSurfacesDeDecouverte(avant)) {
    chemins.add("/articles");
    chemins.add("/recherche");
    chemins.add("/");
    chemins.add("/sitemap.xml");
    if (avant.categorieSlug) chemins.add(`/categorie/${avant.categorieSlug}`);
    if (avant.zoneSlug) chemins.add(`/zone/${avant.zoneSlug}`);
  }

  if (estDansLesSurfacesDeDecouverte(apres)) {
    chemins.add("/articles");
    chemins.add("/recherche");
    chemins.add("/");
    chemins.add("/sitemap.xml");
    if (apres.categorieSlug) chemins.add(`/categorie/${apres.categorieSlug}`);
    if (apres.zoneSlug) chemins.add(`/zone/${apres.zoneSlug}`);
  }

  for (const chemin of chemins) {
    revalidatePath(chemin);
  }
}
