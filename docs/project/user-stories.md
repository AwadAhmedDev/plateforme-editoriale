# User Stories

Ce document traduit les exigences fonctionnelles définies dans `requirements.md` en User Stories exploitables pour la conception UX/UI et le développement. Chaque story est rattachée à un domaine fonctionnel et associée à une priorité (Haute, Moyenne, Faible).

Ce document ne couvre que les véritables parcours utilisateurs et besoins métier. Les contraintes techniques, contraintes de sécurité, contraintes SEO et exigences non fonctionnelles sont documentées dans `requirements.md` (sections 2.1, 2.2 et 2.3) et ne sont pas dupliquées ici sous forme de User Stories.

---

## A. Gestion des contenus

### US-001 - Création et rédaction d'un contenu éditorial

**Description** : Permettre à l'administrateur de créer et rédiger un nouveau contenu (article, analyse, enquête, interview, dossier thématique).

**User Story**
En tant qu'administrateur,
Je souhaite créer et rédiger un nouveau contenu éditorial,
Afin de produire les publications du média.

## Critères d'acceptation — US-001

- Je peux créer un nouveau contenu en renseignant un titre et un corps de texte.
- Je peux choisir le type de contenu (article, analyse, enquête, interview, dossier thématique).
- Je peux enregistrer le contenu sans le publier immédiatement.
- Je peux reprendre la rédaction d'un contenu non finalisé.

**Priorité** : Haute

---

### US-002 - Catégorisation des contenus

**Description** : Permettre de classer chaque contenu par catégorie thématique et par zone géographique.

**User Story**
En tant qu'administrateur,
Je souhaite associer un contenu à une catégorie et à une ou plusieurs zones géographiques,
Afin d'organiser les publications par thématique et par pays.

## Critères d'acceptation — US-002

- Je peux sélectionner une catégorie (actualité, analyse géopolitique, juridique, social, culturel) pour un contenu.
- Je peux associer un contenu à un ou plusieurs pays/zones (Somalie, Djibouti, Somaliland, Éthiopie, Érythrée, Kenya, Soudan).
- Un contenu peut être associé à plusieurs catégories et zones simultanément.
- Les visiteurs peuvent retrouver les contenus via leur catégorie ou leur zone géographique.

**Priorité** : Haute

---

### US-003 - Enrichissement d'un contenu avec des métadonnées

**Description** : Permettre d'ajouter des métadonnées descriptives à chaque contenu pour faciliter son classement et sa recherche.

**User Story**
En tant qu'administrateur,
Je souhaite renseigner des métadonnées (auteur, date de publication, sources, mots-clés) pour chaque contenu,
Afin de faciliter son classement et sa recherche ultérieure.

## Critères d'acceptation — US-003

- Je peux renseigner l'auteur, la date de publication, les sources et des mots-clés pour un contenu.
- Les métadonnées sont visibles par les visiteurs sur la page du contenu (à l'exception des champs internes).
- Les mots-clés renseignés sont utilisés par le moteur de recherche du site.

**Priorité** : Moyenne

---

### US-004 - Gestion du statut d'un contenu

**Description** : Permettre de faire évoluer un contenu entre les statuts brouillon, publié et archivé.

**User Story**
En tant qu'administrateur,
Je souhaite gérer le statut d'un contenu (brouillon, publié, archivé),
Afin de contrôler sa visibilité et son cycle de vie.

## Critères d'acceptation — US-004

- Un contenu en statut « brouillon » n'est visible que par l'administrateur.
- Un contenu en statut « publié » est visible selon ses règles d'accès (public ou premium).
- Un contenu en statut « archivé » reste consultable dans les archives mais n'apparaît plus dans les nouveautés.
- Je peux faire passer un contenu d'un statut à l'autre à tout moment.

**Priorité** : Haute

---

### US-005 - Modification d'un contenu publié

**Description** : Permettre de mettre à jour un contenu après sa publication.

**User Story**
En tant qu'administrateur,
Je souhaite modifier un contenu déjà publié,
Afin de le corriger ou de le mettre à jour.

## Critères d'acceptation — US-005

- Je peux accéder à l'édition d'un contenu déjà publié.
- Les modifications apportées sont immédiatement visibles après enregistrement.
- L'historique de la date de dernière mise à jour du contenu est conservé.

**Priorité** : Moyenne

---

### US-006 - Partage d'un contenu

**Description** : Permettre aux visiteurs de partager un contenu consulté.

**User Story**
En tant que visiteur,
Je souhaite partager un contenu que je consulte,
Afin de le diffuser à mon réseau ou de le retrouver facilement plus tard.

## Critères d'acceptation — US-006

- Je peux partager un contenu vers les principaux réseaux sociaux.
- Je peux copier un lien direct vers le contenu consulté.
- Le partage d'un contenu premium ne donne pas accès au contenu intégral à la personne qui reçoit le lien si elle n'est pas abonnée.

**Priorité** : Moyenne

---

### US-007 - Consultation des archives

**Description** : Permettre aux visiteurs de consulter les publications passées du média.

**User Story**
En tant que visiteur,
Je souhaite consulter les archives des publications,
Afin d'accéder à l'historique des contenus du média.

## Critères d'acceptation — US-007

- Je peux accéder à une liste des contenus archivés.
- Je peux naviguer dans les archives par date, catégorie ou zone géographique.
- Les règles d'accès (public/premium) s'appliquent aussi aux contenus archivés.

**Priorité** : Moyenne

---

## B. Gestion des utilisateurs

### US-008 - Consultation des contenus publics sans compte

**Description** : Permettre à tout visiteur d'accéder librement aux contenus publics, sans inscription.

**User Story**
En tant que visiteur,
Je souhaite consulter les contenus publics du site sans créer de compte,
Afin d'accéder librement à l'information du média.

## Critères d'acceptation — US-008

- Je peux consulter l'ensemble des contenus publics sans m'identifier.
- Aucune action de consultation d'un contenu public ne me redirige vers une page d'inscription ou de connexion.
- Seuls les contenus explicitement marqués comme premium nécessitent une inscription ou un abonnement.

**Priorité** : Haute

---

### US-009 - Création d'un compte pour accéder aux ressources réservées

**Description** : Permettre à un visiteur de créer un compte afin d'accéder aux ressources documentaires, archives, sources ou contenus nécessitant une inscription.

**User Story**
En tant que visiteur,
Je souhaite créer un compte sur le site,
Afin d'accéder aux ressources documentaires et contenus réservés.

## Critères d'acceptation — US-009

- Je peux créer un compte en renseignant les informations nécessaires (ex. nom, e-mail, mot de passe).
- Je reçois une confirmation de la création de mon compte.
- Une fois mon compte créé, je peux me connecter et accéder aux ressources qui nécessitent une inscription.

**Priorité** : Haute

---

### US-010 - Gestion du profil utilisateur

**Description** : Permettre à un utilisateur inscrit de consulter et modifier les informations de son compte.

**User Story**
En tant qu'utilisateur inscrit,
Je souhaite gérer mon profil et les informations de mon compte,
Afin de maintenir mes informations à jour.

## Critères d'acceptation — US-010

- Je peux consulter les informations de mon profil (nom, e-mail, statut d'abonnement).
- Je peux modifier mes informations personnelles et mon mot de passe.
- Je peux consulter le statut de mon abonnement depuis mon profil.

**Priorité** : Moyenne

---

## C. Gestion des abonnements

### US-011 - Souscription à un abonnement

**Description** : Permettre à un visiteur de souscrire à une offre d'abonnement payant donnant accès aux contenus premium.

**User Story**
En tant que visiteur,
Je souhaite souscrire à un abonnement payant,
Afin d'accéder aux contenus premium du média.

## Critères d'acceptation — US-011

- Je peux consulter les différentes offres d'abonnement disponibles et leurs conditions.
- Je peux souscrire à une offre en renseignant les informations nécessaires au paiement.
- Une fois la souscription confirmée, mon compte bénéficie immédiatement de l'accès aux contenus premium.

**Priorité** : Haute

---

### US-012 - Gestion de son abonnement

**Description** : Permettre à un abonné de suivre, renouveler ou résilier son abonnement.

**User Story**
En tant qu'abonné,
Je souhaite gérer mon abonnement (suivi, renouvellement, résiliation),
Afin de garder le contrôle sur mon accès aux contenus premium.

## Critères d'acceptation — US-012

- Je peux consulter le statut et la date d'échéance de mon abonnement.
- Je peux renouveler mon abonnement avant son échéance.
- Je peux résilier mon abonnement à tout moment.
- Je suis informé des conséquences de la résiliation sur mon accès aux contenus premium.

**Priorité** : Haute

---

### US-013 - Distinction entre abonnés et non-abonnés

**Description** : Permettre au système de distinguer les utilisateurs abonnés des visiteurs non abonnés afin de conditionner l'accès aux contenus.

**User Story**
En tant que visiteur ou abonné,
Je souhaite que le site reconnaisse mon statut d'abonnement,
Afin de me donner accès aux contenus correspondant à mes droits.

## Critères d'acceptation — US-013

- Le statut d'abonnement d'un utilisateur connecté est vérifié avant l'affichage d'un contenu premium.
- Un utilisateur non abonné voit un aperçu du contenu premium et une invitation à s'abonner.
- Un abonné actif accède directement au contenu intégral.

**Priorité** : Haute

---

### US-014 - Suivi des abonnements actifs

**Description** : Permettre à l'administrateur de suivre l'ensemble des abonnements en cours.

**User Story**
En tant qu'administrateur,
Je souhaite suivre la liste des abonnements actifs,
Afin de piloter l'activité économique du média.

## Critères d'acceptation — US-014

- Je peux consulter la liste des abonnés actifs, expirés et résiliés.
- Je peux consulter la date de souscription et d'échéance de chaque abonnement.
- Je peux consulter le nombre total d'abonnés actifs à un instant donné.

**Priorité** : Moyenne

---

## D. Gestion des contenus premium

### US-015 - Désignation d'un contenu comme premium

**Description** : Permettre à l'administrateur de réserver certains contenus à forte valeur ajoutée aux abonnés.

**User Story**
En tant qu'administrateur,
Je souhaite désigner un contenu comme premium,
Afin de le réserver aux abonnés ou membres disposant d'un accès spécifique.

## Critères d'acceptation — US-015

- Je peux marquer un contenu (article, analyse, dossier, rapport) comme premium lors de sa création ou de sa modification.
- Un contenu premium est identifiable visuellement par les visiteurs (ex. pictogramme ou mention).
- Je peux désigner un contenu comme premium indépendamment de sa catégorie ou de sa zone géographique.

**Priorité** : Haute

---

### US-016 - Aperçu d'un contenu premium pour un visiteur non abonné

**Description** : Permettre à un visiteur non abonné de consulter un aperçu d'un contenu premium afin de l'inciter à s'abonner.

**User Story**
En tant que visiteur non abonné,
Je souhaite consulter un aperçu d'un contenu premium,
Afin de connaître son existence et d'évaluer l'intérêt de m'abonner.

## Critères d'acceptation — US-016

- Je peux consulter un résumé ou un extrait du contenu premium sans m'identifier.
- Le contenu intégral n'est pas accessible tant que je ne dispose pas d'un abonnement actif.
- Un message ou bouton m'invite clairement à m'abonner pour accéder au contenu complet.

**Priorité** : Haute

---

### US-017 - Accès complet à un contenu premium pour un abonné

**Description** : Permettre à un abonné actif d'accéder à l'intégralité d'un contenu premium.

**User Story**
En tant qu'abonné actif,
Je souhaite accéder à l'intégralité d'un contenu premium,
Afin de bénéficier de la valeur de mon abonnement.

## Critères d'acceptation — US-017

- Je peux consulter l'intégralité d'un contenu premium dès que je suis connecté avec un abonnement actif.
- L'accès m'est retiré automatiquement si mon abonnement expire ou est résilié.
- Je ne rencontre aucune restriction d'accès supplémentaire une fois mon statut d'abonné vérifié.

**Priorité** : Haute

---

### US-018 - Modification du statut d'accès d'un contenu

**Description** : Permettre à l'administrateur de faire évoluer un contenu entre accès gratuit et accès premium.

**User Story**
En tant qu'administrateur,
Je souhaite modifier à tout moment le statut d'accès d'un contenu (gratuit ou premium),
Afin d'ajuster la stratégie de valorisation des contenus.

## Critères d'acceptation — US-018

- Je peux faire passer un contenu de gratuit à premium et inversement.
- Le changement de statut s'applique immédiatement à l'affichage du contenu pour les visiteurs.
- L'historique des contenus reste accessible quel que soit le changement de statut.

**Priorité** : Moyenne

---

## E. Gestion de la newsletter

### US-019 - Inscription à la newsletter

**Description** : Permettre à un visiteur de s'inscrire à la newsletter en renseignant son adresse e-mail.

**User Story**
En tant que visiteur,
Je souhaite m'inscrire à la newsletter en renseignant mon adresse e-mail,
Afin de recevoir les nouvelles publications, analyses, enquêtes et actualités du média.

## Critères d'acceptation — US-019

- Je peux m'inscrire à la newsletter sans créer de compte sur le site.
- Je reçois une confirmation de mon inscription.
- Mon adresse e-mail est enregistrée uniquement à des fins d'envoi de la newsletter.

**Priorité** : Haute

---

### US-020 - Désinscription de la newsletter

**Description** : Permettre à un inscrit de se désinscrire de la newsletter à tout moment.

**User Story**
En tant qu'inscrit à la newsletter,
Je souhaite me désinscrire à tout moment,
Afin de ne plus recevoir les communications du média si je le souhaite.

## Critères d'acceptation — US-020

- Je peux me désinscrire via un lien présent dans chaque communication envoyée.
- Ma désinscription est prise en compte immédiatement.
- Je ne reçois plus de communication après ma désinscription.

**Priorité** : Moyenne

---

### US-021 - Gestion des inscrits et envoi des communications

**Description** : Permettre à l'administrateur de consulter la liste des inscrits à la newsletter et de leur envoyer des communications.

**User Story**
En tant qu'administrateur,
Je souhaite consulter la liste des inscrits à la newsletter et déclencher l'envoi de communications,
Afin de diffuser les nouvelles publications auprès de mon audience.

## Critères d'acceptation — US-021

- Je peux consulter la liste des adresses e-mail inscrites à la newsletter.
- Je peux consulter le nombre total d'inscrits.
- Je peux déclencher l'envoi d'une communication à l'ensemble des inscrits.

**Priorité** : Moyenne

---

## F. Gestion de la recherche documentaire

### US-022 - Recherche par mots-clés

**Description** : Permettre aux visiteurs de rechercher un contenu par mots-clés.

**User Story**
En tant que visiteur,
Je souhaite rechercher un contenu par mots-clés,
Afin de retrouver rapidement une information sur un sujet précis.

## Critères d'acceptation — US-022

- Je peux saisir un ou plusieurs mots-clés dans un champ de recherche.
- Les résultats affichent les contenus dont le titre, le résumé ou les mots-clés correspondent à ma recherche.
- Aucun résultat ne s'affiche si aucun contenu ne correspond à ma recherche, avec un message approprié.

**Priorité** : Haute

---

### US-023 - Filtrage des résultats de recherche

**Description** : Permettre d'affiner les résultats de recherche selon plusieurs critères.

**User Story**
En tant que visiteur,
Je souhaite filtrer les résultats de recherche par catégorie, zone géographique, type de contenu et date,
Afin de cibler précisément l'information recherchée.

## Critères d'acceptation — US-023

- Je peux appliquer un ou plusieurs filtres simultanément (catégorie, zone géographique, type de contenu, date).
- Les résultats se mettent à jour en fonction des filtres sélectionnés.
- Je peux réinitialiser les filtres pour revenir à une recherche globale.

**Priorité** : Moyenne

---

### US-024 - Consultation structurée des rapports et dossiers documentaires

**Description** : Permettre aux visiteurs de parcourir les rapports et dossiers documentaires de façon organisée.

**User Story**
En tant que visiteur,
Je souhaite consulter les rapports et dossiers documentaires organisés par thématique ou par pays,
Afin d'accéder facilement à une documentation structurée sur un sujet donné.

## Critères d'acceptation — US-024

- Je peux accéder à une vue dédiée regroupant les rapports et dossiers documentaires.
- Les rapports et dossiers sont classés par thématique et par pays/zone géographique.
- Les règles d'accès (public/premium) s'appliquent à chaque rapport ou dossier consulté.

**Priorité** : Moyenne

---

### US-025 - Respect des règles d'accès dans les résultats de recherche

**Description** : Garantir que les résultats de recherche respectent les droits d'accès de l'utilisateur.

**User Story**
En tant que visiteur non abonné,
Je souhaite que les résultats de recherche n'affichent qu'un aperçu des contenus premium,
Afin de ne pas accéder à du contenu réservé sans y être autorisé.

## Critères d'acceptation — US-025

- Un contenu premium apparaît dans les résultats de recherche avec une indication claire de son statut.
- Seul un aperçu (titre, résumé) du contenu premium est visible pour un utilisateur non autorisé.
- Un abonné actif accède au contenu complet directement depuis les résultats de recherche.

**Priorité** : Haute

---

## G. Administration du site

### US-026 - Espace de gestion centralisé des contenus

**Description** : Fournir à l'administrateur un espace unique pour gérer l'ensemble des contenus du site.

**User Story**
En tant qu'administrateur,
Je souhaite disposer d'un espace de gestion centralisé,
Afin de créer, modifier, publier, dépublier et supprimer l'ensemble des contenus du site.

## Critères d'acceptation — US-026

- Je peux accéder à une vue listant l'ensemble des contenus, quel que soit leur statut.
- Je peux effectuer toutes les actions de gestion (création, modification, publication, dépublication, suppression) depuis cet espace.
- Je peux retrouver rapidement un contenu via une recherche ou des filtres internes à l'espace d'administration.

**Priorité** : Haute

---

### US-027 - Gestion des catégories, zones géographiques et tags

**Description** : Permettre à l'administrateur de gérer les éléments de classification des contenus.

**User Story**
En tant qu'administrateur,
Je souhaite gérer les catégories, les zones géographiques et les tags du site,
Afin de maintenir une classification cohérente des contenus.

## Critères d'acceptation — US-027

- Je peux créer, modifier et supprimer une catégorie, une zone géographique ou un tag.
- Je peux consulter la liste des contenus associés à chaque catégorie, zone ou tag.
- La suppression d'un élément de classification ne supprime pas les contenus qui y sont associés.

**Priorité** : Moyenne

---

### US-028 - Gestion des offres d'abonnement et des conditions d'accès

**Description** : Permettre à l'administrateur de définir et d'ajuster les offres d'abonnement et les règles d'accès aux contenus premium.

**User Story**
En tant qu'administrateur,
Je souhaite gérer les offres d'abonnement et les conditions d'accès aux contenus premium,
Afin d'adapter le modèle économique du média.

## Critères d'acceptation — US-028

- Je peux créer, modifier ou désactiver une offre d'abonnement.
- Je peux définir les conditions d'accès associées à chaque offre.
- Les modifications apportées aux offres s'appliquent aux nouvelles souscriptions sans affecter rétroactivement les abonnements en cours, sauf action explicite de ma part.

**Priorité** : Moyenne

---

### US-029 - Consultation des listes d'utilisateurs, d'abonnés et d'inscrits à la newsletter

**Description** : Permettre à l'administrateur de consulter l'ensemble des publics inscrits sur le site.

**User Story**
En tant qu'administrateur,
Je souhaite consulter la liste des utilisateurs inscrits, des abonnés et des inscrits à la newsletter,
Afin de connaître et suivre mon audience.

## Critères d'acceptation — US-029

- Je peux consulter séparément la liste des comptes utilisateurs, des abonnés et des inscrits à la newsletter.
- Je peux consulter, pour chaque liste, les informations essentielles (date d'inscription, statut).
- Je peux exporter ou consulter ces listes de manière simple pour un suivi régulier.

**Priorité** : Moyenne

---

### US-030 - Suivi de l'activité globale du site

**Description** : Permettre à l'administrateur de suivre les indicateurs clés de l'activité du site.

**User Story**
En tant qu'administrateur,
Je souhaite suivre l'activité globale du site (publications, abonnements, inscriptions),
Afin d'évaluer l'atteinte des objectifs business du média.

## Critères d'acceptation — US-030

- Je peux consulter le nombre de contenus publiés sur une période donnée.
- Je peux consulter l'évolution du nombre d'abonnés et d'inscrits à la newsletter.
- Je peux accéder à ces indicateurs depuis l'espace d'administration sans manipulation technique complexe.

**Priorité** : Faible
