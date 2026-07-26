// Contenu éditorial de la page Méthodologie (REPO-7, Corne de l'Afrique.dc.html l.386-398),
// séparé de page.tsx — même convention que a-propos/content.ts. Trois sous-sections sur les
// quatre du design : "Accès professionnel" (rapports pays/fiches juridiques réservés sur
// inscription aux professionnels) est explicitement hors périmètre MVP
// (plan-implementation-repositionnement-asile.md §E : justifie conceptuellement le badge
// "Accès sur inscription", système de comptes utilisateurs absent du MVP) — omise plutôt que
// reformulée, pour ne pas laisser croire à une fonctionnalité qui n'existe pas.
export const methodologieContent = {
  eyebrow: "Méthodologie",
  titre: "Comment nous produisons l'information",
  intro:
    "Corne de l'Afrique documente l'asile, les migrations et les droits humains dans la région avec une exigence de rigueur pensée pour être citée par des juristes, des institutions et des chercheurs.",
  sections: [
    {
      titre: "Sourcing et vérification",
      texte:
        "Chaque publication s'appuie sur des sources ouvertes recoupées, des entretiens de terrain et, lorsque c'est pertinent, des documents officiels. Les faits contestés sont signalés comme tels.",
    },
    {
      titre: "Indépendance éditoriale",
      texte:
        "La rédaction ne reçoit aucune instruction d'un gouvernement, d'une organisation d'aide ou d'un acteur qu'elle couvre. Les liens d'intérêt éventuels sont mentionnés en fin d'article.",
    },
    {
      titre: "Mise à jour et traçabilité",
      texte:
        "Chaque article porte sa date de publication et une URL stable. Les analyses et rapports pays sont revus lorsque la situation évolue significativement.",
    },
  ],
} as const;
