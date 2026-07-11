# Implementation Roadmap — Plateforme éditoriale Corne de l'Afrique (MVP)

**Plan de développement complet du frontend MVP.**
Ce document découle de l'analyse intégrale de `ui-specification.md` (référence visuelle et comportementale) et `frontend-specification.md` (référence d'architecture et d'organisation du code). Il ne redéfinit ni le design ni l'architecture : il séquence leur mise en œuvre dans un ordre optimal, phase par phase, en explicitant les dépendances techniques qui imposent cet ordre.

Périmètre couvert : strictement le MVP (`scope-v1.md`) — 10 écrans publics, 5 écrans administrateur. Aucune tâche V2/V3 n'est planifiée ici.

Aucun code n'est produit dans ce document : uniquement la séquence de développement, ses livrables et ses critères de validation.

---

## Principe d'ordonnancement

L'ordre de développement suit la chaîne de dépendance technique, pas l'ordre de priorité métier ni l'ordre du sitemap :

1. **Ce qui n'a besoin de rien d'autre est construit en premier** : tokens de design, primitives, composants partagés sans logique métier.
2. **Le contenu en lecture seule précède l'interactivité** : une page publique statique peut être construite et validée avant qu'un formulaire ou un filtre ne lui soit ajouté.
3. **Un pattern n'est établi qu'une seule fois puis réutilisé** : le premier formulaire construit (Newsletter) fixe le pattern de validation/action serveur réutilisé tel quel par tous les formulaires suivants, y compris administrateur — il n'est pas réinventé phase après phase.
4. **L'authentification administrateur précède toute page administrateur protégée**, sans exception.
5. **Une taxonomie (catégorie/zone) doit exister avant l'écran qui la consomme** : la gestion des catégories/zones est construite avant l'éditeur d'article, qui en dépend pour sa classification.
6. **Le Dashboard est construit en dernier côté administrateur** : il agrège des données (articles, inscrits newsletter) qui doivent déjà exister pour être comptées et listées.
7. **La qualité transverse (accessibilité, performance, SEO) n'est pas une phase finale isolée** : elle est vérifiée à la fin de chaque phase sur le périmètre déjà livré, puis auditée globalement en fin de projet — pour éviter un rattrapage coûteux en fin de développement.

---

## Dépendance technique externe : l'API backend

D'après `deployment.md`, le frontend consomme une API backend (Node.js/Express, MySQL). Cette dépendance externe conditionne l'intégration finale de chaque route dynamique, mais ne doit pas bloquer le développement frontend :

- Chaque feature peut être développée et validée visuellement/comportementalement contre un jeu de données simulé, dès lors que le contrat de données (formes des objets Article, Catégorie, Zone, Inscrit newsletter, statut de session) est stabilisé en amont de la phase concernée.
- Le **contrat de données doit être figé avant le début de chaque phase qui en dépend** (ex. la forme d'un Article avant la Phase 1, la forme d'une session administrateur avant la Phase 4) — un changement de contrat après le début d'une phase revient à rouvrir cette phase.
- La validation finale d'une phase (« critères de validation ») suppose une intégration à l'API réelle, pas seulement aux données simulées — une phase n'est définitivement close qu'après cette bascule.

---

## Vue d'ensemble des phases

| Phase | Nom                                     | Dépend de                                      | Contenu principal                                                                        |
| ----- | --------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 0     | Fondations & design system              | —                                              | Tokens, primitives shadcn/ui, composants partagés sans logique métier                    |
| 1     | Pages publiques de lecture              | Phase 0                                        | Accueil, Liste des articles, Détail d'un article, Catégorie, Zone géographique, À propos |
| 2     | Recherche et filtrage                   | Phase 1                                        | Route unique `/recherche` (formulaire + résultats pilotés par les paramètres d'URL), filtres combinables |
| 3     | Formulaires publics & validation        | Phase 0 (Phase 1 pour les emplacements inline) | Newsletter (3 emplacements), Contact, pattern de validation/action serveur               |
| 4     | Authentification & shell administrateur | Phase 0                                        | Connexion administrateur, session, layout protégé (sidebar)                              |
| 5     | Administration des contenus             | Phase 3 (pattern formulaire), Phase 4 (shell)  | Gestion des catégories/zones, Éditeur d'article, Gestion des articles                    |
| 6     | Dashboard & gestion newsletter admin    | Phase 3, Phase 5                               | Dashboard, Gestion newsletter admin                                                      |
| 7     | Qualité transverse                      | Phases 0 à 6                                   | Accessibilité, performance, SEO, responsive — audit global                               |
| 8     | Recette et stabilisation                | Toutes                                         | Parcours de bout en bout, non-régression, correction finale                              |

Les Phases 1 à 4 peuvent être menées par des personnes différentes en parallèle une fois la Phase 0 livrée (aucune dépendance croisée entre elles), à l'exception des emplacements inline de la newsletter (bandeau Accueil, bloc fin d'article) qui nécessitent que les pages correspondantes de la Phase 1 existent déjà. Les Phases 5 et 6, en revanche, sont strictement séquentielles.

---

## Phase 0 — Fondations & design system

### Objectif

Mettre en place tout ce dont dépend visuellement et structurellement le reste du projet, de sorte qu'aucune phase suivante n'ait à revenir sur un token, une primitive ou un composant partagé faute d'avoir été anticipé.

### Composants et éléments à développer en premier

1. **Tokens de design** (`app/globals.css`) : couleurs, échelle typographique, échelle d'espacement, rayons, durées de transition, breakpoints (600px/1024px) — traduction directe de la table de tokens de `ui-specification.md`.
2. **Layout racine** (`app/layout.tsx`) : document HTML, chargement des trois polices (`font.editorial`, `font.ui`, `font.mono`), landmarks globaux.
3. **Primitives shadcn/ui strictement nécessaires** : Button, Input, Textarea, Select, Checkbox, RadioGroup, Dialog, composant de toast, Badge, Card — installées puis alignées sur les tokens (couleur, rayon, typographie).
4. **Composants partagés sans logique métier** (`components/shared/`) : `Skeleton`, `EmptyState`, `LiveRegion`, `StatusPill`, `Tag`, `Modal` (au-dessus de Dialog), `Toast`/`Alert` (au-dessus du composant de toast).
5. **Utilitaires de support** (`lib/`) : formatage de dates, génération/lecture de slugs, constantes partagées.

### Livrables

- Design tokens intégralement déclarés et vérifiables (aucune valeur ad hoc possible en dehors de l'échelle définie).
- Bibliothèque de primitives shadcn/ui installées, thémées, documentées par l'usage (quel composant pour quel rôle).
- Composants partagés `Skeleton`, `EmptyState`, `LiveRegion`, `StatusPill`, `Tag`, `Modal`, `Toast`/`Alert` fonctionnels et testés isolément (indépendamment de toute page réelle).

### Critères de validation

- [ ] Aucune couleur, espacement, rayon ou durée n'est utilisé hors de l'échelle de tokens dans les composants livrés.
- [ ] Chaque primitive shadcn/ui installée correspond à un besoin identifié dans `ui-specification.md` (aucune primitive non utilisée n'a été ajoutée par anticipation).
- [ ] Les trois polices se chargent sans saut de mise en page (CLS) mesurable.
- [ ] `Modal` piège le focus à l'ouverture et le restitue à la fermeture ; `Toast`/`Alert` sont annoncés en live-region.
- [ ] Chaque composant partagé possède tous ses états requis (repos, survol, focus, désactivé, chargement) tels que définis en §États des composants de `ui-specification.md`.

---

## Phase 1 — Pages publiques de lecture

### Objectif

Livrer l'intégralité du contenu public consultable en lecture seule, sans aucune interactivité de formulaire ni de recherche — la plus grande surface du produit, et celle qui valide le plus tôt possible le rendu réel du design system sur du contenu long et dense.

### Composants à développer en premier

1. `ArticleCard` (variante grille, puis variante liste) — le composant le plus réutilisé du produit, condition de toutes les pages de listing suivantes.
2. `Breadcrumb` (desktop) / lien "← Retour" (mobile).
3. `Pagination` (numérotée desktop ; "Charger plus" mobile).
4. Navigation publique (header desktop + header condensé mobile, menu tiroir mobile) et footer — layout `(public)`.
5. Barre de partage (desktop flottante / mobile fixe), utilisée par le Détail d'un article.

### Routes à développer en premier

1. **Détail d'un article** — la page la plus riche en règles (métadonnées, ordre Type · Catégorie · Zone · Date, contenus liés, partage) ; la construire en premier permet de valider `ArticleCard` et la colonne de lecture avant de les réutiliser ailleurs.
2. **Liste des articles** — réutilise `ArticleCard` (grille) et `Pagination`.
3. **Catégorie** / **Zone géographique** — réutilisent la même grille, avec omission contextuelle de la dimension déjà donnée par la page.
4. **Accueil** — construite après les pages qu'elle met en avant, puisqu'elle recompose leurs mêmes composants (À la une, pills catégories/zones).
5. **À propos** — contenu institutionnel statique, sans dépendance particulière, peut être traité à tout moment de la phase.

Les pages **Mentions légales** et **Politique de confidentialité** sont volontairement reportées en fin de Phase 1 ou en Phase 7 : contenu statique sans risque, elles n'apportent aucune valeur d'apprentissage sur le design system et ne doivent pas retarder les pages à plus forte dépendance.

### Livrables

- Layout public (navigation + footer) strictement identique sur toutes les pages publiques.
- Accueil, Liste des articles, Détail d'un article, Catégorie, Zone géographique, À propos, Mentions légales, Politique de confidentialité intégralement rendues avec données réelles ou simulées conformes au contrat de données.
- États vides qualifiés et squelettes de chargement pour chaque grille/liste.

### Critères de validation

- [ ] Navigation principale et footer strictement identiques sur les 8 écrans livrés dans cette phase.
- [ ] Ordre de métadonnées Type · Catégorie · Zone · Date respecté avec omission contextuelle correcte selon l'écran.
- [ ] Aucune fonction retirée entre les trois breakpoints (mobile/tablette/desktop) sur chacune de ces pages.
- [ ] Chaque grille/liste dispose d'un état vide qualifié et d'un squelette de chargement de même forme que le contenu final.
- [ ] Chaque page dispose d'un chemin de retour (breadcrumb, "← Retour" ou nav principale) — aucune impasse.
- [ ] Fil d'Ariane / lien "← Retour" fonctionnels sur Liste des articles, Détail d'un article, Catégorie, Zone géographique.

---

## Phase 2 — Recherche et filtrage

### Objectif

Ajouter la couche d'interactivité de consultation (recherche par mots-clés, filtres combinables) au-dessus du contenu déjà livré en Phase 1, en établissant le pattern d'état porté par l'URL qui garantit la persistance de contexte exigée par `ui-specification.md`.

### Composants à développer en premier

1. `SearchBar` — complète les trois variantes (header desktop déjà esquissé en Phase 1, overlay mobile plein écran, champ pleine largeur de la page dédiée).
2. `FilterBar` (ligne de pills desktop) / `FilterPanel` (panneau bas mobile) — dimensions communes catégorie/zone/type/date, combinables.

### Routes à développer en premier

1. **Recherche et Résultats de recherche** — une route unique (`/recherche`), jamais scindée en deux fichiers : formulaire de saisie affiché en l'absence de paramètre de requête, résultats pilotés entièrement par les paramètres d'URL (requête + filtres) dès qu'une requête est présente — condition de la persistance de contexte au retour depuis un article.
2. Application rétroactive des filtres sur **Liste des articles**, **Catégorie**, **Zone géographique** (déjà livrées en Phase 1, mais sans filtres jusqu'à cette phase).

### Livrables

- Recherche et filtrage fonctionnels sur les quatre écrans concernés (Liste, Résultats, Catégorie, Zone).
- Compteur de résultats annoncé en live-region, mis à jour à chaque changement de filtre.
- État vide qualifié spécifique à l'absence de résultat (reformulation + réinitialisation des filtres).

### Critères de validation

- [ ] La requête et les filtres actifs sont conservés lors d'un retour depuis un article consulté (navigateur, breadcrumb, "← Retour").
- [ ] Le lien "Réinitialiser les filtres" est systématiquement présent dès qu'un filtre est actif, sur les quatre écrans concernés.
- [ ] Le raccourci clavier Entrée soumet la recherche indépendamment du clic sur l'icône/bouton.
- [ ] Aucun résultat n'est traité comme une erreur ; le compteur de résultats est annoncé aux technologies d'assistance.
- [ ] Comportement responsive conforme à l'arbitrage acté (pills desktop / bouton "Filtrer" + panneau bas mobile).

---

## Phase 3 — Formulaires publics & validation

### Objectif

Établir, sur les deux formulaires publics les plus simples du produit, le pattern de validation et d'action serveur qui sera réutilisé sans modification par tous les formulaires administrateur des Phases 5 et 6. C'est la phase qui fixe la convention, pas seulement deux formulaires isolés.

### Composants à développer en premier

1. **Newsletter** (champ unique) — le formulaire le plus simple du produit, construit en premier pour fixer le pattern minimal (validation à la soumission, message spécifique, focus renvoyé, saisie conservée en cas d'échec, confirmation in situ sans redirection).
2. **Contact** (multi-champs) — réutilise le pattern déjà validé sur un cas à plusieurs champs requis.
3. **Désinscription newsletter** (écran de confirmation, sans formulaire) — réutilise l'infrastructure de traitement de jeton, pas le pattern de validation de formulaire.

### Routes / emplacements à développer en premier

1. Page **Newsletter** dédiée (formulaire pleine page) en premier, car isolée de toute autre page.
2. Emplacements inline de la Newsletter (bandeau Accueil, bloc fin d'article) ensuite, une fois le composant validé isolément — ils réutilisent le même composant, pas une réimplémentation.
3. Page **Contact**.
4. Page **Désinscription newsletter** (`/newsletter/desinscription`) — atteinte uniquement depuis le lien d'un e-mail, jamais depuis la navigation ou le footer.

### Livrables

- Pattern de validation/action serveur documenté par l'exemple (schéma de validation, gestion d'erreur, conservation de saisie, focus, indicateur de chargement inline sur bouton).
- Newsletter fonctionnelle sur ses trois emplacements avec traitement neutre du cas "déjà inscrit".
- Contact fonctionnel avec validation par champ à la soumission.
- Désinscription newsletter fonctionnelle par lien à jeton, avec confirmation neutre y compris en cas de lien déjà utilisé ou expiré.

### Critères de validation

- [ ] Validation déclenchée à la soumission (jamais uniquement au blur), puis revalidation en temps réel après une première erreur affichée.
- [ ] Message d'erreur spécifique et actionnable sur chaque champ concerné, jamais générique.
- [ ] Focus renvoyé automatiquement au premier champ en erreur après soumission refusée.
- [ ] Saisie utilisateur conservée après un échec technique (réseau/serveur).
- [ ] "Déjà inscrit" traité comme une confirmation neutre, jamais comme une erreur.
- [ ] Mention de confidentialité toujours visible et lisible sur les trois emplacements Newsletter.
- [ ] Confirmation Newsletter affichée in situ (remplacement du formulaire), jamais par redirection.
- [ ] La désinscription ne nécessite aucune connexion ni ressaisie de l'e-mail ; un lien déjà utilisé ou expiré affiche la même confirmation neutre qu'un lien valide, jamais une erreur.

---

## Phase 4 — Authentification & shell administrateur

### Objectif

Construire la porte d'entrée et l'ossature de tout l'espace administrateur avant toute page protégée — aucun écran de gestion ne peut être développé avant que cette phase ne soit close, puisque chacun d'eux vit derrière cette garde.

### Composants à développer en premier

1. Formulaire de **Connexion administrateur** (réutilise le pattern de la Phase 3 : validation à la soumission, message générique d'échec, mot de passe vidé/identifiant conservé).
2. Mécanisme de session et garde d'accès (vérification à deux niveaux : en amont des routes protégées, puis dans le layout protégé).
3. **Sidebar administrateur** (Dashboard/Articles/Catégories/Newsletter + "Voir le site ↗"/"Déconnexion") et layout protégé associé.
4. Message d'orientation desktop-only (sous 1024px), traité en CSS pur.

### Routes à développer en premier

1. **Connexion administrateur** — sans dépendance, en tout premier.
2. Layout protégé (coquille vide avec sidebar, avant tout contenu de page) — validé avec une page de test minimale avant d'y brancher le Dashboard ou toute gestion en Phase 5.

### Livrables

- Connexion fonctionnelle, session établie, déconnexion opérationnelle depuis n'importe quel écran admin.
- Layout protégé avec sidebar identique, prêt à accueillir les quatre écrans post-connexion des Phases 5 et 6.
- Message d'orientation desktop-only vérifié sous 1024px.

### Critères de validation

- [ ] Échec de connexion : message générique "Identifiant ou mot de passe incorrect", mot de passe vidé, identifiant conservé.
- [ ] Accès direct à une URL protégée sans session : redirection vers la Connexion, sans exposer de contenu.
- [ ] Sidebar strictement identique sur la coquille de test des quatre écrans post-connexion.
- [ ] Déconnexion accessible depuis n'importe quel écran admin, sans confirmation (action réversible par reconnexion).
- [ ] Sous 1024px, le message d'orientation s'affiche à la place du layout — aucun layout dégradé rendu.

---

## Phase 5 — Administration des contenus

### Objectif

Livrer l'outil de travail quotidien de l'administrateur unique, dans l'ordre qui respecte la dépendance de classification : les catégories/zones doivent exister et être gérables avant que l'éditeur d'article ne puisse s'appuyer dessus pour la classification, et l'éditeur doit exister avant que la liste ne puisse renvoyer vers lui.

### Composants et routes à développer en premier

1. **Gestion des catégories/zones** — la plus simple des trois (formulaire inline nom + description, table, suppression conditionnée à l'absence d'article associé) ; construite en premier car l'Éditeur d'article en dépend pour peupler ses champs de classification. Les tags ne font pas partie de cet écran : ils sont créés et supprimés uniquement depuis l'Éditeur d'article, sans gestion globale en V1.
2. **Éditeur d'article** — la pièce la plus complexe du produit (contenu rédactionnel, type de contenu, classification à choix unique catégorie/zone toutes deux obligatoires, tags multi-valués optionnels, image principale + texte alternatif, métadonnées, statut à 3 segments, règles de validation différenciées Enregistrer/Publier) ; construite une fois la classification disponible.
3. **Gestion des articles** (liste back-office) — construite en dernier dans cette phase car elle relie les deux précédentes (navigation vers l'éditeur, filtrage par statut/catégorie/zone) sans rien apporter de nouveau tant qu'aucun article n'existe encore à afficher.

### Livrables

- Gestion des catégories/zones : création, modification, suppression conditionnée, table avec nombre d'articles associés.
- Éditeur d'article : création et modification, type de contenu/catégorie/zone (choix unique, obligatoires) et tags (optionnels, multi-valués), image principale avec texte alternatif, statut à 3 segments, validation différenciée brouillon/publication, toast de confirmation.
- Gestion des articles : table avec tri (date, statut), filtre interne, pagination, navigation vers l'éditeur.

### Critères de validation

- [ ] "Supprimer" une catégorie/zone est désactivé et n'ouvre aucune Modal si des articles y sont associés ; un message explicite en indique la raison.
- [ ] Le titre, le type de contenu, la catégorie, la zone géographique et l'image principale (avec texte alternatif) sont requis pour "Publier" mais pas pour "Enregistrer le brouillon" ; les tags restent optionnels dans tous les cas.
- [ ] Un contenu n'est jamais associé à plus d'une catégorie ou plus d'une zone géographique.
- [ ] Chaque action de sauvegarde/publication produit un toast explicite ("✓ Brouillon enregistré" / "✓ Article publié").
- [ ] La table Articles trie uniquement sur Date et Statut, colonne Actions toujours en dernière position, actions destructives séparées d'au moins 12px des actions non destructives.
- [ ] Aucune suppression directe depuis une table sans passage par une Modal de confirmation.
- [ ] Une fois un article publié en Phase 5, il apparaît correctement sur les pages publiques de la Phase 1/2 (revalidation vérifiée de bout en bout).

---

## Phase 6 — Dashboard & gestion newsletter admin

### Objectif

Clore l'espace administrateur avec les deux écrans qui agrègent des données produites par les phases précédentes — ils n'ont de sens qu'une fois qu'il existe réellement des articles (Phase 5) et des inscrits newsletter (Phase 3) à afficher.

### Composants et routes à développer en premier

1. **Gestion newsletter** (table des inscrits, recherche par e-mail, retrait via Modal de confirmation) — construite en premier dans cette phase, car plus simple que le Dashboard et réutilise directement les composants de table déjà stabilisés en Phase 5.
2. **Dashboard** — construit en dernier de tout le projet côté fonctionnel : cartes de comptage (Articles publiés, Brouillons, Inscrits newsletter) et table des derniers articles modifiés, qui dépendent de la disponibilité de toutes les données précédentes pour être vérifiables.

### Livrables

- Gestion newsletter : table, recherche en direct, retrait avec confirmation, compteur mis à jour.
- Dashboard : 3 cartes de comptage, table des 5 derniers articles modifiés, action rapide "+ Nouvel article", état vide de premier lancement.

### Critères de validation

- [ ] Retrait d'un inscrit : passe par une Modal de confirmation, compteur mis à jour, toast affiché.
- [ ] Dashboard : aucun graphique ni statistique avancée — uniquement des chiffres statiques par rafraîchissement de page.
- [ ] Action "+ Nouvel article" toujours visible sans scroll sur une résolution desktop standard (1024×768).
- [ ] Ligne de table cliquable dans son ensemble (Dashboard et Gestion des articles) ouvre l'éditeur correspondant.
- [ ] État de premier lancement (0 article, 0 inscrit) : compteurs à 0 sans alerte, invitation neutre à créer un premier article.

---

## Phase 7 — Qualité transverse (accessibilité, performance, SEO, responsive)

### Objectif

Auditer globalement, sur l'ensemble des 15 écrans livrés, ce qui n'a pu être vérifié qu'écran par écran pendant les phases précédentes — en particulier les exigences qui ne se révèlent qu'à l'échelle du produit entier (cohérence de la hiérarchie de titres d'une page à l'autre, budget de performance global, complétude du plan de site).

### Livrables

- Audit d'accessibilité complet (contraste, focus clavier, structure sémantique, live-regions, alt-text) sur les 15 écrans.
- Vérification de performance (poids des pages, absence de saut de mise en page, streaming/squelettes) sur les gabarits les plus lourds (Détail d'un article, Liste des articles, Résultats de recherche).
- Métadonnées, données structurées, plan de site et exclusion d'indexation de l'espace administrateur vérifiés route par route.
- Repasse responsive complète sur les trois breakpoints pour les 10 écrans publics.

### Critères de validation

- [ ] Contraste ≥ 7:1 (corps de texte) et ≥ 4.5:1 (métadonnées) vérifié sur chaque paire texte/fond réellement utilisée, y compris `color.accent.warm`.
- [ ] Focus clavier visible et cohérent sur 100% des éléments interactifs des 15 écrans.
- [ ] Un seul `h1` par page, hiérarchie de titres sans saut de niveau, sur l'ensemble du site.
- [ ] Plan de site généré ne contient que du contenu publié ; robots exclut intégralement `/admin`.
- [ ] Aucune fonction retirée entre breakpoints sur l'ensemble des 10 écrans publics (vérification exhaustive du tableau §Responsive de `ui-specification.md`).
- [ ] Aucune régression sur les critères déjà validés phase par phase (relecture des checklists de `ui-specification.md` et `frontend-specification.md`).

---

## Phase 8 — Recette et stabilisation

### Objectif

Valider le produit dans son ensemble à travers les parcours utilisateurs et administrateur définis par `ui-specification.md`, plutôt qu'écran par écran, puis stabiliser avant mise en production.

### Livrables

- Exécution complète des quatre parcours publics (découverte via partage, recherche documentaire ciblée, exploration thématique, évaluation de crédibilité institutionnelle) et des cinq parcours administrateur (connexion, création/modification d'article, gestion des catégories/zones, gestion de la newsletter, déconnexion).
- Journal de bugs et corrections, priorisé par sévérité (bloquant / majeur / mineur).
- Vérification finale des deux checklists de conformité (`ui-specification.md` et `frontend-specification.md`) sur le produit complet.

### Critères de validation

- [ ] Les neuf parcours (§Parcours utilisateurs et §Parcours administrateur de `ui-specification.md`) s'exécutent de bout en bout sans blocage.
- [ ] Aucun bug bloquant ou majeur ouvert.
- [ ] Les deux checklists de conformité sont intégralement cochées sur le produit final, pas seulement phase par phase.
- [ ] Aucune fonctionnalité V2/V3 n'a été introduite dans l'interface livrée (vérification finale du périmètre).

---

## Stratégie de tests

La stratégie de tests suit la même logique de dépendance que les phases : elle commence au niveau le plus bas (règles de validation, composants isolés) et remonte vers les parcours complets, sans attendre la fin du projet pour commencer.

| Niveau                           | Portée                                                                                 | Introduit à partir de                                              | Objectif                                                                                                                                                                                     |
| -------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tests de schémas et utilitaires  | Règles de validation (schémas des formulaires), fonctions de formatage/slug            | Phase 0 / Phase 3                                                  | Garantir que chaque règle de `ui-specification.md` (message spécifique, champ requis conditionnel) est vérifiable indépendamment de l'interface                                              |
| Tests de composants              | Composants partagés (`components/ui`, `components/shared`) et composants métier isolés | Phase 0, puis à chaque nouveau composant                           | Vérifier les états requis (repos, survol, focus, désactivé, chargement, erreur, vide) et les comportements d'accessibilité (piégeage de focus, live-region) indépendamment d'une page réelle |
| Tests d'intégration par feature  | Une route ou un formulaire complet, données simulées conformes au contrat              | À la fin de chaque phase (1 à 6)                                   | Valider les critères de validation de la phase avant de la considérer close                                                                                                                  |
| Tests de bout en bout (parcours) | Parcours utilisateurs et administrateur complets, données réelles ou proches du réel   | Dès qu'un parcours est entièrement livré (au plus tard Phase 8)    | Valider la continuité d'un parcours à travers plusieurs écrans, pas seulement chaque écran pris isolément                                                                                    |
| Audit d'accessibilité automatisé | Ensemble des écrans livrés                                                             | À la fin de chaque phase, consolidé en Phase 7                     | Détecter les régressions de contraste, de structure sémantique et d'attributs ARIA au fil de l'avancement, pas uniquement à la fin                                                           |
| Vérification responsive          | Trois breakpoints (mobile/tablette/desktop) sur les écrans publics                     | À la fin de chaque phase publique (1, 2, 3), consolidée en Phase 7 | Confirmer qu'aucune fonction n'est retirée entre breakpoints, conformément au principe général de `ui-specification.md`                                                                      |

Principes transverses :

- Un composant partagé n'est considéré livré (Phase 0) que si ses tests d'états et d'accessibilité passent isolément — les phases suivantes en héritent sans avoir à les revérifier à chaque réutilisation.
- Le pattern de validation/action serveur établi en Phase 3 est testé une fois en profondeur ; les formulaires administrateur des Phases 5 et 6 ne retestent que leurs règles spécifiques (ex. titre requis pour publier), pas le mécanisme générique déjà couvert.
- Aucun test de non-régression global n'est reporté à la Phase 8 par défaut : la Phase 8 consolide et exécute les parcours de bout en bout, mais chaque phase précédente ferme ses propres critères de validation avant de passer à la suivante.
- `test-plan.md` reste le document de suivi d'exécution (quoi a été testé, quand, avec quel résultat) ; ce document définit la stratégie qui alimente ce suivi, pas l'inverse.

---

_Ce document est la référence unique pour l'ordonnancement du développement frontend du MVP. Il se lit conjointement avec `ui-specification.md` (référence visuelle et comportementale), `frontend-specification.md` (référence d'architecture) et `scope-v1.md` (référence de périmètre). Toute réorganisation de phase doit être reportée ici avant d'être appliquée en développement._
