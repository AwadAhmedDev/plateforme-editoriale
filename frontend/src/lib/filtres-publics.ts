// Lecture et validation des paramètres de filtre publics — point unique de vérité,
// partagé par app/(public)/recherche/page.tsx et, à venir, les pages de listing
// (/articles, /categorie/[slug], /zone/[slug]). Même rôle et même emplacement que
// src/lib/pagination.ts, créé au Lot 1A pour la lecture du paramètre `page` : de la
// logique d'URL transverse aux features, jamais rattachée à l'une d'elles.
//
// Module feuille, sans aucun import : `src/lib` ne connaît rien du domaine métier. La
// validation d'un type de contenu reste volontairement hors de ce fichier — elle
// dépendrait de TYPE_CONTENU_LABELS, donc d'une feature.

// Normalise une valeur brute de `searchParams` en chaîne exploitable. Un paramètre
// répété (`?type=a&type=b`) arrive sous forme de tableau : seule la première occurrence
// est retenue — jamais une tentative de combiner des valeurs concurrentes.
export function lireParam(value: string | string[] | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

// Bornes de date de /recherche (Lot 2A) : `YYYY-MM-DD` est le seul format que produise
// `<input type="date">`, donc le seul accepté. Toute autre valeur est ignorée
// silencieusement (traitée comme absente), exactement comme les paramètres typeContenu et
// sort de search-articles.ts — un paramètre d'URL invalide n'est jamais une erreur ni un 404.
//
// Bornes calculées en UTC, jamais dans le fuseau du serveur : une même URL doit produire
// le même résultat quelle que soit la machine qui rend la page.
//
// `fin` est portée à 23:59:59.999 alors que `debut` reste à minuit : le repository applique
// `date_publication <= dateTo` sur un timestamp, donc un `au=2026-01-15` laissé à minuit
// exclurait tous les contenus publiés *le* 15 janvier. C'est le seul piège de ce filtre.
export function analyserJour(value: string | undefined): { debut: Date; fin: Date } | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }

  const [annee, mois, jour] = value.split("-").map(Number);
  const debut = new Date(Date.UTC(annee, mois - 1, jour));

  // Rejette une date bien formée mais inexistante (2026-02-30, 2026-13-01), que Date.UTC
  // reporterait silencieusement sur le mois suivant au lieu de la refuser.
  if (
    debut.getUTCFullYear() !== annee ||
    debut.getUTCMonth() !== mois - 1 ||
    debut.getUTCDate() !== jour
  ) {
    return undefined;
  }

  return { debut, fin: new Date(Date.UTC(annee, mois - 1, jour, 23, 59, 59, 999)) };
}

// Exposée pour les pages qui rendent un champ de date : elles doivent savoir si une borne
// est valide sans dupliquer la règle de validation — pour ne réafficher dans le champ, et
// ne reporter sur les liens de pagination, qu'une valeur réellement prise en compte.
// Retourne la chaîne inchangée (jamais une date reformatée) : c'est la valeur qui doit
// repartir telle quelle dans l'URL et dans `<input type="date">`.
export function normaliserJour(value: string | undefined): string | undefined {
  return analyserJour(value) ? value : undefined;
}
