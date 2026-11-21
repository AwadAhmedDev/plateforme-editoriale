import type { Metadata } from "next";
import { aProposContent } from "./content";

// Page À propos (Lot 6.1, contrat consolidé §4) : contenu séparé dans
// content.ts, aucune donnée chargée, page 100% statique. Ordre des sections
// non négociable (Mission → Méthodologie → Éditeur → Contact), conforme au
// wireframe Claude Design (écran 8). Colonne max-w-[680px], cohérente avec
// articles/[slug]/page.tsx (lecture longue), pas max-w-lg (Newsletter/
// Confidentialité, réservé aux formulaires courts).
//
// Metadata : même patron que newsletter/page.tsx et confidentialite/page.tsx
// (title statique, aucune description spécifique, alternates.canonical).
export const metadata: Metadata = {
  title: "À propos",
  alternates: {
    canonical: "/a-propos",
  },
};

export default function AProposPage() {
  const { mission, methodologie, editeur, contact } = aProposContent;

  return (
    <main className="mx-auto w-full max-w-[680px] flex-1 px-5 py-8">
      <h1 className="font-editorial text-4xl">À propos</h1>

      <section className="mt-8">
        <h2 className="font-editorial text-2xl">{mission.titre}</h2>
        {mission.paragraphes.map((paragraphe) => (
          <p key={paragraphe} className="mt-3 text-base leading-relaxed">
            {paragraphe}
          </p>
        ))}
      </section>

      <section className="mt-8">
        <h2 className="font-editorial text-2xl">{methodologie.titre}</h2>
        {methodologie.paragraphes.map((paragraphe) => (
          <p key={paragraphe} className="mt-3 text-base leading-relaxed">
            {paragraphe}
          </p>
        ))}
      </section>

      <section className="mt-8">
        <h2 className="font-editorial text-2xl">{editeur.titre}</h2>
        <p className="mt-3 text-base leading-relaxed">{editeur.texte}</p>
      </section>

      <a
        href={contact.href}
        className="mt-8 inline-block rounded-sm border border-border px-5 py-2 text-sm font-medium text-text-primary outline-none transition-colors duration-fast hover:text-accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
      >
        Nous contacter →
      </a>
    </main>
  );
}
