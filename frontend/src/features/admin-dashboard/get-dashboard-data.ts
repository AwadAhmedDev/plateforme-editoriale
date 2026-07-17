import { StatutContenu } from "@prisma/client";
import { getCurrentSession } from "@/features/admin-auth/session";
import { ContenuEditorialRepository } from "@/lib/db/contenu-editorial-repository";
import { CategorieRepository } from "@/lib/db/categorie-repository";
import { ZoneGeographiqueRepository } from "@/lib/db/zone-geographique-repository";
import { InscritNewsletterRepository } from "@/lib/db/inscrit-newsletter-repository";

export type DashboardData = {
  totalContenus: number;
  totalCategories: number;
  totalZones: number;
  totalInscrits: number;
  brouillons: number;
  publies: number;
  archives: number;
};

// Fonction de lecture réservée à l'administrateur (server-actions-specification.md §2.1,
// « getDashboardData »). Défense en profondeur (security-specification.md §3) : revérifie
// elle-même la Session administrateur via getCurrentSession, indépendamment de la garde
// déjà appliquée en amont (proxy.ts + layout.tsx).
//
// Un inscrit désinscrit ne doit jamais être compté (domain-model.md, testing-specification.md
// §11) : seules les lignes `statut = 'inscrit'` entrent dans le total des inscrits newsletter.
export async function getDashboardData(): Promise<DashboardData> {
  const session = await getCurrentSession();
  if (!session.authenticated) {
    throw new Error("Accès refusé : aucune Session administrateur valide.");
  }

  const [totalContenus, totalCategories, totalZones, totalInscrits, brouillons, publies, archives] =
    await Promise.all([
      ContenuEditorialRepository.count(),
      CategorieRepository.count(),
      ZoneGeographiqueRepository.count(),
      InscritNewsletterRepository.countByStatut("inscrit"),
      ContenuEditorialRepository.countByStatut(StatutContenu.brouillon),
      ContenuEditorialRepository.countByStatut(StatutContenu.publie),
      ContenuEditorialRepository.countByStatut(StatutContenu.archive),
    ]);

  return { totalContenus, totalCategories, totalZones, totalInscrits, brouillons, publies, archives };
}
