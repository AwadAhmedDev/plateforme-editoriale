import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCurrentSession } from "@/features/admin-auth/session";

// Garde d'accès de premier niveau, en amont des routes (technical-architecture.md §4.3,
// security-specification.md §2 : « vérification à deux niveaux »). Renommé de `middleware`
// à `proxy` en Next.js 16 (node_modules/next/dist/docs/.../file-conventions/proxy.md) —
// s'exécute en runtime Node.js par défaut, donc compatible avec Prisma/pg ici.
//
// `/admin/connexion` est explicitement exclu : seule route publique du périmètre `/admin`,
// sa propre logique (redirection si déjà connecté) relève de la page elle-même, pas de cette garde.
//
// Source de vérité unique : getCurrentSession (aucune logique de session dupliquée ici).
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/connexion") {
    return NextResponse.next();
  }

  const session = await getCurrentSession();

  if (!session.authenticated) {
    return NextResponse.redirect(new URL("/admin/connexion", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
