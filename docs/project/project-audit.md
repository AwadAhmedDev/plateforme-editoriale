# Project Audit — Audit de cohérence global (MVP)

**Audit croisé de l'intégralité de la chaîne documentaire du projet**, du besoin métier à la tâche de développement : `requirements.md`, `user-stories.md`, `scope-v1.md`, `sitemap.md`, `ui-specification.md`, `frontend-specification.md`, `implementation-roadmap.md`, `development-tasks.md`.

## Méthode

Chaque document a été relu intégralement, puis confronté aux sept autres selon les axes suivants : fonctionnalités manquantes, incohérences entre documents, doublons, contradictions UX, contradictions techniques, tâches de backlog sans user story, user stories sans tâche, routes sans écran, écrans sans route, composants manquants, dépendances mal ordonnées.

Chaque constat est classé en une seule sévérité (celle qui reflète le mieux son impact réel), même s'il touche plusieurs axes à la fois — l'axe concerné est indiqué en étiquette sur chaque constat. Aucun code n'est produit dans ce document : uniquement des constats et des recommandations.

**Sévérités** :

- **Critique** : bloque ou fausse la livraison d'une fonctionnalité déjà engagée en V1 ; contradiction qui rend une implémentation indéfinie si elle n'est pas tranchée avant le développement.
- **Important** : écart réel entre documents, à corriger avant ou pendant le développement de la phase concernée, mais qui ne bloque pas le démarrage immédiat du travail.
- **Amélioration** : gain de clarté, de traçabilité ou de cohérence rédactionnelle, sans risque de délivrer une fonctionnalité incorrecte.

---

## Sommaire exécutif

| Sévérité | Nombre de constats |
| --- | --- |
| Critique | 3 |
| Important | 6 |
| Amélioration | 5 |
| **Total** | **14** |

Les trois constats critiques touchent tous à la même racine : **des éléments visuellement omniprésents dans `ui-specification.md` (image d'article, catégorie/zone au pluriel, désinscription newsletter) n'ont jamais été spécifiés comme des champs ou des parcours fonctionnels dans `requirements.md` / `user-stories.md`**, et se propagent donc en angle mort jusqu'au backlog. Aucun n'est visible en lisant un seul document isolément — ils n'apparaissent qu'en confrontant le besoin métier à la spécification visuelle.

---

## Critique

### C1 — Aucun champ "image principale" ni texte alternatif dans la création de contenu

**Axes** : fonctionnalité manquante · contradiction technique

**Constat** : `ui-specification.md` suppose la présence d'une image sur chaque contenu à travers tout le produit — ratio 16:9 imposé sur l'Article Card grille, 4:3 sur l'Article Card liste, alt-text déclaré "obligatoire sur toute image éditoriale" (§Accessibilité), image en tête d'article implicite au Détail d'un article. Or **aucun document en amont ne prévoit ce champ** : `requirements.md` §1.1 et `user-stories.md` US-001 ne mentionnent qu'« un titre et un corps de texte » ; `development-tasks.md` P5-T2 (Éditeur d'article — structure et classification) ne liste que « titre, chapô, corps, auteur, sources, mots-clés ». Il n'existe donc, dans toute la chaîne documentaire, aucun endroit où l'administrateur pourrait réellement téléverser une image ou renseigner son texte alternatif.

**Impact** : sans ce champ, l'interface publique ne peut tout simplement pas afficher ce que `ui-specification.md` impose partout — un blocage fonctionnel complet, pas un simple oubli cosmétique.

**Recommandation** : ajouter un champ « Image principale + texte alternatif » à `user-stories.md` (nouveau critère sur US-001 ou nouvelle US dédiée), puis à la checklist de P5-T2 dans `development-tasks.md`.

---

### C2 — Modèle de données catégorie/zone contredit l'affichage systématique en singulier

**Axes** : contradiction UX · incohérence entre documents

**Constat** : `user-stories.md` US-002 exige explicitement le pluriel : « Je peux associer un contenu à une catégorie et à une ou plusieurs zones géographiques » et « Un contenu peut être associé à plusieurs catégories et zones simultanément ». Or `ui-specification.md` conçoit systématiquement l'affichage au singulier : l'ordre de métadonnées de l'Article Card est fixé à « Type · Catégorie · Zone · Date » (une seule valeur par dimension), et la règle d'omission contextuelle (« Catégorie omise sur écran Catégorie, Zone omise sur écran Zone ») ne fonctionne que si chaque contenu n'a qu'une seule catégorie et une seule zone. `frontend-specification.md` reconduit ce modèle singulier (une feature `taxonomies` sans mention de relation multi-valuée).

**Impact** : si le modèle de données réel autorise plusieurs catégories/zones par contenu (comme l'exige la user story), aucun composant ni aucune règle d'affichage ne définit comment un Article Card doit se comporter avec 2 catégories ou 2 zones — l'implémentation serait laissée à l'improvisation.

**Recommandation** : trancher explicitement avant le développement de P5-T1/P5-T2 : soit restreindre le modèle à une catégorie et une zone par contenu (et corriger US-002 en conséquence), soit spécifier dans `ui-specification.md` le rendu d'un Article Card multi-catégorie/multi-zone.

---

### C3 — Désinscription newsletter (US-020) absente de toute la chaîne UI/architecture/backlog

**Axes** : fonctionnalité manquante · écran sans route · tâche sans user story · user story sans tâche

**Constat** : `scope-v1.md` classe la désinscription en priorité Haute (fonctionnalité 6) et `user-stories.md` US-020 décrit un parcours précis : « Je peux me désinscrire via un lien présent dans chaque communication envoyée » — un parcours par lien à jeton, indépendant de toute page listée dans le sitemap. Or :

- `sitemap.md` (page Newsletter) promet un « moyen de désinscription » directement sur la page publique — ce qui contredit déjà le parcours par lien e-mail décrit dans US-020.
- `ui-specification.md` ne spécifie ni la page/le lien de désinscription, ni aucun composant pour ce parcours — le §Newsletter ne couvre que l'inscription.
- `frontend-specification.md` ne prévoit aucune route pour ce parcours (aucune mention dans le tableau des routes publiques).
- `development-tasks.md` (P3-T2, P3-T3) ne couvre que l'inscription ; aucune carte n'implémente US-020.
- Le tableau Newsletter de `ui-specification.md` (§Tables Administrateur) ne prévoit que 3 colonnes (E-mail, Date d'inscription, Action) sans statut de désinscription, alors que `sitemap.md` décrit la page Gestion newsletter comme affichant un « statut d'inscription ou de désinscription ».

**Impact** : une fonctionnalité priorité Haute, avec une user story dédiée et des critères d'acceptation précis, est totalement absente de la spécification visuelle et du backlog — elle serait manquée si le développement suit ces documents tels quels.

**Recommandation** : ajouter à `ui-specification.md` un écran ou un composant de désinscription (page dédiée à jeton, format à trancher), une route correspondante dans `frontend-specification.md`, et une carte dans `development-tasks.md` (Phase 3, à côté de P3-T2).

---

## Important

### I1 — Gestion des tags absente malgré une exigence explicite (US-027)

**Axes** : fonctionnalité manquante · écran sans route

**Constat** : US-027 exige de « créer, modifier et supprimer... un tag » et de « consulter la liste des contenus associés à chaque catégorie, zone **ou tag** ». Or `sitemap.md` (page Gestion des catégories) ne couvre explicitement que « catégories thématiques et... zones géographiques » ; `ui-specification.md` ne traite le Tag que comme un composant d'édition inline dans l'Éditeur d'article (ajout/suppression de mot-clé), sans aucune vue de gestion globale des tags (renommage, suppression, comptage d'articles associés). `development-tasks.md` P5-T1 ne couvre que catégories/zones.

**Recommandation** : soit retirer explicitement la gestion des tags du périmètre V1 (mise à jour de `scope-v1.md`/US-027), soit ajouter un écran ou une extension de P5-T1 dédiée à la gestion des tags.

---

### I2 — Composant "Tag" jamais planifié dans l'architecture ni le backlog

**Axes** : composant manquant

**Constat** : `ui-specification.md` §Composants UI définit un composant "Tag" à part entière (padding 4px 12px, `radius.pill`, mode édition avec icône ✕ 14px), distinct de "Pill" et de "Badge". Ce composant est structurellement nécessaire au champ "mots-clés" de l'Éditeur d'article. Pourtant `frontend-specification.md` (§Composants partagés) ne le liste jamais, et aucune carte de la Phase 0 de `development-tasks.md` ne le construit (P0-T4/T5/T6/T7 couvrent Skeleton/EmptyState/LiveRegion/StatusPill/Modal/Toast, mais pas Tag).

**Recommandation** : ajouter "Tag" à la table des composants partagés de `frontend-specification.md`, et une carte dédiée en Phase 0 (ou un sous-item de P5-T2).

---

### I3 — Champ "Type de contenu" absent de la checklist de l'Éditeur d'article

**Axes** : tâche sans user story · fonctionnalité manquante

**Constat** : US-001 exige explicitement « Je peux choisir le type de contenu (article, analyse, enquête, interview, dossier thématique) », et ce type est affiché en première position de l'ordre de métadonnées de l'Article Card (« Type · Catégorie · Zone · Date »). Or la checklist de P5-T2 dans `development-tasks.md` (« Champs de contenu : titre, chapô, corps, auteur, sources, mots-clés ») omet ce champ.

**Recommandation** : ajouter le champ "Type de contenu" à la checklist de P5-T2.

---

### I4 — Page Recherche/Résultats : une route ou deux, selon le document

**Axes** : contradiction technique · route sans écran

**Constat** : `frontend-specification.md` (§Routes publiques) modélise Recherche et Résultats de recherche comme **une seule route** (`/recherche`, pilotée par les paramètres d'URL). `implementation-roadmap.md` (Phase 2) et `development-tasks.md` (P2-T3 "Route : Recherche" et P2-T4 "Route : Résultats de recherche") les traitent comme **deux livrables de route distincts**. Les deux approches sont légitimes (un seul fichier de route avec rendu conditionnel, ou deux routes réellement distinctes), mais les documents ne s'accordent pas sur laquelle est retenue.

**Recommandation** : trancher explicitement dans `frontend-specification.md` puis aligner le libellé des cartes P2-T3/P2-T4 sur la décision (par exemple : fusionner les deux cartes en une seule si une seule route est retenue).

---

### I5 — Dépendance Phase 4 → Phase 3 non déclarée dans l'affirmation de parallélisation

**Axes** : dépendance mal ordonnée

**Constat** : `implementation-roadmap.md` affirme que « les Phases 1 à 4 peuvent être menées par des personnes différentes en parallèle... (aucune dépendance croisée entre elles), à l'exception des emplacements inline de la newsletter ». Or la carte P4-T1 ("Formulaire Connexion administrateur") de `development-tasks.md` dépend explicitement de P3-T1 (pattern de validation/action serveur établi en Phase 3). Si Phase 3 et Phase 4 sont réellement confiées à deux personnes en parallèle comme l'affirme le roadmap, P4-T1 ne peut pas démarrer avant que P3-T1 soit terminée — l'exception citée (newsletter inline) n'est pas la seule qui existe.

**Recommandation** : corriger la phrase de `implementation-roadmap.md` pour mentionner cette seconde exception, ou réordonnancer P4-T1 pour qu'il n'attende plus P3-T1 (dupliquer localement un pattern minimal de validation pour la Connexion).

---

### I6 — "Éditeur d'article" et pages légales exclus des décomptes d'écrans de `ui-specification.md`

**Axes** : incohérence entre documents · écran sans route

**Constat** : `ui-specification.md` (§Architecture UI) annonce « 10 écrans publics » et « 5 écrans administrateur » comme périmètre exhaustif. Or :

- Le Footer (§Footer) exige des liens vers Mentions légales et Politique de confidentialité, deux pages absentes des « 10 écrans » et jamais spécifiées visuellement dans le document (aucune section dédiée, contrairement à À propos ou Contact).
- L'Éditeur d'article possède des règles de mise en page propres (§Grille : « 2 colonnes desktop ») et des règles de validation dédiées (§Formulaires), sans être compté parmi les « 5 écrans administrateur » (qui ne comptent que Connexion, Dashboard, Gestion des articles, Gestion des catégories, Gestion newsletter).

**Impact** : les décomptes « 10 » et « 5 » sont utilisés comme repères de complétude ailleurs dans le document (ex. checklist de conformité) ; s'y fier littéralement conduirait à sous-estimer le nombre réel d'écrans à livrer et à vérifier.

**Recommandation** : clarifier dans `ui-specification.md` que ces décomptes portent sur les écrans de premier niveau du sitemap, et lister explicitement les écrans dérivés (Éditeur, Mentions légales, Politique de confidentialité) comme complément.

---

## Amélioration

### A1 — Pages institutionnelles/légales et action admin "Retirer" un inscrit sans traçabilité vers une user story

**Axes** : tâche sans user story

**Constat** : P1-T12 (À propos), P1-T13 (Mentions légales/Confidentialité) et l'action "Retirer" un inscrit newsletter de P6-T1 sont des livrables légitimes (conformité légale, `requirements.md` §2.1 ; bonne pratique de gestion des données personnelles) mais n'ont pas de user story correspondante dans `user-stories.md`.

**Recommandation** : ajouter, à titre de traçabilité, une mention explicite dans `requirements.md` ou une US courte pour ces cas, sans urgence de développement.

---

### A2 — Chevauchement des US-013, US-016 et US-025 (V2)

**Axes** : doublon

**Constat** : ces trois user stories décrivent, dans trois contextes différents (accès général, consultation directe, résultats de recherche), le même comportement : aperçu pour non-abonné, accès complet pour abonné actif. Elles sont toutes en Version 2, donc sans impact sur le développement V1 actuel.

**Recommandation** : à regrouper en une seule règle transverse « aperçu/accès premium », déclinée par contexte, au moment de la planification V2 — pas d'action requise maintenant.

---

### A3 — Règles UI répétées à l'identique dans plusieurs sections de `ui-specification.md`

**Axes** : doublon

**Constat** : « Un seul bouton primaire visible à la fois par écran/formulaire » et « aucun token de couleur créé pour une catégorie/zone géographique » sont chacune énoncées à trois endroits distincts du document (règle dédiée, §Conventions UI, checklist). C'est une redondance volontaire à visée pédagogique, sans contradiction de fond.

**Recommandation** : aucune action requise ; à noter uniquement si le document est un jour restructuré.

---

### A4 — Dépendance implicite de P6-T1/P6-T2 envers P4-T3 non déclarée

**Axes** : dépendance mal ordonnée

**Constat** : P6-T1 (Gestion newsletter admin) et P6-T2 (Dashboard — cartes de comptage) sont des routes protégées qui nécessitent structurellement le layout et la sidebar de P4-T3, mais cette dépendance n'est pas listée dans leur champ « Dépend de » (qui ne cite que des cartes de Phase 3/5/6). L'ordre réel des phases reste correct (Phase 4 précède Phase 6), donc il n'y a pas d'erreur de séquencement, seulement une déclaration incomplète.

**Recommandation** : compléter le champ « Dépend de » de ces deux cartes avec P4-T3, par souci d'exhaustivité documentaire.

---

### A5 — Vérification de contraste de `color.accent.warm` correctement suivie, à confirmer une seule fois

**Axes** : incohérence entre documents (constat positif à consolider)

**Constat** : `ui-specification.md` s'auto-signale qu'il faut « vérifier spécifiquement `color.accent.warm` » avant implémentation finale. Cette vérification est bien reprise dans la checklist de P7-T1 de `development-tasks.md` — aucun oubli, mais il s'agit du seul token dont la conformité reste ouverte à ce stade documentaire.

**Recommandation** : aucune action supplémentaire ; confirmer simplement le résultat de cette vérification à la clôture de P7-T1.

---

## Constats positifs de cohérence

Pour équilibrer cet audit, plusieurs points de cohérence solides ont été vérifiés et ne présentent aucune anomalie :

- Les 13 user stories affectées au MVP par `scope-v1.md` correspondent exactement aux fonctionnalités développées dans `implementation-roadmap.md` et `development-tasks.md` (hors le seul écart C3).
- Aucune dépendance de carte du backlog ne pointe vers une phase ultérieure (aucun cycle ni inversion de séquencement détecté, hors les défauts de déclaration notés en I5/A4).
- Les totaux d'estimation et de comptage de cartes annoncés dans `development-tasks.md` (49 cartes, ~82 jours-personne) correspondent à la somme réelle des cartes détaillées.
- Le périmètre V2/V3 (comptes, contenus premium, abonnements, statistiques avancées) n'apparaît nulle part dans `ui-specification.md`, `frontend-specification.md`, `implementation-roadmap.md` ou `development-tasks.md` — la frontière de périmètre posée par `scope-v1.md` est respectée de bout en bout.

---

_Ce document est un audit ponctuel réalisé sur l'état des huit documents à la date de sa rédaction. Toute mise à jour de l'un des documents sources doit donner lieu à une nouvelle revue des constats encore ouverts._
