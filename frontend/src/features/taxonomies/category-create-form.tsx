"use client";

import { useActionState, useEffect, useRef } from "react";
import { createCategory, type CategoryActionState } from "@/features/taxonomies/categorie-actions";

const initialState: CategoryActionState = { status: "idle", message: null };

// Formulaire de création inline (ui-specification.md §Formulaires : « nom + description
// courte, validation à la soumission du formulaire inline »). Message de confirmation/
// erreur inline plutôt qu'un Toast global (aucune infrastructure de toast dans le projet).
export function CategoryCreateForm() {
  const [state, formAction, pending] = useActionState(createCategory, initialState);
  const nomRef = useRef<HTMLInputElement>(null);
  const slugRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // React réinitialise les champs non contrôlés dès que l'action se résout : on
    // restitue la saisie uniquement en cas d'échec (succès → formulaire vidé, voulu).
    if (state.status === "error" && state.values) {
      if (nomRef.current) nomRef.current.value = state.values.nom;
      if (slugRef.current) slugRef.current.value = state.values.slug;
      if (descriptionRef.current) descriptionRef.current.value = state.values.descriptionCourte;
      nomRef.current?.focus();
    }
  }, [state]);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="nom" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Nom
        </label>
        <input
          ref={nomRef}
          id="nom"
          name="nom"
          type="text"
          required
          className="h-11 rounded-md border border-zinc-300 px-3.5 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-zinc-100"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="slug" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Slug (optionnel)
        </label>
        <input
          ref={slugRef}
          id="slug"
          name="slug"
          type="text"
          className="h-11 rounded-md border border-zinc-300 px-3.5 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-zinc-100"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="descriptionCourte" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Description courte (optionnelle)
        </label>
        <input
          ref={descriptionRef}
          id="descriptionCourte"
          name="descriptionCourte"
          type="text"
          className="h-11 w-64 rounded-md border border-zinc-300 px-3.5 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-zinc-100"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="h-11 min-w-[120px] rounded-md bg-zinc-900 px-5 text-sm font-medium text-white disabled:opacity-70 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? "Création…" : "Créer"}
      </button>

      {state.status === "error" && (
        <p role="alert" className="w-full text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      )}
      {state.status === "success" && (
        <p role="status" className="w-full text-sm text-green-700 dark:text-green-400">
          {state.message}
        </p>
      )}
    </form>
  );
}
