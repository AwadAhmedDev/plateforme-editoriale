import type { Metadata } from "next";
import { ArticleSearchResultCard } from "@/components/articles/article-search-result-card";
import { searchArticles } from "@/features/articles/search-articles";
import { listCategorieMenu } from "@/features/taxonomies/list-categorie-menu";
import { listZoneMenu } from "@/features/taxonomies/list-zone-menu";
import { TYPE_CONTENU_LABELS } from "@/features/articles/type-contenu-labels";

// Recherche publique (Lot L9, étendue en L11, contrat validé) : une seule
// route, formulaire GET natif (aucun JavaScript, aucun composant client).
// searchParams est une Request-time API (documentation Next.js) : cette
// page est rendue dynamiquement à la requête. Filtres catégorie/zone/type
// ajoutés en L11 (mêmes options que le champ q — combinables librement,
// aucune date, aucune pagination, aucun contenu premium). Canonical fixe
// conservé (/recherche, sans query string) — décision L11 validée : les
// combinaisons de filtres sont des résultats utilisateur, pas des pages
// éditoriales permanentes.
export const metadata: Metadata = {
  title: "Recherche",
  alternates: {
    canonical: "/recherche",
  },
};

function lireParam(value: string | string[] | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

export default async function RecherchePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const q = lireParam(resolvedSearchParams.q);
  const categorieSlug = lireParam(resolvedSearchParams.categorie);
  const zoneSlug = lireParam(resolvedSearchParams.zone);
  const typeContenu = lireParam(resolvedSearchParams.type);

  // Aucun critère soumis (ni q, ni aucun filtre) : aucun appel à
  // searchArticles, formulaire seul — distinct de "critères soumis, zéro
  // résultat" (articles === []). Un filtre seul, sans q, déclenche
  // désormais une recherche (décision L11 validée).
  const aUnCritere = q.length > 0 || categorieSlug.length > 0 || zoneSlug.length > 0 || typeContenu.length > 0;

  const [articles, categories, zones] = await Promise.all([
    aUnCritere
      ? searchArticles({
          q: q || undefined,
          categorieSlug: categorieSlug || undefined,
          zoneSlug: zoneSlug || undefined,
          typeContenu: typeContenu || undefined,
        })
      : Promise.resolve(null),
    listCategorieMenu(),
    listZoneMenu(),
  ]);

  return (
    <main className="mx-auto w-full max-w-[800px] flex-1 px-5 py-8 lg:px-15">
      <h1 className="font-editorial text-3xl">Recherche</h1>

      <form action="/recherche" method="GET" className="mt-6 flex flex-col gap-4">
        <div className="flex gap-2">
          <label htmlFor="q" className="sr-only">
            Mots-clés
          </label>
          <input
            type="text"
            id="q"
            name="q"
            defaultValue={q}
            placeholder="Rechercher un article..."
            className="flex-1 rounded-sm border border-border px-3 py-2 text-sm outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
          />
          <button
            type="submit"
            className="rounded-sm bg-accent-warm px-5 py-2 text-sm font-medium text-white outline-none transition-colors duration-[120ms] hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
          >
            Rechercher
          </button>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="categorie" className="font-meta text-[13px] text-text-secondary">
              Rubrique
            </label>
            <select
              id="categorie"
              name="categorie"
              defaultValue={categorieSlug}
              className="rounded-sm border border-border px-3 py-2 text-sm outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
            >
              <option value="">Toutes les rubriques</option>
              {categories.map((categorie) => (
                <option key={categorie.slug} value={categorie.slug}>
                  {categorie.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="zone" className="font-meta text-[13px] text-text-secondary">
              Pays
            </label>
            <select
              id="zone"
              name="zone"
              defaultValue={zoneSlug}
              className="rounded-sm border border-border px-3 py-2 text-sm outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
            >
              <option value="">Tous les pays</option>
              {zones.map((zone) => (
                <option key={zone.slug} value={zone.slug}>
                  {zone.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="type" className="font-meta text-[13px] text-text-secondary">
              Type de contenu
            </label>
            <select
              id="type"
              name="type"
              defaultValue={typeContenu}
              className="rounded-sm border border-border px-3 py-2 text-sm outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
            >
              <option value="">Tous les types</option>
              {Object.entries(TYPE_CONTENU_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
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
