# Règle de gouvernance — Fidélité au design de référence

**Statut** : contractuel. S'applique à tous les lots REPO-1 à REPO-9 définis dans `docs/project/plan-implementation-repositionnement-asile.md`, à compter de REPO-1.
**Source de vérité unique** : `Corne de l'Afrique.dc.html` (projet claude.ai/design `50021e4b-5bed-416c-93d9-5805e6bb0831`), tel que lu au moment de la rédaction de ce document.
**`support.js`** : runtime générique de rendu du prototype (`dc-runtime`, React). Il ne contient aucune règle produit, aucune donnée éditoriale, aucune contrainte de comportement — il n'a **aucune valeur normative**. Seul le contenu du fichier `.dc.html` (structure, styles inline, données mock, textes) fait foi.

---

## 1. Principe directeur

`Corne de l'Afrique.dc.html` est la référence absolue de l'implémentation UI. En cas de doute, d'ambiguïté ou de conflit entre ce fichier et toute autre source (documentation ancienne, préférence technique, convention de code, avis esthétique), **le design source de vérité l'emporte**, sauf lorsqu'il entre en conflit avec une contrainte d'architecture explicitement préservée par le plan d'implémentation (Server Components, Server Actions, Prisma, RBAC, séparation public/admin, périmètre MVP — cf. `plan-implementation-repositionnement-asile.md`) ou avec le périmètre premium/abonnement explicitement exclu (§E du même document).

Ce document ne redéfinit aucun contenu produit. Il fixe uniquement la discipline d'exécution.

---

## 2. Les dix règles

1. **Aucune interprétation du design.** Ce qui est visible dans le fichier `.dc.html` (structure DOM, styles inline, texte, données mock) est repris tel quel. Une ambiguïté ne se résout jamais par une supposition silencieuse — elle se documente (règle 9).
2. **Aucune amélioration personnelle.** Aucun ajustement de mise en page, de micro-interaction, d'espacement ou de copywriting motivé par un jugement de goût individuel, même perçu comme une amélioration.
3. **Aucune optimisation esthétique.** Aucun réglage fin (alignement, ombre, dégradé, arrondi, contraste) non présent explicitement dans les styles inline du fichier source.
4. **Aucun redesign.** Aucune réorganisation de section, de hiérarchie visuelle ou de flux de lecture qui s'écarte de l'ordre et de la structure du fichier source.
5. **Aucune simplification visuelle.** Un élément visuellement dense ou redondant dans le design (ex. répétition d'un badge, d'un séparateur, d'une métadonnée) n'est pas allégé au prétexte de la sobriété.
6. **Aucune harmonisation non visible dans le design.** Ne pas uniformiser deux composants qui diffèrent légèrement dans le fichier source (ex. rayon, espacement, taille de police) au nom de la cohérence interne — s'ils diffèrent dans le design, ils diffèrent dans l'implémentation.
7. **Aucune création de composant absent du design.** Un lot REPO ne construit que ce que le design montre ou que ce que sa mise en œuvre mécanique exige strictement (ex. une fonction de comptage nécessaire pour afficher une donnée déjà montrée — cf. B15 du plan). Toute fonctionnalité non représentée visuellement dans le fichier source (y compris une bonne idée adjacente) est hors périmètre.
8. **Aucune suppression d'élément présent dans le design.** Un élément visible dans le fichier source (bloc, texte, icône, état interactif déclaré via `style-hover`) n'est pas omis pour des raisons de simplicité d'implémentation, sauf incompatibilité documentée avec une contrainte préservée (architecture, MVP, périmètre premium — §E du plan).
9. **Toute divergence doit être documentée et justifiée.** Aucun écart avec le fichier source — omission, report, adaptation technique — n'est acceptable sans entrée correspondante dans le Journal des divergences (§6). Une divergence non journalisée est un défaut de conformité, pas une décision.
10. **Le design est prioritaire sur toute préférence technique UI.** En cas de tension entre une convention de code, une habitude d'équipe ou une opinion sur "la bonne pratique React/Tailwind", et ce que montre le fichier source, le fichier source gagne — sous la seule réserve des contraintes d'architecture et de périmètre déjà actées (cf. §1).

---

## 3. Ce que le design source couvre — et ce qu'il ne couvre pas

Le fichier `.dc.html` est un mockup statique unique, prévisualisé à une seule dimension : `"$preview":{"width":1280,"height":900}`. Cette limite matérielle du fichier source a une conséquence directe sur ce que "fidélité" peut vouloir dire :

**Couvert par le design (donc soumis aux 10 règles sans exception) :**
- Structure de chaque section (ordre, composition, nombre de colonnes) telle que rendue en desktop ≥ 1280px.
- Tous les styles inline : couleurs, typographies, espacements, rayons, tailles.
- Tous les textes, libellés, données mock (`RUBRIQUES`, `COUNTRIES`, `TYPES`, corpus d'articles, copy des pages Méthodologie/Contact/Abonnement).
- Tous les états interactifs explicitement déclarés (`style-hover`, ordre des éléments dans les `sc-for`, affichage conditionnel via `sc-if`).

**Non couvert par le design (le fichier ne montre rien à cette échelle) :**
- Comportement responsive mobile/tablette — aucune maquette mobile n'existe dans ce fichier. Toute adaptation de largeur reste régie par les décisions déjà actées dans le plan (breakpoints existants, comportements hérités de l'ancien `ui-specification.md` là où celui-ci n'est pas contredit par le design desktop) et documentée comme zone non spécifiée, pas comme fidélité vérifiable.
- Comportement au défilement (sticky, position fixe) — un mockup statique ne peut pas le démontrer. Toute décision sur ce point (ex. D5 du plan) est une hypothèse, pas une lecture du design.
- Les props `accent`, `showCountryNav`, `showPremiumBadges` sont des leviers d'édition du prototype Claude Design (variantes de prévisualisation), pas des spécifications fonctionnelles à reproduire — elles n'imposent ni sélecteur de thème, ni interrupteur produit.

Un désaccord sur une zone "non couverte" ne peut jamais être tranché en invoquant la règle 10 ("le design gagne") — il n'y a rien à lire dans le design à cet endroit. Il suit la règle 9 : documenté comme hypothèse, pas comme lecture.

---

## 4. Ce qui constitue une conformité visuelle

Un élément est **conforme** lorsque, comparé côte à côte avec le rendu du fichier `.dc.html` (ouvert tel quel, ou via le projet claude.ai/design `50021e4b-…`) à largeur ≥ 1280px, il satisfait simultanément :

- **Structure** : même composition DOM (mêmes blocs, même ordre, même imbrication) pour la section concernée.
- **Contenu** : mêmes libellés, mêmes textes statiques, mêmes champs de données affichés dans le même ordre.
- **Données dynamiques** : les listes générées (`sc-for`) affichent la même cardinalité de champs par item et le même ordre de tri que ce que le mock donne à voir (ex. `latest` = 6 items triés par id décroissant).
- **Tokens** : couleur, typographie, rayon, espacement identiques aux valeurs inline du fichier source (rappel : ces tokens sont déjà alignés dans `app/globals.css` depuis le lot antérieur — la conformité consiste ici à ne pas s'en écarter, pas à les redéfinir).
- **États déclarés** : tout `style-hover` présent dans le design a un équivalent implémenté (au minimum : changement de couleur au survol identique).

## 5. Ce qui constitue une divergence

Un écart entre par défaut dans l'une de ces trois catégories, chacune avec un traitement distinct :

| Type de divergence | Définition | Traitement |
|---|---|---|
| **Divergence de nécessité** | Le design montre quelque chose que les contraintes préservées (architecture, MVP, périmètre premium) empêchent de construire à l'identique — ex. paywall premium, i18n réel. | Autorisée, à condition d'être journalisée (§6) avec la contrainte invoquée. |
| **Divergence de zone non couverte** | Le design ne spécifie rien à l'endroit concerné (cf. §3) — ex. comportement au scroll, mobile. | Autorisée, à condition d'être journalisée comme hypothèse explicite, pas présentée comme une lecture du design. |
| **Divergence de confort** | Tout écart motivé par une préférence technique, esthétique ou une simplification volontaire — interdite par les règles 2, 3, 5, 6. | **Non autorisée.** Doit être corrigée avant clôture de lot, pas journalisée comme un choix acceptable. |

La distinction entre les trois n'est pas laissée à l'appréciation de qui implémente : une divergence de confort ne devient pas une divergence de nécessité parce qu'elle est pratique à justifier après coup. Le test est : *"le design montre-t-il littéralement autre chose, ou ai-je choisi de faire autrement ?"* — seul le premier cas peut relever des deux premières catégories.

---

## 6. Journal des divergences

Toute divergence (nécessité ou zone non couverte) est consignée ici avant la clôture du lot qui l'introduit. Une entrée non remplie avant clôture bloque la clôture du lot (cf. §7).

Entrées déjà connues à l'ouverture de REPO-1, héritées de l'audit D0 (`plan-implementation-repositionnement-asile.md` §D0) :

| ID | Lot d'origine | Élément du design concerné | Type | Justification | Statut |
|---|---|---|---|---|---|
| DIV-D3 | REPO-3 | Sélecteur de langue FR/EN (barre utilitaire du header) | Nécessité | Une vraie bascule FR/EN implique une traduction de l'intégralité du contenu éditorial — hors périmètre d'un lot d'implémentation UI, non couvert par le plan MVP | Omis, hypothèse conservatrice — à reconfirmer |
| DIV-D5 | REPO-5 | Barre de partage en rangée inline (vs sidebar flottante desktop / barre basse mobile actuelle) | Zone non couverte | Le mockup statique ne peut pas démontrer de comportement au défilement | Comportement sticky actuel conservé, seule l'iconographie (B19) est alignée sur le design |
| DIV-D6 | REPO-7 | Formulaire Contact : mécanisme de traitement du message | Nécessité | Aucune dépendance d'envoi sortant n'existe dans le dépôt ; le design ne spécifie pas de back-end | Stockage via table Prisma + consultation admin, sans envoi e-mail sortant |
| DIV-D7 | REPO-3 | Libellé du CTA newsletter | — | Non-divergence : le design lui-même distingue "S'abonner" (payant) de "S'inscrire" (newsletter) — l'alignement du CTA existant sur "S'inscrire" est une conformité, pas un écart | Conforme dès application |
| DIV-D4 | REPO-7/REPO-8 | Absence de "À propos" dans la nav/footer du design | Zone non couverte | Le design ne référence pas cette page mais ne montre pas non plus explicitement sa suppression | Route conservée hors navigation, non liée dans le nouveau chrome |
| DIV-D1 | REPO-2/REPO-3 | Segments d'URL `/categorie/`, `/zone/` | Zone non couverte | Le design (SPA de démonstration) ne porte aucune URL réelle | Segments techniques conservés tels quels |

Toute nouvelle divergence identifiée pendant l'exécution d'un lot est ajoutée à ce tableau avec un ID `DIV-REPOn-x` avant que le lot correspondant ne soit considéré clos.

---

## 7. Validation d'un lot REPO

Un lot n'est validé que si les quatre étapes suivantes sont réalisées, dans cet ordre :

1. **Cadrage** : lister explicitement, avant implémentation, les éléments du fichier `.dc.html` couverts par le lot (référence aux ID du backlog B1-B30 du plan).
2. **Comparaison élément par élément** : pour chaque élément listé à l'étape 1, vérifier chacun des cinq critères de conformité (§4) contre le rendu du fichier source.
3. **Journalisation** : tout critère non satisfait est soit corrigé avant de continuer (si c'est une divergence de confort — interdite), soit ajouté au Journal des divergences (§6) avec son type et sa justification (si nécessité ou zone non couverte).
4. **Clôture** : un lot ne peut être déclaré terminé que si tous les éléments listés à l'étape 1 sont soit conformes (§4), soit couverts par une entrée de divergence complète (§6). Une clôture avec un écart silencieux (ni conforme, ni journalisé) n'est pas valide, indépendamment de l'avancement fonctionnel.

Ce protocole s'applique identiquement à REPO-1 (où la comparaison porte sur les données/labels, pas sur du rendu visuel) et aux lots à fort contenu visuel (REPO-3, REPO-4).

## 8. Mesure de la fidélité avant clôture

La fidélité ne se mesure pas par un score numérique fabriqué — un pourcentage non vérifiable serait lui-même une divergence par rapport à l'exigence de rigueur du produit (`docs/project/plan-implementation-repositionnement-asile.md` cite déjà cette exigence de rigueur documentaire comme trait du positionnement éditorial). Elle se mesure par une checklist catégorielle, remplie pour chaque élément en scope du lot :

| Critère | Conforme | Divergence journalisée | Non applicable |
|---|---|---|---|
| Structure (DOM/sections/ordre) | | | |
| Contenu (libellés, textes statiques) | | | |
| Données dynamiques (cardinalité, tri des listes) | | | |
| Tokens (couleur, typo, rayon, espacement) | | | |
| États interactifs déclarés (`style-hover`) | | | |

Un lot atteint la fidélité requise pour sa clôture quand **chaque ligne de chaque élément en scope est cochée dans l'une des deux premières colonnes** — jamais laissée vide. La colonne "Non applicable" n'est utilisée que pour un critère structurellement sans objet (ex. "données dynamiques" pour un bloc de texte statique comme la page Méthodologie), jamais comme échappatoire à une vérification.

---

## 9. Portée contractuelle

Ce document s'applique à REPO-1 à REPO-9 tels que définis dans `docs/project/plan-implementation-repositionnement-asile.md`. Il ne s'applique pas aux éléments premium/abonnement listés en §E du même plan, puisque ceux-ci ne sont pas implémentés dans le cadre de ces lots — leur conformité au design n'a donc pas à être mesurée tant qu'ils restent hors périmètre.

Toute modification de ce document (ajout de règle, changement de méthode de mesure) suit le même principe que le reste du plan : elle doit elle-même être explicite et documentée, jamais silencieuse.
