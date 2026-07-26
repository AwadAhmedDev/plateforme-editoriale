import type { Metadata } from "next";
import Link from "next/link";
import { mentionsLegalesContent } from "./content";

// Page Mentions légales : créée pour combler le lien footer déjà en place
// (app/(public)/layout.tsx) qui pointait vers cette route sans qu'elle existe. Même
// patron que a-propos/page.tsx (contenu séparé dans content.ts, colonne de lecture
// max-w-[680px]) — pas de contrepartie dans Corne de l'Afrique.dc.html, qui ne couvre
// pas cet écran.
export const metadata: Metadata = {
  title: "Mentions légales",
  alternates: {
    canonical: "/mentions-legales",
  },
};

export default function MentionsLegalesPage() {
  const { editeur, directeurPublication, hebergement, proprieteIntellectuelle, donneesPersonnelles } =
    mentionsLegalesContent;

  return (
    <main className="mx-auto w-full max-w-[680px] flex-1 px-5 py-8">
      <h1 className="font-editorial text-4xl">Mentions légales</h1>

      <section className="mt-8">
        <h2 className="font-editorial text-2xl">{editeur.titre}</h2>
        {editeur.paragraphes.map((paragraphe) => (
          <p key={paragraphe} className="mt-3 text-base leading-relaxed">
            {paragraphe}
          </p>
        ))}
      </section>

      <section className="mt-8">
        <h2 className="font-editorial text-2xl">{directeurPublication.titre}</h2>
        {directeurPublication.paragraphes.map((paragraphe) => (
          <p key={paragraphe} className="mt-3 text-base leading-relaxed">
            {paragraphe}
          </p>
        ))}
      </section>

      <section className="mt-8">
        <h2 className="font-editorial text-2xl">{hebergement.titre}</h2>
        {hebergement.paragraphes.map((paragraphe) => (
          <p key={paragraphe} className="mt-3 text-base leading-relaxed">
            {paragraphe}
          </p>
        ))}
      </section>

      <section className="mt-8">
        <h2 className="font-editorial text-2xl">{proprieteIntellectuelle.titre}</h2>
        {proprieteIntellectuelle.paragraphes.map((paragraphe) => (
          <p key={paragraphe} className="mt-3 text-base leading-relaxed">
            {paragraphe}
          </p>
        ))}
      </section>

      <section className="mt-8">
        <h2 className="font-editorial text-2xl">{donneesPersonnelles.titre}</h2>
        {donneesPersonnelles.paragraphes.map((paragraphe) => (
          <p key={paragraphe} className="mt-3 text-base leading-relaxed">
            {paragraphe}
          </p>
        ))}
        <p className="mt-3 text-base leading-relaxed">
          <Link
            href="/confidentialite"
            className="text-accent-primary underline-offset-2 outline-none transition-colors duration-fast hover:text-accent-primary-hover hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
          >
            Consulter la politique de confidentialité →
          </Link>
        </p>
      </section>

      <Link
        href="/contact"
        className="mt-8 inline-block rounded-sm border border-border px-5 py-2 text-sm font-medium text-text-primary outline-none transition-colors duration-fast hover:text-accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
      >
        Nous contacter →
      </Link>
    </main>
  );
}
