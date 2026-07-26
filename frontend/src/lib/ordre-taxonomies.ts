// Ordre éditorial des rubriques et des pays — reflète littéralement l'ordre des
// tableaux RUBRIQUES/COUNTRIES du script embarqué dans Corne de l'Afrique.dc.html
// (projet claude.ai/design 50021e4b-5bed-416c-93d9-5805e6bb0831), seule source de
// vérité UX/UI (docs/project/regle-fidelite-design.md). Consommé exclusivement par
// CategorieRepository.findAllWithArticleCount() et
// ZoneGeographiqueRepository.findAllWithArticleCount() — ne pas redéfinir ailleurs.
export const ORDRE_RUBRIQUES: readonly string[] = [
  "asile", "migrations", "droits-humains", "juridique", "analyses-pays", "interviews",
];

export const ORDRE_PAYS: readonly string[] = [
  "somalie", "djibouti", "somaliland", "ethiopie", "erythree", "kenya", "soudan", "regional",
];
