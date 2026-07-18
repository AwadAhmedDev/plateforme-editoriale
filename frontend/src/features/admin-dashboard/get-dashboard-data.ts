import { StatutContenu } from "@prisma/client";
import { getCurrentSession } from "@/features/admin-auth/session";
import { ContenuEditorialRepository, type ArticleRecentlyModified } from "@/lib/db/contenu-editorial-repository";
import { CategorieRepository } from "@/lib/db/categorie-repository";
import { ZoneGeographiqueRepository } from "@/lib/db/zone-geographique-repository";
import { InscritNewsletterRepository } from "@/lib/db/inscrit-newsletter-repository";

// Nombre de lignes de la table « Derniers articles modifiés » (ui-specification.md
// §Dashboard Administrateur : « 5 lignes maximum affichées »). Exportée pour que
// app/admin/(protected)/page.tsx puisse décider, sans nouvelle requête, si le lien
// « Voir tous les articles » doit apparaître (« si plus de contenu existe », comparé à
// `totalContenus`, déjà calculé ci-dessous).
export const RECENT_ARTICLES_LIMIT = 5;

export type DashboardData = {
  totalContenus: number;
  totalCategories: number;
  totalZones: number;
  totalInscrits: number;
  brouillons: number;
  publies: number;
  archives: number;
  recentArticles: ArticleRecentlyModified[];
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

  const [totalContenus, totalCategories, totalZones, totalInscrits, brouillons, publies, archives, recentArticles] =
    await Promise.all([
      ContenuEditorialRepository.count(),
      CategorieRepository.count(),
      ZoneGeographiqueRepository.count(),
      InscritNewsletterRepository.countByStatut("inscrit"),
      ContenuEditorialRepository.countByStatut(StatutContenu.brouillon),
      ContenuEditorialRepository.countByStatut(StatutContenu.publie),
      ContenuEditorialRepository.countByStatut(StatutContenu.archive),
      // Réutilise findRecentlyModified telle quelle (contenu-editorial-repository.ts) —
      // déjà construite pour ce besoin exact (tri par dateDerniereModification, categorie.nom
      // seul inclus) mais jusqu'ici sans appelant. Aucun nouveau Repository, aucune nouvelle
      // requête Prisma, aucune nouvelle méthode de service : simple ajout à cette même
      // fonction de lecture déjà existante.
      ContenuEditorialRepository.findRecentlyModified(RECENT_ARTICLES_LIMIT),
    ]);

  return { totalContenus, totalCategories, totalZones, totalInscrits, brouillons, publies, archives, recentArticles };
}
