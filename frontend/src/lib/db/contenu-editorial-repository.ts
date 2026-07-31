import { Prisma, type ContenuEditorial, type StatutContenu, type TypeContenu } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;
// Relevé de 12 à 24 (REPO-6/REPO-10) : /articles et /recherche restent sans pagination
// (page 1 uniquement, décision déjà établie) — la valeur doit donc rester au-dessus du
// volume de contenu Publié réellement seedé pour ne pas tronquer silencieusement des
// résultats sans qu'aucune page 2 ne soit accessible pour les voir.
const PUBLIC_PAGE_SIZE = 24;

const ARTICLE_ADMIN_LIST_INCLUDE = { categorie: true, zone: true } satisfies Prisma.ContenuEditorialInclude;
// Étendu au Lot 8 (stratégie de revalidation) : `categorie`/`zone` réduits à leur seul
// `slug`, nécessaires à revalidate-article-surfaces.ts pour calculer les chemins publics
// concernés (/categorie/[slug], /zone/[slug]) sans dépendance directe de article-actions.ts
// vers CategorieRepository/ZoneGeographiqueRepository — la donnée transite uniquement via
// cette lecture déjà existante.
const ARTICLE_EDIT_INCLUDE = {
  motsCles: { select: { motCle: true } },
  categorie: { select: { slug: true } },
  zone: { select: { slug: true } },
} satisfies Prisma.ContenuEditorialInclude;
const ARTICLE_RECENT_INCLUDE = { categorie: { select: { nom: true } } } satisfies Prisma.ContenuEditorialInclude;
const ARTICLE_PUBLIC_LIST_INCLUDE = { categorie: true, zone: true } satisfies Prisma.ContenuEditorialInclude;
const ARTICLE_DETAIL_INCLUDE = {
  categorie: true,
  zone: true,
  motsCles: { select: { motCle: true } },
} satisfies Prisma.ContenuEditorialInclude;

export type ArticleAdminListItem = Prisma.ContenuEditorialGetPayload<{ include: typeof ARTICLE_ADMIN_LIST_INCLUDE }>;
export type ArticleForEdit = Prisma.ContenuEditorialGetPayload<{ include: typeof ARTICLE_EDIT_INCLUDE }>;
export type ArticleRecentlyModified = Prisma.ContenuEditorialGetPayload<{ include: typeof ARTICLE_RECENT_INCLUDE }>;
export type ArticlePublicListItem = Prisma.ContenuEditorialGetPayload<{ include: typeof ARTICLE_PUBLIC_LIST_INCLUDE }>;
export type ArticleBySlug = Prisma.ContenuEditorialGetPayload<{ include: typeof ARTICLE_DETAIL_INCLUDE }>;

export type ArticlesAdminFiltre = {
  statut?: StatutContenu;
  categorieId?: string;
  zoneId?: string;
};

export type ListerArticlesAdminParams = ArticlesAdminFiltre & {
  page: number;
  sort?: { champ: "date" | "statut"; sens: "asc" | "desc" };
};

export type ArticlesAdminPagines = {
  items: ArticleAdminListItem[];
  total: number;
  hasNextPage: boolean;
  page: number;
};

function construireFiltreAdmin(filtre: ArticlesAdminFiltre): Prisma.ContenuEditorialWhereInput {
  return {
    ...(filtre.statut ? { statut: filtre.statut } : {}),
    ...(filtre.categorieId ? { categorieId: filtre.categorieId } : {}),
    ...(filtre.zoneId ? { zoneId: filtre.zoneId } : {}),
  };
}

export type ArticlesPubliesFiltre = {
  categorieId?: string;
  zoneId?: string;
  typeContenu?: TypeContenu;
  dateFrom?: Date;
  dateTo?: Date;
};

export type ListerArticlesPubliesParams = ArticlesPubliesFiltre & { page: number };

export type ArticlesPubliesPagines = {
  items: ArticlePublicListItem[];
  total: number;
  hasNextPage: boolean;
  page: number;
};

// "long" (REPO-6, B22 : tri "Lecture la plus longue") : aucun champ de temps de lecture
// stocké (cf. reading-time.ts) — LENGTH(corps) sert de proxy, croissant avec le nombre de
// mots dans la quasi-totalité des cas réels, sans nécessiter de colonne ni de migration.
export type TriRechercheContenu = "recent" | "long";

export type RechercheContenuParams = ArticlesPubliesFiltre & {
  q?: string;
  page: number;
  sort?: TriRechercheContenu;
};

// Filtre public commun (findManyPublished, findLatestPublished) : `statut = 'publie'`
// non négociable, jamais paramétrable par l'appelant — seule différence avec le filtre
// admin (construireFiltreAdmin), qui laisse le statut au choix de l'appelant.
function construireFiltrePublie(filtre: ArticlesPubliesFiltre): Prisma.ContenuEditorialWhereInput {
  return {
    statut: "publie",
    ...(filtre.categorieId ? { categorieId: filtre.categorieId } : {}),
    ...(filtre.zoneId ? { zoneId: filtre.zoneId } : {}),
    ...(filtre.typeContenu ? { typeContenu: filtre.typeContenu } : {}),
    ...(filtre.dateFrom || filtre.dateTo
      ? {
          datePublication: {
            ...(filtre.dateFrom ? { gte: filtre.dateFrom } : {}),
            ...(filtre.dateTo ? { lte: filtre.dateTo } : {}),
          },
        }
      : {}),
  };
}

// Conditions SQL de recherche (search()) : `recherche_vecteur` est déclarée
// Unsupported("tsvector") côté Prisma (database-schema.md §8) — aucune méthode typée du
// client ne peut l'interroger, d'où le recours à `$queryRaw`/`Prisma.sql`. Chaque
// interpolation `${...}` est automatiquement liée en paramètre par Prisma (jamais une
// concaténation de chaîne) — c'est ce qui rend `websearch_to_tsquery` sûr ici, y compris
// face à un texte contenant des opérateurs `to_tsquery` bruts (guillemets, `&`, `|`).
function construireConditionsRecherche(params: RechercheContenuParams): Prisma.Sql[] {
  const conditions: Prisma.Sql[] = [Prisma.sql`statut = 'publie'::statut_contenu`];

  const q = params.q?.trim();
  if (q && q.length > 0) {
    conditions.push(Prisma.sql`recherche_vecteur @@ websearch_to_tsquery('french', ${q})`);
  }
  if (params.categorieId) {
    conditions.push(Prisma.sql`categorie_id = ${params.categorieId}::uuid`);
  }
  if (params.zoneId) {
    conditions.push(Prisma.sql`zone_id = ${params.zoneId}::uuid`);
  }
  if (params.typeContenu) {
    conditions.push(Prisma.sql`type_contenu = ${params.typeContenu}::type_contenu`);
  }
  if (params.dateFrom) {
    conditions.push(Prisma.sql`date_publication >= ${params.dateFrom}`);
  }
  if (params.dateTo) {
    conditions.push(Prisma.sql`date_publication <= ${params.dateTo}`);
  }

  return conditions;
}

// Les 4 métadonnées de l'image principale, produites ensemble par un envoi réussi vers le
// stockage objet (module média) — consommé exclusivement par `updateMainImage`.
export type MainImageData = {
  imagePrincipaleUrl: string;
  imageAltText: string;
  imageLargeur: number;
  imageHauteur: number;
};

// Champs scalaires acceptés en écriture pour Créer/Modifier — exclut explicitement, au
// niveau du système de types (pas seulement par discipline de relecture) : `statut` et
// `datePublication` (transitions et verrou DR-005 réservés à `publish`/`updateStatut`,
// jamais à un `update` générique), `dateDerniereModification`/`createdAt` (gérées par
// trigger), `motsCles` (géré uniquement par `syncMotsCles`), `imageLargeur`/`imageHauteur`
// (jamais des champs de saisie — dérivés par le module média, écrits uniquement par
// `updateMainImage`, jamais par `update()`).
export type CreateArticleData = Omit<
  Prisma.ContenuEditorialUncheckedCreateInput,
  | "id"
  | "statut"
  | "datePublication"
  | "dateDerniereModification"
  | "createdAt"
  | "motsCles"
  | "imageLargeur"
  | "imageHauteur"
>;

export type UpdateArticleData = Omit<
  Prisma.ContenuEditorialUncheckedUpdateInput,
  | "id"
  | "statut"
  | "datePublication"
  | "dateDerniereModification"
  | "createdAt"
  | "motsCles"
  | "imageLargeur"
  | "imageHauteur"
>;

// Normalisation d'un mot-clé (trim + minuscules + espaces internes réduits) — décision
// d'architecture validée pour le module Articles, appliquée avant toute comparaison ou
// écriture, jamais après.
function normaliserMotCle(motCle: string): string {
  return motCle.trim().toLowerCase().replace(/\s+/g, " ");
}

// Signale un verrouillage optimiste échoué (Lot 16A, cf. `update` ci-dessous) : la ligne a
// changé depuis la valeur de `dateDerniereModification` fournie par l'appelant. Distincte
// des erreurs Prisma génériques, sur le même principe que `ImageValidationError`
// (lib/media/upload-image.ts) — un type d'erreur dédié, intercepté explicitement par la
// Server Action appelante plutôt que noyé dans le `catch` générique.
export class ConcurrentModificationError extends Error {
  constructor() {
    super("La ligne a été modifiée depuis sa dernière lecture.");
    this.name = "ConcurrentModificationError";
  }
}

// Accès aux données de l'entité Contenu éditorial (technical-architecture.md §3.2).
// Aucune règle métier, aucun contrôle d'autorisation ici — uniquement des opérations
// Prisma typées.
export const ContenuEditorialRepository = {
  count(): Promise<number> {
    return prisma.contenuEditorial.count();
  },

  countByStatut(statut: StatutContenu): Promise<number> {
    return prisma.contenuEditorial.count({ where: { statut } });
  },

  // Vérification d'existence (pas un comptage complet) : suffisant pour le blocage de
  // suppression d'une Catégorie/Zone référencée (CATEGORIE_REFERENCEE), quel que soit
  // le statut du contenu associé.
  async existsByCategorieId(categorieId: string): Promise<boolean> {
    const match = await prisma.contenuEditorial.findFirst({
      where: { categorieId },
      select: { id: true },
    });
    return match !== null;
  },

  async existsByZoneId(zoneId: string): Promise<boolean> {
    const match = await prisma.contenuEditorial.findFirst({
      where: { zoneId },
      select: { id: true },
    });
    return match !== null;
  },

  // Lecture admin d'un contenu par identifiant, tous statuts, sans branchement de
  // visibilité (server-actions-specification.md §3.7 : « sans filtre de statut »),
  // mots-clés déjà rattachés inclus — nécessaire au pré-remplissage de l'Éditeur.
  findById(id: string): Promise<ArticleForEdit | null> {
    return prisma.contenuEditorial.findUnique({
      where: { id },
      include: ARTICLE_EDIT_INCLUDE,
    });
  },

  // Liste admin « Gestion des articles » (server-actions-specification.md §3.8) : tous
  // statuts confondus, contrairement aux listes publiques. Tri restreint à une liste
  // fermée de colonnes (date | statut) résolue ici, jamais par interpolation directe d'un
  // paramètre client. Page hors bornes clampée à la dernière page existante — même garde
  // que celle déjà appliquée à inscrit-newsletter-repository.ts, pour ne pas réintroduire
  // l'état incohérent (page fantôme) déjà corrigé sur le module Newsletter.
  async findManyAdmin(params: ListerArticlesAdminParams): Promise<ArticlesAdminPagines> {
    const where = construireFiltreAdmin(params);

    const total = await prisma.contenuEditorial.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const page = Math.min(Math.max(1, params.page), totalPages);

    // Tri secondaire stable (Lot B2) : `statut` ne prend que 3 valeurs et
    // `dateDerniereModification` peut être partagée (import/seed en lot), donc les ex æquo sont
    // la règle et non l'exception. Sans départage total, PostgreSQL ne garantit aucun ordre
    // entre deux lignes égales d'un OFFSET à l'autre : une même ligne pourrait apparaître sur
    // deux pages consécutives pendant qu'une autre n'apparaîtrait sur aucune. `id` (clé
    // primaire, donc unique) rend l'ordre total et la pagination déterministe ; il n'est jamais
    // un critère de tri exposé à l'utilisateur.
    const orderBy: Prisma.ContenuEditorialOrderByWithRelationInput[] =
      params.sort?.champ === "statut"
        ? [{ statut: params.sort.sens }, { dateDerniereModification: "desc" }, { id: "asc" }]
        : [{ dateDerniereModification: params.sort?.sens ?? "desc" }, { id: "asc" }];

    const items = await prisma.contenuEditorial.findMany({
      where,
      include: ARTICLE_ADMIN_LIST_INCLUDE,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    });

    return { items, total, hasNextPage: page * PAGE_SIZE < total, page };
  },

  countManyAdmin(filtre: ArticlesAdminFiltre): Promise<number> {
    return prisma.contenuEditorial.count({ where: construireFiltreAdmin(filtre) });
  },

  // 5 derniers contenus modifiés, tous statuts confondus (api-contracts.md §2.5, Dashboard).
  findRecentlyModified(limit: number): Promise<ArticleRecentlyModified[]> {
    return prisma.contenuEditorial.findMany({
      orderBy: { dateDerniereModification: "desc" },
      take: limit,
      include: ARTICLE_RECENT_INCLUDE,
    });
  },

  // Création (server-actions-specification.md §3.1) : `statut` reste au défaut base
  // ('brouillon', database-schema.md §4.5), jamais fixé ici. Aucun champ requis autre que
  // `slug` (NOT NULL UNIQUE en toute circonstance) — cohérent avec « un Brouillon peut
  // rester incomplet sur l'ensemble des champs » (domain-model.md).
  create(data: CreateArticleData): Promise<ContenuEditorial> {
    return prisma.contenuEditorial.create({ data });
  },

  // Modification des champs scalaires (server-actions-specification.md §3.2) : ne touche
  // jamais `statut` ni `datePublication` (exclus par le type `UpdateArticleData` lui-même,
  // pas seulement par convention) — le verrou DR-005 reste entièrement porté par le
  // trigger `trg_contenu_editorial_dates` déjà en production, jamais court-circuité ici.
  //
  // Verrouillage optimiste (audit Lot 16, correctif Lot 16A) : `dateDerniereModificationAttendue`,
  // si fourni, conditionne l'écriture à ce que la ligne n'ait pas changé depuis cette
  // valeur — le trigger `trg_contenu_editorial_dates` avance `date_derniere_modification`
  // à chaque UPDATE, quelle que soit la colonne réellement modifiée, ce qui en fait un
  // marqueur de version fiable sans colonne ni migration supplémentaire. Paramètre
  // optionnel : absent, le comportement reste strictement celui d'avant ce lot (écriture
  // inconditionnelle sur `id` seul). `updateMany` (plutôt que `update`) est la seule façon
  // d'exprimer ce prédicat composite avec Prisma sans lever d'exception si la ligne a été
  // modifiée entretemps par ailleurs — `resultat.count === 0` détecte alors le conflit,
  // même motif que `InscritNewsletterRepository.reactivate` (lib/db/inscrit-newsletter-
  // repository.ts) pour une situation de concurrence analogue.
  async update(
    id: string,
    data: UpdateArticleData,
    dateDerniereModificationAttendue?: Date
  ): Promise<ContenuEditorial> {
    if (dateDerniereModificationAttendue === undefined) {
      return prisma.contenuEditorial.update({ where: { id }, data });
    }

    // Fenêtre d'une milliseconde plutôt qu'une égalité stricte (correctif A-01) :
    // `date_derniere_modification` est un TIMESTAMPTZ, donc stocké en MICROsecondes par
    // Postgres, alors qu'un `Date` JavaScript ne porte que des MILLIsecondes. La valeur
    // relue par Prisma est donc systématiquement TRONQUÉE (vérifié sur la pile réelle :
    // 23:04:38.852887 en base → 23:04:38.852 côté client), et l'égalité stricte utilisée
    // jusqu'ici ne pouvait plus jamais être satisfaite — toute sauvegarde depuis l'Éditeur
    // échouait en ConcurrentModificationError, y compris sans aucune écriture concurrente.
    //
    // Aucun assouplissement du verrou : la troncature étant exacte (jamais un arrondi),
    // { t : trunc_ms(t) = d } est très précisément { t : d ≤ t < d+1 ms }. Ce prédicat
    // accepte donc exactement les lignes que Prisma désignerait comme identiques à la
    // version chargée par l'Éditeur, ni plus ni moins. Une écriture concurrente, séparée
    // d'au moins un aller-retour réseau, porte un `now()` postérieur de plusieurs
    // millisecondes : elle sort de la fenêtre et déclenche le conflit comme prévu au Lot 16A.
    const resultat = await prisma.contenuEditorial.updateMany({
      where: {
        id,
        dateDerniereModification: {
          gte: dateDerniereModificationAttendue,
          lt: new Date(dateDerniereModificationAttendue.getTime() + 1),
        },
      },
      data,
    });

    if (resultat.count === 0) {
      throw new ConcurrentModificationError();
    }

    return prisma.contenuEditorial.findUniqueOrThrow({ where: { id } });
  },

  // Transition vers Brouillon (dépublication) ou Archivé — écriture simple, toujours
  // libre, sans exigence de champs (décision d'architecture validée : Archiver reste
  // libre y compris depuis Brouillon). `publie` explicitement exclu du type accepté : la
  // transition vers Publié passe exclusivement par `publish`, jamais par cette méthode.
  updateStatut(id: string, statut: Exclude<StatutContenu, "publie">): Promise<ContenuEditorial> {
    return prisma.contenuEditorial.update({ where: { id }, data: { statut } });
  },

  // Transition vers Publié — écriture du statut uniquement. Aucune vérification de
  // complétude ici : la contrainte `chk_publie_champs_requis` (déjà en production) et la
  // validation applicative de complétude relèvent de la Server Action appelante (hors
  // périmètre de ce lot, cf. architecture validée). Le trigger `trg_contenu_editorial_dates`
  // renseigne `date_publication` automatiquement si elle est absente.
  publish(id: string): Promise<ContenuEditorial> {
    return prisma.contenuEditorial.update({ where: { id }, data: { statut: "publie" } });
  },

  // Suppression définitive (server-actions-specification.md §3.6), distincte d'Archiver.
  // `contenu_mot_cle` supprimé en cascade par la base (ON DELETE CASCADE déjà en
  // production) — aucune suppression manuelle des mots-clés nécessaire ici.
  delete(id: string): Promise<ContenuEditorial> {
    return prisma.contenuEditorial.delete({ where: { id } });
  },

  // Synchronisation des mots-clés par diff (jamais une purge totale suivie d'une
  // réinsertion complète) : seuls les mots-clés réellement ajoutés ou retirés déclenchent
  // une écriture, pour ne pas provoquer de recalculs redondants du vecteur de recherche
  // (trg_contenu_mot_cle_recherche) ni de mises à jour superflues de
  // `date_derniere_modification` sur des mots-clés inchangés. Normalisation appliquée
  // avant toute comparaison, jamais seulement avant l'écriture finale.
  async syncMotsCles(id: string, motsCles: string[]): Promise<void> {
    const cible = new Set(motsCles.map(normaliserMotCle).filter((motCle) => motCle.length > 0));

    const existants = await prisma.contenuMotCle.findMany({
      where: { contenuId: id },
      select: { motCle: true },
    });
    const actuels = new Set(existants.map((e) => e.motCle));

    const aSupprimer = [...actuels].filter((motCle) => !cible.has(motCle));
    const aAjouter = [...cible].filter((motCle) => !actuels.has(motCle));

    if (aSupprimer.length === 0 && aAjouter.length === 0) {
      return;
    }

    await prisma.$transaction([
      ...(aSupprimer.length > 0
        ? [prisma.contenuMotCle.deleteMany({ where: { contenuId: id, motCle: { in: aSupprimer } } })]
        : []),
      ...(aAjouter.length > 0
        ? [prisma.contenuMotCle.createMany({ data: aAjouter.map((motCle) => ({ contenuId: id, motCle })) })]
        : []),
    ]);
  },

  // Lecture publique par slug, SANS filtre de statut (server-actions-specification.md
  // §11.3 : « sans filtre de statut au niveau de la requête »). Retourne indifféremment
  // un Brouillon, un Publié ou un Archivé — le branchement DR-001 (masquer un Brouillon,
  // exposer un Archivé hors des surfaces de découverte) est une décision de la couche
  // features/articles, jamais de ce repository.
  findBySlug(slug: string): Promise<ArticleBySlug | null> {
    return prisma.contenuEditorial.findUnique({
      where: { slug },
      include: ARTICLE_DETAIL_INCLUDE,
    });
  },

  // Liste publique paginée des Publiés (server-actions-specification.md §11.2/§11.4/§11.5),
  // filtres combinables. `statut` n'est jamais un paramètre de cette méthode : toujours
  // 'publie', non contournable par l'appelant (construireFiltrePublie). Page hors bornes
  // clampée à la dernière page existante, même garde que findManyAdmin (Lot 1).
  async findManyPublished(params: ListerArticlesPubliesParams): Promise<ArticlesPubliesPagines> {
    const where = construireFiltrePublie(params);

    const total = await prisma.contenuEditorial.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / PUBLIC_PAGE_SIZE));
    const page = Math.min(Math.max(1, params.page), totalPages);

    const items = await prisma.contenuEditorial.findMany({
      where,
      include: ARTICLE_PUBLIC_LIST_INCLUDE,
      orderBy: { datePublication: "desc" },
      skip: (page - 1) * PUBLIC_PAGE_SIZE,
      take: PUBLIC_PAGE_SIZE,
    });

    return { items, total, hasNextPage: page * PUBLIC_PAGE_SIZE < total, page };
  },

  // Derniers Publiés (server-actions-specification.md §11.1, Accueil) — triés par Date de
  // publication décroissante (date pertinente pour un visiteur public, distincte de
  // `date_derniere_modification`, réservée au Dashboard administrateur).
  findLatestPublished(limit: number): Promise<ArticlePublicListItem[]> {
    return prisma.contenuEditorial.findMany({
      where: { statut: "publie" },
      include: ARTICLE_PUBLIC_LIST_INCLUDE,
      orderBy: { datePublication: "desc" },
      take: limit,
    });
  },

  // Derniers Publiés restreints à une liste de types (REPO-4, Homepage : grille
  // "Actualités & terrain" et bandeau "Analyses & enquêtes approfondies", deux sections
  // distinguées par typeContenu plutôt que par catégorie). Distincte de
  // findLatestPublished (sans filtre) : un type de plus dans `types` n'oblige jamais à
  // republier findLatestPublished, ni l'inverse.
  findLatestPublishedByTypes(types: TypeContenu[], limit: number): Promise<ArticlePublicListItem[]> {
    return prisma.contenuEditorial.findMany({
      where: { statut: "publie", typeContenu: { in: types } },
      include: ARTICLE_PUBLIC_LIST_INCLUDE,
      orderBy: { datePublication: "desc" },
      take: limit,
    });
  },

  // Contenus associés à un article (Lot 2C, sitemap.md §Navigation secondaire : « liens de
  // contenus associés sur la page Détail d'un article ») — troisième lecture publique à
  // `limit` de ce repository, même forme que findLatestPublished et
  // findLatestPublishedByTypes ci-dessus. Distincte de findManyPublished, qui ne sait ni
  // exclure un identifiant ni borner à autre chose que PUBLIC_PAGE_SIZE : la réutiliser
  // imposerait de charger 24 lignes — corps intégral compris, ARTICLE_PUBLIC_LIST_INCLUDE
  // ne restreignant aucun champ scalaire — pour n'en afficher que 3.
  //
  // `statut: "publie"` non négociable et jamais paramétrable par l'appelant, comme dans
  // construireFiltrePublie : DR-001 exclut l'Archivé des surfaces de découverte, et les
  // contenus associés en sont une (la page d'un article Archivé peut donc afficher des
  // associés, mais un Archivé n'y apparaît jamais).
  //
  // `OR` dans un unique findMany, jamais deux requêtes réunies : un article correspondant à
  // la fois par rubrique ET par pays produit une seule ligne, la condition SQL étant
  // `... AND (categorie_id = $1 OR zone_id = $2)` — aucune déduplication applicative
  // nécessaire. Les axes nuls sont omis de `OR` plutôt que comparés à NULL (`categorie_id =
  // NULL` ne rapprocherait rien et ferait passer tous les contenus sans rubrique pour des
  // associés). Tri par date de publication décroissante seule — aucun classement de
  // pertinence rubrique-avant-pays, qui exigerait un ORDER BY sur expression (décision
  // produit du Lot 2C, pas un oubli).
  findRelatedPublished(
    params: { excludeId: string; categorieId: string | null; zoneId: string | null },
    limit: number
  ): Promise<ArticlePublicListItem[]> {
    const axes: Prisma.ContenuEditorialWhereInput[] = [];
    if (params.categorieId) axes.push({ categorieId: params.categorieId });
    if (params.zoneId) axes.push({ zoneId: params.zoneId });

    return prisma.contenuEditorial.findMany({
      where: {
        statut: "publie",
        id: { not: params.excludeId },
        OR: axes,
      },
      include: ARTICLE_PUBLIC_LIST_INCLUDE,
      orderBy: { datePublication: "desc" },
      take: limit,
    });
  },

  // Recherche publique (server-actions-specification.md §9.1) : `websearch_to_tsquery`
  // exclusivement — jamais `to_tsquery` brut (tolère nativement guillemets non fermés et
  // opérateurs `&`/`|` isolés sans jamais lever d'erreur de syntaxe côté Postgres,
  // contrairement à `to_tsquery`). `q` absent/vide : condition de recherche full-text
  // simplement omise, filtres seuls appliqués. Décomposée en 3 requêtes fixes
  // (comptage, identifiants triés/paginés, lecture typée par lot) — jamais une requête
  // par ligne de résultat : la troisième requête (`findMany` avec `include`) porte sur
  // l'ensemble de la page en un seul aller, comme `findManyAdmin`/`findManyPublished`.
  // Le tri en mémoire ci-dessous ne filtre rien : il ne fait que restituer l'ordre déjà
  // déterminé par la deuxième requête SQL, que `WHERE id IN (...)` ne garantit pas.
  async search(params: RechercheContenuParams): Promise<ArticlesPubliesPagines> {
    const conditions = Prisma.join(construireConditionsRecherche(params), " AND ");
    // NULLS LAST explicite : par défaut Postgres trie NULLS FIRST en DESC, ce qui
    // remonterait en tête un contenu Publié sans corps (champ non garanti non nul par
    // chk_publie_champs_requis) au lieu de le reléguer en fin de liste.
    const orderBy =
      params.sort === "long"
        ? Prisma.sql`LENGTH(corps) DESC NULLS LAST, date_publication DESC`
        : Prisma.sql`date_publication DESC`;

    const totalRows = await prisma.$queryRaw<{ count: bigint }[]>(
      Prisma.sql`SELECT COUNT(*)::bigint AS count FROM contenu_editorial WHERE ${conditions}`
    );
    const total = Number(totalRows[0]?.count ?? 0);
    const totalPages = Math.max(1, Math.ceil(total / PUBLIC_PAGE_SIZE));
    const page = Math.min(Math.max(1, params.page), totalPages);

    const idRows = await prisma.$queryRaw<{ id: string }[]>(
      Prisma.sql`SELECT id FROM contenu_editorial WHERE ${conditions} ORDER BY ${orderBy}
                 LIMIT ${PUBLIC_PAGE_SIZE} OFFSET ${(page - 1) * PUBLIC_PAGE_SIZE}`
    );
    const ids = idRows.map((row) => row.id);

    const items =
      ids.length > 0
        ? await prisma.contenuEditorial.findMany({
            where: { id: { in: ids } },
            include: ARTICLE_PUBLIC_LIST_INCLUDE,
          })
        : [];
    const rang = new Map(ids.map((id, index) => [id, index]));
    items.sort((a, b) => (rang.get(a.id) ?? 0) - (rang.get(b.id) ?? 0));

    return { items, total, hasNextPage: page * PUBLIC_PAGE_SIZE < total, page };
  },

  // Persistance des métadonnées de l'image principale après un envoi réussi vers le
  // stockage objet (module média, Lot 6/7 — orchestration Article + Média). Méthode
  // dédiée et étroite, distincte de `update()` : les 4 champs sont ici **obligatoires**
  // (jamais nullifiables par cette méthode, contrairement à `UpdateArticleData`, non
  // modifié), cohérent avec le fait qu'un envoi réussi produit toujours les 4 valeurs
  // ensemble. `imageLargeur`/`imageHauteur` restent, comme avant, hors de portée de
  // `update()` — cette méthode est le seul point d'écriture de ces deux colonnes.
  updateMainImage(id: string, data: MainImageData): Promise<ContenuEditorial> {
    return prisma.contenuEditorial.update({
      where: { id },
      data: {
        imagePrincipaleUrl: data.imagePrincipaleUrl,
        imageAltText: data.imageAltText,
        imageLargeur: data.imageLargeur,
        imageHauteur: data.imageHauteur,
      },
    });
  },
};
