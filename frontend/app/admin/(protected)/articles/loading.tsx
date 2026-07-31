import { SkeletonBlock, SkeletonAnnonce } from "@/components/admin/skeleton-block";

// Squelette de /admin/articles — calqué sur la page et sur ArticleTable : en-tête
// (titre + bouton « + Nouvel article » de `h-10`), barre de trois filtres avec leurs
// libellés (`h-10 w-44` pour Statut, `h-10 w-48` pour Catégorie et Zone) suivie des deux
// boutons, compteur, puis table de 6 colonnes et pagination.
//
// Largeurs des filtres reprises une à une du composant réel : les uniformiser produirait
// un décalage horizontal à l'arrivée du contenu.
export default function ArticlesLoading() {
  return (
    <main className="p-7">
      <SkeletonAnnonce />

      <div className="mb-6 flex items-center justify-between">
        <SkeletonBlock className="h-7 w-64" />
        <SkeletonBlock className="h-10 w-40" />
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <SkeletonBlock className="h-4 w-14" />
          <SkeletonBlock className="h-10 w-44" />
        </div>
        <div className="flex flex-col gap-1">
          <SkeletonBlock className="h-4 w-20" />
          <SkeletonBlock className="h-10 w-48" />
        </div>
        <div className="flex flex-col gap-1">
          <SkeletonBlock className="h-4 w-32" />
          <SkeletonBlock className="h-10 w-48" />
        </div>
        <SkeletonBlock className="h-10 w-24" />
      </div>

      <SkeletonBlock className="mb-3 h-5 w-24" />

      <div className="border-b border-zinc-200 py-2 dark:border-zinc-800">
        <SkeletonBlock className="h-4 w-full max-w-[720px]" />
      </div>
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="border-b border-zinc-100 py-3 dark:border-zinc-800">
          <SkeletonBlock className="h-5 w-full" />
        </div>
      ))}

      <div className="mt-4 flex gap-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-9 w-9" />
        ))}
      </div>
    </main>
  );
}
