import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/shared/article-card";
import { getZonePage } from "@/features/taxonomies/get-zone-page";
import { resoudreSiteUrl } from "@/lib/site-url";
import { serializeJsonLd } from "@/lib/json-ld";

// Route Pays (clôture RC-1 : alignement sur le gabarit de listing du design, Corne de
// l'Afrique.dc.html l.265-289, section isListing/listType:'country') : symétrique de
// app/(public)/categorie/[slug]/page.tsx. Lecture via getZonePage uniquement — aucun
// accès repository direct ici. Page 1 des articles publiés de la zone (24 max, déjà
// triés par date de publication décroissante) ; aucune pagination dans ce lot. Kicker
// "Pays" repris littéralement du design (constante, cf. categorie/[slug]/page.tsx).
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
      </main>
    </>
  );
}
