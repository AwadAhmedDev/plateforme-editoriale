// Démo publique (portfolio) : bandeau « démonstration » et compte administrateur de
// démonstration affiché sur la page de connexion. Actif par défaut en production ;
// DEMO_MODE=false pour un site réellement exploité.
export const DEMO_MODE = process.env.DEMO_MODE
  ? process.env.DEMO_MODE === "true"
  : process.env.NODE_ENV === "production";

// Compte en consultation seule (voir refusSiCompteDemo) : il ne publie rien et ne voit
// aucune donnée personnelle des visiteurs.
export const DEMO_ADMIN = { identifiant: "demo", motDePasse: "DemoEdito2026" } as const;

export const DEMO_REFUS = {
  status: "error",
  message: "Compte de démonstration : consultation seule, aucune modification n'est enregistrée.",
} as const;

export const DEMO_MASQUE = "masqué (démo)";
