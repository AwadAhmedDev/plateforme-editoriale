"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { subscribeNewsletter, type NewsletterActionState } from "@/features/newsletter/newsletter-actions";

const initialState: NewsletterActionState = { status: "idle", message: null };

// Formulaire d'inscription newsletter (ui-specification.md §Newsletter) : champ unique
// (e-mail), mention de confidentialité toujours visible, confirmation in situ (le
// formulaire est remplacé par le message de succès, jamais de redirection). Premier
// formulaire public du projet — pattern identique à ZoneCreateForm/CategoryCreateForm
// (useActionState, restitution de la saisie en cas d'échec), adapté à un usage public
// (aucune garde de session, cf. newsletter-actions.ts).
export function NewsletterForm() {
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

  return (
    <form action={formAction} className="flex max-w-sm flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="newsletter-email" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Adresse e-mail
        </label>
        <input
          ref={emailRef}
          id="newsletter-email"
          name="email"
          type="email"
          required
          className="h-11 rounded-md border border-zinc-300 px-3.5 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-zinc-100"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-md bg-orange-600 px-5 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-70"
      >
        {pending ? "Inscription…" : "S'abonner"}
      </button>

      {state.status === "error" && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      )}

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Votre adresse e-mail est utilisée exclusivement pour l&apos;envoi de la newsletter. Consultez notre{" "}
        <Link href="/confidentialite" className="text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-100">
          Politique de confidentialité
        </Link>
        .
      </p>
    </form>
  );
}
