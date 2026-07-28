import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/shared/article-card";
import { getCategoriePage } from "@/features/taxonomies/get-categorie-page";
import { resoudreSiteUrl } from "@/lib/site-url";
import { serializeJsonLd } from "@/lib/json-ld";

// Route Catégorie (clôture RC-1 : alignement sur le gabarit de listing du design, Corne
// de l'Afrique.dc.html l.265-289, section isListing/listType:'cat') : lecture via
// getCategoriePage uniquement — aucun accès repository direct ici. Page 1 des articles
// publiés de la catégorie (24 max, déjà triés par date de publication décroissante) ;
// aucune pagination dans ce lot. Kicker "Rubrique" repris littéralement du design
// (constante — le design distingue `listingKicker` du nom réel de l'instance,
// `listingTitle`). title/description conditionnels sur les données réelles (nom,
// descriptionCourte), jamais de valeur inventée si absente.
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
      <main className="mx-auto w-full max-w-[1220px] flex-1 px-5 py-8 lg:px-[28px]">
        <div className="border-b-2 border-text-primary pb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[.16em] text-accent-primary">Rubrique</p>
          <h1 className="font-editorial text-4xl">{categorie.nom}</h1>
          <p className="mt-2 text-sm text-text-secondary">
            {categorie.count} publication{categorie.count > 1 ? "s" : ""}
          </p>
        </div>

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
        ) : (
          <p className="mt-7 text-text-secondary">Aucun article publié pour le moment dans cette rubrique.</p>
        )}
      </main>
    </>
  );
}
