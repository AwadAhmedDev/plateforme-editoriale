import { cache } from "react";
import { CategorieRepository } from "@/lib/db/categorie-repository";
import { ContenuEditorialRepository } from "@/lib/db/contenu-editorial-repository";
import { estimerTempsLecture } from "@/features/articles/reading-time";
import type { BreadcrumbItem } from "@/components/shared/breadcrumb";

export type CategoriePageArticle = {
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

export type CategoriePageData = {
  nom: string;
  slug: string;
  descriptionCourte: string | null;
  count: number;
  page: number;
  hasNextPage: boolean;
  breadcrumb: BreadcrumbItem[];
  articles: CategoriePageArticle[];
};

// Lecture publique pour app/(public)/categorie/[slug]/page.tsx : CategorieRepository.findBySlug
// puis ContenuEditorialRepository.findManyPublished({ categorieId }), tous deux existants et
// non modifiés. `page` transmis tel quel : le repository clampe déjà toute valeur hors
// bornes à la dernière page existante et retourne la page réellement servie (Lot 1A,
// pagination) — la page appelante compare `page` demandé à `page` retourné pour détecter
// une page hors bornes (notFound), sans logique dupliquée ici. Champs `chapo`/`auteur`
// déjà retournés par la requête Prisma sous-jacente (ARTICLE_PUBLIC_LIST_INCLUDE) : simple
// projection supplémentaire, aucune modification de repository (clôture RC-1, alignement
// sur la carte de listing du design, Corne de l'Afrique.dc.html l.273-286). `count` = total
// réel (pas seulement `items.length`). Mémoïsée (React.cache) : generateMetadata et la
// page appellent toutes deux cette fonction avec les mêmes arguments, un seul accès base
// de données réel par requête.
//
// Fil d'Ariane (Lot 2B, sitemap.md §Navigation secondaire : « Accueil / page courante ») :
// deux segments, le second sans `href` — Breadcrumb rend alors de lui-même un
// `aria-current="page"` non cliquable, aucune modification de ce composant. Indépendant de
// `?page=N` : « Accueil / Asile & protection » est identique en page 1 et en page 3, le fil
// d'Ariane ne situe pas dans la pagination mais dans l'arborescence. Type `BreadcrumbItem`
// réutilisé depuis le composant partagé plutôt que redéclaré localement.
export const getCategoriePage = cache(async (slug: string, page: number): Promise<CategoriePageData | null> => {
  const categorie = await CategorieRepository.findBySlug(slug);

  if (!categorie) {
    return null;
  }

  const { items, total, page: pageServie, hasNextPage } = await ContenuEditorialRepository.findManyPublished({
    categorieId: categorie.id,
    page,
  });

  return {
    nom: categorie.nom,
    slug: categorie.slug,
    descriptionCourte: categorie.descriptionCourte,
    count: total,
    page: pageServie,
    hasNextPage,
    breadcrumb: [{ label: "Accueil", href: "/" }, { label: categorie.nom }],
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
