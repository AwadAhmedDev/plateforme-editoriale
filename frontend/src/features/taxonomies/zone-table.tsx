"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { updateZone, deleteZone, type ZoneActionState } from "@/features/taxonomies/zone-actions";
import type { ZoneListItem } from "@/features/taxonomies/list-zones";

const initialState: ZoneActionState = { status: "idle", message: null };

// Table Zones géographiques (ui-specification.md §Tables Administrateur : Nom, Nombre
// d'articles associés, Actions) + édition inline par ligne + suppression via Modal
// (§Modales), bloquée en amont (bouton désactivé, aucune Modal) si des articles sont
// associés — symétrique de CategoryTable.
export function ZoneTable({ zones }: { zones: ZoneListItem[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingZone, setDeletingZone] = useState<ZoneListItem | null>(null);

  return (
    <>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-left text-[12px] font-mono uppercase text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            <th className="py-2">Nom</th>
            <th className="py-2">Articles associés</th>
            <th className="py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {zones.map((zone) =>
            editingId === zone.id ? (
              <EditZoneRow
                key={zone.id}
                zone={zone}
                onCancel={() => setEditingId(null)}
                onSuccess={() => setEditingId(null)}
              />
            ) : (
              <tr key={zone.id} className="border-b border-zinc-100 dark:border-zinc-800">
                <td className="py-3">{zone.nom}</td>
                <td className="py-3">{zone.articleCount}</td>
                <td className="py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setEditingId(zone.id)}
                    className="text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-100"
                  >
                    Modifier
                  </button>
                  {zone.articleCount === 0 ? (
                    <button
                      type="button"
                      onClick={() => setDeletingZone(zone)}
                      className="ml-3 text-red-600 underline-offset-2 hover:underline dark:text-red-400"
                    >
                      Supprimer
                    </button>
                  ) : (
                    <span
                      className="ml-3 text-zinc-400 dark:text-zinc-600"
                      title="Cette zone géographique est associée à au moins un contenu et ne peut pas être supprimée."
                    >
                      Supprimer
                    </span>
                  )}
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>

      {deletingZone && <DeleteZoneDialog zone={deletingZone} onClose={() => setDeletingZone(null)} />}
    </>
  );
}

function EditZoneRow({
  zone,
  onCancel,
  onSuccess,
}: {
  zone: ZoneListItem;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const boundUpdateZone = updateZone.bind(null, zone.id);
  const [state, formAction, pending] = useActionState(boundUpdateZone, initialState);
  const nomRef = useRef<HTMLInputElement>(null);
  const slugRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      onSuccess();
      return;
    }
    if (state.status === "error" && state.values) {
      if (nomRef.current) nomRef.current.value = state.values.nom;
      if (slugRef.current) slugRef.current.value = state.values.slug;
      if (descriptionRef.current) descriptionRef.current.value = state.values.descriptionCourte;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <tr className="border-b border-zinc-100 dark:border-zinc-800">
      <td colSpan={3} className="py-3">
        <form action={formAction} className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor={`nom-${zone.id}`} className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
              Nom
            </label>
            <input
              ref={nomRef}
              id={`nom-${zone.id}`}
              name="nom"
              type="text"
              defaultValue={zone.nom}
              required
              className="h-10 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor={`slug-${zone.id}`} className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
              Slug
            </label>
            <input
              ref={slugRef}
              id={`slug-${zone.id}`}
              name="slug"
              type="text"
              defaultValue={zone.slug}
              className="h-10 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor={`descriptionCourte-${zone.id}`}
              className="text-xs font-medium text-zinc-900 dark:text-zinc-100"
            >
              Description courte
            </label>
            <input
              ref={descriptionRef}
              id={`descriptionCourte-${zone.id}`}
              name="descriptionCourte"
              type="text"
              defaultValue={zone.descriptionCourte ?? ""}
              className="h-10 w-64 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="h-10 min-w-[110px] rounded-md bg-zinc-900 px-4 text-sm font-medium text-white disabled:opacity-70 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {pending ? "Enregistrement…" : "Enregistrer"}
          </button>
          <button type="button" onClick={onCancel} className="h-10 px-3 text-sm text-zinc-600 dark:text-zinc-400">
            Annuler
          </button>

          {state.status === "error" && (
            <p role="alert" className="w-full text-sm text-red-600 dark:text-red-400">
              {state.message}
            </p>
          )}
        </form>
      </td>
    </tr>
  );
}

function DeleteZoneDialog({ zone, onClose }: { zone: ZoneListItem; onClose: () => void }) {
  const boundDeleteZone = deleteZone.bind(null, zone.id);
  const [state, formAction, pending] = useActionState(boundDeleteZone, initialState);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const declencheurRef = useRef<HTMLElement | null>(null);
  // Identifiant du titre (Lot B4) : `useId()` garantit un identifiant unique par instance,
  // stable d'un rendu à l'autre, sans le dériver de l'entité affichée ni risquer de collision
  // avec les identifiants déjà posés ailleurs dans la page (`nom-${zone.id}`, etc.).
  const titreId = useId();

  // Restitution du focus (Lot B3) : `showModal()` mémorise bien l'élément précédemment
  // focalisé, mais le navigateur ne le refocalise qu'au `close()` — or cette Modal n'est
  // jamais fermée par `close()`. Tous ses chemins de sortie (Annuler, ✕, Échap, clic sur
  // l'arrière-plan, succès de la suppression) passent par `onClose()`, qui démonte le
  // <dialog> : le focus retombe alors sur <body> et l'utilisateur au clavier repart du
  // début du document. Le déclencheur est donc mémorisé juste avant l'ouverture et
  // refocalisé au démontage, ce qui couvre uniformément les cinq chemins.
  //
  // Garde `!dialog.open` : en mode strict (développement), React rejoue cet effet sans
  // démonter le <dialog>. Sans elle, le second passage mémoriserait un bouton interne à la
  // Modal comme « déclencheur », et rappellerait `showModal()` sur une Modal déjà ouverte
  // (`InvalidStateError`) — défaut latent du code d'origine, neutralisé au passage.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      const actif = document.activeElement;
      declencheurRef.current = actif instanceof HTMLElement && actif !== document.body ? actif : null;
      dialog.showModal();
    }

    return () => {
      // `isConnected` : après une suppression réussie, la ligne (donc le bouton) peut avoir
      // déjà disparu de la table revalidée — refocaliser un nœud détaché serait sans effet.
      const declencheur = declencheurRef.current;
      if (declencheur?.isConnected) declencheur.focus();
    };
  }, []);

  useEffect(() => {
    if (state.status === "success") {
      onClose();
    }
  }, [state, onClose]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titreId}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onClose();
        }
      }}
      className="w-full max-w-[440px] rounded-md border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="mb-2 flex items-start justify-between">
        <h2 id={titreId} className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Supprimer la zone géographique
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ✕
        </button>
      </div>

      <p className="mb-4 text-sm text-zinc-700 dark:text-zinc-300">
        Supprimer définitivement la zone géographique « {zone.nom} » ? Cette action est irréversible.
      </p>

      {state.status === "error" && (
        <p role="alert" className="mb-3 text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      )}

      <form action={formAction} className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="h-10 rounded-md border border-zinc-300 px-4 text-sm font-medium text-zinc-900 dark:border-zinc-700 dark:text-zinc-100"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={pending}
          className="h-10 rounded-md border-2 border-red-600 px-4 text-sm font-medium text-red-600 disabled:opacity-70 dark:border-red-400 dark:text-red-400"
        >
          {pending ? "Suppression…" : "Supprimer"}
        </button>
      </form>
    </dialog>
  );
}
