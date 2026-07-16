# Security Specification — MVP

**Statut** : spécification exhaustive des exigences de sécurité applicative du MVP, dérivée de l'intégralité du corpus gelé — `discovery.md`, `requirements.md`, `user-stories.md`, `scope-v1.md`, `domain-model.md`, `sitemap.md`, `ui-specification.md`, `frontend-specification.md`, `technical-architecture.md`, `development-tasks.md`, `database-schema.md`, `api-contracts.md`, `server-actions-specification.md`, `prisma-schema-specification.md`, `prisma-config-specification.md`, `sql-migration-specification.md`, `implementation-roadmap.md`. Ce document ne redéfinit aucun besoin métier, n'introduit aucune fonctionnalité, aucun rôle supplémentaire, aucun système RBAC, aucun fournisseur OAuth, aucune authentification multi-facteurs (MFA) et aucun workflow de validation éditoriale — le domaine ne prévoit qu'un **acteur unique de gestion** (`domain-model.md`, « Acteur unique de gestion ») et ce document en tire les conséquences de sécurité sans en élargir le périmètre.

Toute affirmation ci-dessous est reliée à sa source. Lorsqu'un point n'est explicitement tranché par aucun document source, il est signalé comme **point d'arbitrage** plutôt que résolu par une règle inventée. Une partie des recommandations relève du jugement d'architecte (rôle explicitement demandé pour ce document) plutôt que d'une citation directe du corpus métier ; ces recommandations sont marquées comme telles, jamais présentées comme déjà actées si elles ne le sont pas.

Aucun code n'est produit dans ce document — uniquement des exigences, des règles et des points de vigilance.

---

## 1. Modèle de menace du projet

### 1.1 Acteurs

| Acteur | Nature | Source |
|---|---|---|
| Administrateur unique | Acteur légitime authentifié, seul responsable de la rédaction, de la publication et de la gestion intégrale du site | `domain-model.md` (« Acteur unique de gestion »), `discovery.md` §3 |
| Visiteur public (grand public, diaspora) | Anonyme, aucune identification, consultation et partage libres | `domain-model.md`, `requirements.md` §1.2 (« La consultation des contenus publics ne doit pas nécessiter de création de compte ») |
| Visiteur professionnel/institutionnel (organisations internationales, chercheurs, juristes, journalistes) | Anonyme au même titre que le grand public — aucune distinction d'accès entre les deux publics en V1 | `discovery.md` §5 |
| Inscrit Newsletter | Identifié uniquement par une adresse e-mail, sans authentification ni compte | `domain-model.md` |
| Attaquant non authentifié, sans intention ciblée | Exploitation opportuniste de toute surface publique (formulaires, recherche, lien de désinscription) | Déduit des surfaces d'attaque (§1.2) |
| Attaquant ciblant spécifiquement le Compte Administrateur | Motivé par la nature sensible des contenus (sujets géopolitiques, institutionnels, juridiques) ; objectif : altérer, supprimer ou usurper le contrôle éditorial | `discovery.md` §7 (« Sujet sensible et géopolitique »), §8 (risques « Sensibilité géopolitique des contenus », « Dépendance à une seule personne ») |

Aucun acteur « rédacteur », « modérateur » ou « rôle intermédiaire » n'existe ni ne doit être introduit par ce document — cohérent avec `domain-model.md` (« aucune notion de rôle, de permission différenciée ou de délégation n'existe »).

### 1.2 Surfaces d'attaque

| Surface | Description | Source |
|---|---|---|
| Formulaires publics | Newsletter (inscription/réactivation), Contact, Recherche (paramètres d'URL `q`/`categorie`/`zone`/`type`/`date`) | `api-contracts.md` §1.7, §4, §5 ; `server-actions-specification.md` §6, §9, §10 |
| Connexion administrateur | Point d'entrée unique vers l'espace de gestion | `api-contracts.md` §2.1 ; `sitemap.md` |
| Routes protégées `/admin/(protected)/*` | Dashboard, Gestion des articles, Gestion des catégories, Gestion newsletter | `technical-architecture.md` §2.2 ; `frontend-specification.md` §Routes administrateur |
| Lien de désinscription à jeton | URL publique non authentifiée, traite une mutation d'état (`statut → desinscrit`) sur simple présentation d'un paramètre | `api-contracts.md` §4.3 ; `server-actions-specification.md` §6.2 |
| Couche de données (Supabase PostgreSQL) | Base accessible par deux chemins distincts : l'application (Prisma) et l'API PostgREST/Data API auto-générée par Supabase, **indépendante du code applicatif** | `prisma-schema-specification.md` §14 ; `prisma-config-specification.md` §6 |
| Migrations SQL manuelles | Fonctions/triggers PL/pgSQL ajoutés à la main après le diff Prisma, hors du langage déclaratif validé | `sql-migration-specification.md` §9-§10 |
| Server Actions (mutations) | Points d'entrée serveur invoqués directement par les formulaires, potentiellement atteignables indépendamment de la page qui les affiche | `technical-architecture.md` §1.1 ; `server-actions-specification.md` (chaque opération) |

### 1.3 Actifs à protéger

| Actif | Nature | Source |
|---|---|---|
| `administrateur.mot_de_passe_hash` | Secret d'authentification | `database-schema.md` §4.3 |
| `session_administrateur.jeton_hash` | Secret de session | `database-schema.md` §4.4 |
| `inscrit_newsletter.jeton_desinscription` | Jeton d'action à usage unique, non authentifié | `database-schema.md` §4.7 |
| Adresses e-mail des Inscrits Newsletter | Donnée personnelle | `requirements.md` §2.1 |
| Intégrité des Contenus éditoriaux publiés | Contenu de référence documentaire, cible de contestation possible | `requirements.md` §2.1 (« garantir l'intégrité des contenus publiés, en empêchant toute modification ou accès non autorisé ») ; `discovery.md` §8 |
| Confidentialité des Contenus au statut Brouillon | Jamais visibles hors administration (invariant) | `domain-model.md`, Invariants métier |
| Disponibilité et crédibilité du site | Positionnement de référence documentaire | `discovery.md` §6, §9 |
| Session administrateur active | Contrôle total du site en cas de compromission (acteur unique, tous droits) | `domain-model.md` |

---

## 2. Authentification administrateur

- **Mécanisme unique** : une seule modalité d'authentification dans tout le domaine — la Session administrateur ; aucune notion de compte visiteur (`api-contracts.md` §1.3, `domain-model.md`).
- **Gestion de session** : portée par la table `session_administrateur` (`id`, `administrateur_id`, `jeton_hash`, `derniere_activite_at`, `created_at` — `database-schema.md` §4.4). `adminLogin` insère une nouvelle ligne à chaque connexion réussie ; `derniere_activite_at` est mise à jour à chaque requête valide vers une route protégée (`server-actions-specification.md` §1.1, §1.3).
- **Vérification à deux niveaux** : en amont des routes `/admin/(protected)/*` et redondante dans le layout protégé — la seconde couche protège spécifiquement contre un accès direct qui contournerait la première (`technical-architecture.md` §4.3, `frontend-specification.md` §Routes administrateur). Ce double contrôle doit s'appliquer à **chaque** opération administrateur (cf. §3), pas seulement à la navigation entre pages.
- **Cookies** : cookie serveur **httpOnly**, signé (`technical-architecture.md` §1.2, §4.3). **Point d'arbitrage** : aucun document ne fixe explicitement les attributs `Secure` et `SameSite` du cookie. Recommandation d'architecte (non sourcée dans le corpus) : `Secure` (HTTPS obligatoire, cohérent avec l'hébergement Vercel recommandé — `technical-architecture.md` §8 point 2) et `SameSite=Lax` a minima, à valider contre la version exacte de Next.js 16 installée (`frontend/AGENTS.md` : vérifier `node_modules/next/dist/docs` avant implémentation).
- **Rotation** : le jeton de session est comparé sous forme hachée (`jeton_hash`, `database-schema.md` §4.4), ce qui protège sa valeur en cas d'exfiltration de la base. **Point d'arbitrage** : aucun document ne spécifie de rotation du jeton en cours de session (ex. régénération périodique, ou à la reconnexion après une précédente déconnexion) — seule la création d'une nouvelle ligne à chaque `adminLogin` est actée (`server-actions-specification.md` §1.1) ; l'invalidation d'anciennes sessions concurrentes à une nouvelle connexion n'est pas non plus spécifiée.
- **Expiration** : automatique après une période d'inactivité (DR-002, `domain-model.md`), durée **non fixée par les documents métier** — point d'arbitrage déjà identifié par `technical-architecture.md` §8 point 5 et repris par `implementation-roadmap.md` (Phase 4), à trancher en configuration (variable d'environnement), jamais en valeur codée en dur.
- **Déconnexion** : `adminLogout` supprime la ligne `session_administrateur` correspondante ; action immédiate, réversible par reconnexion, sans confirmation préalable (`domain-model.md`, `server-actions-specification.md` §1.2).
- **Récupération d'accès** : hors produit — aucun endpoint applicatif ; procédure opérationnelle manuelle contre la base (`domain-model.md`, `technical-architecture.md` §8 point 7). Ce script manuel constitue lui-même une surface sensible (accès direct à la base de production) à restreindre au strict nécessaire opérationnel — cf. §11.

---

## 3. Autorisation

- **Administrateur unique, garanti au niveau base de données** : le trigger `fn_administrateur_unique`/`trg_administrateur_unique` empêche l'insertion d'une deuxième ligne `administrateur`, quelle que soit la voie d'écriture utilisée (`database-schema.md` §6, `sql-migration-specification.md` §4) — garde-fou structurel contre toute création non prévue d'un second compte, y compris par contournement applicatif.
- **Modèle d'autorisation strictement binaire** : chaque opération est soit **publique**, soit **administrateur** — aucune granularité de rôle, de permission différenciée ou de portée d'accès (`api-contracts.md` §1.4, `domain-model.md` : « Acteur unique de gestion »). Ce document n'introduit et ne doit jamais faire introduire de système RBAC, de rôle intermédiaire ou de délégation : toute évolution en ce sens sort du domaine actuellement modélisé.
- **Protection des Server Actions** : `server-actions-specification.md` attribue à **chaque** opération un champ obligatoire « Permission requise » (champ #3 du gabarit à 11 champs) — par construction, aucune Server Action ne doit se fier à l'interface (bouton masqué, route non liée dans la navigation) pour restreindre son exécution : la vérification de session doit être effectuée **à l'intérieur de la Server Action elle-même**, au moment de l'exécution, indépendamment de la page depuis laquelle elle a été invoquée. C'est une conséquence directe du modèle d'architecture Next.js retenu (`technical-architecture.md` §1.1) : une Server Action est un point d'entrée serveur propre, pas un simple gestionnaire d'événement d'interface.
- **Protection des Server Components (lecture)** : de la même manière, chaque opération de lecture porte sa propre « Permission requise » (`getDashboardData`, `listArticles`, `listCategories`/`listZones`, `listSubscribers` → Administrateur ; `getHomePageData`, `listPublishedArticles`, `getArticleDetail`, `getCategoryPage`, `getZonePage`, `searchContent` → Publique — `server-actions-specification.md` §2 à §11). La vérification de session dans le layout protégé (§2) constitue une première barrière, mais chaque fonction de lecture réservée à l'administrateur doit elle-même refuser de retourner des données hors d'un contexte de session valide, cohérent avec la garde « à deux niveaux » déjà actée (`frontend-specification.md`).
- **Branchement par statut, jamais un contrôle d'autorisation générique** : l'accès à un Contenu éditorial par son `slug` applique un branchement dédié (Introuvable/Brouillon → non exposé ; Publié → indexable ; Archivé → accessible en direct, exclu des surfaces de découverte — DR-001, `technical-architecture.md` §4.2) qui n'est **pas** un mécanisme d'autorisation par rôle : c'est une règle de visibilité par statut, à ne jamais confondre avec ni remplacer par un contrôle de permission. Ce branchement doit rester unique et centralisé dans le repository (`technical-architecture.md` §4.2) — toute duplication future de cette logique (ex. lors d'un refactor) est un risque de sécurité fonctionnelle déjà signalé comme risque technique (`technical-architecture.md` §9, `implementation-roadmap.md` Phase 1).
- **Hors périmètre, à ne jamais introduire** : rôles multiples, permissions différenciées, délégation, MFA, fournisseur OAuth tiers, workflow d'approbation éditoriale — aucun n'est requis par le corpus métier (`domain-model.md`, `scope-v1.md` « Hors périmètre »), et leur introduction constituerait un nouveau besoin métier non demandé.

---

## 4. Protection des données sensibles

| Donnée | Traitement requis | Source |
|---|---|---|
| `administrateur.mot_de_passe_hash` | Haché (bcrypt recommandé, `technical-architecture.md` §8 point 4), jamais stocké ni transmis en clair, jamais retourné par une opération de lecture — aucune opération de `server-actions-specification.md` n'expose un champ de la table `administrateur` en sortie | `database-schema.md` §4.3, `server-actions-specification.md` (absence confirmée sur l'ensemble des 27 opérations) |
| `session_administrateur.jeton_hash` | Stocké sous forme hachée, jamais en clair en base ; seule sa forme brute (le cookie lui-même) transite, jamais affichée ni journalisée | `database-schema.md` §4.4 |
| `inscrit_newsletter.jeton_desinscription` | Stocké en clair en base (colonne `TEXT`, non suffixée `_hash` — nécessaire à la recherche directe par valeur depuis l'URL, `api-contracts.md` §4.3) ; sa protection repose donc entièrement sur son entropie (génération cryptographiquement aléatoire, non déductible de l'e-mail ou d'un identifiant séquentiel) et sur son caractère à usage unique — à traiter comme un secret porteur d'action (capacité de désinscrire l'adresse concernée) malgré son stockage en clair | `database-schema.md` §4.7 ; déduction directe du choix de nommage/type de colonne |
| Adresses e-mail des Inscrits Newsletter | Donnée personnelle (`requirements.md` §2.1) ; `listSubscribers` (administrateur uniquement) ne retourne que les inscrits au statut `inscrit` — jamais les adresses désinscrites (`server-actions-specification.md` §8.1) ; aucune opération publique ne retourne l'adresse d'un tiers | `requirements.md` §2.1, `server-actions-specification.md` §8.1 |
| Message de contact (`nom`, `email`, `sujet`, `message`) | Aucune persistance en base — transmis uniquement par notification e-mail à l'administrateur (`api-contracts.md` §5, `server-actions-specification.md` §10.1) ; ce choix élimine par construction le risque de fuite d'un historique stocké | `database-schema.md` (aucun écran de consultation documenté), `technical-architecture.md` §3.1 |

**Principe transverse** : aucune de ces données ne doit apparaître dans un message d'erreur retourné au client (`api-contracts.md` §1.1-§1.2 — les quatre catégories d'erreur ne renvoient jamais le détail d'une exception non structurée), ni dans un journal applicatif (cf. §13).

---

## 5. Validation des entrées

- **Un schéma Zod unique par formulaire/contrat**, partagé entre l'indication temps réel côté client et la validation serveur — **le serveur reste seule autorité** (`api-contracts.md` §1.5, `frontend-specification.md` §Validation) : toute soumission est revalidée côté serveur même si la validation client a été contournée (contournement du JavaScript, appel direct à l'action serveur, extension navigateur modifiant le DOM).
- **Principe de validation unique** : aucune règle de validation dupliquée entre plusieurs schémas pour un même formulaire — les types manipulés sont dérivés du schéma, jamais définis en parallèle (`frontend-specification.md` §Conventions TypeScript), ce qui élimine le risque de divergence entre ce qu'accepte le typage et ce que vérifie réellement la validation.
- **Types fermés** : statuts, types de contenu et taxonomies sont des unions de littéraux fermées (`"brouillon" | "publie" | "archive"`, etc.), jamais des chaînes libres côté application, en cohérence avec les types `ENUM` PostgreSQL réels (`type_contenu`, `statut_contenu` — `database-schema.md` §3) — une valeur hors énumération est rejetée à la fois par la validation applicative et par la base.
- **Gestion des erreurs** : quatre catégories strictes (Validation, Permission, Conflit métier, Technique — `api-contracts.md` §1.2), chacune avec un traitement défini ; aucune catégorie ne renvoie de trace technique brute (stack trace, message d'exception SQL) au client — seul un message générique fixe (« Une erreur est survenue, veuillez réessayer ») est renvoyé pour la catégorie Technique, avec conservation de la saisie utilisateur (`api-contracts.md` §1.2).

---

## 6. Protection CSRF

Le corpus métier ne traite pas explicitement la protection CSRF. Analyse d'architecte (recommandation, non sourcée directement) : l'architecture déjà actée — chaque formulaire est « adossé à une action serveur dédiée, appelée directement par l'élément `form` » (`frontend-specification.md` §Formulaires), jamais par un appel `fetch` client vers une route mutable exposée séparément (`api-contracts.md`, note de lecture : « invoquées directement par un `form`, jamais par un appel `fetch` côté client ») — correspond exactement au modèle que les Server Actions de Next.js protègent nativement par une vérification d'origine (`Origin`/`Host`) sur les requêtes de mutation. **Point d'arbitrage/à vérifier** : cette garantie dépend du comportement exact de la version de Next.js 16 effectivement installée — à confirmer contre la documentation embarquée (`node_modules/next/dist/docs`), conformément à l'avertissement déjà présent dans `frontend-specification.md` §Prérequis techniques et `frontend/AGENTS.md` (« cette version a des changements cassants »). Aucun jeton CSRF applicatif distinct n'est requis tant que ce modèle (formulaire → Server Action directe, jamais de mutation via une route JSON exposée séparément) est strictement respecté — un écart futur vers un appel `fetch` client pour une mutation romprait cette garantie et devrait réintroduire une protection explicite.

---

## 7. Protection XSS

- **Échappement par défaut** : React/Next.js échappent toute valeur interpolée en JSX par défaut — base de protection contre l'injection de script tant qu'aucun rendu HTML brut (`dangerouslySetInnerHTML` ou équivalent) n'est introduit. Aucun document ne mentionne l'usage d'un tel mécanisme pour un champ quelconque du domaine.
- **Champs textuels du Contenu éditorial** (`titre`, `chapo`, `auteur`, `sources`, mots-clés) : tous des colonnes `TEXT` simples (`database-schema.md` §4.5-§4.6), sans format enrichi documenté — rendu en texte échappé par défaut, sans risque XSS supplémentaire tant qu'aucun format HTML/Markdown n'est introduit pour ces champs.
- **Point d'arbitrage — format du Corps de texte** : aucun document (`ui-specification.md`, `frontend-specification.md`, `database-schema.md`) ne précise si le Corps de texte (`contenu_editorial.corps`, colonne `TEXT`) est saisi en texte brut, en Markdown, ou via un éditeur enrichi produisant du HTML. Tant qu'aucun rendu HTML brut n'est introduit pour ce champ, le risque XSS reste nul par défaut (échappement JSX). **Si un format enrichi est retenu**, un assainissement (sanitization) explicite du HTML produit devient une exigence de sécurité obligatoire avant tout rendu public — décision à trancher avant l'implémentation de l'Éditeur d'article (`implementation-roadmap.md` Phase 5), pas après.
- **`image_alt_text`** : texte libre affiché en attribut HTML (`alt`) — échappement natif du rendu d'attribut JSX, aucun risque d'injection de script par ce vecteur.

---

## 8. Protection Injection SQL

- **Prisma comme couche d'accès unique** : `technical-architecture.md` §8 point 1 et §3.2 imposent une couche de repository unique par entité, sans requête SQL dupliquée ni accès direct au client Prisma en dehors de cette couche — les requêtes générées par Prisma sont paramétrées par construction, ce qui élimine l'injection SQL classique sur l'ensemble des opérations CRUD standard.
- **Fonctions PL/pgSQL manuelles** : les 5 fonctions ajoutées manuellement (`sql-migration-specification.md` §4) manipulent des paramètres typés (`p_contenu_id UUID`) ou des colonnes fixes, sans concaténation de chaîne dynamique construite à partir d'une entrée utilisateur — aucun vecteur d'injection identifié dans leur définition actée (`technical-architecture.md` §6, `sql-migration-specification.md`).
- **Point d'arbitrage — construction de la requête `to_tsquery`** : `technical-architecture.md` §4.6 et `server-actions-specification.md` §9.1 spécifient littéralement `to_tsquery('french', q)` sur le texte libre `q` fourni par le visiteur. `to_tsquery` interprète nativement une syntaxe d'opérateurs (`&`, `|`, `!`, `<->`, guillemets) : un texte utilisateur non maîtrisé peut provoquer une erreur de syntaxe ou un comportement de requête non prévu (distinct d'une injection SQL classique si `q` est passé en paramètre lié via Prisma, mais constituant un vecteur de déni de service applicatif localisé si non traité). Aucun document ne tranche l'usage d'une fonction plus tolérante (`plainto_tsquery`/`websearch_to_tsquery`) ou d'un échappement préalable des opérateurs — à arbitrer avant la Phase 2 (`implementation-roadmap.md`).
- **Tri dynamique de `listArticles`** : le tri (`date` ou `statut`, sens ascendant/descendant — `server-actions-specification.md` §3.8) doit être résolu via une liste fermée de colonnes autorisées côté serveur (cohérent avec le typage en union fermée déjà acté, §5), jamais par interpolation directe d'un nom de colonne fourni par le client — principe déjà couvert par le typage Zod (§5), rappelé ici comme vecteur d'injection potentiel s'il était contourné.
- **Migrations manuelles** : toute modification future des blocs SQL manuels doit continuer à proscrire la concaténation de valeurs utilisateur dans une requête dynamique (`EXECUTE format(...)` ou équivalent) — aucun document n'introduit un tel besoin aujourd'hui, ce principe est préventif.

---

## 9. Protection contre l'énumération

| Surface | Comportement requis | Source |
|---|---|---|
| Connexion administrateur | Message générique unique « Identifiant ou mot de passe incorrect », sans jamais désigner lequel des deux champs est en cause — empêche de déterminer si l'identifiant existe | `ui-specification.md` (§Formulaires, §Parcours), `server-actions-specification.md` §1.1, `api-contracts.md` §2.1 |
| Newsletter (inscription) | Une adresse déjà inscrite reçoit la même confirmation neutre qu'une nouvelle inscription — un attaquant ne peut pas déterminer si une adresse est déjà inscrite en observant la réponse | US-019, `ui-specification.md`, `api-contracts.md` §4.1 |
| Désinscription par jeton | Jeton valide, déjà utilisé, invalide ou expiré → **exactement** la même confirmation neutre dans tous les cas, jamais un message distinctif | US-020, `api-contracts.md` §4.3, `server-actions-specification.md` §6.2 |

**Point d'arbitrage — attaque temporelle sur la Connexion** : aucun document ne traite du temps de réponse de `adminLogin` selon que l'identifiant existe ou non. Pour ne pas réintroduire un canal d'énumération par la mesure du temps de réponse (un identifiant inexistant pouvant répondre plus vite qu'un identifiant existant si la comparaison de hachage n'est effectuée que dans le second cas), une comparaison de temps constant (ou une comparaison de hachage systématique même en l'absence de correspondance) est recommandée — recommandation d'architecte, non sourcée explicitement, cohérente avec le principe déjà acté de ne jamais désigner le champ fautif.

---

## 10. Protection contre le brute force

**Aucun document source ne spécifie de mécanisme de limitation du nombre de tentatives** (rate limiting, verrouillage progressif, CAPTCHA, délai croissant) pour la Connexion administrateur, le formulaire Newsletter ou le formulaire Contact — absence totale, vérifiée par relecture de `ui-specification.md`, `frontend-specification.md`, `api-contracts.md` et `server-actions-specification.md`, pas seulement un paramètre non chiffré.

Ceci constitue le point d'arbitrage le plus significatif de ce document, au regard de `requirements.md` §2.1 (« Les accès réservés... doivent être protégés par un mécanisme d'authentification fiable ») et des risques déjà identifiés par `discovery.md` §8 (dépendance à un administrateur unique, sensibilité géopolitique des contenus — un compte administrateur compromis équivaut à une compromission totale du site, cf. §1.3) :

| Surface | Risque en l'absence de limitation | Point d'arbitrage |
|---|---|---|
| Connexion administrateur | Attaque par force brute ou par dictionnaire sur l'unique compte existant, sans ralentissement ni blocage | Mécanisme et seuil (nombre de tentatives, fenêtre de temps, stratégie de blocage — par compte, par IP, ou combinée) non spécifiés — à trancher avant la Phase 4 (`implementation-roadmap.md`), sans qu'aucune valeur ne soit préjugée ici |
| Formulaire Newsletter | Abus automatisé (inscription massive, épuisement de la table `inscrit_newsletter`, utilisation comme oracle d'énumération malgré la réponse neutre de §9 si la fréquence de requêtes n'est pas limitée) | Aucun mécanisme anti-abus (limitation de fréquence, honeypot, CAPTCHA) spécifié |
| Formulaire Contact | Abus automatisé du canal de notification e-mail vers l'administrateur (spam, saturation) | Aucun mécanisme anti-abus spécifié ; risque direct sur `technical-architecture.md` §8 point 9 (service transactionnel, coût/quota par envoi) |

Ce document ne tranche délibérément aucun de ces mécanismes ni leurs seuils, conformément à la consigne de signaler un point d'arbitrage plutôt que d'inventer une règle non sourcée.

---

## 11. Gestion des secrets

| Secret | Rôle | Règle | Source |
|---|---|---|---|
| `DIRECT_URL` | Connexion PostgreSQL directe, migrations | Variable d'environnement, jamais commitée | `prisma-config-specification.md` §2 |
| `DATABASE_URL` | Connexion PostgreSQL poolée, trafic applicatif | Variable d'environnement, jamais commitée ; jamais utilisée pour les migrations (règle stricte, §12) | `prisma-config-specification.md` §2 |
| `SHADOW_DATABASE_URL` | Base fantôme de développement (conditionnelle) | Variable d'environnement si l'option retenue en `prisma-config-specification.md` §4 l'exige | `prisma-config-specification.md` §2 |
| Clé de signature du cookie de session | Signature du cookie httpOnly (`technical-architecture.md` §1.2) | **Point d'arbitrage** : aucun document ne nomme explicitement une variable d'environnement dédiée — à créer, jamais codée en dur, distincte des chaînes de connexion Supabase | Déduction de `technical-architecture.md` §1.2 (« cookie httpOnly signé ») |
| Hash bcrypt du mot de passe administrateur | Authentification | Généré une seule fois lors de la création manuelle du Compte Administrateur (aucun écran de création applicatif) ; jamais transmis en clair, jamais journalisé | `technical-architecture.md` §8 point 4, `implementation-roadmap.md` Phase 0A |
| Clé API du service transactionnel (Resend recommandé) | Envoi de la notification de contact | Variable d'environnement, jamais commitée | `technical-architecture.md` §8 point 9 |
| Identifiants du stockage objet (Cloudflare R2 recommandé) | Upload de l'image principale | Variables d'environnement, jamais commitées | `technical-architecture.md` §8 point 3 |

**Principes transverses** :

- `prisma.config.ts` ne référence les secrets que par `env(...)`, jamais en valeur littérale (`prisma-config-specification.md` §1) — chargement explicite via `dotenv` requis en Prisma 7 (`prisma-config-specification.md` §1, §7).
- Aucun fichier `.env` ne doit être versionné — corollaire direct de « jamais commitées », déjà acté pour `DIRECT_URL`/`DATABASE_URL` par `prisma-config-specification.md`/`implementation-roadmap.md`, étendu ici à l'ensemble des secrets du tableau ci-dessus.
- Le script de réinitialisation manuelle du mot de passe administrateur (`technical-architecture.md` §8 point 7) s'exécute directement contre la base de production — son accès (qui peut l'exécuter, depuis quel poste) est une procédure opérationnelle hors produit, à documenter séparément, mais reste une surface sensible de gestion des secrets à ne pas négliger.

---

## 12. Sécurité Supabase

- **RLS (Row Level Security)** : **condition bloquante avant toute mise en production**, non un paramètre différable (`prisma-schema-specification.md` §14, `prisma-config-specification.md` §6, `implementation-roadmap.md` Phase 9). Deux options, non tranchées par les documents sources — le choix entre elles reste ouvert, mais l'une des deux **doit** être appliquée :
  - (a) RLS activé sur les 7 tables avec des politiques n'autorisant aucun accès via l'API Data, l'application continuant d'accéder aux données via Prisma (hors RLS) ;
  - (b) neutralisation explicite de l'API PostgREST/Data API du projet Supabase.
- **PostgREST / Data API** : Supabase expose par défaut l'intégralité du schéma `public` via une API auto-générée, **indépendante du code applicatif** et active tant qu'elle n'est pas neutralisée (`prisma-schema-specification.md` §14). Sans l'une des deux mesures ci-dessus, les actifs suivants seraient potentiellement accessibles hors du chemin applicatif Prisma : `administrateur.mot_de_passe_hash`, `session_administrateur.jeton_hash`, les lignes `contenu_editorial` au statut `brouillon`, les adresses de `inscrit_newsletter` — en contradiction directe avec l'invariant « Brouillon jamais visible hors administration » (`domain-model.md`) et avec la protection des données sensibles (§4).
- **Connexion directe (`DIRECT_URL`)** : réservée exclusivement au CLI Prisma (migrations) — jamais utilisée comme connexion applicative, qui épuiserait rapidement les connexions directes disponibles et élargirait inutilement la surface d'exposition de cette voie de connexion à plus haut privilège (`prisma-config-specification.md` §2-§3).
- **Supavisor (connexion poolée, `DATABASE_URL`)** : seule connexion utilisée par le trafic applicatif, en mode transaction (`prisma-config-specification.md` §3). Limitation connue : les instructions préparées de Prisma Client ont des limitations documentées avec ce mode — à surveiller dès les premières requêtes concurrentes (`prisma-config-specification.md` §3, `implementation-roadmap.md` Phase 0A), sans quoi une dégradation de service (indisponibilité partielle) pourrait résulter d'une mauvaise configuration de l'adaptateur de connexion.
- **Schémas réservés** : les 7 tables du domaine vivent exclusivement dans le schéma `public`, sans collision avec les schémas réservés Supabase (`auth`, `storage`, `realtime`, `extensions`) — déjà vérifié, aucune action supplémentaire requise (`prisma-schema-specification.md` §14).

---

## 13. Journalisation et audit

Aucun document source ne spécifie de stratégie de journalisation applicative — cette section relève intégralement du jugement d'architecte, à l'exception des données qui ne doivent jamais être journalisées, directement déductibles de §4.

### 13.1 Ce qui doit être journalisé (recommandation d'architecte)

- Tentatives de connexion administrateur, succès et échec, horodatées (sans le mot de passe soumis).
- Créations et fins de session (`adminLogin`/`adminLogout`), et expirations automatiques par inactivité (DR-002).
- Mutations administrateur irréversibles ou à fort impact : suppression d'un Contenu éditorial (`deleteArticle`), suppression d'une Catégorie/Zone (`deleteCategory`/`deleteZone`), retrait manuel d'un inscrit (`removeSubscriber`).
- Changements de statut d'un Contenu éditorial (publication, dépublication, archivage — `publishArticle`/`unpublishArticle`/`archiveArticle`), cohérent avec l'exigence d'intégrité des contenus publiés (`requirements.md` §2.1).
- Erreurs de la catégorie « Technique » (`api-contracts.md` §1.2), pour permettre un diagnostic sans exposer leur détail au client.

### 13.2 Ce qui ne doit jamais être journalisé

- Le mot de passe administrateur en clair, saisi à la connexion.
- `administrateur.mot_de_passe_hash`.
- `session_administrateur.jeton_hash` ou la valeur brute du cookie de session.
- `inscrit_newsletter.jeton_desinscription` en clair.
- Le contenu intégral du formulaire Contact (peut contenir des données personnelles du visiteur au-delà de son adresse), au-delà de ce qui est strictement nécessaire à un diagnostic technique ponctuel.
- Les adresses e-mail des Inscrits Newsletter en masse dans un journal applicatif générique (risque de fuite groupée d'une donnée personnelle, `requirements.md` §2.1).

---

## 14. Checklist sécurité avant mise en production

Reprise et complétée de `implementation-roadmap.md` (Phase 9), avec les exigences détaillées dans ce document :

- [ ] RLS activé avec politiques de refus total **ou** API PostgREST/Data API explicitement neutralisée sur le projet Supabase de production — vérifié, jamais supposé (§12).
- [ ] `DIRECT_URL` et `DATABASE_URL` de production distinctes de celles de développement, aucune des deux commitée (§11).
- [ ] Clé de signature du cookie de session définie en variable d'environnement de production, distincte de tout environnement de développement (§11).
- [ ] Mot de passe administrateur haché en bcrypt, jamais celui utilisé en développement s'il a été généré à des fins de test (§2, §11).
- [ ] Durée d'inactivité avant expiration de session (DR-002) explicitement configurée, jamais laissée à une valeur par défaut non documentée (§2).
- [ ] Attributs `Secure`/`SameSite` du cookie de session vérifiés contre la documentation Next.js 16 effectivement installée (§2, §6).
- [ ] Décision de limitation de tentatives (brute force) sur la Connexion administrateur explicitement prise et implémentée, ou explicitement acceptée comme risque documenté (§10).
- [ ] `.env` et tout fichier de secrets exclu du contrôle de version (§11).
- [ ] Journalisation vérifiée pour ne jamais exposer les données listées en §13.2.
- [ ] `robots.txt` exclut `/admin` en production réelle (`frontend-specification.md` §SEO, `implementation-roadmap.md` Phase 9).
- [ ] Aucune donnée de test/développement (comptes, inscrits, contenus) ne subsiste en base de production (`implementation-roadmap.md` Phase 8-9).
- [ ] Les 5 fonctions et 4 triggers PL/pgSQL manuels sont présents et actifs en production, vérifiés indépendamment du succès apparent de la migration (`sql-migration-specification.md`, `implementation-roadmap.md` Phase 0A).

---

## 15. Tableau final de traçabilité

| Exigence sécurité | Documents sources | Composants concernés |
|---|---|---|
| Authentification par Session administrateur unique, cookie httpOnly signé | `domain-model.md`, `technical-architecture.md` §1.2/§4.3, `api-contracts.md` §1.3 | `admin-auth`, `session_administrateur` |
| Vérification de session à deux niveaux (route + layout) | `technical-architecture.md` §4.3, `frontend-specification.md` §Routes administrateur | Middleware/layout `admin/(protected)` |
| Expiration de session par inactivité (durée à configurer) | `domain-model.md` DR-002, `technical-architecture.md` §8 point 5 | `admin-auth`, `session_administrateur.derniere_activite_at` |
| Message générique de connexion, sans désignation de champ fautif | `ui-specification.md`, `server-actions-specification.md` §1.1 | `adminLogin` |
| Compte Administrateur unique garanti en base | `domain-model.md`, `database-schema.md` §6 | Trigger `fn_administrateur_unique` |
| Autorisation binaire par opération (Permission requise) | `api-contracts.md` §1.4, `server-actions-specification.md` (champ #3 de chaque opération) | Toutes les Server Actions et fonctions de lecture |
| Branchement par statut centralisé (DR-001) | `domain-model.md`, `technical-architecture.md` §4.2 | Repository `articles`, `getArticleDetail` |
| Hachage du mot de passe administrateur (bcrypt recommandé) | `technical-architecture.md` §8 point 4 | `administrateur.mot_de_passe_hash` |
| Hachage du jeton de session | `database-schema.md` §4.4 | `session_administrateur.jeton_hash` |
| Jeton de désinscription à haute entropie, usage unique | `database-schema.md` §4.7, `api-contracts.md` §4.3 | `inscrit_newsletter.jeton_desinscription` |
| Aucune persistance du message de Contact | `database-schema.md`, `technical-architecture.md` §3.1 | `submitContactForm` |
| Validation Zod unique, serveur seule autorité | `api-contracts.md` §1.5, `frontend-specification.md` §Validation | Toutes les Server Actions liées à un formulaire |
| Types fermés (statut, type de contenu) alignés sur les `ENUM` PostgreSQL | `frontend-specification.md` §Conventions TypeScript, `database-schema.md` §3 | `contenu_editorial.statut`/`type_contenu` |
| Aucune exception non structurée retournée au client | `api-contracts.md` §1.1-§1.2 | Toutes les opérations |
| CSRF : formulaires exclusivement liés à des Server Actions natives | `frontend-specification.md` §Formulaires, `api-contracts.md` note de lecture | Tous les formulaires |
| Échappement XSS par défaut (JSX), pas de rendu HTML brut documenté | `database-schema.md` §4.5, React/Next.js (architecture retenue) | Rendu des champs textuels du Contenu éditorial |
| Accès aux données exclusivement via Prisma, requêtes paramétrées | `technical-architecture.md` §3.2, §8 point 1 | Couche `lib/db/*.ts` |
| Recherche par texte libre restreinte aux Contenus Publiés | `domain-model.md`, `server-actions-specification.md` §9.1 | `searchContent` |
| Traitement neutre de « déjà inscrit » et de la réactivation | US-019, `api-contracts.md` §4.1-§4.2 | `subscribeNewsletter` |
| Traitement neutre identique du jeton valide/utilisé/expiré/invalide | US-020, `api-contracts.md` §4.3 | Page `newsletter/desinscription` |
| Séparation stricte `DIRECT_URL` (migrations) / `DATABASE_URL` (application) | `prisma-config-specification.md` §2-§3 | `prisma.config.ts`, Client Prisma |
| RLS ou neutralisation PostgREST avant production | `prisma-schema-specification.md` §14, `prisma-config-specification.md` §6 | Projet Supabase |
| Exclusion de `/admin` de l'indexation et des secrets du contrôle de version | `frontend-specification.md` §SEO, `prisma-config-specification.md` §2 | `robots.ts`, `.env` |
| Aucune donnée sensible journalisée | Déduction de §4 (aucune source directe pour la stratégie de journalisation) | Ensemble des Server Actions |

---

Aucun document existant n'a été modifié pour produire cette spécification. Aucun code d'implémentation n'y figure.
