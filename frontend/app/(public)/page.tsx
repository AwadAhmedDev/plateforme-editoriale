import type { Metadata } from "next";
import { ArticleCard } from "@/components/shared/article-card";
import { getHomeArticles } from "@/features/articles/get-home-articles";

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

export default async function Home() {
  const articles = await getHomeArticles();

  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-5 py-8 lg:px-15">
      <h1 className="font-editorial text-3xl">Derniers articles publiés</h1>

      {articles.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-[18px]">
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
              liensTaxonomieActifs={false}
            />
          ))}
        </div>
      ) : (
        <p className="mt-6 text-text-secondary">Aucun article publié pour le moment.</p>
      )}
    </main>
  );
}
