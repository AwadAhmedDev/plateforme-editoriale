"use client";

import { useEffect, useState } from "react";

// Barre de partage (Lot L4, contrat validé) : copie de lien, X et WhatsApp
// uniquement — Facebook/LinkedIn hors périmètre. Composant client unique
// (aucun découpage Server/Client, disproportionné pour ce composant
// entièrement interactif — cf. contrat). `window.location.href` n'est lu
// qu'à l'intérieur des gestionnaires onClick, jamais dans le corps du rendu :
// un Client Component est tout de même rendu côté serveur lors du SSR
// initial, où `window` n'existe pas.
export function ShareBar({ titre }: { titre: string }) {
  const [copie, setCopie] = useState(false);

  useEffect(() => {
    if (!copie) return;
    const timer = setTimeout(() => setCopie(false), 4000);
    return () => clearTimeout(timer);
  }, [copie]);

  async function copierLeLien() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopie(true);
    } catch {
      // Permission refusée ou contexte non sécurisé : aucune confirmation
      // n'est affichée, jamais un faux succès.
    }
  }

  function partagerSurX() {
    const url =
      "https://twitter.com/intent/tweet?text=" +
      encodeURIComponent(titre) +
      "&url=" +
      encodeURIComponent(window.location.href);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function partagerSurWhatsApp() {
    const url = "https://wa.me/?text=" + encodeURIComponent(titre + " " + window.location.href);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 flex flex-wrap items-center justify-center gap-2 border-t border-border bg-bg-primary px-5 py-3
                 lg:sticky lg:inset-x-auto lg:bottom-auto lg:top-24 lg:flex-col lg:items-start lg:justify-start lg:border-t-0 lg:border lg:px-3 lg:py-4"
    >
      <button
        type="button"
        onClick={copierLeLien}
        className="min-h-11 min-w-11 rounded-sm px-3 py-2 text-sm text-text-secondary transition-colors duration-fast hover:text-accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
      >
        Copier le lien
      </button>
      <button
        type="button"
        onClick={partagerSurX}
        className="min-h-11 min-w-11 rounded-sm px-3 py-2 text-sm text-text-secondary transition-colors duration-fast hover:text-accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
      >
        Partager sur X
      </button>
      <button
        type="button"
        onClick={partagerSurWhatsApp}
        className="min-h-11 min-w-11 rounded-sm px-3 py-2 text-sm text-text-secondary transition-colors duration-fast hover:text-accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
      >
        Partager sur WhatsApp
      </button>

      {copie && (
        <p role="status" className="text-sm text-text-secondary">
          Lien copié
        </p>
      )}
    </div>
  );
}
