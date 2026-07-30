import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/shared/article-card";
import { PaginationLinks } from "@/components/shared/pagination-links";
import { getZonePage } from "@/features/taxonomies/get-zone-page";
import { normaliserPageDemandee, urlAvecPage } from "@/lib/pagination";
import { resoudreSiteUrl } from "@/lib/site-url";
import { serializeJsonLd } from "@/lib/json-ld";

type ZonePageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// Route Pays (clôture RC-1 : alignement sur le gabarit de listing du design, Corne de
// l'Afrique.dc.html l.265-289, section isListing/listType:'country') : symétrique de
// app/(public)/categorie/[slug]/page.tsx. Lecture via getZonePage uniquement — aucun
// accès repository direct ici. Pagination `?page=N` (Lot 1A) : canonical auto-référent
// par page via urlAvecPage (jamais `?page=1` explicite). Kicker "Pays" repris
// littéralement du design (constante, cf. categorie/[slug]/page.tsx).
export async function generateMetadata({ params, searchParams }: ZonePageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const page = normaliserPageDemandee(resolvedSearchParams.page);
  const zone = await getZonePage(slug, page);

  if (!zone) {
    return {};
  }

  return {
    title: zone.nom,
    ...(zone.descriptionCourte ? { description: zone.descriptionCourte } : {}),
    alternates: {
      canonical: urlAvecPage(`/zone/${slug}`, zone.page),
    },
  };
}

export default async function ZonePage({ params, searchParams }: ZonePageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const pageDemandee = normaliserPageDemandee(resolvedSearchParams.page);

  const zone = await getZonePage(slug, pageDemandee);

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

  // JSON-LD (Lot L12, contrat validé) : CollectionPage + ItemList imbriqué
  // (mainEntity) — omis entièrement si la zone n'a aucun article publié,
  // jamais un ItemList déclaré sans élément. `url` reflète la page courante (Lot 1A),
  // cohérent avec le canonical de generateMetadata.
  const siteUrl = resoudreSiteUrl();
  const absoluteUrl = (path: string) => new URL(path, siteUrl).toString();

  const collectionPageJsonLd =
    zone.articles.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: zone.nom,
          url: absoluteUrl(urlAvecPage(`/zone/${slug}`, zone.page)),
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
          <p className="mb-2 text-xs font-semibold uppercase tracking-[.16em] text-accent-primary">Pays</p>
          <h1 className="font-editorial text-4xl">{zone.nom}</h1>
          <p className="mt-2 text-sm text-text-secondary">
            {zone.count} publication{zone.count > 1 ? "s" : ""}
          </p>
        </div>

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
        ) : (
          <p className="mt-7 text-text-secondary">Aucun article publié pour le moment dans ce pays.</p>
        )}

        <PaginationLinks basePath={`/zone/${slug}`} currentPage={zone.page} hasNextPage={zone.hasNextPage} />
      </main>
    </>
  );
}
