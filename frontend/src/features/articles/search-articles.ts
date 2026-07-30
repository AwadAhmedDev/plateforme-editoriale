import type { TypeContenu } from "@prisma/client";
import { CategorieRepository } from "@/lib/db/categorie-repository";
import { ZoneGeographiqueRepository } from "@/lib/db/zone-geographique-repository";
import { ContenuEditorialRepository, type TriRechercheContenu } from "@/lib/db/contenu-editorial-repository";
import { TYPE_CONTENU_LABELS } from "@/features/articles/type-contenu-labels";
import { estimerTempsLecture } from "@/features/articles/reading-time";

export type SearchResultArticle = {
  slug: string;
  titre: string;
  imagePrincipaleUrl: string;
  imageAltText: string;
  categorieNom: string;
  zoneNom: string;
  typeLabel: string;
  auteur: string | null;
  datePublication: Date;
  tempsLecture: string;
  chapo: string | null;
};

export type SearchArticlesParams = {
  q?: string;
  categorieSlug?: string;
  zoneSlug?: string;
  typeContenu?: string;
  sort?: string;
  // Bornes de date de publication, incluses toutes les deux (Lot 2A) — chaînes brutes
  // d'URL au format `YYYY-MM-DD`, validées ici et non par l'appelant.
  dateFrom?: string;
  dateTo?: string;
  page: number;
};

export type SearchArticlesResult = {
  items: SearchResultArticle[];
  page: number;
  hasNextPage: boolean;
};

function estTypeContenuValide(value: string | undefined): value is TypeContenu {
  return value !== undefined && value in TYPE_CONTENU_LABELS;
}

function estTriValide(value: string | undefined): value is TriRechercheContenu {
  return value === "recent" || value === "long";
}

// Bornes de date de /recherche (Lot 2A) : `YYYY-MM-DD` est le seul format que produise
// `<input type="date">`, donc le seul accepté. Toute autre valeur est ignorée
// silencieusement (traitée comme absente), exactement comme typeContenu/sort ci-dessus —
// un paramètre d'URL invalide n'est jamais une erreur ni un 404.
//
// Bornes calculées en UTC, jamais dans le fuseau du serveur : une même URL doit produire
// le même résultat quelle que soit la machine qui rend la page.
//
// `fin` est portée à 23:59:59.999 alors que `debut` reste à minuit : le repository applique
// `date_publication <= dateTo` sur un timestamp, donc un `au=2026-01-15` laissé à minuit
// exclurait tous les contenus publiés *le* 15 janvier. C'est le seul piège de ce filtre.
function analyserJour(value: string | undefined): { debut: Date; fin: Date } | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }

  const [annee, mois, jour] = value.split("-").map(Number);
  const debut = new Date(Date.UTC(annee, mois - 1, jour));

  // Rejette une date bien formée mais inexistante (2026-02-30, 2026-13-01), que Date.UTC
  // reporterait silencieusement sur le mois suivant au lieu de la refuser.
  if (
    debut.getUTCFullYear() !== annee ||
    debut.getUTCMonth() !== mois - 1 ||
    debut.getUTCDate() !== jour
  ) {
    return undefined;
  }

  return { debut, fin: new Date(Date.UTC(annee, mois - 1, jour, 23, 59, 59, 999)) };
}

// Exposée pour app/(public)/recherche/page.tsx : la page doit savoir si une borne est
// valide sans dupliquer la règle de validation — pour ne réafficher dans le champ, et ne
// reporter sur les liens de pagination, qu'une valeur réellement prise en compte. Retourne
// la chaîne inchangée (jamais une date reformatée) : c'est la valeur qui doit repartir
// telle quelle dans l'URL et dans `<input type="date">`.
export function normaliserJourRecherche(value: string | undefined): string | undefined {
  return analyserJour(value) ? value : undefined;
}

// Lecture publique pour app/(public)/recherche/page.tsx : étend searchArticles avec les
// filtres catégorie/zone/type déjà supportés par ContenuEditorialRepository.search
// (categorieId, zoneId, typeContenu) et, REPO-6 (B22), le tri ("recent"/"long").
// Résolution slug → id via CategorieRepository.findBySlug / ZoneGeographiqueRepository.findBySlug :
// un slug fourni qui ne correspond à aucune catégorie/zone réelle produit un résultat vide
// (jamais un 404, jamais une erreur Prisma, jamais un filtre silencieusement ignoré),
// sans appeler search(). typeContenu/sort hors des valeurs attendues sont ignorés
// silencieusement (traités comme absents) — validation contre TYPE_CONTENU_LABELS, source
// unique déjà utilisée par le sélecteur de l'Éditeur et la page Recherche (jamais une
// seconde liste de types qui dérive en silence, cf. B5). `page` transmis tel quel : le
// repository clampe déjà toute valeur hors bornes à la dernière page existante et retourne
// la page réellement servie (Lot 1A, pagination) — la page appelante compare `page`
// demandé à `page` retourné pour détecter une page hors bornes (notFound). Le
// court-circuit "slug inconnu" ci-dessous retourne `page: params.page` (jamais `1` codé en
// dur) : un filtre catégorie/zone invalide doit toujours produire un résultat vide en
// HTTP 200, quelle que soit la page demandée — garantie préexistante à la pagination,
// jamais un 404 sur un simple slug invalide (corrigé après revue Lot 1A).
//
// Filtre par date (Lot 2A, US-023) : `dateFrom`/`dateTo` sont transmis à
// ContenuEditorialRepository.search, qui les supportait déjà (`ArticlesPubliesFiltre`,
// appliqué aussi bien côté Prisma que dans les conditions SQL de recherche plein-texte) —
// aucune modification de repository dans ce lot. Une plage inversée (`du` > `au`) est
// transmise telle quelle et produit un résultat vide : c'est la réponse honnête à ce qui a
// été demandé, jamais une réécriture silencieuse des bornes saisies.
export async function searchArticles(params: SearchArticlesParams): Promise<SearchArticlesResult> {
  const q = params.q?.trim() || undefined;
  const typeContenu = estTypeContenuValide(params.typeContenu) ? params.typeContenu : undefined;
  const sort = estTriValide(params.sort) ? params.sort : undefined;
  const du = analyserJour(params.dateFrom);
  const au = analyserJour(params.dateTo);

  const [categorie, zone] = await Promise.all([
    params.categorieSlug ? CategorieRepository.findBySlug(params.categorieSlug) : null,
    params.zoneSlug ? ZoneGeographiqueRepository.findBySlug(params.zoneSlug) : null,
  ]);

  if ((params.categorieSlug && !categorie) || (params.zoneSlug && !zone)) {
    return { items: [], page: params.page, hasNextPage: false };
  }

  const { items, page, hasNextPage } = await ContenuEditorialRepository.search({
    q,
    ...(categorie ? { categorieId: categorie.id } : {}),
    ...(zone ? { zoneId: zone.id } : {}),
    ...(typeContenu ? { typeContenu } : {}),
    ...(sort ? { sort } : {}),
    ...(du ? { dateFrom: du.debut } : {}),
    ...(au ? { dateTo: au.fin } : {}),
    page: params.page,
  });

  return {
    page,
    hasNextPage,
    items: items.map((item) => ({
      slug: item.slug,
      titre: item.titre!,
      imagePrincipaleUrl: item.imagePrincipaleUrl!,
      imageAltText: item.imageAltText!,
      categorieNom: item.categorie!.nom,
      zoneNom: item.zone!.nom,
      typeLabel: TYPE_CONTENU_LABELS[item.typeContenu!] ?? item.typeContenu!,
      auteur: item.auteur,
      datePublication: item.datePublication!,
      tempsLecture: estimerTempsLecture(item.corps),
      chapo: item.chapo,
    })),
  };
}
