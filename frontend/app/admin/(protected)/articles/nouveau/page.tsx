import Link from "next/link";
import { listCategories } from "@/features/taxonomies/list-categories";
import { listZones } from "@/features/taxonomies/list-zones";
import { ArticleContentForm } from "@/features/articles/article-content-form";

// Écran Création (Lot 10) : formulaire de contenu seul, lié à createArticle (via
// createArticleAction, qui redirige vers /admin/articles/[id] au premier succès).
// Ni StatusPills ni ImageUploadField ici : les deux dépendent d'un id déjà existant
// (uploadMainImage relit l'article par id ; un statut n'a de sens qu'une fois créé,
// toujours `brouillon` par défaut base à la création — cf. arbitrage Lot 10, §3).
//
// Lien « ← Retour à la liste » (Lot 13, ui-specification.md §Parcours administrateur —
// Création d'un article) : seul élément de navigation propre à cet écran, la Sidebar
// (app/admin/(protected)/layout.tsx) couvrant déjà la navigation transverse.
export default async function NouvelArticlePage() {
  const [categories, zones] = await Promise.all([listCategories(), listZones()]);

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <Link
        href="/admin/articles"
        className="mb-4 inline-block text-sm text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        ← Retour à la liste
      </Link>
      <h1 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-50">Nouvel article</h1>
      <ArticleContentForm article={null} categories={categories} zones={zones} />
    </main>
  );
}
