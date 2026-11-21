"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  publishArticle,
  unpublishArticle,
  archiveArticle,
  type ArticleActionState,
} from "@/features/articles/article-actions";
import { StatusPills, type StatutArticle } from "@/features/articles/status-pills";

const ACTION_PAR_STATUT = {
  publie: publishArticle,
  brouillon: unpublishArticle,
  archive: archiveArticle,
} as const;

const ETAT_INITIAL: ArticleActionState = { status: "idle", message: null };

// Panneau indépendant des deux formulaires (arbitrage Lot 10, §4) : stratégie
// pessimiste — `value` de StatusPills ne reflète que le statut confirmé par le
// serveur, jamais une valeur anticipée. Le mapping clic → Server Action et
// l'orchestration asynchrone (useTransition) vivent ici, jamais dans status-pills.tsx
// (composant purement UI, Lot 9, non modifié).
export function ArticleStatusPanel({ id, statut }: { id: string; statut: StatutArticle }) {
  const router = useRouter();
  const [statutConfirme, setStatutConfirme] = useState<StatutArticle>(statut);
  const [erreur, setErreur] = useState<Pick<ArticleActionState, "message" | "errors"> | null>(null);
  const [isPending, startTransition] = useTransition();

  // `statut` redevient la seule source de vérité à chaque nouvelle valeur reçue du serveur.
  // router.refresh() ne remonte pas ce composant (pas de changement de key) : sans cet effet,
  // le useState initial ci-dessus ne serait plus jamais réévalué, et statutConfirme pourrait
  // rester figé sur la dernière valeur locale même si le serveur revient avec autre chose
  // (ex. écriture concurrente dans un autre onglet). Reste conforme à la stratégie pessimiste :
  // cet effet ne fait que réaligner l'affichage sur le serveur, jamais l'inverse.
  // Réalignement pendant le rendu (et non dans un effet) : patron recommandé par React
  // pour « ajuster un état quand une prop change », sans rendu intermédiaire périmé.
  const [statutRecu, setStatutRecu] = useState(statut);
  if (statut !== statutRecu) {
    setStatutRecu(statut);
    setStatutConfirme(statut);
  }

  function onChange(nouveauStatut: StatutArticle) {
    if (nouveauStatut === statutConfirme || isPending) return;
    setErreur(null);

    startTransition(async () => {
      const action = ACTION_PAR_STATUT[nouveauStatut];
      const resultat = await action(id, ETAT_INITIAL, new FormData());

      if (resultat.status === "success") {
        setStatutConfirme(nouveauStatut);
        router.refresh();
      } else {
        setErreur({ message: resultat.message, errors: resultat.errors });
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Statut</span>
      {/* `inert` bloque réellement le focus/clic pendant la transition (pas seulement le
          curseur) sans toucher au contrat de StatusPills (role="radiogroup", Lot 9, non
          modifié). `aria-busy` + la région `role="status"` ci-dessous annoncent l'état aux
          technologies d'assistance, qu'aria-disabled seul (non hérité par les enfants ARIA)
          ne garantirait pas. */}
      <div aria-busy={isPending} inert={isPending} className={isPending ? "opacity-60" : undefined}>
        <StatusPills value={statutConfirme} onChange={onChange} />
      </div>
      <span role="status" aria-live="polite" className="sr-only">
        {isPending ? "Mise à jour du statut en cours…" : ""}
      </span>
      {erreur && (
        <div role="alert" className="flex flex-col gap-1 text-sm text-red-600 dark:text-red-400">
          {erreur.errors && Object.keys(erreur.errors).length > 0 ? (
            <ul className="list-disc pl-4">
              {Object.entries(erreur.errors).map(([champ, message]) => (
                <li key={champ}>{message}</li>
              ))}
            </ul>
          ) : (
            <p>{erreur.message ?? "Une erreur est survenue, veuillez réessayer."}</p>
          )}
        </div>
      )}
    </div>
  );
}
