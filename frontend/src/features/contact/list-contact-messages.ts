import { MessageContactRepository } from "@/lib/db/message-contact-repository";
import { ensureAdministrateurAuthentifie } from "@/lib/auth/require-admin-session";

export type ContactMessageListItem = {
  id: string;
  nom: string;
  email: string;
  objet: string;
  message: string;
  createdAt: Date;
};

export type ContactMessageListResult = {
  items: ContactMessageListItem[];
  total: number;
  hasNextPage: boolean;
  page: number;
};

// Fonction de lecture réservée à l'administrateur (REPO-7, D6 : consultation admin des
// messages de contact) — même patron que list-subscribers.ts. Défense en profondeur :
// revérifie elle-même la Session administrateur, indépendamment de la garde déjà
// appliquée en amont (proxy.ts + layout.tsx).
export async function listContactMessages(params: { page: number }): Promise<ContactMessageListResult> {
  await ensureAdministrateurAuthentifie();

  const { items, total, hasNextPage, page } = await MessageContactRepository.findAllPagines(params);

  return {
    items: items.map((item) => ({
      id: item.id,
      nom: item.nom,
      email: item.email,
      objet: item.objet,
      message: item.message,
      createdAt: item.createdAt,
    })),
    total,
    hasNextPage,
    page,
  };
}
