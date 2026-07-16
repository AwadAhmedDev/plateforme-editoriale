# Implementation Roadmap — Plateforme éditoriale Corne de l'Afrique (MVP)

**Plan d'implémentation exécutable, du premier commit jusqu'au MVP déployé en production.**

**Statut** : ce document transforme en séquence de travail l'intégralité du corpus gelé — `discovery.md`, `requirements.md`, `user-stories.md`, `scope-v1.md`, `domain-model.md`, `sitemap.md`, `ui-specification.md`, `frontend-specification.md`, `development-tasks.md`, `technical-architecture.md`, `database-schema.md`, `api-contracts.md`, `server-actions-specification.md`, `prisma-schema-specification.md`, `prisma-config-specification.md`, `sql-migration-specification.md`. Il ne redéfinit aucun besoin métier, n'introduit aucune fonctionnalité et ne modifie aucune décision d'architecture déjà actée : il **séquence** leur mise en œuvre dans l'ordre de dépendance réel, avec pour chaque étape ses prérequis, ses livrables, ses critères de validation et ses risques.

**Ce document remplace et complète sa version précédente**, qui séquençait uniquement le frontend et supposait une API backend externe (Node.js/Express, MySQL — hypothèse de `deployment.md`, aujourd'hui hors du corpus gelé). Cette hypothèse est caduque : `technical-architecture.md` §1.1 acte une application monolithique Next.js où les Server Components lisent la base directement et les mutations passent par des Server Actions, **dans le même processus** — il n'existe aucune API séparée à attendre. La conséquence directe sur la planification : l'infrastructure de données (Supabase + Prisma + migration) est un préalable à construire **une fois, au tout début**, et non une dépendance externe à découpler du développement frontend.

**Ce que ce document ne refait pas** : `development-tasks.md` reste la référence du découpage détaillé en cartes Trello pour les tâches frontend (Phases 0 à 8, cartes `P0-T1` à `P8-T4`) — ce document ne renumérote ni ne duplique ces cartes, il ajoute ce qui leur manquait (l'infrastructure de données préalable, les opérations serveur exactes de `server-actions-specification.md` à implémenter phase par phase, et le chemin jusqu'à la mise en production), et rétablit une lecture correcte de la dépendance à la base de données là où l'ancienne version de ce document s'appuyait sur une hypothèse obsolète.

Périmètre couvert : strictement le MVP (`scope-v1.md`, fonctionnalités 1 à 7) — 10 écrans publics, 5 écrans administrateur. Aucune tâche V2/V3 n'est planifiée ici. Aucun code n'est produit dans ce document : uniquement la séquence de développement, ses livrables et ses critères de validation.

---

## Principe d'ordonnancement

L'ordre de développement suit la chaîne de dépendance technique réelle, pas l'ordre de priorité métier ni l'ordre du sitemap :

1. **L'infrastructure de données précède tout le reste, sans exception** : `schema.prisma` est déjà validé, la première migration est intégralement spécifiée (`sql-migration-specification.md`), la configuration Prisma l'est également (`prisma-config-specification.md`) — il n'y a aucune raison de différer cette étape ni de la découpler du développement frontend par un jeu de données simulées, puisque la base de données vit dans le même dépôt et le même processus applicatif que le reste du produit.
2. **Ce qui n'a besoin de rien d'autre est construit en premier**, une fois l'infrastructure de données en place : tokens de design, primitives, composants partagés sans logique métier — en parallèle de l'infrastructure de données, car les deux sont mutuellement indépendantes.
3. **Le contenu en lecture seule précède l'interactivité** : une page publique adossée à de vraies lectures Prisma peut être construite et validée avant qu'un formulaire ou un filtre ne lui soit ajouté.
4. **Un pattern n'est établi qu'une seule fois puis réutilisé** : le premier formulaire construit (Newsletter) fixe le pattern de validation/action serveur réutilisé tel quel par tous les formulaires suivants, y compris administrateur — il n'est pas réinventé phase après phase.
5. **L'authentification administrateur précède toute page administrateur protégée**, sans exception — et suppose que le Compte Administrateur unique existe déjà en base (créé lors de l'infrastructure de données, faute d'écran de création dans le produit).
6. **Une taxonomie (catégorie/zone) doit exister avant l'écran qui la consomme** : la gestion des catégories/zones est construite avant l'éditeur d'article, qui en dépend pour sa classification.
7. **Le Dashboard est construit en dernier côté administrateur** : il agrège des données (articles, inscrits newsletter) qui doivent déjà exister pour être comptées et listées.
8. **La qualité transverse n'est pas une phase finale isolée** : elle est vérifiée à la fin de chaque phase sur le périmètre déjà livré, puis auditée globalement avant la recette.
9. **La mise en production est une phase à part entière, pas une simple bascule finale** : elle a ses propres prérequis (dont un point de sécurité bloquant, cf. Phase 9) et ne peut commencer qu'une fois la recette close.

---

## Vue d'ensemble des phases

| Phase | Nom | Dépend de | Contenu principal |
|---|---|---|---|
| 0A | Infrastructure de données | — | Provisionnement Supabase, migration initiale, Prisma Client, coquille de la couche repository, Compte Administrateur unique |
| 0B | Fondations & design system | — (parallèle à 0A) | Tokens, primitives shadcn/ui, composants partagés sans logique métier |
| 1 | Pages publiques de lecture | 0A, 0B | Accueil, Liste des articles, Détail d'un article, Catégorie, Zone géographique, À propos + pages légales |
| 2 | Recherche et filtrage | 1 | Route unique `/recherche`, filtres combinables, recherche full-text |
| 3 | Formulaires publics & validation | 0B (1 pour les emplacements inline) | Newsletter (3 emplacements), Contact, pattern de validation/action serveur |
| 4 | Authentification & shell administrateur | 0A, 0B | Connexion administrateur, session, layout protégé (sidebar) |
| 5 | Administration des contenus | 3 (pattern), 4 (shell) | Gestion des catégories/zones, Éditeur d'article, Gestion des articles |
| 6 | Dashboard & gestion newsletter admin | 3, 5 | Dashboard, Gestion newsletter admin |
| 7 | Qualité transverse | 0A à 6 | Accessibilité, performance, SEO, responsive — audit global |
| 8 | Recette et stabilisation | Toutes (0A à 7) | Parcours de bout en bout, non-régression, correction finale |
| 9 | Mise en production | 8 | Bascule Supabase/Vercel en production, vérification RLS/PostgREST, déploiement |

Les Phases 0A et 0B sont strictement parallélisables (aucune dépendance croisée). Une fois 0A et 0B livrées, les Phases 1 à 4 peuvent être menées par des personnes différentes en parallèle, à l'exception des emplacements inline de la newsletter (Phase 3) qui nécessitent que les pages correspondantes de la Phase 1 existent déjà. Les Phases 5, 6, 7, 8, 9 sont strictement séquentielles.

---

## Traçabilité : opérations serveur → phase d'implémentation

Chaque opération de `server-actions-specification.md` est implémentée dans une phase et une seule (aucune n'est répétée, aucune n'est omise) :

| Phase | Opérations implémentées (`server-actions-specification.md`) |
|---|---|
| 0A | Aucune opération applicative — création manuelle du Compte Administrateur unique (prérequis technique, pas un contrat de §1) |
| 1 | `getHomePageData` (§11.1), `listPublishedArticles` (§11.2), `getArticleDetail` (§11.3), `getCategoryPage` (§11.4), `getZonePage` (§11.5) |
| 2 | `searchContent` (§9.1) |
| 3 | `subscribeNewsletter` (§6.1, incluant la réactivation §7), Traitement du jeton de désinscription (§6.2), `submitContactForm` (§10.1) |
| 4 | `adminLogin` (§1.1), `adminLogout` (§1.2), Garde d'accès session (§1.3) |
| 5 | `createArticle`, `updateArticle`, `publishArticle`, `unpublishArticle`, `archiveArticle`, `deleteArticle`, `getArticleForEdit`, `listArticles` (§3) ; `listCategories`/`createCategory`/`updateCategory`/`deleteCategory` (§4) ; `listZones`/`createZone`/`updateZone`/`deleteZone` (§5) |
| 6 | `getDashboardData` (§2.1), `listSubscribers` (§8.1), `removeSubscriber` (§8.2) |

Aucune opération n'est prévue pour les Phases 7, 8, 9 : ces phases auditent, valident et déploient ce qui a déjà été implémenté, sans ajouter de nouvelle opération serveur.

---

## Phase 0A — Infrastructure de données

### Objectif

Faire exister, une bonne fois pour toutes et avant toute autre phase, la base de données réelle sur laquelle s'appuiera tout le reste du projet — de sorte qu'aucune phase suivante n'ait à travailler contre des données simulées faute d'infrastructure disponible.

### Prérequis

- Node.js 22 installé (conforme à `prisma-config-specification.md`).
- Un projet Supabase provisionné, avec accès à ses deux chaînes de connexion (directe, port 5432 ; poolée Supavisor, port 6543).
- `frontend/prisma/schema.prisma` déjà validé (contrainte : ne pas le modifier à ce stade).

### Contenu

1. Ajouter les cinq dépendances npm de `prisma-config-specification.md` §7 (`prisma`, `@prisma/client`, `@prisma/adapter-pg`, `pg`, `dotenv`) à `frontend/package.json`.
2. Renseigner `DIRECT_URL` et `DATABASE_URL` (variables d'environnement, jamais commitées) — rôle et séparation stricte décrits en `prisma-config-specification.md` §2-§3. Trancher au passage le point d'arbitrage de `prisma-config-specification.md` §4 (base fantôme locale ou flux `--create-only` sans `prisma migrate dev` direct contre Supabase) et renseigner `SHADOW_DATABASE_URL` seulement si l'option (a) est retenue.
3. Créer `prisma.config.ts` à la racine de `frontend/`, conformément à son rôle exact décrit en `prisma-config-specification.md` §1 (lu uniquement par le CLI, jamais par le Client au runtime), pointant `datasource.url` vers `DIRECT_URL`.
4. Générer la migration initiale (`prisma migrate dev --create-only`) à partir de `schema.prisma` — produit uniquement le bloc généré par Prisma (types, tables, clés, index déclaratifs) décrit en `sql-migration-specification.md` §9.
5. Compléter manuellement le fichier de migration généré avec les 5 fonctions PL/pgSQL, les 4 triggers, les 2 contraintes `CHECK` et l'index GIN, **dans l'ordre et avec les dépendances exactes** décrites en `sql-migration-specification.md` §2 à §8 (aucune extension à ajouter, §3).
6. Appliquer la migration contre `DIRECT_URL` (`prisma migrate dev` ou `prisma migrate deploy` selon l'option retenue à l'étape 2).
7. Générer le Client Prisma (`prisma generate`) — générateur `prisma-client-js` conservé, sans `output` (`prisma-config-specification.md` §5).
8. Instancier le Client en singleton avec l'adaptateur `@prisma/adapter-pg` construit sur `DATABASE_URL` (poolée) — un seul point d'instanciation, réutilisé par tout le code applicatif.
9. Créer la coquille de la couche repository (`lib/db/*.ts`, un fichier par entité, `technical-architecture.md` §3.2) : une fonction par opération de `server-actions-specification.md`, signature typée, corps non implémenté à ce stade — chaque phase suivante implémente uniquement les fonctions qui lui appartiennent (cf. tableau de traçabilité ci-dessus), jamais par anticipation.
10. Créer le Compte Administrateur unique par insertion directe (script ou Prisma Studio), mot de passe haché en bcrypt (`technical-architecture.md` §8 point 4) — aucun écran de création n'existe dans le produit (`sitemap.md`), cette insertion est donc un prérequis technique unique, pas une fonctionnalité applicative.

### Livrables

- Migration appliquée avec succès sur l'instance Supabase de développement.
- `prisma.config.ts` et Client Prisma fonctionnels, séparation stricte `DIRECT_URL`/`DATABASE_URL` respectée.
- Coquille de la couche repository, typée, vide de logique métier.
- Compte Administrateur unique existant en base.

### Critères de validation

- [ ] `prisma migrate status` ne rapporte aucune dérive entre `schema.prisma` et la base.
- [ ] Les 5 fonctions et 4 triggers PL/pgSQL existent en base (vérifiable par requête sur `pg_proc`/`pg_trigger`).
- [ ] Une tentative d'insertion d'un second `administrateur` échoue avec le message du trigger `fn_administrateur_unique`.
- [ ] Une tentative de passage direct d'un contenu à `publie` sans titre échoue via `chk_publie_champs_requis`.
- [ ] Le Client Prisma applicatif se connecte exclusivement via `DATABASE_URL` ; aucune requête applicative ne transite par `DIRECT_URL`.
- [ ] L'index GIN sur `recherche_vecteur` existe et est utilisé par `EXPLAIN` sur une requête `to_tsquery`.

### Risques techniques

- Base fantôme (`prisma-config-specification.md` §4) non tranchée avant cette phase : bloque `prisma migrate dev` en développement local si l'option (a) n'est pas préparée à temps.
- Limitation des instructions préparées du mode transaction Supavisor (`prisma-config-specification.md` §3) : à surveiller dès les premières requêtes concurrentes, pas seulement en charge de production.
- RLS/PostgREST (`prisma-config-specification.md` §6) reste ouvert à ce stade — sans conséquence pour le développement, mais **condition bloquante avant la Phase 9** (à ne pas oublier faute d'alerte automatique).

---

## Phase 0B — Fondations & design system

### Objectif

Mettre en place tout ce dont dépend visuellement et structurellement le reste du projet, de sorte qu'aucune phase suivante n'ait à revenir sur un token, une primitive ou un composant partagé faute d'avoir été anticipé. Strictement indépendante de la Phase 0A — peut être menée en parallèle par une autre personne.

### Prérequis

Aucun — première phase constructible sans dépendance technique.

### Contenu

1. **Tokens de design** (`app/globals.css`) : couleurs, échelle typographique, échelle d'espacement, rayons, durées de transition, breakpoints (600px/1024px) — traduction directe de la table de tokens de `ui-specification.md`.
2. **Layout racine** (`app/layout.tsx`) : document HTML, chargement des trois polices (`font.editorial`, `font.ui`, `font.mono`), landmarks globaux.
3. **Primitives shadcn/ui strictement nécessaires** : Button, Input, Textarea, Select, Checkbox, RadioGroup, Dialog, composant de toast, Badge, Card — installées puis alignées sur les tokens.
4. **Composants partagés sans logique métier** (`components/shared/`) : `Skeleton`, `EmptyState`, `LiveRegion`, `StatusPill`, `Tag`, `Modal` (au-dessus de Dialog), `Toast`/`Alert` (au-dessus du composant de toast).
5. **Utilitaires de support** (`lib/`) : formatage de dates, génération/lecture de slugs, constantes partagées.

### Livrables

- Design tokens intégralement déclarés et vérifiables.
- Bibliothèque de primitives shadcn/ui installées, thémées.
- Composants partagés fonctionnels et testés isolément (indépendamment de toute page réelle et de la Phase 0A).

### Critères de validation

- [ ] Aucune couleur, espacement, rayon ou durée n'est utilisé hors de l'échelle de tokens dans les composants livrés.
- [ ] Chaque primitive shadcn/ui installée correspond à un besoin identifié dans `ui-specification.md`.
- [ ] Les trois polices se chargent sans saut de mise en page (CLS) mesurable.
- [ ] `Modal` piège le focus à l'ouverture et le restitue à la fermeture ; `Toast`/`Alert` sont annoncés en live-region.
- [ ] Chaque composant partagé possède tous ses états requis (repos, survol, focus, désactivé, chargement) tels que définis en §États des composants de `ui-specification.md`.

### Risques techniques

Aucun spécifique à cette phase — le seul risque transverse est un token non repris fidèlement de `ui-specification.md`, détecté par l'audit de la Phase 7.

---

## Phase 1 — Pages publiques de lecture

### Objectif

Livrer l'intégralité du contenu public consultable en lecture seule, adossé dès le départ à de vraies lectures Prisma (Phase 0A) — sans aucune interactivité de formulaire ni de recherche.

### Prérequis

- Phase 0A close : repository de lecture disponible, migration appliquée.
- Phase 0B close : tokens, primitives, composants partagés disponibles.
- Un jeu minimal de contenus de test insérés directement en base (Prisma Studio ou SQL), faute d'interface d'administration à ce stade (Phase 5) — pratique de bootstrap, pas une fonctionnalité, à retirer avant la Phase 9.

### Contenu

**Composants** : `ArticleCard` (grille puis liste), `Breadcrumb`/lien "← Retour", `Pagination` (numérotée desktop, "Charger plus" mobile), navigation publique (header + footer) et layout `(public)`, barre de partage.

**Repository/lecture (`server-actions-specification.md`)** : implémentation complète de `getHomePageData`, `listPublishedArticles`, `getArticleDetail` (avec le branchement par statut de `technical-architecture.md` §4.2, centralisé et unique — jamais dupliqué), `getCategoryPage`, `getZonePage`.

**Routes** (ordre de construction) : Détail d'un article (la plus riche en règles, valide `ArticleCard` et la colonne de lecture) → Liste des articles → Catégorie / Zone géographique → Accueil (recompose les pages précédentes) → À propos, Mentions légales, Politique de confidentialité (contenu statique, sans dépendance, traité à tout moment de la phase).

### Livrables

- Layout public identique sur toutes les pages publiques.
- 8 routes rendues avec de vraies données Prisma.
- États vides qualifiés et squelettes de chargement pour chaque grille/liste.

### Critères de validation

- [ ] Navigation principale et footer strictement identiques sur les 8 écrans livrés.
- [ ] Ordre de métadonnées Type · Catégorie · Zone · Date respecté avec omission contextuelle correcte.
- [ ] Aucune fonction retirée entre les trois breakpoints sur chacune de ces pages.
- [ ] Chaque grille/liste dispose d'un état vide qualifié et d'un squelette de chargement.
- [ ] Le branchement par statut (Introuvable/Brouillon → introuvable ; Publié → indexable ; Archivé → accessible en direct, exclu des listes) est vérifié explicitement, pas seulement supposé.
- [ ] Chaque page dispose d'un chemin de retour — aucune impasse.

### Risques techniques

- **Taille de page des listes publiques non fixée** (`api-contracts.md` §7.2) : à trancher avant de finaliser `listPublishedArticles`/`getCategoryPage`/`getZonePage`, faute de quoi la pagination serait arbitraire et potentiellement à refaire.
- **Source de la méta-description SEO du Détail d'un contenu sans Chapô** (`api-contracts.md` §7.4) : point ouvert affectant directement la génération de métadonnées de cette phase — à arbitrer avant la Phase 7 (audit SEO), idéalement avant la fin de cette phase.
- Branchement par statut à l'accès direct (`technical-architecture.md` §9) : la logique la plus sensible du produit vis-à-vis de DR-001 — un refactor ultérieur du repository pourrait silencieusement la recréer ailleurs si elle n'est pas strictement centralisée dès cette phase.

---

## Phase 2 — Recherche et filtrage

### Objectif

Ajouter la couche d'interactivité de consultation au-dessus du contenu déjà livré en Phase 1, en établissant le pattern d'état porté par l'URL.

### Prérequis

Phase 1 close (contenu et repository de lecture disponibles).

### Contenu

**Composants** : `SearchBar` (3 variantes), `FilterBar`/`FilterPanel`.

**Repository/lecture** : implémentation complète de `searchContent` (§9.1) — `to_tsquery('french', q)` sur `recherche_vecteur` combiné aux filtres exacts, jamais de recherche en mémoire côté client.

**Routes** : Recherche et Résultats (route unique `/recherche`, jamais scindée) ; application rétroactive des filtres sur Liste, Catégorie, Zone (déjà livrées en Phase 1).

### Livrables

- Recherche et filtrage fonctionnels sur les quatre écrans concernés.
- Compteur de résultats annoncé en live-region.
- État vide qualifié spécifique à l'absence de résultat.

### Critères de validation

- [ ] La requête et les filtres actifs sont conservés lors d'un retour depuis un article consulté.
- [ ] Le lien "Réinitialiser les filtres" est systématiquement présent dès qu'un filtre est actif.
- [ ] Le raccourci clavier Entrée soumet la recherche indépendamment du clic sur l'icône/bouton.
- [ ] Aucun résultat n'est traité comme une erreur ; le compteur est annoncé aux technologies d'assistance.
- [ ] Comportement responsive conforme (pills desktop / bouton "Filtrer" + panneau bas mobile).

### Risques techniques

- **Recherche full-text en français** (`technical-architecture.md` §9) : dépend de la configuration linguistique `french` de PostgreSQL — à valider sur des contenus réels (noms propres géopolitiques, ex. « Somaliland ») avant la Phase 7.
- Taille de page pour les Résultats de recherche : même point ouvert qu'en Phase 1 (`api-contracts.md` §7.2), à trancher au plus tard ici s'il ne l'a pas été avant.

---

## Phase 3 — Formulaires publics & validation

### Objectif

Établir, sur les deux formulaires publics les plus simples du produit, le pattern de validation/action serveur réutilisé sans modification par tous les formulaires administrateur des Phases 5 et 6.

### Prérequis

- Phase 0B close (pattern de composants de formulaire).
- Phase 1 close pour les emplacements inline uniquement (bandeau Accueil, bloc fin d'article) — la page Newsletter dédiée et Contact n'ont pas cette dépendance.
- Un service d'envoi transactionnel configuré pour le module `contact` (Resend recommandé, `technical-architecture.md` §8 point 9) — prérequis externe à obtenir avant de clore cette phase, pas avant de la commencer.

### Contenu

**Composants** : Newsletter (champ unique, fixe le pattern) → Contact (multi-champs, réutilise le pattern) → Désinscription newsletter (écran de confirmation, réutilise l'infrastructure de jeton, pas le pattern de formulaire).

**Server Actions** : `subscribeNewsletter` (§6.1, incluant la réactivation d'une adresse désinscrite décrite en §7 — réactivation de la ligne existante, jamais une nouvelle ligne), Traitement du jeton de désinscription (§6.2), `submitContactForm` (§10.1, notification e-mail à l'administrateur, aucune persistance).

**Routes/emplacements** (ordre) : Newsletter dédiée → emplacements inline Newsletter (Accueil, fin d'article) → Contact → Désinscription newsletter (atteinte uniquement par lien e-mail).

### Livrables

- Pattern de validation/action serveur documenté par l'exemple.
- Newsletter fonctionnelle sur ses trois emplacements, traitement neutre du cas "déjà inscrit" et de la réactivation après désinscription.
- Contact fonctionnel, notification e-mail réellement envoyée.
- Désinscription newsletter fonctionnelle par lien à jeton, confirmation neutre y compris lien déjà utilisé/expiré.

### Critères de validation

- [ ] Validation déclenchée à la soumission, puis revalidation en temps réel après une première erreur.
- [ ] Message d'erreur spécifique et actionnable sur chaque champ concerné.
- [ ] Focus renvoyé automatiquement au premier champ en erreur après soumission refusée.
- [ ] Saisie utilisateur conservée après un échec technique.
- [ ] "Déjà inscrit" et réinscription après désinscription traités comme une confirmation neutre, jamais une erreur.
- [ ] Confirmation Newsletter affichée in situ, jamais par redirection.
- [ ] La désinscription ne nécessite aucune connexion ni ressaisie de l'e-mail ; un lien déjà utilisé ou expiré affiche la même confirmation neutre qu'un lien valide.
- [ ] La notification de contact est effectivement reçue par l'administrateur (test de bout en bout avec le service transactionnel réel, pas seulement en simulation).

### Risques techniques

- **Incohérence documentaire non propagée** (`api-contracts.md` §4.2, `server-actions-specification.md` §7) : la décision de réactivation après désinscription n'est pas encore répercutée dans `domain-model.md` ni `database-schema.md` §10.2 — implémentation à faire selon `server-actions-specification.md` §6.1/§7 (qui font autorité pour le comportement), propagation documentaire à traiter séparément, hors développement.
- **Absence de canal d'envoi newsletter en V1** (`technical-architecture.md` §9) : le jeton est généré et validé par l'application, mais aucun document ne précise comment l'administrateur transmet réellement une communication contenant ce lien — risque de fonctionnalité orpheline si non clarifié avant la fin de cette phase.

---

## Phase 4 — Authentification & shell administrateur

### Objectif

Construire la porte d'entrée et l'ossature de tout l'espace administrateur avant toute page protégée.

### Prérequis

- Phase 0A close : Compte Administrateur unique déjà créé en base, table `session_administrateur` disponible.
- Phase 0B close : pattern de formulaire, primitives.
- **Durée d'inactivité avant expiration de session (DR-002) choisie et configurée** (variable d'environnement) : aucun document métier ne fixe cette valeur — décision d'ingénierie à prendre explicitement avant de clore cette phase, jamais une valeur arbitraire non documentée.

### Contenu

**Composants** : Connexion administrateur (réutilise le pattern Phase 3), mécanisme de session et garde d'accès à deux niveaux, Sidebar administrateur et layout protégé, message d'orientation desktop-only (sous 1024px, CSS pur).

**Server Actions/mécanisme** : `adminLogin` (§1.1), `adminLogout` (§1.2), Garde d'accès session (§1.3 — vérification + mise à jour de `derniere_activite_at` à chaque requête valide).

**Routes** : Connexion administrateur (sans dépendance) → layout protégé (coquille avec sidebar, validée par une page de test minimale avant d'y brancher tout contenu réel).

### Livrables

- Connexion fonctionnelle contre le Compte Administrateur réel, session établie, déconnexion opérationnelle.
- Layout protégé avec sidebar identique, prêt pour les Phases 5 et 6.
- Message d'orientation desktop-only vérifié sous 1024px.

### Critères de validation

- [ ] Échec de connexion : message générique "Identifiant ou mot de passe incorrect", mot de passe vidé, identifiant conservé.
- [ ] Accès direct à une URL protégée sans session : redirection vers la Connexion, sans exposer de contenu.
- [ ] Sidebar strictement identique sur la coquille de test des quatre écrans post-connexion.
- [ ] Déconnexion accessible depuis n'importe quel écran admin, sans confirmation.
- [ ] Sous 1024px, le message d'orientation s'affiche à la place du layout.
- [ ] Session expirée après la durée configurée → redirection Connexion, message neutre, aucun contenu exposé.

### Risques techniques

- Si la durée d'inactivité (DR-002) est choisie arbitrairement sans traçabilité (ex. codée en dur plutôt qu'en configuration), toute révision future nécessitera un redéploiement — à éviter en respectant strictement `technical-architecture.md` §8 point 5 (valeur de configuration).
- Absence de procédure de récupération d'accès applicative (`domain-model.md`, `technical-architecture.md` §8 point 7) : en cas de perte du mot de passe, seul un script exécuté manuellement contre la base permet de le réinitialiser — à documenter opérationnellement avant la mise en production (Phase 9), pas à développer comme fonctionnalité.

---

## Phase 5 — Administration des contenus

### Objectif

Livrer l'outil de travail quotidien de l'administrateur unique, dans l'ordre qui respecte la dépendance de classification.

### Prérequis

- Phase 3 close (pattern de formulaire).
- Phase 4 close (shell administrateur, session).
- Un stockage objet compatible S3 provisionné pour l'upload de l'image principale (Cloudflare R2 recommandé, `technical-architecture.md` §8 point 3) — prérequis externe pour le module `media`.

### Contenu

**Composants/routes** (ordre) : Gestion des catégories/zones (la plus simple, condition de peuplement de l'Éditeur) → Éditeur d'article (le plus complexe) → Gestion des articles (relie les deux précédentes).

**Server Actions/lecture** : `listCategories`/`createCategory`/`updateCategory`/`deleteCategory` et leur symétrique `listZones`/`createZone`/`updateZone`/`deleteZone` (§4-§5) ; `createArticle`, `updateArticle`, `publishArticle`, `unpublishArticle`, `archiveArticle`, `deleteArticle`, `getArticleForEdit`, `listArticles` (§3).

### Livrables

- Gestion des catégories/zones : création, modification, suppression conditionnée (`CATEGORIE_REFERENCEE`/équivalent zone), table avec nombre d'articles associés.
- Éditeur d'article : création/modification complètes, classification obligatoire à la publication seulement, tags optionnels, image principale + alt (upload réel vers le stockage objet), statut à 3 segments, validation différenciée brouillon/publication.
- Gestion des articles : table triée, filtrée, paginée (20 lignes), navigation vers l'éditeur.

### Critères de validation

- [ ] "Supprimer" une catégorie/zone est désactivé et n'ouvre aucune Modal si des articles y sont associés.
- [ ] Titre, type de contenu, catégorie, zone, image principale + alt requis pour "Publier" uniquement, jamais pour l'enregistrement en brouillon.
- [ ] Un contenu n'est jamais associé à plus d'une catégorie ou plus d'une zone.
- [ ] Chaque action de sauvegarde/publication produit un toast explicite.
- [ ] La table Articles trie uniquement sur Date et Statut, colonne Actions en dernière position.
- [ ] Aucune suppression directe sans passage par une Modal de confirmation.
- [ ] Un article publié apparaît correctement sur les pages publiques des Phases 1/2 (revalidation ciblée vérifiée de bout en bout, `technical-architecture.md` §4.4).

### Risques techniques

- **Champs requis pour la transition vers Archivé non actés** (`api-contracts.md` §7.1) : affecte directement la validation d'`archiveArticle` dans cette phase — implémenter la transition comme "toujours libre" (seule règle actée à ce jour) en attendant un arbitrage, sans anticiper une exigence de champs non encore validée.
- **Messages de validation par champ à la publication non tous rédigés** (`api-contracts.md` §7.3) : seul le message du Titre est fixé littéralement — les autres champs suivent le principe (message spécifique) mais leur texte exact reste à rédiger avant de clore cette phase.
- **Revalidation ciblée** (`technical-architecture.md` §9) : la couverture exacte des routes à invalider (Accueil, Liste, Catégorie, Zone, Recherche, Détail) doit être exhaustive à chaque type de mutation ; un oubli produit un contenu public périmé sans erreur visible — à tester explicitement, pas supposé correct par construction.

---

## Phase 6 — Dashboard & gestion newsletter admin

### Objectif

Clore l'espace administrateur avec les deux écrans qui agrègent des données produites par les phases précédentes.

### Prérequis

Phase 3 (inscrits newsletter existants) et Phase 5 (articles existants) closes.

### Contenu

**Composants/routes** : Gestion newsletter (table, recherche par e-mail, retrait via Modal) → Dashboard (cartes de comptage, table des derniers articles modifiés).

**Server Actions/lecture** : `listSubscribers` (§8.1, statut `inscrit` uniquement), `removeSubscriber` (§8.2), `getDashboardData` (§2.1).

### Livrables

- Gestion newsletter : table, recherche en direct, retrait avec confirmation, compteur mis à jour.
- Dashboard : 3 cartes de comptage, table des 5 derniers articles modifiés, action rapide "+ Nouvel article", état vide de premier lancement.

### Critères de validation

- [ ] Retrait d'un inscrit : Modal de confirmation, compteur mis à jour, toast affiché.
- [ ] Dashboard : aucun graphique ni statistique avancée — chiffres statiques par rafraîchissement de page.
- [ ] Action "+ Nouvel article" toujours visible sans scroll sur une résolution desktop standard.
- [ ] Ligne de table cliquable dans son ensemble (Dashboard et Gestion des articles) ouvre l'éditeur correspondant.
- [ ] État de premier lancement (0 article, 0 inscrit) : compteurs à 0 sans alerte.
- [ ] Un inscrit désinscrit (libre-service ou retrait manuel) disparaît de `listSubscribers` sans action supplémentaire.

### Risques techniques

Aucun risque technique propre à cette phase au-delà de ceux déjà couverts (revalidation, comptage cohérent avec §2.2/§4.4 de `api-contracts.md`) — cette phase ne fait qu'agréger des données déjà validées dans les phases précédentes.

---

## Phase 7 — Qualité transverse (accessibilité, performance, SEO, responsive)

### Objectif

Auditer globalement, sur l'ensemble des 15 écrans livrés, ce qui n'a pu être vérifié qu'écran par écran pendant les phases précédentes.

### Prérequis

Phases 0A à 6 closes.

### Contenu

- Audit d'accessibilité complet (contraste, focus clavier, structure sémantique, live-regions, alt-text) sur les 15 écrans.
- Vérification de performance sur les gabarits les plus lourds (Détail d'un article, Liste des articles, Résultats de recherche).
- Métadonnées, données structurées, plan de site (`sitemap.ts`) et exclusion d'indexation de l'espace administrateur (`robots.ts`) vérifiées route par route — y compris la résolution effective des points ouverts §7.2/§7.4 de `api-contracts.md` s'ils ne l'ont pas déjà été.
- Repasse responsive complète sur les trois breakpoints pour les 10 écrans publics.
- Audit de la couverture de revalidation ciblée (`technical-architecture.md` §4.4/§9) sur l'ensemble des scénarios de mutation.

### Livrables

Rapport d'audit consolidé (accessibilité, performance, SEO, responsive, revalidation).

### Critères de validation

- [ ] Contraste ≥ 7:1 (corps de texte) et ≥ 4.5:1 (métadonnées) vérifié sur chaque paire texte/fond réellement utilisée.
- [ ] Focus clavier visible et cohérent sur 100% des éléments interactifs des 15 écrans.
- [ ] Un seul `h1` par page, hiérarchie de titres sans saut de niveau.
- [ ] Plan de site généré ne contient que du contenu publié ; `robots.ts` exclut intégralement `/admin`.
- [ ] Aucune fonction retirée entre breakpoints sur l'ensemble des 10 écrans publics.
- [ ] Aucune régression sur les critères déjà validés phase par phase.

### Risques techniques

Récapitulatif des risques transverses non encore clos à ce stade : recherche full-text en français non validée sur des cas réels (Phase 2), taille de page publique non tranchée (Phase 1), messages de validation par champ incomplets (Phase 5) — cette phase est le dernier point de contrôle avant la recette pour s'assurer qu'aucun de ces points n'est resté ouvert sans décision.

---

## Phase 8 — Recette et stabilisation

### Objectif

Valider le produit dans son ensemble à travers les parcours utilisateurs et administrateur, puis stabiliser avant mise en production.

### Prérequis

Phase 7 close.

### Contenu

- Exécution complète des quatre parcours publics et des cinq parcours administrateur (`ui-specification.md`).
- Journal de bugs et corrections, priorisé par sévérité (bloquant / majeur / mineur).
- Vérification finale des deux checklists de conformité (`ui-specification.md` et `frontend-specification.md`) sur le produit complet.
- Retrait des données de test insérées en Phase 1/0A (nettoyage avant la Phase 9).

### Livrables

Produit complet, recetté, journal de bugs soldé (aucun bloquant/majeur ouvert).

### Critères de validation

- [ ] Les neuf parcours s'exécutent de bout en bout sans blocage.
- [ ] Aucun bug bloquant ou majeur ouvert.
- [ ] Les deux checklists de conformité sont intégralement cochées sur le produit final.
- [ ] Aucune fonctionnalité V2/V3 n'a été introduite dans l'interface livrée.
- [ ] Aucune donnée de test/développement ne subsiste en base.

### Risques techniques

Aucun risque technique nouveau — cette phase révèle les risques déjà identifiés dans les phases précédentes s'ils n'ont pas été traités ; elle n'en introduit pas.

---

## Phase 9 — Mise en production

### Objectif

Basculer le produit recetté vers l'environnement de production, en résolvant explicitement le seul point bloquant de sécurité identifié dans le corpus (`prisma-schema-specification.md` §14, `prisma-config-specification.md` §6).

### Prérequis

- Phase 8 close.
- Hébergement choisi (Vercel recommandé, `technical-architecture.md` §8 point 2) et provisionné.
- Instance Supabase de production distincte de celle de développement, avec ses propres `DIRECT_URL`/`DATABASE_URL`.
- Stockage objet et service transactionnel (Resend) configurés pour la production, distincts des environnements de développement.

### Contenu

1. **Décision RLS/PostgREST tranchée et appliquée** sur le projet Supabase de production : soit RLS activé avec politiques de refus total sur les 7 tables, soit l'API PostgREST/Data API explicitement neutralisée (`prisma-config-specification.md` §6) — **condition à satisfaire avant toute exposition publique de la base**, pas un paramètre différable après mise en ligne.
2. `prisma migrate deploy` exécuté contre `DIRECT_URL` de production (aucune base fantôme requise à ce stade, `prisma-config-specification.md` §4).
3. Variables d'environnement de production renseignées sur la plateforme d'hébergement (`DIRECT_URL`, `DATABASE_URL`, secret de signature de session, clé du service d'envoi transactionnel, identifiants du stockage objet).
4. Déploiement de l'application Next.js.
5. Rejeu des neuf parcours de la Phase 8 contre l'environnement de production réel.

### Livrables

MVP accessible publiquement en production, espace administrateur fonctionnel avec le Compte Administrateur unique.

### Critères de validation

- [ ] RLS activé avec politiques de refus total **ou** API PostgREST neutralisée — vérifié explicitement sur le projet de production, jamais supposé.
- [ ] `prisma migrate deploy` exécuté sans erreur contre la base de production.
- [ ] Les neuf parcours rejoués avec succès en production.
- [ ] `robots.txt` exclut `/admin` en production réelle.
- [ ] Aucune donnée de test/développement présente en production.

### Risques techniques

- Oubli de la neutralisation RLS/PostgREST : exposerait `administrateur.mot_de_passe_hash`, `session_administrateur.jeton_hash`, les contenus Brouillon et les adresses `inscrit_newsletter` via l'API Data auto-générée de Supabase, hors du chemin applicatif Prisma — risque déjà signalé comme condition bloquante par `prisma-schema-specification.md` §14.
- Divergence entre `schema.prisma` et l'état réel de la base de production si une modification a été appliquée hors du flux de migration Prisma — à proscrire dès la Phase 0A pour ne pas en hériter ici.

---

## Points d'arbitrage ouverts — registre consolidé

Aucun de ces points n'est tranché par le corpus métier gelé ; ce document ne les tranche pas non plus (ce serait introduire un nouveau besoin métier, hors mandat). Ils sont listés ici une seule fois, avec la phase qu'ils affectent, pour qu'une équipe ne les découvre pas au hasard d'une relecture :

| Point | Source | Phase affectée |
|---|---|---|
| Champs requis pour la transition vers Archivé | `api-contracts.md` §7.1 | 5 |
| Taille de page des listes publiques | `api-contracts.md` §7.2 | 1, 2, 7 |
| Messages de validation par champ à la publication (hors Titre) | `api-contracts.md` §7.3 | 5, 7 |
| Source de la méta-description SEO du Détail d'un contenu sans Chapô | `api-contracts.md` §7.4 | 1, 7 |
| Durée d'inactivité avant expiration de session (DR-002) | `technical-architecture.md` §8 point 5 | 4 |
| Base fantôme pour les migrations en développement local | `prisma-config-specification.md` §4 | 0A |
| RLS ou neutralisation PostgREST | `prisma-config-specification.md` §6, `prisma-schema-specification.md` §14 | 0A (à anticiper), 9 (bloquant) |
| Propagation de la décision de réactivation newsletter dans `domain-model.md`/`database-schema.md` | `api-contracts.md` §4.2, `server-actions-specification.md` §7 | 3 (documentaire, ne bloque pas l'implémentation) |
| Canal d'envoi des communications newsletter contenant le lien de désinscription | `technical-architecture.md` §8 point 8 | 3 (hors périmètre V1, risque produit à surveiller) |

---

## Stratégie de tests

| Niveau | Portée | Introduit à partir de | Objectif |
|---|---|---|---|
| Tests d'infrastructure | Migration, contraintes, triggers | Phase 0A | Vérifier que chaque objet de `sql-migration-specification.md` existe et se comporte comme spécifié (cf. critères de validation Phase 0A) |
| Tests de schémas et utilitaires | Règles de validation, fonctions de formatage/slug | Phase 0B / Phase 3 | Garantir que chaque règle de `ui-specification.md` est vérifiable indépendamment de l'interface |
| Tests de composants | Composants partagés et composants métier isolés | Phase 0B, puis à chaque nouveau composant | Vérifier les états requis et les comportements d'accessibilité indépendamment d'une page réelle |
| Tests d'intégration par feature | Une route ou un formulaire complet, contre la vraie base | À la fin de chaque phase (0A à 6) | Valider les critères de validation de la phase avant de la considérer close |
| Tests de bout en bout (parcours) | Parcours utilisateurs et administrateur complets | Dès qu'un parcours est entièrement livré, au plus tard Phase 8 | Valider la continuité d'un parcours à travers plusieurs écrans |
| Audit d'accessibilité automatisé | Ensemble des écrans livrés | À la fin de chaque phase, consolidé en Phase 7 | Détecter les régressions au fil de l'avancement |
| Vérification responsive | Trois breakpoints sur les écrans publics | À la fin de chaque phase publique (1, 2, 3), consolidée en Phase 7 | Confirmer qu'aucune fonction n'est retirée entre breakpoints |

Principes transverses (inchangés depuis la version précédente de ce document) :

- Un composant partagé n'est considéré livré (Phase 0B) que si ses tests d'états et d'accessibilité passent isolément.
- Le pattern de validation/action serveur établi en Phase 3 est testé une fois en profondeur ; les formulaires administrateur des Phases 5 et 6 ne retestent que leurs règles spécifiques.
- Aucun test de non-régression global n'est reporté à la Phase 8 par défaut : chaque phase ferme ses propres critères avant de passer à la suivante.
- `test-plan.md` reste le document de suivi d'exécution ; ce document définit la stratégie qui l'alimente, pas l'inverse.

---

## Couverture finale

- **Ordre de dépendance réel** : 11 phases séquencées (0A/0B parallèles, 1 à 9 strictement ordonnées après), corrigeant l'hypothèse obsolète d'une API backend externe.
- **Prérequis** : explicités pour chacune des 11 phases.
- **Critères de validation** : explicités pour chacune des 11 phases, sous forme de checklist vérifiable.
- **Livrables** : explicités pour chacune des 11 phases.
- **Risques techniques** : explicités phase par phase, plus un registre consolidé des points d'arbitrage ouverts (9 points, aucun tranché arbitrairement).
- **Chemin complet jusqu'au MVP déployable** : couvert de la Phase 0A (aucune ligne de base n'existe encore) à la Phase 9 (produit en production, RLS/PostgREST vérifié).
- **Traçabilité** : les 27 opérations de `server-actions-specification.md` sont chacune assignées à une phase et une seule.
- Aucun nouveau besoin métier, aucune nouvelle fonctionnalité, aucune modification d'architecture n'a été introduite pour produire ce document.

---

_Ce document est la référence unique pour l'ordonnancement du développement du MVP, frontend et backend confondus. Il se lit conjointement avec `development-tasks.md` (détail des cartes frontend par phase), `ui-specification.md` et `frontend-specification.md` (référence visuelle/architecture), `server-actions-specification.md`/`api-contracts.md` (référence fonctionnelle backend) et `sql-migration-specification.md`/`prisma-config-specification.md` (référence d'infrastructure). Toute réorganisation de phase doit être reportée ici avant d'être appliquée en développement._
