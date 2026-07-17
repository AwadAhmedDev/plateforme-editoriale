"use client";

import { useActionState, useEffect, useRef } from "react";
import { loginFormAction, type LoginFormState } from "@/features/admin-auth/login-form-action";

const initialState: LoginFormState = { error: null, identifiant: "" };

// Formulaire de connexion administrateur (ui-specification.md §Formulaires, §États
// erreurs) : message générique unique en cas d'échec, sans jamais désigner le champ
// fautif ; mot de passe vidé, identifiant conservé ; indicateur neutre sur le bouton
// pendant la soumission.
export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(loginFormAction, initialState);
  const identifiantRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!state.error) {
      return;
    }
    // React réinitialise tous les champs non contrôlés après résolution de l'action —
    // on restitue l'identifiant (conservé) et on vide explicitement le mot de passe.
    if (identifiantRef.current) {
      identifiantRef.current.value = state.identifiant;
    }
    if (passwordRef.current) {
      passwordRef.current.value = "";
      passwordRef.current.focus();
    }
  }, [state.error, state.identifiant]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="identifiant" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Identifiant
        </label>
        <input
          ref={identifiantRef}
          id="identifiant"
          name="identifiant"
          type="text"
          autoComplete="username"
          required
          className="h-11 rounded-md border border-zinc-300 px-3.5 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-zinc-100"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="motDePasse" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Mot de passe
        </label>
        <input
          ref={passwordRef}
          id="motDePasse"
          name="motDePasse"
          type="password"
          autoComplete="current-password"
          required
          className="h-11 rounded-md border border-zinc-300 px-3.5 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-zinc-100"
        />
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="mt-2 h-11 min-w-[140px] self-start rounded-md bg-zinc-900 px-5 text-sm font-medium text-white disabled:opacity-70 dark:bg-zinc-100 dark:text-zinc-900"
      >
        <span aria-live="polite">{pending ? "Connexion…" : "Se connecter"}</span>
      </button>
    </form>
  );
}
