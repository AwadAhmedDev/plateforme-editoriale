import { cache } from "react";
import { CategorieRepository } from "@/lib/db/categorie-repository";
import { ContenuEditorialRepository } from "@/lib/db/contenu-editorial-repository";

export type CategoriePageArticle = {
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

export type CategoriePageData = {
  nom: string;
  slug: string;
  descriptionCourte: string | null;
  articles: CategoriePageArticle[];
};

// Lecture publique pour app/(public)/categorie/[slug]/page.tsx (Lot L8c,
// contrat validé) : CategorieRepository.findBySlug puis
// ContenuEditorialRepository.findManyPublished({ categorieId }), tous deux
// existants et non modifiés. Page 1 uniquement (12 articles, déjà triés
// datePublication desc par le repository) — aucune pagination dans ce lot.
// Complétude des champs déjà garantie par chk_publie_champs_requis pour tout
// article statut='publie' (même raisonnement que get-home-articles.ts,
// corrigé en L8b : simple projection, jamais une revalidation métier).
// Mémoïsée (React.cache) : generateMetadata et la page appellent toutes deux
// cette fonction, un seul accès base de données réel par requête.
export const getCategoriePage = cache(async (slug: string): Promise<CategoriePageData | null> => {
  const categorie = await CategorieRepository.findBySlug(slug);

  if (!categorie) {
    return null;
  }

  const { items } = await ContenuEditorialRepository.findManyPublished({
    categorieId: categorie.id,
    page: 1,
  });

  return {
    nom: categorie.nom,
    slug: categorie.slug,
    descriptionCourte: categorie.descriptionCourte,
    articles: items.map((item) => ({
      slug: item.slug,
      titre: item.titre!,
      imagePrincipaleUrl: item.imagePrincipaleUrl!,
      imageAltText: item.imageAltText!,
      categorieNom: item.categorie!.nom,
      categorieSlug: item.categorie!.slug,
      zoneNom: item.zone!.nom,
      zoneSlug: item.zone!.slug,
      datePublication: item.datePublication!,
    })),
  };
});
