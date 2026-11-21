import { aProposContent } from "../a-propos/content";

// Contenu éditorial des Mentions légales — même convention que a-propos/content.ts :
// séparé de page.tsx. Site de démonstration non commercial (portfolio) : l'éditeur est
// une personne physique sans activité commerciale, d'où l'absence de SIRET ; l'adresse
// postale n'est pas publiée, le contact passe par le formulaire du site (LCEN art. 6 III-2
// pour les éditeurs non professionnels). À remplacer par l'identité de l'exploitant réel
// avant toute exploitation comme média.
export const mentionsLegalesContent = {
  editeur: {
    titre: "Éditeur du site",
    paragraphes: [
      "Awad Ahmed, développeur web, particulier sans activité commerciale.",
      "Ce site est une démonstration réalisée pour un portfolio : les articles sont des contenus de démonstration et ne constituent pas une source d'information.",
      `Contact : ${aProposContent.contact.libelle} (page Contact).`,
    ],
  },
  directeurPublication: {
    titre: "Directeur de la publication",
    paragraphes: ["Awad Ahmed."],
  },
  hebergement: {
    titre: "Hébergement",
    paragraphes: ["Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis (vercel.com)."],
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
