"use client";

import {
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deleteArticle, type ArticleActionState } from "@/features/articles/article-actions";
import type { StatutArticle } from "@/features/articles/status-pills";
import { StatusBadge } from "@/components/admin/status-badge";
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

// Tri (Lot B2, ui-specification.md §Tables Administrateur : « Tri : uniquement sur Date et
// Statut (table Articles) ; clic sur l'en-tête inverse le sens (asc/desc), chevron indiquant
// le sens actif »). Union fermée identique à celle du schéma Zod (article-schema.ts) et du
// Repository — la table ne peut donc jamais émettre un couple que le serveur refuserait.
type ChampTri = "date" | "statut";
type SensTri = "asc" | "desc";

// Sens appliqué à la première activation d'une colonne encore inactive : le plus récent
// d'abord pour une date, l'ordre éditorial (brouillon → publié → archivé, ordre de
// déclaration de l'enum PostgreSQL `statut_contenu`) pour le statut.
const SENS_PAR_DEFAUT: Record<ChampTri, SensTri> = { date: "desc", statut: "asc" };

// État de tri effectif du rendu courant. Sans paramètre d'URL, `findManyAdmin` trie par
// `dateDerniereModification` décroissante : l'en-tête doit refléter cet ordre réellement
// appliqué, et non afficher « aucun tri ».
const CHAMP_PAR_DEFAUT: ChampTri = "date";

// Table Gestion des articles (ui-specification.md §Tables Administrateur : Titre, Statut,
// Catégorie, Zone, Dernière modification, Actions) + filtres statut/catégorie/zone en tête
// de table pilotés par l'URL + pagination numérotée 20 lignes, sur le patron exact de
// SubscriberTable (filtre → URLSearchParams → router.push) et CategoryTable/ZoneTable
// (Modal de confirmation native <dialog> pour Supprimer). « Modifier » navigue vers
// l'Éditeur (/admin/articles/{id}) — contrairement à CategoryTable/ZoneTable, il n'existe
// pas d'édition inline pour un article (l'Éditeur, Lot 10, reste le seul écran de
// modification). Le statut par ligne est une StatusBadge en lecture seule
// (StatusPills reste le sélecteur de l'Éditeur).
export function ArticleTable({
  articles,
  total,
  page,
  statutFilter,
  categorieIdFilter,
  zoneIdFilter,
  tri,
  sens,
  categories,
  zones,
}: {
  articles: ArticleAdminListItem[];
  total: number;
  page: number;
  statutFilter: string;
  categorieIdFilter: string;
  zoneIdFilter: string;
  tri: string;
  sens: string;
  categories: CategoryListItem[];
  zones: ZoneListItem[];
}) {
  const router = useRouter();
  const [deletingArticle, setDeletingArticle] = useState<ArticleAdminListItem | null>(null);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasActiveFilter = statutFilter.length > 0 || categorieIdFilter.length > 0 || zoneIdFilter.length > 0;

  // Résolution du tri effectivement rendu. Un couple invalide (URL éditée à la main) est
  // rejeté en bloc par le schéma Zod côté serveur, qui retombe alors sur le tri par défaut :
  // la même condition est appliquée ici, sinon l'en-tête annoncerait un ordre que la liste
  // affichée n'a pas.
  const champDemande: ChampTri | null = tri === "statut" || tri === "date" ? tri : null;
  const sensDemande: SensTri | null = sens === "asc" || sens === "desc" ? sens : null;
  // `sens` absent est licite (le serveur applique alors le sens naturel de la colonne) ; `sens`
  // présent mais invalide ne l'est pas, et invalide tout le couple.
  const coupleValide = champDemande !== null && (sens.length === 0 || sensDemande !== null);
  const champActif: ChampTri = coupleValide && champDemande !== null ? champDemande : CHAMP_PAR_DEFAUT;
  const sensActif: SensTri = coupleValide && sensDemande !== null ? sensDemande : SENS_PAR_DEFAUT[champActif];

  // Signature objet plutôt que positionnelle : chaque appelant ne décrit que ce qu'il change,
  // le reste de l'état d'URL (filtres, tri, page) étant repris tel quel. Filtrer ne perd donc
  // jamais le tri, trier ne perd jamais les filtres, et paginer ne perd ni l'un ni l'autre.
  function navigate(cible: {
    page?: number;
    statut?: string;
    categorieId?: string;
    zoneId?: string;
    tri?: ChampTri;
    sens?: SensTri;
  }) {
    const nextStatut = cible.statut ?? statutFilter;
    const nextCategorieId = cible.categorieId ?? categorieIdFilter;
    const nextZoneId = cible.zoneId ?? zoneIdFilter;
    const nextChamp = cible.tri ?? champActif;
    const nextSens = cible.sens ?? sensActif;

    const params = new URLSearchParams();
    if (nextStatut.length > 0) params.set("statut", nextStatut);
    if (nextCategorieId.length > 0) params.set("categorieId", nextCategorieId);
    if (nextZoneId.length > 0) params.set("zoneId", nextZoneId);
    // Tri par défaut laissé hors de l'URL, comme un filtre vide : /admin/articles?page=1 reste
    // l'URL canonique de la liste.
    if (nextChamp !== CHAMP_PAR_DEFAUT || nextSens !== SENS_PAR_DEFAUT[CHAMP_PAR_DEFAUT]) {
      params.set("tri", nextChamp);
      params.set("sens", nextSens);
    }
    params.set("page", String(cible.page ?? page));
    router.push(`/admin/articles?${params.toString()}`);
  }

  function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    navigate({
      page: 1,
      statut: String(formData.get("statut") ?? ""),
      categorieId: String(formData.get("categorieId") ?? ""),
      zoneId: String(formData.get("zoneId") ?? ""),
    });
  }

  // Changer de tri renvoie en page 1 : le rang d'une ligne dans la liste réordonnée n'a plus
  // aucun rapport avec sa page précédente.
  function handleSort(champ: ChampTri, sensDemande: SensTri) {
    navigate({ page: 1, tri: champ, sens: sensDemande });
  }

  // Ligne cliquable vers l'Éditeur (Lot B5, ui-specification.md §Tables Administrateur :
  // « Ligne cliquable dans son ensemble vers l'édition (table Articles), sauf sur la colonne
  // Actions elle-même »). Confort souris uniquement : la ligne ne reçoit ni `role` ni
  // `tabIndex`, elle reste une simple ligne de tableau pour les technologies d'assistance, et
  // le lien « Modifier » demeure le chemin clavier — dupliquer la cible ajouterait un arrêt de
  // tabulation par ligne et un faux bouton annoncé en plus du lien réel.
  function handleRowClick(event: MouseEvent<HTMLTableRowElement>, articleId: string) {
    // Clic modifié : `router.push` ne sait honorer ni « ouvrir dans un nouvel onglet » ni
    // « ouvrir dans une nouvelle fenêtre » — laissés au lien « Modifier », qui les gère
    // nativement.
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    // Sélection de texte en cours : l'administrateur copie une valeur de la ligne, il ne
    // demande pas à naviguer.
    if (window.getSelection()?.isCollapsed === false) return;
    router.push(`/admin/articles/${articleId}`);
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
            onClick={() => navigate({ page: 1, statut: "", categorieId: "", zoneId: "" })}
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
              <SortableHeader
                label="Statut"
                champ="statut"
                champActif={champActif}
                sensActif={sensActif}
                onSort={handleSort}
              />
              <th className="py-2">Catégorie</th>
              <th className="py-2">Zone</th>
              <SortableHeader
                label="Dernière modification"
                champ="date"
                champActif={champActif}
                sensActif={sensActif}
                onSort={handleSort}
              />
              <th className="py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr
                key={article.id}
                onClick={(event) => handleRowClick(event, article.id)}
                className="cursor-pointer border-b border-zinc-100 dark:border-zinc-800"
              >
                <td className="py-3">{article.titre ?? "Article sans titre"}</td>
                <td className="py-3">
                  <StatusBadge statut={article.statut} />
                </td>
                <td className="py-3">{article.categorie?.nom ?? "—"}</td>
                <td className="py-3">{article.zone?.nom ?? "—"}</td>
                <td className="py-3">{formatDate(article.dateDerniereModification)}</td>
                {/* Colonne Actions : le clic y est arrêté avant d'atteindre la ligne, pour
                    « Modifier » comme pour « Supprimer ». Vérifié en navigateur : un
                    `stopPropagation` posé sur la cellule neutralise les deux, quel que soit
                    l'élément interne réellement cliqué. */}
                <td className="py-3 text-right" onClick={(event) => event.stopPropagation()}>
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
              onClick={() => navigate({ page: pageNumber })}
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

// En-tête de colonne triable. `aria-sort` est porté par le `<th>` lui-même (seul élément de
// rôle `columnheader`, l'attribut n'a aucune valeur sur le bouton) et n'existe que sur les deux
// colonnes triables — les colonnes Titre/Catégorie/Zone/Actions restent des `<th>` nus, sans
// `aria-sort="none"` qui les annoncerait à tort comme triables. Le libellé est enveloppé dans
// un vrai `<button>` : un `onClick` posé sur le `<th>` ne serait ni focusable ni actionnable au
// clavier. Typographie inchangée (héritée du `<tr>`), la seule addition visuelle étant le
// chevron exigé par ui-specification.md.
function SortableHeader({
  label,
  champ,
  champActif,
  sensActif,
  onSort,
}: {
  label: string;
  champ: ChampTri;
  champActif: ChampTri;
  sensActif: SensTri;
  onSort: (champ: ChampTri, sens: SensTri) => void;
}) {
  const actif = champ === champActif;
  // Colonne active : le clic inverse le sens. Colonne inactive : il l'active dans son sens
  // naturel (jamais de troisième état « non trié », absent de la spécification).
  const sensAuClic: SensTri = actif ? (sensActif === "asc" ? "desc" : "asc") : SENS_PAR_DEFAUT[champ];

  return (
    <th className="py-2" aria-sort={actif ? (sensActif === "asc" ? "ascending" : "descending") : "none"}>
      <button
        type="button"
        onClick={() => onSort(champ, sensAuClic)}
        className="inline-flex items-center gap-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
      >
        {label}
        <span aria-hidden="true" className={actif ? undefined : "invisible"}>
          {sensActif === "asc" ? "▲" : "▼"}
        </span>
      </button>
    </th>
  );
}

function DeleteArticleDialog({ article, onClose }: { article: ArticleAdminListItem; onClose: () => void }) {
  const boundDeleteArticle = deleteArticle.bind(null, article.id);
  const [state, formAction, pending] = useActionState(boundDeleteArticle, initialState);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const declencheurRef = useRef<HTMLElement | null>(null);
  // Identifiant du titre (Lot B4) : `useId()` garantit un identifiant unique par instance,
  // stable d'un rendu à l'autre, sans le dériver de l'entité affichée ni risquer de collision
  // avec les identifiants déjà posés ailleurs dans la page.
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
          Supprimer l&apos;article
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
