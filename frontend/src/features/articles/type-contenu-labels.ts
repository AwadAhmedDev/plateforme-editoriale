// Libellés du type de contenu (ui-specification.md §Formulaires : "Type de
// contenu... union fermée article/analyse/enquête/interview/dossier
// thématique"). Reprend telles quelles les valeurs déjà affichées par le
// sélecteur de l'Éditeur d'article (article-content-form.tsx) — un seul
// vocabulaire de libellés, pas une seconde traduction divergente.
export const TYPE_CONTENU_LABELS: Record<string, string> = {
  article: "Article",
  analyse: "Analyse",
  enquete: "Enquête",
  interview: "Interview",
  dossier_thematique: "Dossier thématique",
};
