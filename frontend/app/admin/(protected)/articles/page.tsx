import Link from "next/link";
import { listArticles } from "@/features/articles/list-articles";
import { listCategories } from "@/features/taxonomies/list-categories";
import { listZones } from "@/features/taxonomies/list-zones";
import { ArticleTable } from "@/features/articles/article-table";

// Gestion des articles (liste back-office, Lot 12) : Server Component, sur le patron exact
// de newsletter/page.tsx (lecture des searchParams côté serveur, aucun state client isolé
// pour le filtrage/la pagination — frontend-specification.md §Stratégie de gestion d'état).
// Point d'entrée « Modifier » vers l'Éditeur d'article (Lot 10) et « + Nouvel article » vers
// l'écran de création, déjà tous deux implémentés et jusqu'ici inatteignables faute de liste
// (audit Lot 11).
export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; statut?: string; categorieId?: string; zoneId?: string }>;
}) {
  const params = await searchParams;

  const [result, categories, zones] = await Promise.all([listArticles(params), listCategories(), listZones()]);

  return (
    <main className="p-7">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Gestion des articles</h1>
        <Link
          href="/admin/articles/nouveau"
          className="h-10 rounded-md bg-zinc-900 px-4 text-sm font-medium leading-10 text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          + Nouvel article
        </Link>
      </div>

      <ArticleTable
        articles={result.items}
        total={result.total}
        page={result.page}
        statutFilter={params.statut ?? ""}
        categorieIdFilter={params.categorieId ?? ""}
        zoneIdFilter={params.zoneId ?? ""}
        categories={categories}
        zones={zones}
      />
    </main>
  );
}
