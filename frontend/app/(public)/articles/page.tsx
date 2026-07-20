import type { Metadata } from "next";
import { ArticleCard } from "@/components/shared/article-card";
import { getArticlesList } from "@/features/articles/get-articles-list";

// Liste des articles (Lot L8d, contrat validé) : vue d'ensemble des
// contenus publiés, page 1 uniquement (12 max, déjà triés par date de
// publication décroissante) — aucune pagination, aucune recherche, aucun
// filtre catégorie/zone dans ce lot. Coexiste avec articles/[slug]/page.tsx
// (non modifié) : /articles résout ici, /articles/{slug} dans le segment
// dynamique. title/canonical spécifiques ; description héritée de
// app/layout.tsx (aucune duplication).
export const metadata: Metadata = {
  title: "Tous les articles",
  alternates: {
    canonical: "/articles",
  },
};

export default async function ArticlesListPage() {
  const articles = await getArticlesList();

  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-5 py-8 lg:px-15">
      <h1 className="font-editorial text-3xl">Tous les articles</h1>

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
            />
          ))}
        </div>
      ) : (
        <p className="mt-6 text-text-secondary">Aucun article publié pour le moment.</p>
      )}
    </main>
  );
}
