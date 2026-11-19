import Link from "next/link";
import type { ArticleRecentlyModified } from "@/lib/db/contenu-editorial-repository";
import { StatusBadge } from "@/components/admin/status-badge";

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "numeric" });
}

// Table « Derniers articles modifiés » (ui-specification.md §Dashboard : Titre, Catégorie,
// Statut, Dernière modification). La limite est appliquée par le Repository.
export function RecentArticlesTable({ articles }: { articles: ArticleRecentlyModified[] }) {
  if (articles.length === 0) {
    return (
      <p className="px-5 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Aucun article pour le moment. Créez votre premier article pour commencer.
      </p>
    );
  }

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="text-left">
          <th>Titre</th>
          <th>Catégorie</th>
          <th>Statut</th>
          <th>Dernière modification</th>
        </tr>
      </thead>
      <tbody>
        {articles.map((article) => (
          <tr key={article.id}>
            <td className="max-w-[420px]">
              <Link
                href={`/admin/articles/${article.id}`}
                className="line-clamp-1 font-medium text-zinc-900 hover:text-accent-primary dark:text-zinc-100"
              >
                {article.titre ?? "Article sans titre"}
              </Link>
            </td>
            <td className="text-zinc-600 dark:text-zinc-400">{article.categorie?.nom ?? "—"}</td>
            <td>
              <StatusBadge statut={article.statut} />
            </td>
            <td className="whitespace-nowrap text-zinc-600 dark:text-zinc-400">
              {formatDate(article.dateDerniereModification)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
