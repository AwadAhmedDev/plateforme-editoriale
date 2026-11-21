import { aProposContent } from "../a-propos/content";

// Contenu éditorial des Mentions légales — même convention que a-propos/content.ts :
// séparé de page.tsx. Site de démonstration non commercial, réalisé par Awad Ahmed pour
// l'éditeur Harbi Egueh Aouled : l'adresse postale n'est pas publiée, le contact passe par
// le formulaire du site. À compléter (adresse, statut) avant toute exploitation comme média.
export const mentionsLegalesContent = {
  editeur: {
    titre: "Éditeur du site",
    paragraphes: [
      "Harbi Egueh Aouled.",
      "Ce site est une démonstration non commerciale, conçue et développée par Awad Ahmed, développeur web : les articles sont des contenus de démonstration et ne constituent pas une source d'information.",
      `Contact : ${aProposContent.contact.libelle} (page Contact).`,
    ],
  },
  directeurPublication: {
    titre: "Directeur de la publication",
    paragraphes: ["Harbi Egueh Aouled."],
  },
  hebergement: {
    titre: "Hébergement",
    paragraphes: ["Hostinger International Ltd., 61 Lordou Vironos Street, 6023 Larnaca, Chypre (hostinger.fr)."],
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
