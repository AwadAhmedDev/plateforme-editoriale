import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/shared/article-card";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { PaginationLinks } from "@/components/shared/pagination-links";
import { PublicFilters, lireFiltresListing, filtresAppliques } from "@/components/shared/public-filters";
import { getCategoriePage } from "@/features/taxonomies/get-categorie-page";
import { listZoneMenu } from "@/features/taxonomies/list-zone-menu";
import { urlAvecPageEtFiltres } from "@/lib/pagination";
import { resoudreSiteUrl } from "@/lib/site-url";
import { serializeJsonLd } from "@/lib/json-ld";

type CategoriePageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// `categorie` est retirée des filtres appliqués : la rubrique est donnée par la route, un
// `?categorie=` dans l'URL ne doit jamais la contredire ni polluer canonical et pagination.
function filtresDeLaPage(filtres: ReturnType<typeof lireFiltresListing>): Record<string, string> {
  const { categorie: _ignore, ...params } = filtresAppliques(filtres);
  return params;
}

// Route Catégorie (clôture RC-1 : alignement sur le gabarit de listing du design, Corne
// de l'Afrique.dc.html l.265-289, section isListing/listType:'cat') : lecture via
// getCategoriePage uniquement — aucun accès repository direct ici. Pagination `?page=N`
// (Lot 1A) : canonical auto-référent par page (jamais `?page=1` explicite). Kicker
// "Rubrique" repris littéralement du design (constante — le design distingue
// `listingKicker` du nom réel de l'instance, `listingTitle`). title/description
// conditionnels sur les données réelles (nom, descriptionCourte), jamais de valeur
// inventée si absente.
//
// SEO des URLs filtrées (Lot Filtres) : dès qu'un filtre est actif, `noindex, follow`. Une
// vue filtrée est un résultat utilisateur, pas une page éditoriale permanente — même
// raisonnement que le canonical fixe de /recherche, mais ici la page nue reste indexable,
// d'où un `robots` par URL plutôt qu'un canonical figé. `follow` préserve la transmission
// vers les articles. Le canonical reste auto-référent, filtres compris : jamais un
// canonical déclarant qu'une vue filtrée EST la page non filtrée, ce qui serait faux —
// deux jeux de résultats distincts.
export async function generateMetadata({ params, searchParams }: CategoriePageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const filtres = lireFiltresListing(resolvedSearchParams);
  const categorie = await getCategoriePage(slug, filtres);

  if (!categorie) {
    return {};
  }

  const filtresUrl = filtresDeLaPage(filtres);
  const estFiltree = Object.keys(filtresUrl).length > 0;

  return {
    title: categorie.nom,
    ...(categorie.descriptionCourte ? { description: categorie.descriptionCourte } : {}),
    ...(estFiltree ? { robots: { index: false, follow: true } } : {}),
    alternates: {
      canonical: urlAvecPageEtFiltres(`/categorie/${slug}`, categorie.page, filtresUrl),
    },
  };
}

export default async function CategoriePage({ params, searchParams }: CategoriePageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const filtres = lireFiltresListing(resolvedSearchParams);
  const pageDemandee = filtres.page;

  // Arguments strictement identiques à ceux de generateMetadata : getCategoriePage est
  // mémoïsée, donc un seul accès base de données pour les deux appels de ce rendu.
  const [categorie, zones] = await Promise.all([getCategoriePage(slug, filtres), listZoneMenu()]);

  if (!categorie) {
    notFound();
  }

  // Page bien formée (entière, >= 1) mais hors bornes : le repository l'a déjà clampée à
  // la dernière page existante (`categorie.page` != `pageDemandee`) — notFound() plutôt
  // que d'afficher silencieusement un contenu qui ne correspond pas à l'URL demandée
  // (Lot 1A). Distinct du notFound() ci-dessus (slug inconnu) : même mécanisme Next.js
  // (nearest not-found.tsx), deux causes différentes.
  if (categorie.page !== pageDemandee) {
    notFound();
  }

  const filtresUrl = filtresDeLaPage(filtres);
  const estFiltree = Object.keys(filtresUrl).length > 0;

  // JSON-LD (Lot L12, contrat validé) : CollectionPage + ItemList imbriqué
  // (mainEntity) — omis entièrement si la catégorie n'a aucun article
  // publié, jamais un ItemList déclaré sans élément. `url` reflète la page courante
  // (Lot 1A), cohérent avec le canonical de generateMetadata.
  //
  // Également omis dès qu'un filtre est actif (Lot Filtres) : publier une donnée
  // structurée décrivant une collection qu'on demande simultanément de ne pas indexer
  // (`noindex` posé par generateMetadata) serait contradictoire. Le BreadcrumbList
  // ci-dessous reste, lui, inconditionnel — le fil d'Ariane est vrai quels que soient les
  // filtres, comme il l'est déjà quelle que soit la page.
  const siteUrl = resoudreSiteUrl();
  const absoluteUrl = (path: string) => new URL(path, siteUrl).toString();

  const collectionPageJsonLd =
    categorie.articles.length > 0 && !estFiltree
      ? {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: categorie.nom,
          url: absoluteUrl(urlAvecPageEtFiltres(`/categorie/${slug}`, categorie.page, filtresUrl)),
          mainEntity: {
            "@type": "ItemList",
            itemListElement: categorie.articles.map((article, index) => ({
              "@type": "ListItem",
              position: index + 1,
              url: absoluteUrl(`/articles/${article.slug}`),
            })),
          },
        }
      : null;

  // BreadcrumbList (Lot 2B) : émis inconditionnellement, contrairement au CollectionPage
  // ci-dessus qui reste omis sur une rubrique sans article publié (décision L12) — un fil
  // d'Ariane reste valide sur une rubrique vide. Deux balises <script> distinctes, l'une
  // conditionnelle et l'autre non, comme sur articles/[slug]/page.tsx. `item` omis pour le
  // segment courant (sans `href`) : jamais une URL de page paginée déclarée ici.
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: categorie.breadcrumb.map((segment, index) => ({
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
        <Breadcrumb items={categorie.breadcrumb} />

        <div className="mt-4 border-b-2 border-text-primary pb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[.16em] text-accent-primary">Rubrique</p>
          <h1 className="font-editorial text-4xl">{categorie.nom}</h1>
          <p className="mt-2 text-sm text-text-secondary">
            {categorie.count} publication{categorie.count > 1 ? "s" : ""}
          </p>
        </div>

        {/* Filtres secondaires (ui-specification.md §Comportement des filtres,
            api-contracts.md §3.6) : zone, type et date — jamais `categorie`, déjà donnée
            par la route. */}
        <PublicFilters
          basePath={`/categorie/${slug}`}
          axes={["zone", "type", "date"]}
          valeurs={{
            zone: filtres.zoneSlug,
            type: filtres.typeContenu,
            du: filtres.du,
            au: filtres.au,
          }}
          zones={zones}
        />

        {categorie.articles.length > 0 ? (
          <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categorie.articles.map((article) => (
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
             main, et « taxonomie sans article publié », message neutre sans ton d'excuse.
             Le lien de réinitialisation du formulaire ci-dessus est déjà présent dès qu'un
             filtre est actif — il tient lieu d'action de sortie, jamais une zone
             silencieuse. */
          <p className="mt-7 text-text-secondary">Aucun article ne correspond à ces critères.</p>
        ) : (
          <p className="mt-7 text-text-secondary">Aucun article publié pour le moment dans cette rubrique.</p>
        )}

        <PaginationLinks
          basePath={`/categorie/${slug}`}
          currentPage={categorie.page}
          hasNextPage={categorie.hasNextPage}
          preserveParams={filtresUrl}
        />
      </main>
    </>
  );
}
