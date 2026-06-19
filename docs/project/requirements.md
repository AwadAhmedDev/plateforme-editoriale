# Requirements — Exigences fonctionnelles et non fonctionnelles

## 1. Exigences fonctionnelles

### 1.1 Gestion des contenus

- Le site doit permettre la création, la rédaction et la publication d'articles, d'analyses, d'enquêtes, d'interviews et de dossiers thématiques.
- Les contenus doivent pouvoir être organisés par catégories (ex. actualité, analyse géopolitique, juridique, social, culturel) et par zone géographique (Somalie, Djibouti, Somaliland, Éthiopie, Érythrée, Kenya, Soudan).
- Chaque contenu doit pouvoir être enrichi de métadonnées (auteur, date de publication, sources, mots-clés) permettant son classement et sa recherche ultérieure.
- Le site doit permettre la gestion du statut de chaque contenu (brouillon, publié, archivé).
- Le site doit permettre la modification et la mise à jour des contenus après publication.
- Les contenus doivent pouvoir être partagés par les visiteurs (partage vers réseaux sociaux ou par lien).
- Le site doit permettre la consultation d'archives de publications dans le temps.

### 1.2 Gestion des utilisateurs

- Le site doit distinguer deux grands types d'utilisateurs : l'administrateur unique (rédaction, publication, gestion intégrale du site) et les visiteurs/abonnés (consultation des contenus).
- La consultation des contenus publics ne doit pas nécessiter de création de compte.
- La création d'un compte doit être proposée aux visiteurs souhaitant accéder à des ressources documentaires, archives, sources ou contenus nécessitant une inscription ou un abonnement.
- Le site doit permettre à un utilisateur inscrit de gérer son profil et les informations liées à son compte.
- Aucune fonctionnalité de gestion multi-rédacteurs ou de droits différenciés entre plusieurs collaborateurs n'est requise dans le périmètre initial ; l'administrateur unique dispose de l'ensemble des droits.

### 1.3 Gestion des abonnements

- Le site doit permettre la mise en place d'un ou plusieurs niveaux d'abonnement payant donnant accès aux contenus premium.
- Le site doit permettre à un visiteur de souscrire à un abonnement et de gérer cet abonnement (suivi, renouvellement, résiliation).
- Le site doit permettre de distinguer les utilisateurs abonnés des visiteurs non abonnés afin de conditionner l'accès aux contenus réservés.
- Le site doit permettre à l'administrateur de suivre les abonnements actifs.

### 1.4 Gestion des contenus premium

- Le site doit permettre de désigner certains contenus (articles spécialisés, analyses approfondies, dossiers documentaires, rapports) comme réservés aux abonnés ou aux membres disposant d'un accès spécifique.
- Les contenus premium doivent rester partiellement visibles pour les visiteurs non abonnés (ex. aperçu ou résumé), afin d'inciter à l'abonnement, sans dévoiler leur contenu intégral.
- L'accès complet à un contenu premium ne doit être possible que pour les utilisateurs disposant d'un abonnement actif ou d'un accès spécifique valide.
- Le site doit permettre à l'administrateur de modifier à tout moment le statut d'accès d'un contenu (gratuit ou premium).

### 1.5 Gestion de la newsletter

- Le site doit permettre à un visiteur de s'inscrire à une newsletter en renseignant son adresse e-mail, sans obligation de créer un compte.
- L'inscription à la newsletter doit permettre au visiteur de recevoir les nouvelles publications, analyses, enquêtes et actualités relatives à la Corne de l'Afrique.
- Le visiteur doit pouvoir se désinscrire de la newsletter à tout moment.
- L'administrateur doit pouvoir consulter la liste des inscrits à la newsletter et déclencher l'envoi des communications.

### 1.6 Gestion de la recherche documentaire

- Le site doit permettre une recherche par mots-clés sur l'ensemble des contenus publiés (articles, analyses, dossiers, rapports).
- Le site doit permettre un filtrage des résultats de recherche par catégorie, par pays/zone géographique, par type de contenu et par date.
- Le site doit permettre la consultation de rapports et dossiers documentaires organisés de façon structurée (ex. par thématique ou par pays).
- Les résultats de recherche doivent respecter les règles d'accès aux contenus (un contenu premium ne doit apparaître que sous forme d'aperçu pour un utilisateur non autorisé).

### 1.7 Administration du site

- L'administrateur doit disposer d'un espace de gestion centralisé lui permettant de créer, modifier, publier, dépublier et supprimer l'ensemble des contenus.
- L'administrateur doit pouvoir gérer les catégories, les zones géographiques et les tags utilisés pour classer les contenus.
- L'administrateur doit pouvoir gérer les offres d'abonnement et les conditions d'accès aux contenus premium.
- L'administrateur doit pouvoir consulter la liste des utilisateurs inscrits, des abonnés et des inscrits à la newsletter.
- L'administrateur doit pouvoir suivre l'activité globale du site (publications, abonnements, inscriptions) afin d'évaluer l'atteinte des objectifs business.

## 2. Exigences non fonctionnelles

### 2.1 Contraintes de sécurité

- Les accès réservés (contenus premium, espace d'administration) doivent être protégés par un mécanisme d'authentification fiable.
- Les données personnelles des utilisateurs (comptes, abonnés, inscrits à la newsletter) doivent être protégées et traitées conformément aux exigences de protection des données applicables.
- L'accès à l'espace d'administration doit être strictement réservé à l'administrateur unique du site.
- Les informations de paiement liées aux abonnements doivent être traitées de manière sécurisée, sans exposer de données sensibles.
- Le site doit garantir l'intégrité des contenus publiés, en empêchant toute modification ou accès non autorisé.

### 2.2 Contraintes SEO

- Les contenus publics doivent être structurés de manière à favoriser leur indexation et leur référencement par les moteurs de recherche, afin d'asseoir la visibilité du média en tant que source francophone de référence.
- Chaque contenu doit pouvoir disposer d'éléments descriptifs (titre, résumé, mots-clés) optimisés pour la recherche, tant pour les visiteurs que pour les moteurs de recherche.
- La structure de navigation et de classification des contenus (catégories, zones géographiques, archives) doit faciliter leur découverte par les moteurs de recherche.
- Les contenus premium doivent rester partiellement indexables (aperçu) afin de contribuer à la visibilité du site sans compromettre le modèle d'accès payant.

### 2.3 Autres exigences non fonctionnelles

- Le site doit pouvoir accueillir un volume croissant de contenus et d'utilisateurs dans le temps, dans la perspective de la constitution d'un fonds documentaire pérenne.
- Le site doit rester simple d'utilisation pour un administrateur unique assurant seul l'ensemble de la gestion éditoriale.
- Le site doit garantir une disponibilité et une fiabilité cohérentes avec son positionnement de ressource documentaire utilisée par des institutions, des juristes et des chercheurs.

## 3. Critères de succès

- Mise en ligne d'une plateforme centralisant l'ensemble des publications du média, remplaçant la diffusion dispersée actuelle.
- Capacité du site à distinguer clairement contenus gratuits et contenus premium, avec un accès fonctionnel et fiable pour les abonnés.
- Mise en place opérationnelle d'un système d'abonnement payant aux contenus premium.
- Mise en place opérationnelle d'une newsletter permettant la collecte d'adresses e-mail et l'envoi de communications.
- Disponibilité d'un moteur de recherche documentaire permettant de retrouver efficacement les contenus publiés par mots-clés, catégorie, zone géographique et type de contenu.
- Reconnaissance progressive du site comme ressource documentaire fiable par les utilisateurs cibles (organisations internationales, institutions, chercheurs, journalistes, juristes).
- Autonomie complète de l'administrateur unique dans la gestion de l'ensemble des contenus et du site, sans dépendance à des fonctionnalités multi-rédacteurs non requises à ce stade.
