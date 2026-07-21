"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AdminError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-7 text-center">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Une erreur est survenue</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Une erreur inattendue s&apos;est produite dans l&apos;espace d&apos;administration. Vous pouvez
        réessayer ou revenir au tableau de bord.
      </p>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={unstable_retry}
          className="h-10 rounded-md bg-zinc-900 px-4 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Réessayer
        </button>
        <Link href="/admin" className="text-sm text-zinc-600 underline dark:text-zinc-400">
          Retour au tableau de bord
        </Link>
      </div>
    </main>
  );
}
