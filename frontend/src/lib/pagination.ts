// Normalisation de page publique (Lot 1A) : utilisé par /articles, /categorie/[slug],
// /zone/[slug] et /recherche. Une valeur mal formée (absente, non entière, < 1) est
// silencieusement ramenée à la page 1 — ce n'est pas une "page inexistante" au sens
// notFound(), seulement un paramètre d'URL invalide. Seule une page bien formée mais hors
// bornes (comparée à la page réellement servie, déjà clampée par le Repository) doit
// déclencher notFound() côté page — cette fonction ne fait que la lecture/normalisation.
export function normaliserPageDemandee(value: string | string[] | undefined): number {
  const brut = Array.isArray(value) ? value[0] : value;
  const page = Number(brut);
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

// Construit l'URL d'une page donnée : jamais de `?page=1` explicite (la page 1 est
// toujours l'URL nue), pour qu'une seule URL canonique existe par page réelle — évite
// /articles et /articles?page=1 de coexister comme deux URLs distinctes pour un même
// contenu.
export function urlAvecPage(path: string, page: number): string {
  return page > 1 ? `${path}?page=${page}` : path;
}
