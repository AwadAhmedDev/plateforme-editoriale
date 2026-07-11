# Sitemap V1

## Objectif du document

Ce document définit l'arborescence complète des pages du périmètre MVP (Version 1), telle que délimitée par `scope-v1.md`. Il traduit en architecture de l'information les besoins exprimés dans `discovery.md`, `requirements.md` et `user-stories.md`, sans anticiper les fonctionnalités de comptes utilisateurs, contenus premium et abonnements payants, qui relèvent de la Version 2.

Pour chaque page sont précisés : son objectif, l'utilisateur concerné et son contenu principal.

---

## Pages publiques

### Accueil

- **Objectif** : offrir un point d'entrée qui présente la ligne éditoriale du média, met en avant les publications récentes et oriente le visiteur vers les principales sections du site. Contribue à établir la crédibilité du média dès la première visite (US-008).
- **Utilisateur concerné** : tout visiteur (grand public francophone, institutions, chercheurs, journalistes, diaspora).
- **Contenu principal** : mise en avant des derniers contenus publiés, accès aux catégories et zones géographiques phares, encart d'inscription à la newsletter, accès à la recherche.

### Liste des articles

- **Objectif** : offrir une vue exhaustive et navigable de l'ensemble des contenus publiés, indépendamment d'une recherche ciblée (US-002, US-004).
- **Utilisateur concerné** : tout visiteur, en particulier le public professionnel effectuant une veille régulière.
- **Contenu principal** : liste des contenus publiés (articles, analyses, enquêtes, interviews, dossiers thématiques), avec indication de catégorie, de zone géographique et de date de publication.

### Détail d'un article

- **Objectif** : présenter l'intégralité d'un contenu éditorial avec ses métadonnées, et permettre sa lecture ainsi que son partage (US-003, US-005, US-006).
- **Utilisateur concerné** : tout visiteur.
- **Contenu principal** : titre, corps du texte, auteur, date de publication, sources, mots-clés, catégorie et zone géographique associées, options de partage (réseaux sociaux, lien direct).

### Recherche

- **Objectif** : offrir un point d'accès dédié à la recherche documentaire par mots-clés (US-022).
- **Utilisateur concerné** : tout visiteur, en particulier le public professionnel (chercheurs, juristes, journalistes) recherchant une information précise.
- **Contenu principal** : champ de saisie de mots-clés, accès aux filtres de recherche (catégorie, zone géographique, type de contenu, date).

### Résultats de recherche

- **Objectif** : afficher les contenus correspondant à une requête et permettre leur affinage (US-022, US-023, US-025).
- **Utilisateur concerné** : tout visiteur ayant effectué une recherche.
- **Contenu principal** : liste des contenus correspondants, filtres actifs et modifiables (catégorie, zone géographique, type de contenu, date), message dédié en l'absence de résultat.

### Newsletter

- **Objectif** : permettre l'inscription à la newsletter sans création de compte (US-019).
- **Utilisateur concerné** : tout visiteur souhaitant suivre l'actualité du média.
- **Contenu principal** : formulaire d'inscription (adresse e-mail), confirmation d'inscription, information sur la nature des envois. La désinscription (US-020) ne se fait pas depuis cette page mais depuis le lien à usage unique présent dans chaque communication envoyée — cf. page « Désinscription newsletter » ci-dessous.

### Désinscription newsletter

- **Objectif** : confirmer la désinscription d'un inscrit ayant cliqué sur le lien de désinscription reçu par e-mail (US-020).
- **Utilisateur concerné** : tout inscrit à la newsletter souhaitant se désinscrire.
- **Contenu principal** : message de confirmation neutre, sans formulaire ni champ à saisir ; aucune connexion requise. Page technique non accessible depuis la navigation principale ni le footer — atteinte uniquement via le lien reçu par e-mail. Un lien déjà utilisé ou expiré affiche la même confirmation neutre plutôt qu'une erreur.

### À propos

- **Objectif** : présenter la ligne éditoriale, la mission du média et son positionnement de référence francophone sur la Corne de l'Afrique, en réponse à l'enjeu de crédibilité identifié dans `discovery.md` (§6, §9).
- **Utilisateur concerné** : tout visiteur, en particulier le public institutionnel et professionnel évaluant la fiabilité de la source.
- **Contenu principal** : présentation du média, de sa vocation documentaire, de son fonctionnement éditorial (administrateur unique), des zones et thématiques couvertes.

### Contact

- **Objectif** : offrir un canal de contact direct avec l'administrateur du média, notamment pour les demandes institutionnelles, professionnelles ou de presse.
- **Utilisateur concerné** : tout visiteur, en particulier institutions, journalistes et chercheurs souhaitant échanger avec la rédaction.
- **Contenu principal** : formulaire ou coordonnées de contact, précisions sur les motifs de contact possibles (sourcing, partenariat, presse).

### Mentions légales

- **Objectif** : satisfaire les obligations légales d'information sur l'éditeur du site, en cohérence avec les exigences de conformité (`requirements.md` §2.1).
- **Utilisateur concerné** : tout visiteur, à titre informatif ; consultation ponctuelle.
- **Contenu principal** : identification de l'éditeur, hébergeur, conditions générales d'utilisation du site.

### Politique de confidentialité

- **Objectif** : informer les visiteurs sur la collecte et le traitement de leurs données personnelles, en particulier dans le cadre de l'inscription à la newsletter (`requirements.md` §2.1).
- **Utilisateur concerné** : tout visiteur, en particulier les inscrits à la newsletter.
- **Contenu principal** : finalités de la collecte de données, durée de conservation, droits des utilisateurs, modalités d'exercice de ces droits.

---

## Pages administrateur

### Connexion administrateur

- **Objectif** : sécuriser l'accès à l'espace de gestion du site, strictement réservé à l'administrateur unique (`requirements.md` §2.1).
- **Utilisateur concerné** : administrateur unique.
- **Contenu principal** : formulaire d'authentification (identifiant, mot de passe).

### Dashboard

- **Objectif** : servir de point d'entrée central de l'espace d'administration et donner un accès rapide aux différents outils de gestion (US-026). Cette page ne constitue pas le tableau de bord d'indicateurs analytiques (US-030), dont la mise en place est prévue en Version 3.
- **Utilisateur concerné** : administrateur unique.
- **Contenu principal** : accès rapide à la gestion des articles, des catégories et de la newsletter ; vue synthétique de l'activité récente (derniers contenus créés ou modifiés).

### Gestion des articles

- **Objectif** : permettre la création, la rédaction, la modification et le pilotage du statut de l'ensemble des contenus éditoriaux (US-001, US-004, US-005, US-026).
- **Utilisateur concerné** : administrateur unique.
- **Contenu principal** : liste de l'ensemble des contenus (tous statuts confondus), actions de création, modification, publication, dépublication et suppression, recherche et filtres internes à l'espace d'administration.

### Gestion des catégories

- **Objectif** : administrer les éléments de classification des contenus (US-002, US-027).
- **Utilisateur concerné** : administrateur unique.
- **Contenu principal** : liste des catégories thématiques et des zones géographiques, actions de création, modification et suppression, consultation des contenus associés à chaque élément. Les tags ne font pas partie de cet écran : ils sont gérés directement depuis la rédaction de chaque contenu (US-003), sans gestion globale dédiée en V1.

### Gestion newsletter

- **Objectif** : donner à l'administrateur une visibilité sur les inscrits collectés via le formulaire public de newsletter (US-019, US-020). Le pilotage avancé (envoi de campagnes, suivi détaillé de l'audience — US-021, US-029) relève de la fonctionnalité « Suivi des audiences et de la newsletter » affectée à la Version 2 dans `scope-v1.md`, et n'est pas couvert par cette page en V1.
- **Utilisateur concerné** : administrateur unique.
- **Contenu principal** : liste des adresses e-mail actuellement inscrites, nombre total d'inscrits, action de retrait manuel d'un inscrit. Un inscrit désinscrit via le lien e-mail (page « Désinscription newsletter ») disparaît automatiquement de cette liste, sans action de l'administrateur.

---

## Navigation principale

Présente sur l'ensemble des pages publiques, elle donne accès aux sections structurantes du site :

- Accueil
- Catégories et Zones géographiques (menu déroulant/accordéon exposant directement chaque catégorie et chaque zone — pas de page d'index intermédiaire ; chaque terme renvoie directement à son gabarit Catégorie ou Zone géographique)
- Recherche
- À propos
- Contact
- Newsletter (mise en avant sous forme d'appel à l'action)

---

## Navigation secondaire

**Côté public**, navigation contextuelle propre à certaines pages :

- fil d'Ariane sur la page Détail d'un article (catégorie / zone géographique / article) ;
- filtres actifs sur la page Résultats de recherche (catégorie, zone géographique, type de contenu, date) ;
- liens de contenus associés et options de partage sur la page Détail d'un article.

**Côté administration**, menu de navigation interne de l'espace de gestion, accessible après connexion :

- Dashboard
- Gestion des articles
- Gestion des catégories
- Gestion newsletter
- Déconnexion

---

## Footer

Présent sur l'ensemble des pages publiques, il regroupe les informations institutionnelles et légales, ainsi qu'un point d'entrée secondaire vers la newsletter :

- lien vers la page À propos
- lien vers la page Contact
- lien ou formulaire d'inscription à la newsletter
- lien vers les Mentions légales
- lien vers la Politique de confidentialité
- mention de l'éditeur et copyright
