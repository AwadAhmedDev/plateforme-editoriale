import { getCurrentSession } from "@/features/admin-auth/session";
import { InscritNewsletterRepository } from "@/lib/db/inscrit-newsletter-repository";

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
  const session = await getCurrentSession();
  if (!session.authenticated) {
    throw new Error("Accès refusé : aucune Session administrateur valide.");
  }

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
