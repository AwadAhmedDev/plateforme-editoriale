import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/shared/article-card";
import { getZonePage } from "@/features/taxonomies/get-zone-page";
import { resoudreSiteUrl } from "@/lib/site-url";
import { serializeJsonLd } from "@/lib/json-ld";

// Route Zone géographique (Lot L8c, contrat validé) : symétrique de
// app/(public)/categorie/[slug]/page.tsx. Lecture via getZonePage
// uniquement — aucun accès repository direct ici. Page 1 des articles
// publiés de la zone (12 max, déjà triés par date de publication
// décroissante) ; aucune pagination dans ce lot.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const zone = await getZonePage(slug);

  if (!zone) {
    return {};
  }

  return {
    title: zone.nom,
    ...(zone.descriptionCourte ? { description: zone.descriptionCourte } : {}),
    alternates: {
      canonical: `/zone/${slug}`,
    },
  };
}

export default async function ZonePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const zone = await getZonePage(slug);

  if (!zone) {
    notFound();
  }

  // JSON-LD (Lot L12, contrat validé) : CollectionPage + ItemList imbriqué
  // (mainEntity) — omis entièrement si la zone n'a aucun article publié,
  // jamais un ItemList déclaré sans élément.
  const siteUrl = resoudreSiteUrl();
  const absoluteUrl = (path: string) => new URL(path, siteUrl).toString();

  const collectionPageJsonLd =
    zone.articles.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: zone.nom,
          url: absoluteUrl(`/zone/${slug}`),
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
      <main className="mx-auto w-full max-w-300 flex-1 px-5 py-8 lg:px-15">
        <h1 className="font-editorial text-3xl">{zone.nom}</h1>

        {zone.articles.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4.5">
            {zone.articles.map((article) => (
              <ArticleCard
                key={article.slug}
                slug={article.slug}
                titre={article.titre}
                imagePrincipaleUrl={article.imagePrincipaleUrl}
                imageAltText={article.imageAltText}
                categorieNom={article.categorieNom}
                categorieSlug={article.categorieSlug}
                zoneNom={article.zoneNom}
                zoneSlug={article.zoneSlug}
                datePublication={article.datePublication}
              />
            ))}
          </div>
        ) : (
          <p className="mt-6 text-text-secondary">Aucun article publié pour le moment dans ce pays.</p>
        )}
      </main>
    </>
  );
}
