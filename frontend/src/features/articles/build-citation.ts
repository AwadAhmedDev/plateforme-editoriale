// Texte de citation d'un article (REPO-5, B20 : Corne de l'Afrique.dc.html l.223-225,
// "Citer cet article") — généré depuis titre/auteur/date/URL déjà disponibles sur
// ArticleDetailViewModel, aucun nouveau champ en base. `auteur`/`date` restent
// facultatifs (jamais garantis, cf. get-article-detail.ts) : chaque segment absent est
// omis proprement, jamais un "undefined" ou une virgule orpheline dans le résultat.
export function construireCitation(params: {
  titre: string;
  auteur: string | null;
  dateFormatee: string | null;
  url: string;
}): string {
  const prefixeAuteur = params.auteur ? `${params.auteur}, ` : "";
  const suffixeDate = params.dateFormatee ? `, ${params.dateFormatee}` : "";

  return `${prefixeAuteur}« ${params.titre} », Corne de l'Afrique${suffixeDate}. ${params.url}`;
}
