// Résolution de l'URL absolue du site (Lot L7a, contrat validé ; déplacé
// depuis app/layout.tsx au Lot L7d pour être réutilisé par le JSON-LD de
// app/(public)/articles/[slug]/page.tsx) — point unique de vérité, jamais
// recalculé route par route. SITE_URL présente → utilisée telle quelle.
// Absente en développement → repli sur http://localhost:3000 (valeur
// techniquement exacte, pas une donnée inventée). Absente en production →
// erreur explicite au chargement du module (donc dès `next build`, avant
// tout déploiement) plutôt qu'un repli silencieux vers localhost dans des
// URLs canoniques/Open Graph publiées.
export function resoudreSiteUrl(): URL {
  const siteUrl = process.env.SITE_URL;
  if (siteUrl) {
    return new URL(siteUrl);
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SITE_URL doit être définie en production (canonical/Open Graph/Twitter en dépendent) — aucun repli n'est accepté hors développement."
    );
  }
  return new URL("http://localhost:3000");
}
