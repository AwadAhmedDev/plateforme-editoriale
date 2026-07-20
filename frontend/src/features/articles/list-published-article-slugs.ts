import { ContenuEditorialRepository } from "@/lib/db/contenu-editorial-repository";

export type PublishedArticleSlug = {
  slug: string;
  dateDerniereModification: Date;
};

// Lecture publique pour app/sitemap.ts (Lot L7e, contrat validé) : réutilise
// ContenuEditorialRepository.findManyPublished sans modification (statut
// 'publie' déjà non contournable côté repository), en cumulant l'ensemble
// des pages plutôt qu'une seule — aucune méthode repository existante ne
// retourne la liste complète en un seul appel. La boucle dépend uniquement
// de `hasNextPage`, jamais de la taille de page (privée au repository).
export async function listPublishedArticleSlugs(): Promise<PublishedArticleSlug[]> {
  const slugs: PublishedArticleSlug[] = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const resultat = await ContenuEditorialRepository.findManyPublished({ page });

    slugs.push(
      ...resultat.items.map((item) => ({
        slug: item.slug,
        dateDerniereModification: item.dateDerniereModification,
      }))
    );

    hasNextPage = resultat.hasNextPage;
    page += 1;
  }

  return slugs;
}
