import type { Metadata } from "next";
import { methodologieContent } from "./content";

// Page Méthodologie (REPO-7, Corne de l'Afrique.dc.html l.386-398) : contenu statique
// séparé dans content.ts, même patron que a-propos/page.tsx. Colonne max-w-[720px], reprise
// du design (max-width:720px). Metadata sur le même patron que les autres pages statiques.
export const metadata: Metadata = {
  title: "Méthodologie",
  alternates: {
    canonical: "/methodologie",
  },
};

export default function MethodologiePage() {
  return (
    <main className="mx-auto w-full max-w-[720px] flex-1 px-5 py-8">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[.16em] text-accent-primary">
        {methodologieContent.eyebrow}
      </p>
      <h1 className="font-editorial text-4xl">{methodologieContent.titre}</h1>
      <p className="mt-4 text-base leading-relaxed text-text-secondary">{methodologieContent.intro}</p>

      <div className="mt-8 flex flex-col gap-6">
        {methodologieContent.sections.map((section) => (
          <section key={section.titre}>
            <h2 className="font-editorial text-xl font-semibold">{section.titre}</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">{section.texte}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
