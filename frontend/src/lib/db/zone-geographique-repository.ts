import type { ZoneGeographique } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ORDRE_PAYS } from "@/lib/ordre-taxonomies";

export type ZoneGeographiqueAvecNombreArticles = ZoneGeographique & { _count: { contenus: number } };

// Accès aux données de l'entité Zone géographique (technical-architecture.md §3.2).
// Aucune règle métier, aucun contrôle d'autorisation ici — uniquement des opérations
// Prisma typées.
export const ZoneGeographiqueRepository = {
  count(): Promise<number> {
    return prisma.zoneGeographique.count();
  },

  findAllWithArticleCount(): Promise<ZoneGeographiqueAvecNombreArticles[]> {
    return prisma.zoneGeographique
      .findMany({ include: { _count: { select: { contenus: true } } } })
      .then((zones) =>
        zones.sort((a, b) => {
          const rangA = ORDRE_PAYS.indexOf(a.slug);
          const rangB = ORDRE_PAYS.indexOf(b.slug);
          if (rangA === -1 && rangB === -1) return a.nom.localeCompare(b.nom);
          if (rangA === -1) return 1;
          if (rangB === -1) return -1;
          return rangA - rangB;
        })
      );
  },

  findById(id: string): Promise<ZoneGeographique | null> {
    return prisma.zoneGeographique.findUnique({ where: { id } });
  },

  findByNom(nom: string): Promise<ZoneGeographique | null> {
    return prisma.zoneGeographique.findUnique({ where: { nom } });
  },

  findBySlug(slug: string): Promise<ZoneGeographique | null> {
    return prisma.zoneGeographique.findUnique({ where: { slug } });
  },

  create(data: { nom: string; slug: string; descriptionCourte: string | null }): Promise<ZoneGeographique> {
    return prisma.zoneGeographique.create({ data });
  },

  update(
    id: string,
    data: { nom: string; slug: string; descriptionCourte: string | null }
  ): Promise<ZoneGeographique> {
    return prisma.zoneGeographique.update({ where: { id }, data });
  },

  delete(id: string): Promise<ZoneGeographique> {
    return prisma.zoneGeographique.delete({ where: { id } });
  },
};
