"use client";

import { useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deleteArticle, type ArticleActionState } from "@/features/articles/article-actions";
import { StatusPills, type StatutArticle } from "@/features/articles/status-pills";
import type { ArticleAdminListItem } from "@/lib/db/contenu-editorial-repository";
import type { CategoryListItem } from "@/features/taxonomies/list-categories";
import type { ZoneListItem } from "@/features/taxonomies/list-zones";

const initialState: ArticleActionState = { status: "idle", message: null };
const PAGE_SIZE = 20;

const STATUTS: ReadonlyArray<{ value: StatutArticle; label: string }> = [
  { value: "brouillon", label: "Brouillon" },
  { value: "publie", label: "Publié" },
  { value: "archive", label: "Archivé" },
];

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
}

// Table Gestion des articles (ui-specification.md §Tables Administrateur : Titre, Statut,
// Catégorie, Zone, Dernière modification, Actions) + filtres statut/catégorie/zone en tête
// de table pilotés par l'URL + pagination numérotée 20 lignes, sur le patron exact de
// SubscriberTable (filtre → URLSearchParams → router.push) et CategoryTable/ZoneTable
// (Modal de confirmation native <dialog> pour Supprimer). « Modifier » navigue vers
// l'Éditeur (/admin/articles/{id}) — contrairement à CategoryTable/ZoneTable, il n'existe
// pas d'édition inline pour un article (l'Éditeur, Lot 10, reste le seul écran de
// modification). StatusPills (Lot 9, non modifié) est réutilisé tel quel pour l'affichage
// du statut par ligne ; comme il exige un `onChange`, celui-ci est un no-op et le composant
// est rendu `inert` pour ne jamais se comporter comme un sélecteur silencieusement inactif.
export function ArticleTable({
  articles,
  total,
  page,
  statutFilter,
  categorieIdFilter,
  zoneIdFilter,
  categories,
  zones,
}: {
  articles: ArticleAdminListItem[];
  total: number;
  page: number;
  statutFilter: string;
  categorieIdFilter: string;
  zoneIdFilter: string;
  categories: CategoryListItem[];
  zones: ZoneListItem[];
}) {
  const router = useRouter();
  const [deletingArticle, setDeletingArticle] = useState<ArticleAdminListItem | null>(null);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasActiveFilter = statutFilter.length > 0 || categorieIdFilter.length > 0 || zoneIdFilter.length > 0;

  function navigate(nextPage: number, nextStatut: string, nextCategorieId: string, nextZoneId: string) {
    const params = new URLSearchParams();
    if (nextStatut.length > 0) params.set("statut", nextStatut);
    if (nextCategorieId.length > 0) params.set("categorieId", nextCategorieId);
    if (nextZoneId.length > 0) params.set("zoneId", nextZoneId);
    params.set("page", String(nextPage));
    router.push(`/admin/articles?${params.toString()}`);
  }

  function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    navigate(
      1,
      String(formData.get("statut") ?? ""),
      String(formData.get("categorieId") ?? ""),
      String(formData.get("zoneId") ?? "")
    );
  }

  return (
    <>
      <form onSubmit={handleFilterSubmit} className="mb-4 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="statut-filter" className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
            Statut
          </label>
          <select
            id="statut-filter"
            name="statut"
            defaultValue={statutFilter}
            className="h-10 w-44 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <option value="">— Tous —</option>
            {STATUTS.map((statut) => (
              <option key={statut.value} value={statut.value}>
                {statut.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="categorie-filter" className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
            Catégorie
          </label>
          <select
            id="categorie-filter"
            name="categorieId"
            defaultValue={categorieIdFilter}
            className="h-10 w-48 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <option value="">— Toutes —</option>
            {categories.map((categorie) => (
              <option key={categorie.id} value={categorie.id}>
                {categorie.nom}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="zone-filter" className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
            Zone géographique
          </label>
          <select
            id="zone-filter"
            name="zoneId"
            defaultValue={zoneIdFilter}
            className="h-10 w-48 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <option value="">— Toutes —</option>
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.nom}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="h-10 rounded-md border border-zinc-300 px-4 text-sm font-medium text-zinc-900 dark:border-zinc-700 dark:text-zinc-100"
        >
          Filtrer
        </button>
        {hasActiveFilter && (
          <button
            type="button"
            onClick={() => navigate(1, "", "", "")}
            className="h-10 px-3 text-sm text-zinc-600 underline-offset-2 hover:underline dark:text-zinc-400"
          >
            Réinitialiser les filtres
          </button>
        )}
      </form>

      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
        {total} article{total > 1 ? "s" : ""}
      </p>

      {articles.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {hasActiveFilter ? "Aucun article ne correspond à ces critères." : "Aucun article pour le moment."}
        </p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-[12px] font-mono uppercase text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <th className="py-2">Titre</th>
              <th className="py-2">Statut</th>
              <th className="py-2">Catégorie</th>
              <th className="py-2">Zone</th>
              <th className="py-2">Dernière modification</th>
              <th className="py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id} className="border-b border-zinc-100 dark:border-zinc-800">
                <td className="py-3">{article.titre ?? "Article sans titre"}</td>
                <td className="py-3">
                  <span className="inline-block" inert>
                    <StatusPills value={article.statut} onChange={() => {}} />
                  </span>
                </td>
                <td className="py-3">{article.categorie?.nom ?? "—"}</td>
                <td className="py-3">{article.zone?.nom ?? "—"}</td>
                <td className="py-3">{formatDate(article.dateDerniereModification)}</td>
                <td className="py-3 text-right">
                  <Link
                    href={`/admin/articles/${article.id}`}
                    className="text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-100"
                  >
                    Modifier
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDeletingArticle(article)}
                    className="ml-3 text-red-600 underline-offset-2 hover:underline dark:text-red-400"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-4 flex gap-2">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => navigate(pageNumber, statutFilter, categorieIdFilter, zoneIdFilter)}
              aria-current={pageNumber === page ? "page" : undefined}
              className={`h-9 w-9 rounded-md border text-sm ${
                pageNumber === page
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                  : "border-zinc-300 text-zinc-900 dark:border-zinc-700 dark:text-zinc-100"
              }`}
            >
              {pageNumber}
            </button>
          ))}
        </nav>
      )}

      {deletingArticle && (
        <DeleteArticleDialog article={deletingArticle} onClose={() => setDeletingArticle(null)} />
      )}
    </>
  );
}

function DeleteArticleDialog({ article, onClose }: { article: ArticleAdminListItem; onClose: () => void }) {
  const boundDeleteArticle = deleteArticle.bind(null, article.id);
  const [state, formAction, pending] = useActionState(boundDeleteArticle, initialState);
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
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Supprimer l&apos;article</h2>
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
        Supprimer définitivement « {article.titre ?? "Article sans titre"} » ? Cette action est irréversible.
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
