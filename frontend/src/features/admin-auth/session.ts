import { SessionRepository } from "@/lib/db/session-repository";
import { readSessionCookie } from "@/lib/auth/cookie";
import { hashSessionToken } from "@/lib/auth/token";

// Fonction de lecture transversale (server-actions-specification.md §1.3, « Garde
// d'accès session ») : récupère, valide et rafraîchit la Session administrateur
// courante. Ne lit/n'écrit jamais le cookie lui-même (uniquement via src/lib/auth/cookie.ts) ;
// n'effectue aucune écriture de cookie, pour rester appelable depuis un Server
// Component (lecture seule côté cookies) aussi bien que depuis une Server Action.
export type CurrentSession =
  | { authenticated: true; administrateurId: string; sessionId: string }
  | { authenticated: false };

function getInactivityTimeoutMs(): number {
  const raw = process.env.SESSION_INACTIVITY_TIMEOUT_MINUTES;
  if (!raw) {
    throw new Error(
      "SESSION_INACTIVITY_TIMEOUT_MINUTES est manquante : durée d'inactivité (DR-002) devant être " +
        "explicitement configurée, jamais une valeur par défaut non documentée (security-specification.md §2, §14)."
    );
  }
  const minutes = Number(raw);
  if (!Number.isFinite(minutes) || minutes <= 0) {
    throw new Error("SESSION_INACTIVITY_TIMEOUT_MINUTES doit être un nombre de minutes strictement positif.");
  }
  return minutes * 60 * 1000;
}

export async function getCurrentSession(): Promise<CurrentSession> {
  const rawToken = await readSessionCookie();
  if (!rawToken) {
    return { authenticated: false };
  }

  const jetonHash = hashSessionToken(rawToken);
  const session = await SessionRepository.findByJetonHash(jetonHash);
  if (!session) {
    return { authenticated: false };
  }

  const elapsedMs = Date.now() - session.derniereActiviteAt.getTime();
  if (elapsedMs > getInactivityTimeoutMs()) {
    // Session expirée par inactivité (DR-002) : la ligne est purgée ; le cookie
    // périmé côté client reste sans effet (plus aucune ligne à retrouver) et sera
    // explicitement nettoyé par la future garde d'accès (hors périmètre ici).
    await SessionRepository.deleteByJetonHash(jetonHash).catch(() => {});
    return { authenticated: false };
  }

  await SessionRepository.updateDerniereActivite(jetonHash, new Date());

  return {
    authenticated: true,
    administrateurId: session.administrateurId,
    sessionId: session.id,
  };
}
