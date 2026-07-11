# Frontend Specification — Plateforme éditoriale Corne de l'Afrique (MVP)

**Document de référence pour l'architecture frontend.**
Traduit `ui-specification.md` en organisation technique exécutable pour la stack retenue : **Next.js (App Router) / React 19 / TypeScript strict / Tailwind CSS / shadcn/ui**. Ce document ne redéfinit aucune règle visuelle, de couleur, de typographie ou de comportement d'interaction — celles-ci restent intégralement définies par `ui-specification.md`, qui reste la source de vérité pour tout ce qui touche au rendu et à l'interaction. Ce document répond exclusivement à la question : **comment organiser et structurer le code frontend** pour livrer cette interface.

Aucun code n'est produit ici : uniquement l'architecture, l'organisation des dossiers, les responsabilités et les conventions.

Le périmètre couvert est strictement celui du MVP défini par `scope-v1.md` et `sitemap.md` (10 écrans publics + 5 écrans administrateur). Aucune structure anticipant les fonctionnalités V2/V3 (comptes utilisateurs, contenus premium, abonnements payants, statistiques avancées) n'est prévue — l'architecture par features permet de les accueillir plus tard sans réécriture, mais ne les modélise pas aujourd'hui.

---

## Prérequis techniques

- **Next.js 16 (App Router)**, **React 19**, **TypeScript strict**, **Tailwind CSS v4**, **shadcn/ui** — versions effectivement installées dans `frontend/package.json`.
- Next.js 16 introduit des changements structurants par rapport aux versions antérieures (conventions de fichiers, API de requête, mise en cache). Conformément à `frontend/AGENTS.md`, toute décision d'implémentation s'appuyant sur une convention Next.js précise (nommage d'un fichier spécial, signature d'une API de requête, comportement de cache par défaut) doit être vérifiée contre la documentation embarquée dans `node_modules/next/dist/docs` au moment de coder, plutôt que supposée à partir de versions antérieures.
- TypeScript est déjà configuré en mode strict (`tsconfig.json`) et l'alias de chemin `@/*` pointe vers la racine `frontend/` — toutes les conventions ci-dessous s'appuient sur cette configuration existante, sans la modifier.

---

## Architecture frontend

## Principes généraux

1. **Server Components par défaut.** Toute page et tout composant qui ne nécessite ni état local, ni interactivité navigateur, ni API du DOM reste un Server Component. Le passage en Client Component (`'use client'`) est une exception justifiée au cas par cas, jamais un défaut.
2. **Deux espaces, deux arborescences de routage étanches**, reflet direct du principe d'architecture UI (`ui-specification.md`, §Architecture UI) : l'espace public et l'espace administrateur ne partagent ni layout, ni navigation, ni composant de mise en page — uniquement des primitives UI et des utilitaires bas niveau.
3. **Le contenu piloté par les données est rendu côté serveur.** Les listes d'articles, détails d'articles, catégories, zones, résultats de recherche et tables d'administration sont composés en Server Components qui récupèrent leurs données directement (pas de couche de fetching client dupliquant ce que le serveur sait déjà faire).
4. **L'interactivité est isolée dans des îlots clients minimaux** : menu mobile, overlay de recherche, panneau de filtres mobile, formulaires, éditeur d'article, modales de confirmation. Chaque îlot est le plus petit composant possible autour de l'élément réellement interactif.
5. **L'URL est la source de vérité pour l'état de consultation** (recherche, filtres, tri, pagination) — jamais un state client isolé — pour satisfaire l'exigence de persistance de contexte de navigation (`ui-specification.md`, §Persistance de contexte de navigation).
6. **Découpage par features, pas par type technique.** Le code métier (composants, actions serveur, schémas de validation, types) est organisé par domaine fonctionnel (articles, catégories, recherche, newsletter, administration), et non par catégorie technique (tous les hooks ensemble, tous les composants ensemble).

## Vue d'ensemble des couches

| Couche              | Rôle                                                                                  | Emplacement           |
| ------------------- | ------------------------------------------------------------------------------------- | --------------------- |
| Routage             | Définition des routes, layouts, gabarits de chargement/erreur                         | `app/`                |
| Design system       | Primitives UI génériques, sans connaissance du métier                                 | `components/ui/`      |
| Composants partagés | Composites transverses aux features (carte article, pagination, breadcrumb...)        | `components/shared/`  |
| Features            | Composants métier, actions serveur, schémas de validation, types propres à un domaine | `features/<domaine>/` |
| Support             | Utilitaires, configuration SEO, constantes de tokens, accès aux données               | `lib/`                |

---

## Structure des dossiers

```text
frontend/
├── app/
│   ├── layout.tsx                  Layout racine (html/body, polices, landmarks globaux)
│   ├── globals.css                 Déclaration des design tokens (Tailwind v4 @theme) et styles de base
│   ├── not-found.tsx               Page d'erreur "contenu introuvable" générique (public)
│   ├── sitemap.ts                  Génération du sitemap public
│   ├── robots.ts                   Génération de robots.txt (exclusion de /admin)
│   │
│   ├── (public)/
│   │   ├── layout.tsx              Layout public : navigation principale + footer
│   │   ├── page.tsx                Accueil
│   │   ├── articles/
│   │   │   ├── page.tsx            Liste des articles
│   │   │   └── [slug]/
│   │   │       ├── page.tsx        Détail d'un article
│   │   │       ├── loading.tsx     Squelette de détail d'article
│   │   │       └── not-found.tsx   Article introuvable / dépublié
│   │   ├── categorie/
│   │   │   └── [slug]/page.tsx     Page Catégorie
│   │   ├── zone/
│   │   │   └── [slug]/page.tsx     Page Zone géographique
│   │   ├── recherche/
│   │   │   ├── page.tsx            Recherche + Résultats (piloté par les paramètres d'URL)
│   │   │   └── loading.tsx
│   │   ├── newsletter/
│   │   │   ├── page.tsx            Formulaire Newsletter dédié
│   │   │   └── desinscription/page.tsx  Désinscription par lien e-mail (jeton)
│   │   ├── a-propos/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── mentions-legales/page.tsx
│   │   └── confidentialite/page.tsx
│   │
│   └── admin/
│       ├── connexion/page.tsx      Connexion administrateur (layout minimal, sans sidebar)
│       └── (protected)/
│           ├── layout.tsx          Vérification de session + Sidebar administrateur
│           ├── dashboard/page.tsx
│           ├── articles/
│           │   ├── page.tsx        Gestion des articles (liste back-office)
│           │   ├── nouveau/page.tsx
│           │   └── [id]/page.tsx   Éditeur d'article
│           ├── categories/page.tsx Gestion des catégories/zones
│           └── newsletter/page.tsx Gestion newsletter
│
├── components/
│   ├── ui/                         Primitives shadcn/ui (Button, Input, Select, Dialog, Badge...)
│   └── shared/                     Composites transverses (ArticleCard, Breadcrumb, Pagination,
│                                    EmptyState, StatusPill, LiveRegion, Toast/Alert, SearchBar)
│
├── features/
│   ├── articles/                   Composants, actions serveur, schémas, types — articles publics + éditeur admin
│   ├── taxonomies/                 Catégories et zones géographiques (classement, gestion admin)
│   ├── search/                     Recherche et filtrage (public)
│   ├── newsletter/                 Inscription/désinscription, gestion admin des inscrits
│   ├── contact/                    Formulaire de contact
│   ├── admin-auth/                 Connexion, session, garde d'accès
│   └── admin-dashboard/            Cartes de comptage, table des derniers articles modifiés
│
├── lib/                            Accès aux données, configuration SEO, constantes de tokens, formatage
├── hooks/                          Hooks partagés non rattachés à une feature unique
└── types/                          Types globaux transverses (ex. statut de contenu, pagination générique)
```

Chaque dossier de `features/<domaine>/` suit la même sous-structure interne : composants du domaine, actions serveur (mutations), schémas de validation, types dérivés du schéma. Cette symétrie est volontaire : elle rend chaque feature lisible indépendamment des autres.

Les fichiers sous `app/` restent des fichiers de **routage et de composition** (assemblage de composants de `features/` et `components/`) — la logique métier ne vit jamais directement dans un `page.tsx` ou `layout.tsx`.

---

## Découpage par features

| Feature           | Fonctionnalité `scope-v1.md` couverte                       | Routes concernées                                                               | Contenu du module                                                                                                                                    |
| ----------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `articles`        | Rédaction et publication d'articles ; consultation publique | Accueil, Liste des articles, Détail d'un article, Gestion des articles, Éditeur | Carte d'article, page de détail, éditeur (contenu + type de contenu + statut + classification catégorie/zone uniques + tags + image principale/texte alternatif), actions de création/modification/publication/dépublication/suppression |
| `taxonomies`      | Organisation éditoriale (catégories, zones géographiques)   | Catégorie, Zone géographique, Gestion des catégories                            | Pages de listing par taxonomie, formulaire inline de gestion, contrôle de suppression conditionnée (aucun article associé)                           |
| `search`          | Recherche et filtrage documentaire                          | Recherche, Résultats de recherche                                               | Champ de recherche (3 variantes), panneau/ligne de filtres, compteur de résultats en live-region, état vide qualifié                                 |
| `newsletter`      | Newsletter (inscription/désinscription)                     | Newsletter, Désinscription newsletter, bandeau Accueil, bloc fin d'article, Gestion newsletter | Formulaire à un champ (3 emplacements), confirmation in situ, désinscription par jeton (page dédiée sans formulaire), table admin des inscrits avec retrait |
| `contact`         | Canal de contact institutionnel                             | Contact                                                                         | Formulaire multi-champs avec validation à la soumission                                                                                              |
| `admin-auth`      | Sécurisation de l'espace d'administration                   | Connexion administrateur                                                        | Formulaire de connexion, gestion de session, garde d'accès aux routes protégées                                                                      |
| `admin-dashboard` | Espace d'administration des contenus (point d'entrée)       | Dashboard                                                                       | Cartes de comptage statiques, table des derniers articles modifiés                                                                                   |

Le **partage de contenu** et les **breadcrumbs** ne sont pas des features à part entière : ce sont des composants transverses (`components/shared/`) réutilisés par la feature `articles` et par la navigation publique.

---

## Routes publiques

| Route               | Fichier                                  | Rendu                                             | Données                                              |
| ------------------- | ---------------------------------------- | ------------------------------------------------- | ---------------------------------------------------- |
| `/`                 | `app/(public)/page.tsx`                  | Statique, revalidé après publication admin        | À la une, catégories/zones phares, encart newsletter |
| `/articles`         | `app/(public)/articles/page.tsx`         | Statique, revalidé après publication admin        | Liste paginée des articles publiés                   |
| `/articles/[slug]`  | `app/(public)/articles/[slug]/page.tsx`  | Statique, revalidé après publication/modification | Contenu, métadonnées, contenus liés                  |
| `/categorie/[slug]` | `app/(public)/categorie/[slug]/page.tsx` | Statique, revalidé après publication admin        | Articles de la catégorie, filtres secondaires        |
| `/zone/[slug]`      | `app/(public)/zone/[slug]/page.tsx`      | Statique, revalidé après publication admin        | Articles de la zone, filtres secondaires             |
| `/recherche`        | `app/(public)/recherche/page.tsx`        | Dynamique (dépend des paramètres de recherche)    | Route unique, jamais scindée en deux fichiers : formulaire de recherche si aucun paramètre `q`, résultats filtrés selon les paramètres d'URL sinon |
| `/newsletter`       | `app/(public)/newsletter/page.tsx`       | Statique                                          | Formulaire dédié                                     |
| `/newsletter/desinscription` | `app/(public)/newsletter/desinscription/page.tsx` | Dynamique (dépend du jeton de désinscription) | Validation du jeton reçu par e-mail, confirmation neutre ; jamais liée depuis la navigation ou le footer |
| `/a-propos`         | `app/(public)/a-propos/page.tsx`         | Statique                                          | Contenu institutionnel                               |
| `/contact`          | `app/(public)/contact/page.tsx`          | Statique                                          | Formulaire de contact                                |
| `/mentions-legales` | `app/(public)/mentions-legales/page.tsx` | Statique                                          | Contenu légal                                        |
| `/confidentialite`  | `app/(public)/confidentialite/page.tsx`  | Statique                                          | Politique de confidentialité                         |

Toutes les routes publiques sont indexables (cf. §SEO), sauf mention contraire.

## Routes administrateur

| Route                     | Fichier                                           | Protection                                                                     | Rendu                       |
| ------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------- |
| `/admin/connexion`        | `app/admin/connexion/page.tsx`                    | Aucune (accessible sans session ; redirige vers le Dashboard si déjà connecté) | Dynamique                   |
| `/admin/dashboard`        | `app/admin/(protected)/dashboard/page.tsx`        | Session administrateur requise                                                 | Dynamique, non mis en cache |
| `/admin/articles`         | `app/admin/(protected)/articles/page.tsx`         | Session administrateur requise                                                 | Dynamique                   |
| `/admin/articles/nouveau` | `app/admin/(protected)/articles/nouveau/page.tsx` | Session administrateur requise                                                 | Dynamique                   |
| `/admin/articles/[id]`    | `app/admin/(protected)/articles/[id]/page.tsx`    | Session administrateur requise                                                 | Dynamique                   |
| `/admin/categories`       | `app/admin/(protected)/categories/page.tsx`       | Session administrateur requise                                                 | Dynamique                   |
| `/admin/newsletter`       | `app/admin/(protected)/newsletter/page.tsx`       | Session administrateur requise                                                 | Dynamique                   |

Toutes les routes sous `/admin` sont exclues de l'indexation (cf. §SEO) et vérifiées à deux niveaux : une vérification de session en amont des routes protégées, et une seconde vérification dans le layout `app/admin/(protected)/layout.tsx` — la seconde ne se substitue pas à la première, elle protège contre un accès direct qui contournerait la première couche.

---

## Layouts

| Layout                                                           | Portée                  | Responsabilité                                                                                                                                                    |
| ---------------------------------------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/layout.tsx`                                                 | Toutes les pages        | Document HTML, chargement des polices (`font.editorial`, `font.ui`, `font.mono`), landmarks racine                                                                |
| `app/(public)/layout.tsx`                                        | 10 écrans publics       | Navigation principale (desktop/mobile), footer, structure de landmarks `header`/`nav`/`main`/`footer` posée une seule fois                                        |
| `app/admin/connexion` (pas de layout dédié au-delà de la racine) | Écran de connexion      | Mise en page minimale centrée, sans sidebar ni navigation publique                                                                                                |
| `app/admin/(protected)/layout.tsx`                               | 4 écrans post-connexion | Sidebar fixe (Dashboard/Articles/Catégories/Newsletter + "Voir le site ↗"/"Déconnexion"), vérification de session, message d'orientation desktop-only sous 1024px |

Aucun layout n'est partagé entre `(public)` et `admin/` : c'est la traduction directe du principe d'étanchéité de `ui-specification.md`. Seules les primitives de `components/ui/` sont communes aux deux espaces.

---

## Composants partagés

Composants transverses à plusieurs features, sans logique métier propre à un domaine — situés dans `components/shared/` et construits au-dessus des primitives `components/ui/`.

| Composant                                    | Rôle                                                                      | Base shadcn/ui         |
| -------------------------------------------- | ------------------------------------------------------------------------- | ---------------------- |
| `ArticleCard` (variantes grille / liste)     | Carte d'article, ordre de métadonnées Type · Catégorie · Zone · Date      | Card                   |
| `Breadcrumb`                                 | Fil d'Ariane desktop / lien "← Retour" mobile                             | — (composite propre)   |
| `Pagination`                                 | Numérotée (desktop public + admin) et "Charger plus" (mobile public)      | — (composite propre)   |
| `StatusPill`                                 | Statut Brouillon/Publié/Archivé, toujours libellé + couleur               | Badge                  |
| `Tag`                                        | Saisie libre de mots-clés (ajout/suppression), utilisée uniquement dans l'Éditeur d'article — aucune gestion globale des tags | — (composite propre)   |
| `FilterBar` / `FilterPanel`                  | Ligne de pills desktop / panneau bas mobile                               | Sheet + composite Pill |
| `SearchBar`                                  | 3 variantes (header, overlay mobile, page dédiée)                         | Input                  |
| `EmptyState`                                 | État vide qualifié avec action de sortie systématique                     | — (composite propre)   |
| `Toast` / `Alert`                            | Confirmation transitoire / bandeau contextuel, live-region                | Sonner (toast), Alert  |
| `Modal` (confirmation d'action irréversible) | Focus piégé, structure titre/texte/actions fixe                           | Dialog                 |
| `Skeleton`                                   | Squelette de chargement, forme identique au contenu remplacé              | Skeleton               |
| `LiveRegion`                                 | Annonce des compteurs/erreurs/confirmations aux technologies d'assistance | — (composite propre)   |

Les composants sans équivalent direct dans shadcn/ui (Pill, Breadcrumb, ArticleCard, EmptyState, LiveRegion, Tag) sont construits comme composites au-dessus des primitives et des tokens, jamais en modifiant une primitive `components/ui/`.

---

## Composants métier

Composants propres à une seule feature, situés dans `features/<domaine>/` :

- **`articles`** : formulaire d'édition (contenu + statut à 3 segments + classification à choix unique catégorie/zone + tags multi-valués via `Tag` + image principale/texte alternatif), bandeau de sauvegarde/publication, liste des contenus liés, barre de partage (desktop flottante / mobile fixe).
- **`taxonomies`** : formulaire inline de création/modification de catégorie ou zone, ligne de table avec contrôle de suppression conditionnée.
- **`search`** : formulaire de recherche, jeu de filtres combinables, compteur de résultats live.
- **`newsletter`** : formulaire à un champ (décliné dans ses 3 emplacements), écran de désinscription par jeton (`/newsletter/desinscription`, sans formulaire), table admin des inscrits avec retrait.
- **`contact`** : formulaire multi-champs.
- **`admin-auth`** : formulaire de connexion, logique de garde d'accès.
- **`admin-dashboard`** : cartes de comptage, table des derniers articles modifiés.

Un composant métier peut composer des composants partagés (ex. le formulaire de recherche utilise `SearchBar` et `FilterBar`), mais l'inverse n'est jamais vrai : un composant partagé ne dépend d'aucune feature.

---

## Stratégie responsive

- Les breakpoints Tailwind sont redéfinis pour correspondre exactement à la table de `ui-specification.md` (§Responsive) : point de rupture "tablette" à 600px, "desktop" à 1024px — aucun breakpoint par défaut de Tailwind non aligné sur ces valeurs n'est utilisé pour une décision de layout public.
- Développement **mobile-first** (classes sans préfixe = mobile, préfixes appliqués à partir de 600px puis 1024px), conformément à la règle d'implémentation actée dans `ui-specification.md`, même si la conception a été pensée desktop-first en wireframe.
- Chaque arbitrage responsive du tableau `ui-specification.md` (recherche, filtres, fil d'Ariane, pagination, partage, grille "À la une", footer) correspond à une paire de composants ou à un composant à rendu conditionnel par breakpoint — jamais à une fonctionnalité retirée sur un breakpoint.
- Back-office : aucun point de rupture n'est implémenté. Le layout admin est fixe desktop ; en dessous de 1024px, un message d'orientation est affiché à la place du layout — géré en CSS pur (visibilité conditionnelle par media query), sans dépendance à une détection JavaScript de la taille d'écran, pour éviter tout écart entre rendu serveur et client.

---

## Stratégie de gestion d'état

- **Contenu et listes** : aucun état client. Les Server Components récupèrent les données directement ; il n'y a pas de couche de fetching client (pas de bibliothèque de requêtes type client-cache) à dupliquer côté navigateur pour ce qui est déjà rendu par le serveur.
- **Recherche, filtres, tri, pagination** : portés exclusivement par les paramètres d'URL (`searchParams`), jamais par un state React isolé — condition nécessaire à la persistance de contexte exigée par `ui-specification.md` (retour navigateur/breadcrumb avec filtres conservés).
- **Session administrateur** : gérée côté serveur (cookie de session), vérifiée dans le layout protégé et en amont des routes ; jamais reproduite en state client.
- **État d'interface éphémère** (menu mobile ouvert/fermé, overlay recherche, panneau de filtres mobile, modale ouverte) : state local au composant client concerné (`useState`/`useReducer`), jamais remonté à un niveau plus global que nécessaire.
- **Formulaires** : état de soumission et de validation porté par les actions serveur (cf. §Formulaires), pas par un state client parallèle.
- **Aucune bibliothèque de state management globale** (type Redux/Zustand/Jotai) n'est introduite : le périmètre V1 ne présente aucun état partagé complexe qui la justifierait (administrateur unique, aucun compte utilisateur — cf. `scope-v1.md`). Cette décision est à réévaluer uniquement si une version ultérieure introduit des comptes utilisateurs ou des contenus premium nécessitant un état client transverse.
- **Revalidation** : toute mutation administrateur (publication, dépublication, suppression, ajout/modification de catégorie ou de zone, retrait d'un inscrit) déclenche une revalidation ciblée des routes publiques concernées, pour que le contenu public reflète l'état réel sans attendre l'expiration naturelle du cache.

---

## Formulaires

- Chaque formulaire (Newsletter, Contact, Connexion administrateur, Éditeur d'article, Catégories/zones) est adossé à une action serveur dédiée, appelée directement par l'élément `form` — ce qui garantit un fonctionnement de base même sans JavaScript côté client, conformément à l'esprit de robustesse attendu pour un public institutionnel.
- L'état de soumission (en cours / erreur / succès) est porté par le mécanisme d'état d'action de React 19, jamais par un state de chargement géré manuellement en parallèle.
- L'indicateur de chargement inline sur bouton (cf. `ui-specification.md`, §États chargement) est dérivé de l'état de transition du formulaire, sans logique de chargement dupliquée.
- En cas d'échec (validation ou technique), l'action serveur retourne l'état d'erreur et les valeurs soumises ; l'affichage réutilise ces valeurs pour garantir qu'aucune saisie n'est perdue (règle actée en §Formulaires de `ui-specification.md`).
- Le renvoi du focus au premier champ en erreur après soumission refusée est géré par un composant client fin qui observe le résultat de l'action, sans reprendre la logique de validation elle-même.
- L'éditeur d'article n'a pas de sauvegarde automatique silencieuse en V1 (cf. `ui-specification.md`) : "Enregistrer le brouillon" et "Publier" sont deux actions serveur distinctes avec leurs propres règles de validation.

---

## Validation

- Un schéma de validation unique par formulaire fait office de source de vérité, partagé entre l'indication en temps réel côté client (une fois qu'une première erreur a été affichée, cf. règle de revalidation de `ui-specification.md`) et la validation côté serveur, qui reste seule autorité — toute soumission est revalidée côté serveur même si la validation client a été contournée.
- Les types manipulés par les composants et les actions serveur sont dérivés du schéma de validation (pas de définition parallèle du type et de la règle de validation), pour éviter toute divergence entre ce qui est accepté et ce qui est typé.
- Chaque règle de validation porte le message spécifique défini par `ui-specification.md` (ex. "Le titre est requis pour publier") — aucun message générique ("Champ invalide") n'est acceptable au niveau schéma.
- Le statut d'un article (Brouillon/Publié/Archivé) est modélisé comme une union de littéraux fermée, avec une règle conditionnelle : le titre est requis uniquement pour la transition vers "Publié", jamais pour "Enregistrer le brouillon".
- La distinction Catégorie / Zone géographique est modélisée comme deux types de taxonomie distincts (jamais une simple chaîne libre), pour empêcher structurellement leur confusion en amont de tout composant d'affichage.
- Chaque contenu est associé à exactement une catégorie et une zone géographique (relation un-à-un, jamais un tableau), toutes deux obligatoires pour "Publier" ; les tags forment une liste libre multi-valuée et toujours optionnelle, créée exclusivement depuis l'Éditeur d'article (aucune gestion globale des tags en V1).
- Le type de contenu (article/analyse/enquête/interview/dossier thématique) est une union de littéraux fermée, obligatoire pour "Publier" au même titre que le titre.
- L'image principale et son texte alternatif sont deux champs couplés : requis ensemble pour "Publier", optionnels pour "Enregistrer le brouillon" — jamais une image sans texte alternatif dès lors qu'elle est renseignée.

---

## Conventions TypeScript

- Mode strict déjà actif (`tsconfig.json`) — aucune configuration ne doit l'assouplir (`any` interdit, pas de désactivation ponctuelle via commentaire sans justification écrite).
- Statuts, types de contenu, types de taxonomie : toujours des unions de littéraux (`"brouillon" | "publie" | "archive"`), jamais des `enum` ni des chaînes libres — pour rester sérialisables sans friction entre Server et Client Components.
- Les types métier sont dérivés des schémas de validation (`z.infer`-like), colocalisés dans le dossier de la feature concernée (`features/<domaine>`) — pas de fichier de types global fourre-tout au-delà des types réellement transverses (`types/`, ex. pagination générique).
- Tous les imports internes utilisent l'alias `@/*` déjà configuré — aucun import relatif remontant de plusieurs niveaux (`../../../`).
- Les props de composants sont typées explicitement et en lecture seule par défaut ; pas de props optionnelles pour des cas qui ne peuvent pas se produire dans ce périmètre.

---

## Conventions React

- Server Component par défaut pour tout fichier de `app/`, `components/shared/` et `features/*/components/` ; la directive client n'est ajoutée qu'au composant le plus bas possible dans l'arbre qui a réellement besoin d'état, d'un effet ou d'une API navigateur.
- Aucune récupération de données dans un Client Component quand un Server Component parent peut la faire et transmettre le résultat en props.
- Un composant par fichier, nom de fichier identique au composant exporté, export nommé par défaut (les fichiers spéciaux de routage — `page.tsx`, `layout.tsx`, etc. — conservent l'export par défaut requis par la convention Next.js).
- Composition par `children`/slots plutôt que prop-drilling profond dès qu'un composant partagé encapsule une mise en page (ex. `Modal`, layouts).
- Une frontière `Suspense` par section à chargement indépendant, alignée sur la granularité des squelettes définie dans `ui-specification.md` (une grille de cartes, une table, les compteurs du Dashboard) — jamais une frontière unique englobant toute une page.
- Pas de `useEffect` pour un besoin couvert nativement par un Server Component, une action serveur, ou un état dérivé au rendu.

---

## Conventions Tailwind

- Les design tokens de `ui-specification.md` (couleurs, échelle typographique, échelle d'espacement 4/8/12/16/24/32/48/64/96, rayons, durées de transition, breakpoints) sont déclarés une seule fois dans `app/globals.css` via la configuration CSS-first de Tailwind v4, et exposés comme vocabulaire d'utilitaires (ex. classes correspondant à `color.bg.primary`, `color.accent.primary`, `radius.sm`, `radius.pill`).
- Aucune valeur arbitraire (`[...]`) n'est utilisée pour une propriété déjà couverte par un token — couleur, espacement, rayon, durée. Une valeur arbitraire ne peut se justifier que pour un cas réellement hors du système documenté, ce qui doit rester exceptionnel et visible en revue.
- Préfixes responsives toujours utilisés dans l'ordre mobile-first, jamais en préfixant une règle desktop puis en la retirant pour mobile.
- Pas d'usage de `@apply` pour construire des styles de composants (la réutilisation passe par les composants partagés eux-mêmes) ; `@apply` reste réservé aux resets de base dans `globals.css`.
- Un ordre de classes cohérent est appliqué automatiquement (formatage outillé), pour que la lecture d'un `className` long reste prévisible d'un composant à l'autre.

---

## Conventions shadcn/ui

- Les composants shadcn/ui sont installés comme code source possédé par le projet (`components/ui/`), pas comme dépendance externe opaque — ils peuvent être lus et ajustés, mais leur comportement d'accessibilité sous-jacent (gestion du focus, rôles ARIA, piégeage de focus des modales/menus) n'est jamais retiré ni contourné.
- Seuls les primitives réellement nécessaires à `ui-specification.md` sont installées (Button, Input, Textarea, Select, Checkbox, RadioGroup, Dialog, composant de toast, Badge, Card) — pas d'installation anticipée de primitives non utilisées par le périmètre V1.
- La personnalisation d'une primitive se limite à l'alignement visuel sur les tokens du design system (couleur, rayon, typographie, espacement) — jamais à une modification de son comportement interactif.
- Tout composant présent dans `ui-specification.md` sans équivalent direct dans shadcn/ui (Pill, StatusPill, ArticleCard, Breadcrumb, EmptyState, Tag) est construit comme composite dans `components/shared/` ou `features/*/components/`, au-dessus des primitives existantes, jamais en dérivant une nouvelle primitive dans `components/ui/`.

---

## Accessibilité

Traduction en responsabilités frontend des exigences de `ui-specification.md` (§Accessibilité) :

- La structure de landmarks (`header`, `nav`, `main`, `footer`) est posée une seule fois par layout (`(public)/layout.tsx`, `admin/(protected)/layout.tsx`) et jamais redéfinie au niveau des pages.
- Un seul `h1` par gabarit de page, hiérarchie de titres sans saut de niveau — vérifié par gabarit, pas seulement par écran individuel.
- Le piégeage de focus des modales et du menu mobile s'appuie sur les primitives shadcn/ui sous-jacentes (Dialog, Sheet) plutôt que sur une réimplémentation manuelle.
- Les live-regions (compteur de résultats, confirmations toast/alert, erreurs globales) sont centralisées dans un composant `LiveRegion` unique réutilisé par toutes les features concernées, pour garantir un comportement homogène d'annonce aux technologies d'assistance.
- Le focus est explicitement renvoyé en tête de page à chaque navigation entre pages publiques, et au premier champ en erreur après une soumission de formulaire refusée.
- Les cibles tactiles ≥ 44×44px et le contraste des paires texte/fond sont des critères de revue de chaque composant partagé avant sa réutilisation, pas seulement de l'écran final.

---

## Performance

- Toute image éditoriale utilise le composant d'image optimisée de Next.js, avec le ratio fixe défini par composant (16:9 carte grille, 4:3 carte liste, 1:1 avatar) — jamais une balise image brute pour du contenu éditorial.
- Les trois rôles typographiques (`font.editorial`, `font.ui`, `font.mono`) sont chargés via l'optimisation de polices de Next.js, avec les polices auto-hébergées pour éviter tout saut de mise en page (CLS) et toute dépendance à un tiers externe au chargement.
- Les Server Components limitent au minimum le JavaScript expédié au navigateur ; le budget de JavaScript client est concentré sur les îlots interactifs listés en §Architecture frontend, pas sur les pages de contenu elles-mêmes.
- Les pages de contenu public sont rendues statiquement et revalidées après action de mutation administrateur (cf. §Gestion d'état) plutôt que recalculées à chaque requête ; les pages administrateur post-connexion restent dynamiques et non mises en cache, par nature de leur contenu (toujours à jour, jamais partagé publiquement).
- Le chargement de chaque section asynchrone (grille de cartes, table, compteurs du Dashboard) est englobé dans sa propre frontière de streaming, affichant le squelette correspondant sans bloquer le reste de la page ni provoquer de saut de mise en page à l'arrivée du contenu réel.
- Aucune bibliothèque de fetching ou de cache client n'est ajoutée pour dupliquer une capacité déjà couverte par les Server Components (cf. §Gestion d'état) — un budget de dépendances client volontairement réduit.

---

## SEO

- Chaque route publique définit ses métadonnées (titre, description, image, URL canonique) via le mécanisme de métadonnées de Next.js, au niveau du gabarit de page concerné — jamais une valeur par défaut générique laissée telle quelle en production.
- Les données structurées adaptées à chaque type de contenu (article éditorial, fil d'Ariane, organisation éditrice) sont générées côté serveur pour chaque gabarit concerné, en cohérence avec les métadonnées déjà exposées à l'écran (titre, auteur, date, catégorie, zone).
- Le plan de site (sitemap) est généré dynamiquement à partir des seuls contenus publiés (jamais les brouillons ni les contenus archivés), de même pour les pages de catégorie et de zone géographique.
- Toutes les routes sous `/admin` sont explicitement exclues de l'indexation (balise de non-indexation + exclusion du fichier `robots`), conformément à leur nature d'espace de gestion strictement réservé.
- Les identifiants d'URL (slugs) des articles, catégories et zones géographiques sont lisibles et stables, condition du positionnement de référence documentaire recherché par le produit.
- La hiérarchie sémantique de titres définie en §Accessibilité sert directement l'indexation : elle n'est pas dupliquée ni contredite par une structure différente à des fins purement visuelles.

---

## Checklist de conformité Frontend (architecture)

À vérifier avant toute mise en production d'une route ou d'un composant, en complément de la checklist de `ui-specification.md` (qui reste la référence pour la conformité visuelle et comportementale) :

- [ ] La route est placée dans le bon segment (`(public)` ou `admin/(protected)`/`admin/connexion`), sans layout ni composant partagé entre les deux espaces au-delà des primitives `components/ui/`.
- [ ] Aucun Client Component ne récupère de données qu'un Server Component parent pourrait transmettre en props.
- [ ] L'état de recherche/filtres/tri/pagination est porté par les paramètres d'URL, pas par un state React isolé.
- [ ] Le formulaire concerné repose sur une action serveur, revalide côté serveur indépendamment de toute validation client, et conserve la saisie utilisateur en cas d'erreur.
- [ ] Le composant nouvellement créé existe déjà dans `components/ui/` (primitive), `components/shared/` (composite transverse) ou `features/<domaine>/` (métier) avant d'envisager sa duplication.
- [ ] Aucune valeur de couleur, d'espacement, de rayon ou de durée n'est écrite en valeur arbitraire alors qu'un token existe pour ce cas.
- [ ] Toute mutation administrateur déclenche la revalidation des routes publiques concernées.
- [ ] Les routes sous `/admin` sont exclues de l'indexation et protégées par une vérification de session à deux niveaux (route + layout).
- [ ] Chaque route publique expose des métadonnées et des données structurées spécifiques, pas une valeur par défaut.
- [ ] Toute image éditoriale utilise le composant d'image optimisée avec le ratio attendu ; aucune balise image brute pour du contenu éditorial.

---

_Ce document est la référence unique pour l'architecture et l'organisation du code frontend du MVP. Il se lit conjointement avec `ui-specification.md` (référence visuelle et comportementale) et `scope-v1.md` (référence de périmètre fonctionnel). Toute évolution du produit doit être reportée ici avant implémentation._
