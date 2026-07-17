import { prisma } from "@/lib/prisma";

// Accès aux données de l'entité Zone géographique (technical-architecture.md §3.2).
// Aucune règle métier, aucun contrôle d'autorisation ici — uniquement des opérations
// Prisma typées.
export const ZoneGeographiqueRepository = {
  count(): Promise<number> {
    return prisma.zoneGeographique.count();
  },
};
