// Contenu éditorial de la page À propos (Lot 6.1, contrat consolidé §3/§4) :
// séparé de page.tsx pour rester facilement remplaçable sans toucher à la
// structure. Mission reprise telle quelle du positionnement déjà rédigé et
// validé par design-brief.md — pas une invention. Éditeur et contact restent
// des placeholders explicites entre crochets : aucune identité ni adresse
// fonctionnelle inventée et présentée comme réelle.
export const aProposContent = {
  mission: {
    titre: "Notre mission",
    paragraphes: [
      "Ce média a pour ambition de devenir la référence francophone sur la Corne de l'Afrique, en centralisant des contenus aujourd'hui dispersés sur différents canaux numériques, au profit d'une information fiable, vérifiée et documentée.",
      "Il couvre l'actualité, l'analyse et la documentation d'une région sous-représentée dans la presse francophone.",
    ],
  },
  methodologie: {
    titre: "Méthodologie & rigueur éditoriale",
    paragraphes: [
      "Chaque contenu publié s'appuie sur des sources vérifiées et documentées.",
      "La ligne éditoriale privilégie la transparence sur l'origine et les limites des informations rapportées.",
    ],
  },
  editeur: {
    titre: "L'éditeur",
    texte:
      "Ce média est édité et administré par [Nom de l'éditeur], responsable éditorial unique de la publication.",
  },
  contact: {
    email: "redaction@[votre-domaine].com",
  },
} as const;
