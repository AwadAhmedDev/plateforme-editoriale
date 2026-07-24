import type { Metadata } from "next";
import { ArticleCard } from "@/components/shared/article-card";
import { FeaturedArticle } from "@/components/shared/featured-article";
import { TaxonomyPills } from "@/components/shared/taxonomy-pills";
import { NewsletterForm } from "@/features/newsletter/newsletter-form";
import { getHomeArticles } from "@/features/articles/get-home-articles";
import { resoudreSiteUrl } from "@/lib/site-url";
import { serializeJsonLd } from "@/lib/json-ld";
import { accueilContent } from "./content";

// Homepage publique (Lot Homepage, contrat validé) : compose l'accroche
// éditoriale (content.ts, séparée de la structure), le contenu phare
// (FeaturedArticle, hero — maquettes-haute-fidelite.md §1 "Accueil"), la
// section "À la une" (ArticleCard non modifié depuis le lot précédent),
// l'accès aux catégories/zones phares (TaxonomyPills, auto-suffisant,
// aucune prop reçue ici) et le bandeau newsletter compact (NewsletterForm
// variant="compact", même action serveur que /newsletter). metadata,
// JSON-LD et canonical hérités tels quels — aucune modification.
export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

// Nom repris tel quel de app/layout.tsx (title.default) — même valeur déjà
// publiée, aucune invention. Reste documentée comme provisoire (cf.
// commentaire de layout.tsx : aucun nom de marque réel n'est encore fixé
// par le corpus documentaire).
const NOM_MEDIA = "Plateforme éditoriale — Corne de l'Afrique";

export default async function Home() {
  const { featured, articles } = await getHomeArticles();
  const { accroche } = accueilContent;

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
        <h1 className="font-editorial text-3xl text-accent-warm lg:text-4xl">
          {accroche.texte}
        </h1>

        {featured && <FeaturedArticle article={featured} />}

        <section className="mt-12">
          <h2 className="font-editorial text-2xl">À la une</h2>

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
        </section>

        <TaxonomyPills />

        <section className="mt-12">
          <h2 className="font-editorial text-2xl">Newsletter</h2>
          <div className="mt-6">
            <NewsletterForm variant="compact" />
          </div>
        </section>
      </main>
    </>
  );
}
