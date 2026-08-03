"use client";

import { useState } from "react";

type Langue = "FR" | "EN";

const LANGUES: readonly Langue[] = ["FR", "EN"];

// Drapeau de disponibilité de l'internationalisation. La plateforme n'existe
// qu'en français : tant qu'il vaut `false`, le sélecteur n'est pas rendu du
// tout — ni visuellement, ni dans l'arbre d'accessibilité, ni dans le DOM.
//
// Seule l'INTERFACE est masquée : le composant, son état et son balisage
// restent intacts ci-dessous. Réactiver les langues = passer ce drapeau à
// `true`, sans rien réécrire.
//
// Typé `boolean` explicitement, et non laissé inférer le littéral `false` :
// sinon TypeScript marque tout le corps suivant comme code inatteignable.
const LANGUES_DISPONIBLES: boolean = false;

// Bascule FR/EN du header, purement visuelle pour l'instant : l'anglais
// n'est pas encore développé, aucun contenu ni route ne change au clic.
// État local au composant, jamais persisté ni propagé ailleurs — à
// remplacer par une vraie logique d'i18n le jour où l'anglais sera
// disponible (cf. décision produit prise avec l'utilisateur).
export function LanguageToggle() {
  const [langue, setLangue] = useState<Langue>("FR");

  // Après le hook, jamais avant : un retour anticipé placé au-dessus de
  // `useState` violerait les règles des Hooks.
  if (!LANGUES_DISPONIBLES) return null;

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
