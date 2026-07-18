import Link from "next/link";
import { getDashboardData } from "@/features/admin-dashboard/get-dashboard-data";

// Dashboard administrateur MVP (api-contracts.md §2.5, réduit au périmètre validé pour
// cette itération : 7 comptages statiques uniquement — pas de sidebar, pas de table des
// derniers articles, pas d'action rapide avancée, cf. validation de mission). Server
// Component pur, lecture seule via getDashboardData. Le lien « Gestion des articles »
// (Lot 12) est le seul point d'entrée de navigation ajouté ici — un lien minimal, pas la
// Sidebar administrateur (220px, Dashboard/Articles/Catégories/Newsletter) prévue par
// ui-specification.md §Navigation secondaire, qui reste un lot séparé.
export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  const stats: { label: string; value: number }[] = [
    { label: "Contenus éditoriaux", value: data.totalContenus },
    { label: "Catégories", value: data.totalCategories },
    { label: "Zones géographiques", value: data.totalZones },
    { label: "Inscrits newsletter", value: data.totalInscrits },
    { label: "Brouillons", value: data.brouillons },
    { label: "Publiés", value: data.publies },
    { label: "Archivés", value: data.archives },
  ];

  return (
    <main className="p-7">
      <h1 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Dashboard administrateur
      </h1>

      <p className="mb-6">
        <Link
          href="/admin/articles"
          className="text-sm font-medium text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-100"
        >
          Gestion des articles →
        </Link>
      </p>

      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {stats.map((stat) => (
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
    </main>
  );
}
