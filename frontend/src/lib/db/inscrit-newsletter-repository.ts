import type { InscritNewsletter, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;

export type InscritsPagines = {
  items: InscritNewsletter[];
  total: number;
  hasNextPage: boolean;
  page: number;
};

// Accès aux données de l'entité Inscrit Newsletter (technical-architecture.md §3.2).
// Aucune règle métier, aucun contrôle d'autorisation ici — uniquement des opérations
// Prisma typées. `statut` reste une colonne TEXT (pas un ENUM Postgres natif, cf.
// schema.prisma), donc un String Prisma plutôt qu'un type énuméré.
export const InscritNewsletterRepository = {
  countByStatut(statut: string): Promise<number> {
    return prisma.inscritNewsletter.count({ where: { statut } });
  },

  findByEmail(email: string): Promise<InscritNewsletter | null> {
    return prisma.inscritNewsletter.findUnique({ where: { email } });
  },

  findByJetonDesinscription(jetonDesinscription: string): Promise<InscritNewsletter | null> {
    return prisma.inscritNewsletter.findUnique({ where: { jetonDesinscription } });
  },

  findById(id: string): Promise<InscritNewsletter | null> {
    return prisma.inscritNewsletter.findUnique({ where: { id } });
  },

  create(data: { email: string; jetonDesinscription: string }): Promise<InscritNewsletter> {
    return prisma.inscritNewsletter.create({ data });
  },

  // Réactivation d'une adresse désinscrite qui se réinscrit (server-actions-specification.md
  // §7) : réutilise la ligne existante — jamais une nouvelle ligne (UNIQUE(email)). L'ancien
  // jeton, rattaché à une désinscription déjà consommée, n'est jamais réactivé.
  // `updateMany` avec `statut: "desinscrit"` dans le `where` (plutôt qu'un `update` par seul
  // `id`) : si deux réactivations concurrentes de la même adresse s'exécutent, seule la
  // première trouve la ligne encore au statut `desinscrit` et l'écrit ; la seconde ne trouve
  // plus aucune ligne correspondante (count 0) et n'écrase pas le jeton déjà posé — évite la
  // perte silencieuse d'un des deux jetons générés (dernier écrivain gagnant arbitrairement).
  reactivate(id: string, jetonDesinscription: string): Promise<Prisma.BatchPayload> {
    return prisma.inscritNewsletter.updateMany({
      where: { id, statut: "desinscrit" },
      data: {
        statut: "inscrit",
        desinscritAt: null,
        dateInscription: new Date(),
        jetonDesinscription,
      },
    });
  },

  // Même effet pour la désinscription par jeton (US-020) et le retrait manuel administrateur
  // (US-021) — un seul point d'écriture pour les deux mécanismes. `jetonDesinscription: null`
  // invalide le jeton consommé : il ne doit jamais rester stocké après usage.
  updateStatutDesinscrit(id: string): Promise<InscritNewsletter> {
    return prisma.inscritNewsletter.update({
      where: { id },
      data: { statut: "desinscrit", desinscritAt: new Date(), jetonDesinscription: null },
    });
  },

  async findAllInscritsPagines(params: { page: number; email?: string }): Promise<InscritsPagines> {
    const where: Prisma.InscritNewsletterWhereInput = {
      statut: "inscrit",
      ...(params.email ? { email: { contains: params.email, mode: "insensitive" } } : {}),
    };

    const total = await prisma.inscritNewsletter.count({ where });
    // Borne supérieure de pagination : une page demandée au-delà du nombre de pages
    // réelles est ramenée à la dernière page existante — évite l'état incohérent
    // « total > 0 » affiché en même temps que « aucun inscrit » (page fantôme).
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const page = Math.min(Math.max(1, params.page), totalPages);

    const items = await prisma.inscritNewsletter.findMany({
      where,
      orderBy: { dateInscription: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    });

    return { items, total, hasNextPage: page * PAGE_SIZE < total, page };
  },
};
