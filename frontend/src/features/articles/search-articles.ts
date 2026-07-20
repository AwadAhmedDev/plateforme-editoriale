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

// Lecture publique pour app/(public)/recherche/page.tsx (Lot L9, contrat
// validé) : réutilise ContenuEditorialRepository.search sans filtre
// supplémentaire (categorieId/zoneId/typeContenu/dateFrom/dateTo omis),
// page 1 uniquement — aucune pagination dans ce lot. Complétude des champs
// (hors chapo) déjà garantie par chk_publie_champs_requis pour tout article
// statut='publie' : simple projection, jamais une revalidation métier.
// chapo n'est pas couvert par cette contrainte — conservé nullable, jamais
// asserté, affichage conditionnel délégué à ArticleSearchResultCard.
// Projection volontairement réduite à ce que le gabarit affiche réellement
// (pas de categorieSlug/zoneSlug : aucun lien taxonomie dans ce composant).
export async function searchArticles(q: string): Promise<SearchResultArticle[]> {
  const { items } = await ContenuEditorialRepository.search({ q, page: 1 });

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
