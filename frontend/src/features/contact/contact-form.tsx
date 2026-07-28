"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitContactMessage, type ContactActionState } from "@/features/contact/contact-actions";
import { OBJETS_CONTACT } from "@/features/contact/contact-schema";

const initialState: ContactActionState = { status: "idle", message: null };

const CHAMP =
  "w-full rounded-md border border-border bg-bg-primary px-3 py-2.5 text-sm text-text-primary outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary";
const LABEL = "mb-1.5 block text-[11px] font-semibold uppercase tracking-[.1em] text-text-secondary";

// Formulaire de contact (REPO-7, Corne de l'Afrique.dc.html l.418-427) : Nom/Courriel/
// Objet/Message, confirmation in situ sur le modèle de NewsletterForm (le formulaire est
// remplacé par le message de succès, jamais de redirection) — même
// useActionState + restitution de saisie en cas d'erreur. Rendu à l'intérieur de la carte
// (fond, bordure, padding) fournie par la page contact, pas ici : ce composant ne gère que
// le contenu (formulaire ou confirmation), pas son enveloppe.
export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContactMessage, initialState);
  const nomRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.status === "error" && state.values && nomRef.current) {
      nomRef.current.focus();
    }
  }, [state]);

  if (state.status === "success") {
    return (
      <div className="flex flex-col items-center gap-2.5 px-2.5 py-10 text-center">
        <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-accent-primary text-2xl text-white">
          ✓
        </div>
        <h3 className="font-editorial text-[22px] font-bold text-text-primary">Message envoyé</h3>
        <p className="max-w-[34ch] text-sm text-text-secondary">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {/* Piège à robots (honeypot) : champ invisible aux visiteurs réels (hors flux visuel,
          exclu de l'arbre d'accessibilité, jamais atteint au clavier) — un remplissage
          automatique de formulaire le renseigne souvent. Lu par submitContactMessage,
          jamais par la validation Zod. */}
      <input
        type="text"
        name="site_web"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 overflow-hidden"
      />

      <div>
        <label htmlFor="contact-nom" className={LABEL}>
          Nom
        </label>
        <input ref={nomRef} id="contact-nom" name="nom" required defaultValue={state.values?.nom} className={CHAMP} />
      </div>

      <div>
        <label htmlFor="contact-email" className={LABEL}>
          Courriel
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          defaultValue={state.values?.email}
          className={CHAMP}
        />
      </div>

      <div>
        <label htmlFor="contact-objet" className={LABEL}>
          Objet
        </label>
        <select id="contact-objet" name="objet" defaultValue={state.values?.objet ?? OBJETS_CONTACT[0]} className={CHAMP}>
          {OBJETS_CONTACT.map((objet) => (
            <option key={objet} value={objet}>
              {objet}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="contact-message" className={LABEL}>
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          defaultValue={state.values?.message}
          className={`${CHAMP} resize-y`}
        />
      </div>

      {state.status === "error" && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-accent-primary px-4 py-3 text-sm font-semibold text-white outline-none transition-colors duration-fast hover:bg-accent-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
      >
        {pending ? "Envoi…" : "Envoyer le message"}
      </button>
    </form>
  );
}
