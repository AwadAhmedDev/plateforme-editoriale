import type { Metadata } from "next";

// Politique de confidentialité (sitemap.md §Politique de confidentialité,
// frontend-specification.md:76,146 — route statique `app/(public)/confidentialite/page.tsx`).
// Contenu limité à ce que le site collecte réellement aujourd'hui (adresse e-mail de la
// Newsletter, seule donnée personnelle traitée par le domaine, cf. domain-model.md) —
// aucune mention d'un traitement non implémenté. Écran dérivé, lien de footer uniquement
// (ui-specification.md:14), pas de navigation propre.
//
// Metadata (Lot L10, contrat validé) : title statique reprenant le <h1> tel quel,
// aucune description spécifique — même choix que /, /articles, /recherche (éviter
// d'inventer un texte non validé, éviter de dupliquer la description globale du layout).
export const metadata: Metadata = {
  title: "Politique de confidentialité",
  alternates: {
    canonical: "/confidentialite",
  },
};

export default function ConfidentialitePage() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 p-7">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Politique de confidentialité</h1>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Données collectées et finalité</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Lors de votre inscription à la newsletter, seule votre adresse e-mail est collectée. Elle est utilisée
          exclusivement pour l&apos;envoi des communications de la newsletter, à l&apos;exclusion de toute autre
          finalité.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Durée de conservation</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Votre adresse e-mail est conservée tant que votre inscription à la newsletter reste active. Elle cesse
          d&apos;être utilisée dès votre désinscription.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Vos droits</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de votre adresse e-mail
          inscrite à la newsletter.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Exercer vos droits</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Vous pouvez vous désinscrire à tout moment via le lien de désinscription à usage unique présent dans
          chaque communication envoyée.
        </p>
      </section>
    </main>
  );
}
