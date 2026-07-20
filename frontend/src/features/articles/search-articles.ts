import type { TypeContenu } from "@prisma/client";
import { CategorieRepository } from "@/lib/db/categorie-repository";
import { ZoneGeographiqueRepository } from "@/lib/db/zone-geographique-repository";
import { ContenuEditorialRepository } from "@/lib/db/contenu-editorial-repository";

export type SearchResultArticle = {
  slug: string;
  titre: string;
  imagePrincipaleUrl: string;
  imageAltText: string;
  categorieNom: string;
  zoneNom: string;
  datePublication: Date;
  chapo: string | null;
};

export type SearchArticlesParams = {
  q?: string;
  categorieSlug?: string;
  zoneSlug?: string;
  typeContenu?: string;
};

const TYPES_CONTENU_VALIDES: readonly string[] = [
  "article",
  "analyse",
  "enquete",
  "interview",
  "dossier_thematique",
];

function estTypeContenuValide(value: string | undefined): value is TypeContenu {
  return value !== undefined && TYPES_CONTENU_VALIDES.includes(value);
}

// Lecture publique pour app/(public)/recherche/page.tsx (Lot L11, contrat
// validé) : étend searchArticles (L9) avec les filtres catégorie/zone/type
// déjà supportés par ContenuEditorialRepository.search (categorieId, zoneId,
// typeContenu), jamais exposés jusqu'ici — aucun changement Repository.
// Résolution slug → id via CategorieRepository.findBySlug /
// ZoneGeographiqueRepository.findBySlug (existants, non modifiés) : un slug
// fourni qui ne correspond à aucune catégorie/zone réelle produit un
// résultat vide (jamais un 404, jamais une erreur Prisma, jamais un filtre
// silencieusement ignoré — décision L11 validée), sans appeler search().
// typeContenu hors de l'enum est ignoré silencieusement (traité comme
// absent), jamais transmis tel quel à Prisma. Aucune date dans ce lot
// (décision L11 validée).
export async function searchArticles(params: SearchArticlesParams): Promise<SearchResultArticle[]> {
  const q = params.q?.trim() || undefined;
  const typeContenu = estTypeContenuValide(params.typeContenu) ? params.typeContenu : undefined;

  const [categorie, zone] = await Promise.all([
    params.categorieSlug ? CategorieRepository.findBySlug(params.categorieSlug) : null,
    params.zoneSlug ? ZoneGeographiqueRepository.findBySlug(params.zoneSlug) : null,
  ]);

  if ((params.categorieSlug && !categorie) || (params.zoneSlug && !zone)) {
    return [];
  }

  const { items } = await ContenuEditorialRepository.search({
    q,
    ...(categorie ? { categorieId: categorie.id } : {}),
    ...(zone ? { zoneId: zone.id } : {}),
    ...(typeContenu ? { typeContenu } : {}),
    page: 1,
  });

  return items.map((item) => ({
    slug: item.slug,
    titre: item.titre!,
    imagePrincipaleUrl: item.imagePrincipaleUrl!,
    imageAltText: item.imageAltText!,
    categorieNom: item.categorie!.nom,
    zoneNom: item.zone!.nom,
    datePublication: item.datePublication!,
    chapo: item.chapo,
  }));
}
