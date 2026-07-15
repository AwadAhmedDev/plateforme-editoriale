# Development Tasks — Backlog Trello (MVP)

**Traduction du plan de développement en backlog exploitable dans Trello.**
Ce document découle de l'analyse intégrale de `implementation-roadmap.md` (séquencement en 9 phases), `frontend-specification.md` (architecture, composants, features) et `ui-specification.md` (règles visuelles et comportementales, critères de conformité). Chaque tâche ci-dessous est une traduction directe d'un livrable déjà défini dans ces trois documents — aucune tâche nouvelle n'est introduite ici, seul le découpage en cartes exploitables change.

Aucun code n'est produit dans ce document : uniquement des tâches, sous-tâches, dépendances, estimations et critères d'acceptation.

---

## Comment lire ce backlog comme un board Trello

| Concept Trello                         | Correspondance dans ce document                                                                                                                                       |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Board**                              | Le projet "Plateforme éditoriale Corne de l'Afrique — Frontend MVP"                                                                                                   |
| **Liste** (colonne)                    | Une phase du roadmap (`## Liste : Phase X`) — 9 listes, dans l'ordre où elles doivent être créées sur le board                                                        |
| **Carte**                              | Une tâche (`### Carte : [ID] Titre`) — à créer telle quelle dans la liste correspondante                                                                              |
| **Étiquettes (labels)**                | Domaine (`Design system` / `Frontend public` / `Frontend admin` / `Qualité transverse`) + taille d'estimation — à recréer comme étiquettes de couleur dans Trello     |
| **Champ personnalisé "Estimation"**    | Taille au format T-shirt (XS/S/M/L/XL), convertie en jours-personne indicatifs — à recréer via le Power-Up "Champs personnalisés" ou en complément du nom de la carte |
| **Description de la carte**            | Le paragraphe "Objectif" de chaque carte                                                                                                                              |
| **Checklist "Sous-tâches"**            | Liste à cases à cocher — importable telle quelle comme première checklist de la carte                                                                                 |
| **Checklist "Critères d'acceptation"** | Deuxième checklist de la carte — la carte n'est déplacée en "Terminé" que lorsque cette checklist est intégralement cochée                                            |
| **Champ "Dépend de"**                  | À reporter en haut de la description de la carte, ou via des liens de carte à carte (Trello permet de lier des cartes)                                                |

Chaque carte porte un identifiant `P<phase>-T<numéro>` (ex. `P0-T1`) pour permettre de référencer une dépendance sans dupliquer l'intitulé complet — cet identifiant peut être conservé en préfixe du titre de la carte Trello.

**Échelle d'estimation** (indicative, un seul développeur frontend, à ajuster selon vélocité réelle) :

| Taille | Charge indicative |
| ------ | ----------------- |
| XS     | 0,5 j             |
| S      | 1 j               |
| M      | 2 à 3 j           |
| L      | 3 à 5 j           |
| XL     | 5 à 8 j           |

---

## Vue d'ensemble du board

| Liste (Phase)                                     | Nombre de cartes | Estimation totale indicative  |
| ------------------------------------------------- | ---------------- | ----------------------------- |
| Phase 0 — Fondations & design system              | 8                | ~10 j                         |
| Phase 1 — Pages publiques de lecture              | 13               | ~20 j                         |
| Phase 2 — Recherche et filtrage                   | 4                | ~10 j                         |
| Phase 3 — Formulaires publics & validation        | 5                | ~8 j                          |
| Phase 4 — Authentification & shell administrateur | 4                | ~6 j                          |
| Phase 5 — Administration des contenus             | 4                | ~12 j                         |
| Phase 6 — Dashboard & gestion newsletter admin    | 3                | ~4 j                          |
| Phase 7 — Qualité transverse                      | 4                | ~9 j                          |
| Phase 8 — Recette et stabilisation                | 4                | ~7 j                          |
| **Total**                                         | **49 cartes**    | **~86 j-personne indicatifs** |

Les Listes Phase 1 à Phase 4 peuvent progresser en parallèle sur le board une fois la Liste Phase 0 vidée (aucune dépendance croisée entre elles, hors deux cartes explicitement signalées). Les Listes Phase 5 et Phase 6 restent strictement séquentielles derrière Phase 4.

---

## Liste : Phase 0 — Fondations & design system

### Carte : [P0-T1] Déclarer les design tokens

**Étiquettes** : Design system · Estimation S (1-2 j)
**Description** : Traduire la table de tokens de `ui-specification.md` (§Design Tokens) en variables Tailwind v4 (`app/globals.css`, bloc `@theme`), condition préalable à tout composant.
**Dépend de** : Aucune — première carte du board.

Checklist — Sous-tâches :

- [ ] Déclarer les tokens de couleur (`color.bg.*`, `color.text.*`, `color.accent.*`, `color.status.*`, `color.error`, `color.disabled.*`)
- [ ] Déclarer les trois familles typographiques (`font.editorial`, `font.ui`, `font.mono`) et leurs poids
- [ ] Déclarer l'échelle d'espacement unique (4/8/12/16/24/32/48/64/96)
- [ ] Déclarer les rayons (`radius.sm`, `radius.pill`, `radius.circle`) et élévations (`elevation.none`, `elevation.raised`)
- [ ] Déclarer les durées de transition (`transition.fast` 120ms, `transition.panel` 200ms)
- [ ] Redéfinir les breakpoints Tailwind à 600px (tablette) et 1024px (desktop)

Checklist — Critères d'acceptation :

- [ ] Aucune valeur de couleur, espacement, rayon ou durée n'existe hors de cette déclaration
- [ ] Chaque token du tableau `ui-specification.md` a un équivalent utilisable en classe utilitaire
- [ ] Les breakpoints personnalisés correspondent exactement à 600px/1024px, pas aux valeurs par défaut de Tailwind

---

### Carte : [P0-T2] Construire le layout racine et charger les polices

**Étiquettes** : Design system · Estimation XS (0,5-1 j)
**Description** : Mettre en place `app/layout.tsx` (document HTML, landmarks globaux) et l'optimisation des trois polices auto-hébergées.
**Dépend de** : P0-T1

Checklist — Sous-tâches :

- [ ] Structurer le document HTML racine (`html`/`body`, `lang`)
- [ ] Charger `font.editorial`, `font.ui`, `font.mono` via l'optimisation de polices Next.js
- [ ] Poser les landmarks globaux réutilisés par tous les layouts enfants

Checklist — Critères d'acceptation :

- [ ] Aucun saut de mise en page (CLS) mesurable au chargement des polices
- [ ] Les trois polices s'affichent conformément à leur rôle (titres/UI/métadonnées)

---

### Carte : [P0-T3] Installer et thémer les primitives shadcn/ui

**Étiquettes** : Design system · Estimation M (2-3 j)
**Description** : Installer uniquement les primitives nécessaires au périmètre V1 (Button, Input, Textarea, Select, Checkbox, RadioGroup, Dialog, composant de toast, Badge, Card) et les aligner sur les tokens.
**Dépend de** : P0-T1

Checklist — Sous-tâches :

- [ ] Installer les 9 primitives listées dans `frontend-specification.md` (§Conventions shadcn/ui)
- [ ] Aligner chaque primitive sur les tokens de couleur, rayon et typographie
- [ ] Vérifier qu'aucune primitive non utilisée par le périmètre V1 n'a été ajoutée

Checklist — Critères d'acceptation :

- [ ] Chaque primitive respecte l'ensemble des états définis en §États des composants de `ui-specification.md` (repos, survol, focus, actif, désactivé, chargement, erreur)
- [ ] Le comportement d'accessibilité natif (focus, rôles ARIA) de chaque primitive n'a pas été altéré par la personnalisation visuelle

---

### Carte : [P0-T4] Construire Skeleton, EmptyState, LiveRegion, Tag

**Étiquettes** : Design system · Estimation M (2 j)
**Description** : Composants partagés transverses utilisés par toutes les pages de listing, tout contenu asynchrone, et la saisie de mots-clés dans l'Éditeur d'article.
**Dépend de** : P0-T3

Checklist — Sous-tâches :

- [ ] `Skeleton` : reprend la forme exacte du composant remplacé, sans transition additionnelle
- [ ] `EmptyState` : message factuel + action de sortie systématique
- [ ] `LiveRegion` : composant unique réutilisable pour toute annonce aux technologies d'assistance
- [ ] `Tag` : saisie libre de mots-clés, ajout/suppression à la volée (icône ✕ 14px, cible ≥ 24×24px), sans aucun écran de gestion globale associé

Checklist — Critères d'acceptation :

- [ ] `Skeleton` ne provoque aucun saut de mise en page à l'arrivée du contenu réel
- [ ] `EmptyState` n'est jamais affiché sans action de reprise en main associée
- [ ] `LiveRegion` annonce correctement un changement de contenu à un lecteur d'écran (vérifié manuellement)
- [ ] `Tag` ne propose aucune action de renommage ou de suppression transverse — création et suppression valables uniquement dans le contexte de l'article en cours d'édition

---

### Carte : [P0-T5] Construire StatusPill

**Étiquettes** : Design system · Estimation XS (0,5 j)
**Description** : Pastille de statut (Brouillon/Publié/Archivé), utilisée exclusivement en back-office.
**Dépend de** : P0-T3

Checklist — Sous-tâches :

- [ ] Construire les 3 variantes de statut avec couleur + libellé texte systématique
- [ ] Vérifier le contraste de chaque variante

Checklist — Critères d'acceptation :

- [ ] Aucun statut n'est représenté par la couleur seule
- [ ] Les 3 couleurs de statut correspondent exactement aux tokens `color.status.*`

---

### Carte : [P0-T6] Construire Modal (confirmation d'action irréversible)

**Étiquettes** : Design system · Estimation S (1 j)
**Description** : Composite au-dessus de Dialog, strictement réservé à la confirmation d'une action irréversible.
**Dépend de** : P0-T3

Checklist — Sous-tâches :

- [ ] Structure fixe : titre → texte explicatif → actions alignées à droite (Annuler puis action destructive/confirmation)
- [ ] Fermeture équivalente via ✕, clic overlay, touche Échap
- [ ] Piégeage de focus à l'ouverture, restitution au déclencheur à la fermeture

Checklist — Critères d'acceptation :

- [ ] Le titre est lu immédiatement par les technologies d'assistance à l'ouverture
- [ ] "Annuler" est au moins aussi visible que le bouton de confirmation/destruction
- [ ] Aucune utilisation de `Modal` en dehors d'une confirmation d'action irréversible

---

### Carte : [P0-T7] Construire Toast et Alert

**Étiquettes** : Design system · Estimation S (1 j)
**Description** : Deux mécanismes de notification distincts et non interchangeables (confirmation transitoire vs bandeau contextuel).
**Dépend de** : P0-T3, P0-T4 (LiveRegion)

Checklist — Sous-tâches :

- [ ] `Toast` : position bas-droite, auto-disparition 4s, texte explicite systématique
- [ ] `Alert` : pleine largeur du conteneur parent, variantes succès/erreur/information

Checklist — Critères d'acceptation :

- [ ] `Toast` et `Alert` sont tous deux annoncés via `LiveRegion`, pas uniquement affichés visuellement
- [ ] `Alert` erreur persiste jusqu'à fermeture manuelle ou nouvelle tentative, jamais d'auto-disparition

---

### Carte : [P0-T8] Mettre en place les utilitaires `lib/`

**Étiquettes** : Design system · Estimation XS (0,5-1 j)
**Description** : Formatage de dates, génération/lecture de slugs, constantes partagées utilisées par toutes les features.
**Dépend de** : Aucune

Checklist — Sous-tâches :

- [ ] Fonction de formatage de date (métadonnées, tables admin)
- [ ] Fonction de génération/validation de slug
- [ ] Constantes de configuration SEO par défaut

Checklist — Critères d'acceptation :

- [ ] Chaque utilitaire est testé unitairement indépendamment de toute page

---

## Liste : Phase 1 — Pages publiques de lecture

### Carte : [P1-T1] Construire ArticleCard (grille et liste)

**Étiquettes** : Frontend public · Estimation M (2-3 j)
**Description** : Composant le plus réutilisé du produit — carte d'article en variante grille (Accueil, Liste, Catégorie, Zone) et variante liste (Résultats de recherche).
**Dépend de** : P0-T3

Checklist — Sous-tâches :

- [ ] Variante grille : image 16:9, ordre de métadonnées Type · Catégorie · Zone · Date
- [ ] Variante liste : image 120×80px desktop / pleine largeur mobile, extrait 2 lignes avec ellipse
- [ ] Omission contextuelle de la dimension déjà donnée par la page (Catégorie omise sur écran Catégorie, Zone omise sur écran Zone)
- [ ] Chaque étiquette (Type/Catégorie/Zone) est un lien indépendant vers sa page

Checklist — Critères d'acceptation :

- [ ] Survol : titre → `color.accent.primary` uniquement, aucune élévation ni zoom d'image
- [ ] Images toujours en `object-fit: cover`, ratio fixe par variante
- [ ] Ordre de métadonnées et omission contextuelle vérifiés sur les deux variantes

---

### Carte : [P1-T2] Construire Breadcrumb et lien "← Retour"

**Étiquettes** : Frontend public · Estimation XS (0,5 j)
**Description** : Navigation secondaire desktop (fil d'Ariane) et mobile (lien retour).
**Dépend de** : P0-T3

Checklist — Sous-tâches :

- [ ] Fil d'Ariane desktop : niveaux parents cliquables, dernier niveau non cliquable
- [ ] Lien "← Retour" mobile, préservant l'espace vertical

Checklist — Critères d'acceptation :

- [ ] Dernier niveau jamais cliquable, en `color.text.primary`
- [ ] Bascule desktop/mobile conforme à l'arbitrage responsive (chaîne complète vs lien unique)

---

### Carte : [P1-T3] Construire Pagination

**Étiquettes** : Frontend public · Estimation S (1 j)
**Description** : Pagination numérotée (desktop public + admin) et "Charger plus" (mobile public uniquement).
**Dépend de** : P0-T3

Checklist — Sous-tâches :

- [ ] Variante numérotée : boutons 36×36px, page active en `color.accent.primary`
- [ ] Variante "Charger plus" : bouton pleine largeur 44px, remplacé par indicateur pendant le chargement suivant

Checklist — Critères d'acceptation :

- [ ] Mobile public utilise "Charger plus", jamais la pagination numérotée
- [ ] Back-office utilise toujours la pagination numérotée, jamais "Charger plus"

---

### Carte : [P1-T4] Construire le layout public (navigation + footer)

**Étiquettes** : Frontend public · Estimation M (2 j)
**Description** : `app/(public)/layout.tsx` — header desktop 64px et condensé mobile 56px, footer à deux colonnes/accordéons.
**Dépend de** : P0-T1, P0-T2

Checklist — Sous-tâches :

- [ ] Header desktop : logo, liens, champ de recherche compact, CTA "S'abonner"
- [ ] Header mobile condensé : logo, icônes recherche + menu (44×44px)
- [ ] Footer desktop deux colonnes / mobile accordéons empilés
- [ ] Ordre de tabulation clavier conforme (logo → liens → recherche → CTA → contenu)

Checklist — Critères d'acceptation :

- [ ] Navigation principale et footer strictement identiques sur les 10 écrans publics
- [ ] Item de navigation actif : soulignement 2px, jamais de changement de fond
- [ ] Landmarks (header/nav/main/footer) posés une seule fois dans ce layout

---

### Carte : [P1-T5] Construire le menu mobile (tiroir)

**Étiquettes** : Frontend public · Estimation S (1-2 j)
**Description** : Menu tiroir 85% largeur ou plein écran, îlot client interactif du layout public.
**Dépend de** : P1-T4

Checklist — Sous-tâches :

- [ ] Contenu du menu : Accueil, Catégories (dépliable), Zones (dépliable), Recherche, À propos, CTA, Contact
- [ ] Fermeture via icône ✕, tap hors panneau, touche Échap
- [ ] Blocage du défilement du contenu sous-jacent pendant l'ouverture

Checklist — Critères d'acceptation :

- [ ] Focus piégé tant que le menu est ouvert
- [ ] État ouvert/fermé annoncé par le bouton déclencheur aux technologies d'assistance

---

### Carte : [P1-T6] Construire la barre de partage

**Étiquettes** : Frontend public · Estimation XS (0,5-1 j)
**Description** : Sidebar flottante desktop / barre basse fixe mobile, utilisée sur le Détail d'un article.
**Dépend de** : P0-T3

Checklist — Sous-tâches :

- [ ] Variante desktop flottante
- [ ] Variante mobile barre basse fixe, ne chevauchant jamais le texte

Checklist — Critères d'acceptation :

- [ ] Accessible en permanence pendant la lecture, sans jamais l'interrompre

---

### Carte : [P1-T7] Route : Détail d'un article

**Étiquettes** : Frontend public · Estimation L (3-4 j)
**Description** : Page la plus riche en règles du produit — contenu, métadonnées, contenus liés, partage.
**Dépend de** : P1-T1, P1-T2, P1-T6, P0-T4 (Skeleton)

Checklist — Sous-tâches :

- [ ] Colonne de lecture 680px max desktop / pleine largeur mobile (marge 20px)
- [ ] Affichage des métadonnées (auteur, date, sources, mots-clés, catégorie, zone)
- [ ] Section contenus liés
- [ ] `loading.tsx` (squelette) et `not-found.tsx` (article introuvable ou revenu au statut Brouillon — jamais déclenché pour un article Archivé, cf. DR-001)
- [ ] Métadonnées SEO et données structurées (Article, BreadcrumbList)

Checklist — Critères d'acceptation :

- [ ] Aucune impasse : chemin de retour systématique (breadcrumb, "← Retour" ou nav)
- [ ] Contenu introuvable : page d'erreur dédiée, jamais une page blanche
- [ ] Squelette de chargement de même forme que le contenu final

---

### Carte : [P1-T8] Route : Liste des articles

**Étiquettes** : Frontend public · Estimation M (2 j)
**Description** : Vue exhaustive et navigable des contenus publiés.
**Dépend de** : P1-T1, P1-T3

Checklist — Sous-tâches :

- [ ] Grille 3 colonnes desktop / 2 tablette / 1 mobile
- [ ] Pagination intégrée (numérotée desktop, "Charger plus" mobile)
- [ ] État vide qualifié

Checklist — Critères d'acceptation :

- [ ] Aucune fonction retirée entre les trois breakpoints
- [ ] État vide accompagné d'une action de reprise en main

---

### Carte : [P1-T9] Route : Catégorie

**Étiquettes** : Frontend public · Estimation S (1-2 j)
**Description** : Page de listing filtrée par catégorie thématique, avec omission du filtre catégorie déjà donné par le contexte.
**Dépend de** : P1-T1, P1-T3, P1-T8 (pattern de listing)

Checklist — Sous-tâches :

- [ ] Réutilisation de la grille et de la pagination de P1-T8
- [ ] Message neutre si taxonomie créée sans article publié
- [ ] Métadonnées SEO (description alimentée par la Description courte de la catégorie)

Checklist — Critères d'acceptation :

- [ ] Dimension Catégorie omise dans les Article Cards de cette page
- [ ] État vide neutre, sans ton d'excuse

---

### Carte : [P1-T10] Route : Zone géographique

**Étiquettes** : Frontend public · Estimation S (1-2 j)
**Description** : Symétrique de P1-T9 pour l'axe zone géographique.
**Dépend de** : P1-T9 (même pattern)

Checklist — Sous-tâches :

- [ ] Réutilisation stricte du pattern de P1-T9, adapté à la zone

Checklist — Critères d'acceptation :

- [ ] Dimension Zone omise dans les Article Cards de cette page
- [ ] Aucun token de couleur ni pictogramme assigné à une zone géographique

---

### Carte : [P1-T11] Route : Accueil

**Étiquettes** : Frontend public · Estimation M (2 j)
**Description** : Point d'entrée recomposant les mêmes composants que les pages qu'elle met en avant.
**Dépend de** : P1-T8, P1-T9, P1-T10

Checklist — Sous-tâches :

- [ ] Section "À la une" (grille 3 colonnes desktop / liste empilée mobile)
- [ ] Accès aux pills catégories/zones phares
- [ ] Encart newsletter (stub avant Phase 3, branché ensuite en P3-T3)

Checklist — Critères d'acceptation :

- [ ] Rien n'est masqué hors du premier écran mobile (découvrabilité prioritaire)
- [ ] État de tout premier lancement (aucun contenu phare) traité comme un état de démarrage normal, jamais une erreur

---

### Carte : [P1-T12] Route : À propos

**Étiquettes** : Frontend public · Estimation XS (0,5-1 j)
**Description** : Contenu institutionnel statique (mission, méthodologie, éditeur).
**Dépend de** : P1-T4

Checklist — Sous-tâches :

- [ ] Contenu statique structuré (Mission → Méthodologie → Éditeur)

Checklist — Critères d'acceptation :

- [ ] Hiérarchie de titres sans saut de niveau, un seul H1

---

### Carte : [P1-T13] Routes : Mentions légales & Politique de confidentialité

**Étiquettes** : Frontend public · Estimation XS (0,5-1 j)
**Description** : Contenu légal statique, sans dépendance particulière — peut être traité à tout moment de la phase.
**Dépend de** : P1-T4

Checklist — Sous-tâches :

- [ ] Page Mentions légales (éditeur, hébergeur, CGU)
- [ ] Page Politique de confidentialité (finalités, durée de conservation, droits)

Checklist — Critères d'acceptation :

- [ ] Liens accessibles depuis le footer sur les 10 écrans publics

---

## Liste : Phase 2 — Recherche et filtrage

### Carte : [P2-T1] Construire SearchBar (3 variantes)

**Étiquettes** : Frontend public · Estimation M (2 j)
**Description** : Champ header desktop persistant, icône + overlay plein écran mobile, champ dédié page Recherche.
**Dépend de** : P1-T4

Checklist — Sous-tâches :

- [ ] Variante header desktop (200–240px, 36px hauteur)
- [ ] Variante overlay mobile plein écran, clavier ouvert automatiquement
- [ ] Variante page dédiée (56px hauteur, bouton "Rechercher" intégré)

Checklist — Critères d'acceptation :

- [ ] Raccourci clavier Entrée actif dans les 3 variantes, indépendamment du clic
- [ ] La requête reste visible et modifiable en place après soumission

---

### Carte : [P2-T2] Construire FilterBar et FilterPanel

**Étiquettes** : Frontend public · Estimation M (2-3 j)
**Description** : Ligne de pills desktop, panneau bas mobile — dimensions catégorie/zone/type/date combinables.
**Dépend de** : P0-T3

Checklist — Sous-tâches :

- [ ] Ligne de pills desktop (gap 12px, wrap 2 lignes max)
- [ ] Panneau bas mobile (jusqu'à 80% hauteur, bouton "Appliquer" sticky)
- [ ] Lien "Réinitialiser les filtres" conditionnel à l'activation d'au moins un filtre
- [ ] Distinction visuelle des filtres secondaires contextuels vs filtres librement choisis

Checklist — Critères d'acceptation :

- [ ] Combinabilité des 4 dimensions vérifiée
- [ ] Badge numérique sur le bouton "Filtrer" mobile reflète le nombre de filtres actifs

---

### Carte : [P2-T3] Route : Recherche et Résultats de recherche

**Étiquettes** : Frontend public · Estimation L (3-4 j)
**Description** : Route unique (`/recherche`), jamais scindée en deux fichiers : formulaire de saisie affiché en l'absence de paramètre de requête, résultats pilotés entièrement par les paramètres d'URL (requête + filtres) dès qu'une requête est présente, en liste verticale pleine largeur.
**Dépend de** : P2-T1, P2-T2, P0-T4 (LiveRegion, EmptyState)

Checklist — Sous-tâches :

- [ ] Formulaire de saisie (champ pleine largeur + bouton "Rechercher") affiché en l'absence de requête
- [ ] Liste verticale pleine largeur (jamais de grille, quel que soit le breakpoint) dès qu'une requête est présente
- [ ] Compteur de résultats en live-region, mis à jour à chaque changement de filtre
- [ ] État vide qualifié spécifique (reformulation + réinitialisation des filtres)

Checklist — Critères d'acceptation :

- [ ] Une seule route sert les deux états (formulaire et résultats) — aucune deuxième route créée pour les résultats
- [ ] Requête et filtres actifs conservés lors d'un retour depuis un article consulté
- [ ] Aucun résultat traité comme un état vide qualifié, jamais comme une erreur

---

### Carte : [P2-T4] Appliquer les filtres sur Liste, Catégorie, Zone

**Étiquettes** : Frontend public · Estimation M (2 j)
**Description** : Rétrofit des filtres sur les trois écrans de listing déjà livrés en Phase 1.
**Dépend de** : P1-T8, P1-T9, P1-T10, P2-T2

Checklist — Sous-tâches :

- [ ] Filtres sur Liste des articles (toutes dimensions)
- [ ] Filtres sur Catégorie (sans le filtre catégorie)
- [ ] Filtres sur Zone géographique (sans le filtre zone)

Checklist — Critères d'acceptation :

- [ ] Persistance de contexte vérifiée sur les trois écrans au retour depuis un article

---

## Liste : Phase 3 — Formulaires publics & validation

### Carte : [P3-T1] Établir le pattern de validation et d'action serveur

**Étiquettes** : Frontend public · Estimation M (2 j)
**Description** : Pattern de référence (schéma de validation partagé, Server Action, gestion d'erreur, conservation de saisie) réutilisé sans modification par tous les formulaires suivants, y compris administrateur.
**Dépend de** : P0-T3 (Input, Button)

Checklist — Sous-tâches :

- [ ] Convention de schéma de validation unique par formulaire (source de vérité client + serveur)
- [ ] Gestion de l'état de soumission (en cours/erreur/succès)
- [ ] Renvoi de focus au premier champ en erreur après soumission refusée
- [ ] Conservation de la saisie en cas d'échec technique

Checklist — Critères d'acceptation :

- [ ] Validation déclenchée à la soumission, puis revalidation en temps réel après une première erreur
- [ ] Message d'erreur toujours spécifique, jamais générique

---

### Carte : [P3-T2] Formulaire Newsletter — page dédiée

**Étiquettes** : Frontend public · Estimation S (1-2 j)
**Description** : Champ unique (e-mail), premier formulaire réel construit sur le pattern P3-T1.
**Dépend de** : P3-T1

Checklist — Sous-tâches :

- [ ] Champ e-mail avec validation de format côté client
- [ ] Mention de confidentialité toujours visible et lisible
- [ ] Traitement neutre du cas "déjà inscrit"
- [ ] Confirmation in situ (remplacement du formulaire, jamais de redirection)

Checklist — Critères d'acceptation :

- [ ] "Déjà inscrit" traité comme une confirmation neutre, jamais une erreur
- [ ] Bouton "S'abonner" en `color.accent.warm`, seule exception de couleur de bouton primaire du produit

---

### Carte : [P3-T3] Intégration Newsletter inline (Accueil + fin d'article)

**Étiquettes** : Frontend public · Estimation S (1 j)
**Description** : Réutilisation du composant Newsletter validé en P3-T2 sur les deux emplacements inline.
**Dépend de** : P3-T2, P1-T7, P1-T11

Checklist — Sous-tâches :

- [ ] Bandeau Accueil (inline, compact)
- [ ] Bloc inline fin d'article (Détail d'un article)

Checklist — Critères d'acceptation :

- [ ] Comportement strictement identique au formulaire dédié (aucune réimplémentation)

---

### Carte : [P3-T4] Formulaire Contact

**Étiquettes** : Frontend public · Estimation S (1-2 j)
**Description** : Formulaire multi-champs (nom, e-mail, sujet, message), tous requis.
**Dépend de** : P3-T1

Checklist — Sous-tâches :

- [ ] Validation par champ à la soumission
- [ ] Message d'erreur spécifique par champ requis manquant

Checklist — Critères d'acceptation :

- [ ] Focus renvoyé au premier champ en erreur après soumission refusée
- [ ] Saisie conservée après un échec technique

---

### Carte : [P3-T5] Désinscription newsletter (page dédiée, accès par lien e-mail)

**Étiquettes** : Frontend public · Estimation S (1-2 j)
**Description** : Page technique accessible uniquement via le lien de désinscription à usage unique contenu dans chaque communication envoyée — aucun formulaire, confirmation neutre affichée in situ.
**Dépend de** : P0-T4 (EmptyState/LiveRegion), P3-T2 (registre de ton neutre déjà établi pour "déjà inscrit")

Checklist — Sous-tâches :

- [ ] Route dédiée (`/newsletter/desinscription`) lisant un jeton de désinscription en paramètre d'URL
- [ ] Confirmation neutre affichée directement, sans champ à saisir ni connexion requise
- [ ] Traitement neutre d'un lien déjà utilisé ou expiré (jamais un message d'erreur)

Checklist — Critères d'acceptation :

- [ ] Aucune connexion ni saisie requise pour confirmer la désinscription
- [ ] Le ton du message reste neutre, cohérent avec le traitement du cas "déjà inscrit" à l'inscription (P3-T2)
- [ ] La page n'est accessible depuis aucun lien de navigation ou de footer, uniquement via l'e-mail

---

## Liste : Phase 4 — Authentification & shell administrateur

### Carte : [P4-T1] Formulaire Connexion administrateur

**Étiquettes** : Frontend admin · Estimation S (1-2 j)
**Description** : Réutilise le pattern P3-T1, avec message d'échec générique.
**Dépend de** : P3-T1

Checklist — Sous-tâches :

- [ ] Champs identifiant + mot de passe
- [ ] Message générique "Identifiant ou mot de passe incorrect" en cas d'échec
- [ ] Mot de passe vidé, identifiant conservé après échec

Checklist — Critères d'acceptation :

- [ ] Aucun champ désigné individuellement comme fautif dans le message d'erreur
- [ ] Succès : redirection vers le Dashboard

---

### Carte : [P4-T2] Mécanisme de session et garde d'accès

**Étiquettes** : Frontend admin · Estimation M (2-3 j)
**Description** : Vérification à deux niveaux (en amont des routes protégées, puis dans le layout protégé), condition de sécurité de tout l'espace admin.
**Dépend de** : P4-T1

Checklist — Sous-tâches :

- [ ] Établissement de la session à la connexion réussie
- [ ] Vérification de session en amont des routes `/admin/(protected)/*`
- [ ] Vérification de session redondante dans le layout protégé
- [ ] Déconnexion effective depuis n'importe quel écran admin
- [ ] Expiration automatique de la session après une période d'inactivité (durée hors périmètre de cette carte — DR-002)

Checklist — Critères d'acceptation :

- [ ] Accès direct à une URL protégée sans session : redirection vers la Connexion, aucun contenu exposé
- [ ] Déconnexion sans confirmation (action réversible par reconnexion)
- [ ] Une session inactive au-delà de la période d'inactivité définie expire automatiquement et redirige vers la Connexion, aucun contenu exposé

---

### Carte : [P4-T3] Sidebar administrateur et layout protégé

**Étiquettes** : Frontend admin · Estimation S (1-2 j)
**Description** : `app/admin/(protected)/layout.tsx` — sidebar fixe 220px, identique sur les 4 écrans post-connexion.
**Dépend de** : P4-T2

Checklist — Sous-tâches :

- [ ] Sidebar : Dashboard/Articles/Catégories/Newsletter, item actif souligné + gras
- [ ] Pied de sidebar : "Voir le site ↗" / "Déconnexion"
- [ ] Coquille de test validée avant branchement des écrans réels (Phases 5-6)

Checklist — Critères d'acceptation :

- [ ] Sidebar strictement identique sur les 4 écrans post-connexion
- [ ] Aucune navigation publique visible dans cet espace hormis "Voir le site ↗"

---

### Carte : [P4-T4] Message d'orientation desktop-only

**Étiquettes** : Frontend admin · Estimation XS (0,5 j)
**Description** : Sous 1024px, message d'orientation en CSS pur à la place du layout admin.
**Dépend de** : P4-T3

Checklist — Sous-tâches :

- [ ] Message "Interface d'administration optimisée pour desktop" sous 1024px
- [ ] Implémentation en media query CSS pure, sans détection JavaScript de viewport

Checklist — Critères d'acceptation :

- [ ] Aucun layout dégradé n'est rendu sous 1024px
- [ ] Aucun écart entre rendu serveur et client (pas de flash de contenu)

---

## Liste : Phase 5 — Administration des contenus

### Carte : [P5-T1] Gestion des catégories/zones

**Étiquettes** : Frontend admin · Estimation M (2-3 j)
**Description** : CRUD inline le plus simple du back-office, condition préalable de l'Éditeur d'article (classification).
**Dépend de** : P4-T3, P3-T1 (pattern formulaire), P0-T6 (Modal)

Checklist — Sous-tâches :

- [ ] Formulaire inline nom + description courte, validation à la soumission
- [ ] Table : nom, nombre d'articles associés, actions
- [ ] Suppression conditionnée : désactivée si des articles sont associés, avec message explicite
- [ ] Modal de confirmation pour la suppression autorisée

Checklist — Critères d'acceptation :

- [ ] "Supprimer" désactivé et Modal non ouverte si des articles sont associés à la catégorie/zone
- [ ] Toast de confirmation après création/modification
- [ ] Aucune gestion des tags dans cet écran : les tags sont créés et supprimés uniquement depuis l'Éditeur d'article (P5-T2)

---

### Carte : [P5-T2] Éditeur d'article — structure et classification

**Étiquettes** : Frontend admin · Estimation L (4-5 j)
**Description** : Pièce la plus complexe du produit — contenu rédactionnel (~65%) et classification/métadonnées (~35%) en 2 colonnes desktop.
**Dépend de** : P5-T1 (catégories/zones disponibles), P0-T4 (composant Tag)

Checklist — Sous-tâches :

- [ ] Champs de contenu (titre, chapô, corps, auteur, sources)
- [ ] Champ Type de contenu (select à choix unique : article/analyse/enquête/interview/dossier thématique)
- [ ] Sélection de classification : catégorie (select à choix unique) et zone géographique (select à choix unique), toutes deux alimentées par P5-T1 — jamais de sélection multiple
- [ ] Champ Tags (composant `Tag`, saisie libre multi-valuée, optionnelle, créés à la volée depuis cet écran)
- [ ] Champ Image principale (import) + Texte alternatif
- [ ] Layout 2 colonnes desktop, colonne latérale toujours visible

Checklist — Critères d'acceptation :

- [ ] Aucune sauvegarde automatique silencieuse
- [ ] Colonne de classification/statut accessible sans scroll indépendant excessif
- [ ] Un contenu n'est jamais associé à plus d'une catégorie ou plus d'une zone géographique ; les tags acceptent zéro, un ou plusieurs éléments
- [ ] Aucune gestion globale des tags accessible ailleurs que dans cet écran

---

### Carte : [P5-T3] Éditeur d'article — statut et validation

**Étiquettes** : Frontend admin · Estimation M (2 j)
**Description** : Statut à 3 segments pill (Brouillon/Publié/Archivé) et règles de validation différenciées.
**Dépend de** : P5-T2, P0-T5 (StatusPill)

Checklist — Sous-tâches :

- [ ] Statut rendu en 3 segments pill, jamais en select classique
- [ ] Règle : titre, type de contenu, catégorie, zone géographique et image principale (+ texte alternatif) requis pour "Publier", non requis pour "Enregistrer le brouillon" ; tags toujours optionnels
- [ ] Toast "✓ Brouillon enregistré" / "✓ Article publié"

Checklist — Critères d'acceptation :

- [ ] "Publier" sans titre, type, catégorie, zone ou image principale affiche un message spécifique par champ manquant et n'empêche pas l'enregistrement en brouillon
- [ ] Un seul bouton primaire visible à la fois sur l'écran de l'éditeur

---

### Carte : [P5-T4] Gestion des articles (liste back-office)

**Étiquettes** : Frontend admin · Estimation M (2-3 j)
**Description** : Table reliant classification (P5-T1) et éditeur (P5-T2/T3) — construite en dernier dans cette phase.
**Dépend de** : P5-T1, P5-T3

Checklist — Sous-tâches :

- [ ] Colonnes : Titre, Catégorie/Zone, Statut (pastille), Date, Actions
- [ ] Tri sur Date et Statut uniquement, chevron indiquant le sens actif
- [ ] Recherche/filtre en tête de table (statut/catégorie/zone) sans rechargement complet
- [ ] Pagination 20 lignes, toujours numérotée

Checklist — Critères d'acceptation :

- [ ] Colonne Actions toujours en dernière position ; actions destructives séparées d'au moins 12px des actions non destructives
- [ ] Ligne cliquable dans son ensemble vers l'édition, sauf sur la colonne Actions
- [ ] Aucune action destructive directe sans passage par une Modal

---

## Liste : Phase 6 — Dashboard & gestion newsletter admin

### Carte : [P6-T1] Gestion newsletter admin

**Étiquettes** : Frontend admin · Estimation M (2 j)
**Description** : Table des inscrits produits par P3-T2/T3, avec retrait confirmé.
**Dépend de** : P3-T2, P3-T5 (désinscription par lien e-mail), P5-T4 (composants de table stabilisés)

Checklist — Sous-tâches :

- [ ] Table : e-mail, date d'inscription, action
- [ ] Recherche par e-mail en direct, sans rechargement complet
- [ ] Retrait via Modal de confirmation

Checklist — Critères d'acceptation :

- [ ] Compteur d'inscrits mis à jour après retrait
- [ ] Toast affiché après confirmation du retrait
- [ ] Aucun ajout manuel ni envoi de campagne (hors périmètre V1)
- [ ] Une adresse désinscrite via le lien e-mail (P3-T5) disparaît automatiquement de cette table, sans action admin requise

---

### Carte : [P6-T2] Dashboard — cartes de comptage

**Étiquettes** : Frontend admin · Estimation S (1 j)
**Description** : 3 cartes de comptage statiques (Articles publiés, Brouillons, Inscrits newsletter).
**Dépend de** : P5-T4, P6-T1 (données à compter existantes)

Checklist — Sous-tâches :

- [ ] Grille 3 colonnes égales (gap 16px)
- [ ] Chiffre 28px poids 500, libellé 11px majuscules

Checklist — Critères d'acceptation :

- [ ] Aucun graphique, aucune courbe, aucune statistique avancée
- [ ] État de premier lancement : compteurs à 0 sans alerte visuelle

---

### Carte : [P6-T3] Dashboard — table des derniers articles modifiés

**Étiquettes** : Frontend admin · Estimation S (1-2 j)
**Description** : Table 4 colonnes + action rapide "+ Nouvel article", dernier écran fonctionnel du projet.
**Dépend de** : P6-T2

Checklist — Sous-tâches :

- [ ] Table : Titre, Catégorie, Statut, Dernière modification (5 lignes max)
- [ ] Lien "Voir tous les articles" si plus de contenu existe
- [ ] Action rapide "+ Nouvel article" toujours visible sans scroll (1024×768 minimum)

Checklist — Critères d'acceptation :

- [ ] Ligne de table cliquable dans son ensemble → ouvre l'éditeur correspondant
- [ ] État vide (0 article) : table remplacée par une invitation neutre à créer un premier article

---

## Liste : Phase 7 — Qualité transverse

### Carte : [P7-T1] Audit d'accessibilité complet

**Étiquettes** : Qualité transverse · Estimation M (2-3 j)
**Description** : Audit global sur les 15 écrans livrés — contraste, focus clavier, structure sémantique, live-regions, alt-text.
**Dépend de** : Phases 0 à 6

Checklist — Sous-tâches :

- [ ] Vérification de contraste (≥7:1 corps de texte, ≥4.5:1 métadonnées), en particulier `color.accent.warm`
- [ ] Focus clavier visible et cohérent sur 100% des éléments interactifs
- [ ] Un seul H1 par page, hiérarchie de titres sans saut de niveau sur l'ensemble du site
- [ ] Alt-text vérifié sur toute image, y compris les placeholders

Checklist — Critères d'acceptation :

- [ ] Aucune information critique encodée uniquement par la couleur, sur l'ensemble des 15 écrans
- [ ] Live-regions vérifiées (compteurs, confirmations, erreurs globales)

---

### Carte : [P7-T2] Audit de performance

**Étiquettes** : Qualité transverse · Estimation M (2 j)
**Description** : Vérification du poids des pages et de l'absence de saut de mise en page sur les gabarits les plus lourds.
**Dépend de** : Phases 0 à 6

Checklist — Sous-tâches :

- [ ] Vérification image optimisée + ratio fixe sur Détail d'un article, Liste, Résultats de recherche
- [ ] Vérification streaming/squelettes sur les sections asynchrones
- [ ] Vérification de la revalidation après mutation admin (contenu public à jour)

Checklist — Critères d'acceptation :

- [ ] Aucun saut de mise en page mesurable sur les gabarits audités
- [ ] Budget de JavaScript client concentré sur les îlots interactifs identifiés, pas sur les pages de contenu

---

### Carte : [P7-T3] SEO — métadonnées, données structurées, plan de site

**Étiquettes** : Qualité transverse · Estimation M (2 j)
**Description** : Vérification route par route des métadonnées et de l'exclusion d'indexation de l'espace admin.
**Dépend de** : Phases 0 à 6

Checklist — Sous-tâches :

- [ ] Métadonnées (titre/description/canonical/OG) sur chaque route publique
- [ ] Données structurées (Article, BreadcrumbList, Organization) par gabarit concerné
- [ ] `sitemap.ts` limité aux contenus publiés
- [ ] `robots.ts` excluant intégralement `/admin`

Checklist — Critères d'acceptation :

- [ ] Aucune route publique n'a de métadonnées par défaut laissée telle quelle
- [ ] Toutes les routes `/admin` sont exclues de l'indexation (balise + robots)

---

### Carte : [P7-T4] Repasse responsive complète

**Étiquettes** : Qualité transverse · Estimation M (2-3 j)
**Description** : Vérification exhaustive des trois breakpoints sur les 10 écrans publics.
**Dépend de** : Phases 1 à 3

Checklist — Sous-tâches :

- [ ] Vérification de chaque arbitrage du tableau §Responsive de `ui-specification.md`
- [ ] Cibles tactiles ≥44×44px vérifiées sur mobile, y compris icônes de fermeture/suppression

Checklist — Critères d'acceptation :

- [ ] Aucune fonction retirée entre breakpoints sur l'un des 10 écrans publics

---

## Liste : Phase 8 — Recette et stabilisation

### Carte : [P8-T1] Exécution des parcours publics

**Étiquettes** : Qualité transverse · Estimation S (1-2 j)
**Description** : Les 4 parcours de `ui-specification.md` (§Parcours utilisateurs) exécutés de bout en bout.
**Dépend de** : Phase 7

Checklist — Sous-tâches :

- [ ] Découverte via partage
- [ ] Recherche documentaire ciblée
- [ ] Exploration thématique
- [ ] Évaluation de crédibilité institutionnelle

Checklist — Critères d'acceptation :

- [ ] Les 4 parcours s'exécutent sans blocage, sur les trois breakpoints

---

### Carte : [P8-T2] Exécution des parcours administrateur

**Étiquettes** : Qualité transverse · Estimation S (1-2 j)
**Description** : Les 6 parcours de `ui-specification.md` (§Parcours administrateur) exécutés de bout en bout.
**Dépend de** : Phase 7

Checklist — Sous-tâches :

- [ ] Connexion
- [ ] Création d'un article
- [ ] Modification d'un article
- [ ] Gestion des catégories/zones
- [ ] Gestion de la newsletter, puis Déconnexion
- [ ] Expiration de session

Checklist — Critères d'acceptation :

- [ ] Les 6 parcours s'exécutent sans blocage

---

### Carte : [P8-T3] Journal de bugs et corrections

**Étiquettes** : Qualité transverse · Estimation M (2-4 j, variable)
**Description** : Buffer de stabilisation consécutif aux deux cartes précédentes.
**Dépend de** : P8-T1, P8-T2

Checklist — Sous-tâches :

- [ ] Consignation des anomalies par sévérité (bloquant/majeur/mineur)
- [ ] Correction des anomalies bloquantes et majeures

Checklist — Critères d'acceptation :

- [ ] Aucun bug bloquant ou majeur ouvert

---

### Carte : [P8-T4] Vérification finale des checklists de conformité

**Étiquettes** : Qualité transverse · Estimation XS (0,5-1 j)
**Description** : Dernière carte du board — relecture intégrale des checklists de conformité sur le produit complet.
**Dépend de** : P8-T3

Checklist — Sous-tâches :

- [ ] Checklist de conformité de `ui-specification.md` (tokens, composants, navigation, formulaires, états, accessibilité, périmètre)
- [ ] Checklist de conformité (architecture) de `frontend-specification.md`

Checklist — Critères d'acceptation :

- [ ] Les deux checklists sont intégralement cochées sur le produit final
- [ ] Aucune fonctionnalité V2/V3 n'a été introduite dans l'interface livrée

---

_Ce document est le backlog de référence pour le suivi Trello du développement frontend du MVP. Il se lit conjointement avec `implementation-roadmap.md` (séquencement des phases), `frontend-specification.md` (architecture) et `ui-specification.md` (référence visuelle et comportementale). Toute carte ajoutée, déplacée ou supprimée sur le board doit être reportée ici pour garder la traçabilité._
