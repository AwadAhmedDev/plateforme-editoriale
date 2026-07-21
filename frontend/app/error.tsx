"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function RootError({
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
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-1 flex-col items-center justify-center gap-4 px-5 py-16 text-center">
      <h1 className="font-editorial text-2xl">Une erreur est survenue</h1>
      <p className="text-text-secondary">
        Une erreur inattendue s&apos;est produite. Vous pouvez réessayer ou revenir à l&apos;Accueil.
      </p>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={unstable_retry}
          className="rounded-sm bg-accent-warm px-5 py-2 text-sm font-medium text-white transition-colors duration-fast hover:opacity-90"
        >
          Réessayer
        </button>
        <Link
          href="/"
          className="text-accent-primary transition-colors duration-fast hover:text-accent-primary-hover"
        >
          Retour à l&apos;Accueil
        </Link>
      </div>
    </main>
  );
}
