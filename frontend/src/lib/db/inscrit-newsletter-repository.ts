import { prisma } from "@/lib/prisma";

// Accès aux données de l'entité Inscrit Newsletter (technical-architecture.md §3.2).
// Aucune règle métier, aucun contrôle d'autorisation ici — uniquement des opérations
// Prisma typées. `statut` reste une colonne TEXT (pas un ENUM Postgres natif, cf.
// schema.prisma), donc un String Prisma plutôt qu'un type énuméré.
export const InscritNewsletterRepository = {
  countByStatut(statut: string): Promise<number> {
    return prisma.inscritNewsletter.count({ where: { statut } });
  },
};
