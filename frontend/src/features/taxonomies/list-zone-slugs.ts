import { ZoneGeographiqueRepository } from "@/lib/db/zone-geographique-repository";

export type ZoneSlug = {
  slug: string;
};

// Lecture publique pour app/sitemap.ts (Lot L8c, contrat validé) : symétrique
// de list-categorie-slugs.ts. Réutilise
// ZoneGeographiqueRepository.findAllWithArticleCount sans modification —
// non gardée par session au niveau du repository. Toutes les zones sont
// incluses, publiées ou non encore dotées d'article, pour les mêmes raisons.
export async function listZoneSlugs(): Promise<ZoneSlug[]> {
  const zones = await ZoneGeographiqueRepository.findAllWithArticleCount();

  return zones.map((zone) => ({ slug: zone.slug }));
}
