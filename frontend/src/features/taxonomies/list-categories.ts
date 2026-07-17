import { getCurrentSession } from "@/features/admin-auth/session";
import { CategorieRepository } from "@/lib/db/categorie-repository";

export type CategoryListItem = {
  id: string;
  nom: string;
  slug: string;
  descriptionCourte: string | null;
  articleCount: number;
};

// Fonction de lecture réservée à l'administrateur (server-actions-specification.md §4.1,
// « listCategories »). Défense en profondeur (security-specification.md §3) : revérifie
// elle-même la Session administrateur, indépendamment de la garde déjà appliquée en amont
// (proxy.ts + layout.tsx).
export async function listCategories(): Promise<CategoryListItem[]> {
  const session = await getCurrentSession();
  if (!session.authenticated) {
    throw new Error("Accès refusé : aucune Session administrateur valide.");
  }

  const categories = await CategorieRepository.findAllWithArticleCount();

  return categories.map((categorie) => ({
    id: categorie.id,
    nom: categorie.nom,
    slug: categorie.slug,
    descriptionCourte: categorie.descriptionCourte,
    articleCount: categorie._count.contenus,
  }));
}
