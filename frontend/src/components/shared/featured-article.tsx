import Image from "next/image";
import Link from "next/link";
import type { FeaturedHomeArticle } from "@/features/articles/get-home-articles";
import { TYPE_CONTENU_LABELS } from "@/features/articles/type-contenu-labels";

// Contenu phare de l'Accueil (Lot Homepage — hero, contrat validé sur
// wireframe Claude Design "Wireframes MVP.dc.html", écran Accueil, et
// maquettes-haute-fidelite.md §1 "Accueil" : "Contenu phare (dossier/analyse
// en cours)", 2 colonnes desktop image 60% / texte 40%, image à gauche,
// texte à droite ; empilé (image pleine largeur puis texte) sous 1024px ;
// CTA secondaire "Lire l'analyse →" en lien tertiaire).
//
// Reçoit les données en props depuis page.tsx (Server Component parent) :
// contrairement à TaxonomyPills, la donnée est déjà chargée par
// getHomeArticles() pour "À la une" — aucune requête indépendante à
// dédupliquer ici, donc aucune justification à un fetch interne.
export function FeaturedArticle({ article }: { article: FeaturedHomeArticle }) {
  const dateFormatee = article.datePublication.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const typeLabel = TYPE_CONTENU_LABELS[article.typeContenu] ?? article.typeContenu;

  return (
    <section className="mt-12 flex flex-col gap-7 lg:flex-row lg:items-stretch">
      <Link
        href={`/articles/${article.slug}`}
        className="relative block aspect-video w-full overflow-hidden rounded-sm outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary lg:flex-[1.4]"
      >
        <Image
          src={article.imagePrincipaleUrl}
          alt={article.imageAltText}
          fill
          sizes="(min-width: 1024px) 58vw, 100vw"
          className="object-cover"
          priority
        />
      </Link>

      <div className="flex flex-col justify-center gap-3 lg:flex-1">
        <p className="flex flex-wrap items-center gap-1 font-meta text-[13px] uppercase text-text-secondary">
          <span>{typeLabel}</span>
          <span aria-hidden="true">·</span>
          <Link
            href={`/categorie/${article.categorieSlug}`}
            className="outline-none transition-colors duration-fast hover:text-accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
          >
            {article.categorieNom}
          </Link>
        </p>

        <h2 className="font-editorial text-2xl lg:text-3xl">
          <Link
            href={`/articles/${article.slug}`}
            className="outline-none transition-colors duration-fast hover:text-accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
          >
            {article.titre}
          </Link>
        </h2>

        {article.chapo && (
          <p className="line-clamp-3 text-base text-text-secondary">{article.chapo}</p>
        )}

        <p className="font-meta text-[13px] text-text-secondary">{dateFormatee}</p>

        <Link
          href={`/articles/${article.slug}`}
          className="inline-flex w-fit items-center gap-1 text-sm font-medium text-accent-primary outline-none transition-colors duration-fast hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
        >
          Lire l&apos;analyse →
        </Link>
      </div>
    </section>
  );
}
