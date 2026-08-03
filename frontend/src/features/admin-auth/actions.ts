"use server";

import { AdminRepository } from "@/lib/db/admin-repository";
import { SessionRepository } from "@/lib/db/session-repository";
import { EtranglementConnexionRepository } from "@/lib/db/etranglement-connexion-repository";
import { verifyPassword } from "@/lib/auth/password";
import { generateSessionToken, hashSessionToken } from "@/lib/auth/token";
import { setSessionCookie, clearSessionCookie, readSessionCookie } from "@/lib/auth/cookie";

// Server Actions d'authentification administrateur (server-actions-specification.md §1.1-§1.2).
// Message générique unique, sans jamais désigner le champ fautif (ui-specification.md,
// security-specification.md §9 — protection contre l'énumération).
const GENERIC_LOGIN_ERROR = "Identifiant ou mot de passe incorrect";

// Hash bcrypt de secours, comparé quand l'identifiant est inconnu, pour que le
// temps de réponse ne révèle jamais l'existence du compte (security-specification.md
// §9 : « comparaison de hachage systématique même en l'absence de correspondance »).
//
// Constante figée, et non plus calculée puis mémoïsée au premier appel : la mémoïsation
// faisait payer un `bcrypt.hash` complet à la première tentative suivant chaque démarrage à
// froid, donc environ le double du temps d'un identifiant connu. Les démarrages à froid
// étant fréquents en serverless, c'était un canal d'énumération mesurable. Hash d'une valeur
// aléatoire que personne ne détient : ce n'est pas un secret, et il n'ouvre aucun accès.
const DUMMY_PASSWORD_HASH = "$2b$12$VHu/Zhjmdgs6MVNR56MZXOS92QWEyXHc86JNNPNgoGIPnHeNIppr.";

// Étranglement des tentatives de connexion (security-specification.md §10, point
// d'arbitrage tranché). Délai progressif, jamais de verrouillage : sur un site à
// administrateur unique, un blocage serait retournable contre le propriétaire, sans second
// compte pour le lever. Le bon mot de passe finit donc toujours par passer.
//
// Plafond dimensionné pour le plan Vercel le plus contraint : bcryptjs à coût 12 consomme
// déjà jusqu'à ~1,5 s, plafond de 2 s = ~3,5 s au pire, sous la limite de 10 s.
const SEUIL_ECHECS = 3;
const DELAI_BASE_MS = 500;
const DELAI_PLAFOND_MS = 2_000;
const FENETRE_DECROISSANCE_MINUTES = 15;

// Progression exponentielle plafonnée, à partir du seuil. 3 échecs → 500 ms, 4 → 1 s,
// 5 et au-delà → 2 s. En deçà du seuil, aucune attente : trois essais francs couvrent la
// faute de frappe et le verrouillage majuscules sans pénaliser l'usage normal.
function calculerDelaiMs(echecs: number): number {
  if (echecs < SEUIL_ECHECS) {
    return 0;
  }
  return Math.min(DELAI_PLAFOND_MS, DELAI_BASE_MS * 2 ** (echecs - SEUIL_ECHECS));
}

function attendre(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Journalisation des tentatives (security-specification.md §13.1). N'écrit jamais le mot de
// passe soumis, `mot_de_passe_hash`, `jeton_hash` ni la valeur brute du cookie (§13.2).
// L'identifiant soumis n'est pas journalisé non plus : le compteur porte l'information utile
// sans écrire en clair une donnée fournie par l'attaquant.
function journaliserTentative(donnees: Record<string, unknown>): void {
  console.info(JSON.stringify({ evenement: "connexion_admin", ...donnees }));
}

export type AdminLoginResult = { success: true } | { success: false; error: string };

export async function adminLogin(identifiant: string, motDePasse: string): Promise<AdminLoginResult> {
  if (
    typeof identifiant !== "string" ||
    identifiant.trim().length === 0 ||
    typeof motDePasse !== "string" ||
    motDePasse.length === 0
  ) {
    return { success: false, error: GENERIC_LOGIN_ERROR };
  }

  // Identifiant recherché sous la même forme que celle déjà validée juste au-dessus :
  // la validation portait sur `identifiant.trim()` mais la recherche utilisait la valeur
  // brute, si bien qu'un espace ajouté par un clavier logiciel (barre de suggestions
  // mobile) suffisait à ne rien trouver en base. Le mot de passe, lui, n'est jamais
  // normalisé : un espace y est un caractère significatif.
  //
  // Normalisation appliquée avant la recherche, donc identiquement que l'identifiant
  // existe ou non : la séquence commune aux deux branches d'échec (§9) reste intacte.
  const administrateur = await AdminRepository.findByIdentifiant(identifiant.trim());
  const passwordHashToCompare = administrateur?.motDePasseHash ?? DUMMY_PASSWORD_HASH;
  const passwordValid = await verifyPassword(motDePasse, passwordHashToCompare);

  // Échec, quelle qu'en soit la cause : identifiant inconnu et mot de passe erroné
  // empruntent STRICTEMENT la même séquence — même instruction d'incrément, même état
  // consulté, même délai, même message. C'est ce qui interdit de distinguer les deux par
  // chronométrage, et donc de découvrir l'existence d'un identifiant (§9). Toute
  // divergence introduite ici entre les deux branches rouvrirait le canal d'énumération.
  if (!administrateur || !passwordValid) {
    const echecs = await EtranglementConnexionRepository.incrementerEchec(
      FENETRE_DECROISSANCE_MINUTES
    );

    // Ligne d'état absente : ouverture, jamais fermeture. Un échec fermé signifierait
    // l'exclusion définitive de l'unique administrateur, sans second compte pour la lever.
    // L'anomalie est journalisée — c'est le seul garde-fou de ce repli.
    if (echecs === null) {
      journaliserTentative({ issue: "echec", anomalie: "etat_etranglement_absent" });
      return { success: false, error: GENERIC_LOGIN_ERROR };
    }

    const delaiMs = calculerDelaiMs(echecs);
    journaliserTentative({ issue: "echec", echecsConsecutifs: echecs, delaiMs });

    if (delaiMs > 0) {
      await attendre(delaiMs);
    }

    return { success: false, error: GENERIC_LOGIN_ERROR };
  }

  // Réussite : compteur remis à zéro, aucune attente. L'administrateur légitime n'est jamais
  // pénalisé pour ses propres erreurs passées dès lors qu'il finit par réussir. Retarder une
  // réussite serait par ailleurs sans objet — elle se révèle d'elle-même par la session
  // ouverte, et §9 protège l'existence du compte, pas l'issue de la tentative.
  await EtranglementConnexionRepository.reinitialiser();

  const token = generateSessionToken();
  await SessionRepository.create({
    administrateurId: administrateur.id,
    jetonHash: hashSessionToken(token),
  });

  await setSessionCookie(token);

  journaliserTentative({ issue: "succes" });

  return { success: true };
}

export async function adminLogout(): Promise<{ success: true }> {
  const rawToken = await readSessionCookie();

  if (rawToken) {
    // Déconnexion toujours réalisable, y compris si la session était déjà absente
    // (ex. expirée entre-temps) — aucune erreur prévue (server-actions-specification.md §1.2).
    await SessionRepository.deleteByJetonHash(hashSessionToken(rawToken)).catch(() => {});
  }

  await clearSessionCookie();

  return { success: true };
}
