# Prisma Schema Specification — MVP

**Statut** : spécification exhaustive du futur `schema.prisma`, dérivée de `database-schema.md` (source de vérité du schéma relationnel), `technical-architecture.md` et `server-actions-specification.md`, tous gelés. Ce document ne contient aucun code `schema.prisma` — uniquement la description de chaque modèle, champ, type, relation et contrainte, et l'identification précise de ce que Prisma ne peut pas exprimer nativement.

**Correspondance de nommage** : `database-schema.md` utilise des noms de table/colonne en `snake_case` (convention SQL). Ce document suppose la convention Prisma standard — modèles en `PascalCase`, champs en `camelCase`, chacun relié à son nom SQL réel via `@map`/`@@map` — sans que cela ne modifie en rien la structure déjà actée. Aucun renommage de colonne ou de table n'est proposé.

---

## 1. Inventaire complet des modèles Prisma

Sept modèles, correspondant exactement aux sept tables de `database-schema.md` §2 :

| Modèle Prisma | Table SQL (`@@map`) |
|---|---|
| `Categorie` | `categorie` |
| `ZoneGeographique` | `zone_geographique` |
| `Administrateur` | `administrateur` |
| `SessionAdministrateur` | `session_administrateur` |
| `ContenuEditorial` | `contenu_editorial` |
| `ContenuMotCle` | `contenu_mot_cle` |
| `InscritNewsletter` | `inscrit_newsletter` |

Aucun modèle supplémentaire, aucun modèle manquant — correspondance 1:1 avec `database-schema.md` §1.

---

## 2 & 3. Champs, types Prisma et correspondance SQL

### 2.1 `Categorie`

| Champ Prisma | Type Prisma | Type SQL réel | Nullable | Défaut |
|---|---|---|---|---|
| `id` | `String` (`@db.Uuid`) | `UUID` | non | `dbgenerated("gen_random_uuid()")` |
| `nom` | `String` | `TEXT` | non | — |
| `slug` | `String` | `TEXT` | non | — |
| `descriptionCourte` | `String?` | `TEXT` | oui | — |
| `createdAt` | `DateTime` (`@db.Timestamptz`) | `TIMESTAMPTZ` | non | `now()` |

### 2.2 `ZoneGeographique`

Identique à `Categorie` (§2.1), champ pour champ — symétrie déjà actée par `domain-model.md`.

### 2.3 `Administrateur`

| Champ Prisma | Type Prisma | Type SQL réel | Nullable | Défaut |
|---|---|---|---|---|
| `id` | `String` (`@db.Uuid`) | `UUID` | non | `dbgenerated("gen_random_uuid()")` |
| `identifiant` | `String` | `TEXT` | non | — |
| `motDePasseHash` | `String` | `TEXT` | non | — |
| `createdAt` | `DateTime` (`@db.Timestamptz`) | `TIMESTAMPTZ` | non | `now()` |

### 2.4 `SessionAdministrateur`

| Champ Prisma | Type Prisma | Type SQL réel | Nullable | Défaut |
|---|---|---|---|---|
| `id` | `String` (`@db.Uuid`) | `UUID` | non | `dbgenerated("gen_random_uuid()")` |
| `administrateurId` | `String` (`@db.Uuid`) | `UUID` | non | — |
| `jetonHash` | `String` | `TEXT` | non | — |
| `derniereActiviteAt` | `DateTime` (`@db.Timestamptz`) | `TIMESTAMPTZ` | non | `now()` |
| `createdAt` | `DateTime` (`@db.Timestamptz`) | `TIMESTAMPTZ` | non | `now()` |

### 2.5 `ContenuEditorial`

| Champ Prisma | Type Prisma | Type SQL réel | Nullable | Défaut |
|---|---|---|---|---|
| `id` | `String` (`@db.Uuid`) | `UUID` | non | `dbgenerated("gen_random_uuid()")` |
| `slug` | `String` | `TEXT` | non | — |
| `titre` | `String?` | `TEXT` | oui | — |
| `chapo` | `String?` | `TEXT` | oui | — |
| `corps` | `String?` | `TEXT` | oui | — |
| `typeContenu` | `TypeContenu?` | `type_contenu` (enum) | oui | — |
| `categorieId` | `String?` (`@db.Uuid`) | `UUID` | oui | — |
| `zoneId` | `String?` (`@db.Uuid`) | `UUID` | oui | — |
| `imagePrincipaleUrl` | `String?` | `TEXT` | oui | — |
| `imageAltText` | `String?` | `TEXT` | oui | — |
| `imageLargeur` | `Int?` | `INTEGER` | oui | — |
| `imageHauteur` | `Int?` | `INTEGER` | oui | — |
| `auteur` | `String?` | `TEXT` | oui | — |
| `sources` | `String?` | `TEXT` | oui | — |
| `statut` | `StatutContenu` | `statut_contenu` (enum) | non | `brouillon` |
| `datePublication` | `DateTime?` (`@db.Timestamptz`) | `TIMESTAMPTZ` | oui | — |
| `dateDerniereModification` | `DateTime` (`@db.Timestamptz`) | `TIMESTAMPTZ` | non | `now()` |
| `createdAt` | `DateTime` (`@db.Timestamptz`) | `TIMESTAMPTZ` | non | `now()` |
| `rechercheVecteur` | `Unsupported("tsvector")?` | `TSVECTOR` | oui | — (cf. §11) |

### 2.6 `ContenuMotCle`

| Champ Prisma | Type Prisma | Type SQL réel | Nullable | Défaut |
|---|---|---|---|---|
| `contenuId` | `String` (`@db.Uuid`) | `UUID` | non | — |
| `motCle` | `String` | `TEXT` | non | — |

Aucun champ `id` propre — clé primaire composite (§6).

### 2.7 `InscritNewsletter`

| Champ Prisma | Type Prisma | Type SQL réel | Nullable | Défaut |
|---|---|---|---|---|
| `id` | `String` (`@db.Uuid`) | `UUID` | non | `dbgenerated("gen_random_uuid()")` |
| `email` | `String` | `TEXT` | non | — |
| `dateInscription` | `DateTime` (`@db.Timestamptz`) | `TIMESTAMPTZ` | non | `now()` |
| `statut` | `String` | `TEXT` | non | `inscrit` |
| `jetonDesinscription` | `String?` | `TEXT` | oui | — |
| `desinscritAt` | `DateTime?` (`@db.Timestamptz`) | `TIMESTAMPTZ` | oui | — |

**Point d'attention** : `statut` reste un `String` Prisma, **pas un enum**, car la colonne SQL sous-jacente est un `TEXT` contraint par `CHECK`, non un type `ENUM` Postgres natif (contrairement à `type_contenu`/`statut_contenu`). Prisma ne peut représenter un enum que sur un véritable type Postgres `ENUM` ; un `CHECK` sur `TEXT` reste un `String` non typé côté client, la contrainte n'existant qu'en base (cf. §10 et §11).

---

## 4 & 5. Relations Prisma et cardinalités

| Relation | Cardinalité | Modélisation Prisma |
|---|---|---|
| `Categorie` → `ContenuEditorial` | 1 → 0..N | Relation inverse (`ContenuEditorial[]` sur `Categorie`), clé étrangère `categorieId` sur `ContenuEditorial` |
| `ZoneGeographique` → `ContenuEditorial` | 1 → 0..N | Symétrique |
| `ContenuEditorial` → `ContenuMotCle` | 1 → 0..N | Clé étrangère `contenuId` sur `ContenuMotCle`, `onDelete: Cascade` |
| `Administrateur` → `SessionAdministrateur` | 1 → 0..N | Clé étrangère `administrateurId`, `onDelete: Cascade` |
| `InscritNewsletter` | Aucune | Agrégat isolé (`domain-model.md`) — aucune relation Prisma |

Toutes les cardinalités correspondent exactement à `database-schema.md` §2 (diagramme relationnel textuel), sans écart.

**Stratégie de suppression (`onDelete`)** :

| Relation | Comportement | Justification |
|---|---|---|
| `ContenuEditorial.categorieId` → `Categorie` | `Restrict` | « Une Catégorie... associée à au moins un Contenu éditorial ne peut jamais être supprimée » (`domain-model.md`) |
| `ContenuEditorial.zoneId` → `ZoneGeographique` | `Restrict` | Symétrique |
| `ContenuMotCle.contenuId` → `ContenuEditorial` | `Cascade` | Aucune existence indépendante du mot-clé |
| `SessionAdministrateur.administrateurId` → `Administrateur` | `Cascade` | Aucune existence indépendante de la session |

---

## 6. Contraintes d'unicité

| Modèle | Champ(s) | Mécanisme Prisma |
|---|---|---|
| `Categorie` | `nom`, `slug` | Deux `@unique` distincts (pas une unicité composite) |
| `ZoneGeographique` | `nom`, `slug` | Idem |
| `Administrateur` | `identifiant` | `@unique` |
| `SessionAdministrateur` | `jetonHash` | `@unique` |
| `ContenuEditorial` | `slug` | `@unique` |
| `ContenuMotCle` | `(contenuId, motCle)` | `@@id([contenuId, motCle])` — clé primaire composite, nativement supportée par Prisma, aucune incompatibilité |
| `InscritNewsletter` | `email`, `jetonDesinscription` | Deux `@unique` distincts |

Aucune contrainte d'unicité composite requise au-delà de la clé primaire de `ContenuMotCle`.

---

## 7. Index Prisma

| Modèle | Index | Type | Support Prisma |
|---|---|---|---|
| `ContenuEditorial` | `(statut, datePublication DESC)` | B-tree composite | Nativement supporté (`@@index([statut, datePublication(sort: Desc)])`) |
| `ContenuEditorial` | `categorieId` | B-tree | Nativement supporté (créé implicitement par la relation, ou explicite) |
| `ContenuEditorial` | `zoneId` | B-tree | Nativement supporté |
| `ContenuEditorial` | `rechercheVecteur` | **GIN** | **À vérifier** — cf. §11 |
| `ContenuMotCle` | `motCle` | B-tree | Nativement supporté |
| `SessionAdministrateur` | `administrateurId` | B-tree | Nativement supporté (implicite via la relation) |

Aucun index composite supplémentaire n'est ajouté par rapport à `database-schema.md` §7 — aucune optimisation nouvelle proposée.

**Note explicite — index `type_contenu` non repris** : `technical-architecture.md` §7 listait historiquement un `INDEX(type_contenu)` sur `contenu_editorial`. Cet index a été volontairement écarté par `database-schema.md` §7 (« Non retenu, à dessein » — faible sélectivité sur 5 valeurs fixes, déjà couvert en filtre résiduel par l'index composite `(statut, date_publication)`). `database-schema.md` étant la source de vérité du schéma relationnel pour ce document (cf. §Statut en tête de ce fichier), c'est cette décision finale qui est reprise ici : aucun index sur `typeContenu` n'apparaîtra dans `schema.prisma`. La liste ci-dessus ne présente donc pas d'écart avec `database-schema.md`, mais un écart assumé et documenté avec la version antérieure de `technical-architecture.md`.

---

## 8. Enum Prisma

| Enum Prisma | Valeurs | Type Postgres source | Modèle(s) utilisateur |
|---|---|---|---|
| `TypeContenu` | `article`, `analyse`, `enquete`, `interview`, `dossier_thematique` | `type_contenu` (`CREATE TYPE`) | `ContenuEditorial.typeContenu` |
| `StatutContenu` | `brouillon`, `publie`, `archive` | `statut_contenu` (`CREATE TYPE`) | `ContenuEditorial.statut` |

Deux enums Prisma seulement — pas de troisième enum pour `InscritNewsletter.statut` (cf. §2.7 et §12 : la colonne SQL n'est pas un type `ENUM`, donc aucun enum Prisma correspondant ne peut être généré sans modifier `database-schema.md`, ce qui est hors périmètre).

---

## 9. Champs calculés ou non gérés par Prisma

| Champ | Nature | Gestion |
|---|---|---|
| `ContenuEditorial.rechercheVecteur` | Maintenu par trigger PL/pgSQL (`database-schema.md` §6) | Jamais lu ni écrit par le code applicatif via Prisma — champ `Unsupported`, exclu des écritures Prisma Client par construction |
| `ContenuEditorial.datePublication` | Auto-renseigné et verrouillé par trigger (DR-005) | Colonne standard Prisma (`DateTime?`), mais la discipline d'écriture (ne jamais la fournir manuellement après son premier renseignement) est une règle **applicative**, non imposée par le typage Prisma — le trigger reste le seul rempart réel (`server-actions-specification.md` §3.2/§3.3) |
| `ContenuEditorial.dateDerniereModification` | Mise à jour systématique par trigger | Colonne standard Prisma, jamais écrite manuellement par les Server Actions (cf. `server-actions-specification.md`) |
| `ContenuEditorial.imageLargeur` / `imageHauteur` | Dérivées automatiquement du fichier image importé (module `media`) | Colonnes standard Prisma (`Int?`), mais **jamais exposées comme champs de saisie** dans les Server Actions (`server-actions-specification.md`, correction déjà actée) |

---

## 10. Colonnes/éléments PostgreSQL nécessitant des migrations SQL manuelles

Aucun des éléments suivants n'est exprimable dans le langage déclaratif de `schema.prisma`. Workflow requis : `prisma migrate dev --create-only`, puis ajout manuel de ces blocs dans le fichier `migration.sql` généré, avant application.

| Élément | Raison de l'incompatibilité |
|---|---|
| `fn_administrateur_unique` / `trg_administrateur_unique` | Prisma ne modélise aucune fonction ni aucun trigger PL/pgSQL |
| `fn_contenu_editorial_dates` / `trg_contenu_editorial_dates` | Idem |
| `fn_maj_recherche_vecteur`, `fn_contenu_editorial_recherche_trg`/`trg_contenu_editorial_recherche`, `fn_contenu_mot_cle_recherche_trg`/`trg_contenu_mot_cle_recherche` | Idem |
| `CONSTRAINT chk_publie_champs_requis` (`ContenuEditorial`) | Prisma ne modélise aucune contrainte `CHECK`, quelle que soit sa complexité |
| `CHECK (statut IN ('inscrit', 'desinscrit'))` (`InscritNewsletter`) | Idem — même limitation qu'au-dessus, pour une contrainte plus simple |
| Index GIN sur `rechercheVecteur` | Cf. §11 — à créer manuellement par prudence, la combinaison `Unsupported` + index de type non-B-tree n'étant pas garantie par le générateur Prisma |

---

## 11. Champs `Unsupported()` nécessaires

**Un seul champ** requiert `Unsupported()` : `ContenuEditorial.rechercheVecteur`, typé `Unsupported("tsvector")`. C'est le seul type de colonne du schéma sans correspondance native dans le système de types Prisma (`TSVECTOR` n'a pas d'équivalent scalaire Prisma, contrairement à `UUID`, `TEXT`, `TIMESTAMPTZ`, `INTEGER`, qui sont tous nativement mappés).

**Incompatibilité Prisma/PostgreSQL à signaler explicitement** : un champ `Unsupported` est exclu par construction des opérations de lecture/écriture typées de Prisma Client (ni `select`, ni `create`, ni `update` ne peuvent le manipuler directement) — cohérent ici puisque ce champ n'est jamais censé être touché par l'application (maintenu uniquement par trigger), mais cela signifie aussi que **l'index GIN associé à ce champ ne peut pas être déclaré avec certitude via la syntaxe `@@index` déclarative** de Prisma sur un champ `Unsupported` (le support de `@@index(..., type: Gin)` dépend de la version de Prisma effectivement installée, et son interaction avec un champ `Unsupported` n'est pas garantie). **Recommandation** : créer cet index exclusivement via la migration SQL manuelle (§10), jamais par une déclaration `@@index` dans `schema.prisma`, pour éliminer ce risque.

---

## 12. Correspondance exacte avec `database-schema.md`

| Vérification | Résultat |
|---|---|
| 7 tables ↔ 7 modèles | Conforme (§1) |
| Chaque colonne de chaque table a un champ Prisma correspondant | Conforme (§2) — vérifié table par table contre `database-schema.md` §4.1 à §4.7 |
| Chaque type SQL a une correspondance Prisma explicite ou un `Unsupported` déclaré | Conforme (§3, §11) |
| Chaque cardinalité et stratégie `ON DELETE` de `database-schema.md` §2 et §5 | Conforme (§4, §5) |
| Chaque contrainte `UNIQUE`/clé primaire de `database-schema.md` §4-§5 | Conforme (§6) |
| Chaque index de `database-schema.md` §7 | Conforme (§7), avec réserve explicite sur l'index GIN (§11) |
| Chaque trigger/fonction/`CHECK` de `database-schema.md` §6 | Repris intégralement en §10, aucun omis |
| Aucune colonne, contrainte ou table de `database-schema.md` absente de ce document | Vérifié — aucun écart détecté |
| Aucun élément ajouté ici sans existence dans `database-schema.md` | Vérifié — aucune fonctionnalité, colonne ou règle nouvelle introduite |

---

## 13. Vérification de couverture finale

- **Modèles** : 7/7 tables couvertes.
- **Champs** : couverture intégrale, aucun champ orphelin de part et d'autre.
- **Enums** : 2/2 enums Postgres réels couverts ; 1 colonne `TEXT`+`CHECK` correctement **non** modélisée en enum Prisma (fidélité à `database-schema.md`, pas une omission).
- **Contraintes et triggers** : 3 groupes de triggers/fonctions + 2 contraintes `CHECK` intégralement recensés comme nécessitant une migration SQL manuelle (§10) — aucun oublié.
- **Champs `Unsupported`** : 1/1 identifié (`rechercheVecteur`).
- **Server Actions / contrats API** : chaque champ requis par `server-actions-specification.md` (y compris `slug` modifiable et la distinction `imageLargeur`/`imageHauteur` non saisis manuellement, corrections déjà actées) trouve sa colonne correspondante ici — aucun champ manquant pour les opérations déjà spécifiées.

**Conclusion de couverture** : ce document couvre exhaustivement `database-schema.md` sans lacune ni ajout, et signale explicitement les six points de friction réels entre Prisma et PostgreSQL (triggers, fonctions, deux `CHECK`, un `Unsupported`, un index GIN à traiter hors schéma déclaratif).

---

## 14. Cohérence avec Supabase PostgreSQL

Aucun document gelé (`technical-architecture.md` §8) ne mentionne Supabase — l'arbitrage technique y recommandait « PostgreSQL » de façon générique, avec hébergement Vercel et stockage objet compatible S3 comme points séparés non tranchés. L'introduction de Supabase par la présente mission est donc une précision d'infrastructure nouvelle par rapport aux documents gelés, non encore répercutée dans `technical-architecture.md` — signalée ici à titre de traçabilité, sans qu'aucun document existant n'ait été modifié.

Vérifications effectuées, à ce niveau strictement schéma/Prisma (aucun détail d'infrastructure plus large) :

| Point | Constat |
|---|---|
| Connexion directe vs poolée | Les migrations Prisma (créant les fonctions/triggers/contraintes de §10) nécessitent une connexion directe à la base, distincte de la connexion poolée (PgBouncer/Supavisor) utilisée par Supabase pour le trafic applicatif — configuration standard à deux URLs (directe pour les migrations, poolée pour l'exécution), sans incidence sur le contenu de ce document |
| Compatibilité des instructions préparées | Le mode transactionnel du pooler Supabase a des limitations connues avec les requêtes préparées de Prisma — point de configuration de connexion à traiter à l'implémentation, sans impact sur le schéma décrit ici |
| `gen_random_uuid()` | Disponible nativement à partir de PostgreSQL 13 — aucune extension à activer, y compris sur Supabase (identique à l'explication déjà actée dans `database-schema.md` §9 ; ce document ne l'attribue pas à l'extension `pgcrypto`, pour ne pas introduire une deuxième explication concurrente d'un même fait déjà tranché) |
| Row Level Security (RLS) | **Prisma reste l'unique voie d'accès applicatif aux données** (Server Components/Server Actions, jamais le SDK client Supabase). Cette garantie porte sur l'application, **pas** sur la base : Supabase expose par défaut l'intégralité du schéma `public` via une API PostgREST/Data API auto-générée, indépendante du code applicatif et active tant qu'elle n'est pas neutralisée. RLS n'est donc **pas** une mesure optionnelle de défense en profondeur ici — sans elle (ou sans neutralisation équivalente de cette API), les colonnes `administrateur.mot_de_passe_hash`, `session_administrateur.jeton_hash`, les lignes `contenu_editorial` au statut `brouillon` et les adresses de `inscrit_newsletter` seraient potentiellement accessibles en dehors de Prisma, en contradiction avec l'invariant « Brouillon jamais visible hors administration ». **Avant toute mise en production, l'une des deux mesures suivantes est requise** (choix non tranché par ce document, à arbitrer à l'implémentation) : (a) activer RLS sur les 7 tables avec des politiques n'autorisant aucun accès via l'API Data (l'application continuant d'accéder aux données via la connexion directe/poolée Prisma, hors RLS) ; ou (b) neutraliser explicitement l'API PostgREST/Data API du projet Supabase. Ce point ne change aucun modèle de ce document — il conditionne uniquement la configuration du projet Supabase |
| Schémas réservés | Les 7 tables vivent dans le schéma `public`, sans collision avec les schémas réservés de Supabase (`auth`, `storage`, `realtime`, `extensions`) |
| Stockage objet | Supabase Storage (compatible S3) satisferait l'arbitrage encore ouvert de `technical-architecture.md` §8 point 3 — simple constat de cohérence, non un changement de décision |

**Aucune incompatibilité bloquante pour la génération de `schema.prisma`** — les points ci-dessus, à l'exception de RLS, sont des paramètres de configuration de connexion, pas des obstacles à la modélisation. Le point RLS/PostgREST ne bloque pas davantage l'écriture de `schema.prisma` (il ne modifie aucun modèle), mais reste, à la différence des autres points de cette section, une **condition à satisfaire avant toute mise en production** et non un simple paramètre de configuration différable sans risque.

---

Aucun document existant n'a été modifié pour produire cette spécification. Aucun code `schema.prisma` n'y figure.
