import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

// Utilitaires cryptographiques purs (aucune dépendance Next.js/Prisma) pour la
// Session administrateur : génération du jeton, hachage pour stockage en base
// (session_administrateur.jeton_hash, database-schema.md §4.4) et signature du
// cookie (technical-architecture.md §1.2/§4.3 : « cookie httpOnly, signé »).
//
// Une seule variable d'environnement secrète (SESSION_SECRET, security-specification.md
// §11) sert de clé pour les deux usages, avec une séparation de domaine (préfixe de
// contexte distinct par usage) pour que le hash stocké en base et la signature du
// cookie ne soient jamais la même valeur dérivée.

const SESSION_TOKEN_BYTES = 32;

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET est manquante : requise pour hacher et signer les jetons de session (security-specification.md §11)."
    );
  }
  return secret;
}

function hmac(purpose: string, value: string): string {
  return createHmac("sha256", getSessionSecret()).update(`${purpose}:${value}`).digest("hex");
}

/** Génère un jeton de session brut, à haute entropie (32 octets aléatoires). */
export function generateSessionToken(): string {
  return randomBytes(SESSION_TOKEN_BYTES).toString("hex");
}

/** Hash déterministe du jeton, seule forme stockée en base (jeton_hash). */
export function hashSessionToken(token: string): string {
  return hmac("session-token-hash", token);
}

/** Valeur signée à poser dans le cookie : `<jeton>.<signature>`. */
export function signSessionToken(token: string): string {
  return `${token}.${hmac("session-cookie-signature", token)}`;
}

/**
 * Vérifie la signature d'une valeur de cookie et retourne le jeton brut si elle
 * est valide, `null` sinon. Comparaison en temps constant pour éviter un canal
 * temporel sur la signature.
 */
export function verifySignedCookieValue(signedValue: string): string | null {
  const separatorIndex = signedValue.lastIndexOf(".");
  if (separatorIndex === -1) {
    return null;
  }

  const token = signedValue.slice(0, separatorIndex);
  const providedSignature = signedValue.slice(separatorIndex + 1);
  const expectedSignature = hmac("session-cookie-signature", token);

  const provided = Buffer.from(providedSignature, "hex");
  const expected = Buffer.from(expectedSignature, "hex");
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return null;
  }

  return token;
}
