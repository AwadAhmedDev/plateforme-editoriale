import Link from "next/link";
import { getDashboardData, RECENT_ARTICLES_LIMIT } from "@/features/admin-dashboard/get-dashboard-data";
import { RecentArticlesTable } from "@/features/admin-dashboard/recent-articles-table";
import { AdminIcon } from "@/features/admin-navigation/admin-sidebar";

// Dashboard administrateur (ui-specification.md §Dashboard) : Server Component pur, lecture
// seule via getDashboardData. Chaque carte mène à la liste correspondante, déjà filtrée.
export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  const statsPrincipales = [
    { label: "Articles publiés", value: data.publies, href: "/admin/articles?statut=publie", tone: "text-green-600 bg-green-50 dark:bg-green-950" },
    { label: "Brouillons", value: data.brouillons, href: "/admin/articles?statut=brouillon", tone: "text-amber-600 bg-amber-50 dark:bg-amber-950" },
    { label: "Inscrits newsletter", value: data.totalInscrits, href: "/admin/newsletter", tone: "text-sky-600 bg-sky-50 dark:bg-sky-950" },
  ] as const;

  const statsSecondaires = [
    { label: "Contenus éditoriaux", value: data.totalContenus, href: "/admin/articles" },
    { label: "Archivés", value: data.archives, href: "/admin/articles?statut=archive" },
    { label: "Catégories", value: data.totalCategories, href: "/admin/categories" },
    { label: "Zones géographiques", value: data.totalZones, href: "/admin/categories" },
  ];

  const aujourdhui = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm capitalize text-zinc-500 dark:text-zinc-400">{aujourdhui}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Tableau de bord</h1>
        </div>
        <Link href="/admin/articles/nouveau" className="admin-btn-primary self-start sm:self-auto">
          + Nouvel article
        </Link>
      </div>

      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statsPrincipales.map((stat) => (
          <Link key={stat.label} href={stat.href} className="admin-card group flex items-center gap-4 p-5 hover:border-zinc-300 hover:shadow-md dark:hover:border-zinc-700">
            <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${stat.tone}`}>
              <AdminIcon name={stat.label === "Inscrits newsletter" ? "newsletter" : "articles"} />
            </span>
            <div className="min-w-0">
              <dd className="text-3xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">{stat.value}</dd>
              <dt className="text-sm text-zinc-500 group-hover:text-zinc-700 dark:text-zinc-400 dark:group-hover:text-zinc-200">
                {stat.label}
              </dt>
            </div>
          </Link>
        ))}
      </dl>

      <dl className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statsSecondaires.map((stat) => (
          <Link key={stat.label} href={stat.href} className="admin-card px-5 py-4 hover:border-zinc-300 dark:hover:border-zinc-700">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{stat.label}</dt>
            <dd className="mt-1 text-xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">{stat.value}</dd>
          </Link>
        ))}
      </dl>

      <section className="admin-card mt-8 overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Derniers articles modifiés</h2>
          {data.totalContenus > RECENT_ARTICLES_LIMIT && (
            <Link href="/admin/articles" className="text-sm font-medium text-accent-primary hover:text-accent-primary-hover">
              Voir tous les articles →
            </Link>
          )}
        </div>
        <RecentArticlesTable articles={data.recentArticles} />
      </section>
    </main>
  );
}
