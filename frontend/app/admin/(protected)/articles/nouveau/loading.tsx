import { SkeletonBlock, SkeletonAnnonce } from "@/components/admin/skeleton-block";

// Squelette de /admin/articles/nouveau — calqué sur la page et sur ArticleContentForm :
// lien « ← Retour à la liste », titre, puis le formulaire pleine largeur (aucune grille à
// deux colonnes ici, contrairement à l'écran d'édition qui porte en plus le panneau de
// statut et le formulaire d'image).
//
// Ordre et proportions des champs repris du formulaire réel : Titre, Slug, Chapô
// (2 lignes), Corps (10 lignes), puis les trois sélecteurs Type/Catégorie/Zone, puis
// Auteur et Sources.
export default function NouvelArticleLoading() {
  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <SkeletonAnnonce />

      <SkeletonBlock className="mb-4 h-5 w-40" />
      <SkeletonBlock className="mb-6 h-7 w-56" />

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
    </main>
  );
}
