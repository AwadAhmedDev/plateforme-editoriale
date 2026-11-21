"use client";

import { useEffect, useState } from "react";

const BOUTON_ICONE =
  "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-bg-secondary text-sm font-bold text-text-secondary outline-none transition-colors duration-fast hover:border-accent-primary hover:text-accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary";

// Barre de partage (REPO-5, D5 : Corne de l'Afrique.dc.html l.214-219 — rangée inline
// sous l'image, plus de comportement sticky/fixe). L'ancien positionnement sticky
// (sidebar flottante desktop / barre basse fixe mobile, offset dérivé de
// --header-height-desktop) est abandonné : le header REPO-3 n'a plus de hauteur fixe
// unique (bandeaux empilés), cet offset était déjà désynchronisé. Icônes alignées sur le
// design : lien, X, LinkedIn, e-mail — WhatsApp retiré (B19), LinkedIn et e-mail ajoutés.
// Composant client unique (aucun découpage Server/Client, disproportionné pour un
// composant entièrement interactif) : `window`/`navigator` ne sont lus que dans les
// gestionnaires onClick, jamais dans le corps du rendu — un Client Component est tout de
// même rendu côté serveur lors du SSR initial, où `window` n'existe pas.
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

  function partagerSurLinkedIn() {
    const url = "https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(window.location.href);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function partagerParEmail() {
    const sujet = encodeURIComponent(titre);
    const corps = encodeURIComponent(window.location.href);
    window.location.href = `mailto:?subject=${sujet}&body=${corps}`;
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-2.5">
      <span className="mr-0.5 text-[11px] font-semibold uppercase tracking-[.12em] text-text-secondary">
        Partager
      </span>

      <button
        type="button"
        onClick={copierLeLien}
        className="flex items-center gap-1.5 rounded-full border border-border bg-bg-secondary px-3.5 py-1.5 text-[12.5px] font-medium text-text-secondary outline-none transition-colors duration-fast hover:border-accent-primary hover:text-accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
      >
        <span aria-hidden="true">🔗</span>
        <span>{copie ? "Lien copié" : "Copier le lien"}</span>
      </button>

      <button type="button" onClick={partagerSurX} aria-label="Partager sur X" className={BOUTON_ICONE}>
        <span aria-hidden="true">𝕏</span>
      </button>
      <button
        type="button"
        onClick={partagerSurLinkedIn}
        aria-label="Partager sur LinkedIn"
        className={`${BOUTON_ICONE} text-xs tracking-[.02em]`}
      >
        <span aria-hidden="true">in</span>
      </button>
      <button type="button" onClick={partagerParEmail} aria-label="Partager par e-mail" className={BOUTON_ICONE}>
        <span aria-hidden="true">✉</span>
      </button>
    </div>
  );
}
