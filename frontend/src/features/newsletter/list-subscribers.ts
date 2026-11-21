import { InscritNewsletterRepository } from "@/lib/db/inscrit-newsletter-repository";
import { ensureAdministrateurAuthentifie, estCompteDemo } from "@/lib/auth/require-admin-session";
import { DEMO_MASQUE } from "@/lib/demo";

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
  // compte de démonstration public : ni adresse affichée, ni recherche par adresse
  const demo = await estCompteDemo();
  if (demo) params = { page: params.page };

  const { items, total, hasNextPage, page } = await InscritNewsletterRepository.findAllInscritsPagines(params);

  return {
    items: items.map((inscrit) => ({
      id: inscrit.id,
      email: demo ? DEMO_MASQUE : inscrit.email,
      dateInscription: inscrit.dateInscription,
    })),
    total,
    hasNextPage,
    page,
  };
}
