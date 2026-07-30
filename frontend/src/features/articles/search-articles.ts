import { CategorieRepository } from "@/lib/db/categorie-repository";
import { ZoneGeographiqueRepository } from "@/lib/db/zone-geographique-repository";
import { ContenuEditorialRepository, type TriRechercheContenu } from "@/lib/db/contenu-editorial-repository";
import { TYPE_CONTENU_LABELS, estTypeContenuValide } from "@/features/articles/type-contenu-labels";
import { estimerTempsLecture } from "@/features/articles/reading-time";
import { analyserJour } from "@/lib/filtres-publics";

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

function estTriValide(value: string | undefined): value is TriRechercheContenu {
  return value === "recent" || value === "long";
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
// court-circuit "slug inconnu" ci-dessous retourne `page: 1` : un ensemble vide n'a qu'une
// page. La garantie « jamais de 404 sur un simple slug invalide » est préservée —
// `?zone=inexistante` répond toujours 200 avec un résultat vide — mais
// `?zone=inexistante&page=999` renvoie désormais 404 comme n'importe quelle autre page hors
// bornes. Retourner la page demandée faisait passer la garde hors-bornes de l'appelant et
// rendait un lien « Précédent » vers la page 998, elle-même vers 997 : une échelle
// descendante infinie de réponses 200 vides, suivie par les crawlers.
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
    return { items: [], page: 1, hasNextPage: false };
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
