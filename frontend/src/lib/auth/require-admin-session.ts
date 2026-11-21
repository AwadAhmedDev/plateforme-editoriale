import { getCurrentSession } from "@/features/admin-auth/session";
import { DEMO_ADMIN, DEMO_REFUS } from "@/lib/demo";
import { prisma } from "@/lib/prisma";

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

// Vrai si la session courante est celle du compte de démonstration public.
export async function estCompteDemo(): Promise<boolean> {
  const session = await getCurrentSession();
  if (!session.authenticated) return false;
  const admin = await prisma.administrateur.findUnique({
    where: { id: session.administrateurId },
    select: { identifiant: true },
  });
  return admin?.identifiant === DEMO_ADMIN.identifiant;
}

// À appeler par chaque Server Action d'écriture, après ensureAdministrateurAuthentifie :
// renvoie l'état d'erreur à retourner tel quel pour le compte de démonstration.
export async function refusSiCompteDemo(): Promise<typeof DEMO_REFUS | null> {
  return (await estCompteDemo()) ? DEMO_REFUS : null;
}
