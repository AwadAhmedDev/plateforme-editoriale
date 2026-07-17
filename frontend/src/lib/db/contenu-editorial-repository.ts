import type { StatutContenu } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// Accès aux données de l'entité Contenu éditorial (technical-architecture.md §3.2).
// Aucune règle métier, aucun contrôle d'autorisation ici — uniquement des opérations
// Prisma typées.
export const ContenuEditorialRepository = {
  count(): Promise<number> {
    return prisma.contenuEditorial.count();
  },

  countByStatut(statut: StatutContenu): Promise<number> {
    return prisma.contenuEditorial.count({ where: { statut } });
  },

  // Vérification d'existence (pas un comptage complet) : suffisant pour le blocage de
  // suppression d'une Catégorie/Zone référencée (CATEGORIE_REFERENCEE), quel que soit
  // le statut du contenu associé.
  async existsByCategorieId(categorieId: string): Promise<boolean> {
    const match = await prisma.contenuEditorial.findFirst({
      where: { categorieId },
      select: { id: true },
    });
    return match !== null;
  },
};
