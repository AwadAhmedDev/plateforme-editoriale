import { CategorieRepository } from "@/lib/db/categorie-repository";

export type CategorieSlug = {
  slug: string;
};

// Lecture publique pour app/sitemap.ts (Lot L8c, contrat validé) : réutilise
// CategorieRepository.findAllWithArticleCount sans modification — cette
// méthode n'est pas gardée par session (la garde existante, dans
// listCategories(), est propre à l'usage admin, jamais portée par le
// repository lui-même). Toutes les catégories sont incluses, publiées ou
// non encore dotées d'article : la route /categorie/[slug] résout dans les
// deux cas (état vide neutre géré par get-categorie-page.ts), jamais un
// 404 — aucune raison de filtrer ici.
export async function listCategorieSlugs(): Promise<CategorieSlug[]> {
  const categories = await CategorieRepository.findAllWithArticleCount();

  return categories.map((categorie) => ({ slug: categorie.slug }));
}
