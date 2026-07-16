# Server Actions Specification — MVP

**Statut** : spécification fonctionnelle exhaustive des opérations serveur du MVP, dérivée de `domain-model.md`, `database-schema.md` et `api-contracts.md`, tous validés. Aucun code TypeScript, aucune implémentation Prisma — uniquement la spécification fonctionnelle de chaque opération, selon le gabarit à 11 champs demandé.

**Note de terminologie** : conformément à `technical-architecture.md` §1.1 et `api-contracts.md` (colonne « Mécanisme »), seules les opérations de **mutation** liées à un formulaire sont de véritables Server Actions Next.js. Les opérations de **lecture** (routes publiques, listes d'administration, Dashboard) sont des fonctions de lecture appelées directement par un Server Component, pas des Server Actions au sens strict. Chaque entrée ci-dessous est étiquetée **[Server Action]**, **[Lecture]** ou **[Mécanisme transversal]** pour lever toute ambiguïté, sans quoi ce document contredirait l'architecture déjà actée.

Chaque opération est décrite selon : 1. Nom — 2. Responsabilité — 3. Permission requise — 4. Entrées — 5. Validation Zod — 6. Lecture base de données — 7. Écriture base de données — 8. Règles métier appliquées — 9. Gestion des erreurs — 10. Invalidation de cache — 11. Valeur de retour.

---

## 1. Authentification

### 1.1 `adminLogin` [Server Action]

| # | Champ | Détail |
|---|---|---|
| 1 | Nom | `adminLogin` |
| 2 | Responsabilité | Authentifier le Compte Administrateur unique et établir une Session administrateur |
| 3 | Permission requise | Publique (route accessible uniquement si aucune session active — redirection Dashboard sinon, `frontend-specification.md`) |
| 4 | Entrées | `identifiant`, `mot_de_passe` |
| 5 | Validation Zod | Les deux champs requis, non vides ; aucun format supplémentaire imposé par les documents source |
| 6 | Lecture base de données | `administrateur` — recherche par `identifiant`, comparaison du hachage de `mot_de_passe` |
| 7 | Écriture base de données | `session_administrateur` — insertion d'une ligne (`administrateur_id`, `jeton_hash`, `derniere_activite_at = now()`) |
| 8 | Règles métier appliquées | Un seul Compte Administrateur existe (`domain-model.md`, invariant) ; échec jamais désigné par champ |
| 9 | Gestion des erreurs | Identifiant inconnu ou mot de passe incorrect → même message générique « Identifiant ou mot de passe incorrect » (`ui-specification.md`) ; champ mot de passe vidé, identifiant conservé |
| 10 | Invalidation de cache | Aucune (n'affecte aucune route publique) |
| 11 | Valeur de retour | Succès : redirection Dashboard, cookie de session posé. Échec : message d'erreur, saisie partiellement conservée |

### 1.2 `adminLogout` [Server Action]

| # | Champ | Détail |
|---|---|---|
| 1 | Nom | `adminLogout` |
| 2 | Responsabilité | Terminer la Session administrateur courante |
| 3 | Permission requise | Administrateur |
| 4 | Entrées | Aucune (session courante identifiée par le cookie) |
| 5 | Validation Zod | Aucune (pas de saisie) |
| 6 | Lecture base de données | `session_administrateur` — identification de la session courante |
| 7 | Écriture base de données | Suppression de la ligne `session_administrateur` correspondante |
| 8 | Règles métier appliquées | Déconnexion immédiate et réversible par reconnexion, sans confirmation préalable (`domain-model.md`) |
| 9 | Gestion des erreurs | Aucune prévue — action toujours réalisable depuis tout écran admin |
| 10 | Invalidation de cache | Aucune (n'affecte aucune route publique) |
| 11 | Valeur de retour | Redirection vers Connexion |

### 1.3 Garde d'accès session [Mécanisme transversal]

| # | Champ | Détail |
|---|---|---|
| 1 | Nom | Vérification de session (route + layout protégé) |
| 2 | Responsabilité | Autoriser ou refuser l'accès à toute route `/admin/(protected)/*` ; appliquer l'expiration par inactivité |
| 3 | Permission requise | Mécanisme transversal lui-même — ne constitue pas un contrat gated par une permission (`api-contracts.md` §2.1, correction déjà actée) |
| 4 | Entrées | Cookie de session (jeton) |
| 5 | Validation Zod | Aucune (pas un formulaire) |
| 6 | Lecture base de données | `session_administrateur` — recherche par `jeton_hash`, lecture de `derniere_activite_at` |
| 7 | Écriture base de données | Mise à jour de `derniere_activite_at = now()` à chaque requête valide |
| 8 | Règles métier appliquées | Expiration automatique après une période d'inactivité (durée non fixée par les documents métier — DR-002) |
| 9 | Gestion des erreurs | Session absente/expirée → redirection Connexion, aucun contenu exposé, message neutre déjà spécifié |
| 10 | Invalidation de cache | Aucune |
| 11 | Valeur de retour | Laisse passer la requête, ou redirige vers `/admin/connexion` |

---

## 2. Dashboard

### 2.1 `getDashboardData` [Lecture]

| # | Champ | Détail |
|---|---|---|
| 1 | Nom | `getDashboardData` |
| 2 | Responsabilité | Fournir les données agrégées de l'écran Dashboard (`api-contracts.md` §2.5) |
| 3 | Permission requise | Administrateur |
| 4 | Entrées | Aucune |
| 5 | Validation Zod | Aucune |
| 6 | Lecture base de données | `contenu_editorial` (comptage par `statut` ; 5 lignes triées par `date_derniere_modification` décroissant, tous statuts) ; `inscrit_newsletter` (comptage `WHERE statut = 'inscrit'`) |
| 7 | Écriture base de données | Aucune |
| 8 | Règles métier appliquées | Comptage des inscrits limité au statut `inscrit` (cohérent avec §5.1 ci-dessous — un désinscrit n'est jamais compté, `domain-model.md`) |
| 9 | Gestion des erreurs | Aucune (lecture pure) |
| 10 | Invalidation de cache | Sans objet — route non mise en cache (`frontend-specification.md` : Dashboard « dynamique, non mis en cache ») |
| 11 | Valeur de retour | Nombre de Publiés, nombre de Brouillons, nombre d'Inscrits actifs, 5 derniers contenus modifiés (tous statuts) |

---

## 3. Gestion des articles

### 3.1 `createArticle` [Server Action]

| # | Champ | Détail |
|---|---|---|
| 1 | Nom | `createArticle` |
| 2 | Responsabilité | Créer un nouveau Contenu éditorial en statut Brouillon |
| 3 | Permission requise | Administrateur |
| 4 | Entrées | `slug` (optionnel, généré automatiquement à partir du titre si absent — `technical-architecture.md` §8), `titre`, `chapo`, `corps`, `type_contenu`, `categorie_id`, `zone_id`, `image_principale_url`, `image_alt_text`, `auteur`, `sources`, `mots_cles` (liste) — tous optionnels. `image_largeur`/`image_hauteur` ne sont **pas des champs de saisie** : dérivés automatiquement du fichier image lors de son import (module `media`, `technical-architecture.md` §3.1), jamais renseignés manuellement par l'administrateur |
| 5 | Validation Zod | Aucun champ requis à la création (`domain-model.md` : un Brouillon peut rester incomplet sur l'ensemble des champs, y compris le Titre) ; `type_contenu` doit appartenir à l'énumération fermée si renseigné |
| 6 | Lecture base de données | `categorie`, `zone_geographique` — vérification d'existence si `categorie_id`/`zone_id` fournis ; `contenu_editorial` — vérification d'unicité du `slug` (fourni ou généré) |
| 7 | Écriture base de données | `INSERT contenu_editorial` (`statut = 'brouillon'` par défaut, `image_largeur`/`image_hauteur` renseignées par le module `media` au moment de l'import) ; `INSERT contenu_mot_cle` pour chaque mot-clé fourni |
| 8 | Règles métier appliquées | Aucun champ obligatoire pour l'enregistrement en brouillon (`domain-model.md`) ; slugs lisibles et stables, modifiables manuellement (`technical-architecture.md` §8) |
| 9 | Gestion des erreurs | `slug` déjà utilisé (contrainte `UNIQUE`, `database-schema.md`) ; aucune autre erreur de validation attendue à la création ; erreur technique générique en cas d'échec serveur |
| 10 | Invalidation de cache | Aucune — un Brouillon n'est jamais visible en dehors de l'espace d'administration (`domain-model.md`) |
| 11 | Valeur de retour | Identifiant du contenu créé (redirection vers l'Éditeur) |

### 3.2 `updateArticle` [Server Action]

| # | Champ | Détail |
|---|---|---|
| 1 | Nom | `updateArticle` |
| 2 | Responsabilité | Modifier les champs d'un Contenu éditorial existant, quel que soit son statut |
| 3 | Permission requise | Administrateur |
| 4 | Entrées | Identifiant du contenu + mêmes champs que §3.1, `slug` inclus (valeurs modifiées). `image_largeur`/`image_hauteur` ne sont pas des champs de saisie : mis à jour uniquement si l'administrateur importe une nouvelle image (dérivés du nouveau fichier, module `media`) |
| 5 | Validation Zod | Identique à §3.1 |
| 6 | Lecture base de données | `contenu_editorial` (existence) ; `categorie`/`zone_geographique` (intégrité référentielle si modifiées) ; `contenu_editorial` — vérification d'unicité du `slug` si modifié |
| 7 | Écriture base de données | `UPDATE contenu_editorial` (champs modifiés, y compris `slug` si fourni ; `image_largeur`/`image_hauteur` réécrites uniquement en cas de nouvel import d'image) ; synchronisation ajouts/retraits sur `contenu_mot_cle` |
| 8 | Règles métier appliquées | « Une fois publié, un contenu reste modifiable à tout moment » (`domain-model.md`) ; Corps de texte toujours facultatif, y compris Publié (DR-006) ; `date_derniere_modification` mise à jour par trigger (DR-005) ; `date_publication` jamais modifiable par cette action une fois renseignée (verrouillée par trigger) ; slug modifiable manuellement (`technical-architecture.md` §8) |
| 9 | Gestion des erreurs | Contenu introuvable ; `slug` déjà utilisé par un autre contenu ; erreurs de validation par champ le cas échéant |
| 10 | Invalidation de cache | Revalidation ciblée des routes publiques concernées (Détail, Liste, Catégorie, Zone, Recherche, Accueil) si le contenu est Publié ou Archivé (`technical-architecture.md` §4.4) |
| 11 | Valeur de retour | Contenu mis à jour |

### 3.3 `publishArticle` [Server Action]

| # | Champ | Détail |
|---|---|---|
| 1 | Nom | `publishArticle` |
| 2 | Responsabilité | Faire transiter un Contenu éditorial vers le statut Publié |
| 3 | Permission requise | Administrateur |
| 4 | Entrées | Identifiant du contenu |
| 5 | Validation Zod | Sans objet directement — la validation porte sur l'état des données déjà en base (cf. règles métier) |
| 6 | Lecture base de données | `contenu_editorial` — lecture des champs actuels pour vérification de complétude |
| 7 | Écriture base de données | `UPDATE contenu_editorial SET statut = 'publie'` ; trigger renseigne `date_publication` si absente et la verrouille (DR-005) ; contrainte `chk_publie_champs_requis` appliquée par la base |
| 8 | Règles métier appliquées | Requiert Titre, Type de contenu, Catégorie, Zone géographique, Image principale + Texte alternatif (`domain-model.md`, invariant) |
| 9 | Gestion des erreurs | Message spécifique par champ manquant (seul le texte du Titre est littéralement fixé — « Le titre est requis pour publier » ; les autres suivent le même principe, cf. `api-contracts.md` §7.3, non tranché) |
| 10 | Invalidation de cache | Revalidation ciblée des routes publiques (Détail, Liste, Catégorie, Zone, Recherche, Accueil, `sitemap.xml`) |
| 11 | Valeur de retour | Statut mis à jour, toast « ✓ Article publié » (`ui-specification.md`) |

### 3.4 `unpublishArticle` [Server Action]

| # | Champ | Détail |
|---|---|---|
| 1 | Nom | `unpublishArticle` |
| 2 | Responsabilité | Faire transiter un Contenu éditorial vers le statut Brouillon |
| 3 | Permission requise | Administrateur |
| 4 | Entrées | Identifiant du contenu |
| 5 | Validation Zod | Aucune |
| 6 | Lecture base de données | `contenu_editorial` (existence) |
| 7 | Écriture base de données | `UPDATE contenu_editorial SET statut = 'brouillon'` |
| 8 | Règles métier appliquées | Transition toujours libre, quel que soit l'état de complétude (`domain-model.md`) |
| 9 | Gestion des erreurs | Contenu introuvable uniquement |
| 10 | Invalidation de cache | Revalidation ciblée — le contenu disparaît de toute surface publique, y compris l'accès direct (Brouillon jamais visible hors administration) |
| 11 | Valeur de retour | Statut mis à jour, toast « ✓ Brouillon enregistré » |

### 3.5 `archiveArticle` [Server Action]

| # | Champ | Détail |
|---|---|---|
| 1 | Nom | `archiveArticle` |
| 2 | Responsabilité | Faire transiter un Contenu éditorial vers le statut Archivé |
| 3 | Permission requise | Administrateur |
| 4 | Entrées | Identifiant du contenu |
| 5 | Validation Zod | Sans objet directement |
| 6 | Lecture base de données | `contenu_editorial` |
| 7 | Écriture base de données | `UPDATE contenu_editorial SET statut = 'archive'` |
| 8 | Règles métier appliquées | Transition toujours libre (`domain-model.md`). **Exigence de champs pour cette transition non actée formellement** — `api-contracts.md` §7.1 renvoie ce point à un arbitrage préalable ; cette spécification ne peut donc pas fixer de règle de validation définitive ici, sans quoi elle trancherait une ambiguïté déjà remontée |
| 9 | Gestion des erreurs | Contenu introuvable uniquement, en l'état actuel des documents |
| 10 | Invalidation de cache | Retiré des listes/recherche/Catégorie/Zone/`sitemap.xml`, reste accessible via son URL directe (DR-001) — revalidation ciblée des surfaces de découverte, conservation de la route de détail |
| 11 | Valeur de retour | Statut mis à jour |

### 3.6 `deleteArticle` [Server Action]

| # | Champ | Détail |
|---|---|---|
| 1 | Nom | `deleteArticle` |
| 2 | Responsabilité | Supprimer définitivement un Contenu éditorial (distinct d'Archiver) |
| 3 | Permission requise | Administrateur |
| 4 | Entrées | Identifiant du contenu |
| 5 | Validation Zod | Aucune (confirmation gérée par une Modal côté UI avant l'appel) |
| 6 | Lecture base de données | `contenu_editorial` (existence, statut pour déterminer l'impact de l'invalidation) |
| 7 | Écriture base de données | `DELETE contenu_editorial` ; suppression en cascade de `contenu_mot_cle` (`ON DELETE CASCADE`) |
| 8 | Règles métier appliquées | Action irréversible, jamais directe sans passage par une Modal de confirmation (`ui-specification.md`) |
| 9 | Gestion des erreurs | Contenu introuvable |
| 10 | Invalidation de cache | Revalidation ciblée si le contenu était Publié ou Archivé |
| 11 | Valeur de retour | Confirmation de suppression, redirection vers Gestion des articles |

### 3.7 `getArticleForEdit` [Lecture]

| # | Champ | Détail |
|---|---|---|
| 1 | Nom | `getArticleForEdit` |
| 2 | Responsabilité | Récupérer l'ensemble des champs d'un Contenu éditorial existant pour pré-remplir l'écran d'édition (route `articles/[id]`, `frontend-specification.md`) |
| 3 | Permission requise | Administrateur |
| 4 | Entrées | Identifiant du contenu |
| 5 | Validation Zod | Identifiant requis |
| 6 | Lecture base de données | `contenu_editorial` — tous les champs, **sans filtre de statut** (fonctionne pour Brouillon, Publié et Archivé indifféremment) ; `contenu_mot_cle` associés ; `categorie`/`zone_geographique` pour affichage des libellés courants |
| 7 | Écriture base de données | Aucune |
| 8 | Règles métier appliquées | Aucune — lecture intégrale, sans condition de complétude ni de statut (distinct de `getArticleDetail`, §11.3, qui applique le branchement public DR-001) ; **aucun branchement par statut ici**, l'administration doit pouvoir éditer un contenu quel que soit son état |
| 9 | Gestion des erreurs | Contenu introuvable |
| 10 | Invalidation de cache | Sans objet (lecture) |
| 11 | Valeur de retour | Tous les champs du contenu (y compris `slug`, `date_publication`, `date_derniere_modification`) et ses mots-clés, pour pré-remplissage du formulaire |

### 3.8 `listArticles` [Lecture]

| # | Champ | Détail |
|---|---|---|
| 1 | Nom | `listArticles` |
| 2 | Responsabilité | Fournir la liste paginée, filtrée et triée pour l'écran « Gestion des articles » |
| 3 | Permission requise | Administrateur |
| 4 | Entrées | `page`, `statut` (filtre optionnel), `categorie_id` (filtre optionnel), `zone_id` (filtre optionnel), tri (`date` ou `statut`, sens) |
| 5 | Validation Zod | `page` entier positif ; `statut` appartient à l'énumération fermée si fourni |
| 6 | Lecture base de données | `contenu_editorial` (tous statuts), jointures `categorie`/`zone_geographique` pour affichage des noms |
| 7 | Écriture base de données | Aucune |
| 8 | Règles métier appliquées | Tous statuts confondus, contrairement aux listes publiques (`development-tasks.md` P5-T4) |
| 9 | Gestion des erreurs | Aucune — page hors limites retourne une liste vide |
| 10 | Invalidation de cache | Sans objet (lecture) |
| 11 | Valeur de retour | Page courante, nombre total, indication de page suivante (`api-contracts.md` §1.6) |

---

## 4. Gestion des catégories

### 4.1 `listCategories` [Lecture]

| # | Champ | Détail |
|---|---|---|
| 1 | Nom | `listCategories` |
| 2 | Responsabilité | Lister les catégories avec le nombre d'articles associés |
| 3 | Permission requise | Administrateur |
| 4 | Entrées | Aucune |
| 5 | Validation Zod | Aucune |
| 6 | Lecture base de données | `categorie`, comptage `contenu_editorial` par `categorie_id` |
| 7 | Écriture base de données | Aucune |
| 8 | Règles métier appliquées | — |
| 9 | Gestion des erreurs | Aucune |
| 10 | Invalidation de cache | Sans objet |
| 11 | Valeur de retour | Liste des catégories, nombre d'articles associés par catégorie |

### 4.2 `createCategory` [Server Action]

| # | Champ | Détail |
|---|---|---|
| 1 | Nom | `createCategory` |
| 2 | Responsabilité | Créer une nouvelle Catégorie |
| 3 | Permission requise | Administrateur |
| 4 | Entrées | `nom`, `slug` (optionnel, généré automatiquement à partir du `nom` si absent — `technical-architecture.md` §8), `description_courte` (optionnelle) |
| 5 | Validation Zod | `nom` requis, non vide |
| 6 | Lecture base de données | `categorie` — vérification d'unicité du `nom` et du `slug` (fourni ou généré) |
| 7 | Écriture base de données | `INSERT categorie` |
| 8 | Règles métier appliquées | Catégories/Zones extensibles par CRUD administrateur (`domain-model.md`, invariant) ; slug modifiable manuellement (`technical-architecture.md` §8) |
| 9 | Gestion des erreurs | `nom` déjà utilisé (contrainte `UNIQUE`) ; `slug` déjà utilisé (contrainte `UNIQUE`) |
| 10 | Invalidation de cache | Revalidation du menu de navigation (Catégories) |
| 11 | Valeur de retour | Catégorie créée, toast de confirmation |

### 4.3 `updateCategory` [Server Action]

| # | Champ | Détail |
|---|---|---|
| 1 | Nom | `updateCategory` |
| 2 | Responsabilité | Modifier `nom`/`description_courte` d'une Catégorie |
| 3 | Permission requise | Administrateur |
| 4 | Entrées | Identifiant, `nom`, `slug`, `description_courte` |
| 5 | Validation Zod | `nom` requis, non vide |
| 6 | Lecture base de données | `categorie` — vérification d'unicité du `nom` et du `slug` si modifiés |
| 7 | Écriture base de données | `UPDATE categorie` (y compris `slug` si modifié) |
| 8 | Règles métier appliquées | `description_courte` alimente la métadonnée SEO de la page Catégorie (DR-007) ; slug modifiable manuellement (`technical-architecture.md` §8) |
| 9 | Gestion des erreurs | Unicité du `nom` ; unicité du `slug` |
| 10 | Invalidation de cache | Revalidation de la page Catégorie publique concernée (nom affiché, méta-description) + navigation |
| 11 | Valeur de retour | Catégorie mise à jour, toast |

### 4.4 `deleteCategory` [Server Action]

| # | Champ | Détail |
|---|---|---|
| 1 | Nom | `deleteCategory` |
| 2 | Responsabilité | Supprimer une Catégorie |
| 3 | Permission requise | Administrateur |
| 4 | Entrées | Identifiant |
| 5 | Validation Zod | Aucune (confirmation gérée par une Modal côté UI, uniquement si la suppression est autorisée) |
| 6 | Lecture base de données | Comptage `contenu_editorial WHERE categorie_id = identifiant` (tous statuts, y compris Brouillon) |
| 7 | Écriture base de données | `DELETE categorie` si aucun contenu associé |
| 8 | Règles métier appliquées | Suppression bloquée si au moins un Contenu éditorial associé, quel que soit son statut (`domain-model.md` ; `ON DELETE RESTRICT`) |
| 9 | Gestion des erreurs | `CATEGORIE_REFERENCEE` — action désactivée côté UI en amont, aucune Modal ouverte dans ce cas (`ui-specification.md`) |
| 10 | Invalidation de cache | Retrait de la navigation |
| 11 | Valeur de retour | Confirmation de suppression |

---

## 5. Gestion des zones géographiques

Symétrique de la Gestion des catégories (§4), mêmes règles (`domain-model.md` : « Règles métier identiques à celles de la Catégorie ») :

- `listZones` [Lecture] — identique à §4.1, sur `zone_geographique`.
- `createZone` [Server Action] — identique à §4.2, y compris `slug` (optionnel, généré automatiquement à partir du `nom` si absent) et l'erreur d'unicité de `slug`.
- `updateZone` [Server Action] — identique à §4.3, y compris `slug` modifiable manuellement et son erreur d'unicité ; `description_courte` alimente la méta-description de la page Zone géographique (DR-007).
- `deleteZone` [Server Action] — identique à §4.4, comptage sur `zone_id`.

---

## 6. Newsletter publique

### 6.1 `subscribeNewsletter` [Server Action]

| # | Champ | Détail |
|---|---|---|
| 1 | Nom | `subscribeNewsletter` |
| 2 | Responsabilité | Inscrire une adresse e-mail à la newsletter, ou la réactiver si désinscrite |
| 3 | Permission requise | Publique |
| 4 | Entrées | `email` |
| 5 | Validation Zod | `email` requis, format d'adresse valide (format laissé à Zod, aucune contrainte de format en base — `database-schema.md` §5) |
| 6 | Lecture base de données | `inscrit_newsletter` — recherche par `email` |
| 7 | Écriture base de données | **E-mail inconnu** : `INSERT inscrit_newsletter` (`statut = 'inscrit'`, `date_inscription = now()`, `jeton_desinscription` généré). **E-mail déjà `inscrit`** : aucune écriture. **E-mail `desinscrit`** : `UPDATE` de la ligne existante — `statut → inscrit`, `desinscrit_at → NULL`, `date_inscription → now()`, `jeton_desinscription → régénéré` |
| 8 | Règles métier appliquées | Une adresse ne peut être inscrite qu'une seule fois (`domain-model.md`) ; réinscription après désinscription = décision métier validée et détaillée en §7 (`domain-model.md`, réactivation de la ligne existante) |
| 9 | Gestion des erreurs | Aucune erreur pour un e-mail déjà inscrit — traité comme une confirmation neutre (US-019) |
| 10 | Invalidation de cache | Aucune — aucune route publique n'affiche de données Newsletter |
| 11 | Valeur de retour | Confirmation neutre affichée in situ, jamais de redirection |

### 6.2 Traitement du lien de désinscription [Lecture/traitement au rendu — pas une Server Action liée à un formulaire]

| # | Champ | Détail |
|---|---|---|
| 1 | Nom | Traitement du jeton de désinscription (page `newsletter/desinscription`) |
| 2 | Responsabilité | Désinscrire un Inscrit Newsletter via un lien à usage unique |
| 3 | Permission requise | Publique, sans connexion ni ressaisie de l'e-mail |
| 4 | Entrées | `token` (paramètre d'URL) |
| 5 | Validation Zod | Aucune (pas un formulaire) |
| 6 | Lecture base de données | `inscrit_newsletter` — recherche par `jeton_desinscription` |
| 7 | Écriture base de données | Jeton valide, `statut = 'inscrit'` : `UPDATE statut → desinscrit`, `desinscrit_at → now()`. Jeton déjà consommé, invalide ou introuvable : aucune écriture |
| 8 | Règles métier appliquées | Traitement neutre identique dans tous les cas (US-020) |
| 9 | Gestion des erreurs | Aucune — jamais un message d'erreur, y compris pour un lien déjà utilisé ou expiré |
| 10 | Invalidation de cache | Aucune |
| 11 | Valeur de retour | Confirmation neutre unique (« Vous avez été désinscrit de la newsletter »), quel que soit l'état du jeton |

---

## 7. Réinscription après désinscription — détail de la décision métier

*(Rappel isolé pour traçabilité, le comportement effectif étant déjà porté par `subscribeNewsletter`, §6.1.)*

Décision validée : une adresse désinscrite peut se réinscrire ; la ligne existante est réactivée (`statut = inscrit`, `desinscrit_at = NULL`, nouvelle `date_inscription`, nouveau `jeton_desinscription`) — jamais une nouvelle ligne, la contrainte `UNIQUE(email)` l'interdisant. L'ancien jeton, rattaché à une désinscription déjà consommée, n'est jamais réactivé.

**Note de cohérence documentaire** (déjà signalée dans `api-contracts.md` §4.2) : `domain-model.md` (cycle de vie, « état terminal ») n'a pas encore été mis à jour pour exprimer formellement cette décision — propagation à effectuer séparément, hors périmètre du présent document.

---

## 8. Administration newsletter

### 8.1 `listSubscribers` [Lecture]

| # | Champ | Détail |
|---|---|---|
| 1 | Nom | `listSubscribers` |
| 2 | Responsabilité | Lister les inscrits à la newsletter pour l'écran « Gestion newsletter » |
| 3 | Permission requise | Administrateur |
| 4 | Entrées | `page`, `email` (filtre en direct) |
| 5 | Validation Zod | `page` entier positif |
| 6 | Lecture base de données | `inscrit_newsletter WHERE statut = 'inscrit'` uniquement |
| 7 | Écriture base de données | Aucune |
| 8 | Règles métier appliquées | Un inscrit désinscrit disparaît automatiquement de cette liste, sans action de l'administrateur (`domain-model.md`) — **jamais de ligne `desinscrit` retournée** |
| 9 | Gestion des erreurs | Aucune |
| 10 | Invalidation de cache | Sans objet |
| 11 | Valeur de retour | Page courante d'inscrits actifs, paginée (20 lignes, `api-contracts.md` §1.6) |

### 8.2 `removeSubscriber` [Server Action]

| # | Champ | Détail |
|---|---|---|
| 1 | Nom | `removeSubscriber` |
| 2 | Responsabilité | Retirer manuellement un inscrit de la liste (sans passer par le jeton de désinscription) |
| 3 | Permission requise | Administrateur |
| 4 | Entrées | Identifiant de l'inscrit |
| 5 | Validation Zod | Aucune (confirmation gérée par une Modal côté UI) |
| 6 | Lecture base de données | `inscrit_newsletter` (existence) |
| 7 | Écriture base de données | `UPDATE statut → desinscrit`, `desinscrit_at → now()` — même effet que la désinscription libre-service |
| 8 | Règles métier appliquées | Retrait manuel par l'administrateur, mécanisme distinct mais équivalent à la désinscription libre-service (`domain-model.md`) |
| 9 | Gestion des erreurs | Inscrit introuvable |
| 10 | Invalidation de cache | Aucune (aucune route publique concernée) |
| 11 | Valeur de retour | Ligne retirée de la liste consultée, compteur mis à jour, toast |

**Hors périmètre V1** : aucune Server Action d'envoi de communication n'est spécifiée — l'envoi de campagnes (US-021, fonctionnalité 12 de `scope-v1.md`) est différé en V2.

---

## 9. Recherche publique

### 9.1 `searchContent` [Lecture]

| # | Champ | Détail |
|---|---|---|
| 1 | Nom | `searchContent` |
| 2 | Responsabilité | Rechercher des Contenus éditoriaux Publiés par texte libre et/ou filtres combinables |
| 3 | Permission requise | Publique |
| 4 | Entrées | `q` (texte libre), `categorie`, `zone`, `type`, `date`, `page` — portés par `searchParams` |
| 5 | Validation Zod | Tous les paramètres optionnels ; `type` appartient à l'énumération fermée si fourni |
| 6 | Lecture base de données | `contenu_editorial WHERE statut = 'publie'` — `to_tsquery('french', q)` sur `recherche_vecteur` (couvrant titre, chapô, corps et mots-clés, `database-schema.md` §4.5/§6) combiné aux filtres exacts |
| 7 | Écriture base de données | Aucune (le vecteur de recherche est maintenu par des triggers déclenchés par les Server Actions Articles, jamais par cette lecture) |
| 8 | Règles métier appliquées | Résultats limités aux contenus Publiés uniquement (Brouillon jamais visible, Archivé exclu de la recherche — DR-001) |
| 9 | Gestion des erreurs | Aucun résultat → état vide qualifié, jamais traité comme une erreur |
| 10 | Invalidation de cache | Sans objet (lecture dynamique, pilotée par `searchParams`) |
| 11 | Valeur de retour | Contenus correspondants, paginés (taille de page non fixée par les documents source — `api-contracts.md` §7.2) |

---

## 10. Contact

### 10.1 `submitContactForm` [Server Action]

| # | Champ | Détail |
|---|---|---|
| 1 | Nom | `submitContactForm` |
| 2 | Responsabilité | Transmettre un message de contact à l'administrateur |
| 3 | Permission requise | Publique |
| 4 | Entrées | `nom`, `email`, `sujet`, `message` — tous requis |
| 5 | Validation Zod | Tous les champs requis, non vides ; message d'erreur spécifique par champ manquant, focus renvoyé au premier champ en erreur (`ui-specification.md`) |
| 6 | Lecture base de données | Aucune |
| 7 | Écriture base de données | Aucune — **aucune persistance**, conformément à `database-schema.md` (aucun écran de consultation documenté) |
| 8 | Règles métier appliquées | Canal de contact direct avec l'administrateur (`sitemap.md`) |
| 9 | Gestion des erreurs | Erreur par champ à la soumission ; échec technique → message générique, saisie conservée |
| 10 | Invalidation de cache | Aucune |
| 11 | Valeur de retour | Confirmation de soumission ; notification e-mail envoyée à l'administrateur (`technical-architecture.md` §3.1) |

---

## 11. Routes publiques (lecture)

### 11.1 `getHomePageData` [Lecture]

| # | Champ | Détail |
|---|---|---|
| 1 | Nom | `getHomePageData` |
| 2 | Responsabilité | Fournir les données de l'Accueil |
| 3 | Permission requise | Publique |
| 4 | Entrées | Aucune |
| 5 | Validation Zod | Aucune |
| 6 | Lecture base de données | `contenu_editorial WHERE statut = 'publie'` — sélection bornée des plus récents ; `categorie`/`zone_geographique` phares |
| 7 | Écriture base de données | Aucune |
| 8 | Règles métier appliquées | Seuls les contenus Publiés apparaissent (`domain-model.md`) |
| 9 | Gestion des erreurs | Aucune (premier lancement → état vide neutre, `ui-specification.md`) |
| 10 | Invalidation de cache | Revalidée par les mutations Articles (§3) |
| 11 | Valeur de retour | Derniers contenus Publiés, catégories/zones phares |

### 11.2 `listPublishedArticles` [Lecture]

| # | Champ | Détail |
|---|---|---|
| 1 | Nom | `listPublishedArticles` |
| 2 | Responsabilité | Fournir la liste exhaustive et paginée des contenus Publiés (« Liste des articles ») |
| 3 | Permission requise | Publique |
| 4 | Entrées | `page`, filtres combinables (`categorie`, `zone`, `type`, `date`) |
| 5 | Validation Zod | Paramètres optionnels, `type` dans l'énumération fermée si fourni |
| 6 | Lecture base de données | `contenu_editorial WHERE statut = 'publie'`, filtré, paginé |
| 7 | Écriture base de données | Aucune |
| 8 | Règles métier appliquées | Seuls les Publiés apparaissent |
| 9 | Gestion des erreurs | Aucun résultat → état vide qualifié |
| 10 | Invalidation de cache | Revalidée par les mutations Articles |
| 11 | Valeur de retour | Contenus Publiés paginés (taille de page non fixée — `api-contracts.md` §7.2) |

### 11.3 `getArticleDetail` [Lecture]

| # | Champ | Détail |
|---|---|---|
| 1 | Nom | `getArticleDetail` |
| 2 | Responsabilité | Fournir le contenu d'un article par `slug`, avec branchement par statut |
| 3 | Permission requise | Publique |
| 4 | Entrées | `slug` |
| 5 | Validation Zod | `slug` requis |
| 6 | Lecture base de données | `contenu_editorial WHERE slug = ...` — sans filtre de statut au niveau de la requête (le branchement s'applique après lecture) |
| 7 | Écriture base de données | Aucune |
| 8 | Règles métier appliquées | Branchement strict (DR-001, `technical-architecture.md` §4.2) : introuvable ou Brouillon → « contenu introuvable » ; Publié → rendu complet, indexable ; Archivé → rendu complet identique à Publié, exclu des surfaces de découverte |
| 9 | Gestion des erreurs | Page « contenu introuvable » dédiée, jamais une page blanche |
| 10 | Invalidation de cache | Revalidée par les mutations Articles concernant ce contenu |
| 11 | Valeur de retour | Contenu complet + métadonnées SEO, ou signal « introuvable » |

### 11.4 `getCategoryPage` [Lecture]

| # | Champ | Détail |
|---|---|---|
| 1 | Nom | `getCategoryPage` |
| 2 | Responsabilité | Fournir les contenus Publiés d'une Catégorie |
| 3 | Permission requise | Publique |
| 4 | Entrées | `slug` (catégorie), `page`, filtres secondaires (`zone`, `type`, `date`) |
| 5 | Validation Zod | `slug` requis |
| 6 | Lecture base de données | `categorie WHERE slug = ...` ; `contenu_editorial WHERE statut = 'publie' AND categorie_id = ...`, filtré, paginé |
| 7 | Écriture base de données | Aucune |
| 8 | Règles métier appliquées | Seuls les Publiés apparaissent ; message neutre si aucun contenu publié |
| 9 | Gestion des erreurs | Catégorie inexistante → « contenu introuvable » |
| 10 | Invalidation de cache | Revalidée par les mutations Articles et Catégories |
| 11 | Valeur de retour | Contenus Publiés de la catégorie, paginés ; métadonnée SEO alimentée par `description_courte` (DR-007) |

### 11.5 `getZonePage` [Lecture]

Symétrique de §11.4, sur `zone_geographique`, filtre secondaire `categorie` au lieu de `zone`.

### 11.6 Archives — aucune opération dédiée

Conformément à `api-contracts.md` §3.5, aucune fonction de liste dédiée aux archives n'est spécifiée en V1 (vue différée en V2, `scope-v1.md` §13). L'accessibilité d'un contenu Archivé est intégralement couverte par `getArticleDetail` (§11.3).

---

## 12. Tableau de traçabilité

| Server Action / Opération | Contrat API (`api-contracts.md`) | Tables SQL | User Stories |
|---|---|---|---|
| `adminLogin` | §2.1 | `administrateur`, `session_administrateur` | Aucune US dédiée |
| `adminLogout` | §2.1 | `session_administrateur` | Aucune US dédiée |
| Garde d'accès session | §2.1 | `session_administrateur` | Aucune US dédiée |
| `getDashboardData` | §2.5 | `contenu_editorial`, `inscrit_newsletter` | US-026 |
| `createArticle` | §2.2 | `contenu_editorial`, `contenu_mot_cle` | US-001, US-002, US-003 |
| `updateArticle` | §2.2 | `contenu_editorial`, `contenu_mot_cle` | US-005 |
| `publishArticle` | §2.2 | `contenu_editorial` | US-004 |
| `unpublishArticle` | §2.2 | `contenu_editorial` | US-004 |
| `archiveArticle` | §2.2 | `contenu_editorial` | US-004 |
| `deleteArticle` | §2.2 | `contenu_editorial`, `contenu_mot_cle` | US-026 |
| `listArticles` | §2.2 | `contenu_editorial`, `categorie`, `zone_geographique` | US-026 |
| `getArticleForEdit` | §2.2 | `contenu_editorial`, `contenu_mot_cle`, `categorie`, `zone_geographique` | US-005 |
| `listCategories` / `listZones` | §2.3 / §2.4 | `categorie` / `zone_geographique` | US-002, US-027 |
| `createCategory` / `createZone` | §2.3 / §2.4 | `categorie` / `zone_geographique` | US-027 |
| `updateCategory` / `updateZone` | §2.3 / §2.4 | `categorie` / `zone_geographique` | US-027 |
| `deleteCategory` / `deleteZone` | §2.3 / §2.4 | `categorie` / `zone_geographique` | US-027 |
| `subscribeNewsletter` | §4.1, §4.2 | `inscrit_newsletter` | US-019 |
| Traitement du jeton de désinscription | §4.3 | `inscrit_newsletter` | US-020 |
| `listSubscribers` | §4.4 | `inscrit_newsletter` | US-021 (partiel), US-029 |
| `removeSubscriber` | §4.4 | `inscrit_newsletter` | US-021 (partiel) |
| `searchContent` | §3.3 | `contenu_editorial`, `contenu_mot_cle` | US-022, US-023 |
| `submitContactForm` | §5 | Aucune | Aucune US fondatrice |
| `getHomePageData` | §3.1 | `contenu_editorial` | US-008 |
| `listPublishedArticles` | §3.2 | `contenu_editorial` | US-002, US-004, US-008 |
| `getArticleDetail` | §3.4 | `contenu_editorial` | US-003, US-005, US-006 |
| `getCategoryPage` | §3.6 | `categorie`, `contenu_editorial` | US-002, US-004 |
| `getZonePage` | §3.7 | `zone_geographique`, `contenu_editorial` | US-002, US-004 |
| Archives (via `getArticleDetail`) | §3.5 | `contenu_editorial` | US-007 (partiel — DR-001) |

---

Aucun document existant n'a été modifié pour produire cette spécification. Aucun code TypeScript ni implémentation Prisma n'y figure.
