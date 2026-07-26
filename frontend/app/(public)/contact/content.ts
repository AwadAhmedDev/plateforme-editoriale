// Contenu éditorial de la page Contact (REPO-7, Corne de l'Afrique.dc.html l.404-412) :
// séparé de page.tsx, même convention que a-propos/content.ts. L'adresse affichée réutilise
// le placeholder déjà établi par a-propos/content.ts (aProposContent.contact.email) plutôt
// que le domaine fictif du design ("redaction@corne-afrique.info") — un seul placeholder de
// contact dans le projet, jamais une seconde adresse inventée présentée comme réelle.
export const contactContent = {
  eyebrow: "Contact",
  titre: "Écrivez à la rédaction",
  intro:
    "Une information à transmettre, une demande d'accès documentaire, un partenariat institutionnel ou une proposition d'entretien ? La rédaction vous répond.",
  coordonnees: [
    { label: "Sécurisé", valeur: "Contact chiffré disponible sur demande" },
    { label: "Suivre", valeur: "X · LinkedIn · Telegram" },
  ],
} as const;
