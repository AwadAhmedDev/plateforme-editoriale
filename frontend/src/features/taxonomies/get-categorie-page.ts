import { cache } from "react";
import { CategorieRepository } from "@/lib/db/categorie-repository";
import { ZoneGeographiqueRepository } from "@/lib/db/zone-geographique-repository";
import { ContenuEditorialRepository } from "@/lib/db/contenu-editorial-repository";
import { estimerTempsLecture } from "@/features/articles/reading-time";
import { estTypeContenuValide } from "@/features/articles/type-contenu-labels";
import { analyserJour } from "@/lib/filtres-publics";
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
//
// Filtres secondaires (Lot Filtres, ui-specification.md §Comportement des filtres,
// api-contracts.md §3.6) : zone, type et bornes de date — jamais `categorie`, déjà donnée
// par la route. Tous portés par ArticlesPubliesFiltre et appliqués par
// construireFiltrePublie, donc AUCUNE modification de repository. Un slug de zone inconnu
// produit un résultat vide en HTTP 200, jamais un 404 : seul le slug de la route peut être
// introuvable (même règle que searchArticles).
//
// ATTENTION — arguments primitifs, jamais un objet : React.cache compare ses arguments par
// identité. Un littéral d'objet reconstruit par generateMetadata puis par la page
// produirait deux clés distinctes, donc deux requêtes base par requête HTTP au lieu d'une.
// La signature publique confortable est fournie par le wrapper getCategoriePage ci-dessous.
const lireCategoriePage = cache(async (
  slug: string,
  page: number,
  zoneSlug: string,
  typeContenu: string,
  du: string,
  au: string
): Promise<CategoriePageData | null> => {
  const categorie = await CategorieRepository.findBySlug(slug);

  if (!categorie) {
    return null;
  }

  const zone = zoneSlug ? await ZoneGeographiqueRepository.findBySlug(zoneSlug) : null;

  // Zone demandée mais inexistante : filtre volontairement impossible à satisfaire plutôt
  // qu'ignoré en silence — afficher la rubrique entière laisserait croire que le filtre a
  // été pris en compte.
  //
  // `page: 1` et non la page demandée : un ensemble vide n'a qu'une page. Retourner la
  // page demandée ferait passer la garde hors-bornes de la page appelante (page servie ==
  // page demandée), donc `?zone=inexistante&page=999` répondrait 200 en rendant un lien
  // « Précédent » vers la page 998, elle-même vers 997 — une échelle descendante infinie
  // de réponses 200 vides, suivie par les crawlers (`follow`). Avec 1, la garde se
  // déclenche et renvoie 404, exactement comme `?type=rapport&page=999`.
  if (zoneSlug && !zone) {
    return {
      nom: categorie.nom,
      slug: categorie.slug,
      descriptionCourte: categorie.descriptionCourte,
      count: 0,
      page: 1,
      hasNextPage: false,
      breadcrumb: [{ label: "Accueil", href: "/" }, { label: categorie.nom }],
      articles: [],
    };
  }

  const borneDu = analyserJour(du);
  const borneAu = analyserJour(au);

  const { items, total, page: pageServie, hasNextPage } = await ContenuEditorialRepository.findManyPublished({
    categorieId: categorie.id,
    ...(zone ? { zoneId: zone.id } : {}),
    ...(estTypeContenuValide(typeContenu) ? { typeContenu } : {}),
    ...(borneDu ? { dateFrom: borneDu.debut } : {}),
    ...(borneAu ? { dateTo: borneAu.fin } : {}),
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

export type CategoriePageFiltres = {
  page: number;
  zoneSlug?: string;
  typeContenu?: string;
  du?: string;
  au?: string;
};

// Signature publique : un objet d'options, aplati ici en arguments primitifs stables avant
// d'atteindre la fonction mémoïsée. Les absents deviennent la chaîne vide plutôt que
// `undefined` — une seule forme de « pas de filtre », donc une seule clé de mémoïsation.
// generateMetadata et la page peuvent ainsi appeler cette fonction indépendamment sans
// jamais provoquer un second accès base de données.
export function getCategoriePage(
  slug: string,
  filtres: CategoriePageFiltres
): Promise<CategoriePageData | null> {
  return lireCategoriePage(
    slug,
    filtres.page,
    filtres.zoneSlug ?? "",
    filtres.typeContenu ?? "",
    filtres.du ?? "",
    filtres.au ?? ""
  );
}
