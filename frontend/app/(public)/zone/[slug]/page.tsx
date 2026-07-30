import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/shared/article-card";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { PaginationLinks } from "@/components/shared/pagination-links";
import { PublicFilters, lireFiltresListing, filtresAppliques } from "@/components/shared/public-filters";
import { getZonePage } from "@/features/taxonomies/get-zone-page";
import { listCategorieMenu } from "@/features/taxonomies/list-categorie-menu";
import { urlAvecPageEtFiltres } from "@/lib/pagination";
import { resoudreSiteUrl } from "@/lib/site-url";
import { serializeJsonLd } from "@/lib/json-ld";

type ZonePageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// `zone` est retirée des filtres appliqués : le pays est donné par la route, un `?zone=`
// dans l'URL ne doit jamais le contredire ni polluer canonical et pagination.
function filtresDeLaPage(filtres: ReturnType<typeof lireFiltresListing>): Record<string, string> {
  const { zone: _ignore, ...params } = filtresAppliques(filtres);
  return params;
}

// Route Pays (clôture RC-1 : alignement sur le gabarit de listing du design, Corne de
// l'Afrique.dc.html l.265-289, section isListing/listType:'country') : symétrique de
// app/(public)/categorie/[slug]/page.tsx. Lecture via getZonePage uniquement — aucun
// accès repository direct ici. Pagination `?page=N` (Lot 1A) : canonical auto-référent
// par page via urlAvecPage (jamais `?page=1` explicite). Kicker "Pays" repris
// littéralement du design (constante, cf. categorie/[slug]/page.tsx).
export async function generateMetadata({ params, searchParams }: ZonePageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const filtres = lireFiltresListing(resolvedSearchParams);
  const zone = await getZonePage(slug, filtres);

  if (!zone) {
    return {};
  }

  const filtresUrl = filtresDeLaPage(filtres);
  const estFiltree = Object.keys(filtresUrl).length > 0;

  return {
    title: zone.nom,
    ...(zone.descriptionCourte ? { description: zone.descriptionCourte } : {}),
    ...(estFiltree ? { robots: { index: false, follow: true } } : {}),
    alternates: {
      canonical: urlAvecPageEtFiltres(`/zone/${slug}`, zone.page, filtresUrl),
    },
  };
}

export default async function ZonePage({ params, searchParams }: ZonePageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const filtres = lireFiltresListing(resolvedSearchParams);
  const pageDemandee = filtres.page;

  // Arguments strictement identiques à ceux de generateMetadata : getZonePage est
  // mémoïsée, donc un seul accès base de données pour les deux appels de ce rendu.
  const [zone, categories] = await Promise.all([getZonePage(slug, filtres), listCategorieMenu()]);

  if (!zone) {
    notFound();
  }

  // Page bien formée (entière, >= 1) mais hors bornes : le repository l'a déjà clampée à
  // la dernière page existante (`zone.page` != `pageDemandee`) — notFound() plutôt que
  // d'afficher silencieusement un contenu qui ne correspond pas à l'URL demandée (Lot 1A).
  // Distinct du notFound() ci-dessus (slug inconnu) : même mécanisme Next.js (nearest
  // not-found.tsx), deux causes différentes.
  if (zone.page !== pageDemandee) {
    notFound();
  }

  const filtresUrl = filtresDeLaPage(filtres);
  const estFiltree = Object.keys(filtresUrl).length > 0;

  // JSON-LD (Lot L12, contrat validé) : CollectionPage + ItemList imbriqué
  // (mainEntity) — omis entièrement si la zone n'a aucun article publié,
  // jamais un ItemList déclaré sans élément. `url` reflète la page courante (Lot 1A),
  // cohérent avec le canonical de generateMetadata. Également omis dès qu'un filtre est
  // actif (Lot Filtres) : ne pas décrire une collection qu'on demande de ne pas indexer.
  // Le BreadcrumbList reste inconditionnel.
  const siteUrl = resoudreSiteUrl();
  const absoluteUrl = (path: string) => new URL(path, siteUrl).toString();

  const collectionPageJsonLd =
    zone.articles.length > 0 && !estFiltree
      ? {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: zone.nom,
          url: absoluteUrl(urlAvecPageEtFiltres(`/zone/${slug}`, zone.page, filtresUrl)),
          mainEntity: {
            "@type": "ItemList",
            itemListElement: zone.articles.map((article, index) => ({
              "@type": "ListItem",
              position: index + 1,
              url: absoluteUrl(`/articles/${article.slug}`),
            })),
          },
        }
      : null;

  // BreadcrumbList (Lot 2B) : émis inconditionnellement, contrairement au CollectionPage
  // ci-dessus qui reste omis sur un pays sans article publié (décision L12) — un fil
  // d'Ariane reste valide sur un pays vide. Symétrique de categorie/[slug]/page.tsx.
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: zone.breadcrumb.map((segment, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: segment.label,
      ...(segment.href ? { item: absoluteUrl(segment.href) } : {}),
    })),
  };

  return (
    <>
      {collectionPageJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(collectionPageJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <main className="mx-auto w-full max-w-[1220px] flex-1 px-5 py-8 lg:px-[28px]">
        <Breadcrumb items={zone.breadcrumb} />

        <div className="mt-4 border-b-2 border-text-primary pb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[.16em] text-accent-primary">Pays</p>
          <h1 className="font-editorial text-4xl">{zone.nom}</h1>
          <p className="mt-2 text-sm text-text-secondary">
            {zone.count} publication{zone.count > 1 ? "s" : ""}
          </p>
        </div>

        {/* Filtres secondaires (ui-specification.md §Comportement des filtres,
            api-contracts.md §3.7) : rubrique, type et date — jamais `zone`, déjà donnée
            par la route. */}
        <PublicFilters
          basePath={`/zone/${slug}`}
          axes={["categorie", "type", "date"]}
          valeurs={{
            categorie: filtres.categorieSlug,
            type: filtres.typeContenu,
            du: filtres.du,
            au: filtres.au,
          }}
          categories={categories}
        />

        {zone.articles.length > 0 ? (
          <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {zone.articles.map((article) => (
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
          /* Deux états vides distincts (ui-specification.md §États vides) : « aucun
             contenu ne correspond aux filtres », qui appelle une action de reprise en
             main — assurée par le lien de réinitialisation du formulaire ci-dessus — et
             « taxonomie sans article publié », message neutre sans ton d'excuse. */
          <p className="mt-7 text-text-secondary">Aucun article ne correspond à ces critères.</p>
        ) : (
          <p className="mt-7 text-text-secondary">Aucun article publié pour le moment dans ce pays.</p>
        )}

        <PaginationLinks
          basePath={`/zone/${slug}`}
          currentPage={zone.page}
          hasNextPage={zone.hasNextPage}
          preserveParams={filtresUrl}
        />
      </main>
    </>
  );
}
