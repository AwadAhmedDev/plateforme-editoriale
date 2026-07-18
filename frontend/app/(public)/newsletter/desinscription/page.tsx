import Link from "next/link";
import { InscritNewsletterRepository } from "@/lib/db/inscrit-newsletter-repository";

// Traitement du jeton de désinscription (server-actions-specification.md §6.2, US-020) :
// Server Component qui lit et traite le jeton directement au rendu — pas une Server
// Action liée à un formulaire. Confirmation neutre unique dans tous les cas (jeton
// valide, déjà utilisé, invalide ou absent) : aucune écriture hors du cas valide, mais
// jamais un message distinctif (protection anti-énumération, security-specification.md
// §9). Page non liée depuis la navigation ni le footer — accessible uniquement via le
// lien reçu par e-mail. Seule action autorisée par ui-specification.md:348 : un retour
// vers l'Accueil, aucun champ de saisie ni autre bouton.
export default async function DesinscriptionNewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (token) {
    const inscrit = await InscritNewsletterRepository.findByJetonDesinscription(token);
    if (inscrit && inscrit.statut === "inscrit") {
      await InscritNewsletterRepository.updateStatutDesinscrit(inscrit.id);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center gap-4 p-7 text-center">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Désinscription confirmée</h1>
      <p role="status" className="text-sm text-zinc-600 dark:text-zinc-400">
        Vous avez été désinscrit de la newsletter.
      </p>
      <Link
        href="/"
        className="text-sm text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-100"
      >
        Retour à l&apos;Accueil
      </Link>
    </main>
  );
}
