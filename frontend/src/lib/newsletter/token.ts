import { randomBytes } from "node:crypto";

// Génération du jeton de désinscription (server-actions-specification.md §6.1/§6.2).
// Même taille d'entropie que le jeton de Session administrateur (src/lib/auth/token.ts,
// 32 octets), mais responsabilité distincte : ce jeton est stocké EN CLAIR en base
// (inscrit_newsletter.jeton_desinscription, database-schema.md §4.7) et comparé par
// recherche directe en base — jamais haché, jamais signé (security-specification.md §4 :
// « nécessaire à la recherche directe par valeur depuis l'URL »). Aucune fonction de
// hachage/signature ici, contrairement à auth/token.ts.
const NEWSLETTER_TOKEN_BYTES = 32;

export function generateNewsletterToken(): string {
  return randomBytes(NEWSLETTER_TOKEN_BYTES).toString("hex");
}
