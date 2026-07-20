import { ContenuEditorialRepository } from "@/lib/db/contenu-editorial-repository";

export type HomeArticle = {
  slug: string;
  titre: string;
  imagePrincipaleUrl: string;
  imageAltText: string;
  categorieNom: string;
  categorieSlug: string;
  zoneNom: string;
  zoneSlug: string;
  datePublication: Date;
};

const HOME_ARTICLES_LIMIT = 6;

// Lecture publique pour app/(public)/page.tsx (Lot L8b, contrat validé) :
// réutilise ContenuEditorialRepository.findLatestPublished sans modification
// ni validation supplémentaire — statut 'publie' (non contournable, porté
// par le repository) combiné à la contrainte DB chk_publie_champs_requis
// (migration 20260716202832_init_schema) garantit déjà que tout article
// retourné a titre/catégorie/zone/image_principale_url/image_alt_text/
// date_publication non nuls ; onDelete: Restrict sur categorie/zone exclut
// toute relation orpheline. Simple projection 1:1 vers HomeArticle, jamais
// une nouvelle règle métier.
export async function getHomeArticles(): Promise<HomeArticle[]> {
  const items = await ContenuEditorialRepository.findLatestPublished(HOME_ARTICLES_LIMIT);

  return items.map((item) => ({
    slug: item.slug,
    titre: item.titre!,
    imagePrincipaleUrl: item.imagePrincipaleUrl!,
    imageAltText: item.imageAltText!,
    categorieNom: item.categorie!.nom,
    categorieSlug: item.categorie!.slug,
    zoneNom: item.zone!.nom,
    zoneSlug: item.zone!.slug,
    datePublication: item.datePublication!,
  }));
}
