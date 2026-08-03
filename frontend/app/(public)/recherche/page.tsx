import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleSearchResultCard } from "@/components/articles/article-search-result-card";
import { PaginationLinks } from "@/components/shared/pagination-links";
import { searchArticles } from "@/features/articles/search-articles";
import { listCategorieMenu } from "@/features/taxonomies/list-categorie-menu";
import { listZoneMenu } from "@/features/taxonomies/list-zone-menu";
import { TYPE_CONTENU_LABELS } from "@/features/articles/type-contenu-labels";
import { normaliserPageDemandee } from "@/lib/pagination";
import { lireParam, normaliserJour } from "@/lib/filtres-publics";

// Recherche publique (REPO-6, refonte layout : Corne de l'Afrique.dc.html l.292-355) :
// une seule route, formulaire GET natif (aucun JavaScript, aucun composant client).
// searchParams est une Request-time API : cette page est rendue dynamiquement à la
// requête. Layout sidebar (290px) + résultats, remplace l'ancienne ligne de champs
// pleine largeur — champs combinables librement, aucun contenu premium. Bornes de date
// `du`/`au` ajoutées au Lot 2A (US-023) : le filtrage par date est désormais complet.
// Pagination `?page=N` (Lot 1A) : canonical fixe INCHANGÉ (/recherche, sans query
// string, y compris pour page > 1) — décision déjà prise avant ce lot et simplement
// reconduite : `page` n'est qu'une dimension de plus parmi les combinaisons de filtres,
// déjà toutes traitées comme des résultats utilisateur, jamais des pages éditoriales
// permanentes individuellement indexables.
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

// Mêmes constantes, mêmes valeurs et même rôle que dans public-filters.tsx : les deux
// surfaces de filtrage partagent une seule direction visuelle. Elles restent dupliquées
// plutôt que remontées dans un module commun — la sidebar et la ligne horizontale sont
// volontairement non partagées (cf. commentaire de PublicFilters) et n'ont pas vocation à
// être couplées par un import.
//
// `h-11` : hauteur unique pour `<input>`, `<select>` et `<input type="date">`, qui ne se
// calent pas spontanément à l'identique — et cible tactile de 44px.
// `min-w-0` : sans lui, un `<input type="date">` refuse de descendre sous sa largeur
// intrinsèque native et fait déborder sa grille.
const LABEL = "mb-1.5 block text-[11px] font-semibold uppercase tracking-[.12em] text-text-secondary";
const SOUS_LABEL = "mb-1 block text-[12px] text-text-secondary";
const CHAMP =
  "h-11 w-full min-w-0 rounded-md border border-border bg-bg-primary px-3 text-sm outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary";

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
  const pageDemandee = normaliserPageDemandee(resolvedSearchParams.page);

  // Bornes de date (Lot 2A, US-023) : normalisées ici via la règle de validation exportée
  // par search-articles.ts, jamais revalidées localement. Une borne rejetée devient
  // `undefined` et disparaît donc du champ réaffiché comme des liens de pagination — la
  // page n'affiche jamais un filtre qui n'a pas été appliqué.
  const du = normaliserJour(lireParam(resolvedSearchParams.du));
  const au = normaliserJour(lireParam(resolvedSearchParams.au));

  // Aucun critère soumis (ni q, ni aucun filtre) : affiche tout le contenu Publié,
  // trié "Plus récent" par défaut — comportement conforme au design (Corne de
  // l'Afrique.dc.html : "Recherche documentaire" affiche déjà 14 résultats à l'arrivée
  // sur la page, filtres tous sur "Tous/Toutes"). Un filtre seul, sans q, s'applique
  // normalement (décision L11 déjà validée) ; le tri s'applique lui aussi sans qu'aucun
  // autre critère ne soit requis, cohérent avec ce même principe.
  const [{ items: articles, page, hasNextPage }, categories, zones] = await Promise.all([
    searchArticles({
      q: q || undefined,
      categorieSlug: categorieSlug || undefined,
      zoneSlug: zoneSlug || undefined,
      typeContenu: typeContenu || undefined,
      sort: sort || undefined,
      dateFrom: du,
      dateTo: au,
      page: pageDemandee,
    }),
    listCategorieMenu(),
    listZoneMenu(),
  ]);

  // Page bien formée (entière, >= 1) mais hors bornes pour cette combinaison de filtres :
  // le repository l'a déjà clampée à la dernière page existante (`page` !=
  // `pageDemandee`) — notFound() plutôt que d'afficher silencieusement un résultat qui ne
  // correspond pas à l'URL demandée (Lot 1A).
  if (page !== pageDemandee) {
    notFound();
  }

  // Filtres actifs à reporter sur les liens Précédent/Suivant — jamais une valeur vide
  // dans preserveParams (produirait des URLs du type "?q=&page=2").
  const preserveParams: Record<string, string> = {};
  if (q) preserveParams.q = q;
  if (categorieSlug) preserveParams.categorie = categorieSlug;
  if (zoneSlug) preserveParams.zone = zoneSlug;
  if (typeContenu) preserveParams.type = typeContenu;
  if (sort) preserveParams.sort = sort;
  if (du) preserveParams.du = du;
  if (au) preserveParams.au = au;

  return (
    <main className="mx-auto w-full max-w-[1220px] flex-1 px-5 py-8 lg:px-[28px]">
      <h1 className="mb-5 font-editorial text-[28px] font-bold sm:text-[34px]">Recherche documentaire</h1>

      <div className="grid gap-8 lg:grid-cols-[290px_1fr] lg:items-start lg:gap-9">
        {/* Le formulaire n'est une sidebar de 290px qu'à partir de `lg` : en deçà il occupe
            toute la largeur. Sa largeur utile n'est donc PAS monotone avec celle du
            viewport, ce qui gouverne la grille des dates plus bas. */}
        <form
          action="/recherche"
          method="GET"
          className="flex flex-col gap-5 rounded-[8px] border border-border bg-bg-secondary p-4 sm:p-[22px] lg:sticky lg:top-[var(--header-height,10.5rem)] lg:max-h-[calc(100vh_-_var(--header-height,10.5rem)_-_1.5rem)] lg:overflow-y-auto"
        >
          <div>
            <label htmlFor="q" className={LABEL}>
              Mot-clé
            </label>
            <input
              type="text"
              id="q"
              name="q"
              defaultValue={q}
              placeholder="Rechercher un sujet…"
              className={CHAMP}
            />
          </div>

          <div>
            <label htmlFor="zone" className={LABEL}>
              Pays
            </label>
            <select
              id="zone"
              name="zone"
              defaultValue={zoneSlug}
              className={CHAMP}
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
            <label htmlFor="categorie" className={LABEL}>
              Rubrique
            </label>
            <select
              id="categorie"
              name="categorie"
              defaultValue={categorieSlug}
              className={CHAMP}
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
            <label htmlFor="type" className={LABEL}>
              Type de contenu
            </label>
            <select
              id="type"
              name="type"
              defaultValue={typeContenu}
              className={CHAMP}
            >
              <option value="">Tous les types</option>
              {Object.entries(TYPE_CONTENU_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Bornes de date (Lot 2A, US-023) — dernier critère d'acceptation manquant de
              US-023, et dernier axe de filtrage listé par sitemap.md §Recherche. Regroupées
              dans un <fieldset> avec <legend> : les deux champs forment une seule plage, pas
              deux filtres indépendants, et c'est le seul patron qui l'annonce à un lecteur
              d'écran (chaque champ garde par ailleurs son propre <label>). `<input
              type="date">` plutôt qu'un composant de calendrier : le formulaire reste un GET
              natif sans JavaScript, comme le reste de cette page (REPO-6). */}
          <fieldset>
            <legend className={LABEL}>Date de publication</legend>
            {/* Grille non monotone, à l'image du conteneur (cf. commentaire du <form>) :
                empilée sous `sm` (deux champs date natifs collés et débordants à 375px),
                côte à côte de `sm` à `lg` où le formulaire occupe toute la largeur, puis
                de nouveau empilée à partir de `lg` — la sidebar n'y fait plus que 290px,
                soit ~117px par colonne, sous la largeur intrinsèque d'un champ date. */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="min-w-0">
                <label htmlFor="du" className={SOUS_LABEL}>
                  Du
                </label>
                <input type="date" id="du" name="du" defaultValue={du} className={CHAMP} />
              </div>
              <div className="min-w-0">
                <label htmlFor="au" className={SOUS_LABEL}>
                  Au
                </label>
                <input type="date" id="au" name="au" defaultValue={au} className={CHAMP} />
              </div>
            </div>
          </fieldset>

          <div>
            <label htmlFor="sort" className={LABEL}>
              Trier par
            </label>
            <select
              id="sort"
              name="sort"
              defaultValue={sort || "recent"}
              className={CHAMP}
            >
              <option value="recent">Plus récent</option>
              <option value="long">Lecture la plus longue</option>
            </select>
          </div>

          {/* Les deux actions partagent une ligne dès `sm` (le formulaire y est encore
              pleine largeur, les empiler y gaspillerait deux hauteurs de bouton), et
              repassent l'une sous l'autre en sidebar `lg`, où la largeur ne suffit plus. */}
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <button
              type="submit"
              className="h-11 rounded-md bg-accent-primary px-4 text-sm font-semibold text-white outline-none transition-colors duration-fast hover:bg-accent-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary sm:flex-1 lg:flex-none"
            >
              Rechercher
            </button>

            <Link
              href="/recherche"
              className="inline-flex h-11 items-center justify-center rounded-md border border-border px-4 text-center text-[13px] text-text-secondary outline-none transition-colors duration-fast hover:border-accent-primary hover:text-accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary sm:flex-1 lg:flex-none"
            >
              Réinitialiser les filtres
            </Link>
          </div>
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

          <PaginationLinks basePath="/recherche" currentPage={page} hasNextPage={hasNextPage} preserveParams={preserveParams} />
        </div>
      </div>
    </main>
  );
}
