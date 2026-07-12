# Project Audit — Audit de cohérence global (MVP)

**Deuxième passe d'audit**, réalisée après application des corrections issues de la première passe (image principale/alt-text, cardinalité catégorie/zone, désinscription newsletter, périmètre des tags, champ Type de contenu, route unique `/recherche`, suppression de la page d'index "Catégories"). Ce document remplace intégralement la version précédente : il reflète l'état actuel des 8 documents, pas un différentiel.

## Méthode

Relecture intégrale des 8 documents (`requirements.md`, `user-stories.md`, `scope-v1.md`, `sitemap.md`, `ui-specification.md`, `frontend-specification.md`, `implementation-roadmap.md`, `development-tasks.md`), confrontés entre eux selon les mêmes axes que la première passe : fonctionnalités manquantes, incohérences entre documents, doublons, contradictions UX, contradictions techniques, tâches sans user story, user stories sans tâche, routes sans écran, écrans sans route, composants manquants, dépendances mal ordonnées.

**Sévérités** : Critique (bloque ou fausse une livraison V1) · Important (écart réel à corriger avant/pendant le développement) · Amélioration (clarté/traçabilité, sans risque de livraison incorrecte).

---

## Sommaire exécutif

| Sévérité | Nombre de constats |
| --- | --- |
| Critique | 1 |
| Important | 1 |
| Amélioration | 4 |
| **Total** | **6** |

8 des 9 constats de la première passe sont résolus (voir §Constats résolus). Le seul constat critique restant est une conséquence directe de la dernière correction (suppression de la page d'index "Catégories") : elle a supprimé une page bancale sans la remplacer par la description des deux pages réelles qu'elle était censée représenter.

---

## Critique

### C1 — `sitemap.md` ne décrit plus aucun écran pour "Catégorie" et "Zone géographique"

**Axes** : fonctionnalité manquante · incohérence entre documents · écran sans route (au sens : écran réel absent de l'inventaire censé être complet)

**Constat** : la suppression de la page d'index "Catégories" (correction précédente, justifiée) a retiré la seule entrée du sitemap qui faisait référence, même imparfaitement, aux pages de navigation par taxonomie. Aucune entrée de remplacement n'a été ajoutée pour les deux véritables écrans que `ui-specification.md` et `frontend-specification.md` continuent de documenter en détail :

- `ui-specification.md` liste "Catégorie" et "Zone géographique" parmi les 10 écrans publics de premier niveau, avec leurs propres règles de grille, d'omission contextuelle, de fil d'Ariane et d'état vide.
- `frontend-specification.md` définit les routes `/categorie/[slug]` et `/zone/[slug]`.
- `implementation-roadmap.md` et `development-tasks.md` (P1-T9, P1-T10) planifient et développent ces écrans normalement.

Seul `sitemap.md` — le document qui se définit lui-même comme "l'arborescence **complète** des pages du périmètre MVP" — ne contient plus aucune section "### Catégorie" ni "### Zone géographique" dans ses "Pages publiques". La section "Navigation principale" de `sitemap.md` renvoie pourtant explicitement vers "son gabarit Catégorie ou Zone géographique", sans que ce gabarit soit décrit nulle part dans le même document.

**Impact** : `sitemap.md` n'est plus une source fiable et autosuffisante de l'arborescence du site ; quelqu'un s'appuyant uniquement sur ce document manquerait deux écrans réels et déjà développés ailleurs dans la chaîne.

**Recommandation** : ajouter deux entrées "### Catégorie" et "### Zone géographique" sous "Pages publiques" dans `sitemap.md` (objectif, utilisateur concerné, contenu principal), sur le modèle des entrées existantes.

---

## Important

### I1 — Dépendance Phase 4 → Phase 3 toujours non déclarée dans l'affirmation de parallélisation

**Axes** : dépendance mal ordonnée *(reporté depuis la première passe — non traité, hors périmètre des corrections demandées)*

**Constat** : inchangé depuis la première passe. `implementation-roadmap.md` affirme que les Phases 1 à 4 n'ont "aucune dépendance croisée entre elles" à l'exception des emplacements inline de la newsletter, alors que la carte P4-T1 (`development-tasks.md`) dépend explicitement de P3-T1 (pattern de validation établi en Phase 3). Cette seconde exception n'est toujours pas mentionnée.

**Recommandation** : inchangée — corriger la phrase de `implementation-roadmap.md` pour citer cette exception, ou rendre P4-T1 indépendante de P3-T1.

---

## Amélioration

### A1 — Footer de `ui-specification.md` sans point d'entrée vers la Newsletter

**Axes** : incohérence entre documents

**Constat** : `sitemap.md` décrit le footer comme incluant "un point d'entrée secondaire vers la newsletter" (lien ou formulaire d'inscription). Le §Footer de `ui-specification.md` (colonnes "Navigation" et "Informations") ne mentionne aucun lien Newsletter. Ce n'est pas une régression des dernières corrections — l'écart existait déjà avant cette session — et il reste mineur : l'inscription reste accessible par ailleurs (CTA du header, bandeau Accueil, page dédiée).

**Recommandation** : ajouter un lien Newsletter à l'une des colonnes du footer dans `ui-specification.md`, ou retirer cette mention de `sitemap.md` si le choix est de ne pas la reprendre en footer.

---

### A2 — Carte P1-T4 (`development-tasks.md`) sans sous-tâche explicite pour le menu déroulant Catégories/Zones desktop

**Axes** : tâche sans détail suffisant

**Constat** : `ui-specification.md` spécifie désormais que "Catégories" et "Zones géographiques" sont des menus déroulants au survol/clic sur desktop (mécanisme miroir de l'accordéon mobile). La carte P1-T4 ("Construire le layout public") ne liste ce comportement dans aucune de ses sous-tâches ni critères d'acceptation — seule P1-T5 (menu mobile) couvre explicitement l'équivalent "(dépliable)".

**Recommandation** : ajouter une sous-tâche à P1-T4 du type "Catégories/Zones géographiques : menu déroulant au survol/clic exposant les termes individuels" et un critère d'acceptation correspondant.

---

### A3 — Pages institutionnelles/légales et action admin "Retirer" toujours sans user story dédiée

**Axes** : tâche sans user story *(reporté depuis la première passe — non traité, non demandé)*

**Constat** : inchangé. P1-T12/P1-T13 (À propos, Mentions légales, Confidentialité) et l'action "Retirer" un inscrit newsletter (P6-T1) restent des livrables légitimes sans traçabilité formelle vers une user story.

**Recommandation** : inchangée — traçabilité à ajouter sans urgence.

---

### A4 — Chevauchement des US-013/US-016/US-025 (V2) et dépendance P6→P4-T3 non déclarée

**Axes** : doublon · dépendance mal ordonnée *(reportés depuis la première passe — non traités, non demandés, sans impact V1)*

**Constat** : inchangé sur les deux points :

- US-013, US-016, US-025 décrivent la même logique d'aperçu/accès premium dans trois contextes différents (V2, sans impact sur le développement V1 actuel).
- P6-T1 et P6-T2 ne déclarent pas leur dépendance réelle envers P4-T3 (le layout protégé), bien que l'ordre des phases reste correct.

**Recommandation** : inchangée — à traiter au moment de la planification V2 pour le premier point ; complément documentaire sans urgence pour le second.

---

## Constats résolus depuis la première passe

- **Image principale + texte alternatif** : présents dans `requirements.md`, `user-stories.md` (US-001), `ui-specification.md`, `frontend-specification.md`, `implementation-roadmap.md` et `development-tasks.md`, avec la règle Publier/Brouillon appliquée de façon cohérente partout.
- **Cardinalité catégorie/zone** : fixée à exactement une catégorie et une zone par contenu dans tous les documents ; plus aucune occurrence de "catégorie(s)"/"zone(s)" ambiguë.
- **Désinscription newsletter** : parcours complet (user story détaillée, route `/newsletter/desinscription`, écran dédié, tâches P3-T5) présent de bout en bout.
- **Gestion des tags** : explicitement hors périmètre de gestion globale dans tous les documents ; composant `Tag` ajouté à toutes les énumérations de composants qui se voulaient exhaustives.
- **Champ Type de contenu** : présent dans l'éditeur d'article et ses checklists.
- **Route `/recherche`** : traitée comme route unique partout, y compris dans le tableau de synthèse des phases de `implementation-roadmap.md`.
- **Décompte des écrans** : `ui-specification.md` clarifie désormais explicitement la distinction entre écrans de premier niveau et écrans dérivés (Éditeur, Mentions légales, Confidentialité, Désinscription newsletter).
- **Aucune fonctionnalité V2/V3** n'a été réintroduite dans les 8 documents.

---

*Ce document reflète l'état des 8 documents à la date de sa rédaction. Toute mise à jour de l'un d'eux doit donner lieu à une nouvelle revue des constats encore ouverts, en particulier C1 ci-dessus.*
