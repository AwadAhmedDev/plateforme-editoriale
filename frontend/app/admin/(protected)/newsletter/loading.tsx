import { SkeletonBlock, SkeletonAnnonce } from "@/components/admin/skeleton-block";

// Squelette de /admin/newsletter — calqué sur SubscriberTable : filtre e-mail
// (label + champ `h-10 w-64` + bouton `h-10`), compteur « N inscrits », table de
// 3 colonnes (E-mail, Date d'inscription, Action).
export default function NewsletterLoading() {
  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <SkeletonAnnonce />

      <SkeletonBlock className="mb-6 h-7 w-56" />

      <div className="mb-4 flex items-end gap-3">
        <div className="flex flex-col gap-1">
          <SkeletonBlock className="h-4 w-16" />
          <SkeletonBlock className="h-10 w-64" />
        </div>
        <SkeletonBlock className="h-10 w-24" />
      </div>

      <SkeletonBlock className="mb-3 h-5 w-24" />

      <div className="border-b border-zinc-200 py-2 dark:border-zinc-800">
        <SkeletonBlock className="h-4 w-full max-w-[420px]" />
      </div>
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="border-b border-zinc-100 py-3 dark:border-zinc-800">
          <SkeletonBlock className="h-5 w-full" />
        </div>
      ))}
    </main>
  );
}
