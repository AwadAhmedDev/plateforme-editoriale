import type { Categorie } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ORDRE_RUBRIQUES } from "@/lib/ordre-taxonomies";

export type CategorieAvecNombreArticles = Categorie & { _count: { contenus: number } };

// Accès aux données de l'entité Catégorie (technical-architecture.md §3.2).
// Aucune règle métier, aucun contrôle d'autorisation ici — uniquement des opérations
// Prisma typées.
export const CategorieRepository = {
  count(): Promise<number> {
    return prisma.categorie.count();
  },

  findAllWithArticleCount(): Promise<CategorieAvecNombreArticles[]> {
    return prisma.categorie
      .findMany({ include: { _count: { select: { contenus: true } } } })
      .then((categories) =>
        categories.sort((a, b) => {
          const rangA = ORDRE_RUBRIQUES.indexOf(a.slug);
          const rangB = ORDRE_RUBRIQUES.indexOf(b.slug);
          if (rangA === -1 && rangB === -1) return a.nom.localeCompare(b.nom);
          if (rangA === -1) return 1;
          if (rangB === -1) return -1;
          return rangA - rangB;
        })
      );
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
