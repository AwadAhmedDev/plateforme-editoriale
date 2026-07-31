import { getCurrentSession } from "@/features/admin-auth/session";
import { ContenuEditorialRepository, type ArticlesAdminPagines } from "@/lib/db/contenu-editorial-repository";
import { listArticlesQuerySchema } from "@/features/articles/article-schema";

// Tri (Lot B2) : l'URL porte deux paramètres plats (`tri`, `sens`) là où le schéma attend un
// objet `sort` — cette mise à plat est la seule traduction faite ici, la validation des deux
// valeurs restant intégralement déléguée à `listArticlesQuerySchema` (aucune liste de champs
// autorisés dupliquée hors du schéma). `sens` absent retombe sur le sens naturel de la colonne
// (date → desc, statut → asc, mêmes valeurs que la première activation côté table) plutôt que
// de produire un objet incomplet, qui ferait échouer l'analyse et emporterait aussi les filtres.
function construireTri(rawParams: { tri?: string; sens?: string }) {
  if (rawParams.tri === undefined) return undefined;
  return { champ: rawParams.tri, sens: rawParams.sens ?? (rawParams.tri === "statut" ? "asc" : "desc") };
}

// Fonction de lecture réservée à l'administrateur (server-actions-specification.md §3.8,
// « listArticles »), sur le modèle de getArticleForEdit : revérifie elle-même la Session
// administrateur, indépendamment de la garde déjà appliquée en amont (proxy.ts +
// layout.tsx). Les paramètres bruts (chaînes issues de l'URL) sont validés par
// listArticlesQuerySchema, déjà écrit pour cet usage précis (article-schema.ts) mais
// jamais consommé jusqu'ici. Une entrée invalide ou manipulée retombe silencieusement sur
// les valeurs par défaut du schéma (page 1, aucun filtre) plutôt que de faire échouer la
// page — aucune logique métier au-delà de cette validation et de l'appel Repository.
//
// `findManyAdmin` retourne déjà `total` (comptage filtré par le même `where`) : un appel
// séparé à `countManyAdmin` serait une seconde requête strictement redondante avec ce total,
// donc volontairement omis ici.
export async function listArticles(rawParams: {
  page?: string;
  statut?: string;
  categorieId?: string;
  zoneId?: string;
  tri?: string;
  sens?: string;
}): Promise<ArticlesAdminPagines> {
  const session = await getCurrentSession();
  if (!session.authenticated) {
    throw new Error("Accès refusé : aucune Session administrateur valide.");
  }

  const analyse = listArticlesQuerySchema.safeParse({ ...rawParams, sort: construireTri(rawParams) });
  const params = analyse.success ? analyse.data : listArticlesQuerySchema.parse({});

  return ContenuEditorialRepository.findManyAdmin(params);
}
