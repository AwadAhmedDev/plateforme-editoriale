"use client";

import { useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { removeSubscriber, type NewsletterActionState } from "@/features/newsletter/newsletter-actions";
import type { SubscriberListItem } from "@/features/newsletter/list-subscribers";

const initialState: NewsletterActionState = { status: "idle", message: null };
const PAGE_SIZE = 20;

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
}

// Table Gestion newsletter (ui-specification.md §Tables Administrateur : E-mail, Date
// d'inscription, Action) + filtre e-mail en tête de table + pagination numérotée 20
// lignes (api-contracts.md §1.6/§4.4, obligatoire — cf. analyse documentaire) + retrait
// via Modal (§Modales), sur le pattern déjà validé de ZoneTable/CategoryTable.
export function SubscriberTable({
  subscribers,
  total,
  page,
  emailFilter,
}: {
  subscribers: SubscriberListItem[];
  total: number;
  hasNextPage: boolean;
  page: number;
  emailFilter: string;
}) {
  const router = useRouter();
  const [removingSubscriber, setRemovingSubscriber] = useState<SubscriberListItem | null>(null);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function navigate(nextPage: number, nextEmail: string) {
    const params = new URLSearchParams();
    if (nextEmail.trim().length > 0) params.set("email", nextEmail.trim());
    params.set("page", String(nextPage));
    router.push(`/admin/newsletter?${params.toString()}`);
  }

  function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    navigate(1, String(formData.get("email") ?? ""));
  }

  return (
    <>
      <form onSubmit={handleFilterSubmit} className="mb-4 flex items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="email-filter" className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
            Filtrer par e-mail
          </label>
          <input
            id="email-filter"
            name="email"
            type="text"
            defaultValue={emailFilter}
            className="h-10 w-64 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
        <button
          type="submit"
          className="h-10 rounded-md border border-zinc-300 px-4 text-sm font-medium text-zinc-900 dark:border-zinc-700 dark:text-zinc-100"
        >
          Filtrer
        </button>
        {emailFilter.length > 0 && (
          <button
            type="button"
            onClick={() => navigate(1, "")}
            className="h-10 px-3 text-sm text-zinc-600 underline-offset-2 hover:underline dark:text-zinc-400"
          >
            Réinitialiser
          </button>
        )}
      </form>

      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">{total} inscrit{total > 1 ? "s" : ""}</p>

      {subscribers.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {emailFilter.length > 0 ? "Aucun inscrit ne correspond à ce filtre." : "Aucun inscrit pour le moment."}
        </p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-[12px] font-mono uppercase text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <th className="py-2">E-mail</th>
              <th className="py-2">Date d&apos;inscription</th>
              <th className="py-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((subscriber) => (
              <tr key={subscriber.id} className="border-b border-zinc-100 dark:border-zinc-800">
                <td className="py-3">{subscriber.email}</td>
                <td className="py-3">{formatDate(subscriber.dateInscription)}</td>
                <td className="py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setRemovingSubscriber(subscriber)}
                    className="text-red-600 underline-offset-2 hover:underline dark:text-red-400"
                  >
                    Retirer
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
              onClick={() => navigate(pageNumber, emailFilter)}
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

      {removingSubscriber && (
        <RemoveSubscriberDialog subscriber={removingSubscriber} onClose={() => setRemovingSubscriber(null)} />
      )}
    </>
  );
}

function RemoveSubscriberDialog({
  subscriber,
  onClose,
}: {
  subscriber: SubscriberListItem;
  onClose: () => void;
}) {
  const boundRemoveSubscriber = removeSubscriber.bind(null, subscriber.id);
  const [state, formAction, pending] = useActionState(boundRemoveSubscriber, initialState);
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
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Retirer l&apos;inscrit</h2>
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
        Retirer définitivement « {subscriber.email} » de la newsletter ? Cette action est irréversible.
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
          {pending ? "Retrait…" : "Retirer"}
        </button>
      </form>
    </dialog>
  );
}
