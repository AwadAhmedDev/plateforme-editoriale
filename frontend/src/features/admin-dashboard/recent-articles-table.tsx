import Link from "next/link";
import type { ArticleRecentlyModified } from "@/lib/db/contenu-editorial-repository";

// Mêmes libellés que STATUTS dans features/articles/status-pills.tsx (Lot 9, non modifié,
// non exporté) — reproduits ici en texte simple plutôt que réimportés : cette table reste
// un Server Component pur (aucun état, aucun événement propre), alors que StatusPills est
// un Client Component dont l'`onChange` requis ne peut pas traverser la frontière
// Server → Client avec une fonction locale. Pas de pastille colorée ici : la colonne
// « Statut » d'ui-specification.md §Dashboard Administrateur ne prescrit, contrairement à
// la table Gestion des articles (§Tables Administrateur), aucun rendu en pastille.
const STATUT_LABELS: Record<string, string> = {
  brouillon: "Brouillon",
  publie: "Publié",
  archive: "Archivé",
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
}

// Table « Derniers articles modifiés » (ui-specification.md §Dashboard Administrateur :
// Titre, Catégorie, Statut, Dernière modification — 5 lignes maximum). La limite est déjà
// appliquée par ContenuEditorialRepository.findRecentlyModified (RECENT_ARTICLES_LIMIT,
// get-dashboard-data.ts), jamais recoupée ici. Le titre est un lien direct vers l'Éditeur,
// sur le même motif que « Modifier » dans ArticleTable (features/articles/article-table.tsx)
// — pas de ligne cliquable dans son ensemble, motif absent du reste du projet.
export function RecentArticlesTable({ articles }: { articles: ArticleRecentlyModified[] }) {
  if (articles.length === 0) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Aucun article pour le moment. Créez votre premier article pour commencer.
      </p>
    );
  }

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-zinc-200 text-left text-[12px] font-mono uppercase text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          <th className="py-2">Titre</th>
          <th className="py-2">Catégorie</th>
          <th className="py-2">Statut</th>
          <th className="py-2">Dernière modification</th>
        </tr>
      </thead>
      <tbody>
        {articles.map((article) => (
          <tr key={article.id} className="border-b border-zinc-100 dark:border-zinc-800">
            <td className="py-3">
              <Link
                href={`/admin/articles/${article.id}`}
                className="text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-100"
              >
                {article.titre ?? "Article sans titre"}
              </Link>
            </td>
            <td className="py-3">{article.categorie?.nom ?? "—"}</td>
            <td className="py-3">{STATUT_LABELS[article.statut] ?? article.statut}</td>
            <td className="py-3">{formatDate(article.dateDerniereModification)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
