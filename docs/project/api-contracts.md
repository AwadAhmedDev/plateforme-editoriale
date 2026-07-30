# API Contracts — MVP

**Statut** : contrats fonctionnels de l'API, dérivés de `domain-model.md` (DR-001 à DR-007), `technical-architecture.md` et `database-schema.md`, tous validés.
Ce document ne redéfinit et ne réinterprète aucune règle métier. Il ne contient ni code d'implémentation, ni schéma Prisma, ni détail d'infrastructure — uniquement la définition contractuelle de chaque opération (entrée, sortie, erreurs, permissions, effets de bord).

Toute ambiguïté rencontrée est consignée en §7 (« Points à arbitrer »), jamais tranchée ici par défaut.

**Note de lecture** : conformément à `technical-architecture.md` §1.1, la plupart des contrats ci-dessous sont portés par des **Server Actions** (invoquées directement par un `form`, jamais par un appel `fetch` côté client) et non par des endpoints REST classiques. Le terme « contrat » désigne ici l'interface fonctionnelle (entrée/sortie/erreurs), quel que soit le mécanisme Next.js sous-jacent (Server Action ou Route Handler, précisé pour chaque contrat).

---

## 1. Principes généraux

### 1.1 Format des réponses

Toute opération (Server Action ou Route Handler) retourne une structure à deux issues :

- **Succès** : les données produites par l'opération (forme propre à chaque contrat, détaillée ci-dessous).
- **Échec** : un couple *code d'erreur* (identifiant stable, machine-readable) + *message* destiné à l'utilisateur. Le message reprend, chaque fois qu'un document source en fixe déjà le texte exact (`ui-specification.md`), ce texte à la lettre — jamais une reformulation.

Aucune opération ne retourne d'exception non structurée : toute erreur prévisible (validation, permission, conflit, ressource introuvable) est renvoyée sous cette forme, jamais laissée remonter comme une erreur technique générique.

### 1.2 Gestion des erreurs

Quatre catégories d'erreurs, cohérentes avec `ui-specification.md` (§Règles de validation, §États erreurs) :

| Catégorie | Déclencheur | Traitement |
|---|---|---|
| Validation | Champ requis manquant, format invalide | Erreur **par champ**, jamais un message générique (« Le titre est requis pour publier » est le seul texte déjà fixé littéralement ; les autres champs obligatoires à la publication suivent le même principe — message spécifique par champ manquant, cf. §2.2 et Point à arbitrer §7.3) |
| Permission | Session absente ou expirée sur une action administrateur | Redirection vers la Connexion, message neutre (DR-002, déjà spécifié) |
| Conflit métier | Suppression d'une Catégorie/Zone référencée, action incompatible avec l'état courant | Code d'erreur dédié (ex. `CATEGORIE_REFERENCEE`), message factuel, aucune action destructive appliquée |
| Technique | Échec réseau/serveur imprévu | Message générique unique déjà fixé : « Une erreur est survenue, veuillez réessayer », saisie utilisateur conservée |

### 1.3 Authentification

- Un seul mécanisme d'authentification dans tout le domaine : la Session administrateur (`domain-model.md` — aucune notion de compte visiteur en V1).
- Session portée par un cookie serveur (httpOnly), vérifiée à deux niveaux (route + layout protégé), expirée automatiquement après une période d'inactivité dont la durée n'est pas fixée par les documents métier (DR-002).
- Aucune procédure de récupération d'accès applicative : hors produit (`domain-model.md`).

### 1.4 Autorisation

Binaire, sans granularité : un contrat est soit **public** (aucune vérification), soit **administrateur** (session valide requise). Aucune notion de rôle, de permission différenciée ou de propriétaire de ressource (`domain-model.md` — « Acteur unique de gestion »). Aucun contrat de ce document ne prévoit de paramètre de rôle ou de portée d'accès.

### 1.5 Validation

Un schéma de validation unique par formulaire/contrat (Zod, ou équivalent), partagé entre l'indication temps réel côté client et la validation serveur — **le serveur reste seule autorité** (`frontend-specification.md`). Les contrats ci-dessous listent les règles de validation ; ils ne prescrivent aucune bibliothèque ni schéma concret.

### 1.6 Conventions de pagination

| Contexte | Convention |
|---|---|
| Back-office (Gestion des articles, Gestion newsletter) | Pagination numérotée, taille de page fixe **20 lignes**, jamais de « Charger plus » (`ui-specification.md`) |
| Public (Liste des articles, Résultats de recherche, Catégorie, Zone géographique) | Même paramètre de pagination (`?page=N`) exposé par le contrat. Taille de page **24**, présentation **Précédent/Suivant à tous les points de rupture** — arbitrage tranché à l'implémentation, cf. §7.2 (remplace la présentation « numérotée desktop / Charger plus mobile » de `frontend-specification.md`, jamais implémentée) |

Tous les contrats paginés exposent : `page` (entier, défaut 1) et retournent : les éléments de la page courante, le nombre total d'éléments, l'indication de page suivante disponible.

### 1.7 Conventions de recherche

Paramètres combinables, portés par l'URL (`searchParams`), jamais par un state client isolé (`frontend-specification.md`) : `q` (texte libre), `categorie`, `zone`, `type`, `date`. Le texte libre (`q`) interroge le vecteur de recherche couvrant titre, chapô, corps et mots-clés (`database-schema.md` §4.5/§6 — corrige la couverture de US-022 sur les mots-clés). Les autres paramètres filtrent par égalité stricte sur les colonnes correspondantes. Tous les paramètres sont combinables entre eux (US-023).

**Filtrage par date** — le paramètre `date` est exposé sous forme de deux bornes de plage, `du` et `au`, **toutes deux incluses**, portant sur la date de publication :

| Règle | Convention |
|---|---|
| Format accepté | `YYYY-MM-DD` uniquement — le seul que produise un champ de date natif |
| Valeur invalide (format erroné, ou date inexistante type `2026-02-30`) | Ignorée silencieusement, traitée comme absente ; jamais une erreur, jamais un 404. Elle n'est ni réaffichée dans le champ, ni reportée sur les liens de pagination |
| Fuseau | Bornes calculées en UTC, jamais dans le fuseau du serveur : une même URL rend le même résultat sur toute machine |
| Borne haute | Portée à la fin de journée (`23:59:59.999`), la comparaison portant sur un timestamp — sans cela, `au=2026-01-15` exclurait les contenus publiés *le* 15 |
| Plage inversée (`du` > `au`) | Transmise telle quelle, résultat vide ; jamais une réécriture silencieuse des bornes saisies |
| Bornes seules | `du` et `au` sont indépendamment optionnels — une borne unique est un filtre valide (« depuis le », « jusqu'au ») |

---

## 2. Contrats Administration

### 2.1 Authentification

| Contrat | Mécanisme | Entrée | Sortie | Erreurs | Permission |
|---|---|---|---|---|---|
| **Connexion** (`adminLogin`) | Server Action | `identifiant`, `mot_de_passe` | Session établie (cookie posé), redirection Dashboard | « Identifiant ou mot de passe incorrect » (générique, jamais désigner le champ fautif) ; mot de passe vidé, identifiant conservé (US-026/`ui-specification.md`) | Public (accessible uniquement si non déjà connecté) |
| **Déconnexion** (`adminLogout`) | Server Action | Aucune (session courante) | Session invalidée, redirection Connexion | Aucune (action toujours réversible par reconnexion, sans confirmation) | Administrateur |
| **Session courante** | Vérification implicite (middleware + layout protégé, pas un contrat exposé séparément à l'utilisateur) | — | Authentifié / non authentifié ; si authentifié, redirection triviale vers Connexion en cas d'expiration (DR-002) | Session expirée par inactivité → redirection Connexion, message neutre déjà spécifié | Mécanisme transversal — s'applique en amont de toute route `/admin/(protected)/*` ; ne constitue pas un contrat gated par une permission propre, puisqu'il est lui-même le moyen de déterminer si l'appelant est administrateur |

### 2.2 Articles (Contenu éditorial)

| Contrat | Mécanisme | Entrée | Sortie | Validation / Erreurs | Effets de bord |
|---|---|---|---|---|---|
| **Créer** | Server Action | Champs de contenu (titre, chapô, corps, auteur, sources — tous optionnels à la création), type de contenu, catégorie, zone, image + alt, mots-clés | Contenu créé en statut `brouillon` | Aucun champ requis pour l'enregistrement en brouillon (`domain-model.md`) | Aucune revalidation publique (brouillon jamais visible hors administration) |
| **Modifier** | Server Action | Identifiant du contenu + champs modifiés (mêmes champs qu'à la création) | Contenu mis à jour | Mêmes règles que la création ; `date_derniere_modification` mise à jour automatiquement (DR-005, trigger) ; `date_publication` jamais modifiable une fois renseignée | Revalidation ciblée des routes publiques concernées si le contenu est Publié ou Archivé |
| **Changer de statut → Publier** | Server Action | Identifiant du contenu | Statut → `publie` | Requiert Titre, Type de contenu, Catégorie, Zone géographique, Image principale + Texte alternatif (`domain-model.md`, invariant) ; message spécifique par champ manquant (cf. §7.3) ; ne bloque jamais l'enregistrement en brouillon | `date_publication` renseignée automatiquement si absente (DR-005) ; revalidation ciblée des routes publiques |
| **Changer de statut → Repasser en Brouillon** | Server Action | Identifiant du contenu | Statut → `brouillon` | Toujours libre, quel que soit l'état de complétude (`domain-model.md`) | Contenu retiré de toute surface publique ; revalidation ciblée |
| **Changer de statut → Archiver** | Server Action | Identifiant du contenu | Statut → `archive` | Toujours libre par transition (`domain-model.md`) ; **exigence de champs pour cette transition non encore actée formellement** — cf. Point à arbitrer §7.1 | Retiré des listes/recherche/Catégorie/Zone, reste accessible via URL directe (DR-001) ; revalidation ciblée |
| **Supprimer** | Server Action | Identifiant du contenu | Contenu supprimé (suppression définitive, distincte d'Archiver) | Action irréversible — passage par une confirmation obligatoire côté UI avant appel du contrat (`ui-specification.md`, Modal) | Suppression en cascade des mots-clés associés ; revalidation ciblée si le contenu était Publié/Archivé |
| **Lister** (« Gestion des articles ») | Lecture Server Component | `page`, filtres (`statut`, `categorie`, `zone`), tri (`date` ou `statut`, sens ascendant/descendant) | Contenus de **tous statuts confondus**, paginés (20 lignes, §1.6), triés par Date ou Statut uniquement (`ui-specification.md`, `development-tasks.md` P5-T4) | — | Aucun |

### 2.3 Catégories

| Contrat | Mécanisme | Entrée | Sortie | Erreurs |
|---|---|---|---|---|
| **Lister** | Lecture Server Component | — | Liste des catégories avec nombre d'articles associés | — |
| **Créer** | Server Action | `nom`, `description_courte` (optionnelle) | Catégorie créée | `nom` requis et unique |
| **Modifier** | Server Action | Identifiant + `nom`/`description_courte` | Catégorie mise à jour | Unicité du `nom` |
| **Supprimer** | Server Action | Identifiant | Catégorie supprimée | Bloquée si au moins un Contenu éditorial associé (`CATEGORIE_REFERENCEE`), quel que soit son statut (y compris Brouillon) — action désactivée côté UI, aucune Modal ouverte dans ce cas (`ui-specification.md`) |

### 2.4 Zones géographiques

Identique à Catégories (§2.3), symétrique — mêmes contrats, mêmes règles (`domain-model.md` : « Règles métier identiques à celles de la Catégorie »).

### 2.5 Dashboard

| Élément | Détail |
|---|---|
| Mécanisme | Lecture Server Component |
| Entrée | Aucune |
| Sortie | Nombre de contenus au statut Publié ; nombre de contenus au statut Brouillon ; nombre d'Inscrits newsletter au statut `inscrit` (cohérent avec la règle de §4.4 — un désinscrit n'est jamais compté) ; liste des 5 derniers contenus modifiés, **tous statuts confondus**, triée par Date de dernière modification décroissante (`sitemap.md`, `ui-specification.md`, `development-tasks.md` P6-T3) |
| Permission | Administrateur |
| Composition | Ne duplique aucune donnée propre : comptages et liste s'appuient sur les mêmes contenus que le contrat « Lister » d'Articles (§2.2) et d'Inscrits (§4.4) |

---

## 3. Contrats Publics

### 3.1 Accueil

| Élément | Détail |
|---|---|
| Mécanisme | Lecture Server Component |
| Entrée | Aucune |
| Sortie | Sélection des derniers contenus **Publiés**, accès aux catégories/zones phares (`sitemap.md`) |
| Permission | Public |
| Pagination | Aucune — mise en avant bornée, distincte de la liste exhaustive (§3.2) |

### 3.2 Liste des articles

*(Non nommée explicitement dans le périmètre demandé, mais route publique déjà entièrement spécifiée par `sitemap.md`/`frontend-specification.md`/`development-tasks.md` P1-T8 — incluse ici pour éviter toute réinterprétation ultérieure.)*

| Élément | Détail |
|---|---|
| Mécanisme | Lecture Server Component |
| Entrée | `page`, filtres combinables (catégorie, zone, type, date) |
| Sortie | Contenus **Publiés** uniquement, paginés (§1.6) |
| Permission | Public |

### 3.3 Recherche

| Élément | Détail |
|---|---|
| Mécanisme | Lecture Server Component (piloté par `searchParams`) |
| Entrée | `q`, filtres combinables (catégorie, zone, type, date), `page` | 
| Sortie | Contenus **Publiés** correspondant à la requête full-text et/ou aux filtres, paginés ; état vide qualifié si aucun résultat (jamais traité comme une erreur) |
| Permission | Public |
| Route unique | Formulaire de saisie si aucun paramètre `q` ; résultats sinon — jamais deux fichiers distincts (`frontend-specification.md`) |

### 3.4 Détail d'un contenu

| Élément | Détail |
|---|---|
| Mécanisme | Lecture Server Component par `slug` |
| Entrée | `slug` |
| Sortie / branchement par statut (application stricte de DR-001, `technical-architecture.md` §4.2) | **Introuvable ou Brouillon** → page « contenu introuvable », rien exposé. **Publié** → rendu complet, indexable, présent dans listes/recherche/sitemap.xml. **Archivé** → rendu complet identique à Publié, mais exclu des listes/recherche/Catégorie/Zone/sitemap.xml |
| Permission | Public |
| Effets SEO | Métadonnées et données structurées (Article, BreadcrumbList) générées côté serveur ; source de la description SEO pour un contenu sans Chapô : cf. Point à arbitrer §7.4 |

### 3.5 Archives

Aucun contrat de **liste** dédié en V1 : la vue de navigation dédiée aux archives (US-007, filtrage par date/catégorie/zone) est explicitement différée en V2 (`scope-v1.md` §13, précision DR-001). La seule couverture V1 des « Archives » est l'accessibilité d'un contenu Archivé via son URL directe, déjà définie par le contrat « Détail d'un contenu » (§3.4). Aucun contrat supplémentaire n'est produit ici, pour ne pas anticiper une fonctionnalité V2.

### 3.6 Catégorie

| Élément | Détail |
|---|---|
| Mécanisme | Lecture Server Component par `slug` |
| Entrée | `slug`, `page`, filtres secondaires combinables (zone, type, date — catégorie omise, déjà donnée par le contexte) |
| Sortie | Contenus **Publiés** de la catégorie, paginés ; message neutre si aucun contenu publié |
| Permission | Public |
| SEO | Métadonnée de description alimentée par `description_courte` de la Catégorie (DR-007) |

### 3.7 Zone géographique

Symétrique de Catégorie (§3.6) — mêmes contrats, filtre secondaire « catégorie » au lieu de « zone ».

---

## 4. Newsletter

### 4.1 Inscription

| Élément | Détail |
|---|---|
| Mécanisme | Server Action |
| Entrée | `email` |
| Sortie | Confirmation neutre affichée in situ (jamais de redirection) |
| Comportement selon l'état existant | **E-mail inconnu** : nouvelle ligne créée, `statut = inscrit`. **E-mail déjà `inscrit`** : traité comme une confirmation neutre, jamais une erreur (US-019, `ui-specification.md`). **E-mail `desinscrit`** : réinscription — cf. §4.2 |
| Permission | Public |

### 4.2 Réinscription après désinscription

Décision métier validée à respecter explicitement :

> Une adresse désinscrite peut se réinscrire. La ligne existante est réactivée : `statut = inscrit`, `desinscrit_at = NULL`, nouvelle `date_inscription`, nouveau `jeton_desinscription`.

| Élément | Détail |
|---|---|
| Mécanisme | Même Server Action que l'inscription (§4.1) — pas de contrat distinct côté formulaire public, qui reste un simple champ e-mail (US-019) |
| Entrée | `email` (identique à l'inscription) |
| Comportement | Si la ligne existante a `statut = desinscrit` : `statut → inscrit`, `desinscrit_at → NULL`, `date_inscription → date du jour`, `jeton_desinscription → régénéré` (l'ancien jeton reste rattaché à une désinscription déjà consommée et ne doit pas rester valide pour ce nouveau cycle) |
| Sortie | Confirmation neutre, indiscernable côté utilisateur d'une première inscription (US-019 : « Je reçois une confirmation de mon inscription ») |
| Permission | Public |

**Note de cohérence documentaire** : cette décision est reflétée ici conformément à la consigne, mais `domain-model.md` (cycle de vie de l'Inscrit Newsletter, « état terminal ») et `database-schema.md` (§10.2) n'ont pas encore été mis à jour pour l'exprimer formellement — propagation à effectuer séparément.

### 4.3 Désinscription par jeton

| Élément | Détail |
|---|---|
| Mécanisme | Page Server Component (`newsletter/desinscription`), traitement au rendu — pas un Route Handler ni une Server Action liée à un formulaire (US-020) |
| Entrée | `token` (paramètre d'URL) |
| Comportement | Jeton valide et non consommé : `statut → desinscrit`, `desinscrit_at → maintenant`. Jeton déjà utilisé, invalide ou expiré : aucun changement |
| Sortie | Confirmation neutre unique dans tous les cas (« Vous avez été désinscrit de la newsletter »), jamais un message d'erreur, y compris pour un lien déjà utilisé (US-020) |
| Permission | Public, sans connexion ni ressaisie de l'e-mail |
| Accès | Jamais lié depuis la navigation, le footer, ou la page Newsletter — uniquement via le lien e-mail |

### 4.4 Administration — Gestion des inscrits

*(Non nommée dans le périmètre « Contrats Administration » du présent mandat, mais écran admin déjà entièrement spécifié — `sitemap.md`, `development-tasks.md` P6-T1 — inclus ici pour la même raison qu'en §3.2.)*

| Contrat | Entrée | Sortie | Permission |
|---|---|---|---|
| **Lister / rechercher** | `page`, `email` (filtre en direct) | Inscrits au **statut `inscrit` uniquement** — un inscrit désinscrit disparaît automatiquement de cette liste, sans action de l'administrateur (`domain-model.md`) — paginé (20 lignes, §1.6) | Administrateur |
| **Retirer manuellement** | Identifiant de l'inscrit | `statut → desinscrit`, `desinscrit_at → maintenant` (même effet que la désinscription libre-service, sans jeton) | Administrateur, action irréversible via Modal |

**Hors périmètre V1, à ne pas contractualiser** : l'envoi de communications/campagnes (US-021, fonctionnalité 12 de `scope-v1.md`) est explicitement différé en V2 — aucun contrat « envoyer » n'est produit.

---

## 5. Contact

| Élément | Détail |
|---|---|
| Mécanisme | Server Action |
| Entrée | `nom`, `email`, `sujet`, `message` — tous requis |
| Sortie | Confirmation de soumission |
| Validation | Message d'erreur spécifique par champ manquant, focus renvoyé au premier champ en erreur (US du formulaire, `ui-specification.md`) |
| Comportement serveur | Notification e-mail envoyée à l'administrateur (canal de contact réellement exploité — correction déjà actée dans `technical-architecture.md` §3.1) ; **aucune persistance** en base, conformément à `database-schema.md` (aucun écran de consultation documenté pour d'éventuels messages stockés) |
| Permission | Public |

---

## 6. Tableau de couverture

| Contrat | User Stories | Entités métier | Tables |
|---|---|---|---|
| Connexion / Déconnexion / Session | Aucune User Story dédiée — lacune déjà présente dans `user-stories.md` | Compte Administrateur, Session administrateur | `administrateur`, `session_administrateur` |
| Articles — Lister (« Gestion des articles ») | US-026 | Contenu éditorial, Catégorie, Zone géographique | `contenu_editorial` |
| Dashboard | US-026 | Contenu éditorial, Inscrit Newsletter | `contenu_editorial`, `inscrit_newsletter` |
| Articles — Créer/Modifier | US-001, US-002, US-003, US-005 | Contenu éditorial, Catégorie, Zone géographique | `contenu_editorial`, `contenu_mot_cle` |
| Articles — Changer de statut | US-004, US-005 | Contenu éditorial | `contenu_editorial` |
| Articles — Supprimer | US-026 | Contenu éditorial | `contenu_editorial`, `contenu_mot_cle` |
| Catégories — CRUD | US-002, US-027 | Catégorie | `categorie` |
| Zones géographiques — CRUD | US-002, US-027 | Zone géographique | `zone_geographique` |
| Accueil | US-008 | Contenu éditorial | `contenu_editorial` |
| Liste des articles | US-002, US-004, US-008 | Contenu éditorial, Catégorie, Zone géographique | `contenu_editorial` |
| Recherche | US-022, US-023 | Contenu éditorial, Mots-clés | `contenu_editorial`, `contenu_mot_cle` |
| Détail d'un contenu | US-003, US-005, US-006 | Contenu éditorial | `contenu_editorial` |
| Archives (accessibilité directe) | US-007 (partiel — DR-001) | Contenu éditorial | `contenu_editorial` |
| Catégorie / Zone géographique (pages publiques) | US-002, US-004 | Catégorie, Zone géographique, Contenu éditorial | `categorie`/`zone_geographique`, `contenu_editorial` |
| Newsletter — Inscription / Réinscription | US-019 | Inscrit Newsletter | `inscrit_newsletter` |
| Newsletter — Désinscription par jeton | US-020 | Inscrit Newsletter | `inscrit_newsletter` |
| Newsletter — Gestion admin (lister/retirer) | US-021 (partiel), US-029 | Inscrit Newsletter, Compte Administrateur | `inscrit_newsletter` |
| Contact | Aucune US fondatrice (déjà relevé dans `domain-model.md`, « Éléments non validés comme entités métier ») | — | Aucune (pas de persistance) |

---

## 7. Points à arbitrer

### 7.1 Champs requis pour la transition vers Archivé

Le passage direct Brouillon → Archivé est déjà libre selon `domain-model.md`, mais l'exigence de champs (Titre, Type, Catégorie, Zone, Image + Alt) ne conditionne aujourd'hui, à la lettre, que la transition vers Publié. Une analyse antérieure a recommandé d'étendre cette exigence à Archivé (un contenu Archivé étant conceptuellement une « publication passée », cf. US-007 : « consulter les publications passées »), mais **cette extension n'a pas encore été formellement actée** dans `domain-model.md` ni répercutée dans `database-schema.md` (`chk_publie_champs_requis`). Le contrat « Changer de statut → Archiver » (§2.2) ne peut donc pas encore fixer de règle de validation définitive sur ce point.

### 7.2 Taille de page pour les listes publiques — **tranché**

`ui-specification.md` fixe explicitement 20 lignes pour les tables back-office, mais aucun document ne fixait la taille de page des listes publiques (Liste des articles, Résultats de recherche, Catégorie, Zone géographique).

**Arbitrage retenu** : **24** éléments par page publique, et une présentation Précédent/Suivant identique à tous les points de rupture (le design de référence ne comporte aucune page paginée, donc aucune maquette de pagination à suivre). Une page bien formée mais hors bornes renvoie un 404 plutôt qu'un rabattement silencieux sur la dernière page ; une valeur mal formée (`?page=abc`, `?page=-3`) est ramenée à la page 1 en 200. `?page=1` n'est jamais écrit explicitement dans une URL canonique, pour qu'une seule URL canonique existe par page réelle.

### 7.3 Messages de validation par champ à la publication

Seul le message « Le titre est requis pour publier » est littéralement fixé (`ui-specification.md`). Les messages équivalents pour Type de contenu, Catégorie, Zone géographique, Image principale/Texte alternatif ne sont pas rédigés dans les documents source, seul le principe (« message spécifique par champ manquant ») l'est.

### 7.4 Source de la métadonnée SEO « description » pour la page Détail d'un contenu

DR-007 relie explicitement `description_courte` à la métadonnée SEO des pages Catégorie/Zone. Aucun document n'établit la même règle pour la page Détail d'un contenu : le Chapô (DR-003) en serait la source naturelle, mais le Corps de texte étant optionnel même Publié (DR-006) et le Chapô lui-même optionnel (DR-003), le cas d'un contenu Publié sans Chapô ni règle de repli documentée reste ouvert.

---

Aucun document métier n'a été modifié pour produire ce document. Aucun code d'implémentation, schéma Prisma ou détail d'infrastructure n'y figure.
