import type { Metadata } from "next";
import { ArticleCard } from "@/components/shared/article-card";
import { getHomeArticles } from "@/features/articles/get-home-articles";
import { resoudreSiteUrl } from "@/lib/site-url";
import { serializeJsonLd } from "@/lib/json-ld";

// Homepage publique (Lot L8b, contrat validé) : remplace le scaffold
// create-next-app précédemment à app/page.tsx, déplacée sous (public) pour
// hériter automatiquement de PublicLayout (header/footer) sans dupliquer ce
// chrome — l'URL publique reste / (les route groups Next.js n'affectent
// jamais l'URL générée). title/description hérités tels quels de
// app/layout.tsx (aucune duplication) ; seul alternates.canonical est
// ajouté ici. Hors périmètre (aucune donnée/route ne les supporte
// encore) : bloc "À la une" curaté, catégories/zones phares, recherche,
// encart newsletter inline — uniquement les derniers articles publiés.
export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

// Nom repris tel quel de app/layout.tsx (title.default) — même valeur déjà
// publiée, aucune invention. Reste documentée comme provisoire (cf.
// commentaire de layout.tsx : aucun nom de marque réel n'est encore fixé
// par le corpus documentaire) ; cette réserve s'applique aussi ici.
const NOM_MEDIA = "Plateforme éditoriale — Corne de l'Afrique";

export default async function Home() {
  const articles = await getHomeArticles();

  // JSON-LD (Lot L12, contrat validé) : Organization + WebSite, seule page
  // à les porter (jamais dupliqué sur les autres routes). SearchAction
  // décrit une capacité réellement existante (/recherche?q=, L9/L11), pas
  // inventée.
  const siteUrl = resoudreSiteUrl();
  const absoluteUrl = (path: string) => new URL(path, siteUrl).toString();

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: NOM_MEDIA,
    url: absoluteUrl("/"),
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: NOM_MEDIA,
    url: absoluteUrl("/"),
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl("/recherche")}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(organizationJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(websiteJsonLd) }}
      />
      <main className="mx-auto w-full max-w-300 flex-1 px-5 py-8 lg:px-15">
        <h1 className="font-editorial text-3xl">Derniers articles publiés</h1>

        {articles.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4.5">
            {articles.map((article) => (
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
          <p className="mt-6 text-text-secondary">
            Aucun article publié pour le moment.
          </p>
        )}
      </main>
    </>
  );
}
