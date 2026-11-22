import { getCurrentSession } from "@/features/admin-auth/session";

// Garde de session administrateur partagée (security-specification.md §3 : défense en
// profondeur — chaque Server Action/fonction de lecture réservée à l'administrateur doit
// revérifier elle-même la session, indépendamment de la garde déjà appliquée en amont par
// proxy.ts + layout.tsx). Extrait de trois copies identiques (categorie-actions.ts,
// zone-actions.ts, newsletter-actions.ts) avant qu'une quatrième n'apparaisse avec le
// module Articles.
export async function ensureAdministrateurAuthentifie(): Promise<void> {
  const session = await getCurrentSession();
  if (!session.authenticated) {
    throw new Error("Accès refusé : aucune Session administrateur valide.");
  }
}
