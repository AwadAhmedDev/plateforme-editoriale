# Database Schema — MVP

**Statut** : schéma de base de données détaillé, dérivé de `domain-model.md`, `technical-architecture.md` (§5 à §8, déjà validé), `development-tasks.md` et `frontend-specification.md`.
Ce document ne redéfinit aucune règle métier et ne modifie aucun document métier. Il ne produit ni contrats API ni code Prisma (`schema.prisma`) — uniquement le schéma PostgreSQL et la stratégie d'accès aux données.

---

## 1. Entités persistées

Reprise exacte de `domain-model.md` (5 entités métier) et de `technical-architecture.md` §5 :

1. **Contenu éditorial** → `contenu_editorial`
2. **Catégorie** → `categorie`
3. **Zone géographique** → `zone_geographique`
4. **Mots-clés** → `contenu_mot_cle` (table de rattachement, sans identité propre — cf. `domain-model.md` : « aucune existence ni gestion en dehors du Contenu éditorial »)
5. **Inscrit Newsletter** → `inscrit_newsletter`
6. **Compte Administrateur** → `administrateur`, et sa **Session administrateur** → `session_administrateur`

Aucune entité supplémentaire (pas de table Auteur — DR-004 ; pas de table Description — DR-007 ; pas de table Media/Asset — l'image reste un couple de colonnes sur `contenu_editorial`, conformément à `domain-model.md`).

---

## 2. Diagramme relationnel textuel

```text
categorie (1) ────────< (0..n) contenu_editorial >──────── (1) zone_geographique
                                     │
                                     │ (0..n)
                                     ∨
                            contenu_mot_cle (rattachement pur, PK composite)

administrateur (1) ────────< (0..n) session_administrateur

inscrit_newsletter                                          (agrégat isolé, aucune relation)
```

Cardinalités (conformes à `domain-model.md`) :

- `contenu_editorial.categorie_id` → `categorie.id` : **N..1**, obligatoire seulement si `statut = 'publie'` (cf. §5).
- `contenu_editorial.zone_id` → `zone_geographique.id` : **N..1**, même condition.
- `contenu_editorial.id` → `contenu_mot_cle.contenu_id` : **1..N**, 0 à plusieurs mots-clés, jamais partagés entre contenus (pas de table `mot_cle` autonome).
- `administrateur.id` → `session_administrateur.administrateur_id` : **1..N**, mais l'invariant « un seul Compte Administrateur » (§5) borne `administrateur` à une seule ligne dans toute la base.
- `inscrit_newsletter` : aucune clé étrangère entrante ou sortante — agrégat isolé (`domain-model.md`, Agrégat Inscrit Newsletter).

---

## 3. Enums PostgreSQL

| Enum | Valeurs | Source |
|---|---|---|
| `type_contenu` | `article`, `analyse`, `enquete`, `interview`, `dossier_thematique` | `domain-model.md` — Type de contenu (fermé ; « rapport » n'est pas une valeur distincte, cf. analyse terminologique) |
| `statut_contenu` | `brouillon`, `publie`, `archive` | `domain-model.md` — Cycle de vie du Contenu éditorial |

Les deux enums sont fermés et ne prévoient aucune valeur V2/V3 (ex. pas de statut « premium »), conformément à `domain-model.md` (« Étanchéité des périmètres de version »).

---

## 4. Dictionnaire de données complet

### 4.1 `categorie`

| Colonne | Type | Nullable | Défaut | Contrainte |
|---|---|---|---|---|
| `id` | UUID | non | `gen_random_uuid()` | PK |
| `nom` | TEXT | non | — | UNIQUE |
| `slug` | TEXT | non | — | UNIQUE |
| `description_courte` | TEXT | oui | — | — (DR-007 : optionnelle, alimente la méta-description SEO de la page Catégorie) |
| `created_at` | TIMESTAMPTZ | non | `now()` | — |

### 4.2 `zone_geographique`

| Colonne | Type | Nullable | Défaut | Contrainte |
|---|---|---|---|---|
| `id` | UUID | non | `gen_random_uuid()` | PK |
| `nom` | TEXT | non | — | UNIQUE |
| `slug` | TEXT | non | — | UNIQUE |
| `description_courte` | TEXT | oui | — | — (DR-007, symétrique de `categorie`) |
| `created_at` | TIMESTAMPTZ | non | `now()` | — |

### 4.3 `administrateur`

| Colonne | Type | Nullable | Défaut | Contrainte |
|---|---|---|---|---|
| `id` | UUID | non | `gen_random_uuid()` | PK |
| `identifiant` | TEXT | non | — | UNIQUE |
| `mot_de_passe_hash` | TEXT | non | — | — |
| `created_at` | TIMESTAMPTZ | non | `now()` | — |

Contrainte transverse : `trg_administrateur_unique` (§6) interdit toute deuxième ligne — « Un seul Compte Administrateur existe pour l'ensemble du domaine » (`domain-model.md`, invariant).

### 4.4 `session_administrateur`

| Colonne | Type | Nullable | Défaut | Contrainte |
|---|---|---|---|---|
| `id` | UUID | non | `gen_random_uuid()` | PK |
| `administrateur_id` | UUID | non | — | FK → `administrateur.id`, `ON DELETE CASCADE` |
| `jeton_hash` | TEXT | non | — | UNIQUE |
| `derniere_activite_at` | TIMESTAMPTZ | non | `now()` | — (base de l'expiration par inactivité, DR-002 — durée non fixée en base, cf. §11) |
| `created_at` | TIMESTAMPTZ | non | `now()` | — |

### 4.5 `contenu_editorial`

| Colonne | Type | Nullable | Défaut | Contrainte |
|---|---|---|---|---|
| `id` | UUID | non | `gen_random_uuid()` | PK |
| `slug` | TEXT | non | — | UNIQUE |
| `titre` | TEXT | **oui** | — | requis seulement si `statut = 'publie'` (cf. `chk_publie_champs_requis`) — jamais requis en Brouillon |
| `chapo` | TEXT | oui | — | optionnel dans tous les cas (DR-003) |
| `corps` | TEXT | oui | — | optionnel dans tous les cas, y compris Publié (DR-006) |
| `type_contenu` | `type_contenu` | oui | — | requis seulement si `statut = 'publie'` |
| `categorie_id` | UUID | oui | — | FK → `categorie.id`, `ON DELETE RESTRICT` ; requis seulement si `statut = 'publie'` |
| `zone_id` | UUID | oui | — | FK → `zone_geographique.id`, `ON DELETE RESTRICT` ; requis seulement si `statut = 'publie'` |
| `image_principale_url` | TEXT | oui | — | requis seulement si `statut = 'publie'` (couple indissociable avec `image_alt_text`) |
| `image_alt_text` | TEXT | oui | — | requis seulement si `statut = 'publie'` |
| `image_largeur` | INTEGER | oui | — | dimension d'origine — évite le saut de mise en page (CLS), cf. `development-tasks.md` P1-T1/P7-T2 |
| `image_hauteur` | INTEGER | oui | — | idem |
| `auteur` | TEXT | oui | — | texte libre, aucune entité (DR-004) |
| `sources` | TEXT | oui | — | texte libre |
| `statut` | `statut_contenu` | non | `'brouillon'` | — |
| `date_publication` | TIMESTAMPTZ | oui | — | auto-renseignée et figée par trigger (DR-005) ; garantie non nulle si `statut = 'publie'` par `chk_publie_champs_requis` |
| `date_derniere_modification` | TIMESTAMPTZ | non | `now()` | mise à jour par trigger à chaque modification |
| `created_at` | TIMESTAMPTZ | non | `now()` | — |
| `recherche_vecteur` | TSVECTOR | oui | — | maintenue par trigger (titre, chapô, corps, mots-clés — §6, §7) |

**Contrainte CHECK `chk_publie_champs_requis`** (détail en §6) : `titre`, `type_contenu`, `categorie_id`, `zone_id`, `image_principale_url`, `image_alt_text` et `date_publication` doivent tous être non nuls dès lors que `statut = 'publie'` — traduction directe de l'invariant `domain-model.md` : « Un Contenu éditorial ne peut jamais atteindre le statut Publié sans Titre, Type de contenu, Catégorie, Zone géographique, Image principale et Texte alternatif. »

### 4.6 `contenu_mot_cle`

| Colonne | Type | Nullable | Défaut | Contrainte |
|---|---|---|---|---|
| `contenu_id` | UUID | non | — | FK → `contenu_editorial.id`, `ON DELETE CASCADE`, PK (composite) |
| `mot_cle` | TEXT | non | — | PK (composite) |

Pas de colonne `id` propre : l'entité n'a aucune identité indépendante du Contenu éditorial (`domain-model.md`).

### 4.7 `inscrit_newsletter`

| Colonne | Type | Nullable | Défaut | Contrainte |
|---|---|---|---|---|
| `id` | UUID | non | `gen_random_uuid()` | PK |
| `email` | TEXT | non | — | UNIQUE — invariant « une même adresse n'apparaît jamais deux fois » |
| `date_inscription` | TIMESTAMPTZ | non | `now()` | — |
| `statut` | TEXT | non | `'inscrit'` | `CHECK (statut IN ('inscrit', 'desinscrit'))` |
| `jeton_desinscription` | TEXT | oui | — | UNIQUE |
| `desinscrit_at` | TIMESTAMPTZ | oui | — | — |

---

## 5. Contraintes d'intégrité — synthèse

| Type | Emplacement | Règle traduite |
|---|---|---|
| PK | Toutes les tables | Identité propre de chaque ligne (composite sur `contenu_mot_cle`) |
| UNIQUE | `categorie.nom`/`slug`, `zone_geographique.nom`/`slug`, `contenu_editorial.slug`, `administrateur.identifiant`, `session_administrateur.jeton_hash`, `inscrit_newsletter.email`/`jeton_desinscription` | Unicité métier ou technique (résolution de route, jeton) |
| FK `ON DELETE RESTRICT` | `contenu_editorial.categorie_id`, `contenu_editorial.zone_id` | « Une Catégorie ou une Zone géographique associée à au moins un Contenu éditorial ne peut jamais être supprimée » (`domain-model.md`) — s'applique quel que soit le statut du contenu, y compris Brouillon |
| FK `ON DELETE CASCADE` | `contenu_mot_cle.contenu_id`, `session_administrateur.administrateur_id` | Suppression en cascade d'éléments sans existence indépendante |
| CHECK | `contenu_editorial.chk_publie_champs_requis` | Champs obligatoires à la publication (voir §4.5) |
| CHECK | `inscrit_newsletter.statut` | Fermeture du domaine de valeurs (`inscrit`/`desinscrit`) |
| Trigger | `trg_administrateur_unique` | « Il n'existe jamais qu'un seul Compte Administrateur » |
| Trigger | `trg_contenu_editorial_dates` | Immutabilité de la Date de publication + mise à jour systématique de la Date de dernière modification (DR-005) |
| Trigger | `trg_contenu_editorial_recherche`, `trg_contenu_mot_cle_recherche` | Cohérence du vecteur de recherche avec le contenu réel (y compris les mots-clés, US-022) |

**Principe transverse** : la validation de **format** (forme d'un slug, d'une adresse e-mail) reste **exclusivement** de la responsabilité du schéma de validation applicatif (Zod), conformément à `frontend-specification.md` (« la validation côté serveur... reste seule autorité »). Le schéma de base de données ne porte que des contraintes qui protègent des **invariants métier** (unicité, intégrité référentielle, champs requis à la publication, immutabilité) — jamais des règles de format, pour ne pas dupliquer une autorité de validation déjà attribuée ailleurs.

---

## 6. Triggers et fonctions PL/pgSQL

Repris de `technical-architecture.md` §6 (déjà validé), reproduits ici intégralement pour un document autoportant :

```sql
-- Compte Administrateur unique
CREATE OR REPLACE FUNCTION fn_administrateur_unique() RETURNS trigger AS $$
BEGIN
  IF (SELECT count(*) FROM administrateur) >= 1 THEN
    RAISE EXCEPTION 'Un seul Compte Administrateur peut exister dans ce domaine';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_administrateur_unique
BEFORE INSERT ON administrateur
FOR EACH ROW EXECUTE FUNCTION fn_administrateur_unique();

-- Verrouillage + auto-renseignement de la Date de publication (DR-005) + Date de dernière modification
CREATE OR REPLACE FUNCTION fn_contenu_editorial_dates() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.date_publication IS NOT NULL AND NEW.date_publication IS DISTINCT FROM OLD.date_publication THEN
    RAISE EXCEPTION 'La Date de publication ne peut plus être modifiée après son premier renseignement (DR-005)';
  END IF;

  IF NEW.statut = 'publie' AND NEW.date_publication IS NULL THEN
    NEW.date_publication := now();
  END IF;

  IF TG_OP = 'UPDATE' THEN
    NEW.date_derniere_modification := now();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_contenu_editorial_dates
BEFORE INSERT OR UPDATE ON contenu_editorial
FOR EACH ROW EXECUTE FUNCTION fn_contenu_editorial_dates();

-- Entretien du vecteur de recherche (titre, chapô, corps, mots-clés)
CREATE OR REPLACE FUNCTION fn_maj_recherche_vecteur(p_contenu_id UUID) RETURNS void AS $$
BEGIN
  UPDATE contenu_editorial c SET recherche_vecteur =
    setweight(to_tsvector('french', coalesce(c.titre, '')), 'A') ||
    setweight(to_tsvector('french', coalesce((SELECT string_agg(mot_cle, ' ') FROM contenu_mot_cle WHERE contenu_id = c.id), '')), 'A') ||
    setweight(to_tsvector('french', coalesce(c.chapo, '')), 'B') ||
    setweight(to_tsvector('french', coalesce(c.corps, '')), 'C')
  WHERE c.id = p_contenu_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_contenu_editorial_recherche_trg() RETURNS trigger AS $$
BEGIN
  PERFORM fn_maj_recherche_vecteur(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_contenu_editorial_recherche
AFTER INSERT OR UPDATE OF titre, chapo, corps ON contenu_editorial
FOR EACH ROW EXECUTE FUNCTION fn_contenu_editorial_recherche_trg();

CREATE OR REPLACE FUNCTION fn_contenu_mot_cle_recherche_trg() RETURNS trigger AS $$
BEGIN
  PERFORM fn_maj_recherche_vecteur(COALESCE(NEW.contenu_id, OLD.contenu_id));
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_contenu_mot_cle_recherche
AFTER INSERT OR DELETE ON contenu_mot_cle
FOR EACH ROW EXECUTE FUNCTION fn_contenu_mot_cle_recherche_trg();
```

**Contrainte CHECK complète de `contenu_editorial`** (référencée en §4.5) :

```sql
ALTER TABLE contenu_editorial ADD CONSTRAINT chk_publie_champs_requis CHECK (
  statut <> 'publie' OR (
    titre IS NOT NULL AND type_contenu IS NOT NULL AND categorie_id IS NOT NULL
    AND zone_id IS NOT NULL AND image_principale_url IS NOT NULL AND image_alt_text IS NOT NULL
    AND date_publication IS NOT NULL
  )
);
```

---

## 7. Index

| Table | Index | Type | Justification |
|---|---|---|---|
| `categorie` | `nom`, `slug` | UNIQUE (implicite) | Contrainte métier + résolution de route |
| `zone_geographique` | `nom`, `slug` | UNIQUE (implicite) | Idem |
| `contenu_editorial` | `slug` | UNIQUE (implicite) | Résolution de route Détail d'un article |
| `contenu_editorial` | `(statut, date_publication DESC)` | Composite B-tree | Listing public trié par date, filtré par statut — requête la plus fréquente du site public |
| `contenu_editorial` | `categorie_id` | B-tree | Page Catégorie, jointure |
| `contenu_editorial` | `zone_id` | B-tree | Page Zone géographique, jointure |
| `contenu_editorial` | `recherche_vecteur` | GIN | Recherche full-text (§4.6 `technical-architecture.md`) |
| `contenu_mot_cle` | `mot_cle` | B-tree | Filtre/recherche par mot-clé (complète `recherche_vecteur`) |
| `inscrit_newsletter` | `email`, `jeton_desinscription` | UNIQUE (implicite) | Invariant d'unicité + résolution du lien à usage unique |
| `session_administrateur` | `jeton_hash` | UNIQUE (implicite) | Vérification de session à chaque requête |
| `session_administrateur` | `administrateur_id` | B-tree | Jointure (mineure — un seul administrateur dans tout le domaine) |

**Non retenu, à dessein** : un index sur `contenu_editorial.type_contenu` seul (5 valeurs fixes, faible sélectivité) — le filtre par type est déjà couvert par l'index composite `(statut, date_publication)` combiné à un `WHERE type_contenu = ...` évalué en filtre résiduel ; un index dédié n'apporterait aucun gain mesurable au volume de contenu attendu pour ce MVP (administrateur unique) et serait une optimisation prématurée.

---

## 8. Stratégie Prisma

*(Aucun code `schema.prisma` n'est produit ici — stratégie uniquement, conformément à la consigne.)*

- Toutes les tables, colonnes scalaires, enums, clés primaires, clés étrangères et contraintes `UNIQUE` de ce document sont représentables nativement dans `schema.prisma` (`model`, `enum`, `@id`, `@unique`, `@relation`).
- La colonne `recherche_vecteur` doit être déclarée comme champ `Unsupported("tsvector")` : Prisma reconnaît son existence (introspection, diff de migration) mais n'expose aucune méthode typée pour la lire/écrire — cohérent avec le fait qu'elle n'est **jamais** écrite par le code applicatif, uniquement par les triggers (§6).
- Les fonctions et triggers PL/pgSQL (`fn_administrateur_unique`, `fn_contenu_editorial_dates`, `fn_maj_recherche_vecteur` et leurs déclencheurs) et la contrainte `chk_publie_champs_requis` ne sont pas exprimables dans le langage déclaratif de `schema.prisma`. Workflow retenu : générer la migration de base par diff du schéma (`prisma migrate dev --create-only`), puis compléter manuellement le fichier `migration.sql` généré avec les blocs `CREATE FUNCTION`/`CREATE TRIGGER`/`ALTER TABLE ... ADD CONSTRAINT` de ce document, avant application (`prisma migrate deploy` ou reprise de `prisma migrate dev`).
- Toute évolution future de ces fonctions/triggers devra être portée par une migration ultérieure du même type (SQL manuel complémentaire), jamais par une modification silencieuse hors du dossier de migrations Prisma, pour conserver un historique de schéma unique et fiable.

---

## 9. Ordre des migrations

1. **Extensions/prérequis** : `gen_random_uuid()` est disponible nativement à partir de PostgreSQL 13 — aucune extension à activer sous réserve de cette version minimale.
2. **Types énumérés** : `type_contenu`, `statut_contenu`.
3. **Tables sans dépendance** : `categorie`, `zone_geographique`, `administrateur`, `inscrit_newsletter` (peuvent être créées dans n'importe quel ordre entre elles).
4. **Table dépendante de niveau 1** : `session_administrateur` (FK → `administrateur`).
5. **Table centrale** : `contenu_editorial` (FK → `categorie`, `zone_geographique`), **sans encore** sa contrainte `chk_publie_champs_requis` ni son trigger de dates (ajoutés à l'étape 7, pour isoler tout échec de contrainte lors d'un futur diagnostic de migration).
6. **Table dépendante de niveau 2** : `contenu_mot_cle` (FK → `contenu_editorial`).
7. **Fonctions et triggers** : `fn_administrateur_unique`/`trg_administrateur_unique`, `fn_contenu_editorial_dates`/`trg_contenu_editorial_dates`, `fn_maj_recherche_vecteur`, `fn_contenu_editorial_recherche_trg`/`trg_contenu_editorial_recherche`, `fn_contenu_mot_cle_recherche_trg`/`trg_contenu_mot_cle_recherche`.
8. **Contrainte `CHECK`** : `chk_publie_champs_requis` (après l'étape 7, une fois toutes les colonnes concernées en place).
9. **Index** : tous les index de performance non déjà créés par une contrainte `UNIQUE`/`PRIMARY KEY` (§7) — en dernier, une fois les tables peuplées ou non, sans incidence sur l'ordre.

Cet ordre respecte la contrainte de dépendance des clés étrangères et garantit qu'aucun trigger ne référence une colonne ou une table pas encore créée.

---

## 10. Vérification de couverture

### 10.1 Entités métier

| Entité (`domain-model.md`) | Table(s) |
|---|---|
| Contenu éditorial | `contenu_editorial`, `contenu_mot_cle` |
| Catégorie | `categorie` |
| Zone géographique | `zone_geographique` |
| Inscrit Newsletter | `inscrit_newsletter` |
| Compte Administrateur (+ Session) | `administrateur`, `session_administrateur` |

Couverture complète — aucune entité sans table.

### 10.2 Règles métier (DR-001 à DR-007 + invariants)

| Règle | Mécanisme SQL |
|---|---|
| DR-001 (Archivé accessible via URL directe, délisté ailleurs) | Application (filtre `WHERE statut = 'publie'` en lecture de liste) — aucune contrainte de schéma requise, le statut `archive` reste une valeur normale de `statut_contenu` |
| DR-002 (session expirée par inactivité) | `session_administrateur.derniere_activite_at`, comparée en application à une valeur de configuration (cf. §11) |
| DR-003 (Chapô optionnel, multi-usage) | `contenu_editorial.chapo` nullable, inclus dans `recherche_vecteur` |
| DR-004 (Auteur texte libre) | `contenu_editorial.auteur` TEXT, aucune table dédiée |
| DR-005 (Date de publication figée, Date de modification systématique) | `trg_contenu_editorial_dates` + `chk_publie_champs_requis` |
| DR-006 (Corps de texte facultatif même Publié) | `contenu_editorial.corps` nullable, absent de `chk_publie_champs_requis` |
| DR-007 (Description courte → SEO) | `categorie.description_courte`, `zone_geographique.description_courte` |
| Catégorie/Zone extensibles par CRUD | Tables autonomes avec CRUD applicatif, pas de valeurs figées en base |
| Suppression bloquée si référencée | `ON DELETE RESTRICT` sur les deux FK de `contenu_editorial` |
| Un seul Compte Administrateur | `trg_administrateur_unique` |
| Une même adresse jamais deux fois | `inscrit_newsletter.email` UNIQUE |
| Mots-clés sans existence indépendante | `contenu_mot_cle` sans identité propre, `ON DELETE CASCADE` |

Couverture complète — aucune règle métier sans mécanisme de schéma ou justification explicite de son absence (DR-001, DR-002 : logique applicative par nature, déjà actée dans `technical-architecture.md`).

### 10.3 Fonctionnalités MVP (`development-tasks.md`)

| Phase | Support schéma |
|---|---|
| Phase 1 (pages publiques) | `contenu_editorial`, `categorie`, `zone_geographique`, index `(statut, date_publication)` |
| Phase 2 (recherche/filtrage) | `recherche_vecteur` + GIN, `contenu_mot_cle` |
| Phase 3 (formulaires publics) | `inscrit_newsletter` (Newsletter) ; Contact ne persiste rien (cf. `technical-architecture.md` §3.1, notification e-mail directe) |
| Phase 4 (auth/session) | `administrateur`, `session_administrateur` |
| Phase 5 (administration des contenus) | CRUD sur `contenu_editorial`, `categorie`, `zone_geographique` |
| Phase 6 (dashboard/newsletter admin) | Agrégats sur `contenu_editorial.statut`, `inscrit_newsletter` |
| Phase 7 (SEO/perf/a11y) | `description_courte` (SEO), `image_largeur`/`image_hauteur` (CLS) |
| Phase 8 (recette) | Aucun composant de schéma supplémentaire |

Couverture complète.

---

## 11. Points nécessitant encore un arbitrage technique

Repris et complétés depuis `technical-architecture.md` §8 — uniquement les points touchant directement le schéma de données :

| # | Point | État |
|---|---|---|
| 1 | Durée d'inactivité avant expiration de session (DR-002) | Non fixée — valeur de configuration hors schéma, `session_administrateur.derniere_activite_at` suffit à l'implémenter quelle que soit la valeur retenue |
| 2 | Génération des slugs (`categorie`, `zone_geographique`, `contenu_editorial`) | Dérivés du nom/titre à la création, modifiables manuellement ; unicité déjà garantie par le schéma (`UNIQUE`) |
| 3 | Format exact de `image_largeur`/`image_hauteur` (résolution native vs. dimensions d'affichage) | À trancher lors de l'implémentation du composant d'upload — n'affecte pas la structure du schéma (deux entiers nullables dans tous les cas) |
| 4 | Colonnes `Unsupported("tsvector")` et migrations SQL manuelles (Prisma) | Stratégie déjà définie en §8 — reste à exécuter au moment de l'implémentation |
| 5 | Volume/rétention de `session_administrateur` dans le temps (pas de purge automatique définie) | Sans impact sur la structure du schéma ; question opérationnelle, pas de blocage pour le MVP |

Aucun de ces points ne bloque la validation du schéma ci-dessus — ce sont des paramètres d'exécution ou de configuration, pas des lacunes structurelles.
