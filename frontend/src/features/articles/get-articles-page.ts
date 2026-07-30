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
  page: number;
  hasNextPage: boolean;
  articles: ArticlesPageArticle[];
};

// Lecture publique pour app/(public)/articles/page.tsx (rétablissement de la route,
// remplace l'ancien get-articles-list.ts supprimé en RC-1) : ContenuEditorialRepository
// .findManyPublished sans filtre (statut 'publie' et tri par date de publication
// décroissante déjà portés par le repository) — même fonction que get-categorie-page.ts
// et get-zone-page.ts, sans categorieId/zoneId. `page` transmis tel quel : le repository
// clampe déjà toute valeur hors bornes à la dernière page existante et retourne la page
// réellement servie (Lot 1A, pagination) — la page appelante compare `page` demandé à
// `page` retourné pour détecter une page hors bornes (notFound), sans logique dupliquée
// ici. `count` = total réel (pas `items.length`). Mémoïsée (React.cache) : generateMetadata
// et la page appellent toutes deux cette fonction avec le même argument `page`, un seul
// accès base de données réel par requête.
export const getArticlesPage = cache(async (page: number): Promise<ArticlesPageData> => {
  const { items, total, page: pageServie, hasNextPage } = await ContenuEditorialRepository.findManyPublished({
    page,
  });

  return {
    count: total,
    page: pageServie,
    hasNextPage,
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
