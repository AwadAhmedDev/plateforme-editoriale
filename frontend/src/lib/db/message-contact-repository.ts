import type { MessageContact } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;

export type MessagesContactPagines = {
  items: MessageContact[];
  total: number;
  hasNextPage: boolean;
  page: number;
};

// Accès aux données de l'entité Message de contact (REPO-7, D6 : stockage en base +
// consultation admin, pas d'envoi e-mail sortant). Aucune règle métier, aucun contrôle
// d'autorisation ici — uniquement des opérations Prisma typées, sur le même patron que
// InscritNewsletterRepository.
export const MessageContactRepository = {
  create(data: { nom: string; email: string; objet: string; message: string }): Promise<MessageContact> {
    return prisma.messageContact.create({ data });
  },

  async findAllPagines(params: { page: number }): Promise<MessagesContactPagines> {
    const total = await prisma.messageContact.count();
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const page = Math.min(Math.max(1, params.page), totalPages);

    const items = await prisma.messageContact.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    });

    return { items, total, hasNextPage: page * PAGE_SIZE < total, page };
  },
};
