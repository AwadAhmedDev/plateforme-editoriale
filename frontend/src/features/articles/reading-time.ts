const MOTS_PAR_MINUTE = 200;

// Temps de lecture estimé (REPO-4, Corne de l'Afrique.dc.html : {{ item.readTime }} sur
// le hero, la grille, le bandeau analyses et la liste "Dernières publications") — dérivé
// du nombre de mots de `corps`, jamais une donnée stockée : aucun champ "temps de
// lecture" n'existe dans domain-model.md/le schéma Prisma, et ce lot n'en ajoute pas.
// Minimum 1 min même pour un corps très court ou vide, jamais "0 min de lecture".
export function estimerTempsLecture(corps: string | null): string {
  const nombreMots = corps ? corps.trim().split(/\s+/).filter(Boolean).length : 0;
  const minutes = Math.max(1, Math.round(nombreMots / MOTS_PAR_MINUTE));
  return `${minutes} min de lecture`;
}
