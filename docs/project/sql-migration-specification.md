# SQL Migration Specification — MVP

**Statut** : spécification exhaustive du contenu attendu de la **première migration** Prisma du projet (fichier unique généré par `prisma migrate dev --create-only`, puis complété manuellement avant application), dérivée de `database-schema.md` (source de vérité du schéma relationnel et des blocs SQL, §6 à §9), `prisma-schema-specification.md` (§10-§11), `prisma-config-specification.md` (§4) et `frontend/prisma/schema.prisma`, tous gelés. Ce document ne contient **aucun SQL exécutable complet** — uniquement la description de chaque objet, de son ordre, de ses dépendances, et l'identification de ce qui est généré par Prisma par opposition à ce qui doit être ajouté à la main. Le SQL littéral de référence reste celui déjà figé dans `database-schema.md` §6 — il n'est ni reproduit ni modifié ici.

---

## 1. Cadre général de la migration

- **Une seule migration** couvre l'intégralité du schéma initial (aucune table, enum ou contrainte du projet n'existe encore) — pas de découpage en plusieurs migrations successives pour ce premier jet.
- **Workflow retenu** (déjà acté par `database-schema.md` §8 et `prisma-config-specification.md` §4) : `prisma migrate dev --create-only` génère un fichier `migration.sql` à partir du diff de `schema.prisma`, ce fichier est ensuite **édité manuellement** pour y insérer les blocs non exprimables par Prisma, puis appliqué (`prisma migrate dev` en local ou `prisma migrate deploy` en CI/production) contre `DIRECT_URL`.
- Le fichier final contient donc **deux strates** dans un ordre strict : la strate générée par Prisma (types, tables, colonnes, clés, contraintes exprimables, index déclaratifs), puis la strate ajoutée à la main (fonctions, triggers, contraintes `CHECK`, index GIN) — jamais l'inverse, car la strate manuelle référence des tables/colonnes qui doivent déjà exister.

---

## 2. Ordre d'exécution complet

Reprise et détaillée de `database-schema.md` §9, appliquée à un fichier de migration unique :

| # | Bloc | Origine | Contenu |
|---|---|---|---|
| 1 | Prérequis PostgreSQL | Aucun ajout — vérification seulement | `gen_random_uuid()` disponible nativement à partir de PostgreSQL 13 (cf. §3) ; aucune instruction `CREATE EXTENSION` dans la migration |
| 2 | Types énumérés | Prisma | `type_contenu`, `statut_contenu` |
| 3 | Tables sans dépendance | Prisma | `categorie`, `zone_geographique`, `administrateur`, `inscrit_newsletter` (ordre indifférent entre elles) |
| 4 | Table dépendante de niveau 1 | Prisma | `session_administrateur` (FK → `administrateur`) |
| 5 | Table centrale | Prisma | `contenu_editorial` (FK → `categorie`, `zone_geographique`) — colonne `recherche_vecteur` créée (type `tsvector`, via le champ `Unsupported` du schéma), mais **sans** son index GIN ni sa contrainte `chk_publie_champs_requis` à ce stade |
| 6 | Table dépendante de niveau 2 | Prisma | `contenu_mot_cle` (FK → `contenu_editorial`) |
| 7 | Fonctions et triggers | Manuel | Dans l'ordre interne détaillé en §5-§6 (une fonction doit précéder tout trigger ou toute autre fonction qui l'invoque) |
| 8 | Contrainte `CHECK` | Manuel | `chk_publie_champs_requis` sur `contenu_editorial` — ajoutée après l'étape 7, une fois toutes les colonnes concernées et le trigger de dates en place, pour isoler tout échec de contrainte lors d'un futur diagnostic de migration (raison déjà actée dans `database-schema.md` §9, non une dépendance technique stricte) |
| 9 | Contrainte `CHECK` (inscrit_newsletter) | Manuel | `CHECK (statut IN ('inscrit', 'desinscrit'))` sur `inscrit_newsletter.statut` — aucune dépendance à un autre objet de la migration, peut en théorie être ajoutée dès la création de la table, mais regroupée ici avec l'autre `CHECK` par convention de lisibilité du fichier |
| 10 | Index de performance | Prisma (3) + Manuel (1) | B-tree déclaratifs générés par Prisma (`@@index`) + index GIN manuel sur `recherche_vecteur` (cf. §7) — en dernier, une fois les tables créées, sans incidence sur l'ordre puisqu'aucun index n'est requis par un autre objet de la migration |

---

## 3. Extensions requises

**Aucune.** `gen_random_uuid()`, utilisé comme valeur par défaut de toutes les clés primaires `UUID` (via `@default(dbgenerated("gen_random_uuid()"))` dans `schema.prisma`), est disponible nativement dans PostgreSQL à partir de la version 13 — y compris sur une instance Supabase — sans activation de l'extension `pgcrypto` ni d'aucune autre extension. Ce point est déjà tranché par `database-schema.md` §9 et confirmé pour Supabase par `prisma-schema-specification.md` §14 ; la migration ne doit donc contenir aucune instruction `CREATE EXTENSION`.

---

## 4. Fonctions PL/pgSQL — inventaire et rôle

Cinq fonctions, toutes issues intégralement de `database-schema.md` §6 (aucune modification, aucun ajout de logique) :

| # | Fonction | Déclenchée par | Rôle |
|---|---|---|---|
| 1 | `fn_administrateur_unique` | `trg_administrateur_unique` | Empêche toute insertion dans `administrateur` si une ligne y existe déjà (invariant « un seul Compte Administrateur ») |
| 2 | `fn_contenu_editorial_dates` | `trg_contenu_editorial_dates` | Interdit la modification de `date_publication` une fois renseignée (DR-005) ; auto-renseigne `date_publication` au passage à `statut = 'publie'` ; force la mise à jour de `date_derniere_modification` à chaque `UPDATE` |
| 3 | `fn_maj_recherche_vecteur` | Non déclenchée directement — appelée par les deux fonctions-triggers ci-dessous (`PERFORM`) | Recalcule intégralement `recherche_vecteur` d'un `contenu_editorial` donné (titre + mots-clés en poids `A`, chapô en poids `B`, corps en poids `C`), à partir de son `id` passé en paramètre |
| 4 | `fn_contenu_editorial_recherche_trg` | `trg_contenu_editorial_recherche` | Fonction-trigger : invoque `fn_maj_recherche_vecteur(NEW.id)` après insertion ou modification de `titre`/`chapo`/`corps` |
| 5 | `fn_contenu_mot_cle_recherche_trg` | `trg_contenu_mot_cle_recherche` | Fonction-trigger : invoque `fn_maj_recherche_vecteur` sur l'`id` du contenu concerné (`NEW` ou `OLD` selon insertion/suppression d'un mot-clé) |

**Dépendance interne critique** : `fn_contenu_editorial_recherche_trg` et `fn_contenu_mot_cle_recherche_trg` référencent `fn_maj_recherche_vecteur` dans leur corps — cette dernière doit donc être créée **avant** les deux fonctions-triggers qui l'invoquent, elle-même sans dépendre d'aucune autre fonction de la migration.

---

## 5. Triggers — inventaire et rattachement

Quatre triggers, chacun rattaché à sa fonction (§4) :

| # | Trigger | Table | Moment / Événement | Fonction invoquée |
|---|---|---|---|---|
| 1 | `trg_administrateur_unique` | `administrateur` | `BEFORE INSERT` | `fn_administrateur_unique` |
| 2 | `trg_contenu_editorial_dates` | `contenu_editorial` | `BEFORE INSERT OR UPDATE` | `fn_contenu_editorial_dates` |
| 3 | `trg_contenu_editorial_recherche` | `contenu_editorial` | `AFTER INSERT OR UPDATE OF titre, chapo, corps` | `fn_contenu_editorial_recherche_trg` |
| 4 | `trg_contenu_mot_cle_recherche` | `contenu_mot_cle` | `AFTER INSERT OR DELETE` | `fn_contenu_mot_cle_recherche_trg` |

**Dépendance stricte fonction → trigger** : chaque trigger ne peut être créé qu'après l'existence de la fonction qu'il invoque (`CREATE TRIGGER` référence la fonction par son nom) — donc, pour les triggers 3 et 4, l'ordre réel est : `fn_maj_recherche_vecteur` → `fn_contenu_editorial_recherche_trg`/`fn_contenu_mot_cle_recherche_trg` → `trg_contenu_editorial_recherche`/`trg_contenu_mot_cle_recherche`.

**Dépendance aux tables** : les triggers 2, 3 portent sur `contenu_editorial` (bloc Prisma #5) ; le trigger 4 porte sur `contenu_mot_cle` (bloc Prisma #6) ; `fn_maj_recherche_vecteur` interroge les deux tables (`contenu_editorial` en écriture, `contenu_mot_cle` en lecture via `string_agg`) — les deux tables doivent donc déjà exister avant la création de cette fonction, ce qui est garanti par l'ordre du §2 (blocs 5 et 6 précèdent le bloc 7).

---

## 6. Contraintes CHECK

| # | Contrainte | Table | Condition | Dépendance |
|---|---|---|---|---|
| 1 | `chk_publie_champs_requis` | `contenu_editorial` | `statut <> 'publie'` OU (`titre`, `type_contenu`, `categorie_id`, `zone_id`, `image_principale_url`, `image_alt_text`, `date_publication` tous non nuls) | Aucune dépendance fonctionnelle aux triggers/fonctions, mais positionnée après ceux-ci par convention de diagnostic (§2, bloc 8) |
| 2 | *(sans nom explicite dans `database-schema.md`)* — à nommer par convention lors de la rédaction de la migration | `inscrit_newsletter` | `statut IN ('inscrit', 'desinscrit')` | Aucune dépendance — peut être ajoutée dès la création de la table |

Aucune des deux n'est exprimable dans le langage déclaratif de `schema.prisma` (Prisma ne modélise aucune contrainte `CHECK`, quelle que soit sa complexité) — confirmé par `prisma-schema-specification.md` §10.

---

## 7. Index GIN

**Un seul index GIN** dans toute la migration : sur `contenu_editorial.recherche_vecteur`, pour la recherche full-text (`technical-architecture.md` §4.6, `database-schema.md` §7).

- **Pourquoi manuel et non déclaratif** : `recherche_vecteur` est un champ `Unsupported("tsvector")` dans `schema.prisma` (aucun type Prisma natif pour `TSVECTOR`). Le support de `@@index(..., type: Gin)` sur un champ `Unsupported` dépend de la version de Prisma effectivement installée et n'est pas garanti de façon fiable — décision déjà actée dans `prisma-schema-specification.md` §11 : cet index est créé **exclusivement** par SQL manuel, jamais par une déclaration `@@index` dans `schema.prisma`.
- **Dépendance** : la colonne `recherche_vecteur` doit exister (bloc Prisma #5, §2) avant la création de l'index — aucune dépendance aux triggers/fonctions de recherche (l'index peut techniquement être créé avant ou après eux ; il est positionné en dernier dans la migration par convention, cf. §2 bloc 10).

---

## 8. Dépendances entre objets — synthèse graphique

```text
[Prisma] type_contenu, statut_contenu (enums)
        │
        ▼
[Prisma] categorie, zone_geographique, administrateur, inscrit_newsletter
        │
        ▼
[Prisma] session_administrateur ───────────(FK → administrateur)
        │
        ▼
[Prisma] contenu_editorial ─────────────────(FK → categorie, zone_geographique)
        │                                    (colonne recherche_vecteur créée, vide)
        ▼
[Prisma] contenu_mot_cle ────────────────────(FK → contenu_editorial)
        │
        ▼
[Manuel] fn_administrateur_unique ──────────▶ trg_administrateur_unique (sur administrateur)
[Manuel] fn_contenu_editorial_dates ─────────▶ trg_contenu_editorial_dates (sur contenu_editorial)
[Manuel] fn_maj_recherche_vecteur
        │
        ├──▶ fn_contenu_editorial_recherche_trg ──▶ trg_contenu_editorial_recherche (sur contenu_editorial)
        └──▶ fn_contenu_mot_cle_recherche_trg ────▶ trg_contenu_mot_cle_recherche (sur contenu_mot_cle)
        │
        ▼
[Manuel] chk_publie_champs_requis (sur contenu_editorial)
[Manuel] CHECK statut (sur inscrit_newsletter) — indépendante, regroupée ici par convention
        │
        ▼
[Prisma] index B-tree déclaratifs + [Manuel] index GIN (recherche_vecteur)
```

Aucune dépendance circulaire, aucun objet manuel ne référence un objet qui n'existe pas encore au moment de son exécution dans le fichier.

---

## 9. Ce qui est généré automatiquement par Prisma

À partir du diff de `frontend/prisma/schema.prisma` (`prisma migrate dev --create-only`) :

- Les deux types énumérés (`type_contenu`, `statut_contenu`).
- Les sept tables, toutes leurs colonnes scalaires, types SQL et valeurs par défaut (`gen_random_uuid()`, `now()`, `'brouillon'`, `'inscrit'`).
- La colonne `recherche_vecteur` elle-même (déclarée `Unsupported("tsvector")` — Prisma crée la colonne mais ne peut ni la lire ni l'écrire via le Client).
- Toutes les clés primaires, y compris la clé composite de `contenu_mot_cle`.
- Toutes les contraintes `UNIQUE` (`categorie.nom`/`slug`, `zone_geographique.nom`/`slug`, `contenu_editorial.slug`, `administrateur.identifiant`, `session_administrateur.jetonHash`, `inscrit_newsletter.email`/`jetonDesinscription`).
- Toutes les clés étrangères avec leur stratégie `ON DELETE` (`Restrict` sur `categorieId`/`zoneId`, `Cascade` sur `contenuId`/`administrateurId`).
- Les index B-tree déclaratifs explicitement modélisés dans `schema.prisma` (`@@index([statut, datePublication(sort: Desc)])`, `@@index([categorieId])`, `@@index([zoneId])`, `@@index([motCle])`) ainsi que les index implicites créés par les relations (`administrateurId`).

---

## 10. Ce qui doit être ajouté manuellement après `prisma migrate ... --create-only`

Avant application du fichier de migration :

- Les 5 fonctions PL/pgSQL (§4).
- Les 4 triggers (§5).
- Les 2 contraintes `CHECK` (§6).
- L'index GIN sur `recherche_vecteur` (§7).
- Aucune extension à ajouter (§3).

Ces ajouts reprennent intégralement et sans modification le SQL déjà figé dans `database-schema.md` §6 — cette spécification n'introduit aucune nouvelle logique, elle en précise uniquement l'ordre et les dépendances au sein du fichier de migration.

---

## 11. Tableau final

| Objet | Généré par Prisma | Ajout manuel SQL |
|---|---|---|
| Enum `type_contenu` | ✅ | — |
| Enum `statut_contenu` | ✅ | — |
| Table `categorie` (colonnes, PK, UNIQUE) | ✅ | — |
| Table `zone_geographique` (colonnes, PK, UNIQUE) | ✅ | — |
| Table `administrateur` (colonnes, PK, UNIQUE) | ✅ | — |
| Table `session_administrateur` (colonnes, PK, UNIQUE, FK Cascade) | ✅ | — |
| Table `inscrit_newsletter` (colonnes, PK, UNIQUE) | ✅ | — |
| Table `contenu_editorial` (colonnes, PK, UNIQUE, FK Restrict, colonne `recherche_vecteur` vide) | ✅ | — |
| Table `contenu_mot_cle` (PK composite, FK Cascade) | ✅ | — |
| Index `(statut, date_publication DESC)` | ✅ | — |
| Index `categorie_id`, `zone_id` sur `contenu_editorial` | ✅ | — |
| Index `mot_cle` sur `contenu_mot_cle` | ✅ | — |
| Index implicite `administrateur_id` sur `session_administrateur` | ✅ | — |
| Extension(s) | — | Aucune (§3) |
| Fonction `fn_administrateur_unique` | — | ✅ |
| Trigger `trg_administrateur_unique` | — | ✅ |
| Fonction `fn_contenu_editorial_dates` | — | ✅ |
| Trigger `trg_contenu_editorial_dates` | — | ✅ |
| Fonction `fn_maj_recherche_vecteur` | — | ✅ |
| Fonction `fn_contenu_editorial_recherche_trg` | — | ✅ |
| Trigger `trg_contenu_editorial_recherche` | — | ✅ |
| Fonction `fn_contenu_mot_cle_recherche_trg` | — | ✅ |
| Trigger `trg_contenu_mot_cle_recherche` | — | ✅ |
| Contrainte `chk_publie_champs_requis` | — | ✅ |
| Contrainte `CHECK` sur `inscrit_newsletter.statut` | — | ✅ |
| Index GIN sur `recherche_vecteur` | — | ✅ |

---

## 12. Couverture finale

- **Ordre d'exécution** : 10 blocs séquencés (§2), conformes à `database-schema.md` §9, détaillés au niveau de chaque fonction/trigger (§4-§5).
- **Extensions** : couvert — aucune requise (§3).
- **Contraintes CHECK** : 2/2 couvertes (§6).
- **Fonctions PL/pgSQL** : 5/5 couvertes (§4).
- **Triggers** : 4/4 couverts (§5).
- **Index GIN** : 1/1 couvert (§7).
- **Dépendances entre objets** : synthèse graphique complète (§8), sans dépendance circulaire.
- **Répartition Prisma / manuel** : exhaustive, tableau final 25 lignes (§11), aucun objet du schéma sans statut assigné.

Aucun fichier existant n'a été modifié pour produire cette spécification. Aucun SQL exécutable complet n'y figure.
