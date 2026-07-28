import { cache } from "react";
import { ZoneGeographiqueRepository } from "@/lib/db/zone-geographique-repository";
import { ContenuEditorialRepository } from "@/lib/db/contenu-editorial-repository";
import { estimerTempsLecture } from "@/features/articles/reading-time";

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
  articles: ZonePageArticle[];
};

// Lecture publique pour app/(public)/zone/[slug]/page.tsx : symétrique de
// get-categorie-page.ts. ZoneGeographiqueRepository.findBySlug puis
// ContenuEditorialRepository.findManyPublished({ zoneId }), tous deux existants et non
// modifiés. Page 1 uniquement (24 articles, déjà triés datePublication desc) — aucune
// pagination dans ce lot. Champs `chapo`/`auteur` déjà retournés par la requête Prisma
// sous-jacente : simple projection supplémentaire (clôture RC-1,
// alignement sur la carte de listing du design). `count` = total réel, pas
// `items.length`. Mémoïsée (React.cache) : generateMetadata et la page appellent toutes
// deux cette fonction, un seul accès base de données réel par requête.
export const getZonePage = cache(async (slug: string): Promise<ZonePageData | null> => {
  const zone = await ZoneGeographiqueRepository.findBySlug(slug);

  if (!zone) {
    return null;
  }

  const { items, total } = await ContenuEditorialRepository.findManyPublished({
    zoneId: zone.id,
    page: 1,
  });

  return {
    nom: zone.nom,
    slug: zone.slug,
    descriptionCourte: zone.descriptionCourte,
    count: total,
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
