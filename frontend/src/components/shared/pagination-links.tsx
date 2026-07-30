import Link from "next/link";
import { urlAvecPageEtFiltres } from "@/lib/pagination";

export type PaginationLinksProps = {
  basePath: string;
  currentPage: number;
  hasNextPage: boolean;
  // Filtres actifs à reporter sur les liens Précédent/Suivant (ex. /recherche : q,
  // catégorie, zone, type, tri) — absent pour /articles, /categorie/[slug], /zone/[slug],
  // qui n'ont aucun filtre à préserver.
  preserveParams?: Record<string, string>;
};

// La construction d'URL vit désormais dans src/lib/pagination.ts (urlAvecPageEtFiltres) :
// le canonical auto-référent d'une page de listing filtrée doit suivre exactement la même
// règle que ces liens, un seul constructeur pour les deux.

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
            href={urlAvecPageEtFiltres(basePath, currentPage - 1, preserveParams)}
            className="rounded-md border border-border px-4 py-2 text-sm text-text-secondary outline-none transition-colors duration-fast hover:border-accent-primary hover:text-accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
          >
            ← Précédent
          </Link>
        )}
      </div>

      <div>
        {hasNextPage && (
          <Link
            href={urlAvecPageEtFiltres(basePath, currentPage + 1, preserveParams)}
            className="rounded-md border border-border px-4 py-2 text-sm text-text-secondary outline-none transition-colors duration-fast hover:border-accent-primary hover:text-accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
          >
            Suivant →
          </Link>
        )}
      </div>
    </nav>
  );
}
