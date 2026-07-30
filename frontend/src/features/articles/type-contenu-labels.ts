import type { TypeContenu } from "@prisma/client";

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

// Validation d'un `type` reçu en paramètre d'URL, adossée à TYPE_CONTENU_LABELS ci-dessus
// — jamais à une seconde liste qui dériverait en silence (cf. B5). Placée ici plutôt que
// dans src/lib/filtres-publics.ts : elle dépend d'une constante métier, et `src/lib` reste
// volontairement vierge de toute connaissance du domaine. Déplacée depuis search-articles.ts
// (où elle était privée) au moment où les pages de listing en ont eu besoin à leur tour.
export function estTypeContenuValide(value: string | undefined): value is TypeContenu {
  return value !== undefined && value in TYPE_CONTENU_LABELS;
}
