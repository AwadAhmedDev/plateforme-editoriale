import { listSubscribers } from "@/features/newsletter/list-subscribers";
import { SubscriberTable } from "@/features/newsletter/subscriber-table";

// Gestion newsletter MVP (sitemap.md, api-contracts.md §4.4, server-actions-specification.md
// §8) : liste paginée (20 lignes, obligatoire — cf. analyse documentaire) + filtre e-mail
// + retrait conditionné par Modal. Route dédiée, distincte de Gestion des catégories/zones
// (contrairement à ces dernières, la documentation ne fusionne jamais Newsletter avec un
// autre écran).
export default async function AdminNewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; email?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const email = params.email?.trim() || undefined;

  const result = await listSubscribers({ page, email });

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <h1 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-50">Gestion newsletter</h1>

      <SubscriberTable
        subscribers={result.items}
        total={result.total}
        hasNextPage={result.hasNextPage}
        page={result.page}
        emailFilter={email ?? ""}
      />
    </main>
  );
}
