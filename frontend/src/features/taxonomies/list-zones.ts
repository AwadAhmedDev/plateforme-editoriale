import { getCurrentSession } from "@/features/admin-auth/session";
import { ZoneGeographiqueRepository } from "@/lib/db/zone-geographique-repository";

export type ZoneListItem = {
  id: string;
  nom: string;
  slug: string;
  descriptionCourte: string | null;
  articleCount: number;
};

// Fonction de lecture réservée à l'administrateur (server-actions-specification.md §5,
// « listZones »). Défense en profondeur (security-specification.md §3) : revérifie
// elle-même la Session administrateur, indépendamment de la garde déjà appliquée en amont
// (proxy.ts + layout.tsx).
export async function listZones(): Promise<ZoneListItem[]> {
  const session = await getCurrentSession();
  if (!session.authenticated) {
    throw new Error("Accès refusé : aucune Session administrateur valide.");
  }

  const zones = await ZoneGeographiqueRepository.findAllWithArticleCount();

  return zones.map((zone) => ({
    id: zone.id,
    nom: zone.nom,
    slug: zone.slug,
    descriptionCourte: zone.descriptionCourte,
    articleCount: zone._count.contenus,
  }));
}
