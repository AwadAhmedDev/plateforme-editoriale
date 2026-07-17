import type { Categorie } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type CategorieAvecNombreArticles = Categorie & { _count: { contenus: number } };

// Accès aux données de l'entité Catégorie (technical-architecture.md §3.2).
// Aucune règle métier, aucun contrôle d'autorisation ici — uniquement des opérations
// Prisma typées.
export const CategorieRepository = {
  count(): Promise<number> {
    return prisma.categorie.count();
  },

  findAllWithArticleCount(): Promise<CategorieAvecNombreArticles[]> {
    return prisma.categorie.findMany({
      orderBy: { nom: "asc" },
      include: { _count: { select: { contenus: true } } },
    });
  },

  findById(id: string): Promise<Categorie | null> {
    return prisma.categorie.findUnique({ where: { id } });
  },

  findByNom(nom: string): Promise<Categorie | null> {
    return prisma.categorie.findUnique({ where: { nom } });
  },

  findBySlug(slug: string): Promise<Categorie | null> {
    return prisma.categorie.findUnique({ where: { slug } });
  },

  create(data: { nom: string; slug: string; descriptionCourte: string | null }): Promise<Categorie> {
    return prisma.categorie.create({ data });
  },

  update(
    id: string,
    data: { nom: string; slug: string; descriptionCourte: string | null }
  ): Promise<Categorie> {
    return prisma.categorie.update({ where: { id }, data });
  },

  delete(id: string): Promise<Categorie> {
    return prisma.categorie.delete({ where: { id } });
  },
};
