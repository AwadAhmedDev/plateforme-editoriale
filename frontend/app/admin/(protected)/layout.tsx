import { redirect } from "next/navigation";
import { getCurrentSession } from "@/features/admin-auth/session";

// Garde d'accès de second niveau, redondante avec proxy.ts (technical-architecture.md §4.3,
// security-specification.md §2) : protège spécifiquement contre un accès qui contournerait
// la garde en amont. Même source de vérité unique : getCurrentSession.
export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();

  if (!session.authenticated) {
    redirect("/admin/connexion");
  }

  return <>{children}</>;
}
