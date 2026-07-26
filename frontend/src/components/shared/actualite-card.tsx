import Image from "next/image";
import Link from "next/link";
import type { HomeActualiteItem } from "@/features/articles/get-home-actualites";

// Carte de la grille "Actualités & terrain" de l'Accueil (4 colonnes, REPO-4 : Corne de
// l'Afrique.dc.html l.124-137) : image 4/3, rubrique, titre, "pays · temps de lecture" —
// distincte d'ArticleCard (grille 3 colonnes, date au lieu du temps de lecture, réutilisée
// par categorie/[slug] et zone/[slug]) et d'AnalysisCard (carte horizontale). Nouvelle
// variante plutôt qu'une prop conditionnelle sur ArticleCard : les deux mises en page
// n'ont aucune structure commune (verticale/4:3 vs horizontale/16:9 implicite).
export function ActualiteCard({ item }: { item: HomeActualiteItem }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-[6px] border border-border bg-bg-secondary transition-shadow duration-fast hover:shadow-lg">
      <Link
        href={`/articles/${item.slug}`}
        className="relative block aspect-[4/3] overflow-hidden outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
      >
        <Image
          src={item.imagePrincipaleUrl}
          alt={item.imageAltText}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 600px) 50vw, 100vw"
          className="object-cover"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link
          href={`/categorie/${item.categorieSlug}`}
          className="text-[11px] font-semibold uppercase tracking-[.1em] text-accent-primary outline-none transition-colors duration-fast hover:text-accent-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
        >
          {item.categorieNom}
        </Link>

        <h3 className="flex-1 font-editorial text-[17px] font-semibold leading-tight tracking-[-.005em]">
          <Link
            href={`/articles/${item.slug}`}
            className="outline-none transition-colors duration-fast hover:text-accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
          >
            {item.titre}
          </Link>
        </h3>

        <p className="mt-0.5 text-xs text-text-secondary">
          {item.zoneNom} · {item.tempsLecture}
        </p>
      </div>
    </article>
  );
}
