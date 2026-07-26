import type { Metadata } from "next";
import Link from "next/link";
import { ArticleSearchResultCard } from "@/components/articles/article-search-result-card";
import { searchArticles } from "@/features/articles/search-articles";
import { listCategorieMenu } from "@/features/taxonomies/list-categorie-menu";
import { listZoneMenu } from "@/features/taxonomies/list-zone-menu";
import { TYPE_CONTENU_LABELS } from "@/features/articles/type-contenu-labels";

// Recherche publique (REPO-6, refonte layout : Corne de l'Afrique.dc.html l.292-355) :
// une seule route, formulaire GET natif (aucun JavaScript, aucun composant client).
// searchParams est une Request-time API : cette page est rendue dynamiquement à la
// requête. Layout sidebar (290px) + résultats, remplace l'ancienne ligne de champs
// pleine largeur — champs combinables librement, aucune date, aucune pagination, aucun
// contenu premium. Canonical fixe conservé (/recherche, sans query string) : les
// combinaisons de filtres sont des résultats utilisateur, pas des pages éditoriales
// permanentes.
//
// Sidebar sticky en desktop (conforme au design, qui la fixe à `top:150px`) — mais
// jamais avec cette valeur codée en dur : le header REPO-3 n'a plus de hauteur fixe
// unique (bandeaux empilés, bandeau Pays parfois absent), un offset statique
// reproduirait exactement le bug déjà corrigé sur ShareBar (REPO-5, D5). L'offset
// `top-[var(--header-height,10.5rem)]` est republié en direct par HeaderHeightSync
// (rendu une fois dans PublicHeader) à chaque changement réel de la hauteur du header —
// la valeur de repli (10.5rem) ne sert qu'avant l'hydratation ou si JavaScript est
// désactivé, jamais comme source de vérité.
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
  const sort = lireParam(resolvedSearchParams.sort);

  // Aucun critère soumis (ni q, ni aucun filtre) : affiche tout le contenu Publié,
  // trié "Plus récent" par défaut — comportement conforme au design (Corne de
  // l'Afrique.dc.html : "Recherche documentaire" affiche déjà 14 résultats à l'arrivée
  // sur la page, filtres tous sur "Tous/Toutes"). Un filtre seul, sans q, s'applique
  // normalement (décision L11 déjà validée) ; le tri s'applique lui aussi sans qu'aucun
  // autre critère ne soit requis, cohérent avec ce même principe.
  const [articles, categories, zones] = await Promise.all([
    searchArticles({
      q: q || undefined,
      categorieSlug: categorieSlug || undefined,
      zoneSlug: zoneSlug || undefined,
      typeContenu: typeContenu || undefined,
      sort: sort || undefined,
    }),
    listCategorieMenu(),
    listZoneMenu(),
  ]);

  return (
    <main className="mx-auto w-full max-w-[1220px] flex-1 px-5 py-8 lg:px-[28px]">
      <h1 className="mb-5 font-editorial text-[34px] font-bold">Recherche documentaire</h1>

      <div className="grid gap-8 lg:grid-cols-[290px_1fr] lg:items-start lg:gap-9">
        <form
          action="/recherche"
          method="GET"
          className="flex flex-col gap-5 rounded-[8px] border border-border bg-bg-secondary p-[22px] lg:sticky lg:top-[var(--header-height,10.5rem)] lg:max-h-[calc(100vh_-_var(--header-height,10.5rem)_-_1.5rem)] lg:overflow-y-auto"
        >
          <div>
            <label htmlFor="q" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[.12em] text-text-secondary">
              Mot-clé
            </label>
            <input
              type="text"
              id="q"
              name="q"
              defaultValue={q}
              placeholder="Rechercher un sujet…"
              className="w-full rounded-md border border-border bg-bg-primary px-3 py-2.5 text-sm outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
            />
          </div>

          <div>
            <label htmlFor="zone" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[.12em] text-text-secondary">
              Pays
            </label>
            <select
              id="zone"
              name="zone"
              defaultValue={zoneSlug}
              className="w-full rounded-md border border-border bg-bg-primary px-3 py-2.5 text-sm outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
            >
              <option value="">Tous les pays</option>
              {zones.map((zone) => (
                <option key={zone.slug} value={zone.slug}>
                  {zone.nom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="categorie" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[.12em] text-text-secondary">
              Rubrique
            </label>
            <select
              id="categorie"
              name="categorie"
              defaultValue={categorieSlug}
              className="w-full rounded-md border border-border bg-bg-primary px-3 py-2.5 text-sm outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
            >
              <option value="">Toutes les rubriques</option>
              {categories.map((categorie) => (
                <option key={categorie.slug} value={categorie.slug}>
                  {categorie.nom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="type" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[.12em] text-text-secondary">
              Type de contenu
            </label>
            <select
              id="type"
              name="type"
              defaultValue={typeContenu}
              className="w-full rounded-md border border-border bg-bg-primary px-3 py-2.5 text-sm outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
            >
              <option value="">Tous les types</option>
              {Object.entries(TYPE_CONTENU_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="sort" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[.12em] text-text-secondary">
              Trier par
            </label>
            <select
              id="sort"
              name="sort"
              defaultValue={sort || "recent"}
              className="w-full rounded-md border border-border bg-bg-primary px-3 py-2.5 text-sm outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
            >
              <option value="recent">Plus récent</option>
              <option value="long">Lecture la plus longue</option>
            </select>
          </div>

          <button
            type="submit"
            className="rounded-md bg-accent-primary px-4 py-2.5 text-sm font-semibold text-white outline-none transition-colors duration-fast hover:bg-accent-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
          >
            Rechercher
          </button>

          <Link
            href="/recherche"
            className="rounded-md border border-border py-2.5 text-center text-[13px] text-text-secondary outline-none transition-colors duration-fast hover:border-accent-primary hover:text-accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
          >
            Réinitialiser les filtres
          </Link>
        </form>

        <div>
          <p className="mb-4 text-[13px] text-text-secondary">
            {articles.length} résultat{articles.length > 1 ? "s" : ""}
          </p>

          {articles.length > 0 ? (
            <div className="flex flex-col">
              {articles.map((article) => (
                <ArticleSearchResultCard key={article.slug} {...article} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-text-secondary">
              <p className="font-editorial text-xl">Aucun résultat pour ces critères.</p>
              <p className="mt-2 text-sm">Essayez d&apos;élargir votre recherche.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
