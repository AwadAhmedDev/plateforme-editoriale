"use server";

import { randomBytes } from "node:crypto";
import { AdminRepository } from "@/lib/db/admin-repository";
import { SessionRepository } from "@/lib/db/session-repository";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { generateSessionToken, hashSessionToken } from "@/lib/auth/token";
import { setSessionCookie, clearSessionCookie, readSessionCookie } from "@/lib/auth/cookie";

// Server Actions d'authentification administrateur (server-actions-specification.md §1.1-§1.2).
// Message générique unique, sans jamais désigner le champ fautif (ui-specification.md,
// security-specification.md §9 — protection contre l'énumération).
const GENERIC_LOGIN_ERROR = "Identifiant ou mot de passe incorrect";

// Hash bcrypt de secours, comparé quand l'identifiant est inconnu, pour que le
// temps de réponse ne révèle jamais l'existence du compte (security-specification.md
// §9 : « comparaison de hachage systématique même en l'absence de correspondance »).
let dummyPasswordHash: Promise<string> | null = null;
function getDummyPasswordHash(): Promise<string> {
  if (!dummyPasswordHash) {
    dummyPasswordHash = hashPassword(randomBytes(32).toString("hex"));
  }
  return dummyPasswordHash;
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

  const administrateur = await AdminRepository.findByIdentifiant(identifiant);
  const passwordHashToCompare = administrateur?.motDePasseHash ?? (await getDummyPasswordHash());
  const passwordValid = await verifyPassword(motDePasse, passwordHashToCompare);

  if (!administrateur || !passwordValid) {
    return { success: false, error: GENERIC_LOGIN_ERROR };
  }

  const token = generateSessionToken();
  await SessionRepository.create({
    administrateurId: administrateur.id,
    jetonHash: hashSessionToken(token),
  });

  await setSessionCookie(token);

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
