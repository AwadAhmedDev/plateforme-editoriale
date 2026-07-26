"use client";

import { useEffect, useState } from "react";

// Bloc "Citer cet article" (REPO-5, B20 : Corne de l'Afrique.dc.html l.222-226) : citation
// déjà générée côté serveur (build-citation.ts, reçue en prop) — seul le bouton "Copier"
// nécessite un Client Component, sur le même modèle que ShareBar (confirmation "Citation
// copiée" temporaire, aucun faux succès si le presse-papiers refuse).
export function CitationBlock({ citation }: { citation: string }) {
  const [copie, setCopie] = useState(false);

  useEffect(() => {
    if (!copie) return;
    const timer = setTimeout(() => setCopie(false), 4000);
    return () => clearTimeout(timer);
  }, [copie]);

  async function copierLaCitation() {
    try {
      await navigator.clipboard.writeText(citation);
      setCopie(true);
    } catch {
      // Permission refusée ou contexte non sécurisé : aucune confirmation
      // n'est affichée, jamais un faux succès.
    }
  }

  return (
    <div className="mt-8 flex flex-col gap-2 rounded-[6px] border border-border bg-[#efeadf] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[.12em] text-text-secondary">Citer cet article</p>
      <p className="font-ui text-[13.5px] leading-relaxed text-text-secondary">{citation}</p>
      <button
        type="button"
        onClick={copierLaCitation}
        className="self-start text-[12.5px] font-semibold text-accent-primary outline-none transition-colors duration-fast hover:text-accent-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
      >
        {copie ? "Citation copiée" : "Copier la citation"}
      </button>
    </div>
  );
}
