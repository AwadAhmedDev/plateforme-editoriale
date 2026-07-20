import { cache } from "react";
import { ZoneGeographiqueRepository } from "@/lib/db/zone-geographique-repository";
import { ContenuEditorialRepository } from "@/lib/db/contenu-editorial-repository";

export type ZonePageArticle = {
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

export type ZonePageData = {
  nom: string;
  slug: string;
  descriptionCourte: string | null;
  articles: ZonePageArticle[];
};

// Lecture publique pour app/(public)/zone/[slug]/page.tsx (Lot L8c, contrat
// validé) : symétrique de get-categorie-page.ts. ZoneGeographiqueRepository
// .findBySlug puis ContenuEditorialRepository.findManyPublished({ zoneId }),
// tous deux existants et non modifiés. Page 1 uniquement (12 articles, déjà
// triés datePublication desc) — aucune pagination dans ce lot. Complétude
// des champs déjà garantie par chk_publie_champs_requis pour tout article
// statut='publie' — simple projection, jamais une revalidation métier.
// Mémoïsée (React.cache) : generateMetadata et la page appellent toutes
// deux cette fonction, un seul accès base de données réel par requête.
export const getZonePage = cache(async (slug: string): Promise<ZonePageData | null> => {
  const zone = await ZoneGeographiqueRepository.findBySlug(slug);

  if (!zone) {
    return null;
  }

  const { items } = await ContenuEditorialRepository.findManyPublished({
    zoneId: zone.id,
    page: 1,
  });

  return {
    nom: zone.nom,
    slug: zone.slug,
    descriptionCourte: zone.descriptionCourte,
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
