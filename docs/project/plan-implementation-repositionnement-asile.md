# Plan d'implémentation — Repositionnement éditorial (Asile / Migration / Droits humains)

**Statut** : repositionnement validé par le client. `Corne de l'Afrique.dc.html` (projet claude.ai/design `50021e4b-5bed-416c-93d9-5805e6bb0831`) est la référence absolue produit/UX/UI.
**Portée de ce document** : écart entre ce design et le code actuel, backlog, lots, ordre d'exécution. Aucune recommandation produit, aucune fonctionnalité inventée au-delà de ce que montre le design ou de ce qu'exige sa mise en œuvre mécanique.
**Contraintes respectées** : architecture Server Components / Server Actions / Prisma / RBAC / séparation public-admin préservée. Périmètre MVP préservé — le premium/abonnement visible dans le design est isolé en section dédiée (§E), exclu des lots MVP.

---

## A. Analyse d'écart finale

### Conservé tel quel (aucun changement)

- Architecture Server Components + îlots clients minimaux, Server Actions, couche repository Prisma unique, RBAC admin (session cookie, `ensureAdministrateurAuthentifie`), séparation stricte `app/(public)` / `app/admin/(protected)`.
- Design tokens couleur/typo/rayon (`app/globals.css`) : `#f6f3ec`, `#a3341f`, Spectral + Archivo, radius 6px — déjà alignés sur le design source depuis un lot antérieur ("Lot 1, migration UI Claude Design"). **Aucun écart visuel de fond.**
- Modèle Prisma `ContenuEditorial` (titre/chapo/corps/auteur/sources/statut/dates) : structure inchangée.
- Pages `newsletter/desinscription`, `confidentialite`, back-office complet (dashboard, articles, catégories, newsletter, connexion) : aucun écart, hors périmètre du design fourni (qui ne couvre que le public).
- `Breadcrumb`, gestion RGPD newsletter, JSON-LD, robots/sitemap : non couverts par le design, non modifiés.

### Modifié (structure ou contenu existant à faire évoluer)

- Vocabulaire de taxonomie : "Catégorie" → "Rubrique", "Zone géographique" → "Pays" (labels + contenu de données, pas le modèle Prisma).
- Header public : restructuration multi-bandeaux.
- Homepage : restructuration de 4 à 6 sections.
- Page Article : bloc partage repositionné, ajout bloc citation.
- Page Recherche : labels, ajout tri, layout sidebar.
- Footer + bandeau newsletter : restructuration 4 colonnes + bandeau sitewide.
- Enum `TypeContenu` : ajout d'une valeur (`rapport`), relabellisation d'affichage.
- Token `--color-accent-warm` et ses points d'usage : à faire converger vers l'accent unique (déjà annoncé comme dette dans le commentaire du code).

### Créé (n'existe pas actuellement)

- Page Méthodologie (`/methodologie`).
- Page Contact (`/contact`) — actuellement absente (`app/(public)/layout.tsx` le documente explicitement : *"Toujours aucun lien Contact (page inexistante)"*).
- Fonction de comptage d'articles par pays (section "Explorer par pays").
- Bloc "Citer cet article".

### Supprimé

- Bouton de partage WhatsApp (`share-bar.tsx`) — absent du nouveau design (remplacé par LinkedIn + e-mail).
- Duplication de la liste des types de contenu dans `recherche/page.tsx` (`TYPES_CONTENU_OPTIONS`) — à terme remplacée par l'import du fichier de labels partagé, source unique déjà établie comme principe du projet.
- Alias `--color-accent-warm` et classes `bg-accent-warm` / `text-accent-warm` une fois tous les composants consommateurs migrés vers `accent-primary` (le design source n'a qu'un seul accent).

### Hors périmètre de ce plan (signalé, non traité ici)

Tout ce qui relève du premium/abonnement — voir §E, isolé et exclu des lots MVP.

---

## B. Backlog complet des écarts

Légende : `[CRÉER]` `[MODIFIER]` `[SUPPRIMER]` `[CONSERVER]` — quatre étiquettes plutôt que trois, pour distinguer sans ambiguïté une création d'une modification (le mandat initial en listait trois ; une page qui n'existe pas ne peut être « modifiée »).

| # | Écart | Étiquette | Fichier(s) concerné(s) |
|---|---|---|---|
| B1 | Rubriques (contenu) : remplacer Politique/Économie/Société par Asile & protection, Migrations, Droits humains, Juridique, Analyses pays, Interviews | MODIFIER | `frontend/seed-temp.ts` (ou script de seed définitif — voir décision D2 en §D0) |
| B2 | Pays (contenu) : remplacer Éthiopie/Somalie/Kenya par Somalie, Djibouti, Somaliland, Éthiopie, Érythrée, Kenya, Soudan, Corne (régional) | MODIFIER | `frontend/seed-temp.ts` |
| B3 | Enum `TypeContenu` : ajouter la valeur `rapport` | MODIFIER | `frontend/prisma/schema.prisma` + migration SQL additive |
| B4 | Libellés de type de contenu : `article`→« Actualité », `dossier_thematique`→« Dossier » (clés DB inchangées, texte affiché seulement) | MODIFIER | `frontend/src/features/articles/type-contenu-labels.ts` |
| B5 | Dédupliquer la liste des types dans la page Recherche (utiliser la source unique au lieu d'un tableau local) | SUPPRIMER (duplication) | `frontend/app/(public)/recherche/page.tsx` |
| B6 | Libellés UI "Catégorie(s)"→"Rubrique(s)", "Zone(s) géographique(s)"→"Pays" partout où affichés | MODIFIER | `public-header.tsx`, `mobile-header-controls.tsx`, `footer-taxonomies.tsx`, `taxonomy-pills.tsx`, `recherche/page.tsx`, `categorie/[slug]/page.tsx`, `zone/[slug]/page.tsx` |
| B7 | Header : remplacer les menus déroulants `<details>` "Catégories"/"Zones géographiques" par une nav plate (6 rubriques tiennent directement) + une rangée de pills "Pays" séparée sous le header | MODIFIER | `frontend/src/components/shared/public-header.tsx` |
| B8 | Header : fond plein `bg-accent-primary` → fond translucide clair + `backdrop-filter: blur` | MODIFIER | `public-header.tsx` |
| B9 | Header : bandeau tagline statique ("Le média francophone de référence…") | CRÉER | `public-header.tsx` |
| B10 | Header : ticker "En continu" (titre du dernier article publié) | CRÉER | `public-header.tsx` (lecture via une fonction équivalente à `get-home-articles.ts`, déjà existante) |
| B11 | Header/menu mobile : refléter B7 (nav plate + pays) côté mobile | MODIFIER | `frontend/src/components/shared/mobile-header-controls.tsx` |
| B12 | Homepage : hero 2 colonnes (article vedette + liste "À la une" latérale) remplaçant l'actuel hero simple + grille 3 col unique | MODIFIER | `frontend/app/(public)/page.tsx`, `featured-article.tsx` |
| B13 | Homepage : section grille "Actualités & terrain" (4 colonnes) | MODIFIER | `page.tsx`, `article-card.tsx` (variante 4 colonnes) |
| B14 | Homepage : bandeau "Analyses & enquêtes approfondies" (2 colonnes, carte horizontale image+texte) | CRÉER | `page.tsx` + nouveau composant carte horizontale |
| B15 | Homepage : section "Explorer par pays" (cards avec compteur de publications par pays) | CRÉER | `page.tsx` + nouvelle fonction de comptage (`frontend/src/features/taxonomies/` ou `articles/`) |
| B16 | Homepage : section "Dernières publications" (liste tabulaire compacte) | CRÉER | `page.tsx` + nouveau composant liste |
| B17 | Homepage : remplacer `TaxonomyPills` (pills Catégories+Zones sous forme de section dédiée) — fonction absorbée par B7 (pays dans le header) et B15 (rubriques/pays en cards) | SUPPRIMER | `frontend/src/components/shared/taxonomy-pills.tsx` (usage sur `page.tsx`) |
| B18 | Article : repositionner la barre de partage (actuellement sidebar flottante desktop / barre basse fixe mobile) en rangée inline sous le bloc métadonnées | MODIFIER — **sous réserve, voir décision D5 en §D0** | `frontend/src/features/articles/share-bar.tsx`, `articles/[slug]/page.tsx` |
| B19 | Article : icônes de partage — retirer WhatsApp, ajouter LinkedIn et e-mail | MODIFIER/SUPPRIMER | `share-bar.tsx` |
| B20 | Article : bloc "Citer cet article" (citation formatée + bouton copier, généré depuis titre/auteur/date/URL déjà disponibles) | CRÉER | `articles/[slug]/page.tsx` |
| B21 | Recherche : renommer filtres (Catégorie→Rubrique, Zone→Pays), ajouter option de type "Rapport" | MODIFIER | `recherche/page.tsx` |
| B22 | Recherche : ajouter le tri ("Plus récent" / "Lecture la plus longue") | CRÉER (élément mineur, présent tel quel dans le design) | `recherche/page.tsx`, `search-articles.ts` |
| B23 | Recherche : layout sidebar de filtres (au lieu de la ligne de champs actuelle) | MODIFIER | `recherche/page.tsx` |
| B24 | Page Méthodologie (4 sous-sections : Sourcing et vérification, Indépendance éditoriale, Mise à jour et traçabilité, Accès professionnel) | CRÉER | `frontend/app/(public)/methodologie/page.tsx` + `content.ts` (même pattern que `a-propos`) |
| B25 | Page Contact (formulaire Nom/Courriel/Objet/Message + colonne coordonnées) | CRÉER — **mécanisme d'envoi à trancher, voir décision D6 en §D0** | `frontend/app/(public)/contact/page.tsx` + Server Action dédiée |
| B26 | Footer : restructuration 4 colonnes (marque / Rubriques / Pays / "Le média" : Recherche, Abonnement, Contact, Méthodologie, Mentions légales) + fond sombre | MODIFIER | `frontend/app/(public)/layout.tsx`, `footer-taxonomies.tsx` |
| B27 | Bandeau newsletter sombre, sitewide (présent sur toutes les pages dans le design, pas seulement l'accueil) | CRÉER (repositionnement d'un composant existant) | `layout.tsx` (le composant `NewsletterForm` existe déjà, seul son emplacement global est nouveau) |
| B28 | Token `--color-accent-warm` et classes associées : migrer vers `accent-primary`, puis supprimer l'alias | SUPPRIMER (dette déjà signalée dans le code) | `app/globals.css`, tous les call-sites (`public-header.tsx`, `newsletter-form.tsx`, `recherche/page.tsx`, `page.tsx`) |
| B29 | Sélecteur de langue FR/EN | **Signalé, non planifié** — voir décision D3 en §D0 | `public-header.tsx` |
| B30 | À propos vs Méthodologie : le nouveau design ne référence "À propos" nulle part (ni nav, ni footer) alors que la page existe et porte un contenu (mission, éditeur) distinct de Méthodologie | **Signalé, décision requise** — voir D4 en §D0 | `frontend/app/(public)/a-propos/` |

---

## C. Plan de lots MVP (hors premium — voir §E)

### REPO-0 — Décisions bloquantes (non-code)

Pas un lot de développement : un ensemble de tranchages produit à obtenir avant que certains lots puissent démarrer sans improvisation. Détaillé en §D0. Ne bloque pas REPO-1/REPO-2.

### REPO-1 — Fondations données

- **Objectif** : faire porter par les données (seed + enum) le nouveau vocabulaire éditorial, sans toucher à un seul composant d'affichage.
- **Fichiers concernés** : `frontend/prisma/schema.prisma` (ajout valeur enum `rapport`), nouvelle migration Prisma, `frontend/seed-temp.ts`, `frontend/src/features/articles/type-contenu-labels.ts`.
- **Dépendances** : aucune. Peut démarrer immédiatement.
- **Risques** : `ADD VALUE` sur un enum Postgres est additif et non destructif, mais Prisma exige parfois une migration séparée avant utilisation dans la même transaction — vérifier la procédure Prisma 7 pour cette base (`AGENTS.md` note déjà que ce projet a des spécificités Prisma 7 / driver adapter). Aucun risque sur les données existantes (rien n'est supprimé).
- **Critères de validation** : seed rejouable sans erreur ; les 6 rubriques et 8 pays existent en base avec les bons slugs ; `rapport` sélectionnable côté éditeur admin sans régression sur les 5 valeurs existantes.
- **Fidélité gagnée** : élevée pour un risque quasi nul — condition préalable de tous les autres lots visibles.

### REPO-2 — Vocabulaire dans l'UI existante (labels seuls, pas de layout)

- **Objectif** : propager "Rubrique"/"Pays" dans tous les libellés déjà affichés, sans changer la structure des composants.
- **Fichiers concernés** : B6 (liste ci-dessus) — `public-header.tsx`, `mobile-header-controls.tsx`, `footer-taxonomies.tsx`, `taxonomy-pills.tsx`, `recherche/page.tsx`, `categorie/[slug]/page.tsx`, `zone/[slug]/page.tsx`.
- **Dépendances** : REPO-1 (pour que les libellés affichés correspondent aux vraies données).
- **Risques** : faible — changement de texte uniquement, aucune logique modifiée. Vérifier les textes alternatifs et `aria-label` qui répètent "Zones géographiques"/"Catégories" (ex. `aria-label="Catégories"` dans `footer-taxonomies.tsx`).
- **Critères de validation** : recherche texte du dépôt ne renvoie plus "Zone géographique" / "Catégorie" en tant que libellé utilisateur visible sur le public (hors admin, hors modèle de données).
- **Fidélité gagnée** : gain rapide et visible pour un coût très faible — bon candidat pour livrer une première itération perceptible avant les lots structurels plus longs.

### REPO-3 — Header (refonte structurelle)

- **Objectif** : remplacer les menus déroulants par la nav plate + bandeau pays + tagline + ticker.
- **Fichiers concernés** : `public-header.tsx`, `mobile-header-controls.tsx`.
- **Dépendances** : REPO-1, REPO-2. Le sélecteur de langue (B29) est explicitement exclu de ce lot tant que D3 (§D0) n'est pas tranché — le lot livre le header sans ce sous-élément plutôt que d'improviser un comportement.
- **Risques** : composant central rendu sur 100% des pages publiques — toute régression est site-wide. Le passage de dropdown à nav plate change le comportement clavier/accessibilité (`<details>` géraient nativement l'ouverture/fermeture) : à revalider explicitement au clavier et lecteur d'écran. Le ticker (B10) introduit une dépendance de données supplémentaire dans un composant jusqu'ici purement basé sur la taxonomie.
- **Critères de validation** : header conforme au design sur les 3 breakpoints (mobile/tablette/desktop) ; navigation clavier complète sans piège de focus ; aucune régression Lighthouse/axe sur le header.
- **Fidélité gagnée** : très élevée — le header est visible sur 100% des pages, c'est l'élément de plus fort impact visuel du repositionnement après le contenu lui-même.

### REPO-4 — Homepage (refonte structurelle)

- **Objectif** : passer de 4 à 6 sections conformes au design (hero 2-col, grille 4-col, bandeau analyses, explorer-par-pays, dernières publications, retrait de `TaxonomyPills`).
- **Fichiers concernés** : `page.tsx`, `content.ts`, `featured-article.tsx`, `article-card.tsx` (nouvelle variante), nouveaux composants pour B14/B16, nouvelle fonction de comptage pour B15.
- **Dépendances** : REPO-1, REPO-2, REPO-3 (cohérence visuelle du chrome global avant de retravailler le contenu de la page qu'il encadre).
- **Risques** : la section "Explorer par pays" nécessite une requête d'agrégation (nombre d'articles par pays) qui n'existe pas aujourd'hui — à ajouter dans la couche repository existante (`src/lib/db/*-repository.ts`), pas de logique ad hoc dans le composant. Volume de contenu mock actuel (6 articles seedés) insuffisant pour remplir toutes les sections sans répétition — dépend aussi du volume réel de contenu qui sera saisi.
- **Critères de validation** : les 6 sections du design sont présentes et alimentées par de vraies données (pas de mock en dur) ; état vide géré pour chaque section indépendamment (cohérent avec le principe déjà en place dans `TaxonomyPills`/`FooterTaxonomies` : une section sans données ne s'affiche pas avec un titre vide).
- **Fidélité gagnée** : très élevée — page la plus consultée, la plus densément différente entre ancien et nouveau design.

### REPO-5 — Article (partage + citation)

- **Objectif** : aligner la page Détail d'un article sur le design (icônes de partage, bloc citation).
- **Fichiers concernés** : `articles/[slug]/page.tsx`, `share-bar.tsx`.
- **Dépendances** : REPO-1 (labels de type). Indépendant de REPO-3/REPO-4 — peut être fait en parallèle.
- **Risques** : B18 (repositionnement de la barre de partage) est conditionné à D5 (§D0) — le mockup statique ne démontre pas de comportement au scroll, donc le comportement sticky actuel (conforme à l'ancien `ui-specification.md`) ne doit pas être supprimé sans confirmation explicite qu'il est bien abandonné.
- **Critères de validation** : icônes conformes (lien, X, LinkedIn, e-mail) ; bloc citation génère un texte correct à partir des champs déjà présents (`titre`, `auteur`, `date`, URL) sans nouveau champ en base.
- **Fidélité gagnée** : moyenne — page importante mais delta visuel plus limité que header/homepage.

### REPO-6 — Recherche

- **Objectif** : renommer les filtres, ajouter le tri, adapter le layout en sidebar.
- **Fichiers concernés** : `recherche/page.tsx`, `search-articles.ts`.
- **Dépendances** : REPO-1. Indépendant de REPO-3/REPO-4/REPO-5 — parallélisable.
- **Risques** : faible — la page actuelle est déjà un formulaire GET natif filtrable par catégorie/zone/type, très proche fonctionnellement du design (le delta est surtout layout + tri). Le tri "lecture la plus longue" suppose un champ de durée de lecture déjà présent ou dérivable (à vérifier dans `search-articles.ts`/`get-article-detail.ts` — non confirmé dans ce document, à valider en ouverture de lot).
- **Critères de validation** : les 3 filtres existants continuent de fonctionner sous leurs nouveaux libellés ; tri fonctionnel sur les deux options ; aucune régression sur le comportement "aucun résultat" existant.
- **Fidélité gagnée** : faible à moyenne — la fonction existe déjà à 80%, delta essentiellement cosmétique.

### REPO-7 — Nouvelles pages statiques (Méthodologie, Contact)

- **Objectif** : créer les deux pages absentes du code actuel.
- **Fichiers concernés** : `app/(public)/methodologie/page.tsx` + `content.ts` (nouveau), `app/(public)/contact/page.tsx` (nouveau) + Server Action de soumission.
- **Dépendances** : Méthodologie n'a aucune dépendance bloquante. Contact dépend de D6 (§D0, mécanisme d'envoi/stockage du message).
- **Risques** : Contact introduit une nouvelle Server Action et potentiellement une nouvelle table ou un envoi sortant (SMTP/service tiers) — c'est la seule brique de ce plan qui touche à une capacité technique non déjà présente dans le dépôt (`AGENTS.md` ne mentionne aucune dépendance d'envoi d'e-mail sortant existante). Méthodologie est un simple contenu statique, risque nul.
- **Critères de validation** : Méthodologie affiche les 4 sous-sections du design ; Contact valide les champs requis côté serveur (cohérent avec le pattern `useActionState` déjà utilisé par `NewsletterForm`) et affiche une confirmation in situ.
- **Fidélité gagnée** : Méthodologie = gain élevé pour un coût faible. Contact = gain élevé mais coût et risque plus élevés (dépendance technique externe potentielle).

### REPO-8 — Footer + bandeau newsletter global

- **Objectif** : restructurer le footer en 4 colonnes et déplacer le bandeau newsletter en chrome global (toutes pages), conformément au design.
- **Fichiers concernés** : `app/(public)/layout.tsx`, `footer-taxonomies.tsx`.
- **Dépendances** : REPO-1, REPO-2 (libellés), REPO-7 (les liens Méthodologie/Contact doivent exister avant d'être ajoutés au footer — sinon liens morts).
- **Risques** : faible, mais c'est le lot qui touche le layout global — à livrer en dernier pour éviter de lier vers des pages pas encore construites.
- **Critères de validation** : footer conforme aux 4 colonnes ; bandeau newsletter visible et fonctionnel sur toutes les pages publiques (pas seulement l'accueil) ; aucun lien mort.
- **Fidélité gagnée** : moyenne — visible sur toutes les pages mais en bas de page (zone à moindre engagement).

### REPO-9 — Nettoyage token `--color-accent-warm`

- **Objectif** : supprimer l'alias de couleur devenu inutile une fois tous les composants migrés vers l'accent unique du design.
- **Fichiers concernés** : `app/globals.css`, tous les call-sites listés en B28.
- **Dépendances** : REPO-3, REPO-4, REPO-8 (tous les composants utilisant `accent-warm` doivent avoir été retouchés par les lots précédents).
- **Risques** : nul fonctionnellement (changement de nom de classe CSS) si fait après les lots consommateurs — risque uniquement si fait trop tôt (casse des composants pas encore migrés).
- **Critères de validation** : `grep` du dépôt ne renvoie plus aucune occurrence de `accent-warm`.
- **Fidélité gagnée** : nulle visuellement (déjà obtenue par les lots précédents) — lot de dette technique pure, à faire pour la propreté du code, pas pour la fidélité au design.

---

## D. Ordre exact d'exécution recommandé

### D0 — Décisions à obtenir avant/pendant l'exécution (non bloquant pour REPO-1/REPO-2)

| ID | Question ouverte | Bloque |
|---|---|---|
| D1 | URLs `/categorie/[slug]` et `/zone/[slug]` : conserver ces segments techniques ou les renommer en `/rubrique/[slug]` et `/pays/[slug]` ? Le design ne dicte aucune URL. | REPO-2, REPO-3 (portée du renommage) |
| D2 | Seed : `frontend/seed-temp.ts` est nommé comme provisoire — est-ce le script à faire évoluer, ou existe-t-il un script de seed définitif ailleurs (non trouvé dans ce dépôt) ? | REPO-1 |
| D3 | Sélecteur de langue FR/EN (B29) : élément présent dans le design mais impliquant une vraie traduction de contenu (portée bien au-delà d'un composant UI). Inclus tel quel dans un lot, ou explicitement hors périmètre ? | REPO-3 |
| D4 | Page "À propos" : le nouveau design ne la référence nulle part (ni nav, ni footer) mais elle existe et porte un contenu distinct de Méthodologie (mission, éditeur). Conserver en parallèle, fusionner dans Méthodologie, ou retirer de la navigation sans supprimer la route ? | REPO-7, REPO-8 |
| D5 | Barre de partage (B18) : le mockup statique ne montre pas de comportement au défilement. Le comportement sticky actuel (sidebar desktop / barre basse mobile, conforme à l'ancien `ui-specification.md`) est-il abandonné au profit d'une rangée inline, ou conservé avec la nouvelle iconographie ? | REPO-5 |
| D6 | Page Contact (B25) : mécanisme de traitement du message (table dédiée + consultation admin, envoi e-mail sortant, ou autre) — aucune dépendance d'envoi sortant n'existe actuellement dans le dépôt. | REPO-7 |
| D7 | Collision de libellé : le bouton "S'abonner" désigne aujourd'hui l'inscription newsletter (gratuite) ; dans le design, "S'abonner" désigne l'abonnement payant (§E, hors MVP). Le CTA newsletter doit-il changer de libellé pour éviter l'ambiguïté une fois le header repositionné ? | REPO-3 |

### Séquence

```
REPO-1 (fondations données)
   │
   ▼
REPO-2 (vocabulaire UI)
   │
   ▼
REPO-3 (header) ──────────────┐
   │                          │
   ▼                          ▼
REPO-4 (homepage)      REPO-5 (article) ── parallélisable
   │                          │
   │                   REPO-6 (recherche) ── parallélisable, dépend seulement de REPO-1
   │                          │
   └──────────┬───────────────┘
              ▼
        REPO-7 (méthodologie + contact)
              │
              ▼
        REPO-8 (footer + newsletter globale)
              │
              ▼
        REPO-9 (nettoyage accent-warm)
```

Justification de l'ordre : REPO-1/REPO-2 sont préalables à tout (données et vocabulaire). REPO-3 (header, chrome global) précède REPO-4 (homepage) pour éviter de retravailler une page encadrée par un header qui va lui-même changer. REPO-5 et REPO-6 ne dépendent que de REPO-1 et peuvent être menés en parallèle de REPO-3/REPO-4 par une autre personne/session si besoin. REPO-7 doit précéder REPO-8 car le footer lie vers Méthodologie et Contact. REPO-9 ferme la marche car il supprime un token que plusieurs lots précédents consomment encore.

---

## E. Éléments premium / abonnement — signalés, isolés, hors lots MVP

Le design source contient un modèle d'accès à trois paliers (gratuit / premium / accès professionnel sur inscription) qui **contredit directement** le périmètre MVP actuel :

- `AGENTS.md` (règle dure du projet) : *"No V2/V3 features anywhere in the code: no user accounts, no premium/paid content, no subscriptions, no advanced statistics/charts."*
- `docs/project/scope-v1.md` §9-11 : contenus premium et abonnement payant explicitement classés Version 2.

Éléments concernés, tous exclus des lots REPO-1 à REPO-9 :

- Page Abonnement complète (3 plans : Lecteur / Abonné 9€/mois / Institution sur devis).
- Bloc paywall en fin d'article premium ("La suite de cette analyse est réservée aux abonnés").
- Badges "Premium" sur hero, cartes secondaires, grille, bandeau analyses, listing, recherche.
- Badge "Accès sur inscription" (contenu réservé aux professionnels) et le paragraphe "Accès professionnel" de la page Méthodologie qui le justifie conceptuellement.
- Lien "Déjà abonné ? Se connecter" sur le paywall — implique un système de comptes utilisateurs, absent du MVP.
- Tout champ de données correspondant (`premium: boolean`, `register: boolean` dans le mock du design) — absent du schéma Prisma actuel, à ne pas ajouter dans le cadre de ce plan.

Ces éléments ne sont **ni planifiés, ni chiffrés, ni recommandés** ici — traitement conforme à la consigne de ne pas faire de recommandation produit sur un sujet qui relève d'un arbitrage business (V1 vs V2), déjà tranché ailleurs (`scope-v1.md`) mais potentiellement à retrancher explicitement par le client compte tenu de sa présence dans le nouveau design de référence.
