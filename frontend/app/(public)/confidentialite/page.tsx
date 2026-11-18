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
      <h1 className="font-editorial text-3xl">Politique de confidentialité</h1>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold">Données collectées et finalité</h2>
        <p className="text-sm text-text-secondary">
          Lors de votre inscription à la newsletter, seule votre adresse e-mail est collectée. Elle est utilisée
          exclusivement pour l&apos;envoi des communications de la newsletter, à l&apos;exclusion de toute autre
          finalité.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold">Durée de conservation</h2>
        <p className="text-sm text-text-secondary">
          Votre adresse e-mail est conservée tant que votre inscription à la newsletter reste active. Elle cesse
          d&apos;être utilisée dès votre désinscription.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold">Vos droits</h2>
        <p className="text-sm text-text-secondary">
          Vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de votre adresse e-mail
          inscrite à la newsletter.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold">Exercer vos droits</h2>
        <p className="text-sm text-text-secondary">
          Vous pouvez vous désinscrire à tout moment via le lien de désinscription à usage unique présent dans
          chaque communication envoyée.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold">Cookies et mesure d&apos;audience</h2>
        <p className="text-sm text-text-secondary">
          Le site ne dépose aucun cookie publicitaire ni de traçage. La mesure d&apos;audience (Vercel Web
          Analytics) fonctionne sans cookie et sans identifiant persistant : les visites sont comptées de manière
          agrégée et anonyme, sans suivi d&apos;un site à l&apos;autre. Le seul cookie utilisé est un cookie de
          session strictement nécessaire, réservé à l&apos;espace d&apos;administration. Aucun consentement
          n&apos;est donc requis.
        </p>
      </section>
    </main>
  );
}
