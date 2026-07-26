// Libellés du type de contenu — union fermée article/analyse/enquête/interview/
// dossier_thematique/rapport (REPO-1 : valeur `rapport` et libellés `article`/
// `dossier_thematique` alignés sur TYPES de Corne de l'Afrique.dc.html, règle
// de fidélité design). Reprend telles quelles les valeurs déjà affichées par le
// sélecteur de l'Éditeur d'article (article-content-form.tsx) — un seul
// vocabulaire de libellés, pas une seconde traduction divergente.
export const TYPE_CONTENU_LABELS: Record<string, string> = {
  article: "Actualité",
  analyse: "Analyse",
  enquete: "Enquête",
  interview: "Interview",
  dossier_thematique: "Dossier",
  rapport: "Rapport",
};
