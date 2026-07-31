import { SkeletonBlock, SkeletonAnnonce } from "@/components/admin/skeleton-block";

// Squelette de /admin/articles/[id] — calqué sur la page : lien de retour, titre, puis la
// grille `grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr]` reprise à l'identique, faute de quoi le
// contenu réel décalerait latéralement à son arrivée.
//
// Colonne principale : ArticleContentForm. Colonne latérale : ArticleStatusPanel puis
// ArticleImageForm, empilés avec `gap-8`.
export default function EditeurArticleLoading() {
  return (
    <main className="p-7">
      <SkeletonAnnonce />

      <SkeletonBlock className="mb-4 h-5 w-40" />
      <SkeletonBlock className="mb-6 h-7 w-[420px]" />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <SkeletonBlock className="h-5 w-20" />
            <SkeletonBlock className="h-10 w-full" />
          </div>
          <div className="flex flex-col gap-2">
            <SkeletonBlock className="h-5 w-20" />
            <SkeletonBlock className="h-10 w-full" />
          </div>
          <div className="flex flex-col gap-2">
            <SkeletonBlock className="h-5 w-20" />
            <SkeletonBlock className="h-16 w-full" />
          </div>
          <div className="flex flex-col gap-2">
            <SkeletonBlock className="h-5 w-20" />
            <SkeletonBlock className="h-56 w-full" />
          </div>

          <div className="flex flex-wrap gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex flex-col gap-2">
                <SkeletonBlock className="h-5 w-32" />
                <SkeletonBlock className="h-10 w-48" />
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="flex flex-col gap-2">
                <SkeletonBlock className="h-5 w-24" />
                <SkeletonBlock className="h-10 w-64" />
              </div>
            ))}
          </div>

          <SkeletonBlock className="h-10 w-40" />
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <SkeletonBlock className="h-5 w-28" />
            <SkeletonBlock className="h-10 w-full" />
            <SkeletonBlock className="h-10 w-40" />
          </div>

          <div className="flex flex-col gap-3">
            <SkeletonBlock className="h-5 w-36" />
            <SkeletonBlock className="aspect-video w-full" />
            <SkeletonBlock className="h-10 w-full" />
            <SkeletonBlock className="h-10 w-40" />
          </div>
        </div>
      </div>
    </main>
  );
}
