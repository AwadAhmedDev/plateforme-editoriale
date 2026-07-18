import { getCurrentSession } from "@/features/admin-auth/session";
import { ContenuEditorialRepository, type ArticleForEdit } from "@/lib/db/contenu-editorial-repository";

// Fonction de lecture réservée à l'administrateur, sur le modèle de listCategories/
// listZones (features/taxonomies) : revérifie elle-même la Session administrateur,
// indépendamment de la garde déjà appliquée en amont (proxy.ts + layout.tsx). Le
// Repository (findById) n'applique lui-même aucune règle d'autorisation.
export async function getArticleForEdit(id: string): Promise<ArticleForEdit | null> {
  const session = await getCurrentSession();
  if (!session.authenticated) {
    throw new Error("Accès refusé : aucune Session administrateur valide.");
  }

  return ContenuEditorialRepository.findById(id);
}
