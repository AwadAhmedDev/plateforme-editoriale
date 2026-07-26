"use client";

import { useState } from "react";

type Langue = "FR" | "EN";

const LANGUES: readonly Langue[] = ["FR", "EN"];

// Bascule FR/EN du header, purement visuelle pour l'instant : l'anglais
// n'est pas encore développé, aucun contenu ni route ne change au clic.
// État local au composant, jamais persisté ni propagé ailleurs — à
// remplacer par une vraie logique d'i18n le jour où l'anglais sera
// disponible (cf. décision produit prise avec l'utilisateur).
export function LanguageToggle() {
  const [langue, setLangue] = useState<Langue>("FR");

  return (
    <div className="flex items-center gap-[2px]">
      {LANGUES.map((code) => {
        const actif = langue === code;

        return (
          <button
            key={code}
            type="button"
            onClick={() => setLangue(code)}
            aria-pressed={actif}
            className={`cursor-pointer rounded-[4px] px-[8px] py-[3px] text-[11px] font-semibold tracking-[.04em] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary ${
              actif ? "bg-accent-primary text-white" : "text-text-secondary hover:text-accent-primary"
            }`}
          >
            {code}
          </button>
        );
      })}
    </div>
  );
}
