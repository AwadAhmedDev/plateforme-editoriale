import { ZoneGeographiqueRepository } from "@/lib/db/zone-geographique-repository";

export type ZoneMenuItem = {
  nom: string;
  slug: string;
};

// Lecture publique pour footer-taxonomies.tsx (Lot L8e.2, contrat validé) :
// symétrique de list-categorie-menu.ts. Réutilise
// ZoneGeographiqueRepository.findAllWithArticleCount sans modification —
// déjà trié nom asc. Distinct de list-zone-slugs.ts (L8c, réservé à
// app/sitemap.ts, slug seul).
export async function listZoneMenu(): Promise<ZoneMenuItem[]> {
  const zones = await ZoneGeographiqueRepository.findAllWithArticleCount();

  return zones.map((zone) => ({ nom: zone.nom, slug: zone.slug }));
}
