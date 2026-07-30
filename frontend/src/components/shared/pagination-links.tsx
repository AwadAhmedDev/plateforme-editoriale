import Link from "next/link";
import { urlAvecPage } from "@/lib/pagination";

export type PaginationLinksProps = {
  basePath: string;
  currentPage: number;
  hasNextPage: boolean;
  // Filtres actifs à reporter sur les liens Précédent/Suivant (ex. /recherche : q,
  // catégorie, zone, type, tri) — absent pour /articles, /categorie/[slug], /zone/[slug],
  // qui n'ont aucun filtre à préserver.
  preserveParams?: Record<string, string>;
};

function construireHref(basePath: string, page: number, preserveParams?: Record<string, string>): string {
  const params = new URLSearchParams(preserveParams);
  const chemin = urlAvecPage(basePath, page);

  if (params.size === 0) {
    return chemin;
  }

  // urlAvecPage ne pose jamais `?page=1` explicitement — la page 1 avec filtres doit
  // quand même porter ces filtres dans l'URL, d'où la reconstruction ici plutôt qu'une
  // simple concaténation de chemin.
  if (page > 1) {
    params.set("page", String(page));
  }

  return `${basePath}?${params.toString()}`;
}

// Pagination Précédent/Suivant (Lot 1A) — partagée par /articles, /categorie/[slug],
// /zone/[slug] et /recherche. Absente du design de référence (aucune page paginée dans
// .dc.html) : style calqué sur les patrons déjà en place (bouton bordé "Réinitialiser les
// filtres" de /recherche), pas une nouvelle direction visuelle. Rendu entièrement omis
// s'il n'y a qu'une seule page (page 1 sans page suivante) — jamais un bloc de pagination
// vide affiché pour rien.
export function PaginationLinks({ basePath, currentPage, hasNextPage, preserveParams }: PaginationLinksProps) {
  if (currentPage === 1 && !hasNextPage) {
    return null;
  }

  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-between gap-4 border-t border-border pt-6">
      <div>
        {currentPage > 1 && (
          <Link
            href={construireHref(basePath, currentPage - 1, preserveParams)}
            className="rounded-md border border-border px-4 py-2 text-sm text-text-secondary outline-none transition-colors duration-fast hover:border-accent-primary hover:text-accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
          >
            ← Précédent
          </Link>
        )}
      </div>

      <div>
        {hasNextPage && (
          <Link
            href={construireHref(basePath, currentPage + 1, preserveParams)}
            className="rounded-md border border-border px-4 py-2 text-sm text-text-secondary outline-none transition-colors duration-fast hover:border-accent-primary hover:text-accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
          >
            Suivant →
          </Link>
        )}
      </div>
    </nav>
  );
}
