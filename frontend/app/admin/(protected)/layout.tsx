import { redirect } from "next/navigation";
import { getCurrentSession } from "@/features/admin-auth/session";
import { AdminSidebar } from "@/features/admin-navigation/admin-sidebar";

// Garde d'accès de second niveau, redondante avec proxy.ts (technical-architecture.md §4.3,
// security-specification.md §2) : protège spécifiquement contre un accès qui contournerait
// la garde en amont. Même source de vérité unique : getCurrentSession.
//
// Sidebar administrateur (Lot 13, ui-specification.md §Navigation secondaire) posée une
// seule fois ici, sur les 6 écrans protégés — jamais redéfinie au niveau des pages. Les deux
// blocs ci-dessous (shell admin / message d'orientation) sont tous deux toujours rendus côté
// serveur ; seules des classes Tailwind responsives (`lg:` = 1024px, seuil desktop de
// ui-specification.md §Responsive) décident lequel s'affiche — aucune détection JavaScript
// de taille d'écran, pour ne jamais diverger entre rendu serveur et client
// (frontend-specification.md §Stratégie responsive).
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
    <>
      <div className="hidden min-h-screen lg:flex">
        <AdminSidebar />
        <div className="flex-1">{children}</div>
      </div>
      <div className="flex min-h-screen items-center justify-center p-8 text-center lg:hidden">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Interface d&apos;administration optimisée pour desktop.
        </p>
      </div>
    </>
  );
}
