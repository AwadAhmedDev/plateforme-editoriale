// Primitive de squelette de l'espace d'administration (lot B1, ui-specification.md
// §États chargement). Un bloc neutre, sans texte, sans bordure, sans animation :
// « aucune animation expressive : indicateurs neutres, sans couleur d'accent ».
//
// Server Component pur — aucun état, aucun `use client`.
//
// Répertoire dédié `src/components/admin/` plutôt que `src/components/shared/`, que
// AGENTS.md réserve aux composants publics partagés : les deux espaces ne partagent aucun
// composant de navigation (ui-specification.md §Architecture UI) et n'ont pas la même
// palette — l'admin est bâti sur `zinc-*`, le public sur les tokens du design system.
//
// Une primitive plutôt que sept jeux de <div> recopiés dans les loading.tsx : le précédent
// du dépôt (app/(public)/articles/[slug]/loading.tsx) justifiait la forme ad hoc par
// l'absence de second consommateur — sept écrans inversent cet argument.
//
// `aria-hidden` : le squelette est une forme, pas une information. L'annonce revient au
// `role="status"` que chaque loading.tsx pose une seule fois, jamais à chaque bloc — sans
// quoi un lecteur d'écran énumérerait des dizaines de régions vides.
export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`rounded-md bg-zinc-200 dark:bg-zinc-800 ${className}`} />;
}

// Annonce unique de l'écran en cours de chargement (ui-specification.md §États chargement :
// « chaque état de chargement doit être annoncé aux technologies d'assistance »). Visuellement
// masquée : le squelette porte déjà l'information pour les voyants.
//
// Limite connue et assumée : la spécification demande aussi que l'annonce soit « mise à jour à
// la résolution ». Un loading.tsx est démonté, non mis à jour — le faire exigerait une région
// live persistante dans le layout, donc un composant client, hors périmètre de ce lot.
export function SkeletonAnnonce() {
  return (
    <p role="status" className="sr-only">
      Chargement des données en cours
    </p>
  );
}
