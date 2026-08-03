import Link from "next/link";
import type { CategorieMenuItem } from "@/features/taxonomies/list-categorie-menu";
import type { ZoneMenuItem } from "@/features/taxonomies/list-zone-menu";
import { TYPE_CONTENU_LABELS, estTypeContenuValide } from "@/features/articles/type-contenu-labels";
import { lireParam, normaliserJour } from "@/lib/filtres-publics";
import { normaliserPageDemandee } from "@/lib/pagination";

// Axes de filtrage des pages de listing. Chaque page omet celui que sa route donne déjà :
// /categorie/[slug] n'expose pas `categorie`, /zone/[slug] n'expose pas `zone`, /articles
// les expose tous les quatre (ui-specification.md §Comportement des filtres).
export type PublicFilterAxe = "categorie" | "zone" | "type" | "date";

export type PublicFiltersValeurs = {
  categorie?: string;
  zone?: string;
  type?: string;
  du?: string;
  au?: string;
};

export type PublicFiltersProps = {
  // Chemin du listing, servant à la fois d'`action` du formulaire et de cible du lien de
  // réinitialisation — jamais une URL portant des paramètres.
  basePath: string;
  axes: readonly PublicFilterAxe[];
  // Valeurs déjà normalisées par la page (cf. src/lib/filtres-publics.ts) : une borne de
  // date rejetée arrive ici en `undefined` et n'est donc jamais réaffichée.
  valeurs: PublicFiltersValeurs;
  categories?: CategorieMenuItem[];
  zones?: ZoneMenuItem[];
};

export type FiltresListing = {
  page: number;
  categorieSlug: string;
  zoneSlug: string;
  typeContenu: string;
  du: string;
  au: string;
};

// Lecture unique des filtres d'une page de listing, partagée par les trois pages ET, sur
// chacune, par generateMetadata et le composant de page — jamais deux normalisations
// parallèles qui pourraient diverger. Seules les valeurs valides survivent : un `type`
// inconnu ou une date mal formée deviennent chaîne vide, donc ne sont ni appliqués, ni
// réaffichés dans le formulaire, ni reportés sur les liens de pagination, ni écrits dans le
// canonical (règle du Lot 2A étendue aux pages de listing). Les slugs de rubrique et de
// pays échappent à cette validation : elle exige un accès base, laissé aux features.
export function lireFiltresListing(searchParams: {
  [key: string]: string | string[] | undefined;
}): FiltresListing {
  const type = lireParam(searchParams.type);

  return {
    page: normaliserPageDemandee(searchParams.page),
    categorieSlug: lireParam(searchParams.categorie),
    zoneSlug: lireParam(searchParams.zone),
    typeContenu: estTypeContenuValide(type) ? type : "",
    du: normaliserJour(lireParam(searchParams.du)) ?? "",
    au: normaliserJour(lireParam(searchParams.au)) ?? "",
  };
}

// Paramètres réellement appliqués, à reporter à l'identique sur les liens de pagination et
// dans le canonical auto-référent — jamais une valeur vide, qui produirait des URLs du type
// "?zone=&page=2". `page` en est exclu : il est porté séparément par les constructeurs
// d'URL. Un objet vide signifie « page non filtrée », ce qui pilote aussi bien le `robots`
// que l'omission du CollectionPage.
export function filtresAppliques(filtres: FiltresListing): Record<string, string> {
  const params: Record<string, string> = {};
  if (filtres.categorieSlug) params.categorie = filtres.categorieSlug;
  if (filtres.zoneSlug) params.zone = filtres.zoneSlug;
  if (filtres.typeContenu) params.type = filtres.typeContenu;
  if (filtres.du) params.du = filtres.du;
  if (filtres.au) params.au = filtres.au;
  return params;
}

const LABEL = "mb-1.5 block text-[11px] font-semibold uppercase tracking-[.12em] text-text-secondary";

// `min-w-0` est structurel, pas décoratif : sans lui, un `<input type="date">` refuse de
// descendre sous sa largeur intrinsèque native (~120-140px selon le navigateur) et fait
// déborder horizontalement sa grille sur mobile. `h-11` aligne tous les champs sur la même
// hauteur — un `<select>` et un `<input type="date">` ne se calent pas spontanément à
// l'identique — et atteint la cible tactile de 44px.
const CHAMP =
  "h-11 w-full min-w-0 rounded-md border border-border bg-bg-primary px-3 text-sm outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary";

// Chaque axe occupe toute la largeur sous `sm`, puis partage la ligne au-delà. `min-w-0`
// autorise la contraction ; `min-w-[170px]` n'est réintroduit qu'à partir de `sm`, là où
// l'espace le permet — appliqué dès le mobile, il forçait le débordement.
const AXE = "min-w-0 sm:min-w-[170px] sm:flex-1";

// Filtres secondaires des pages de listing publiques (/articles, /categorie/[slug],
// /zone/[slug]) — exigés par ui-specification.md §Comportement des filtres, sitemap.md
// §Catégorie/§Zone et api-contracts.md §3.2/§3.6/§3.7.
//
// Formulaire GET natif, Server Component pur : aucun JavaScript, aucun composant client,
// conformément au principe déjà tenu par /recherche (REPO-6). Les champs et libellés
// reprennent à l'identique ceux de cette page — jamais une seconde direction visuelle.
//
// Distinct de la sidebar de /recherche, et volontairement non partagé avec elle : le
// design impose ici une ligne horizontale au-dessus des résultats (ui-specification.md
// §Filtres, « Desktop : ligne de pills »), là où /recherche dispose d'une colonne dédiée et
// porte deux axes supplémentaires (`q`, `sort`) hors périmètre des pages de listing.
//
// AUCUN champ `page` caché, jamais : soumettre un filtre depuis la page 3 doit repartir en
// page 1. Une nouvelle combinaison de filtres est un nouvel ensemble de résultats, donc une
// nouvelle première page — conserver `page` produirait un 404 immédiat sur un ensemble
// réduit (règle de bornes du Lot 1A).
//
// Lien de réinitialisation affiché uniquement lorsqu'au moins un filtre est actif
// (ui-specification.md §Filtres, « toujours visible dès qu'un filtre est actif ») — à la
// différence de /recherche, qui l'affiche en permanence.
export function PublicFilters({ basePath, axes, valeurs, categories, zones }: PublicFiltersProps) {
  const auMoinsUnFiltreActif = Boolean(
    valeurs.categorie || valeurs.zone || valeurs.type || valeurs.du || valeurs.au
  );

  return (
    <form
      action={basePath}
      method="GET"
      className="mt-6 flex flex-col gap-5 rounded-[8px] border border-border bg-bg-secondary p-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-x-4 sm:gap-y-5 sm:p-5"
    >
      {axes.includes("categorie") && (
        <div className={AXE}>
          <label htmlFor="categorie" className={LABEL}>
            Rubrique
          </label>
          <select id="categorie" name="categorie" defaultValue={valeurs.categorie ?? ""} className={CHAMP}>
            <option value="">Toutes les rubriques</option>
            {(categories ?? []).map((categorie) => (
              <option key={categorie.slug} value={categorie.slug}>
                {categorie.nom}
              </option>
            ))}
          </select>
        </div>
      )}

      {axes.includes("zone") && (
        <div className={AXE}>
          <label htmlFor="zone" className={LABEL}>
            Pays
          </label>
          <select id="zone" name="zone" defaultValue={valeurs.zone ?? ""} className={CHAMP}>
            <option value="">Tous les pays</option>
            {(zones ?? []).map((zone) => (
              <option key={zone.slug} value={zone.slug}>
                {zone.nom}
              </option>
            ))}
          </select>
        </div>
      )}

      {axes.includes("type") && (
        <div className={AXE}>
          <label htmlFor="type" className={LABEL}>
            Type de contenu
          </label>
          <select id="type" name="type" defaultValue={valeurs.type ?? ""} className={CHAMP}>
            <option value="">Tous les types</option>
            {Object.entries(TYPE_CONTENU_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Bornes de date dans un <fieldset> avec <legend> : elles forment une seule plage,
          pas deux filtres indépendants, et c'est le seul patron qui l'annonce à un lecteur
          d'écran (chaque champ gardant par ailleurs son propre <label>). Repris tel quel du
          Lot 2A sur /recherche. */}
      {axes.includes("date") && (
        <fieldset className="min-w-0 sm:min-w-[280px] sm:flex-1">
          <legend className={LABEL}>Date de publication</legend>
          {/* Empilées sous `sm`, côte à côte au-delà : à 375px, deux `<input type="date">`
              natifs partagent ~130px chacun, se retrouvent collés et débordent de la carte.
              `min-w-0` sur chaque cellule complète celui du champ — sans lui, la grille
              conserve la largeur intrinsèque de ses colonnes et déborde malgré tout. */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="min-w-0">
              <label htmlFor="du" className="mb-1 block text-[12px] text-text-secondary">
                Du
              </label>
              <input type="date" id="du" name="du" defaultValue={valeurs.du ?? ""} className={CHAMP} />
            </div>
            <div className="min-w-0">
              <label htmlFor="au" className="mb-1 block text-[12px] text-text-secondary">
                Au
              </label>
              <input type="date" id="au" name="au" defaultValue={valeurs.au ?? ""} className={CHAMP} />
            </div>
          </div>
        </fieldset>
      )}

      {/* Les deux actions partagent la largeur sous `sm` plutôt que de se tasser à gauche,
          et retrouvent leur largeur intrinsèque au-delà. */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="h-11 flex-1 rounded-md bg-accent-primary px-4 text-sm font-semibold text-white outline-none transition-colors duration-fast hover:bg-accent-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary sm:flex-none"
        >
          Filtrer
        </button>

        {auMoinsUnFiltreActif && (
          <Link
            href={basePath}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-md border border-border px-4 text-[13px] text-text-secondary outline-none transition-colors duration-fast hover:border-accent-primary hover:text-accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary sm:flex-none"
          >
            Réinitialiser les filtres
          </Link>
        )}
      </div>
    </form>
  );
}
