"use client";

// Composant purement présentationnel (Lot 9) : 3 segments pill pour le statut d'un
// Contenu éditorial (ui-specification.md — Select : « le statut d'article n'est jamais
// un select classique, toujours rendu en 3 segments pill visibles »). Aucune Server
// Action, aucun accès Repository/Zod — seul le conteneur appelant décide de ce que
// `onChange` déclenche.

export type StatutArticle = "brouillon" | "publie" | "archive";

const STATUTS: ReadonlyArray<{
  value: StatutArticle;
  label: string;
  activeClassName: string;
}> = [
  {
    value: "brouillon",
    label: "Brouillon",
    activeClassName:
      "border-amber-700 bg-amber-50 text-amber-800 dark:border-amber-500 dark:bg-amber-950 dark:text-amber-300",
  },
  {
    value: "publie",
    label: "Publié",
    activeClassName:
      "border-green-700 bg-green-50 text-green-800 dark:border-green-500 dark:bg-green-950 dark:text-green-300",
  },
  {
    value: "archive",
    label: "Archivé",
    activeClassName:
      "border-zinc-500 bg-zinc-100 text-zinc-700 dark:border-zinc-400 dark:bg-zinc-800 dark:text-zinc-300",
  },
];

export function StatusPills({
  value,
  onChange,
}: {
  value: StatutArticle;
  onChange: (value: StatutArticle) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Statut" className="inline-flex flex-wrap gap-2">
      {STATUTS.map((statut) => {
        const selected = statut.value === value;
        return (
          <button
            key={statut.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(statut.value)}
            className={`h-9 rounded-full border-2 px-4 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 ${
              selected
                ? statut.activeClassName
                : "border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600"
            }`}
          >
            {statut.label}
          </button>
        );
      })}
    </div>
  );
}
