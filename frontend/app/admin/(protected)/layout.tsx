import { redirect } from "next/navigation";
import { getCurrentSession } from "@/features/admin-auth/session";
import { AdminSidebar } from "@/features/admin-navigation/admin-sidebar";
import { estCompteDemo } from "@/lib/auth/require-admin-session";

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

  const demo = await estCompteDemo();

  return (
    <div className="admin-shell min-h-screen bg-zinc-50 lg:flex dark:bg-zinc-900">
      <AdminSidebar />
      <div className="admin-content mx-auto w-full min-w-0 max-w-[1400px] flex-1">
        {demo && (
          <p role="note" className="border-b border-amber-300 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900">
            Compte de démonstration : consultation seule. Les modifications sont refusées et les données des
            visiteurs (e-mails, messages) sont masquées.
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
