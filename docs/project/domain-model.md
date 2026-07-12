# Domain Model

**Modèle métier officiel — Plateforme éditoriale Corne de l'Afrique (MVP / Version 1).**
Ce document synthétise en un modèle métier unique les entités, règles, invariants et cycles de vie déjà exprimés à travers `discovery.md`, `requirements.md`, `user-stories.md`, `scope-v1.md`, `sitemap.md`, `ui-specification.md` et `frontend-specification.md`. Il ne redéfinit aucun besoin ni aucune règle : il les organise et les rend consultables comme référence métier unique.

Ce document reste strictement métier : aucune structure de données, aucun schéma, aucune considération de stockage ou d'implémentation n'y figure.

---

## Vue d'ensemble du domaine

Le domaine couvre la production, la classification et la diffusion de contenus éditoriaux par un média francophone spécialisé sur la Corne de l'Afrique, ainsi que la capture d'une audience par newsletter et la sécurisation de l'espace de gestion.

Le domaine repose sur un acteur métier unique : l'**administrateur**, qui cumule la rédaction, la publication et la gestion intégrale du site — aucune notion de rédacteur multiple, de rôle ou de permission différenciée n'existe dans ce domaine.

Deux publics distincts consomment le domaine sans jamais s'y identifier par un compte : un **public professionnel et institutionnel** (organisations internationales, chercheurs, juristes, journalistes) en quête de documentation fiable et citable, et un **grand public / diaspora** en quête d'actualité et de partage.

Le domaine du MVP est volontairement borné : il ne couvre ni les comptes utilisateurs, ni les contenus réservés, ni les abonnements payants, ni le pilotage multi-rédacteurs — ces notions appartiennent à un domaine futur (Version 2 / Version 3) et ne sont pas modélisées ici.

Cinq entités métier composent le domaine du MVP : le **Contenu éditorial**, la **Catégorie**, la **Zone géographique**, l'**Inscrit Newsletter** et le **Compte Administrateur** (et sa Session).

---

## Entités métier

### Contenu éditorial (désigné « Article » dans le reste de la documentation du produit)

**Responsabilité métier** : représenter toute publication du média (article d'actualité, analyse géopolitique, enquête, interview, dossier thématique) et porter les règles de classification, de cycle de vie et d'exposition publique qui conditionnent la mission documentaire du média.

**Description** : entité centrale du domaine. Toutes les autres entités de classification existent pour organiser et donner accès au Contenu éditorial ; c'est également l'entité que consultent, recherchent, filtrent et partagent les visiteurs.

**Attributs obligatoires** (pour la publication — non requis pour un enregistrement en brouillon) :

- Titre
- Type de contenu (une valeur parmi : article, analyse, enquête, interview, dossier thématique)
- Catégorie (une seule)
- Zone géographique (une seule)
- Image principale et son texte alternatif (couple indissociable)

**Attributs optionnels** :

- Auteur
- Sources
- Mots-clés (nombre libre, y compris zéro)
- Date de publication
- Date de dernière modification (renseignée à chaque mise à jour)

**Règles métier** :

- Un contenu est toujours rattaché à exactement une Catégorie et une Zone géographique — jamais plusieurs, jamais aucune une fois publié.
- Les champs obligatoires listés ci-dessus ne conditionnent que le passage au statut Publié ; un Brouillon peut rester incomplet sur l'ensemble de ces champs.
- Les mots-clés restent facultatifs dans tous les cas, y compris pour la publication.
- Une fois publié, un contenu reste modifiable à tout moment — cf. Point ouvert ci-dessous sur l'articulation entre date de publication et date de dernière modification.
- Un contenu peut être partagé librement par tout visiteur, sans restriction d'accès (aucune notion de contenu réservé n'existe dans ce domaine).
- Les mots-clés n'ont pas d'existence ni de gestion en dehors du Contenu éditorial auquel ils sont rattachés (pas de renommage ou de suppression transverse).

**Point ouvert** :

- Le caractère obligatoire du Corps de texte pour le passage au statut Publié n'est validé par aucun document source ; son existence en tant qu'attribut de création est confirmée (`user-stories.md`, US-001), mais aucune règle des documents source ne conditionne explicitement le passage au statut Publié à sa présence.
- Le format du champ Auteur (texte libre, ou référence à une entité structurée) n'est précisé par aucun document source ; seule son existence en tant que métadonnée facultative est validée (`requirements.md` §1.1, US-003).
- L'articulation entre la Date de publication et la Date de dernière modification (l'une figée après publication, l'autre mise à jour à chaque changement) n'est pas explicitement validée ; `requirements.md` §1.1 mentionne une date de publication comme métadonnée facultative et US-005 confirme le suivi d'une date de dernière mise à jour, mais aucun document ne précise si ces deux dates coexistent selon un comportement d'immutabilité de l'une et de mise à jour de l'autre.
- L'existence même d'un Chapô n'est validée par aucun des documents source relus (`requirements.md`, `user-stories.md`, `scope-v1.md`, `sitemap.md`).

**États possibles** : Brouillon, Publié, Archivé — cf. Cycle de vie des entités.

**Relations** :

- Contenu éditorial → Catégorie (une et une seule)
- Contenu éditorial → Zone géographique (une et une seule)
- Contenu éditorial → Mots-clés (zéro à plusieurs, non gouvernés indépendamment)

---

### Catégorie

**Responsabilité métier** : porter l'axe de classification thématique des contenus, structurant la navigation publique, les filtres de recherche et l'organisation éditoriale.

**Description** : référentiel de classification thématique (ex. actualité, analyse géopolitique, juridique, social, culturel), administré par l'administrateur unique et consommé par le Contenu éditorial pour sa classification.

**Attributs obligatoires** : Nom.

**Attributs optionnels** : aucun attribut optionnel n'est validé par les documents source relus.

**Règles métier** :

- Une catégorie peut être créée, modifiée ou supprimée par l'administrateur.
- La suppression d'une catégorie associée à au moins un contenu est interdite tant que cette association existe.
- La consultation des contenus associés à une catégorie donnée doit toujours être possible.

**Point ouvert** :

- La documentation actuelle ne tranche pas si l'ensemble des catégories constitue un référentiel fermé (limité aux valeurs identifiées à la conception) ou une liste librement extensible par l'administrateur — cf. Invariants métier.
- L'existence d'une Description courte associée à la Catégorie n'est validée par aucun document source ; elle est évoquée dans la documentation de conception sans confirmation dans `requirements.md` ni `user-stories.md`.

**États possibles** : aucun cycle de vie propre ; une catégorie existe ou n'existe plus, sans statut intermédiaire.

**Relations** : Catégorie → Contenu éditorial (une à plusieurs, relation inverse).

---

### Zone géographique

**Responsabilité métier** : porter l'axe de classification géographique des contenus, symétrique de la Catégorie.

**Description** : référentiel des pays/territoires couverts par le média (Somalie, Djibouti, Somaliland, Éthiopie, Érythrée, Kenya, Soudan), administré par l'administrateur unique et consommé par le Contenu éditorial pour sa classification.

**Attributs obligatoires** : Nom.

**Attributs optionnels** : aucun attribut optionnel n'est validé par les documents source relus.

**Règles métier** : identiques à celles de la Catégorie (création/modification/suppression par l'administrateur, suppression bloquée si des contenus sont associés).

**Point ouvert** :

- Même ambiguïté que pour la Catégorie sur le caractère fermé ou extensible de la liste — cf. Invariants métier.
- L'existence d'une Description courte associée à la Zone géographique n'est validée par aucun document source, au même titre que pour la Catégorie.

**États possibles** : aucun cycle de vie propre.

**Relations** : Zone géographique → Contenu éditorial (une à plusieurs, relation inverse).

---

### Inscrit Newsletter

**Responsabilité métier** : représenter une adresse e-mail ayant consenti à recevoir les communications du média, sans nécessiter de compte utilisateur.

**Description** : entité minimale de capture d'audience, entièrement indépendante de la notion de compte utilisateur (qui n'existe pas dans ce domaine).

**Attributs obligatoires** :

- Adresse e-mail (unique parmi les inscrits)
- Date d'inscription (renseignée automatiquement)

**Attributs optionnels** : aucun.

**Règles métier** :

- Une adresse e-mail ne peut être inscrite qu'une seule fois ; une nouvelle tentative d'inscription d'une adresse déjà inscrite est traitée comme une confirmation, jamais comme une erreur.
- L'inscription ne crée aucun compte utilisateur et n'exige aucune authentification.
- Le retrait d'un inscrit de la liste s'effectue selon deux mécanismes distincts :
  - **désinscription libre-service** : l'inscrit se désinscrit lui-même via un lien à usage unique transmis dans chaque communication envoyée, sans connexion ni ressaisie de l'adresse ;
  - **retrait manuel par l'administrateur** : l'administrateur retire un inscrit directement depuis l'espace de gestion newsletter, sans passer par le lien de désinscription ni requérir d'action de l'inscrit (`sitemap.md`, page Gestion newsletter).
- Dans les deux cas, une fois le retrait effectué, l'adresse est retirée de la liste des inscrits.
- Un inscrit désinscrit via le lien e-mail disparaît automatiquement de la liste consultée par l'administrateur, sans action de sa part.

**États possibles** : Inscrit → Désinscrit, atteint soit par désinscription libre-service (lien à usage unique), soit par retrait manuel de l'administrateur — état terminal équivalent, dans les deux cas, à une disparition de l'entité de la liste des inscrits — cf. Cycle de vie des entités.

**Relations** : entité indépendante, sans relation avec le Contenu éditorial ni les taxonomies ; le retrait manuel place le Compte Administrateur comme acteur de la transition d'état, au même titre que son rôle d'auteur implicite sur les autres entités gérées.

---

### Compte Administrateur (et Session administrateur)

**Responsabilité métier** : représenter l'unique responsable éditorial habilité à créer, publier et gérer l'ensemble des contenus et des taxonomies du domaine.

**Description** : le domaine ne prévoit qu'un seul Compte Administrateur, sans rôle ni permission différenciée. La Session administrateur est l'état d'authentification actif de ce compte, valable le temps d'une connexion.

**Attributs obligatoires** : Identifiant, mot de passe.

**Attributs optionnels** : aucun attribut supplémentaire n'est défini par la documentation actuelle.

**Point ouvert** :

- Le Compte Administrateur lui-même (par opposition à la Session) n'est décrit par aucun document au-delà du couple identifiant/mot de passe — aucune procédure de récupération d'accès n'est définie en cas de perte.
- La durée d'une Session administrateur (temps de validité avant expiration) et l'existence éventuelle d'une expiration automatique (par exemple après inactivité) ne sont précisées par aucun document source ; seule l'existence d'une déconnexion volontaire est documentée.

**Règles métier** :

- Un seul Compte Administrateur existe pour l'ensemble du domaine.
- L'accès à l'espace d'administration est strictement réservé à ce compte.
- Une tentative de connexion échouée affiche un message générique, sans désigner lequel de l'identifiant ou du mot de passe est en cause.
- La déconnexion est immédiate et réversible par reconnexion, sans confirmation préalable.

**États possibles** (Session) : Non connecté → Connecté → Non connecté (déconnexion volontaire) — cf. Cycle de vie des entités.

**Relations** : le Compte Administrateur est l'auteur implicite de toute action de gestion sur le Contenu éditorial, les Catégories et les Zones géographiques (relation d'autorité ; aucune traçabilité multi-auteurs n'existe dans ce domaine).

---

## Agrégats métier

**Agrégat Contenu éditorial** — racine : Contenu éditorial. Les mots-clés qui lui sont associés n'ont aucune identité ni cycle de vie en dehors de lui : ils appartiennent à sa frontière d'agrégat. La Catégorie et la Zone géographique, en revanche, existent indépendamment du contenu qui les référence (elles préexistent, sont partagées par plusieurs contenus et survivent à la suppression d'un contenu donné) : elles sont référencées par identité, mais **hors** de la frontière de cet agrégat.

**Agrégat Catégorie** — racine autonome : Catégorie, limitée à son nom (et, le cas échéant, à sa description — cf. Point ouvert). Ne contient pas les contenus qui la référencent.

**Agrégat Zone géographique** — racine autonome, symétrique de l'agrégat Catégorie.

**Agrégat Inscrit Newsletter** — racine autonome et isolée ; aucune autre entité du domaine n'entre dans sa frontière.

**Agrégat Compte Administrateur** — racine : Compte Administrateur. La Session administrateur est un état interne à cette frontière : elle n'a pas d'existence ni de sens en dehors du compte qu'elle authentifie.

---

## Invariants métier

- Un Contenu éditorial publié possède toujours exactement une Catégorie et une Zone géographique — jamais zéro, jamais plusieurs.
- Un Contenu éditorial en statut Brouillon n'est jamais visible en dehors de l'espace d'administration.
- Un Contenu éditorial ne peut jamais atteindre le statut Publié sans Titre, Type de contenu, Catégorie, Zone géographique, Image principale et Texte alternatif. Le statut du Corps de texte au regard de cette règle reste un Point ouvert — cf. entité Contenu éditorial.
- Les mots-clés d'un Contenu éditorial n'existent jamais indépendamment de ce contenu.
- Une Catégorie ou une Zone géographique associée à au moins un Contenu éditorial ne peut jamais être supprimée.
- Une même adresse e-mail n'apparaît jamais deux fois parmi les Inscrits Newsletter.
- Un Inscrit Newsletter désinscrit ne reçoit plus jamais de communication du média.
- Il n'existe jamais qu'un seul Compte Administrateur pour l'ensemble du domaine.
- Aucun Contenu éditorial, quel que soit son statut, n'est jamais soumis à un accès payant ou à une exigence de compte utilisateur dans ce domaine.
- **Invariant à trancher** : la liste des Catégories et des Zones géographiques ne peut pas être simultanément fermée (référentiel figé) et librement extensible (CRUD administrateur sans restriction) — un seul des deux comportements doit être retenu comme règle définitive.

---

## Cycle de vie des entités

**Contenu éditorial** : Brouillon ⇄ Publié ⇄ Archivé. Les trois états communiquent librement dans les deux sens — aucune progression strictement unidirectionnelle n'est imposée. Seule la transition **vers** Publié est soumise aux règles de champs obligatoires ; les transitions vers Brouillon ou vers Archivé restent toujours libres, quel que soit l'état de complétude du contenu.

**Inscrit Newsletter** : (inexistant) → Inscrit → Désinscrit. La transition vers Désinscrit est déclenchée soit par désinscription libre-service (l'inscrit utilise le lien à usage unique reçu par e-mail), soit par retrait manuel (l'administrateur retire l'inscrit depuis l'espace de gestion newsletter). Désinscrit est un état terminal dans les deux cas : il équivaut à la disparition de l'entité de la liste des inscrits, sans étape intermédiaire ni réinscription automatique.

**Session administrateur** : Non connecté → Connecté → Non connecté (déconnexion volontaire). Cycle répétable indéfiniment, sans limite au nombre de connexions/déconnexions successives. La possibilité d'une expiration automatique de session, indépendante de la déconnexion volontaire, reste un Point ouvert — cf. entité Compte Administrateur.

**Catégorie / Zone géographique** : (inexistante) → Existante → (Supprimée, uniquement si aucun Contenu éditorial n'y est associé). Aucun état intermédiaire.

---

## Règles métier transverses

- **Neutralité éditoriale** : aucune couleur, icône ou traitement visuel distinctif n'est jamais associé à une Catégorie ou une Zone géographique spécifique, en cohérence avec l'exigence de neutralité sur des sujets géopolitiques sensibles.
- **Étanchéité des périmètres de version** : aucune règle du domaine ne suppose de compte utilisateur, de contenu réservé ou de paiement — ces notions appartiennent à un domaine futur (Version 2 / Version 3) et ne s'appliquent pas au présent modèle.
- **Protection des taxonomies référencées** : toute suppression d'une Catégorie ou d'une Zone géographique référencée par au moins un Contenu éditorial est bloquée tant que cette référence existe.
- **Validation différenciée par intention** : la distinction entre exigences de « brouillon » et exigences de « publication » n'existe que pour le Contenu éditorial ; aucune autre entité du domaine ne connaît cette distinction.
- **Acteur unique de gestion** : le domaine ne prévoit qu'un seul acteur de gestion (l'Administrateur) ; aucune notion de rôle, de permission différenciée ou de délégation n'existe.
- **Accès libre par défaut** : toute consultation de Contenu éditorial publié est libre, sans identification ni condition d'accès, sauf les écrans de gestion réservés à l'Administrateur.

---

## Éléments présents dans certains documents mais non validés comme entités métier

### Message de contact

Une page Contact avec un « formulaire ou coordonnées de contact » est décrite dans `sitemap.md`. Aucune exigence métier fondatrice ne valide cette fonctionnalité dans `requirements.md` ni dans `user-stories.md` : aucune section de `requirements.md` ne mentionne de formulaire de contact, et aucune User Story ne couvre ce parcours. En l'absence de validation dans les documents fondateurs du besoin, cet élément n'est pas retenu comme entité métier du domaine et n'est documenté ici qu'à titre de traçabilité.

---

## Glossaire métier

- **Contenu éditorial / Article** : terme générique désignant toute publication du média, quel que soit son Type de contenu — y compris lorsque ce Type n'est pas « article » au sens strict (une « analyse » ou un « dossier thématique » reste un Article au sens de l'entité).
- **Type de contenu** : classification de la nature éditoriale d'un Contenu (article, analyse, enquête, interview, dossier thématique), distincte de la Catégorie thématique.
- **Catégorie** : axe de classification thématique d'un Contenu éditorial (ex. juridique, social, culturel).
- **Zone géographique** : axe de classification par pays ou territoire couvert par le média.
- **Mot-clé** : terme libre associé à un Contenu éditorial à des fins de classement et de recherche, sans existence ni gestion en dehors de ce contenu.
- **Statut** : état du cycle de vie d'un Contenu éditorial (Brouillon, Publié, Archivé).
- **Inscrit Newsletter** : adresse e-mail ayant consenti à recevoir les communications du média.
- **Lien de désinscription** : mécanisme d'identification à usage unique permettant à un Inscrit Newsletter de se désinscrire sans authentification.
- **Compte Administrateur** : identité unique habilitée à gérer l'ensemble du domaine métier.
- **Session administrateur** : état d'authentification actif du Compte Administrateur.
- **MVP (Version 1)** : périmètre fonctionnel couvert par le présent modèle métier — exclut les comptes utilisateurs, les contenus réservés et les abonnements payants (Version 2), ainsi que le tableau de bord d'indicateurs et l'ouverture à de futurs contributeurs (Version 3).
