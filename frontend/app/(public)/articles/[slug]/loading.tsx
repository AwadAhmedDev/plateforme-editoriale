// Squelette minimal (Lot L3) — forme ad hoc propre à cette page, pas le
// composant Skeleton générique (aucune seconde page n'en a encore besoin,
// cf. audit « Fondations minimales »). Aucune animation expressive
// (ui-specification.md §États chargement).
export default function ArticleDetailLoading() {
  return (
    <main className="mx-auto w-full max-w-[680px] flex-1 px-5 py-8">
      <div className="h-4 w-40 rounded-sm bg-bg-secondary" />
      <div className="mt-4 h-10 w-full rounded-sm bg-bg-secondary" />
      <div className="mt-6 aspect-video w-full rounded-sm bg-bg-secondary" />
      <div className="mt-6 space-y-3">
        <div className="h-4 w-full rounded-sm bg-bg-secondary" />
        <div className="h-4 w-full rounded-sm bg-bg-secondary" />
        <div className="h-4 w-2/3 rounded-sm bg-bg-secondary" />
      </div>
    </main>
  );
}
