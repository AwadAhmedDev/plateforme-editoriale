import { SkeletonBlock, SkeletonAnnonce } from "@/components/admin/skeleton-block";

// Squelette de /admin/contact — calqué sur app/admin/(protected)/contact/page.tsx et
// ContactMessageTable : titre, compteur « N messages », table de 5 colonnes
// (Date, Nom, Courriel, Objet, Message).
//
// Hauteurs reprises du rendu réel pour qu'aucun saut de mise en page ne survienne à
// l'arrivée des données : `py-2` en en-tête, `py-3` par ligne (ui-specification.md
// §États chargement).
export default function ContactLoading() {
  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <SkeletonAnnonce />

      <SkeletonBlock className="mb-6 h-7 w-64" />
      <SkeletonBlock className="mb-3 h-5 w-28" />

      <div className="border-b border-zinc-200 py-2 dark:border-zinc-800">
        <SkeletonBlock className="h-4 w-full max-w-[640px]" />
      </div>
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="border-b border-zinc-100 py-3 dark:border-zinc-800">
          <SkeletonBlock className="h-5 w-full" />
        </div>
      ))}
    </main>
  );
}
