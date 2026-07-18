"use client";

import { useState, type KeyboardEvent } from "react";

// Composant purement présentationnel (Lot 9) : saisie/suppression de mots-clés, état
// local à la frappe uniquement (ui-specification.md — Tag : « créé et supprimé
// exclusivement dans le contexte de l'Éditeur d'article, aucun écran de gestion globale »).
// Aucune Server Action : la persistance de `value` reste entièrement à la charge de
// l'appelant via `onChange`.

export function KeywordTagInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function ajouterDraft() {
    const motCle = draft.trim();
    setDraft("");
    if (motCle.length === 0 || value.includes(motCle)) return;
    onChange([...value, motCle]);
  }

  function retirerMotCle(motCle: string) {
    onChange(value.filter((m) => m !== motCle));
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      ajouterDraft();
    } else if (event.key === "Backspace" && draft.length === 0 && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-zinc-300 p-2 dark:border-zinc-700">
      {value.map((motCle) => (
        <span
          key={motCle}
          className="inline-flex items-center gap-1 rounded-full border border-zinc-300 py-1 pl-3 pr-1 font-mono text-[13px] text-zinc-800 dark:border-zinc-600 dark:text-zinc-200"
        >
          {motCle}
          <button
            type="button"
            onClick={() => retirerMotCle(motCle)}
            aria-label={`Retirer le mot-clé ${motCle}`}
            className="flex h-6 w-6 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <span aria-hidden="true" className="text-sm leading-none">
              ✕
            </span>
          </button>
        </span>
      ))}
      <input
        type="text"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={onKeyDown}
        onBlur={ajouterDraft}
        placeholder="Ajouter un mot-clé"
        aria-label="Ajouter un mot-clé"
        className="h-9 min-w-[140px] flex-1 border-none bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
      />
    </div>
  );
}
