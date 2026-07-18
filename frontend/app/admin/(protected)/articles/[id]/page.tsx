import Link from "next/link";
import { notFound } from "next/navigation";
import { listCategories } from "@/features/taxonomies/list-categories";
import { listZones } from "@/features/taxonomies/list-zones";
import { getArticleForEdit } from "@/features/articles/get-article-for-edit";
import { ArticleContentForm } from "@/features/articles/article-content-form";
import { ArticleImageForm } from "@/features/articles/article-image-form";
import { ArticleStatusPanel } from "@/features/articles/article-status-panel";

// Écran Édition (Lot 10) : deux formulaires indépendants (contenu/classification/tags,
// image) + un panneau statut indépendant, tous les trois liés au même id déjà existant.
// findById lit l'article tous statuts confondus (server-actions-specification.md §3.7),
// via getArticleForEdit qui revérifie elle-même la Session administrateur.
//
// Lien « ← Retour à la liste » (Lot 13, ui-specification.md §Parcours administrateur —
// Modification d'un article) : seul élément de navigation propre à cet écran, la Sidebar
// (app/admin/(protected)/layout.tsx) couvrant déjà la navigation transverse.
export default async function ArticleEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [article, categories, zones] = await Promise.all([getArticleForEdit(id), listCategories(), listZones()]);

  if (!article) {
    notFound();
  }

  return (
    <main className="p-7">
      <Link
        href="/admin/articles"
        className="mb-4 inline-block text-sm text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        ← Retour à la liste
      </Link>
      <h1 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        {article.titre ?? "Article sans titre"}
      </h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr]">
        <ArticleContentForm article={article} categories={categories} zones={zones} />

        <div className="flex flex-col gap-8">
          <ArticleStatusPanel id={article.id} statut={article.statut} />
          <ArticleImageForm
            id={article.id}
            imagePrincipaleUrl={article.imagePrincipaleUrl}
            imageAltText={article.imageAltText}
          />
        </div>
      </div>
    </main>
  );
}
