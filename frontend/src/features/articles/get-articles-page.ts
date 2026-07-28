import { cache } from "react";
import { ContenuEditorialRepository } from "@/lib/db/contenu-editorial-repository";
import { estimerTempsLecture } from "@/features/articles/reading-time";

export type ArticlesPageArticle = {
  slug: string;
  titre: string;
  chapo: string | null;
  imagePrincipaleUrl: string;
  imageAltText: string;
  categorieNom: string;
  categorieSlug: string;
  zoneNom: string;
  zoneSlug: string;
  auteur: string | null;
  datePublication: Date;
  tempsLecture: string;
};

export type ArticlesPageData = {
  count: number;
  articles: ArticlesPageArticle[];
};

// Lecture publique pour app/(public)/articles/page.tsx (rétablissement de la route,
// remplace l'ancien get-articles-list.ts supprimé en RC-1) : ContenuEditorialRepository
// .findManyPublished sans filtre (statut 'publie' et tri par date de publication
// décroissante déjà portés par le repository) — même fonction que get-categorie-page.ts
// et get-zone-page.ts, sans categorieId/zoneId. Page 1 uniquement (24 articles) — aucune
// pagination dans ce lot, cohérent avec /recherche, /categorie/[slug] et /zone/[slug].
// `count` = total réel (pas `items.length`). Mémoïsée (React.cache) : generateMetadata et
// la page appellent toutes deux cette fonction, un seul accès base de données réel par
// requête.
export const getArticlesPage = cache(async (): Promise<ArticlesPageData> => {
  const { items, total } = await ContenuEditorialRepository.findManyPublished({ page: 1 });

  return {
    count: total,
    articles: items.map((item) => ({
      slug: item.slug,
      titre: item.titre!,
      chapo: item.chapo,
      imagePrincipaleUrl: item.imagePrincipaleUrl!,
      imageAltText: item.imageAltText!,
      categorieNom: item.categorie!.nom,
      categorieSlug: item.categorie!.slug,
      zoneNom: item.zone!.nom,
      zoneSlug: item.zone!.slug,
      auteur: item.auteur,
      datePublication: item.datePublication!,
      tempsLecture: estimerTempsLecture(item.corps),
    })),
  };
});
