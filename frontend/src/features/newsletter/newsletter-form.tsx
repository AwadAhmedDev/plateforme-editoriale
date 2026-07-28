"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { subscribeNewsletter, type NewsletterActionState } from "@/features/newsletter/newsletter-actions";

const initialState: NewsletterActionState = { status: "idle", message: null };

type NewsletterFormProps = {
  variant?: "full" | "compact" | "banner";
};

// Formulaire d'inscription newsletter (ui-specification.md §Newsletter) : champ unique
// (e-mail), mention de confidentialité toujours visible, confirmation in situ (le
// formulaire est remplacé par le message de succès, jamais de redirection). Un seul
// composant, trois présentations (`variant`) — jamais deux implémentations parallèles de
// la logique de soumission (Lot Homepage, contrat validé) : `useActionState`, l'effet de
// restitution de saisie en cas d'erreur et l'état de succès sont partagés sans
// distinction de variant, seule la présentation du formulaire (avant succès) diffère.
//
// `variant="full"` (défaut, comportement strictement inchangé) : page dédiée
// /newsletter, label visible, colonne verticale. `variant="compact"` : bandeau Accueil,
// inline (email + bouton sur une ligne dès sm), label uniquement accessible (sr-only).
// `variant="banner"` (REPO-8, Corne de l'Afrique.dc.html l.436-455) : bandeau sombre
// sitewide (app/(public)/layout.tsx, avant le footer, sur toutes les pages) — mêmes
// champs que "compact", présentation alignée sur le design (fond sombre, bouton
// pleinement arrondi). Les trois variantes partagent même action serveur, mêmes
// messages, même traitement "déjà inscrit", et le même piège à robots (honeypot,
// champ "site_web" invisible, lu par subscribeNewsletter).
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
      <p
        role="status"
        className={
          variant === "banner"
            ? "rounded-md border border-white/20 bg-white/10 px-5 py-4 text-[15px] text-white"
            : "text-sm text-green-700 dark:text-green-400"
        }
      >
        {state.message}
      </p>
    );
  }

  if (variant === "banner") {
    return (
      <div className="min-w-0 lg:min-w-[380px]">
        <form action={formAction} className="flex gap-2.5">
          {/* Piège à robots (honeypot) : cf. contact-form.tsx pour la justification
              complète — invisible aux visiteurs réels, lu par subscribeNewsletter. */}
          <input
            type="text"
            name="site_web"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute left-[-9999px] h-0 w-0 overflow-hidden"
          />

          <label htmlFor="newsletter-email-banner" className="sr-only">
            Adresse e-mail
          </label>
          <input
            ref={emailRef}
            id="newsletter-email-banner"
            name="email"
            type="email"
            required
            placeholder="Votre adresse e-mail"
            className="h-[46px] flex-1 rounded-md border border-white/25 bg-white/[0.06] px-4 text-sm text-white placeholder:text-white/50 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          />
          <button
            type="submit"
            disabled={pending}
            className="h-[46px] shrink-0 whitespace-nowrap rounded-md bg-accent-primary px-[22px] text-sm font-semibold text-white outline-none transition-colors duration-fast hover:bg-accent-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
          >
            {pending ? "Inscription…" : "S'inscrire"}
          </button>
        </form>

        {state.status === "error" && (
          <p role="alert" className="mt-2.5 text-sm text-red-400">
            {state.message}
          </p>
        )}

        <p className="mt-2.5 text-xs text-[#9a9484]">
          En vous inscrivant, vous acceptez notre{" "}
          <Link
            href="/confidentialite"
            className="text-[#c8c2b6] underline-offset-2 outline-none transition-colors duration-fast hover:text-white hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            politique de confidentialité
          </Link>
          . Désinscription en un clic.
        </p>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <form action={formAction} className="flex flex-col gap-2">
        {/* Piège à robots (honeypot) : cf. contact-form.tsx. */}
        <input
          type="text"
          name="site_web"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute left-[-9999px] h-0 w-0 overflow-hidden"
        />

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
            className="h-11 shrink-0 rounded-sm bg-accent-primary px-5 text-sm font-medium text-white outline-none transition-colors duration-fast hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
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
      {/* Piège à robots (honeypot) : cf. contact-form.tsx. */}
      <input
        type="text"
        name="site_web"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 overflow-hidden"
      />

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
        className="h-11 rounded-sm bg-accent-primary px-5 text-sm font-medium text-white outline-none transition-colors duration-fast hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
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
