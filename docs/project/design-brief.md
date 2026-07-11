# Design Brief — Plateforme éditoriale Corne de l'Afrique

Ce document synthétise, à l'attention d'un designer UX/UI, l'ensemble des informations nécessaires pour aborder la conception de la Version 1 (MVP) du projet. Il s'appuie exclusivement sur `discovery.md`, `requirements.md`, `user-stories.md`, `scope-v1.md` et `sitemap.md`.

Il ne contient ni choix technique, ni wireframe, ni maquette : il pose le cadre de sens, d'usage et d'intention avant la phase de conception visuelle.

---

## Présentation du projet

Le projet consiste à créer une plateforme éditoriale en ligne dédiée à l'actualité, à l'analyse et à la documentation de la Corne de l'Afrique (Somalie, Djibouti, Somaliland, Éthiopie, Érythrée, Kenya, Soudan).

Le site a pour ambition de devenir **le média francophone de référence** sur cette région, en centralisant des contenus aujourd'hui dispersés sur différents canaux numériques, au profit d'une information fiable, vérifiée et documentée.

Le projet est porté par un **éditeur unique**, qui assure à la fois la rédaction, la publication et l'administration de l'ensemble du site. Ce brief couvre le périmètre de la **Version 1 (MVP)** tel que défini dans `scope-v1.md` : consultation publique et gratuite des contenus, sans comptes utilisateurs, contenus premium ni abonnements payants (fonctionnalités reportées en Version 2).

---

## Vision du produit

- Devenir **la principale plateforme francophone de référence** consacrée à la Corne de l'Afrique.
- Être reconnu comme **ressource documentaire fiable** par les organisations internationales, les administrations, les juridictions, les chercheurs, les journalistes et les acteurs de la société civile travaillant sur la région.
- **Centraliser et pérenniser** l'ensemble des publications du média sur un support professionnel unique, en remplacement d'une diffusion aujourd'hui fragmentée.
- Construire, dès le lancement, une **audience qualifiée et fidèle** via la newsletter, en préparation d'un futur modèle d'accès différencié (contenus premium, abonnements) prévu en Version 2.

La V1 a pour rôle de valider cette vision par la qualité et la spécialisation de l'offre éditoriale, avant d'investir dans la couche de monétisation.

---

## Objectifs UX

- **Installer la confiance dès la première visite** : le public visé (institutions, juristes, chercheurs) doit percevoir immédiatement le sérieux et la rigueur du média.
- **Rendre la navigation par thématique et zone géographique évidente**, ces deux axes structurant l'ensemble de la base documentaire.
- **Rendre la recherche et le filtrage visibles et efficaces**, condition de crédibilité pour un public professionnel en quête d'une information précise.
- **Soigner la lisibilité des contenus longs et denses** (analyses, enquêtes, dossiers, rapports), en évitant toute lecture fatigante ou mal hiérarchisée.
- **Réduire au minimum la friction d'inscription à la newsletter**, seul point de conversion du MVP.
- **Faciliter le partage** d'un contenu consulté, principal levier de diffusion organique au lancement.
- **Garantir une expérience de gestion simple et directe pour l'administrateur unique**, qui cumule rédaction, publication et administration sans équipe support.
- **Assurer une expérience cohérente sur mobile**, le site devant rester pleinement consultable via navigateur, en l'absence d'application dédiée (hors périmètre).

---

## Utilisateurs cibles

| Catégorie | Type d'usage attendu |
| --- | --- |
| Organisations internationales (institutions onusiennes, ONG internationales) | Veille, documentation, sourcing |
| Institutions publiques / administrations | Veille, analyse, documentation |
| ONG actives dans la région | Veille, analyse, documentation |
| Chercheurs / universitaires | Recherche documentaire, citation de sources |
| Journalistes | Veille, sourcing, citation |
| Juristes et avocats spécialisés | Documentation juridique, rapports |
| Populations de la Corne de l'Afrique et diaspora | Actualité, analyses, partage |
| Administrateur du site (éditeur unique) | Rédaction, publication, gestion intégrale du site |

Deux populations aux attentes distinctes cohabitent : un **public professionnel et institutionnel exigeant**, orienté recherche documentaire et fiabilité, et un **public grand public / diaspora**, orienté actualité, compréhension et partage. Le design doit servir les deux sans complexifier l'expérience de l'un au détriment de l'autre.

---

## Besoins utilisateurs

### Public professionnel (institutions, chercheurs, juristes, journalistes)

- Retrouver rapidement une information précise (recherche par mots-clés, filtrage par catégorie, zone géographique, type de contenu et date — US-022, US-023).
- Identifier clairement les métadonnées d'un contenu pour le citer ou le sourcer (auteur, date, sources — US-003).
- Distinguer sans ambiguïté ce qui relève de l'actualité, de l'analyse ou du document structurant (rapport, dossier).
- Accéder à l'historique des publications dans le temps (contenus archivés — US-004).

### Public grand public / diaspora

- Accéder librement à l'information sans aucune friction d'inscription (US-008).
- Comprendre facilement des sujets complexes, sans connaissance préalable poussée.
- Partager un contenu vers ses propres réseaux (US-006).
- Rester informé dans la durée via une inscription simple à la newsletter (US-019, US-020).

### Administrateur unique

- Disposer d'un espace de gestion centralisé, sans complexité de rôles ou de droits (US-026).
- Classer un contenu efficacement au moment de sa création (catégorie, zone géographique, tags — US-002, US-027).
- Faire évoluer un contenu entre brouillon, publié et archivé sans ambiguïté (US-004, US-005).
- Visualiser simplement les inscrits à la newsletter (US-019, US-020).

---

## Parcours utilisateurs principaux

### 1. Découverte via partage — visiteur grand public

Arrivée sur un article partagé (réseau social ou lien direct) → lecture de l'article → découverte de contenus liés (catégorie ou zone géographique) → inscription à la newsletter.

### 2. Recherche documentaire ciblée — public professionnel

Arrivée sur le site (accueil ou moteur de recherche externe) → recherche par mots-clés → affinage par filtres (catégorie, zone, type, date) → consultation de plusieurs contenus → partage ou citation.

### 3. Exploration thématique — visiteur en veille

Arrivée sur l'accueil → navigation par catégorie ou zone géographique → parcours de la liste des articles associés → lecture d'un contenu en détail.

### 4. Prise de connaissance institutionnelle — public exigeant

Arrivée sur le site → consultation de la page « À propos » pour évaluer la fiabilité de la source → retour vers les contenus si la crédibilité perçue est suffisante.

### 5. Publication d'un contenu — administrateur

Connexion à l'espace d'administration → rédaction ou modification d'un contenu → classification (catégorie, zone géographique, tags, métadonnées) → publication → vérification ponctuelle des inscrits à la newsletter.

Ces parcours s'appuient directement sur les pages définies dans `sitemap.md` et doivent guider les priorités de conception (accès rapide à la recherche et aux catégories depuis toute page, mise en avant de la newsletter sans être intrusive).

---

## Pages à concevoir

L'arborescence complète, avec l'objectif, l'utilisateur concerné et le contenu principal de chaque page, est détaillée dans `sitemap.md`. Ce brief en rappelle la structure pour cadrer le périmètre de conception.

### Pages publiques

Accueil · Liste des articles · Détail d'un article · Catégories · Recherche · Résultats de recherche · Newsletter · À propos · Contact · Mentions légales · Politique de confidentialité

### Pages administrateur

Connexion administrateur · Dashboard · Gestion des articles · Gestion des catégories · Gestion newsletter

### Éléments transversaux

Composants d'interface présents sur l'ensemble ou une partie des pages, à concevoir comme des éléments à part entière : Navigation principale · Navigation secondaire (fil d'Ariane, filtres contextuels, menu de l'espace d'administration) · Footer.

Aucune page relative aux comptes utilisateurs, aux contenus premium ou aux abonnements ne doit être conçue à ce stade : ces fonctionnalités relèvent de la Version 2 (`scope-v1.md`).

---

## Priorités UX

Classées selon la valeur métier et la priorité affectée dans `scope-v1.md` (fonctionnalités à priorité Haute du MVP) :

1. **Crédibilité et confiance perçues dès l'arrivée sur le site** — condition d'adoption par un public professionnel exigeant.
2. **Recherche et filtrage documentaire** — différenciateur central du positionnement de référence documentaire.
3. **Lisibilité et confort de lecture** des contenus longs (analyses, enquêtes, dossiers).
4. **Navigation par catégorie et zone géographique**, fluide et sans effort.
5. **Inscription à la newsletter à friction minimale** — unique point de conversion du MVP.
6. **Partage de contenu** simple et visible.
7. **Efficacité de l'espace d'administration** pour un utilisateur unique, sans complexité inutile.
8. **Cohérence de l'expérience sur mobile**, le site devant rester pleinement utilisable via un navigateur mobile.

---

## Contraintes métier

- **Administrateur unique** : aucune fonctionnalité de gestion multi-rédacteurs, de rôles ou de droits différenciés n'est à prévoir (`discovery.md` §5, §7).
- **Aucun compte utilisateur, contenu premium ou abonnement en V1** : l'intégralité des contenus du MVP est publique et librement accessible (`scope-v1.md`).
- **Sujet sensible et géopolitique** : la conception doit servir un traitement neutre, rigoureux et traçable de l'information ; aucun élément visuel ou éditorial ne doit suggérer un parti pris (`discovery.md` §4, §7).
- **Volume de contenu limité au lancement** : la production repose sur une seule personne. Le design doit valoriser la qualité et la densité de chaque contenu plutôt que le volume, et éviter les gabarits qui exposeraient un manque de contenu (`discovery.md` §8).
- **Hors périmètre explicite** : forum, commentaires avancés, messagerie instantanée, application mobile dédiée (`scope-v1.md`, section « Hors périmètre »).
- **Exigences SEO** : la structure des contenus et de la navigation doit favoriser l'indexation et la découverte par les moteurs de recherche (`requirements.md` §2.2).
- **Protection des données personnelles** : les informations collectées (newsletter) doivent être traitées de façon transparente pour l'utilisateur, avec un accès facile aux pages Mentions légales et Politique de confidentialité (`requirements.md` §2.1).

---

## Ton éditorial

Un ton **sérieux, factuel et rigoureux**, proche de la presse spécialisée et de la documentation institutionnelle, sans dérive vers un traitement sensationnaliste des sujets géopolitiques traités.

Le ton doit rester **accessible** au grand public francophone et à la diaspora, sans jargon excessif, tout en conservant la précision et la traçabilité (sources, dates, auteurs) attendues par le public professionnel.

La sensibilité des sujets couverts (région en tension, acteurs institutionnels et diplomatiques) impose une **neutralité affichée** : le ton ne doit jamais laisser transparaître de position partisane.

---

## Image de marque recherchée

- Une identité de **média francophone de référence** sur une région sous-représentée dans la presse francophone.
- Un positionnement de **sérieux et de crédibilité**, plus proche d'une publication spécialisée ou d'un centre de documentation que d'un blog personnel ou d'un média grand public généraliste.
- La perception d'un **fonds documentaire qui se construit et se capitalise dans le temps** (`discovery.md` §9), plutôt qu'un simple flux d'actualité éphémère.
- Un ancrage régional fort et assumé sur la Corne de l'Afrique, traité avec **rigueur et respect**, sans folklorisation ni simplification excessive des sujets.
- Une image qui inspire confiance à un public institutionnel (organisations internationales, juristes, chercheurs) tout en restant chaleureuse et engageante pour le grand public et la diaspora.

---

## Inspirations et références

À titre de pistes de positionnement — à discuter et affiner avec le client, aucune validation client n'ayant encore été recueillie sur ce point précis :

- Médias francophones d'analyse internationale et régionale (ex. *Jeune Afrique*, *Le Monde Afrique*) pour le registre éditorial et la hiérarchie de l'information.
- Organisations de documentation et d'analyse géopolitique (ex. rapports de type *International Crisis Group*) pour la rigueur de présentation des dossiers et rapports.
- Médias spécialisés en actualité humanitaire et régionale (ex. *The New Humanitarian*) pour l'équilibre entre actualité vivante et fonds documentaire.

Ces références portent sur le **registre éditorial, le sérieux perçu et la structuration de l'information** — en aucun cas sur une direction visuelle ou une interface à reproduire.

---

## Critères de réussite UX

- Un visiteur professionnel retrouve un contenu précis en un minimum d'étapes, grâce à la recherche et au filtrage.
- Un nouveau visiteur perçoit le sérieux et la fiabilité du média dès la page d'accueil, sans avoir besoin de naviguer davantage pour se forger une première impression positive.
- La lecture d'un contenu long (analyse, dossier, rapport) reste confortable, sur desktop comme sur mobile.
- Le parcours d'inscription à la newsletter ne nécessite qu'une action minimale (adresse e-mail), sans détour ni création de compte.
- Le partage d'un contenu est accessible en permanence pendant la lecture, sans perturber celle-ci.
- L'administrateur peut créer, classer et publier un contenu en un nombre d'étapes réduit, sans accompagnement ni formation complexe.
- La navigation par catégorie et par zone géographique permet, dans la majorité des cas, de retrouver un contenu sans recourir à la recherche par mots-clés.
- Les pages institutionnelles (À propos, Mentions légales, Politique de confidentialité) sont accessibles en un clic depuis n'importe quelle page, sans encombrer la navigation principale.
