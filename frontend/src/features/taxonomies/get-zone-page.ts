import { cache } from "react";
import { ZoneGeographiqueRepository } from "@/lib/db/zone-geographique-repository";
import { CategorieRepository } from "@/lib/db/categorie-repository";
import { ContenuEditorialRepository } from "@/lib/db/contenu-editorial-repository";
import { estimerTempsLecture } from "@/features/articles/reading-time";
import { estTypeContenuValide } from "@/features/articles/type-contenu-labels";
import { analyserJour } from "@/lib/filtres-publics";
import type { BreadcrumbItem } from "@/components/shared/breadcrumb";

export type ZonePageArticle = {
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

export type ZonePageData = {
  nom: string;
  slug: string;
  descriptionCourte: string | null;
  count: number;
  page: number;
  hasNextPage: boolean;
  breadcrumb: BreadcrumbItem[];
  articles: ZonePageArticle[];
};

// Lecture publique pour app/(public)/zone/[slug]/page.tsx : symétrique de
// get-categorie-page.ts. ZoneGeographiqueRepository.findBySlug puis
// ContenuEditorialRepository.findManyPublished({ zoneId }), tous deux existants et non
// modifiés. `page` transmis tel quel : le repository clampe déjà toute valeur hors bornes
// à la dernière page existante et retourne la page réellement servie (Lot 1A,
// pagination) — la page appelante compare `page` demandé à `page` retourné pour détecter
// une page hors bornes (notFound), sans logique dupliquée ici. Champs `chapo`/`auteur`
// déjà retournés par la requête Prisma sous-jacente : simple projection supplémentaire
// (clôture RC-1, alignement sur la carte de listing du design). `count` = total réel, pas
// `items.length`. Mémoïsée (React.cache) : generateMetadata et la page appellent toutes
// deux cette fonction avec les mêmes arguments, un seul accès base de données réel par
// requête.
//
// Fil d'Ariane (Lot 2B) : identique à get-categorie-page.ts sur l'axe géographique — deux
// segments, le second sans `href`, indépendant de `?page=N`. Voir ce fichier pour le détail.
//
// Filtres secondaires (Lot Filtres) : rubrique, type et bornes de date — jamais `zone`,
// déjà donnée par la route. Symétrique de get-categorie-page.ts, voir ce fichier pour le
// détail des règles (arguments primitifs imposés par React.cache, court-circuit d'un slug
// secondaire inconnu retournant `page: 1`).
const lireZonePage = cache(async (
  slug: string,
  page: number,
  categorieSlug: string,
  typeContenu: string,
  du: string,
  au: string
): Promise<ZonePageData | null> => {
  const zone = await ZoneGeographiqueRepository.findBySlug(slug);

  if (!zone) {
    return null;
  }

  const categorie = categorieSlug ? await CategorieRepository.findBySlug(categorieSlug) : null;

  if (categorieSlug && !categorie) {
    return {
      nom: zone.nom,
      slug: zone.slug,
      descriptionCourte: zone.descriptionCourte,
      count: 0,
      page: 1,
      hasNextPage: false,
      breadcrumb: [{ label: "Accueil", href: "/" }, { label: zone.nom }],
      articles: [],
    };
  }

  const borneDu = analyserJour(du);
  const borneAu = analyserJour(au);

  const { items, total, page: pageServie, hasNextPage } = await ContenuEditorialRepository.findManyPublished({
    zoneId: zone.id,
    ...(categorie ? { categorieId: categorie.id } : {}),
    ...(estTypeContenuValide(typeContenu) ? { typeContenu } : {}),
    ...(borneDu ? { dateFrom: borneDu.debut } : {}),
    ...(borneAu ? { dateTo: borneAu.fin } : {}),
    page,
  });

  return {
    nom: zone.nom,
    slug: zone.slug,
    descriptionCourte: zone.descriptionCourte,
    count: total,
    page: pageServie,
    hasNextPage,
    breadcrumb: [{ label: "Accueil", href: "/" }, { label: zone.nom }],
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

export type ZonePageFiltres = {
  page: number;
  categorieSlug?: string;
  typeContenu?: string;
  du?: string;
  au?: string;
};

// Signature publique aplatissant l'objet d'options en arguments primitifs stables — cf.
// get-categorie-page.ts : React.cache compare par identité, un littéral d'objet
// reconstruit par generateMetadata puis par la page produirait deux accès base.
export function getZonePage(slug: string, filtres: ZonePageFiltres): Promise<ZonePageData | null> {
  return lireZonePage(
    slug,
    filtres.page,
    filtres.categorieSlug ?? "",
    filtres.typeContenu ?? "",
    filtres.du ?? "",
    filtres.au ?? ""
  );
}
