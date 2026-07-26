import { cache } from "react";
import { ZoneGeographiqueRepository } from "@/lib/db/zone-geographique-repository";

export type ZoneArticleCount = {
  nom: string;
  slug: string;
  count: number;
};

// Section "Explorer par pays" de l'Accueil (REPO-4 : Corne de l'Afrique.dc.html
// l.167-178) : tous les pays existants, publiés ou non dotés d'article — même convention
// que list-zone-menu.ts (une taxonomie existante reste explorable même à 0 publication) —
// avec leur nombre de contenus Publiés (ZoneGeographiqueRepository.findAllWithPublishedArticleCount,
// distincte de findAllWithArticleCount utilisée par les menus, qui compte tous statuts).
export const listZoneArticleCounts = cache(async (): Promise<ZoneArticleCount[]> => {
  const zones = await ZoneGeographiqueRepository.findAllWithPublishedArticleCount();

  return zones.map((zone) => ({ nom: zone.nom, slug: zone.slug, count: zone._count.contenus }));
});
