"use client";

// Composant purement présentationnel (Lot 9) : sélection d'un fichier image + texte
// alternatif. Aucun appel à uploadMainImage/uploadImage, aucune validation de taille ou
// de format ici — lib/media/upload-image.ts (octets de signature, 5 Mo max) reste la
// seule autorité ; ce composant ne fait que restituer `file`/`altText` à l'appelant.

export function ImageUploadField({
  file,
  onFileChange,
  altText,
  onAltTextChange,
}: {
  file: File | null;
  onFileChange: (file: File | null) => void;
  altText: string;
  onAltTextChange: (altText: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="image-principale" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Image principale
        </label>
        <input
          id="image-principale"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
          className="text-sm text-zinc-700 file:mr-3 file:h-9 file:cursor-pointer file:rounded-md file:border-0 file:bg-zinc-900 file:px-4 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-700 dark:text-zinc-300 dark:file:bg-zinc-100 dark:file:text-zinc-900"
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {file ? file.name : "Aucun fichier sélectionné."}
        </p>
      </div>

      {file && (
        <button
          type="button"
          onClick={() => onFileChange(null)}
          className="inline-flex h-9 w-fit items-center rounded-md border border-zinc-300 px-3.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Retirer l&apos;image sélectionnée
        </button>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="image-alt-text" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Texte alternatif
        </label>
        <input
          id="image-alt-text"
          type="text"
          value={altText}
          onChange={(event) => onAltTextChange(event.target.value)}
          className="h-11 rounded-md border border-zinc-300 px-3.5 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-zinc-100"
        />
      </div>
    </div>
  );
}
