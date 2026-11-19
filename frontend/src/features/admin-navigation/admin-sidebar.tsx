"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { adminLogout } from "@/features/admin-auth/actions";

// Tracés d'icônes 24×24 (style contour), inline pour n'ajouter aucune dépendance.
const ICONS = {
  dashboard: "M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z",
  articles: "M7 3h7l5 5v13H7V3Zm7 0v5h5M10 13h6M10 17h6",
  categories: "M3 7h7l2 2h9v10H3V7Zm0 0V5h6l2 2",
  newsletter: "M3 6h18v12H3V6Zm0 0 9 7 9-7",
  contact: "M4 5h16v11H8l-4 4V5Zm4 5h8M8 13h5",
  external: "M14 4h6v6M20 4l-9 9M18 14v6H4V6h6",
  logout: "M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10",
  menu: "M4 6h16M4 12h16M4 18h16",
  close: "M6 6l12 12M18 6 6 18",
} as const;

export function AdminIcon({ name, className = "h-5 w-5" }: { name: keyof typeof ICONS; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={ICONS[name]} />
    </svg>
  );
}

const NAV_ITEMS: ReadonlyArray<{ href: string; label: string; icon: keyof typeof ICONS }> = [
  { href: "/admin", label: "Tableau de bord", icon: "dashboard" },
  { href: "/admin/articles", label: "Articles", icon: "articles" },
  { href: "/admin/categories", label: "Catégories & zones", icon: "categories" },
  { href: "/admin/newsletter", label: "Newsletter", icon: "newsletter" },
  { href: "/admin/contact", label: "Messages", icon: "contact" },
];

const LINK_BASE =
  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400";

// Barre latérale fixe (desktop) + tiroir (mobile/tablette). Seul îlot client du layout
// protégé : route active via usePathname, ouverture du tiroir, déconnexion.
export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  function isActive(href: string): boolean {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  // adminLogout efface la Session ; le refresh rejoue la garde du layout (redirect).
  function onLogout() {
    startTransition(async () => {
      await adminLogout();
      router.refresh();
    });
  }

  const current = NAV_ITEMS.find((item) => isActive(item.href));

  const panel = (
    <nav aria-label="Navigation administrateur" className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-zinc-200 px-5 dark:border-zinc-800">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent-primary text-sm font-bold text-white">
          CA
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Corne de l&apos;Afrique</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Administration</p>
        </div>
      </div>

      <p className="px-5 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Gestion</p>
      <ul className="flex flex-1 flex-col gap-0.5 px-3">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={`${LINK_BASE} ${
                  active
                    ? "bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <AdminIcon
                  name={item.icon}
                  className={`h-5 w-5 ${active ? "text-accent-primary" : "text-zinc-400"}`}
                />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col gap-0.5 border-t border-zinc-200 p-3 dark:border-zinc-800">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className={`${LINK_BASE} text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100`}
        >
          <AdminIcon name="external" className="h-5 w-5 text-zinc-400" />
          Voir le site
        </a>
        <button
          type="button"
          onClick={onLogout}
          disabled={isPending}
          className={`${LINK_BASE} text-left text-zinc-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-60 dark:text-zinc-400 dark:hover:bg-red-950 dark:hover:text-red-300`}
        >
          <AdminIcon name="logout" className="h-5 w-5 text-zinc-400" />
          {isPending ? "Déconnexion…" : "Déconnexion"}
        </button>
      </div>
    </nav>
  );

  return (
    <>
      {/* Desktop : colonne fixe */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-zinc-200 bg-white lg:block dark:border-zinc-800 dark:bg-zinc-950">
        {panel}
      </aside>

      {/* Mobile : barre supérieure + tiroir */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-zinc-200 bg-white/90 px-4 backdrop-blur lg:hidden dark:border-zinc-800 dark:bg-zinc-950/90">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le menu"
          aria-expanded={open}
          className="-ml-1 rounded-lg p-2 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <AdminIcon name="menu" />
        </button>
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{current?.label ?? "Administration"}</p>
      </header>

      <div
        className={`fixed inset-0 z-40 lg:hidden ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
        inert={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-zinc-950/40 transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}
        />
        <aside
          className={`absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-xl transition-transform duration-200 ease-out dark:bg-zinc-950 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fermer le menu"
            className="absolute right-3 top-4 rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <AdminIcon name="close" />
          </button>
          {panel}
        </aside>
      </div>
    </>
  );
}
