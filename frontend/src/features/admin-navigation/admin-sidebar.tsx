"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { adminLogout } from "@/features/admin-auth/actions";

const NAV_ITEMS: ReadonlyArray<{ href: string; label: string }> = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/categories", label: "Catégories" },
  { href: "/admin/newsletter", label: "Newsletter" },
];

// Sidebar administrateur (ui-specification.md §Navigation secondaire : 220px fixe,
// Dashboard/Articles/Catégories/Newsletter, item actif souligné + gras, pied "Voir le
// site ↗"/"Déconnexion"). Rendue par app/admin/(protected)/layout.tsx sur tous les écrans
// protégés — seul îlot client du layout (détection de route active via usePathname,
// déclencheur de déconnexion), le layout parent reste un Server Component pur.
export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function isActive(href: string): boolean {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  // Ne réécrit aucune logique de déconnexion : adminLogout (admin-auth/actions.ts, déjà
  // écrite) efface la Session ; le refresh qui suit fait simplement rejouer la garde déjà
  // présente dans app/admin/(protected)/layout.tsx (redirect vers /admin/connexion si la
  // Session n'est plus authentifiée), sans dupliquer cette redirection ici.
  function onLogout() {
    startTransition(async () => {
      await adminLogout();
      router.refresh();
    });
  }

  return (
    <nav
      aria-label="Navigation administrateur"
      className="flex w-[220px] shrink-0 flex-col justify-between border-r border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <ul className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`block rounded-md px-3 py-2 text-sm ${
                isActive(item.href)
                  ? "font-semibold text-zinc-900 underline underline-offset-4 dark:text-zinc-50"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-1 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="rounded-md px-3 py-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Voir le site ↗
        </a>
        <button
          type="button"
          onClick={onLogout}
          disabled={isPending}
          className="rounded-md px-3 py-2 text-left text-sm text-zinc-600 hover:text-zinc-900 disabled:opacity-70 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          {isPending ? "Déconnexion…" : "Déconnexion"}
        </button>
      </div>
    </nav>
  );
}
