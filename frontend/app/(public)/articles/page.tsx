import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/shared/article-card";
import { PaginationLinks } from "@/components/shared/pagination-links";
import { PublicFilters, lireFiltresListing, filtresAppliques } from "@/components/shared/public-filters";
import { getArticlesPage } from "@/features/articles/get-articles-page";
import { listCategorieMenu } from "@/features/taxonomies/list-categorie-menu";
import { listZoneMenu } from "@/features/taxonomies/list-zone-menu";
import { urlAvecPageEtFiltres } from "@/lib/pagination";
import { resoudreSiteUrl } from "@/lib/site-url";
import { serializeJsonLd } from "@/lib/json-ld";

type ArticlesPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// Route Articles (rétablissement post-RC-1, révision d'architecture : sitemap.md
// documente cette page comme une vue exhaustive et navigable de l'ensemble des contenus
// publiés, indépendamment d'une recherche ciblée — US-002, US-004) : symétrique de
// app/(public)/categorie/[slug]/page.tsx et app/(public)/zone/[slug]/page.tsx. Lecture via
// getArticlesPage uniquement — aucun accès repository direct ici. Pagination `?page=N`
// (Lot 1A) : `generateMetadata` lit désormais `searchParams` (cette route devient
// dynamique — searchParams est une Request-time API, comme /recherche), canonical
// auto-référent par page via urlAvecPage (jamais `?page=1` explicite). Eyebrow "Articles"
// et H1 "Tous les articles" : constantes (pas de nom d'instance à projeter, contrairement
// au kicker "Rubrique"/"Pays" des pages Catégorie/Pays).
//
// SEO des URLs filtrées (Lot Filtres) : `noindex, follow` dès qu'un filtre est actif,
// canonical auto-référent filtres compris — mêmes règles que /categorie et /zone.
export async function generateMetadata({ searchParams }: ArticlesPageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const filtres = lireFiltresListing(resolvedSearchParams);
  const filtresUrl = filtresAppliques(filtres);
  const estFiltree = Object.keys(filtresUrl).length > 0;

  // Contrairement à /categorie et /zone, cette fonction n'appelle pas la feature : le
  // titre est constant et le canonical se construit depuis les seuls searchParams. La
  // page servie ne peut donc pas être connue ici — la page demandée suffit, une page hors
  // bornes n'ayant de toute façon pas de métadonnée à publier (404 côté page).
  return {
    title: "Tous les articles",
    ...(estFiltree ? { robots: { index: false, follow: true } } : {}),
    alternates: {
      canonical: urlAvecPageEtFiltres("/articles", filtres.page, filtresUrl),
    },
  };
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const resolvedSearchParams = await searchParams;
  const filtres = lireFiltresListing(resolvedSearchParams);
  const pageDemandee = filtres.page;

  const [{ count, page, hasNextPage, articles }, categories, zones] = await Promise.all([
    getArticlesPage(filtres),
    listCategorieMenu(),
    listZoneMenu(),
  ]);

  // Page bien formée (entière, >= 1) mais hors bornes : le repository l'a déjà clampée à
  // la dernière page existante (`page` != `pageDemandee`) — notFound() plutôt que
  // d'afficher silencieusement un contenu qui ne correspond pas à l'URL demandée (Lot 1A).
  if (page !== pageDemandee) {
    notFound();
  }

  const filtresUrl = filtresAppliques(filtres);
  const estFiltree = Object.keys(filtresUrl).length > 0;

  // JSON-LD (Lot L12, contrat validé) : CollectionPage + ItemList imbriqué (mainEntity) —
  // omis entièrement si la liste est vide, jamais un ItemList déclaré sans élément. `url`
  // reflète la page courante (Lot 1A), cohérent avec le canonical de generateMetadata.
  // Également omis dès qu'un filtre est actif (Lot Filtres) : ne pas décrire une
  // collection qu'on demande simultanément de ne pas indexer.
  const siteUrl = resoudreSiteUrl();
  const absoluteUrl = (path: string) => new URL(path, siteUrl).toString();

  const collectionPageJsonLd =
    articles.length > 0 && !estFiltree
      ? {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Tous les articles",
          url: absoluteUrl(urlAvecPageEtFiltres("/articles", page, filtresUrl)),
          mainEntity: {
            "@type": "ItemList",
            itemListElement: articles.map((article, index) => ({
              "@type": "ListItem",
              position: index + 1,
              url: absoluteUrl(`/articles/${article.slug}`),
            })),
          },
        }
      : null;

  return (
    <>
      {collectionPageJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(collectionPageJsonLd) }}
        />
      )}
      <main className="mx-auto w-full max-w-[1220px] flex-1 px-5 py-8 lg:px-[28px]">
        <div className="border-b-2 border-text-primary pb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[.16em] text-accent-primary">Articles</p>
          <h1 className="font-editorial text-4xl">Tous les articles</h1>
          <p className="mt-2 text-sm text-text-secondary">
            {count} publication{count > 1 ? "s" : ""}
          </p>
        </div>

        {/* Filtres (ui-specification.md §Comportement des filtres, api-contracts.md §3.2) :
            les quatre axes, aucune dimension n'étant donnée par la route sur cette page,
            contrairement à /categorie et /zone. */}
        <PublicFilters
          basePath="/articles"
          axes={["categorie", "zone", "type", "date"]}
          valeurs={{
            categorie: filtres.categorieSlug,
            zone: filtres.zoneSlug,
            type: filtres.typeContenu,
            du: filtres.du,
            au: filtres.au,
          }}
          categories={categories}
          zones={zones}
        />

        {articles.length > 0 ? (
          <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <h2 className="sr-only">Liste des articles</h2>
            {articles.map((article) => (
              <ArticleCard
                key={article.slug}
                slug={article.slug}
                titre={article.titre}
                chapo={article.chapo}
                imagePrincipaleUrl={article.imagePrincipaleUrl}
                imageAltText={article.imageAltText}
                categorieNom={article.categorieNom}
                categorieSlug={article.categorieSlug}
                zoneNom={article.zoneNom}
                zoneSlug={article.zoneSlug}
                auteur={article.auteur}
                datePublication={article.datePublication}
                tempsLecture={article.tempsLecture}
              />
            ))}
          </div>
        ) : estFiltree ? (
          /* Deux états vides distincts (ui-specification.md §États vides), l'action de
             reprise en main étant assurée par le lien de réinitialisation du formulaire. */
          <p className="mt-7 text-text-secondary">Aucun article ne correspond à ces critères.</p>
        ) : (
          <p className="mt-7 text-text-secondary">Aucun article publié pour le moment.</p>
        )}

        <PaginationLinks
          basePath="/articles"
          currentPage={page}
          hasNextPage={hasNextPage}
          preserveParams={filtresUrl}
        />
      </main>
    </>
  );
}
