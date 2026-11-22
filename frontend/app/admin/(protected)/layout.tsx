import { redirect } from "next/navigation";
import { getCurrentSession } from "@/features/admin-auth/session";
import { AdminSidebar } from "@/features/admin-navigation/admin-sidebar";

// Garde d'accès de second niveau, redondante avec proxy.ts (security-specification.md §2).
// Sidebar posée une seule fois ici pour tous les écrans protégés ; elle gère elle-même
// son rendu desktop (colonne fixe) et mobile (barre + tiroir).
export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();

  if (!session.authenticated) {
    redirect("/admin/connexion");
  }

  return (
    <div className="admin-shell min-h-screen bg-zinc-50 lg:flex dark:bg-zinc-900">
      <AdminSidebar />
      <div className="admin-content mx-auto w-full min-w-0 max-w-[1400px] flex-1">{children}</div>
    </div>
  );
}
