# Prisma Config Specification — MVP

**Statut** : spécification exhaustive de la configuration Prisma 7 du projet (fichier `prisma.config.ts`, variables d'environnement, stratégies Supabase/migrations/Client/RLS, dépendances npm), dérivée de `technical-architecture.md`, `database-schema.md`, `prisma-schema-specification.md` et de `frontend/prisma/schema.prisma` (déjà validé), tous gelés. Ce document ne contient aucun code TypeScript complet — uniquement la description de chaque rôle, variable et stratégie, conformément à la consigne.

**Contraintes actées, non rediscutées ici** :

| # | Contrainte | Source |
|---|---|---|
| 1 | Prisma `7.8.0` | Version stable (`latest` npm) au moment de la rédaction |
| 2 | Next.js 16 | `frontend/package.json` |
| 3 | Supabase PostgreSQL | Introduit par `prisma-schema-specification.md` §14 (précision d'infrastructure non encore répercutée dans `technical-architecture.md`) |
| 4 | Node 22 | Environnement de développement/validation |
| 5 | `schema.prisma` déjà validé, non modifié ici | `frontend/prisma/schema.prisma` |
| 6 | `generator client { provider = "prisma-client-js" }` conservé | Compatibilité Turbopack/Next.js 16 (cf. §5) |
| 7 | Deux URLs distinctes : `DIRECT_URL` (migrations) / `DATABASE_URL` (trafic applicatif) | §2 |

---

## 1. Rôle de `prisma.config.ts`

Depuis Prisma 7, les propriétés `url`, `directUrl` et `shadowDatabaseUrl` du bloc `datasource` de `schema.prisma` sont supprimées — cohérent avec l'état déjà validé du fichier (`frontend/prisma/schema.prisma`, contrainte 5 : aucun champ `url` dans `datasource db { provider = "postgresql" }`). Cette configuration de connexion se déplace intégralement vers un nouveau fichier `prisma.config.ts`, à la racine du dossier `frontend/` (à côté de `package.json`).

**Périmètre exact de `prisma.config.ts`** — point de clarification important, car source d'erreur fréquente :

- Il est lu **exclusivement par le CLI Prisma** : `prisma migrate dev`, `prisma migrate deploy`, `prisma migrate diff`, `prisma generate`, `prisma db pull`, `prisma db push`, `prisma studio`, `prisma validate`.
- Il **n'est jamais lu par `PrismaClient` au runtime applicatif**. Prisma 7 exige qu'un adaptateur de driver (ou une `accelerateUrl`) soit fourni explicitement à l'instanciation du client (cf. §5) — il n'existe plus de câblage implicite entre `prisma.config.ts` et le client généré consommé par les Server Actions/Server Components.
- Il référence uniquement le chemin du schéma (`schema: "prisma/schema.prisma"`), le dossier de migrations, et l'URL de connexion utilisée pour les opérations CLI ci-dessus.
- Le chargement des variables d'environnement n'est plus automatique en Prisma 7 (contrairement à Prisma 6 et antérieurs, où `.env` était chargé implicitement) : `prisma.config.ts` doit charger explicitement `dotenv` en tête de fichier pour que `env(...)` résolve les variables décrites en §2.

---

## 2. Variables d'environnement requises

| Variable | Rôle | Type de connexion Supabase | Consommée par |
|---|---|---|---|
| `DIRECT_URL` | Migrations Prisma (DDL : `CREATE TABLE`, `CREATE TYPE`, `CREATE FUNCTION`/`TRIGGER`, `ALTER TABLE ... ADD CONSTRAINT`) | Connexion directe (port `5432`, `db.<projet>.supabase.co`) | `prisma.config.ts` (champ `datasource.url`) |
| `DATABASE_URL` | Trafic applicatif (requêtes du client généré, Server Actions/Server Components) | Connexion poolée Supavisor, mode transaction (port `6543`, `...pooler.supabase.com`, paramètre `pgbouncer=true`) | Adaptateur de driver instancié dans le code applicatif (§5), **jamais** `prisma.config.ts` |
| `SHADOW_DATABASE_URL` *(conditionnelle — cf. §4)* | Base fantôme utilisée par `prisma migrate dev` pour détecter la dérive de schéma | À arbitrer (§4) | `prisma.config.ts` (champ `datasource.shadowDatabaseUrl`), uniquement si la stratégie retenue en §4 en a besoin |

**Règle stricte** : `DIRECT_URL` ne doit jamais être utilisée comme connexion applicative (elle contourne le pooler et épuiserait rapidement les connexions directes disponibles côté Supabase sous charge), et `DATABASE_URL` (poolée) ne doit jamais servir aux migrations (le mode transaction de Supavisor ne supporte pas la préparation de session nécessaire aux commandes DDL de `prisma migrate`). Cette séparation stricte reprend et opérationnalise le constat déjà acté dans `prisma-schema-specification.md` §14 (« configuration standard à deux URLs »).

---

## 3. Stratégie Supabase

- **Deux chaînes de connexion distinctes**, conformément à la contrainte 7 : une directe (`DIRECT_URL`) réservée au CLI Prisma, une poolée (`DATABASE_URL`, Supavisor mode transaction) réservée au trafic applicatif — aucune des deux n'est interchangeable avec l'autre (§2).
- **Schéma cible** : les 7 tables du schéma `public`, sans collision avec les schémas réservés Supabase (`auth`, `storage`, `realtime`, `extensions`) — point déjà vérifié dans `prisma-schema-specification.md` §14, non rediscuté ici.
- **`gen_random_uuid()`** : disponible nativement à partir de PostgreSQL 13 sur l'instance Supabase, sans extension à activer — cohérent avec `database-schema.md` §9 et `prisma-schema-specification.md` §14.
- **Limitation connue des instructions préparées** : le mode transaction de Supavisor a des limitations documentées avec les requêtes préparées de Prisma Client ; ce point conditionne la configuration de l'adaptateur de driver côté Client (§5), pas la configuration de migration (§4).

---

## 4. Stratégie migrations

- **Connexion utilisée** : `prisma.config.ts` pointe `datasource.url` vers `DIRECT_URL` — toutes les commandes CLI (`migrate dev`, `migrate deploy`, `migrate diff`) s'exécutent donc exclusivement contre la connexion directe, jamais contre le pooler.
- **Blocs SQL manuels** : l'ordre et le contenu des migrations restent ceux déjà actés par `database-schema.md` §8-§9 et `prisma-schema-specification.md` §10 (fonctions/triggers PL/pgSQL, contraintes `CHECK`, index GIN) — `prisma.config.ts` ne change rien à ce contenu, il ne fait que fournir la connexion sur laquelle ces migrations s'appliquent.
- **Environnements de déploiement (CI/CD, production)** : `prisma migrate deploy` contre `DIRECT_URL` — cette commande n'a pas besoin de base fantôme, donc `SHADOW_DATABASE_URL` n'intervient pas à ce stade.
- **Point nécessitant un arbitrage** — base fantôme en développement local : `prisma migrate dev` (utilisé en développement pour générer et appliquer une nouvelle migration en un geste) nécessite une base fantôme pour détecter la dérive de schéma. Sur une instance Supabase mutualisée, la création programmatique d'une base fantôme par le CLI (`CREATE DATABASE`/`DROP DATABASE` répétés) n'est pas garantie selon le plan et les droits du rôle de connexion directe. Deux options, **non tranchées ici** :
  - (a) fournir `SHADOW_DATABASE_URL` pointant vers une base Postgres locale/dédiée au développement (ex. conteneur Postgres local), distincte de l'instance Supabase, réservée à cet usage ;
  - (b) écarter `prisma migrate dev` en développement au profit du flux déjà documenté dans `database-schema.md` §8 (`prisma migrate dev --create-only` puis édition manuelle, sans jamais laisser le CLI appliquer/faire diverger automatiquement contre Supabase), suivi de `prisma migrate deploy` pour l'application effective.

---

## 5. Stratégie Prisma Client

- **Générateur conservé** : `provider = "prisma-client-js"`, sans champ `output` — et non le nouveau générateur `prisma-client` (devenu le défaut recommandé par Prisma pour les nouveaux projets). Ce choix n'est pas une simple continuité de l'existant : `prisma-client` génère du code hors de `node_modules` selon une structure que la résolution de modules de Turbopack (bundler par défaut de Next.js 16) ne retrouve pas de façon fiable au moment du rendu serveur. `prisma-client-js` reste résolu de façon classique via `node_modules/.prisma/client`, seule combinaison fiable actuellement documentée avec Next.js 16 + Turbopack.
- **Adaptateur de driver obligatoire** : Prisma 7 exige qu'un adaptateur (ou une `accelerateUrl`) soit passé explicitement à l'instanciation du client — il n'existe plus de moteur de requêtes implicite par défaut. Pour PostgreSQL/Supabase, l'adaptateur pertinent est celui du pilote `node-postgres` (§7). Cet adaptateur est construit avec `DATABASE_URL` (poolée), jamais `DIRECT_URL`.
- **Instanciation unique** : le client doit être instancié une seule fois, en portée module, et réutilisé par l'ensemble des Server Actions et Server Components — pas de nouvelle instance par requête, pour éviter l'épuisement des connexions poolées Supavisor sous charge concurrente.
- **Aucune dépendance de ce Client à `prisma.config.ts`** : la variable `DATABASE_URL` est lue directement par le code applicatif au moment de construire l'adaptateur, indépendamment de la configuration CLI (§1).

---

## 6. Stratégie RLS/PostgREST

Ce point reste **non tranché**, exactement comme déjà signalé dans `prisma-schema-specification.md` §14 — cette spécification de configuration Prisma ne le retranche pas davantage, elle en précise seulement la portée :

- La décision (activer RLS avec politiques de refus total sur les 7 tables, **ou** neutraliser l'API PostgREST/Data API du projet Supabase) est une **configuration au niveau du projet Supabase**, orthogonale à `prisma.config.ts` et à `schema.prisma` — aucun des deux fichiers ne l'exprime, ni ne peut l'exprimer.
- Cette configuration Prisma (connexion directe pour les migrations, connexion poolée + adaptateur pour le Client) reste valide et fonctionnellement identique quelle que soit l'option retenue pour RLS/PostgREST — aucun couplage entre les deux.
- Rappel de la portée déjà actée : sans l'une des deux mesures, les colonnes sensibles (`administrateur.mot_de_passe_hash`, `session_administrateur.jeton_hash`), les contenus au statut `brouillon`, et les adresses de `inscrit_newsletter` resteraient potentiellement accessibles hors du chemin applicatif Prisma via l'API Data auto-générée de Supabase — condition à satisfaire avant mise en production, non un simple paramètre de configuration différable.

---

## 7. Dépendances npm nécessaires

| Paquet | Rôle | Emplacement `package.json` |
|---|---|---|
| `prisma` (`7.8.0`) | CLI Prisma (migrate, generate, studio, db pull/push) — lit `prisma.config.ts` | `devDependencies` |
| `@prisma/client` (`7.8.0`) | Client généré par `prisma-client-js`, consommé par le code applicatif | `dependencies` |
| `@prisma/adapter-pg` (`7.8.0`) | Adaptateur de driver requis pour instancier `PrismaClient` en Prisma 7 (§5), construit avec `DATABASE_URL` | `dependencies` |
| `pg` | Pilote `node-postgres` sous-jacent, dépendance de `@prisma/adapter-pg` | `dependencies` |
| `dotenv` | Chargement explicite des variables d'environnement dans `prisma.config.ts` (Prisma 7 ne charge plus `.env` automatiquement, cf. §1) | `devDependencies` |

Aucune de ces cinq dépendances n'est actuellement présente dans `frontend/package.json` (contrainte 5 — seuls `next`, `react`, `react-dom` et l'outillage de build y figurent à ce jour).

---

## 8. Couverture finale

- **`prisma.config.ts`** : rôle et périmètre exact décrits (§1), sans code TypeScript complet.
- **Variables d'environnement** : 2 requises (`DIRECT_URL`, `DATABASE_URL`) + 1 conditionnelle (`SHADOW_DATABASE_URL`), toutes couvertes (§2).
- **Stratégies** : Supabase (§3), migrations (§4, avec un point d'arbitrage explicitement signalé plutôt que tranché arbitrairement), Prisma Client (§5), RLS/PostgREST (§6, renvoyé à son périmètre projet Supabase déjà documenté ailleurs).
- **Dépendances npm** : 5 paquets identifiés avec leur rôle et leur emplacement (§7).
- Aucune contradiction introduite avec `technical-architecture.md`, `database-schema.md`, `prisma-schema-specification.md` ou `frontend/prisma/schema.prisma` — ce document ajoute une couche de configuration, il ne rouvre aucune décision déjà actée par ces sources.

Aucun fichier existant n'a été modifié pour produire cette spécification. Aucun code TypeScript complet n'y figure.
