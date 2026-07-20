import { ContenuEditorialRepository } from "@/lib/db/contenu-editorial-repository";

export type ArticlesListArticle = {
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

// Lecture publique pour app/(public)/articles/page.tsx (Lot L8d, contrat
// validé) : réutilise ContenuEditorialRepository.findManyPublished sans
// filtre (statut 'publie' et tri par date de publication décroissante déjà
// portés par le repository), page 1 uniquement — aucune pagination dans ce
// lot. Complétude des champs déjà garantie par chk_publie_champs_requis
// pour tout article statut='publie' : simple projection 1:1, jamais une
// revalidation métier (même discipline que get-home-articles.ts, corrigé
// en L8b).
export async function getArticlesList(): Promise<ArticlesListArticle[]> {
  const { items } = await ContenuEditorialRepository.findManyPublished({ page: 1 });

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
