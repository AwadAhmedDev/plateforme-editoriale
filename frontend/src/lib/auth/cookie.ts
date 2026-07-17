import { cookies } from "next/headers";
import { signSessionToken, verifySignedCookieValue } from "@/lib/auth/token";

// Cookie de Session administrateur : httpOnly, signé (technical-architecture.md
// §1.2/§4.3). Ne contient que le jeton brut + sa signature — aucune donnée
// sensible (pas d'identifiant, pas de rôle, pas de mot de passe).
//
// Pas de `maxAge`/`expires` explicite : c'est un cookie de session navigateur.
// L'expiration réelle (DR-002) est appliquée côté serveur, contre
// `derniereActiviteAt`, jamais déléguée à la durée de vie du cookie côté client.
const SESSION_COOKIE_NAME = "admin_session";

function isProductionEnvironment(): boolean {
  return process.env.NODE_ENV === "production";
}

/** Pose le cookie de session. Utilisable uniquement dans une Server Action/Route Handler. */
export async function setSessionCookie(rawToken: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, signSessionToken(rawToken), {
    httpOnly: true,
    secure: isProductionEnvironment(),
    sameSite: "lax",
    path: "/",
  });
}

/** Lit et vérifie le cookie de session. Retourne le jeton brut, ou `null` si absent/invalide. */
export async function readSessionCookie(): Promise<string | null> {
  const store = await cookies();
  const value = store.get(SESSION_COOKIE_NAME)?.value;
  if (!value) {
    return null;
  }
  return verifySignedCookieValue(value);
}

/** Supprime le cookie de session. Utilisable uniquement dans une Server Action/Route Handler. */
export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
}
