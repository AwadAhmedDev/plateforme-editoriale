import Link from "next/link";
import { getDashboardData, RECENT_ARTICLES_LIMIT } from "@/features/admin-dashboard/get-dashboard-data";
import { RecentArticlesTable } from "@/features/admin-dashboard/recent-articles-table";

// Dashboard administrateur (Lot 14, mise en conformité ui-specification.md §Dashboard
// Administrateur) : Server Component pur, lecture seule via getDashboardData.
//
// Cartes de comptage en deux groupes (choix documenté, audit Lot 14 §2) :
// - les 3 métriques prescrites par la spec (Articles publiés, Brouillons, Inscrits
//   newsletter), seules à respecter la grille 3 colonnes égales ;
// - les 4 compteurs déjà présents avant ce lot (Contenus éditoriaux, Catégories, Zones
//   géographiques, Archivés), hors périmètre de la spec mais conservés — aucune régression
//   d'information pour l'administrateur — dans une section secondaire clairement séparée
//   (titre « Autres indicateurs », bordure supérieure), plutôt que retirés.
//
// Action rapide « + Nouvel article » : même classes que le bouton identique de
// app/admin/(protected)/articles/page.tsx, aucun nouveau style. Table « Derniers articles
// modifiés » et lien « Voir tous les articles » (affiché seulement si `totalContenus`
// dépasse RECENT_ARTICLES_LIMIT, cf. ui-specification.md : « si plus de contenu existe »)
// délégués à RecentArticlesTable (features/admin-dashboard).
export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  const statsPrincipales: { label: string; value: number }[] = [
    { label: "Articles publiés", value: data.publies },
    { label: "Brouillons", value: data.brouillons },
    { label: "Inscrits newsletter", value: data.totalInscrits },
  ];

  const statsSecondaires: { label: string; value: number }[] = [
    { label: "Contenus éditoriaux", value: data.totalContenus },
    { label: "Catégories", value: data.totalCategories },
    { label: "Zones géographiques", value: data.totalZones },
    { label: "Archivés", value: data.archives },
  ];

  return (
    <main className="p-7">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Dashboard administrateur</h1>
        <Link
          href="/admin/articles/nouveau"
          className="h-10 rounded-md bg-zinc-900 px-4 text-sm font-medium leading-10 text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          + Nouvel article
        </Link>
      </div>

      <dl className="grid grid-cols-3 gap-4">
        {statsPrincipales.map((stat) => (
          <div
            key={stat.label}
            className="rounded-md border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <dd className="text-[28px] font-medium text-zinc-900 dark:text-zinc-50">{stat.value}</dd>
            <dt className="mt-1 text-[11px] font-mono uppercase text-zinc-500 dark:text-zinc-400">
              {stat.label}
            </dt>
          </div>
        ))}
      </dl>

      <div className="mt-8 border-t border-zinc-200 pt-8 dark:border-zinc-800">
        <h2 className="mb-3 text-[11px] font-mono uppercase text-zinc-500 dark:text-zinc-400">
          Autres indicateurs
        </h2>
        <dl className="grid grid-cols-4 gap-4">
          {statsSecondaires.map((stat) => (
            <div
              key={stat.label}
              className="rounded-md border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <dd className="text-[28px] font-medium text-zinc-900 dark:text-zinc-50">{stat.value}</dd>
              <dt className="mt-1 text-[11px] font-mono uppercase text-zinc-500 dark:text-zinc-400">
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Derniers articles modifiés
        </h2>
        <RecentArticlesTable articles={data.recentArticles} />
        {data.totalContenus > RECENT_ARTICLES_LIMIT && (
          <p className="mt-3">
            <Link
              href="/admin/articles"
              className="text-sm text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Voir tous les articles
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
