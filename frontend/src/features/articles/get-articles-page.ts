import { cache } from "react";
import { ContenuEditorialRepository } from "@/lib/db/contenu-editorial-repository";
import { CategorieRepository } from "@/lib/db/categorie-repository";
import { ZoneGeographiqueRepository } from "@/lib/db/zone-geographique-repository";
import { estimerTempsLecture } from "@/features/articles/reading-time";
import { estTypeContenuValide } from "@/features/articles/type-contenu-labels";
import { analyserJour } from "@/lib/filtres-publics";

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
//
// Filtres (Lot Filtres, ui-specification.md §Comportement des filtres, api-contracts.md
// §3.2) : rubrique, pays, type et bornes de date — les quatre axes, aucune dimension
// n'étant donnée par la route ici, contrairement à /categorie et /zone. Symétrique de
// get-categorie-page.ts, voir ce fichier pour le détail (arguments primitifs imposés par
// React.cache, court-circuit d'un slug inconnu retournant `page: 1`).
const lireArticlesPage = cache(async (
  page: number,
  categorieSlug: string,
  zoneSlug: string,
  typeContenu: string,
  du: string,
  au: string
): Promise<ArticlesPageData> => {
  const [categorie, zone] = await Promise.all([
    categorieSlug ? CategorieRepository.findBySlug(categorieSlug) : null,
    zoneSlug ? ZoneGeographiqueRepository.findBySlug(zoneSlug) : null,
  ]);

  if ((categorieSlug && !categorie) || (zoneSlug && !zone)) {
    return { count: 0, page: 1, hasNextPage: false, articles: [] };
  }

  const borneDu = analyserJour(du);
  const borneAu = analyserJour(au);

  const { items, total, page: pageServie, hasNextPage } = await ContenuEditorialRepository.findManyPublished({
    ...(categorie ? { categorieId: categorie.id } : {}),
    ...(zone ? { zoneId: zone.id } : {}),
    ...(estTypeContenuValide(typeContenu) ? { typeContenu } : {}),
    ...(borneDu ? { dateFrom: borneDu.debut } : {}),
    ...(borneAu ? { dateTo: borneAu.fin } : {}),
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

export type ArticlesPageFiltres = {
  page: number;
  categorieSlug?: string;
  zoneSlug?: string;
  typeContenu?: string;
  du?: string;
  au?: string;
};

// Signature publique aplatissant l'objet d'options en arguments primitifs stables — cf.
// get-categorie-page.ts : React.cache compare par identité.
export function getArticlesPage(filtres: ArticlesPageFiltres): Promise<ArticlesPageData> {
  return lireArticlesPage(
    filtres.page,
    filtres.categorieSlug ?? "",
    filtres.zoneSlug ?? "",
    filtres.typeContenu ?? "",
    filtres.du ?? "",
    filtres.au ?? ""
  );
}
