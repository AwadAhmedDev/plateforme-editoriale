import type { SessionAdministrateur, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// Accès aux données de l'entité Session administrateur (technical-architecture.md §3.2).
// Aucune règle métier, aucune authentification, aucun contrôle d'autorisation ici —
// uniquement des opérations Prisma typées. Le seuil d'expiration (DR-002) est un
// paramètre fourni par l'appelant, jamais décidé dans cette couche.
export const SessionRepository = {
  findByJetonHash(jetonHash: string): Promise<SessionAdministrateur | null> {
    return prisma.sessionAdministrateur.findUnique({ where: { jetonHash } });
  },

  create(
    data: Prisma.SessionAdministrateurUncheckedCreateInput
  ): Promise<SessionAdministrateur> {
    return prisma.sessionAdministrateur.create({ data });
  },

  deleteByJetonHash(jetonHash: string): Promise<SessionAdministrateur> {
    return prisma.sessionAdministrateur.delete({ where: { jetonHash } });
  },

  async deleteExpired(olderThan: Date): Promise<number> {
    const result = await prisma.sessionAdministrateur.deleteMany({
      where: { derniereActiviteAt: { lt: olderThan } },
    });
    return result.count;
  },

  findByAdministrateurId(administrateurId: string): Promise<SessionAdministrateur[]> {
    return prisma.sessionAdministrateur.findMany({ where: { administrateurId } });
  },

  updateDerniereActivite(jetonHash: string, at: Date): Promise<SessionAdministrateur> {
    return prisma.sessionAdministrateur.update({
      where: { jetonHash },
      data: { derniereActiviteAt: at },
    });
  },
};
