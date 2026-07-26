"use client";

import { useEffect } from "react";

// Synchronise --header-height avec la hauteur réellement rendue du header public
// (REPO-6 : sidebar sticky de la page Recherche). Le header n'a plus de hauteur fixe
// unique depuis REPO-3 (bandeaux empilés, bandeau Pays absent si aucune zone, bandes
// masquées sous lg) — coder un offset en dur reproduirait exactement le bug déjà corrigé
// sur ShareBar (REPO-5, D5). ResizeObserver reste juste après tout changement de mise en
// page du header (chargement des polices, apparition/disparition du bandeau Pays,
// changement de breakpoint), pas seulement au montage initial.
//
// Rendu une seule fois, à l'intérieur de PublicHeader (Server Component) : ce composant
// ne rend rien lui-même (return null), seul son effet compte — aucune interactivité
// visible, jamais un second Client Component ajouté au header pour une autre raison.
export function HeaderHeightSync() {
  useEffect(() => {
    const header = document.getElementById("site-header");
    if (!header) return;

    const definirHauteur = () => {
      document.documentElement.style.setProperty("--header-height", `${header.getBoundingClientRect().height}px`);
    };

    // Plusieurs filets de sécurité au-delà de ResizeObserver (dont le déclenchement
    // s'est avéré peu fiable dans certains environnements de rendu automatisés lors de
    // la vérification de ce composant — l'événement `resize` n'y était pas systématique
    // non plus) : `matchMedia` sur le seuil `lg` (1024px, le seul qui fait
    // structurellement varier le nombre de bandeaux visibles du header) se déclenche de
    // façon fiable même quand `resize`/ResizeObserver restent muets ;
    // `document.fonts.ready` (Spectral/Archivo peuvent légèrement changer les
    // dimensions du texte du header une fois chargées) ; une nouvelle mesure au frame
    // suivant (rattrape tout écart entre le rendu SSR initial et le premier rendu
    // réellement peint côté client).
    definirHauteur();
    requestAnimationFrame(definirHauteur);
    window.addEventListener("resize", definirHauteur);
    document.fonts?.ready.then(definirHauteur).catch(() => {});

    const lgBreakpoint = window.matchMedia("(min-width: 1024px)");
    lgBreakpoint.addEventListener("change", definirHauteur);

    const observer = new ResizeObserver(definirHauteur);
    observer.observe(header);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", definirHauteur);
      lgBreakpoint.removeEventListener("change", definirHauteur);
    };
  }, []);

  return null;
}
