import { redirect } from "next/navigation";
import { getCurrentSession } from "@/features/admin-auth/session";
import { AdminLoginForm } from "@/features/admin-auth/login-form";

// Route publique (technical-architecture.md §2.2 : « Aucune [protection] — redirige
// si déjà connecté »), explicitement exclue de la garde de session (proxy.ts). Seule
// source de vérité pour ce contrôle : getCurrentSession.
export default async function AdminConnexionPage() {
  const session = await getCurrentSession();

  if (session.authenticated) {
    redirect("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <div className="w-full max-w-sm rounded-md border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Connexion administrateur
        </h1>
        <AdminLoginForm />
      </div>
    </main>
  );
}
