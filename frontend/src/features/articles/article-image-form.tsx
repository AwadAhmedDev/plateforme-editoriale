"use client";

import { useActionState, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { uploadMainImage, type ArticleMediaActionState } from "@/features/articles/article-media-actions";
import { ImageUploadField } from "@/features/articles/image-upload-field";

const initialState: ArticleMediaActionState = { status: "idle", message: null };

// Formulaire indépendant du contenu (arbitrage Lot 10, §1) : `uploadMainImage` est une
// Server Action distincte d'`updateArticle`, scoped à un id déjà existant — jamais
// disponible en Création. Le champ fichier d'`ImageUploadField` n'a pas d'attribut `name`
// (Lot 9, composant purement UI) : le FormData est donc construit manuellement à la
// soumission plutôt que par action={formAction} native, sans toucher au composant.
export function ArticleImageForm({
  id,
  imagePrincipaleUrl,
  imageAltText,
}: {
  id: string;
  imagePrincipaleUrl: string | null;
  imageAltText: string | null;
}) {
  const router = useRouter();
  const boundUploadMainImage = uploadMainImage.bind(null, id);
  const [state, formAction, pending] = useActionState(boundUploadMainImage, initialState);
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState(imageAltText ?? "");

  // `imageAltText` redevient la seule source de vérité à chaque nouvelle valeur reçue du
  // serveur. router.refresh() (déclenché juste en dessous après succès) ne remonte pas ce
  // composant : sans cet effet, le useState initial ci-dessus ne serait plus jamais
  // réévalué, et `altText` pourrait rester figé sur une saisie locale même une fois la
  // nouvelle valeur confirmée par le serveur redescendue en prop.
  // Réalignements pendant le rendu (patron React « ajuster un état quand une prop change »),
  // plutôt qu'un setState dans un effet qui provoquerait un rendu intermédiaire périmé.
  const [altTextRecu, setAltTextRecu] = useState(imageAltText);
  if (imageAltText !== altTextRecu) {
    setAltTextRecu(imageAltText);
    setAltText(imageAltText ?? "");
  }
  const [etatTraite, setEtatTraite] = useState(state);
  if (state !== etatTraite) {
    setEtatTraite(state);
    if (state.status === "success") setFile(null);
  }

  // Seul l'effet de bord (relecture serveur) reste dans un effet.
  useEffect(() => {
    if (state.status === "success") router.refresh();
  }, [state, router]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const donnees = new FormData();
    if (file) donnees.append("image", file);
    donnees.append("imageAltText", altText);
    formAction(donnees);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      {imagePrincipaleUrl && (
        <a
          href={imagePrincipaleUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-zinc-600 underline-offset-2 hover:underline dark:text-zinc-400"
        >
          Voir l&apos;image actuelle
        </a>
      )}

      <ImageUploadField file={file} onFileChange={setFile} altText={altText} onAltTextChange={setAltText} />

      <button
        type="submit"
        disabled={pending}
        className="h-10 w-fit rounded-md bg-zinc-900 px-4 text-sm font-medium text-white disabled:opacity-70 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? "Envoi…" : "Mettre à jour l'image"}
      </button>

      {state.status === "error" && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      )}
      {state.status === "success" && (
        <p role="status" className="text-sm text-green-700 dark:text-green-400">
          {state.message}
        </p>
      )}
    </form>
  );
}
