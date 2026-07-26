import type { Metadata } from "next";
import Link from "next/link";
import { FeaturedArticle } from "@/components/shared/featured-article";
import { ActualiteCard } from "@/components/shared/actualite-card";
import { AnalysisCard } from "@/components/shared/analysis-card";
import { getHomeArticles } from "@/features/articles/get-home-articles";
import { getHomeActualites } from "@/features/articles/get-home-actualites";
import { getHomeAnalyses } from "@/features/articles/get-home-analyses";
import { getHomeLatest } from "@/features/articles/get-home-latest";
import { listZoneArticleCounts } from "@/features/taxonomies/list-zone-article-counts";
import { resoudreSiteUrl } from "@/lib/site-url";
import { serializeJsonLd } from "@/lib/json-ld";

// Homepage publique (REPO-4, refonte structurelle conforme à Corne de l'Afrique.dc.html
// l.87-195, contrat REPO-4) : 5 sections empilées, dans l'ordre exact du fichier source —
// hero (contenu phare + "À la une"), grille "Actualités & terrain", bandeau "Analyses &
// enquêtes approfondies", "Explorer par pays", "Dernières publications". Remplace les 4
// sections de l'ancien lot (hero simple, grille "À la une" 6 items, TaxonomyPills,
// newsletter compacte) : TaxonomyPills est supprimée (B17, fonction absorbée par le
// bandeau Pays du header et la section "Explorer par pays" ci-dessous), la newsletter
// compacte l'est aussi (B27, remplacée par le bandeau sitewide de
// app/(public)/layout.tsx — la garder ici aurait dupliqué le formulaire sur cette seule
// page).
//
// Chaque section est entièrement omise si sa donnée est vide (même convention que
// TaxonomyPills/FooterTaxonomies : jamais un titre de section sans contenu). Aucune
// déduplication entre sections : chacune interroge indépendamment le contenu Publié le
// plus récent selon son propre filtre — un même article peut apparaître dans plusieurs
// sections tant que le volume de contenu réel est faible (risque documenté,
// plan-implementation-repositionnement-asile.md, REPO-4).
//
// <h1> unique de la page : porté par FeaturedArticle tant qu'un contenu phare existe ;
// route de repli ci-dessous sinon (aucun contenu Publié) — jamais les deux à la fois.
export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

const NOM_MEDIA = "Plateforme éditoriale — Corne de l'Afrique";

export default async function Home() {
  const [{ featured, secondary }, actualites, analyses, latest, zoneCounts] = await Promise.all([
    getHomeArticles(),
    getHomeActualites(),
    getHomeAnalyses(),
    getHomeLatest(),
    listZoneArticleCounts(),
  ]);

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(organizationJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(websiteJsonLd) }} />

      <main className="flex-1">
        {/* Hero : contenu phare + "À la une" (design l.92-116) */}
        <section className="mx-auto grid max-w-[1220px] gap-8 px-5 py-8 lg:grid-cols-[1.55fr_1fr] lg:gap-9 lg:px-[28px] lg:py-10">
          {featured ? (
            <FeaturedArticle article={featured} />
          ) : (
            <h1 className="font-editorial text-3xl lg:text-4xl">
              Aucun contenu publié pour le moment.
            </h1>
          )}

          {secondary.length > 0 && (
            <div className="flex flex-col gap-5 lg:border-l lg:border-border lg:pl-9">
              <p className="text-xs font-semibold uppercase tracking-[.16em] text-text-secondary">À la une</p>
              {secondary.map((item) => {
                const dateFormatee = item.datePublication.toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                });

                return (
                  <article key={item.slug} className="flex flex-col gap-1.5 border-b border-border pb-5 last:border-b-0 last:pb-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[.1em] text-accent-primary">
                      {item.categorieNom}
                    </p>
                    <h3 className="font-editorial text-[19px] font-semibold leading-tight tracking-[-.01em]">
                      <Link
                        href={`/articles/${item.slug}`}
                        className="outline-none transition-colors duration-fast hover:text-accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
                      >
                        {item.titre}
                      </Link>
                    </h3>
                    <p className="text-[12.5px] text-text-secondary">
                      {item.zoneNom} · {dateFormatee}
                    </p>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Grille "Actualités & terrain" (design l.118-139) */}
        {actualites.length > 0 && (
          <section className="mx-auto max-w-[1220px] px-5 py-8 lg:px-[28px]">
            <div className="mb-5 flex items-baseline justify-between border-t-2 border-text-primary pt-3.5">
              <h2 className="font-editorial text-2xl font-bold">Actualités &amp; terrain</h2>
              <Link href="/recherche?type=article" className="text-[13px] font-semibold text-accent-primary hover:text-accent-primary-hover">
                Toute l&apos;actualité →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {actualites.map((item) => (
                <ActualiteCard key={item.slug} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* Bandeau "Analyses & enquêtes approfondies" (design l.141-165) */}
        {analyses.length > 0 && (
          <section className="mt-3.5 border-y border-border bg-[#efeadf]">
            <div className="mx-auto max-w-[1220px] px-5 py-8 lg:px-[28px]">
              <div className="mb-5 flex items-baseline justify-between">
                <h2 className="font-editorial text-2xl font-bold">Analyses &amp; enquêtes approfondies</h2>
                <Link href="/recherche" className="text-[13px] font-semibold text-accent-primary hover:text-accent-primary-hover">
                  Voir tout →
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {analyses.map((item) => (
                  <AnalysisCard key={item.slug} item={item} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Explorer par pays (design l.167-178) */}
        {zoneCounts.length > 0 && (
          <section className="mx-auto max-w-[1220px] px-5 py-8 lg:px-[28px]">
            <h2 className="mb-5 border-t-2 border-text-primary pt-3.5 font-editorial text-2xl font-bold">
              Explorer par pays
            </h2>
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
              {zoneCounts.map((zone) => (
                <Link
                  key={zone.slug}
                  href={`/zone/${zone.slug}`}
                  className="flex flex-col gap-1.5 rounded-[6px] border border-border bg-bg-secondary p-[18px] outline-none transition-transform duration-fast hover:-translate-y-0.5 hover:border-accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
                >
                  <span className="font-editorial text-[19px] font-semibold">{zone.nom}</span>
                  <span className="text-xs text-text-secondary">{zone.count} publication{zone.count === 1 ? "" : "s"}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Dernières publications (design l.180-195) */}
        {latest.length > 0 && (
          <section className="mx-auto max-w-[1220px] px-5 pb-10 lg:px-[28px]">
            <h2 className="mb-1.5 border-t-2 border-text-primary pt-3.5 font-editorial text-2xl font-bold">
              Dernières publications
            </h2>
            <div>
              {latest.map((item) => {
                const dateFormatee = item.datePublication.toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                });

                return (
                  <Link
                    key={item.slug}
                    href={`/articles/${item.slug}`}
                    className="grid grid-cols-[80px_1fr] items-center gap-4 border-b border-border py-4 outline-none transition-colors duration-fast hover:bg-black/[0.015] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary sm:grid-cols-[100px_1fr_auto] sm:gap-5"
                  >
                    <span className="text-[11.5px] tabular-nums text-text-secondary">{dateFormatee}</span>
                    <div>
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[.1em] text-accent-primary">
                        {item.categorieNom}
                      </p>
                      <h3 className="font-editorial text-[19px] font-semibold leading-tight">{item.titre}</h3>
                    </div>
                    <div className="hidden text-right text-xs text-text-secondary sm:block">
                      <p>{item.zoneNom}</p>
                      <p>{item.tempsLecture}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
