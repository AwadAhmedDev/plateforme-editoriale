"use server";

import { redirect } from "next/navigation";
import { createArticle, type ArticleActionState } from "@/features/articles/article-actions";

// Pont entre le formulaire Création et `createArticle` (article-actions.ts, Lot 5, non
// modifié) : aucune règle métier ici, uniquement la redirection vers l'Éditeur en cas de
// succès (server-actions-specification.md §3.1 : « redirection vers l'Éditeur »). Même
// pattern que loginFormAction (admin-auth/login-form-action.ts) — un fichier séparé qui
// enveloppe une Server Action existante pour y ajouter un redirect().
export async function createArticleAction(
  previousState: ArticleActionState,
  formData: FormData
): Promise<ArticleActionState> {
  const resultat = await createArticle(previousState, formData);

  if (resultat.status === "success" && resultat.articleId) {
    redirect(`/admin/articles/${resultat.articleId}`);
  }

  return resultat;
}
