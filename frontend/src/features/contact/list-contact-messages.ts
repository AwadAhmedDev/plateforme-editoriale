import { MessageContactRepository } from "@/lib/db/message-contact-repository";
import { ensureAdministrateurAuthentifie, estCompteDemo } from "@/lib/auth/require-admin-session";
import { DEMO_MASQUE } from "@/lib/demo";

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
  // compte de démonstration public : aucune donnée des visiteurs affichée
  const demo = await estCompteDemo();

  const { items, total, hasNextPage, page } = await MessageContactRepository.findAllPagines(params);

  return {
    items: items.map((item) => ({
      id: item.id,
      nom: demo ? DEMO_MASQUE : item.nom,
      email: demo ? DEMO_MASQUE : item.email,
      objet: demo ? DEMO_MASQUE : item.objet,
      message: demo ? "Contenu masqué pour le compte de démonstration." : item.message,
      createdAt: item.createdAt,
    })),
    total,
    hasNextPage,
    page,
  };
}
