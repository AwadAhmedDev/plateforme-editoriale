import Image from "next/image";
import Link from "next/link";
import type { FeaturedHomeArticle } from "@/features/articles/get-home-articles";

// Contenu phare de l'Accueil (hero, REPO-4 : Corne de l'Afrique.dc.html l.93-104) : image
// pleine largeur (16/9) au-dessus, rubrique/pays, titre — porte le seul <h1> de la page
// tant qu'un contenu phare existe (app/(public)/page.tsx affiche un <h1> de repli
// uniquement en son absence, jamais les deux à la fois). "Par {auteur} · {date} ·
// {tempsLecture}" : `auteur` reste facultatif même pour un contenu Publié
// (domain-model.md) — jamais force-unwrappé, segment omis si absent plutôt qu'un "Par
// null" affiché.
//
// Reçoit les données en props depuis page.tsx (Server Component parent) : la donnée est
// déjà chargée par getHomeArticles() — aucune requête indépendante à dédupliquer ici.
export function FeaturedArticle({ article }: { article: FeaturedHomeArticle }) {
  const dateFormatee = article.datePublication.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="flex flex-col gap-4">
      <Link
        href={`/articles/${article.slug}`}
        className="relative block aspect-video w-full overflow-hidden rounded-[6px] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
      >
        <Image
          src={article.imagePrincipaleUrl}
          alt={article.imageAltText}
          fill
          sizes="(min-width: 1024px) 62vw, 100vw"
          className="object-cover"
          priority
        />
      </Link>

      <div>
        <p className="mb-2.5 flex flex-wrap items-center gap-2.5 text-xs font-semibold uppercase tracking-[.14em] text-accent-primary">
          <Link
            href={`/categorie/${article.categorieSlug}`}
            className="inline-flex min-h-6 items-center outline-none transition-colors duration-fast hover:text-accent-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
          >
            {article.categorieNom}
          </Link>
          <span aria-hidden="true" className="text-border">
            /
          </span>
          <Link
            href={`/zone/${article.zoneSlug}`}
            className="inline-flex min-h-6 items-center text-text-secondary outline-none transition-colors duration-fast hover:text-accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
          >
            {article.zoneNom}
          </Link>
        </p>

        <h1 className="font-editorial text-[28px] font-bold leading-[1.1] tracking-[-.015em] lg:text-[40px] lg:leading-[1.08]">
          <Link
            href={`/articles/${article.slug}`}
            className="outline-none transition-colors duration-fast hover:text-accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
          >
            {article.titre}
          </Link>
        </h1>

        {article.chapo && (
          <p className="mt-3.5 max-w-[52ch] text-base leading-relaxed text-text-secondary">{article.chapo}</p>
        )}

        <p className="mt-3.5 text-[13px] text-text-secondary">
          {article.auteur && (
            <>
              Par <span className="font-medium text-text-primary">{article.auteur}</span> ·{" "}
            </>
          )}
          {dateFormatee} · {article.tempsLecture}
        </p>
      </div>
    </article>
  );
}
