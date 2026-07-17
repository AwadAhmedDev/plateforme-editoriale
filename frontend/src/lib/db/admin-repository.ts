import type { Administrateur, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// Accès aux données de l'entité Compte Administrateur (technical-architecture.md §3.2).
// Aucune règle métier, aucune authentification, aucun contrôle d'autorisation ici —
// uniquement des opérations Prisma typées.
export const AdminRepository = {
  findById(id: string): Promise<Administrateur | null> {
    return prisma.administrateur.findUnique({ where: { id } });
  },

  findByIdentifiant(identifiant: string): Promise<Administrateur | null> {
    return prisma.administrateur.findUnique({ where: { identifiant } });
  },

  count(): Promise<number> {
    return prisma.administrateur.count();
  },

  create(data: Prisma.AdministrateurCreateInput): Promise<Administrateur> {
    return prisma.administrateur.create({ data });
  },
};
