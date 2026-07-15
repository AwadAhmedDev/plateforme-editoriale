# Architecture Technique Détaillée — MVP

**Statut** : proposition d'architecture technique, dérivée du corpus documentaire gelé fonctionnellement (`discovery.md` à `development-tasks.md`).
Ce document ne redéfinit et ne réinterprète aucune règle métier : il traduit en décisions techniques ce qui est déjà acté (domain-model.md, DR-001 à DR-007) et propose des choix d'implémentation là où le corpus métier ne se prononce délibérément pas (technologies, infrastructure, valeurs de configuration).

---

## 1. Vue d'ensemble

### 1.1 Nature de l'architecture

Application **monolithique full-stack Next.js** (App Router), conforme à `frontend-specification.md` : pas de backend séparé, pas de couche API publique consommée par un client JS découplé. Les Server Components lisent la base de données directement ; les mutations passent par des Server Actions liées directement aux formulaires (`frontend-specification.md`, §Formulaires : « chaque formulaire est adossé à une action serveur dédiée, appelée directement par l'élément `form` »). Une poignée de Route Handlers subsiste pour les usages qui ne sont pas des soumissions de formulaire (fichiers spéciaux Next.js, lien de désinscription).

Stack confirmée par `frontend/package.json` et `frontend-specification.md` : **Next.js 16 (App Router)**, **React 19**, **TypeScript strict**, **Tailwind CSS v4**, **shadcn/ui**.

### 1.2 Composants d'architecture

| Domaine | Choix retenu | Source |
|---|---|---|
| Frontend | Next.js 16 App Router, Server Components par défaut, îlots clients minimaux | `frontend-specification.md` (déjà acté) |
| Backend | Server Actions + Route Handlers ciblés, dans le même processus Next.js | Déduit de `frontend-specification.md` (aucun service séparé documenté) |
| Base de données | PostgreSQL (relationnel) | Arbitrage technique — cf. §8 |
| Accès aux données | Prisma ORM (TypeScript strict, migrations versionnées) | Arbitrage technique — cf. §8 |
| Authentification | Session serveur, cookie httpOnly signé, expiration par inactivité (DR-002) | `domain-model.md`, DR-002 |
| SEO | Next.js Metadata API par gabarit, `sitemap.ts`, `robots.ts`, données structurées Article/BreadcrumbList | `frontend-specification.md` §SEO |
| Recherche | PostgreSQL Full-Text Search (`tsvector`/`tsquery`, config `french`) | Arbitrage technique — cf. §8 |
| Newsletter | Table dédiée + jeton de désinscription à usage unique ; aucun envoi de campagne en V1 | `domain-model.md`, `scope-v1.md` §12 (V2) |
| Médias | Stockage objet compatible S3 + composant d'image optimisée Next.js | Arbitrage technique — cf. §8 |

---

## 2. Architecture frontend

### 2.1 Arborescence (reprise de `frontend-specification.md`, aucune modification)

```
frontend/
├── app/
│   ├── layout.tsx
│   ├── not-found.tsx                    Page "contenu introuvable" générique
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── (public)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                     Accueil
│   │   ├── articles/
│   │   │   ├── page.tsx                 Liste des articles
│   │   │   └── [slug]/
│   │   │       ├── page.tsx             Détail d'un article
│   │   │       ├── loading.tsx
│   │   │       └── not-found.tsx        Introuvable ou revenu au statut Brouillon (jamais un Archivé — DR-001)
│   │   ├── categorie/[slug]/page.tsx
│   │   ├── zone/[slug]/page.tsx
│   │   ├── recherche/{page.tsx, loading.tsx}
│   │   ├── newsletter/{page.tsx, desinscription/page.tsx}
│   │   ├── contact/page.tsx
│   │   ├── a-propos/page.tsx
│   │   ├── mentions-legales/page.tsx
│   │   └── confidentialite/page.tsx
│   └── admin/
│       ├── connexion/page.tsx
│       └── (protected)/
│           ├── layout.tsx               Vérification de session (deux niveaux) + Sidebar
│           ├── dashboard/page.tsx
│           ├── articles/{page.tsx, nouveau/page.tsx, [id]/page.tsx}
│           ├── categories/page.tsx
│           └── newsletter/page.tsx
├── features/{articles, taxonomies, search, newsletter, contact, admin-auth, admin-dashboard}/
├── components/{ui, shared}/
└── lib/                                  Accès données, config SEO, tokens, formatage
```

### 2.2 Routes publiques et protection

| Route | Rendu | Protection | Source de données |
|---|---|---|---|
| `/` | Statique, revalidé | Aucune | Articles Publiés (derniers) |
| `/articles` | Statique, revalidé | Aucune | Articles Publiés, paginé |
| `/articles/[slug]` | Statique, revalidé | Aucune — mais branchement par statut (§4.2) | Contenu éditorial par slug |
| `/categorie/[slug]` | Statique, revalidé | Aucune | Articles Publiés filtrés par catégorie |
| `/zone/[slug]` | Statique, revalidé | Aucune | Articles Publiés filtrés par zone |
| `/recherche` | Dynamique (searchParams) | Aucune | Recherche full-text + filtres |
| `/newsletter`, `/contact`, `/a-propos`, `/mentions-legales`, `/confidentialite` | Statique | Aucune | — |
| `/newsletter/desinscription` | Dynamique (jeton) | Aucune | Traitement du jeton |
| `/admin/connexion` | Dynamique | Aucune (redirige si déjà connecté) | — |
| `/admin/dashboard`, `/admin/articles*`, `/admin/categories`, `/admin/newsletter` | Dynamique | Session administrateur requise (garde à deux niveaux, cf. §4.3) | — |

### 2.3 Modules frontend (`features/`)

Repris tels quels de `frontend-specification.md` : `articles`, `taxonomies`, `search`, `newsletter`, `contact`, `admin-auth`, `admin-dashboard`. Chaque module regroupe ses composants, ses Server Actions et ses schémas de validation (Zod) — un seul schéma par formulaire, partagé entre validation client et serveur (règle déjà actée).

---

## 3. Architecture backend

### 3.1 Modules backend (logique serveur, sans service séparé)

| Module | Responsabilité | Dépend de |
|---|---|---|
| `articles` | CRUD Contenu éditorial, transitions de statut, invariants de publication (DR-005, DR-006), génération de slug | `taxonomies` (FK), `db` |
| `taxonomies` | CRUD Catégorie/Zone géographique, blocage de suppression si référencée | `db` |
| `search` | Construction de requête full-text + filtres combinables | `db` |
| `newsletter` | Inscription, génération/validation de jeton de désinscription, retrait manuel | `db` |
| `contact` | Validation et traitement du formulaire de contact | — (aucune persistance requise par les documents source) |
| `admin-auth` | Authentification, création/validation de session, expiration par inactivité (DR-002) | `db` |
| `seo` | Génération des métadonnées par gabarit (dont Description courte → méta-description Catégorie/Zone, DR-007), sitemap, robots | `articles`, `taxonomies` |
| `media` | Upload et validation de l'image principale + texte alternatif | Stockage objet (arbitrage §8) |

### 3.2 Accès aux données

Couche de repository unique par entité (`lib/db/*.ts`), aucune requête SQL dupliquée entre Server Components et Server Actions. Chaque repository expose des fonctions typées (ex. `getArticleBySlug`, `listArticlesPublies`, `createCategorie`) — pas d'accès direct au client Prisma en dehors de cette couche, pour garantir un point unique d'application des règles métier (ex. verrouillage de la Date de publication).

---

## 4. Flux principaux

### 4.1 Lecture publique d'un article

`Server Component (app/(public)/articles/[slug]/page.tsx)` → repository `getArticleBySlug(slug)` → branchement par statut (§4.2) → rendu avec métadonnées SEO générées côté serveur → mise en cache statique, invalidée par revalidation ciblée après mutation admin (§4.4).

### 4.2 Branchement par statut à l'accès direct (application stricte de DR-001)

```
getArticleBySlug(slug) → article trouvé ?
  non              → notFound() [contenu introuvable]
  oui, Brouillon   → notFound() [jamais visible hors administration]
  oui, Publié      → rendu complet, indexable, présent dans listes/recherche/sitemap.xml
  oui, Archivé     → rendu complet identique à Publié, MAIS exclu des listes/recherche/Catégorie/Zone/sitemap.xml
```

Ce branchement est le point technique qui matérialise DR-001 — il doit être unique et centralisé dans le repository, jamais dupliqué entre la page de détail et les pages de listing (qui, elles, filtrent en amont `WHERE statut = 'publie'` et n'ont donc jamais à connaître ce branchement).

### 4.3 Authentification et garde d'accès admin

`Server Action adminLogin` → vérification identifiant/mot de passe → création d'une ligne `session_administrateur` (jeton signé, `derniere_activite_at = now()`) → cookie httpOnly. Chaque requête vers `/admin/(protected)/*` : (1) vérification en amont des routes (middleware), (2) vérification redondante dans le layout protégé — les deux lisent et mettent à jour `derniere_activite_at` ; si l'écart dépasse le seuil configuré (§8), la session est invalidée et l'utilisateur redirigé vers `/admin/connexion` avec le message neutre déjà spécifié (`ui-specification.md`).

### 4.4 Mutation admin → revalidation publique

`Server Action` (publication, dépublication, archivage, modification de catégorie/zone, retrait d'un inscrit) → écriture DB → `revalidateTag`/`revalidatePath` (ou mécanisme équivalent de la version de Next.js installée) ciblé sur les routes publiques concernées, conformément à la règle déjà actée (« toute mutation administrateur déclenche une revalidation ciblée »).

### 4.5 Inscription / désinscription newsletter

Inscription : `Server Action newsletterSubscribe(email)` → upsert sur `inscrit_newsletter` (email déjà inscrit = confirmation neutre, jamais une erreur) → génération d'un jeton de désinscription stocké sur la ligne.
Désinscription : la page `/newsletter/desinscription?token=...` lit le jeton côté serveur à l'affichage, marque l'inscrit comme désinscrit si le jeton est valide et non utilisé, affiche la confirmation neutre dans tous les cas (jeton valide, déjà utilisé, ou expiré).

### 4.6 Recherche

`searchParams` (`q`, `categorie`, `zone`, `type`, `date`) → requête combinée : `to_tsquery('french', q)` sur `recherche_vecteur` **et** filtres exacts sur les colonnes indexées — jamais de recherche en mémoire côté client.

---

## 5. Entités persistées

Reprise exacte des 5 entités de `domain-model.md`, plus les Mots-clés (sans identité propre, donc modélisés comme table de rattachement pure, jamais comme référentiel) :

1. Contenu éditorial (`contenu_editorial`)
2. Catégorie (`categorie`)
3. Zone géographique (`zone_geographique`)
4. Mots-clés (`contenu_mot_cle`, table de rattachement — pas d'entité autonome)
5. Inscrit Newsletter (`inscrit_newsletter`)
6. Compte Administrateur (`administrateur`) + Session administrateur (`session_administrateur`)

Aucune entité supplémentaire n'est introduite (pas de table « Auteur », conformément à DR-004 ; pas de table « Description » séparée, conformément à DR-007 — c'est une colonne).

---

## 6. Schéma relationnel (PostgreSQL)

```sql
-- Types énumérés fermés (cf. domain-model.md — pas de valeur "rapport" distincte, cf. analyse terminologique)
CREATE TYPE type_contenu AS ENUM ('article', 'analyse', 'enquete', 'interview', 'dossier_thematique');
CREATE TYPE statut_contenu AS ENUM ('brouillon', 'publie', 'archive');

-- Référentiels administrables (DR : Catégorie/Zone extensibles par CRUD administrateur)
CREATE TABLE categorie (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom                  TEXT NOT NULL UNIQUE,
  slug                 TEXT NOT NULL UNIQUE,
  description_courte   TEXT,                         -- optionnelle — DR-007, alimente la méta-description SEO
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE zone_geographique (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom                  TEXT NOT NULL UNIQUE,
  slug                 TEXT NOT NULL UNIQUE,
  description_courte   TEXT,                         -- optionnelle — DR-007
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Compte Administrateur unique (unicité imposée en application + trigger de garde-fou)
CREATE TABLE administrateur (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifiant          TEXT NOT NULL UNIQUE,
  mot_de_passe_hash    TEXT NOT NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

-- Session administrateur (DR-002 : expiration par inactivité, durée non fixée par les documents métier)
CREATE TABLE session_administrateur (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  administrateur_id      UUID NOT NULL REFERENCES administrateur(id) ON DELETE CASCADE,
  jeton_hash             TEXT NOT NULL UNIQUE,
  derniere_activite_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contenu éditorial — Titre/Type/Catégorie/Zone/Image nullables : requis pour Publié uniquement, jamais pour Brouillon
CREATE TABLE contenu_editorial (
  id                            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                          TEXT NOT NULL UNIQUE,
  titre                         TEXT,
  chapo                         TEXT,                 -- optionnel — DR-003
  corps                         TEXT,                  -- optionnel, y compris pour Publié — DR-006
  type_contenu                  type_contenu,
  categorie_id                  UUID REFERENCES categorie(id) ON DELETE RESTRICT,
  zone_id                       UUID REFERENCES zone_geographique(id) ON DELETE RESTRICT,
  image_principale_url          TEXT,
  image_alt_text                TEXT,
  auteur                        TEXT,                  -- texte libre — DR-004, pas d'entité
  sources                       TEXT,
  statut                        statut_contenu NOT NULL DEFAULT 'brouillon',
  date_publication              TIMESTAMPTZ,            -- figée après premier renseignement — DR-005
  date_derniere_modification    TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at                    TIMESTAMPTZ NOT NULL DEFAULT now(),
  recherche_vecteur TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('french', coalesce(titre, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(chapo, '')), 'B') ||
    setweight(to_tsvector('french', coalesce(corps, '')), 'C')
  ) STORED,

  -- Invariant domain-model.md : jamais Publié sans Titre/Type/Catégorie/Zone/Image+Alt
  CONSTRAINT chk_publie_champs_requis CHECK (
    statut <> 'publie' OR (
      titre IS NOT NULL AND type_contenu IS NOT NULL AND categorie_id IS NOT NULL
      AND zone_id IS NOT NULL AND image_principale_url IS NOT NULL AND image_alt_text IS NOT NULL
    )
  )
);

-- Verrouillage de la Date de publication (DR-005) + mise à jour systématique de la Date de dernière modification
CREATE OR REPLACE FUNCTION fn_contenu_editorial_dates() RETURNS trigger AS $$
BEGIN
  IF OLD.date_publication IS NOT NULL AND NEW.date_publication IS DISTINCT FROM OLD.date_publication THEN
    RAISE EXCEPTION 'La Date de publication ne peut plus être modifiée après son premier renseignement (DR-005)';
  END IF;
  NEW.date_derniere_modification := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_contenu_editorial_dates
BEFORE UPDATE ON contenu_editorial
FOR EACH ROW EXECUTE FUNCTION fn_contenu_editorial_dates();

-- Mots-clés : aucune existence ni gestion en dehors du contenu (pas de table "tag" séparée)
CREATE TABLE contenu_mot_cle (
  contenu_id   UUID NOT NULL REFERENCES contenu_editorial(id) ON DELETE CASCADE,
  mot_cle      TEXT NOT NULL,
  PRIMARY KEY (contenu_id, mot_cle)
);

-- Inscrit Newsletter
CREATE TABLE inscrit_newsletter (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email                  TEXT NOT NULL UNIQUE,
  date_inscription       TIMESTAMPTZ NOT NULL DEFAULT now(),
  statut                 TEXT NOT NULL DEFAULT 'inscrit' CHECK (statut IN ('inscrit', 'desinscrit')),
  jeton_desinscription   TEXT UNIQUE,
  desinscrit_at          TIMESTAMPTZ
);
```

---

## 7. Index nécessaires

| Table | Index | Justification |
|---|---|---|
| `categorie` | UNIQUE(nom), UNIQUE(slug) | Contrainte métier + résolution de route |
| `zone_geographique` | UNIQUE(nom), UNIQUE(slug) | Idem |
| `contenu_editorial` | UNIQUE(slug) | Résolution de route Détail d'un article |
| `contenu_editorial` | INDEX(statut, date_publication DESC) | Listing public trié, filtré par statut |
| `contenu_editorial` | INDEX(categorie_id), INDEX(zone_id) | Pages Catégorie/Zone, jointures |
| `contenu_editorial` | INDEX(type_contenu) | Filtre de recherche/listing |
| `contenu_editorial` | GIN(recherche_vecteur) | Recherche full-text (§4.6) |
| `contenu_mot_cle` | INDEX(mot_cle) | Recherche/filtre par mot-clé |
| `inscrit_newsletter` | UNIQUE(email) | Invariant « une même adresse n'apparaît jamais deux fois » |
| `inscrit_newsletter` | UNIQUE(jeton_desinscription) | Résolution du lien à usage unique |
| `session_administrateur` | UNIQUE(jeton_hash), INDEX(administrateur_id) | Vérification de session à chaque requête |

---

## 8. Points nécessitant un arbitrage technique

Aucun de ces points n'est tranché par le corpus métier — ce sont des décisions d'ingénierie, proposées ici avec une recommandation, pas des réinterprétations de règles métier.

| # | Point | Recommandation | Alternative |
|---|---|---|---|
| 1 | ORM / accès aux données | Prisma (TypeScript strict, migrations versionnées) | Drizzle ORM |
| 2 | Hébergement | Vercel (intégration native Next.js/ISR) | Tout hébergeur compatible Node.js |
| 3 | Stockage des images | Objet compatible S3 (ex. Cloudflare R2) + composant d'image optimisée Next.js | AWS S3 |
| 4 | Hachage du mot de passe administrateur | bcrypt | argon2id |
| 5 | **Durée d'inactivité avant expiration de session (DR-002)** | Valeur de configuration (variable d'environnement), **non fixée ici** — DR-002 exclut explicitement toute valeur chiffrée non justifiée par un document source | — |
| 6 | Génération des slugs (Catégorie/Zone/Article) | Dérivés du nom/titre à la création, modifiables manuellement, unicité vérifiée en base | — |
| 7 | Récupération d'accès administrateur (hors produit, `domain-model.md`) | Script de reset exécuté manuellement contre la base (cf. analyse dédiée) — aucun endpoint applicatif | — |
| 8 | **Mécanisme d'envoi des communications newsletter contenant le lien de désinscription** | Hors périmètre technique V1 (envoi de campagne différé en V2, `scope-v1.md` §12) — l'application expose uniquement la génération et la validation du jeton ; le canal d'envoi réel des communications reste externe/manuel en V1 | À clarifier avec le produit si un envoi transactionnel minimal s'avère nécessaire |

---

## 9. Risques techniques

- **Verrouillage de la Date de publication (DR-005)** : le trigger empêche toute modification y compris légitime (ex. correction d'une erreur de saisie initiale) — à documenter clairement pour l'administrateur, car il n'existe aucune procédure de contournement dans le corpus métier.
- **Recherche full-text en français** : dépend de la configuration linguistique `french` de PostgreSQL (stemming, accents) — à valider sur des contenus réels (noms propres géopolitiques, ex. « Somaliland ») avant mise en production.
- **Revalidation ciblée après mutation admin** : la couverture exacte des routes à invalider (Accueil, Liste, Catégorie, Zone, Recherche, Détail) doit être exhaustive à chaque type de mutation ; un oubli entraînerait un contenu public périmé sans qu'aucune erreur ne soit visible.
- **Branchement par statut à l'accès direct (§4.2)** : logique la plus sensible du produit vis-à-vis de DR-001 — une régression future (ex. lors d'un refactor du repository) pourrait silencieusement recréer la contradiction déjà corrigée entre le comportement de `not-found.tsx` et l'accessibilité des contenus Archivés.
- **Absence de canal d'envoi newsletter en V1** : le jeton de désinscription est généré et validé par l'application, mais aucun document ne précise comment l'administrateur transmet réellement une communication contenant ce lien en V1 (l'envoi de campagne est V2) — risque de fonctionnalité orpheline si cette mécanique n'est pas clarifiée avant le développement de la Phase 3.

---

## 10. Couverture technique du backlog (`development-tasks.md`)

| Phase | Couverture architecturale |
|---|---|
| 0 — Fondations & design system | Design tokens, primitives — aucun impact backend |
| 1 — Pages publiques de lecture | §2.2, §4.1, §4.2, module `articles`/`taxonomies` |
| 2 — Recherche et filtrage | §4.6, module `search`, index GIN |
| 3 — Formulaires publics | Modules `newsletter`, `contact`, Server Actions |
| 4 — Authentification & shell admin | Module `admin-auth`, §4.3, table `session_administrateur` |
| 5 — Administration des contenus | Modules `articles`/`taxonomies` (mutations), contraintes DB (§6) |
| 6 — Dashboard & gestion newsletter admin | Repository de comptage, module `newsletter` (retrait) |
| 7 — Qualité transverse (SEO, perf, a11y) | Module `seo`, §4.4 (revalidation), aucun composant DB supplémentaire |
| 8 — Recette et stabilisation | Aucun composant technique nouveau ; validation de bout en bout des flux §4 |

Chaque phase du backlog dispose d'une couverture technique explicite dans cette architecture ; aucune fonctionnalité du backlog ne reste sans module, table ou flux correspondant.
