"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { updateCategory, deleteCategory, type CategoryActionState } from "@/features/taxonomies/categorie-actions";
import type { CategoryListItem } from "@/features/taxonomies/list-categories";

const initialState: CategoryActionState = { status: "idle", message: null };

// Table Catégories (ui-specification.md §Tables Administrateur : Nom, Nombre d'articles
// associés, Actions) + édition inline par ligne + suppression via Modal (§Modales),
// bloquée en amont (bouton désactivé, aucune Modal) si des articles sont associés.
export function CategoryTable({ categories }: { categories: CategoryListItem[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<CategoryListItem | null>(null);

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
          {categories.map((categorie) =>
            editingId === categorie.id ? (
              <EditCategoryRow
                key={categorie.id}
                categorie={categorie}
                onCancel={() => setEditingId(null)}
                onSuccess={() => setEditingId(null)}
              />
            ) : (
              <tr key={categorie.id} className="border-b border-zinc-100 dark:border-zinc-800">
                <td className="py-3">{categorie.nom}</td>
                <td className="py-3">{categorie.articleCount}</td>
                <td className="py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setEditingId(categorie.id)}
                    className="text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-100"
                  >
                    Modifier
                  </button>
                  {categorie.articleCount === 0 ? (
                    <button
                      type="button"
                      onClick={() => setDeletingCategory(categorie)}
                      className="ml-3 text-red-600 underline-offset-2 hover:underline dark:text-red-400"
                    >
                      Supprimer
                    </button>
                  ) : (
                    <span
                      className="ml-3 text-zinc-400 dark:text-zinc-600"
                      title="Cette catégorie est associée à au moins un contenu et ne peut pas être supprimée."
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

      {deletingCategory && (
        <DeleteCategoryDialog categorie={deletingCategory} onClose={() => setDeletingCategory(null)} />
      )}
    </>
  );
}

function EditCategoryRow({
  categorie,
  onCancel,
  onSuccess,
}: {
  categorie: CategoryListItem;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const boundUpdateCategory = updateCategory.bind(null, categorie.id);
  const [state, formAction, pending] = useActionState(boundUpdateCategory, initialState);
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
            <label htmlFor={`nom-${categorie.id}`} className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
              Nom
            </label>
            <input
              ref={nomRef}
              id={`nom-${categorie.id}`}
              name="nom"
              type="text"
              defaultValue={categorie.nom}
              required
              className="h-10 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor={`slug-${categorie.id}`} className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
              Slug
            </label>
            <input
              ref={slugRef}
              id={`slug-${categorie.id}`}
              name="slug"
              type="text"
              defaultValue={categorie.slug}
              className="h-10 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor={`descriptionCourte-${categorie.id}`}
              className="text-xs font-medium text-zinc-900 dark:text-zinc-100"
            >
              Description courte
            </label>
            <input
              ref={descriptionRef}
              id={`descriptionCourte-${categorie.id}`}
              name="descriptionCourte"
              type="text"
              defaultValue={categorie.descriptionCourte ?? ""}
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

function DeleteCategoryDialog({ categorie, onClose }: { categorie: CategoryListItem; onClose: () => void }) {
  const boundDeleteCategory = deleteCategory.bind(null, categorie.id);
  const [state, formAction, pending] = useActionState(boundDeleteCategory, initialState);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  useEffect(() => {
    if (state.status === "success") {
      onClose();
    }
  }, [state, onClose]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onClose();
        }
      }}
      className="w-full max-w-[440px] rounded-md border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="mb-2 flex items-start justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Supprimer la catégorie</h2>
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
        Supprimer définitivement la catégorie « {categorie.nom} » ? Cette action est irréversible.
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
