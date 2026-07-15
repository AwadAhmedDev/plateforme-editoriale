# UI Specification — Plateforme éditoriale Corne de l'Afrique (MVP)

**Version finale — document unique de référence pour le développement frontend.**
Consolide et rend exécutable l'intégralité de la phase UX/UI validée : `design-brief.md`, `responsive-ux.md`, `design-system.md`, `ui-kit.md`, `maquettes-haute-fidelite.md`, `prototype.md`. Ce document doit permettre de développer l'intégralité du frontend sans consulter les autres livrables.

Aucun code, aucune maquette, aucun choix de technologie ou de bibliothèque : ce document spécifie l'interface et son comportement, pas son implémentation.

---

## Architecture UI

Le produit se compose de deux espaces strictement séparés, ne partageant aucun composant de navigation :

- **Espace public** (10 écrans de premier niveau) : Accueil, Liste des articles, Détail d'un article, Recherche, Résultats de recherche, Catégorie, Zone géographique, Newsletter, À propos, Contact. Navigation principale + Footer identiques sur les 10 écrans. S'y ajoutent des écrans dérivés, sans navigation propre : Mentions légales, Politique de confidentialité (liens de footer uniquement) et Désinscription newsletter (accessible uniquement depuis le lien d'un e-mail, cf. §Newsletter).
- **Espace administrateur** (5 écrans de premier niveau) : Connexion administrateur, Dashboard, Gestion des articles, Gestion des catégories, Gestion newsletter. Sidebar identique sur les 4 écrans post-connexion ; aucune navigation publique visible dans cet espace hormis le lien explicite "Voir le site ↗". L'Éditeur d'article est un écran dérivé de Gestion des articles (accessible via "+ Nouvel article" ou "Modifier"), doté de ses propres règles de mise en page (cf. §Grille) et de validation (cf. §Formulaires).

Principes d'architecture :

1. **Un seul utilisateur administrateur, aucun système de rôles** — aucune interface de gestion de permissions à prévoir.
2. **Deux axes de classification transverses** (catégorie thématique, zone géographique) structurent la navigation publique, les filtres et les métadonnées de contenu partout où un article est représenté.
3. **Back-office desktop-first** : sous 1024px, afficher un message d'orientation ("Interface d'administration optimisée pour desktop") plutôt qu'un layout dégradé — décision actée, aucun responsive spécifique n'est à développer pour l'admin.
4. **Front public entièrement responsive** (mobile/tablette/desktop, cf. section Responsive) — aucune fonction n'est retirée entre tailles d'écran, seule la présentation change.
5. **Aucune donnée utilisateur, aucun compte, aucun contenu premium/abonnement payant** en V1 — ne pas anticiper d'interface pour ces fonctions (V2/V3).

---

## Navigation

## Navigation principale (desktop, ≥ 1024px)

- Header 64px de hauteur, sticky au scroll, fond `color.bg.primary`, bordure basse 1px `color.border`.
- Ordre gauche → droite : Logo (lien Accueil) · Liens Catégories / Zones géographiques / À propos · Champ de recherche compact (200–240px, 36px de hauteur) · Bouton CTA "S'abonner" (primaire, `color.accent.warm`).
- Catégories et Zones géographiques : menus déroulants au survol/clic, jamais une page d'index intermédiaire — chaque menu expose directement la liste des termes individuels (5 catégories, 7 zones), chacun un lien direct vers son écran Catégorie ou Zone géographique. Mécanisme équivalent à l'accordéon du menu mobile (cf. Navigation mobile) : seule la présentation change entre breakpoints, jamais l'existence d'une page intermédiaire.
- Item actif : soulignement 2px `color.accent.primary`, poids 500 — jamais de changement de couleur de fond.
- Ordre de tabulation clavier : Logo → liens → recherche → CTA → contenu de page.

## Navigation mobile / tablette (< 1024px)

- Header condensé 56px, sticky, composé de : Logo (gauche) · icône Recherche + icône Menu (droite), cibles 44×44px chacune.
- Menu (tiroir 85% largeur ou plein écran, `elevation.raised`) : Accueil, Catégories (dépliable), Zones géographiques (dépliable), Recherche, À propos, CTA "S'abonner" (plein, en fin de menu), Contact. Catégories/Zones géographiques en accordéon : révèle directement la liste des termes individuels, sans page d'index intermédiaire — même mécanisme d'exposition directe que le menu déroulant desktop (cf. Navigation principale), seule la présentation (accordéon vs déroulant) diffère entre breakpoints.
- Focus piégé dans le menu ouvert ; fermeture via icône ✕, tap hors panneau, ou touche Échap.
- Le menu ouvert bloque le défilement du contenu sous-jacent.

## Navigation secondaire

- **Fil d'Ariane** (desktop) : présent sur Liste des articles, Détail d'un article, Catégorie, Zone géographique. Format : "Accueil / Niveau / Page courante", niveaux parents cliquables (`color.text.secondary` → `color.accent.primary` au survol), dernier niveau non cliquable (`color.text.primary`).
- **Lien "← Retour"** (mobile) remplace le fil d'Ariane complet — préserve l'espace vertical, le titre de page assure le repère de niveau.
- **Sidebar administrateur** : 220px fixe, contient Dashboard / Articles / Catégories / Newsletter (item actif souligné + gras), puis en pied "Voir le site ↗" / "Déconnexion".

## Footer (public, toutes pages)

- Deux colonnes desktop : "Navigation" (Accueil, Recherche) et "Informations" (À propos, Contact, Mentions légales, Politique de confidentialité), plus icônes réseaux sociaux.
- Mobile : colonnes remplacées par des accordéons empilés.

## Persistance de contexte de navigation

- Les filtres actifs (Liste, Résultats de recherche, Catégorie, Zone) sont conservés lors d'un retour (navigateur, breadcrumb ou lien "← Retour") depuis un article consulté.
- Aucune page publique n'est une impasse : chaque écran dispose d'un chemin de retour (breadcrumb, "← Retour", ou nav principale).

---

## Responsive

## Breakpoints

| Nom      | Plage      | Colonnes de grille | Navigation                   |
| -------- | ---------- | ------------------ | ---------------------------- |
| Mobile   | < 600px    | 1                  | Condensée                    |
| Tablette | 600–1023px | 2                  | Condensée (identique mobile) |
| Desktop  | ≥ 1024px   | 3                  | Complète                     |

## Principe général

Rien ne disparaît entre breakpoints, tout se réorganise. La densité d'information reste constante ; seule la disposition spatiale change.

## Arbitrages responsive actés (à implémenter tels quels)

| Élément desktop                                | Équivalent mobile                                                    | Justification                                                                            |
| ---------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Recherche : champ permanent dans le header     | Icône recherche → overlay plein écran                                | Préserve l'espace du header mobile sans perdre la fonction (1 tap)                       |
| Filtres : ligne de pills                       | Bouton "Filtrer" (+ badge du nombre de filtres actifs) → panneau bas | Évite le défilement horizontal silencieux des pills sur petit écran                      |
| Fil d'Ariane : chaîne complète                 | Lien "← Retour"                                                      | Préserve l'espace vertical, le titre de page suffit au repère                            |
| Pagination : numérotée                         | "Charger plus"                                                       | Évite le tap sur petite cible ; préserve le contexte de scroll                           |
| Partage : sidebar flottante (Détail d'article) | Barre basse fixe                                                     | Pas d'espace latéral disponible sur mobile ; la barre basse ne chevauche jamais le texte |
| "À la une" (Accueil) : grille 3 colonnes       | Liste empilée 1 colonne                                              | Rien ne doit être masqué hors du premier écran (découvrabilité prioritaire)              |
| Footer : colonnes visibles                     | Accordéons empilés                                                   | Réduit la longueur de défilement de fin de page sans retirer l'accès                     |

## Règles d'implémentation

- Media queries recommandées en `min-width` (approche mobile-first en développement, même si la conception a été pensée desktop-first en wireframe).
- Cibles tactiles ≥ 44×44px sans exception sur mobile, y compris icônes de fermeture/suppression.
- Images toujours en `object-fit: cover` dans leur conteneur, ratio fixé par composant (16:9 carte grille, 4:3 carte liste, 1:1 avatar).
- Back-office : aucun comportement responsive spécifique (cf. Architecture UI, point 3).

---

## Design Tokens

## Couleur

Référence en OKLCH (source de vérité), équivalent hex indicatif pour implémentation immédiate.

| Token                        | OKLCH                 | Hex indicatif | Usage                                                                         |
| ---------------------------- | --------------------- | ------------- | ----------------------------------------------------------------------------- |
| `color.bg.primary`           | oklch(0.99 0.003 250) | #FAFBFC       | Fond de page, toutes pages y compris admin                                    |
| `color.bg.secondary`         | oklch(0.97 0.004 250) | #F1F3F5       | Cartes, panneaux, footer, en-têtes de table                                   |
| `color.text.primary`         | oklch(0.22 0.006 250) | #212327       | Titres, corps de texte                                                        |
| `color.text.secondary`       | oklch(0.48 0.008 250) | #6C6F75       | Métadonnées, légendes, placeholders                                           |
| `color.border`               | oklch(0.87 0.006 250) | #D6D9DC       | Bordures, séparateurs                                                         |
| `color.accent.primary`       | oklch(0.38 0.09 258)  | #2B4C86       | Liens, CTA primaires, focus, états actifs — seul accent interactif du produit |
| `color.accent.primary.hover` | oklch(0.33 0.09 258)  | #223D6C       | Survol des éléments en accent primaire                                        |
| `color.accent.warm`          | oklch(0.62 0.09 55)   | #C97C4C       | Réservé : newsletter, accroche éditoriale phare — jamais ailleurs             |
| `color.status.draft`         | oklch(0.55 0.11 55)   | #B06B36       | Pastille "Brouillon" (admin uniquement)                                       |
| `color.status.published`     | oklch(0.5 0.1 150)    | #3D8558       | Pastille "Publié" (admin uniquement)                                          |
| `color.status.archived`      | oklch(0.6 0.01 250)   | #999B9F       | Pastille "Archivé" (admin uniquement)                                         |
| `color.error`                | oklch(0.5 0.16 25)    | #B8382A       | Erreurs, action destructive                                                   |
| `color.disabled.bg`          | oklch(0.93 0.003 250) | #EAEBEC       | Fond des éléments désactivés                                                  |
| `color.disabled.text`        | oklch(0.68 0.005 250) | #ABADB0       | Texte des éléments désactivés                                                 |

**Règle absolue** : aucun token de couleur n'est créé pour une catégorie ou une zone géographique — la distinction thématique/géographique passe exclusivement par le texte, jamais par la teinte (contexte géopolitique sensible, neutralité requise).

## Typographie

| Token            | Famille        | Fallback                | Rôle                                                |
| ---------------- | -------------- | ----------------------- | --------------------------------------------------- |
| `font.editorial` | Source Serif 4 | Georgia, serif          | Titres de page, titres d'article, titres de carte   |
| `font.ui`        | Public Sans    | system-ui, sans-serif   | Navigation, boutons, corps de texte UI, formulaires |
| `font.mono`      | IBM Plex Mono  | ui-monospace, monospace | Métadonnées, dates, statuts, tags                   |

Poids : Regular (400), Medium (500), Semibold (600, réservé boutons primaires et nav active).

## Espacement

Échelle unique base 4px : `4, 8, 12, 16, 24, 32, 48, 64, 96`. Aucune valeur hors échelle.

## Rayon et élévation

- `radius.sm` = 4px (boutons, inputs, cards, modals, tableaux).
- `radius.pill` = 999px (pills, tags, badges de statut, chips de filtre).
- `radius.circle` = 50% (avatars/icônes circulaires).
- `elevation.none` : défaut de tout composant statique (cartes, boutons au repos).
- `elevation.raised` = `0 8px 24px rgba(20,22,26,0.12)` : modal, panneau de filtres mobile, menu mobile, barre de partage mobile.

## Transition

- `transition.fast` = 120ms ease-out (survol, focus).
- `transition.panel` = 200ms ease-in-out (ouverture/fermeture panneau, menu, modal).
- Aucune durée supérieure à 200ms ; aucune animation de page complète.

---

## Couleurs

Voir tableau complet en Design Tokens. Règles d'application :

- Fond de page : `color.bg.primary` sans exception.
- Fond de carte/panneau : `color.bg.secondary` + bordure 1px `color.border`.
- Lien/action : `color.accent.primary` (repos/focus), `color.accent.primary.hover` (survol) — changement de luminosité uniquement, jamais de teinte.
- `color.accent.warm` : exclusivement CTA newsletter (bandeau Accueil, bloc inline Détail d'article, formulaire Newsletter dédié) et accroche éditoriale phare (Accueil). Nulle part ailleurs, y compris nav et back-office.
- Statuts back-office : toujours combinés à un libellé texte dans la même pastille, jamais la couleur seule.
- Erreur : `color.error`, réservé aux messages de validation et au bouton/action destructifs.

---

## Typographies

## Échelle desktop / mobile

| Rôle                             | Desktop     | Mobile      | Police           | Poids |
| -------------------------------- | ----------- | ----------- | ---------------- | ----- |
| Titre de page (H1)               | 40px / 48px | 28px / 34px | `font.editorial` | 500   |
| Titre d'article (H1 détail)      | 32px / 40px | 26px / 32px | `font.editorial` | 400   |
| Titre de section (H2)            | 24px / 32px | 20px / 28px | `font.editorial` | 500   |
| Titre de carte (H3)              | 20px / 28px | 18px / 24px | `font.editorial` | 500   |
| Sous-titre / chapô               | 18px / 28px | 16px / 26px | `font.ui`        | 400   |
| Corps de texte (lecture article) | 17px / 30px | 16px / 28px | `font.ui`        | 400   |
| Corps de texte (UI générique)    | 16px / 24px | 15px / 22px | `font.ui`        | 400   |
| Label UI / bouton                | 15px / 20px | 14px / 20px | `font.ui`        | 500   |
| Métadonnée / donnée              | 13px / 18px | 12px / 16px | `font.mono`      | 400   |

Colonne de lecture (Détail d'article, À propos) : 680px max desktop, pleine largeur mobile (marge 20px).

---

## Espacements

- Conteneur max desktop : 1280px, marge latérale 60px jusqu'à 1400px d'écran (au-delà, marge fluide, contenu plafonné à 1280px).
- Conteneur mobile : pleine largeur, marge latérale fixe 20px.
- Espacement inter-sections (desktop) : 48px minimum entre deux blocs fonctionnels distincts.
- Espacement intra-composant (ex. intérieur d'une carte) : 12px entre éléments.
- Header : 64px desktop / 56px mobile. Sidebar admin : 220px fixe, desktop uniquement.

---

## Grille

- Grille de cartes desktop : 3 colonnes, gap 18px (Accueil "À la une", Liste des articles, Catégorie, Zone géographique).
- Grille de cartes tablette : 2 colonnes, gap 18px.
- Grille de cartes mobile : 1 colonne, gap 16px vertical.
- Résultats de recherche : toujours en liste verticale pleine largeur (jamais en grille de colonnes), quel que soit le breakpoint.
- Éditeur d'article (back-office) : 2 colonnes desktop (contenu rédactionnel ~65% / classification-statut ~35%), colonne latérale toujours visible sans scroll indépendant excessif.

---

## Composants UI

## Bouton

- Hauteur 44px, padding horizontal 20px, `radius.sm`.
- Primaire : fond `color.accent.primary` (ou `color.accent.warm` uniquement pour "S'abonner"), texte blanc, poids 500.
- Secondaire : contour 2px, fond transparent.
- Tertiaire/lien : sans fond ni bordure, texte `color.accent.primary`, soulignement au survol.
- Destructif : contour 2px `color.error`, texte `color.error`.
- Un seul bouton primaire visible à la fois par écran/formulaire.

## Input

- Hauteur 44px, padding horizontal 14px, `radius.sm`, bordure 1px `color.border`.
- Label toujours visible au-dessus du champ (jamais le placeholder seul comme libellé).
- Champ requis : `*` suffixé au label en `color.error`.

## Textarea

- Hauteur minimale 96px (chapô), 240px (corps d'article), redimensionnable verticalement en back-office uniquement.

## Select

- Hauteur 44px, chevron aligné à droite. Sélection multiple avec cases internes pour les filtres à choix multiples (recherche, catégorie/zone en navigation) — cette multiplicité ne concerne que le filtrage, jamais la classification d'un contenu.
- Le statut d'article n'est jamais un select classique : toujours rendu en 3 segments pill visibles (cf. Statuts).
- Catégorie et Zone géographique dans l'Éditeur d'article : select à choix unique, tous deux obligatoires — un contenu n'a jamais plus d'une catégorie ni plus d'une zone (cf. §Formulaires).

## Checkbox / Radio

- Case/point 20×20px, coché = fond/contour `color.accent.primary`. Zone cliquable totale ≥ 44px de hauteur sur mobile (case + libellé).

## Badge

- Padding 2px 6px, 12px `font.mono`, `radius.pill`, non interactif — jamais de hover/focus.

## Tag

- Padding 4px 12px, 13px `font.mono`, `radius.pill`, bordure 1px `color.border`. Mode édition : icône ✕ 14px, cible cliquable ≥ 24×24px.
- Créé et supprimé exclusivement dans le contexte de l'Éditeur d'article (champ mots-clés) : aucun écran de gestion globale des tags (renommage transverse, suppression en masse) en V1.

## Pill (filtre / navigation)

- Padding 6px 16px, 14px poids 500, bordure 2px, `radius.pill`. Actif : bordure/texte `color.accent.primary`.

## Card / Article Card

- Card générique : bordure 1px, `radius.sm`, padding 16px, `elevation.none`.
- Article Card grille : image 16:9 en tête, padding interne 12px, titre `font.editorial` 20px, métadonnées 13px `font.mono` en dernière ligne, ordre fixe **Type · Catégorie · Zone · Date** avec omission de la dimension déjà donnée par le contexte de page (Catégorie omise sur écran Catégorie, Zone omise sur écran Zone). Un contenu n'ayant qu'une seule catégorie et qu'une seule zone (cf. §Formulaires), cet ordre affiche toujours exactement une valeur par dimension, jamais une liste.
- Article Card liste (Résultats de recherche) : image 120×80px à gauche (desktop) / pleine largeur au-dessus (mobile), extrait 2 lignes max avec ellipse.
- Survol : titre → `color.accent.primary` uniquement (pas d'élévation, pas de zoom image).
- Catégorie/Zone/Type affichés sur une carte ou en en-tête d'article sont chacun un lien indépendant vers leur page respective.

## Search Bar

- Header desktop : 200–240px, 36px hauteur, `radius.pill`.
- Overlay mobile : plein écran, champ 48px, clavier ouvert automatiquement.
- Page Recherche dédiée : champ pleine largeur, 56px hauteur, bouton "Rechercher" intégré.

## Filtres

- Desktop : ligne de pills, gap 12px, wrap 2 lignes max.
- Mobile : bouton "Filtrer" (badge numérique si filtres actifs) → panneau bas `elevation.raised`, jusqu'à 80% de hauteur d'écran, bouton "Appliquer" sticky en bas, lien "Réinitialiser les filtres" toujours visible dès qu'un filtre est actif.

## Pagination

- Numérotée (desktop public + toutes les tables admin) : boutons 36×36px, page active fond `color.accent.primary`.
- "Charger plus" (mobile public uniquement) : bouton secondaire pleine largeur 44px, remplacé par un indicateur pendant le chargement suivant.

## Fil d'Ariane

- 14px, séparateur " / ", dernier niveau non cliquable en `color.text.primary`, niveaux parents cliquables en `color.text.secondary`.

---

## États des composants

| État                | Traitement visuel commun                                                                                                    |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Repos               | Couleurs de base du composant                                                                                               |
| Survol              | Assombrissement 10% de la couleur d'accent concernée, jamais de changement de teinte                                        |
| Focus clavier       | Contour 2px `color.accent.primary`, offset 2px, toujours visible, distinct du survol, jamais supprimé par un reset de style |
| Actif / sélectionné | Remplissage ou bordure `color.accent.primary`                                                                               |
| Désactivé           | `color.disabled.bg` / `color.disabled.text`, curseur non-interactif, aucun événement de clic                                |
| Chargement          | Indicateur neutre, sans couleur d'accent, dimensions du composant inchangées (pas de saut de mise en page)                  |
| Erreur              | `color.error` en bordure/texte + message explicite associé                                                                  |
| Vide                | Message factuel + action de sortie systématique (jamais une zone silencieuse)                                               |

---

## Formulaires

## Comportement de validation

- Validation à la soumission (jamais uniquement au blur) puis revalidation en temps réel une fois qu'une erreur a été affichée sur un champ.
- Message d'erreur toujours spécifique ("Le titre est requis pour publier"), jamais générique ("Champ invalide").
- Focus renvoyé automatiquement au premier champ en erreur après une soumission refusée.
- En cas d'échec technique (réseau/serveur), la saisie de l'utilisateur est conservée à l'écran, jamais réinitialisée.

## Règles spécifiques par formulaire

- **Newsletter** (public) : un seul champ (e-mail), validation de format côté client, mention de confidentialité toujours visible et lisible (lien vers Politique de confidentialité), "déjà inscrit" traité comme une confirmation neutre et non une erreur.
- **Contact** (public) : nom, e-mail, sujet, message — tous requis, validation par champ à la soumission.
- **Connexion administrateur** : après un échec, message générique "Identifiant ou mot de passe incorrect" (ne jamais préciser lequel des deux champs est erroné) ; champ mot de passe vidé, identifiant conservé.
- **Éditeur d'article** (back-office) : le bloc classification-statut comprend Type de contenu (select à choix unique : article/analyse/enquête/interview/dossier thématique), Catégorie (select à choix unique), Zone géographique (select à choix unique), Tags (composant Tag, saisie libre multi-valuée, toujours optionnelle, créés à la volée depuis cet écran uniquement) et Image principale avec son Texte alternatif (import + champ texte). Un contenu n'a jamais plus d'une catégorie ni plus d'une zone. Les champs Titre, Type de contenu, Catégorie, Zone géographique et Image principale (avec son texte alternatif) sont requis pour "Publier" mais pas pour "Enregistrer le brouillon" (un brouillon peut rester incomplet sur l'ensemble de ces champs) ; les Tags restent facultatifs dans tous les cas. Aucune sauvegarde automatique silencieuse en V1 — risque résiduel identifié, à traiter explicitement (avec indicateur visible type "Dernière sauvegarde à HH:MM") si implémentée.
- **Gestion des catégories/zones** (back-office) : nom + description courte, validation à la soumission du formulaire inline.

---

## Recherche

- Composant Search Bar présent sous 3 formes (header persistant desktop, icône+overlay mobile, champ dédié page Recherche) — cf. Composants UI.
- **Parcours** : Accueil ou Recherche → saisie de mots-clés → soumission → Résultats de recherche → affinage par Filtres → ouverture d'un résultat → Détail d'un article → retour avec requête et filtres strictement conservés.
- La requête reste toujours visible et modifiable en place après affichage des résultats (jamais un champ vidé après soumission).
- Aucun résultat : traité comme un état vide qualifié (cf. États vides), jamais comme une erreur — avec suggestion de reformulation et réinitialisation des filtres.
- Mise à jour du compteur de résultats annoncée aux technologies d'assistance (live-region), pas seulement affichée visuellement.
- Raccourci clavier Entrée toujours actif pour soumettre, indépendamment du clic sur l'icône/bouton.

---

## Comportement des filtres

- Dimensions communes : catégorie, zone géographique, type de contenu, date — combinables entre eux sur Liste des articles, Résultats de recherche, Catégorie (sans le filtre catégorie, déjà donné par le contexte) et Zone géographique (sans le filtre zone).
- Un lien "Réinitialiser les filtres" est systématiquement présent dès qu'au moins un filtre est actif.
- Les filtres actifs persistent lors du retour depuis un article consulté (navigateur, breadcrumb, ou "← Retour").
- Desktop : pills en ligne au-dessus des résultats. Mobile : bouton "Filtrer" unique ouvrant un panneau (cf. Composants UI et Responsive).
- Filtres secondaires contextuels (ex. zone présélectionnée par la page Catégorie visitée) sont visuellement distincts des filtres librement choisis, pour ne pas suggérer qu'ils se retirent de la même façon.

---

## Newsletter

- **Unique point de conversion du MVP** — un seul champ (e-mail), aucun champ optionnel supplémentaire.
- Trois points d'entrée : bandeau Accueil (inline, compact), bloc inline fin d'article (Détail d'un article), page dédiée dans le menu/nav (formulaire pleine page, centré).
- Bouton "S'abonner" en `color.accent.warm` — seule exception de couleur de bouton primaire de tout le produit (cf. Couleurs).
- Confirmation : le formulaire est remplacé in situ par un message de succès (jamais de redirection vers une autre page).
- "Déjà inscrit" : message neutre, non un blocage perçu comme une erreur.
- Mention de renvoi vers la Politique de confidentialité toujours présente et lisible (13px `color.text.secondary`, lien en `color.accent.primary`).
- **Désinscription** : jamais un formulaire sur le site public — accessible exclusivement via le lien de désinscription à usage unique inclus dans chaque communication envoyée. Ce lien ouvre l'écran dédié "Désinscription newsletter" (cf. ci-dessous), jamais la page Newsletter d'inscription.
- Aucune fonctionnalité de segmentation, de campagne ou d'édition de contenu de newsletter en V1 (périmètre strictement limité à la collecte d'inscrits, cf. `scope-v1.md`).

## Désinscription newsletter

- Écran technique, atteint uniquement depuis le lien de désinscription d'un e-mail — aucun lien vers cet écran depuis la navigation principale, le footer ou la page Newsletter.
- Contenu unique : message de confirmation neutre ("Vous avez été désinscrit de la newsletter."), sans champ de saisie ni bouton d'action autre qu'un retour à l'Accueil.
- Aucune connexion ni ressaisie de l'e-mail requise : l'identification se fait uniquement via le lien reçu.
- Lien déjà utilisé ou expiré : même traitement neutre que la confirmation (l'adresse n'est de toute façon plus inscrite), jamais un message d'erreur — cohérent avec le traitement du cas "déjà inscrit" à l'inscription.

---

## Dashboard Administrateur

- Layout : sidebar fixe 220px + zone de contenu fluide (padding 28px), desktop uniquement.
- 3 cartes de comptage en tête, grille 3 colonnes égales (gap 16px) : Articles publiés, Brouillons, Inscrits newsletter. Chiffre 28px poids 500, libellé 11px `font.mono` majuscules.
- **Aucun graphique, aucune courbe, aucune statistique avancée** — contrainte ferme (reportée en V3). Les compteurs restent de simples chiffres statiques par rafraîchissement de page.
- Action rapide "+ Nouvel article" : bouton primaire, toujours visible sans scroll sur une résolution desktop standard (1024×768 minimum garanti).
- Table "Derniers articles modifiés" : 4 colonnes (Titre, Catégorie, Statut, Dernière modification), 5 lignes maximum affichées, lien "Voir tous les articles" en pied si plus de contenu existe.
- Ligne de table cliquable dans son ensemble → ouvre l'éditeur de l'article correspondant.
- Feedback de sauvegarde/publication (déclenché depuis l'éditeur, visible aussi depuis le Dashboard si l'action y a été initiée) : toast bas-droite, `elevation.raised`, 4s d'affichage, texte "✓ Brouillon enregistré" / "✓ Article publié".
- État vide (premier lancement, 0 article/0 inscrit) : compteurs à 0 sans alerte visuelle, table remplacée par une invitation neutre à créer un premier article.

---

## Tables Administrateur

Utilisées sur Gestion des articles (liste), Gestion des catégories/zones, Gestion newsletter.

- En-tête de colonne : fond `color.bg.secondary`, texte 12px `font.mono` majuscules, `color.text.secondary`.
- Ligne de donnée : hauteur minimale 52px, séparateur 1px `color.border`, survol fond `color.bg.secondary` à 50% d'opacité.
- Colonnes fixes par table :
  - **Articles** : Titre, Catégorie/Zone, Statut (pastille), Date, Actions.
  - **Catégories/Zones** : Nom, Nombre d'articles associés, Actions.
  - **Newsletter** : E-mail, Date d'inscription, Action.
- Colonne Actions toujours en dernière position, alignée à droite ; actions destructives (Supprimer/Retirer) séparées d'au moins 12px des actions non destructives (Modifier), pour éviter un clic accidentel — jamais d'action destructive directe depuis la table sans passer par une Modal.
- Tri : uniquement sur Date et Statut (table Articles) ; clic sur l'en-tête inverse le sens (asc/desc), chevron indiquant le sens actif.
- Recherche/filtre en tête de table (Articles : statut/catégorie/zone ; Newsletter : e-mail) sans rechargement complet de page.
- Pagination : 20 lignes par page par défaut, toujours numérotée (jamais de "Charger plus" en back-office).
- Ligne cliquable dans son ensemble vers l'édition (table Articles), sauf sur la colonne Actions elle-même.

---

## Modales

- Usage strict : confirmation d'une action irréversible uniquement (suppression de catégorie/zone, retrait d'un inscrit newsletter) — jamais utilisée pour de la simple information.
- Dimensions : 400–480px desktop, pleine largeur moins 32px de marge sur mobile (cas d'un accès mobile occasionnel au back-office).
- Structure fixe : titre (20px `font.editorial`) → texte explicatif (15px, précise le caractère irréversible) → actions alignées à droite : "Annuler" (secondaire, au moins aussi visible que la confirmation) puis bouton destructif (`color.error`) ou de confirmation.
- Overlay arrière-plan : `rgba(20,22,26,0.4)`, assombrit tout le contenu sous-jacent.
- Fermeture : ✕ en coin haut-droit, clic sur l'overlay, touche Échap — toutes équivalentes à "Annuler".
- Focus piégé dans la modal à l'ouverture, restitué à l'élément déclencheur à la fermeture. Titre lu immédiatement par les technologies d'assistance à l'ouverture.
- Cas d'usage bloqué en amont : si une catégorie a des articles associés, "Supprimer" est désactivé et la Modal ne s'ouvre pas — un message explicite à proximité de l'action indique la raison.

---

## Notifications

Deux mécanismes distincts, jamais interchangeables :

## Toast (confirmation d'action, transitoire)

- Position bas-droite (back-office). Fond `color.bg.primary`, `elevation.raised`, `radius.sm`.
- Déclenché par : enregistrement de brouillon, publication d'article, ajout/modification de catégorie, retrait d'inscrit newsletter confirmé.
- Auto-disparition après 4s pour une confirmation de succès ; fermeture manuelle disponible.
- Toujours un texte explicite ("✓ Brouillon enregistré"), jamais une simple icône.

## Alert (bandeau, contextuel à un formulaire ou une zone)

- Pleine largeur du conteneur parent, padding 12px 16px, `radius.sm`, icône 20px + texte 15px.
- Variantes : succès (`color.status.published` en bordure/icône), erreur (`color.error`, persiste jusqu'à fermeture manuelle ou nouvelle tentative), information (`color.text.secondary`).
- Utilisée avec parcimonie sur le public (formulaires Contact/Newsletter), plus fréquente en back-office (validation d'action).
- Annoncée automatiquement aux technologies d'assistance (live-region), sans dépendre de sa seule découverte visuelle.

---

## États vides

| Écran                                                                       | Déclencheur                                                              | Traitement                                                                                                       |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| Liste des articles / Résultats de recherche / Catégorie / Zone géographique | Aucun contenu ne correspond aux filtres/à la requête                     | Message factuel ("Aucun article ne correspond à ces critères") + action "Réinitialiser les filtres" systématique |
| Accueil                                                                     | Aucun contenu phare désigné (tout premier lancement)                     | Section "À la une" affichée seule, état de démarrage normal, jamais un message d'erreur                          |
| Catégorie / Zone géographique                                               | Taxonomie créée sans article encore publié                               | Message neutre ("Aucun article publié pour le moment dans cette catégorie"), sans ton d'excuse                   |
| Dashboard administrateur                                                    | 0 article, 0 inscrit (premier lancement)                                 | Compteurs à 0 sans alerte, invitation neutre à créer un premier article                                          |
| Gestion des articles (liste)                                                | Aucun résultat après filtrage back-office                                | Message factuel + réinitialisation des filtres                                                                   |
| Gestion des catégories                                                      | Aucune catégorie/zone créée (cas non attendu, pré-remplies au lancement) | Invitation neutre à "+ Ajouter une catégorie"                                                                    |
| Gestion newsletter                                                          | Aucun inscrit (premier lancement)                                        | Compteur à 0, message neutre                                                                                     |

Règle transverse : un état vide n'est jamais un message d'erreur ; il est toujours accompagné d'au moins une action de reprise en main.

---

## États erreurs

| Contexte                 | Déclencheur                                        | Message / traitement                                                                                              |
| ------------------------ | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Connexion administrateur | Identifiants incorrects                            | "Identifiant ou mot de passe incorrect" (générique, aucun champ désigné), mot de passe vidé, identifiant conservé |
| Connexion administrateur | Session expirée par inactivité (DR-002)            | Redirection vers la Connexion, aucun contenu exposé ; message neutre informant que la session a expiré           |
| Newsletter               | Format e-mail invalide                             | Message inline sous le champ, champ conservé, focus renvoyé                                                       |
| Newsletter               | E-mail déjà inscrit                                | Confirmation neutre, pas une erreur                                                                               |
| Contact                  | Champ requis manquant                              | Message inline par champ, focus au premier champ en erreur                                                        |
| Éditeur d'article        | "Publier" sans titre                               | "Le titre est requis pour publier" ; le brouillon reste enregistrable sans cette contrainte                       |
| Recherche / Résultats    | Requête sans résultat                              | Traité comme état vide qualifié (cf. États vides), pas une erreur                                                 |
| Toute page de contenu    | Contenu introuvable (lien rompu, contenu revenu au statut Brouillon) | Page d'erreur dédiée, message factuel, lien de retour vers Accueil/Recherche — jamais une page blanche ; ne concerne jamais un contenu Archivé, qui reste accessible via son URL directe (DR-001) |
| Tout formulaire          | Échec technique (réseau/serveur)                   | "Une erreur est survenue, veuillez réessayer" (message global non spécifique au champ), saisie conservée          |

---

## États chargement

- **Squelette** : reprend exactement la forme du composant remplacé (même nombre de cartes, mêmes proportions) — utilisé sur grilles d'Article Cards, listes de résultats, tables administrateur, compteurs du Dashboard. Aucun saut de mise en page à l'arrivée du contenu réel.
- **Indicateur inline sur bouton** : soumission de formulaire (Newsletter, Contact, Connexion, Enregistrer/Publier) — le bouton conserve sa largeur (`min-width` figée à l'état repos), le libellé est remplacé par un indicateur neutre.
- **Pagination mobile** : le bouton "Charger plus" est remplacé par un indicateur pendant la requête de la page suivante.
- Aucune animation expressive : indicateurs neutres, sans couleur d'accent, cohérents avec la sobriété du système.
- Chaque état de chargement doit être annoncé aux technologies d'assistance ("Chargement des résultats en cours") puis mis à jour à la résolution.

---

## Accessibilité

- **Contraste** : texte principal ≥ 7:1 sur fond primaire (viser AAA, cohérent avec un public lisant des contenus longs) ; texte secondaire/métadonnées ≥ 4.5:1 (AA). Vérifier spécifiquement `color.accent.warm` (accent le plus clair du système) avant implémentation finale.
- **Focus clavier** visible sur 100% des éléments interactifs, style unique et cohérent (contour 2px `color.accent.primary`), jamais supprimé par un reset de style.
- **Structure sémantique** : un seul H1 par page, hiérarchie de titres sans saut de niveau, landmarks (header, nav, main, footer) posés une fois et réutilisés partout.
- **Formulaires** : labels toujours associés programmatiquement au champ ; messages d'erreur associés et annoncés au moment de leur apparition.
- **Live-regions** : compteurs de résultats/filtres, confirmations d'action (toast/alert), messages d'erreur globaux.
- **Cibles tactiles** ≥ 44×44px sur mobile pour tout élément actionnable, y compris icônes de fermeture/suppression.
- **Alt-text obligatoire** sur toute image éditoriale, y compris les placeholders explicites en phase de contenu incomplet.
- **Aucune information critique encodée uniquement par la couleur** (statuts, erreurs, filtres actifs) — toujours doublée d'un texte ou d'une icône porteuse de sens.
- **Menu mobile** : focus piégé tant qu'ouvert, fermeture au clavier (Échap), état ouvert/fermé annoncé par le bouton déclencheur.
- **Modales** : focus piégé à l'ouverture, restitué au déclencheur à la fermeture, titre lu immédiatement.

---

## Comportements interactifs

## Transitions

| Interaction                        | Transition                                                         | Durée                                 |
| ---------------------------------- | ------------------------------------------------------------------ | ------------------------------------- |
| Navigation entre pages publiques   | Changement direct, focus renvoyé en haut de la nouvelle page       | Instantané, aucune animation de page  |
| Ouverture menu mobile              | Glissement depuis le bord ou apparition plein écran, fond assombri | `transition.panel` 200ms              |
| Ouverture overlay recherche mobile | Apparition plein écran, clavier ouvert immédiatement               | `transition.panel` 200ms              |
| Ouverture panneau filtres mobile   | Glissement depuis le bas                                           | `transition.panel` 200ms              |
| Ouverture Modal                    | Apparition centrée + assombrissement arrière-plan                  | `transition.panel` 200ms              |
| Apparition toast                   | Apparition bas-droite/bandeau, disparition auto après 4s (succès)  | `transition.fast` 120ms entrée/sortie |
| Survol lien/carte                  | Titre → `color.accent.primary`                                     | `transition.fast` 120ms               |
| Focus clavier                      | Contour immédiat                                                   | Aucune transition (jamais retardé)    |
| Chargement (squelettes)            | Remplacement direct, sans fondu                                    | Aucune transition additionnelle       |

## Règles générales

- Aucune interruption non sollicitée du contenu (pas d'interstitiel, pas de pop-in d'inscription, pas de blocage de lecture).
- Toute action destructive passe par une confirmation explicite (Modal) — pas d'annulation implicite a posteriori en V1.
- Toute action de sauvegarde/publication produit un retour visible (toast), jamais un silence après clic.
- Les filtres actifs et la position de lecture sont préservés lors d'une navigation "retour".
- Partage (Détail d'article) : action externe, accessible en permanence pendant la lecture, n'interrompt jamais celle-ci.

---

## Parcours utilisateurs

### Découverte via partage (grand public / diaspora)

Lien externe → **Détail d'un article** → lecture (partage accessible en permanence) → **Contenus liés** → soit un autre article (boucle), soit **Newsletter inline** (confirmation in situ).

### Recherche documentaire ciblée (public professionnel)

**Accueil**/**Recherche** → saisie mots-clés → **Résultats de recherche** → affinage **Filtres** (compteur mis à jour en direct) → **Détail d'un article** → retour avec requête + filtres conservés → répétition sur plusieurs contenus, partage/citation à chaque étape.

### Exploration thématique (veille)

**Accueil** → Pill catégorie/zone → **Catégorie**/**Zone géographique** → parcours de la grille (filtrage secondaire optionnel) → **Détail d'un article** → retour via fil d'Ariane ou exploration d'une catégorie/zone connexe.

### Évaluation de crédibilité institutionnelle (public exigeant, 1ère visite)

**Accueil**/**Détail d'un article** → **À propos** (Mission → Méthodologie → Éditeur) → retour vers le contenu si confiance établie, ou sortie sans barrière ; accès secondaire possible vers **Contact**.

---

## Parcours administrateur

### Connexion

URL admin → **Connexion administrateur** → soumission → succès : **Dashboard** ; échec : reste sur l'écran, message générique, mot de passe vidé.

### Création d'un article

**Dashboard**/**Gestion des articles** ("+ Nouvel article") → **Éditeur** (champs vides) → rédaction → classification → métadonnées → "Enregistrer le brouillon" (validation minimale, toast) ou "Publier" (titre requis, statut → Publié, toast) → "← Retour à la liste".

### Modification d'un article

**Gestion des articles** (liste, clic ligne/"Modifier") → **Éditeur** (pré-rempli) → modification libre (contenu, classification, statut à 3 segments sans approbation) → Enregistrer/Publier (mêmes règles qu'en création) → retour à la liste.

### Gestion des catégories/zones

**Sidebar** → **Gestion des catégories** (onglet Catégories/Zones) → "+ Ajouter" ou "Modifier" (formulaire inline) → Enregistrer → toast. "Supprimer" : si 0 article associé → Modal de confirmation → suppression ; si articles associés > 0 → action désactivée, message explicite, aucune Modal ouverte.

### Gestion de la newsletter

**Sidebar** → **Gestion newsletter** → recherche par e-mail (filtrage en direct) → "Retirer" → Modal de confirmation → confirmation → ligne retirée, compteur mis à jour, toast. Aucun ajout manuel, aucun envoi de campagne (hors périmètre V1).

### Déconnexion

Depuis n'importe quel écran admin → "Déconnexion" (sidebar) → **Connexion administrateur**, sans confirmation (action réversible par reconnexion).

### Expiration de session

Depuis n'importe quel écran admin, après une période d'inactivité → session expirée automatiquement (DR-002) → redirection vers **Connexion administrateur**, aucun contenu exposé, message neutre informant que la session a expiré.

---

## Conventions UI

- Nommage des tokens : `catégorie.sous-catégorie.variante` (ex. `color.accent.primary.hover`) — à respecter tel quel en implémentation pour garder la traçabilité avec ce document.
- Unité de référence : le pixel CSS pour toutes les valeurs (tailles, espacements, rayons) ; échelles typographique et d'espacement jamais contournées par une valeur ad hoc.
- Libellés d'interface : verbes à l'infinitif pour les actions ("Publier", "Réinitialiser les filtres"), aucune ponctuation d'exclamation, aucun emoji (registre institutionnel).
- Un seul bouton primaire visible à la fois par écran/formulaire.
- Toute variante de composant non prévue dans ce document doit être validée contre les principes du Design System avant implémentation — ne pas étendre la palette de couleurs ou les rôles typographiques sans revalidation.
- Aucune couleur, aucun pictogramme, aucune iconographie assignés à une catégorie ou une zone géographique, à aucun endroit du produit.

---

## Checklist de conformité Frontend

À vérifier avant toute mise en production d'un écran ou d'un composant :

### Design tokens

- [ ] Aucune couleur hors de la table de tokens (§ Couleurs) n'est utilisée.
- [ ] `color.accent.warm` n'apparaît que sur les 3 emplacements newsletter/accroche autorisés.
- [ ] Aucun token de couleur n'a été créé pour une catégorie ou une zone géographique.
- [ ] Les 3 rôles typographiques (`font.editorial` / `font.ui` / `font.mono`) sont respectés selon leur usage prévu, sans mélange.
- [ ] Tout espacement, rayon et durée de transition provient de l'échelle définie (§ Design Tokens), aucune valeur ad hoc.

### Composants

- [ ] Chaque composant implémente tous ses états requis (repos, survol, focus, actif, désactivé, chargement, erreur) tels que définis en § États des composants.
- [ ] Les Article Cards respectent l'ordre de métadonnées Type · Catégorie · Zone · Date avec omission contextuelle correcte selon l'écran.
- [ ] Un seul bouton primaire par écran/formulaire.
- [ ] Les statuts (Brouillon/Publié/Archivé) sont toujours accompagnés d'un libellé texte, jamais de la couleur seule.

### Navigation et responsive

- [ ] Navigation principale et footer strictement identiques sur les 10 écrans publics.
- [ ] Sidebar strictement identique sur les 4 écrans admin post-connexion.
- [ ] Aucune fonction n'est retirée entre breakpoints (vérifier chaque arbitrage du tableau § Responsive).
- [ ] Cibles tactiles ≥ 44×44px vérifiées sur mobile pour tous les éléments interactifs.
- [ ] Back-office : aucun layout responsive dégradé implémenté sous 1024px (message d'orientation à la place).

### Formulaires et actions

- [ ] Toute action irréversible (suppression, retrait) passe par une Modal de confirmation.
- [ ] Toute action de sauvegarde/publication produit un toast ou un retour visible immédiat.
- [ ] Les messages d'erreur sont spécifiques et actionnables, jamais génériques.
- [ ] La saisie utilisateur est conservée après toute erreur (jamais de champ réinitialisé silencieusement).
- [ ] Le filtre "Réinitialiser les filtres" est présent dès qu'un filtre est actif.
- [ ] Les filtres et la requête de recherche sont conservés lors d'un retour depuis un article.
- [ ] Un article publié dispose toujours d'un type de contenu, d'une catégorie unique, d'une zone géographique unique et d'une image principale avec texte alternatif — ces champs bloquent "Publier" mais jamais "Enregistrer le brouillon".
- [ ] La désinscription newsletter n'est accessible que via le lien e-mail vers l'écran dédié, jamais via un formulaire sur le site public.

### États

- [ ] Chaque écran de liste/grille dispose d'un état vide qualifié avec action de sortie.
- [ ] Chaque écran de contenu dispose d'un état d'erreur défini (pas de page blanche possible).
- [ ] Chaque zone de contenu asynchrone dispose d'un état de chargement en squelette de même forme que le contenu final.

### Contrôles d'accessibilité

- [ ] Contraste vérifié pour chaque paire texte/fond utilisée (≥ 7:1 corps de texte, ≥ 4.5:1 métadonnées).
- [ ] Focus clavier visible et cohérent sur 100% des éléments interactifs.
- [ ] Un seul H1 par page, hiérarchie de titres sans saut de niveau.
- [ ] Live-regions en place pour compteurs de résultats, confirmations et erreurs globales.
- [ ] Alt-text renseigné sur toute image, y compris les placeholders.

### Périmètre

- [ ] Aucune fonctionnalité V2/V3 (compte utilisateur, contenu premium, abonnement payant, statistiques avancées) n'a été introduite dans l'interface développée.

---

_Ce document est la référence unique pour le développement de l'interface du MVP. Toute évolution du produit doit être reportée ici avant implémentation._
