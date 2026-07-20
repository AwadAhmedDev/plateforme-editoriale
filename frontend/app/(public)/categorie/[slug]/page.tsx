import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/shared/article-card";
import { getCategoriePage } from "@/features/taxonomies/get-categorie-page";
import { resoudreSiteUrl } from "@/lib/site-url";
import { serializeJsonLd } from "@/lib/json-ld";

// Route Catégorie (Lot L8c, contrat validé) : lecture via getCategoriePage
// uniquement — aucun accès repository direct ici. Page 1 des articles
// publiés de la catégorie (12 max, déjà triés par date de publication
// décroissante) ; aucune pagination dans ce lot. title/description
// conditionnels sur les données réelles (nom, descriptionCourte), jamais
// de valeur inventée si absente.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const categorie = await getCategoriePage(slug);

  if (!categorie) {
    return {};
  }

  return {
    title: categorie.nom,
    ...(categorie.descriptionCourte ? { description: categorie.descriptionCourte } : {}),
    alternates: {
      canonical: `/categorie/${slug}`,
    },
  };
}

export default async function CategoriePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categorie = await getCategoriePage(slug);

  if (!categorie) {
    notFound();
  }

  // JSON-LD (Lot L12, contrat validé) : CollectionPage + ItemList imbriqué
  // (mainEntity) — omis entièrement si la catégorie n'a aucun article
  // publié, jamais un ItemList déclaré sans élément.
  const siteUrl = resoudreSiteUrl();
  const absoluteUrl = (path: string) => new URL(path, siteUrl).toString();

  const collectionPageJsonLd =
    categorie.articles.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: categorie.nom,
          url: absoluteUrl(`/categorie/${slug}`),
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

  return (
    <>
      {collectionPageJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(collectionPageJsonLd) }}
        />
      )}
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-5 py-8 lg:px-15">
        <h1 className="font-editorial text-3xl">{categorie.nom}</h1>

        {categorie.articles.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-[18px]">
            {categorie.articles.map((article) => (
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
          <p className="mt-6 text-text-secondary">Aucun article publié pour le moment dans cette catégorie.</p>
        )}
      </main>
    </>
  );
}
