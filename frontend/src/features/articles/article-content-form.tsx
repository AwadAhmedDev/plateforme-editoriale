"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { updateArticle, type ArticleActionState } from "@/features/articles/article-actions";
import { createArticleAction } from "@/features/articles/create-article-action";
import { KeywordTagInput } from "@/features/articles/keyword-tag-input";
import type { ArticleForEdit } from "@/lib/db/contenu-editorial-repository";
import type { CategoryListItem } from "@/features/taxonomies/list-categories";
import type { ZoneListItem } from "@/features/taxonomies/list-zones";

const initialState: ArticleActionState = { status: "idle", message: null };

const TYPES_CONTENU: ReadonlyArray<{ value: string; label: string }> = [
  { value: "article", label: "Actualité" },
  { value: "analyse", label: "Analyse" },
  { value: "enquete", label: "Enquête" },
  { value: "interview", label: "Interview" },
  { value: "dossier_thematique", label: "Dossier" },
  { value: "rapport", label: "Rapport" },
];

// Formulaire unique pour Création (article === null → createArticleAction) et Édition
// (article fourni → updateArticle lié à son id, pattern .bind(null, id) déjà utilisé par
// updateCategory/updateZone dans category-table.tsx/zone-table.tsx). `updateArticle` est
// traité comme un PUT complet (audit validé) : imagePrincipaleUrl/imageAltText/motsCles
// courants sont systématiquement reportés en entrées cachées, même absents de l'écran,
// pour ne jamais les effacer à une simple sauvegarde de contenu.
export function ArticleContentForm({
  article,
  categories,
  zones,
}: {
  article: ArticleForEdit | null;
  categories: CategoryListItem[];
  zones: ZoneListItem[];
}) {
  const router = useRouter();
  const boundAction = article ? updateArticle.bind(null, article.id) : createArticleAction;
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  const [motsCles, setMotsCles] = useState<string[]>(() => article?.motsCles.map((m) => m.motCle) ?? []);

  const slugRef = useRef<HTMLInputElement>(null);
  const titreRef = useRef<HTMLInputElement>(null);
  const chapoRef = useRef<HTMLTextAreaElement>(null);
  const corpsRef = useRef<HTMLTextAreaElement>(null);
  const typeContenuRef = useRef<HTMLSelectElement>(null);
  const categorieIdRef = useRef<HTMLSelectElement>(null);
  const zoneIdRef = useRef<HTMLSelectElement>(null);
  const auteurRef = useRef<HTMLInputElement>(null);
  const sourcesRef = useRef<HTMLInputElement>(null);

  // Clé stable dérivée du CONTENU des mots-clés, pas de la référence du tableau (qui change
  // à chaque relecture serveur même si le contenu est identique) — condition nécessaire pour
  // que l'effet ci-dessous ne se déclenche jamais sur un rafraîchissement provoqué par
  // ArticleImageForm ou ArticleStatusPanel (aucun des deux ne touche jamais les mots-clés).
  const motsClesKey = article?.motsCles.map((m) => m.motCle).join("") ?? "";

  // Resynchronisation (audit Lot 15, correctif Lot 15A) : contrairement à
  // ArticleStatusPanel/ArticleImageForm — dont la prop resynchronisée (`statut`,
  // `imageAltText`) ne peut changer que via leur propre action — cet effet dépend
  // délibérément de chaque champ de contenu pris individuellement, jamais de l'objet
  // `article` entier (dont la référence change à chaque rafraîchissement quelle qu'en soit
  // la cause). Seul un changement réel de VALEUR d'un de ces champs déclenche l'effet ; ni
  // uploadMainImage ni publishArticle/unpublishArticle/archiveArticle ne modifient jamais
  // titre/slug/chapo/corps/typeContenu/categorieId/zoneId/auteur/sources/motsCles — un
  // rafraîchissement déclenché par ArticleImageForm ou ArticleStatusPanel ne fait donc
  // jamais fire cet effet, et ne peut donc jamais écraser une saisie de contenu en cours,
  // non enregistrée. Risque résiduel accepté, inchangé par rapport au Lot 10A : si un autre
  // onglet modifie exactement le même champ pendant que celui-ci y est activement édité ici,
  // la valeur distante l'emporte — aucune fusion n'est tentée, cohérent avec la stratégie
  // déjà retenue pour statutConfirme/altText.
  useEffect(() => {
    if (slugRef.current) slugRef.current.value = article?.slug ?? "";
    if (titreRef.current) titreRef.current.value = article?.titre ?? "";
    if (chapoRef.current) chapoRef.current.value = article?.chapo ?? "";
    if (corpsRef.current) corpsRef.current.value = article?.corps ?? "";
    if (typeContenuRef.current) typeContenuRef.current.value = article?.typeContenu ?? "";
    if (categorieIdRef.current) categorieIdRef.current.value = article?.categorieId ?? "";
    if (zoneIdRef.current) zoneIdRef.current.value = article?.zoneId ?? "";
    if (auteurRef.current) auteurRef.current.value = article?.auteur ?? "";
    if (sourcesRef.current) sourcesRef.current.value = article?.sources ?? "";
    setMotsCles(article?.motsCles.map((m) => m.motCle) ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    article?.slug,
    article?.titre,
    article?.chapo,
    article?.corps,
    article?.typeContenu,
    article?.categorieId,
    article?.zoneId,
    article?.auteur,
    article?.sources,
    motsClesKey,
  ]);

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
      return;
    }
    // React réinitialise les champs non contrôlés dès que l'action se résout : on
    // restitue la saisie uniquement en cas d'échec (comportement déjà établi par
    // CategoryCreateForm/EditCategoryRow).
    if (state.status === "error" && state.values) {
      if (slugRef.current) slugRef.current.value = state.values.slug ?? "";
      if (titreRef.current) titreRef.current.value = state.values.titre ?? "";
      if (chapoRef.current) chapoRef.current.value = state.values.chapo ?? "";
      if (corpsRef.current) corpsRef.current.value = state.values.corps ?? "";
      if (typeContenuRef.current) typeContenuRef.current.value = state.values.typeContenu ?? "";
      if (categorieIdRef.current) categorieIdRef.current.value = state.values.categorieId ?? "";
      if (zoneIdRef.current) zoneIdRef.current.value = state.values.zoneId ?? "";
      if (auteurRef.current) auteurRef.current.value = state.values.auteur ?? "";
      if (sourcesRef.current) sourcesRef.current.value = state.values.sources ?? "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="titre" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Titre
        </label>
        <input
          ref={titreRef}
          id="titre"
          name="titre"
          type="text"
          defaultValue={article?.titre ?? ""}
          className="h-11 rounded-md border border-zinc-300 px-3.5 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-zinc-100"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="slug" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Slug (optionnel)
        </label>
        <input
          ref={slugRef}
          id="slug"
          name="slug"
          type="text"
          defaultValue={article?.slug ?? ""}
          className="h-11 rounded-md border border-zinc-300 px-3.5 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-zinc-100"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="chapo" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Chapô
        </label>
        <textarea
          ref={chapoRef}
          id="chapo"
          name="chapo"
          rows={2}
          defaultValue={article?.chapo ?? ""}
          className="rounded-md border border-zinc-300 px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-zinc-100"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="corps" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Corps
        </label>
        <textarea
          ref={corpsRef}
          id="corps"
          name="corps"
          rows={10}
          defaultValue={article?.corps ?? ""}
          className="rounded-md border border-zinc-300 px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-zinc-100"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="typeContenu" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Type de contenu
          </label>
          <select
            ref={typeContenuRef}
            id="typeContenu"
            name="typeContenu"
            defaultValue={article?.typeContenu ?? ""}
            className="h-11 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-zinc-100"
          >
            <option value="">— Sélectionner —</option>
            {TYPES_CONTENU.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="categorieId" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Catégorie
          </label>
          <select
            ref={categorieIdRef}
            id="categorieId"
            name="categorieId"
            defaultValue={article?.categorieId ?? ""}
            className="h-11 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-zinc-100"
          >
            <option value="">— Sélectionner —</option>
            {categories.map((categorie) => (
              <option key={categorie.id} value={categorie.id}>
                {categorie.nom}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="zoneId" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Zone géographique
          </label>
          <select
            ref={zoneIdRef}
            id="zoneId"
            name="zoneId"
            defaultValue={article?.zoneId ?? ""}
            className="h-11 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-zinc-100"
          >
            <option value="">— Sélectionner —</option>
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.nom}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="auteur" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Auteur
          </label>
          <input
            ref={auteurRef}
            id="auteur"
            name="auteur"
            type="text"
            defaultValue={article?.auteur ?? ""}
            className="h-11 rounded-md border border-zinc-300 px-3.5 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-zinc-100"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="sources" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Sources
          </label>
          <input
            ref={sourcesRef}
            id="sources"
            name="sources"
            type="text"
            defaultValue={article?.sources ?? ""}
            className="h-11 rounded-md border border-zinc-300 px-3.5 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-zinc-100"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Mots-clés</span>
        <KeywordTagInput value={motsCles} onChange={setMotsCles} />
        {motsCles.map((motCle) => (
          <input key={motCle} type="hidden" name="motsCles" value={motCle} />
        ))}
      </div>

      {/* Reportées systématiquement (audit Lot 10 : updateArticle traité comme un PUT
          complet) — jamais éditées ici, seulement portées par l'écran Image. */}
      <input type="hidden" name="imagePrincipaleUrl" value={article?.imagePrincipaleUrl ?? ""} />
      <input type="hidden" name="imageAltText" value={article?.imageAltText ?? ""} />

      {/* Verrouillage optimiste (audit Lot 16, correctif Lot 16A) : paramètre technique,
          jamais un champ métier — lu directement depuis FormData par updateArticle, hors
          du schéma Zod. Champ contrôlé par la prop comme les deux ci-dessus : toujours à
          jour dès que ce composant se rend avec un `article` frais. */}
      <input
        type="hidden"
        name="dateDerniereModificationAttendue"
        value={article?.dateDerniereModification.toISOString() ?? ""}
      />

      <button
        type="submit"
        disabled={pending}
        className="h-11 w-fit min-w-[160px] rounded-md bg-zinc-900 px-5 text-sm font-medium text-white disabled:opacity-70 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? "Enregistrement…" : "Enregistrer le brouillon"}
      </button>

      <span role="status" aria-live="polite" className="sr-only">
        {pending ? "Enregistrement en cours…" : ""}
      </span>

      {state.status === "error" && (
        <div role="alert" className="flex flex-col gap-1 text-sm text-red-600 dark:text-red-400">
          {state.errors && Object.keys(state.errors).length > 0 ? (
            <ul className="list-disc pl-4">
              {Object.entries(state.errors).map(([champ, message]) => (
                <li key={champ}>{message}</li>
              ))}
            </ul>
          ) : (
            <p>{state.message}</p>
          )}
        </div>
      )}
      {state.status === "success" && (
        <p role="status" className="text-sm text-green-700 dark:text-green-400">
          {state.message}
        </p>
      )}
    </form>
  );
}
