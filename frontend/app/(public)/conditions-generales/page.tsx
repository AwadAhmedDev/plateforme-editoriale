import type { Metadata } from "next";
import Link from "next/link";

// Conditions générales d'utilisation : même patron que mentions-legales/page.tsx
// (colonne de lecture max-w-[680px]). Contenu limité à ce que le site fait réellement
// (lecture publique, newsletter gratuite, formulaire de contact) — aucun compte
// utilisateur ni contenu payant (AGENTS.md §MVP scope).
export const metadata: Metadata = {
  title: "Conditions générales d'utilisation",
  description: "Conditions d'accès et d'utilisation du média Corne de l'Afrique.",
  alternates: {
    canonical: "/conditions-generales",
  },
};

const SECTIONS = [
  {
    titre: "Objet",
    paragraphes: [
      "Les présentes conditions générales d'utilisation encadrent l'accès au site et son utilisation par tout visiteur. Naviguer sur le site vaut acceptation de ces conditions.",
    ],
  },
  {
    titre: "Accès au site",
    paragraphes: [
      "Le site est accessible gratuitement, sans création de compte. L'éditeur s'efforce d'en assurer la disponibilité mais ne peut garantir un accès continu : des interruptions pour maintenance ou pour des raisons techniques peuvent survenir sans préavis.",
    ],
  },
  {
    titre: "Propriété intellectuelle",
    paragraphes: [
      "Les articles, analyses, photographies et éléments graphiques publiés sur le site sont protégés par le droit d'auteur. Toute reproduction ou diffusion, totale ou partielle, sans autorisation préalable est interdite, à l'exception des courtes citations accompagnées de la mention de la source et d'un lien vers l'article.",
    ],
  },
  {
    titre: "Newsletter",
    paragraphes: [
      "L'inscription à la newsletter est gratuite et facultative. Chaque envoi contient un lien de désinscription permettant d'y mettre fin à tout moment.",
    ],
  },
  {
    titre: "Formulaire de contact",
    paragraphes: [
      "Le formulaire de contact est destiné à échanger avec la rédaction. Il est interdit d'y transmettre des contenus illicites, diffamatoires, injurieux ou publicitaires non sollicités.",
    ],
  },
  {
    titre: "Responsabilité",
    paragraphes: [
      "Les contenus sont publiés à titre d'information et ne constituent pas un conseil juridique individualisé. Les liens vers des sites tiers sont fournis pour faciliter la documentation ; l'éditeur n'est pas responsable de leur contenu.",
    ],
  },
  {
    titre: "Droit applicable",
    paragraphes: [
      "Les présentes conditions sont soumises au droit français. Elles peuvent être modifiées à tout moment ; la version en ligne est celle qui fait foi.",
    ],
  },
];

export default function ConditionsGeneralesPage() {
  return (
    <main className="mx-auto w-full max-w-[680px] flex-1 px-5 py-8">
      <h1 className="font-editorial text-4xl">Conditions générales d&apos;utilisation</h1>

      {SECTIONS.map((section) => (
        <section key={section.titre} className="mt-8">
          <h2 className="font-editorial text-2xl">{section.titre}</h2>
          {section.paragraphes.map((paragraphe) => (
            <p key={paragraphe} className="mt-3 text-base leading-relaxed">
              {paragraphe}
            </p>
          ))}
        </section>
      ))}

      <p className="mt-8 text-base leading-relaxed">
        Voir aussi les{" "}
        <Link href="/mentions-legales" className="text-accent-primary hover:text-accent-primary-hover hover:underline">
          mentions légales
        </Link>{" "}
        et la{" "}
        <Link href="/confidentialite" className="text-accent-primary hover:text-accent-primary-hover hover:underline">
          politique de confidentialité
        </Link>
        .
      </p>
    </main>
  );
}
