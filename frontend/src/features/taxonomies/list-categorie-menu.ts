import { cache } from "react";
import { CategorieRepository } from "@/lib/db/categorie-repository";

export type CategorieMenuItem = {
  nom: string;
  slug: string;
};

// Lecture publique pour footer-taxonomies.tsx (Lot L8e.2, contrat validé) et
// public-header.tsx (Lot 6.1, contrat consolidé §1) : réutilise
// CategorieRepository.findAllWithArticleCount sans modification — déjà trié
// nom asc, non gardé par session au niveau du repository. Distinct de
// list-categorie-slugs.ts (L8c, réservé à app/sitemap.ts, slug seul) : ici
// la navigation a besoin du nom affiché, jamais fusionné avec l'usage
// sitemap. Toutes les catégories sont incluses, publiées ou non encore
// dotées d'article — /categorie/[slug] résout dans les deux cas.
//
// Enveloppée dans React.cache() (Lot 6.1) : header et footer l'appellent
// désormais tous les deux dans la même requête HTTP — une seule requête
// base de données par requête, jamais deux.
export const listCategorieMenu = cache(async (): Promise<CategorieMenuItem[]> => {
  const categories = await CategorieRepository.findAllWithArticleCount();

  return categories.map((categorie) => ({ nom: categorie.nom, slug: categorie.slug }));
});
