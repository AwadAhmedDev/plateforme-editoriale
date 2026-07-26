import { aProposContent } from "../a-propos/content";

// Contenu éditorial des Mentions légales — même convention que a-propos/content.ts :
// séparé de page.tsx, réutilise le placeholder de contact déjà établi
// (aProposContent.contact.email) plutôt qu'une seconde adresse inventée. Identité de
// l'éditeur, adresse et hébergeur restent des placeholders explicites entre crochets :
// aucune identité, adresse ou numéro d'immatriculation inventé et présenté comme réel —
// à remplacer par les données réelles de l'exploitant du site avant mise en production
// (obligation légale LCEN, non une simple préférence éditoriale).
export const mentionsLegalesContent = {
  editeur: {
    titre: "Éditeur du site",
    paragraphes: [
      "[Nom et prénom, ou raison sociale de l'éditeur]",
      "[Adresse postale complète]",
      "[Numéro SIRET, le cas échéant]",
      `Contact : ${aProposContent.contact.email}`,
    ],
  },
  directeurPublication: {
    titre: "Directeur de la publication",
    paragraphes: [
      "[Nom de l'éditeur], responsable éditorial unique de la publication (voir la page À propos).",
    ],
  },
  hebergement: {
    titre: "Hébergement",
    paragraphes: ["[Nom de l'hébergeur]", "[Adresse de l'hébergeur]"],
  },
  proprieteIntellectuelle: {
    titre: "Propriété intellectuelle",
    paragraphes: [
      "L'ensemble des contenus publiés sur ce site (textes, analyses, enquêtes, rapports, photographies) est protégé au titre du droit d'auteur. Toute reproduction, représentation ou diffusion, totale ou partielle, sans autorisation préalable est interdite, sous réserve des exceptions prévues par la loi (courtes citations, revue de presse).",
    ],
  },
  donneesPersonnelles: {
    titre: "Données personnelles",
    paragraphes: [
      "Le traitement des données personnelles collectées sur ce site (inscription à la newsletter) est détaillé dans la politique de confidentialité.",
    ],
  },
} as const;
