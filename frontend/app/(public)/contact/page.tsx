import type { Metadata } from "next";
import { contactContent } from "./content";
import { aProposContent } from "../a-propos/content";
import { ContactForm } from "@/features/contact/contact-form";

// Page Contact (REPO-7, Corne de l'Afrique.dc.html l.401-430) : colonne coordonnées +
// formulaire (Nom/Courriel/Objet/Message), stockage en base uniquement (D6) — aucun envoi
// e-mail sortant. Metadata sur le même patron que a-propos/page.tsx et newsletter/page.tsx.
export const metadata: Metadata = {
  title: "Contact",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-[1080px] flex-1 px-5 py-8 lg:grid lg:grid-cols-2 lg:gap-12 lg:px-[28px]">
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[.16em] text-accent-primary">
          {contactContent.eyebrow}
        </p>
        <h1 className="font-editorial text-4xl">{contactContent.titre}</h1>
        <p className="mt-4 max-w-[44ch] text-base leading-relaxed text-text-secondary">{contactContent.intro}</p>

        <div className="mt-7 flex flex-col gap-4">
          <div className="flex items-baseline gap-3">
            <span className="w-[90px] shrink-0 text-[11px] font-semibold uppercase tracking-[.12em] text-text-secondary">
              Courriel
            </span>
            <span className="text-[15px]">{aProposContent.contact.email}</span>
          </div>
          {contactContent.coordonnees.map((ligne) => (
            <div key={ligne.label} className="flex items-baseline gap-3">
              <span className="w-[90px] shrink-0 text-[11px] font-semibold uppercase tracking-[.12em] text-text-secondary">
                {ligne.label}
              </span>
              <span className="text-[15px]">{ligne.valeur}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 rounded-md border border-border bg-bg-secondary p-7 lg:mt-0">
        <ContactForm />
      </div>
    </main>
  );
}
