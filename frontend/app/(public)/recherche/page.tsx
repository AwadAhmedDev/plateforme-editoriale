import type { Metadata } from "next";
import { ArticleSearchResultCard } from "@/components/articles/article-search-result-card";
import { searchArticles } from "@/features/articles/search-articles";

// Recherche publique (Lot L9, contrat validé) : une seule route, formulaire
// GET natif (aucun JavaScript, aucun composant client). searchParams est
// une Request-time API (documentation Next.js) : cette page est rendue
// dynamiquement à la requête, seule page publique dans ce cas à ce jour.
// Aucun filtre (catégorie/zone/date/type), aucune pagination, aucun contenu
// premium — recherche par mot-clé q uniquement.
export const metadata: Metadata = {
  title: "Recherche",
  alternates: {
    canonical: "/recherche",
  },
};

export default async function RecherchePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const rawQ = resolvedSearchParams.q;
  const q = typeof rawQ === "string" ? rawQ.trim() : "";

  // Aucune requête soumise : aucun appel à searchArticles, formulaire seul —
  // distinct de "requête soumise, zéro résultat" (articles === []).
  const articles = q.length > 0 ? await searchArticles(q) : null;

  return (
    <main className="mx-auto w-full max-w-[800px] flex-1 px-5 py-8 lg:px-15">
      <h1 className="font-editorial text-3xl">Recherche</h1>

      <form action="/recherche" method="GET" className="mt-6 flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Rechercher un article..."
          className="flex-1 rounded-sm border border-border px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-sm bg-accent-warm px-5 py-2 text-sm font-medium text-white transition-colors duration-[120ms] hover:opacity-90"
        >
          Rechercher
        </button>
      </form>

      {articles !== null && (
        <div className="mt-8">
          {articles.length > 0 ? (
            articles.map((article) => <ArticleSearchResultCard key={article.slug} {...article} />)
          ) : (
            <p className="text-text-secondary">Aucun article ne correspond à ces critères.</p>
          )}
        </div>
      )}
    </main>
  );
}
