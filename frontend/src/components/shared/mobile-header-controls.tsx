"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CategorieMenuItem } from "@/features/taxonomies/list-categorie-menu";
import type { ZoneMenuItem } from "@/features/taxonomies/list-zone-menu";

type Panneau = "aucun" | "recherche" | "menu";

// Seul Client Component du header (Lot 6.2, contrat technique) : îlot isolé
// recevant en props des données déjà chargées côté serveur par
// PublicHeader — aucun fetch ici. Un seul état (`panneau`) garantit par
// construction qu'un seul panneau plein écran est ouvert à la fois (jamais
// deux booléens indépendants).
export function MobileHeaderControls({
  categories,
  zones,
  ctaHref,
  contactEmail,
}: {
  categories: CategorieMenuItem[];
  zones: ZoneMenuItem[];
  ctaHref: string;
  contactEmail: string;
}) {
  const [panneau, setPanneau] = useState<Panneau>("aucun");
  const declencheurRechercheRef = useRef<HTMLButtonElement>(null);
  const declencheurMenuRef = useRef<HTMLButtonElement>(null);
  const champRechercheRef = useRef<HTMLInputElement>(null);
  const fermetureMenuRef = useRef<HTMLButtonElement>(null);
  const panneauRef = useRef<HTMLDivElement>(null);

  const fermer = useCallback(() => {
    const declencheur =
      panneau === "recherche" ? declencheurRechercheRef.current : declencheurMenuRef.current;
    setPanneau("aucun");
    declencheur?.focus();
  }, [panneau]);

  // Focus initial, piège de focus (Tab) et fermeture Échap : actifs
  // uniquement pendant qu'un panneau est ouvert, retirés à la fermeture.
  // Aucun état métier ici — uniquement de la gestion de focus/défilement.
  useEffect(() => {
    if (panneau === "aucun") return;

    document.body.style.overflow = "hidden";

    if (panneau === "recherche") {
      champRechercheRef.current?.focus();
    } else {
      fermetureMenuRef.current?.focus();
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        fermer();
        return;
      }

      if (event.key !== "Tab" || !panneauRef.current) return;

      const focusables = panneauRef.current.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled]), input, summary"
      );
      if (focusables.length === 0) return;

      const premier = focusables[0];
      const dernier = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === premier) {
        event.preventDefault();
        dernier.focus();
      } else if (!event.shiftKey && document.activeElement === dernier) {
        event.preventDefault();
        premier.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [panneau, fermer]);

  return (
    <div className="ml-auto flex items-center gap-2 lg:hidden">
      <button
        ref={declencheurRechercheRef}
        type="button"
        aria-label="Rechercher"
        aria-expanded={panneau === "recherche"}
        aria-controls="panneau-recherche-mobile"
        onClick={() => setPanneau(panneau === "recherche" ? "aucun" : "recherche")}
        className="flex h-11 w-11 items-center justify-center rounded-sm text-text-primary outline-none transition-colors duration-fast hover:text-accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
      >
        <IconeRecherche />
      </button>

      <button
        ref={declencheurMenuRef}
        type="button"
        aria-label="Ouvrir le menu"
        aria-expanded={panneau === "menu"}
        aria-controls="panneau-menu-mobile"
        onClick={() => setPanneau(panneau === "menu" ? "aucun" : "menu")}
        className="flex h-11 w-11 items-center justify-center rounded-sm text-text-primary outline-none transition-colors duration-fast hover:text-accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
      >
        <IconeMenu />
      </button>

      {panneau === "recherche" && (
        <div
          id="panneau-recherche-mobile"
          ref={panneauRef}
          role="dialog"
          aria-modal="true"
          aria-label="Recherche"
          className="fixed inset-0 z-50 flex flex-col gap-6 bg-bg-primary px-5 py-4"
        >
          <div className="flex justify-end">
            <button
              type="button"
              aria-label="Fermer la recherche"
              onClick={fermer}
              className="flex h-11 w-11 items-center justify-center rounded-sm text-text-primary outline-none transition-colors duration-fast hover:text-accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
            >
              <IconeFermer />
            </button>
          </div>

          {/* Même formulaire GET natif que la version desktop — aucune
              nouvelle logique de soumission, seule la présentation change. */}
          <form role="search" action="/recherche" method="GET" className="flex flex-col gap-3">
            <label htmlFor="mobile-search-q" className="sr-only">
              Rechercher un article
            </label>
            <input
              ref={champRechercheRef}
              id="mobile-search-q"
              type="search"
              name="q"
              placeholder="Rechercher…"
              className="h-11 w-full rounded-full border border-border bg-bg-primary px-4 text-base text-text-primary outline-none placeholder:text-text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
            />
          </form>
        </div>
      )}

      {panneau === "menu" && (
        <div
          id="panneau-menu-mobile"
          ref={panneauRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navigation"
          className="fixed inset-0 z-50 flex flex-col gap-6 overflow-y-auto bg-bg-primary px-5 py-4"
        >
          <div className="flex justify-end">
            <button
              ref={fermetureMenuRef}
              type="button"
              aria-label="Fermer le menu"
              onClick={fermer}
              className="flex h-11 w-11 items-center justify-center rounded-sm text-text-primary outline-none transition-colors duration-fast hover:text-accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
            >
              <IconeFermer />
            </button>
          </div>

          <nav aria-label="Navigation principale" className="flex-1">
            <ul className="flex flex-col gap-1 text-lg">
              <li>
                <Link
                  href="/"
                  onClick={fermer}
                  className="block rounded-sm px-2 py-3 text-text-primary outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
                >
                  Accueil
                </Link>
              </li>

              {categories.length > 0 && (
                <li>
                  <details>
                    <summary className="cursor-pointer list-none px-2 py-3 text-text-primary outline-none [&::-webkit-details-marker]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary">
                      Catégories
                    </summary>
                    <ul className="flex flex-col gap-1 pl-4">
                      {categories.map((categorie) => (
                        <li key={categorie.slug}>
                          <Link
                            href={`/categorie/${categorie.slug}`}
                            onClick={fermer}
                            className="block rounded-sm px-2 py-2 text-base text-text-secondary outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
                          >
                            {categorie.nom}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              )}

              {zones.length > 0 && (
                <li>
                  <details>
                    <summary className="cursor-pointer list-none px-2 py-3 text-text-primary outline-none [&::-webkit-details-marker]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary">
                      Zones géographiques
                    </summary>
                    <ul className="flex flex-col gap-1 pl-4">
                      {zones.map((zone) => (
                        <li key={zone.slug}>
                          <Link
                            href={`/zone/${zone.slug}`}
                            onClick={fermer}
                            className="block rounded-sm px-2 py-2 text-base text-text-secondary outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
                          >
                            {zone.nom}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              )}

              <li>
                <Link
                  href="/recherche"
                  onClick={fermer}
                  className="block rounded-sm px-2 py-3 text-text-primary outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
                >
                  Recherche
                </Link>
              </li>
              <li>
                <Link
                  href="/a-propos"
                  onClick={fermer}
                  className="block rounded-sm px-2 py-3 text-text-primary outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
                >
                  À propos
                </Link>
              </li>
              <li>
                {/* Contact : /contact n'existe pas encore (Lot 6.2, contrat
                    technique) — repli mailto: réutilisant l'e-mail déjà
                    défini pour la page À propos, jamais dupliqué. */}
                <a
                  href={`mailto:${contactEmail}`}
                  onClick={fermer}
                  className="block rounded-sm px-2 py-3 text-text-primary outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
                >
                  Contact
                </a>
              </li>
            </ul>
          </nav>

          <Link
            href={ctaHref}
            onClick={fermer}
            className="block rounded-sm bg-accent-warm px-5 py-3 text-center text-base font-medium text-white outline-none transition-colors duration-fast hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
          >
            S&apos;abonner
          </Link>
        </div>
      )}
    </div>
  );
}

// Icônes en SVG inline, trait fin monochrome (design-system.md §13) — aucune
// dépendance ajoutée, première apparition d'icônes dans le produit (jusqu'ici
// exclusivement des libellés texte).
function IconeRecherche() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <line x1="20" y1="20" x2="15.5" y2="15.5" />
    </svg>
  );
}

function IconeMenu() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function IconeFermer() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
      <line x1="5" y1="5" x2="19" y2="19" />
      <line x1="19" y1="5" x2="5" y2="19" />
    </svg>
  );
}
