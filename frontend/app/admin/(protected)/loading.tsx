import { SkeletonBlock, SkeletonAnnonce } from "@/components/admin/skeleton-block";

// Squelette du Dashboard (/admin) — calqué sur app/admin/(protected)/page.tsx : en-tête
// (titre + « + Nouvel article »), grille de 3 compteurs, séparateur `border-t` avec les
// 4 « Autres indicateurs » en grille de 4, puis la table des derniers articles modifiés
// (4 colonnes, RECENT_ARTICLES_LIMIT = 5 lignes).
//
// Ce fichier est à la racine du segment (protected) : il sert donc aussi de repli aux
// sous-segments qui n'ont pas leur propre loading.tsx. Tous en ont un (articles, [id],
// nouveau, categories, newsletter, contact), et le fichier le plus proche l'emporte —
// aucun écran n'affichera donc la forme du Dashboard à la place de la sienne.
//
// La sidebar reste visible pendant le chargement : le layout parent l'affiche avant
// {children}, et cette frontière ne remplace que le contenu.
//
// Proportions des cartes reprises du rendu réel : `p-4`, valeur en `text-[28px]` et
// libellé en `text-[11px]` avec `mt-1`.
function CarteCompteur() {
  return (
    <div className="admin-card p-5">
      <SkeletonBlock className="h-8 w-16" />
      <SkeletonBlock className="mt-1 h-3 w-28" />
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <SkeletonAnnonce />

      <div className="mb-6 flex items-center justify-between">
        <SkeletonBlock className="h-7 w-72" />
        <SkeletonBlock className="h-10 w-40" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <CarteCompteur key={index} />
        ))}
      </div>

      <div className="mt-4">
        <SkeletonBlock className="mb-3 h-3 w-36" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <CarteCompteur key={index} />
          ))}
        </div>
      </div>

      <div className="mt-8">
        <SkeletonBlock className="mb-3 h-6 w-56" />

        <div className="border-b border-zinc-200 py-2 dark:border-zinc-800">
          <SkeletonBlock className="h-4 w-full max-w-[560px]" />
        </div>
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="border-b border-zinc-100 py-3 dark:border-zinc-800">
            <SkeletonBlock className="h-5 w-full" />
          </div>
        ))}
      </div>
    </main>
  );
}
