import { InscritNewsletterRepository } from "@/lib/db/inscrit-newsletter-repository";
import { ensureAdministrateurAuthentifie } from "@/lib/auth/require-admin-session";

export type SubscriberListItem = {
  id: string;
  email: string;
  dateInscription: Date;
};

export type SubscriberListResult = {
  items: SubscriberListItem[];
  total: number;
  hasNextPage: boolean;
  page: number;
};

// Fonction de lecture réservée à l'administrateur (server-actions-specification.md §8.1,
// « listSubscribers »). Défense en profondeur (security-specification.md §3) : revérifie
// elle-même la Session administrateur, indépendamment de la garde déjà appliquée en amont
// (proxy.ts + layout.tsx). Pagination 20 lignes obligatoire (api-contracts.md §1.6, §4.4 ;
// ui-specification.md §Tables Administrateur).
export async function listSubscribers(params: { page: number; email?: string }): Promise<SubscriberListResult> {
  await ensureAdministrateurAuthentifie();

  const { items, total, hasNextPage, page } = await InscritNewsletterRepository.findAllInscritsPagines(params);

  return {
    items: items.map((inscrit) => ({
      id: inscrit.id,
      email: inscrit.email,
      dateInscription: inscrit.dateInscription,
    })),
    total,
    hasNextPage,
    page,
  };
}
