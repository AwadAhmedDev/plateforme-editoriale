// Contenu éditorial de l'accroche de l'Accueil (Lot Homepage, contrat
// validé) : séparé de page.tsx pour rester remplaçable sans toucher à la
// structure — même principe que a-propos/content.ts, colocalisé au même
// niveau que le page.tsx qu'il sert. Emplacement autorisé de
// color.accent.warm pour l'accroche éditoriale phare
// (ui-specification.md §Couleurs) ; le texte reprend l'esprit déjà validé
// par a-propos/content.ts (mission), pas une nouvelle affirmation
// factuelle.
export const accueilContent = {
  accroche: {
    texte: "La référence francophone sur l'actualité et la documentation de la Corne de l'Afrique.",
  },
} as const;
