"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { subscribeNewsletter, type NewsletterActionState } from "@/features/newsletter/newsletter-actions";

const initialState: NewsletterActionState = { status: "idle", message: null };

type NewsletterFormProps = {
  variant?: "full" | "compact";
};

// Formulaire d'inscription newsletter (ui-specification.md §Newsletter) : champ unique
// (e-mail), mention de confidentialité toujours visible, confirmation in situ (le
// formulaire est remplacé par le message de succès, jamais de redirection). Un seul
// composant, deux présentations (`variant`) — jamais deux implémentations parallèles de
// la logique de soumission (Lot Homepage, contrat validé) : `useActionState`, l'effet de
// restitution de saisie en cas d'erreur et l'état de succès sont partagés sans
// distinction de variant, seule la présentation du formulaire (avant succès) diffère.
//
// `variant="full"` (défaut, comportement strictement inchangé) : page dédiée
// /newsletter, label visible, colonne verticale. `variant="compact"` : bandeau Accueil,
// inline (email + bouton sur une ligne dès sm), label uniquement accessible (sr-only) —
// même action serveur, mêmes messages, même traitement "déjà inscrit".
export function NewsletterForm({ variant = "full" }: NewsletterFormProps) {
  const [state, formAction, pending] = useActionState(subscribeNewsletter, initialState);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.status === "error" && state.values) {
      if (emailRef.current) emailRef.current.value = state.values.email;
      emailRef.current?.focus();
    }
  }, [state]);

  if (state.status === "success") {
    return (
      <p role="status" className="text-sm text-green-700 dark:text-green-400">
        {state.message}
      </p>
    );
  }

  if (variant === "compact") {
    return (
      <form action={formAction} className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 sm:flex-row">
          <label htmlFor="newsletter-email-compact" className="sr-only">
            Adresse e-mail
          </label>
          <input
            ref={emailRef}
            id="newsletter-email-compact"
            name="email"
            type="email"
            required
            placeholder="Votre adresse e-mail"
            className="h-11 flex-1 rounded-sm border border-border px-3.5 text-sm outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
          />
          <button
            type="submit"
            disabled={pending}
            className="h-11 shrink-0 rounded-sm bg-accent-warm px-5 text-sm font-medium text-white outline-none transition-colors duration-fast hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
          >
            {pending ? "Inscription…" : "S'abonner"}
          </button>
        </div>

        {state.status === "error" && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {state.message}
          </p>
        )}

        <p className="text-xs text-text-secondary">
          Consultez notre{" "}
          <Link
            href="/confidentialite"
            className="text-accent-primary underline-offset-2 outline-none transition-colors duration-fast hover:text-accent-primary-hover hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
          >
            Politique de confidentialité
          </Link>
          .
        </p>
      </form>
    );
  }

  return (
    <form action={formAction} className="flex max-w-sm flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="newsletter-email" className="text-sm font-medium">
          Adresse e-mail
        </label>
        <input
          ref={emailRef}
          id="newsletter-email"
          name="email"
          type="email"
          required
          className="h-11 rounded-sm border border-border px-3.5 text-sm outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-sm bg-accent-warm px-5 text-sm font-medium text-white outline-none transition-colors duration-fast hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
      >
        {pending ? "Inscription…" : "S'abonner"}
      </button>

      {state.status === "error" && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      )}

      <p className="text-xs text-text-secondary">
        Votre adresse e-mail est utilisée exclusivement pour l&apos;envoi de la newsletter. Consultez notre{" "}
        <Link
          href="/confidentialite"
          className="text-accent-primary underline-offset-2 outline-none transition-colors duration-fast hover:text-accent-primary-hover hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
        >
          Politique de confidentialité
        </Link>
        .
      </p>
    </form>
  );
}
