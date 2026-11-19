import { SkeletonBlock, SkeletonAnnonce } from "@/components/admin/skeleton-block";

// Squelette de /admin/categories — calqué sur la page : deux sections de structure
// identique (Catégories, Zones géographiques), chacune composée d'un h2, d'un bloc
// « Ajouter … » (h3 + formulaire) et d'une table. Espacements repris tels quels :
// `mb-10` entre les deux sections, `mb-6` sous le formulaire.
function SectionSquelette({ largeurTitre }: { largeurTitre: string }) {
  return (
    <>
      <SkeletonBlock className={`mb-3 h-6 ${largeurTitre}`} />

      <div className="mb-6">
        <SkeletonBlock className="mb-3 h-5 w-48" />
        <div className="flex items-end gap-3">
          <SkeletonBlock className="h-10 w-64" />
          <SkeletonBlock className="h-10 w-64" />
          <SkeletonBlock className="h-10 w-28" />
        </div>
      </div>

      <div className="border-b border-zinc-200 py-2 dark:border-zinc-800">
        <SkeletonBlock className="h-4 w-full max-w-[520px]" />
      </div>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="border-b border-zinc-100 py-3 dark:border-zinc-800">
          <SkeletonBlock className="h-5 w-full" />
        </div>
      ))}
    </>
  );
}

export default function CategoriesLoading() {
  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <SkeletonAnnonce />

      <SkeletonBlock className="mb-6 h-7 w-[420px]" />

      <section className="mb-10">
        <SectionSquelette largeurTitre="w-32" />
      </section>

      <section>
        <SectionSquelette largeurTitre="w-56" />
      </section>
    </main>
  );
}
