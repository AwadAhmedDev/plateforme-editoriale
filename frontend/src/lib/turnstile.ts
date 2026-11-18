// Vérification serveur du jeton Cloudflare Turnstile (anti-robot) —
// https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
//
// shortcut: si TURNSTILE_SECRET_KEY est absente, la vérification est ignorée (le
// honeypot reste actif) pour ne pas bloquer les formulaires d'un environnement pas encore
// configuré. À renseigner obligatoirement en production.
export async function verifyTurnstile(formData: FormData): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn("[turnstile] TURNSTILE_SECRET_KEY absente : vérification anti-robot ignorée.");
    return true;
  }

  const token = String(formData.get("cf-turnstile-response") ?? "");
  if (!token) return false;

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token }),
      signal: AbortSignal.timeout(10_000),
    });
    const result = (await response.json()) as { success?: boolean };
    return result.success === true;
  } catch (error) {
    // Cloudflare injoignable : on refuse plutôt que d'ouvrir la porte aux robots.
    console.error("[turnstile] Vérification impossible.", error);
    return false;
  }
}
