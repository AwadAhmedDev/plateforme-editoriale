# Scope V1 — Périmètre fonctionnel du projet

## Objectif du document

Ce document définit précisément le périmètre fonctionnel du projet afin d'éviter tout dépassement de budget ou de délai. Il découpe les besoins identifiés dans `discovery.md`, `requirements.md` et `user-stories.md` en trois paliers (MVP, Version 2, Version 3), selon trois critères :

- **Maximisation du ROI** : prioriser les fonctionnalités qui apportent le plus de valeur métier pour le coût de réalisation le plus faible.
- **Rapidité de mise en production** : réduire le périmètre initial au strict nécessaire pour publier et tester la proposition de valeur auprès de la cible.
- **Élimination du superflu** : exclure toute fonctionnalité non indispensable, notamment celles supposant une équipe éditoriale élargie, des rôles complexes ou des dispositifs d'interaction communautaire (forum, chat, commentaires avancés, application mobile), le projet étant porté par un administrateur unique.

Chaque fonctionnalité est rattachée aux User Stories correspondantes (`user-stories.md`), avec sa valeur métier, sa priorité et la justification du palier auquel elle est affectée.

---

## MVP (Version 1)

**Logique du MVP** : permettre à l'administrateur unique de publier et structurer ses contenus, et au public francophone d'y accéder librement, dès le lancement — sans système de comptes, de paiement ou d'abonnement. Cette version valide la proposition de valeur éditoriale (qualité, spécialisation, accessibilité francophone) et amorce la construction d'une audience, avant d'investir dans la couche de monétisation (abonnements, contenus premium), plus coûteuse et plus longue à sécuriser. Aucune fonctionnalité retenue ici ne nécessite de gestion multi-rédacteurs, de rôles complexes ou de dispositifs communautaires.

### 1. Rédaction et publication d'articles

**Description** : Permettre à l'administrateur de créer, rédiger, modifier et faire évoluer le statut (brouillon, publié, archivé) de ses contenus éditoriaux.

**User Stories concernées** : US-001, US-004, US-005

**Valeur métier** : Fonction cœur du métier — sans elle, aucune publication n'est possible. C'est le socle indispensable de toute la plateforme.

**Priorité** : Haute

**Justification** : Fonctionnalité non négociable pour le lancement ; aucune alternative ni report possible. Périmètre volontairement limité à un seul rédacteur/éditeur, conformément au fonctionnement actuel du client.

---

### 2. Organisation éditoriale (catégories, zones géographiques, métadonnées)

**Description** : Permettre de classer chaque contenu par une catégorie thématique et une zone géographique (Somalie, Djibouti, Somaliland, Éthiopie, Érythrée, Kenya, Soudan) — toutes deux obligatoires et uniques par contenu — et de l'enrichir de métadonnées (auteur, date, sources) et d'un nombre libre de mots-clés (tags) optionnels, créés depuis la rédaction du contenu.

**User Stories concernées** : US-002, US-003

**Valeur métier** : Structure la base documentaire dès le premier jour et conditionne la qualité de la recherche et de la navigation, deux piliers du positionnement de référence documentaire visé.

**Priorité** : Haute

**Justification** : Coût de réalisation faible (intégré nativement à la création de contenu) pour une valeur élevée ; reporter cette fonctionnalité obligerait à reclasser les contenus a posteriori, ce qui coûterait plus cher.

---

### 3. Consultation publique des contenus

**Description** : Permettre à tout visiteur de consulter librement les contenus publics, sans création de compte.

**User Stories concernées** : US-008

**Valeur métier** : Condition d'accès à l'ensemble de l'audience cible (institutions, chercheurs, diaspora, grand public) dès le lancement, sans friction d'inscription.

**Priorité** : Haute

**Justification** : Fonctionnalité indispensable à l'existence même du site ; aucune monétisation n'est requise pour la délivrer, ce qui en fait l'un des éléments les plus rentables du périmètre.

---

### 4. Recherche et filtrage documentaire

**Description** : Permettre une recherche par mots-clés sur l'ensemble des contenus publiés, avec filtrage par catégorie, zone géographique, type de contenu et date.

**User Stories concernées** : US-022, US-023

**Valeur métier** : Différenciateur clé pour le public professionnel (chercheurs, juristes, journalistes, institutions) qui doit pouvoir retrouver rapidement une information précise — c'est l'un des arguments principaux du positionnement « ressource documentaire de référence ».

**Priorité** : Haute

**Justification** : S'appuie directement sur les données déjà produites par les fonctionnalités 1 et 2 (catégories, zones, métadonnées) ; le coût d'ajout du filtrage est marginal par rapport à la recherche simple, pour un gain de crédibilité important auprès de la cible professionnelle.

---

### 5. Partage de contenu

**Description** : Permettre aux visiteurs de partager un contenu consulté (réseaux sociaux, lien direct).

**User Stories concernées** : US-006

**Valeur métier** : Levier de diffusion organique gratuit, essentiel pour construire la notoriété d'un média qui démarre.

**Priorité** : Moyenne

**Justification** : Fonctionnalité simple et peu coûteuse à intégrer, avec un effet de levier important sur l'acquisition d'audience ; rapport coût/valeur très favorable dès le lancement.

---

### 6. Newsletter (inscription et désinscription)

**Description** : Permettre à un visiteur de s'inscrire à la newsletter via son adresse e-mail, sans création de compte, et de se désinscrire à tout moment via un lien de désinscription à usage unique présent dans chaque communication envoyée.

**User Stories concernées** : US-019, US-020

**Valeur métier** : Constitue dès le lancement une audience captive et fidélisée, condition de la pérennité du média et future base de conversion vers l'abonnement payant (Version 2).

**Priorité** : Haute

**Justification** : Fonctionnalité légère techniquement (simple collecte d'e-mails) mais à fort impact business ; capitaliser sur l'audience dès le premier jour évite de repartir de zéro lorsque la monétisation sera introduite. La gestion avancée de l'envoi des campagnes (US-021) est différée en Version 2.

---

### 7. Espace d'administration des contenus

**Description** : Fournir à l'administrateur un espace centralisé pour créer, modifier, publier, dépublier et supprimer les contenus, et gérer les catégories et zones géographiques. Les tags restent hors de cet espace de gestion globale : ils sont créés et supprimés uniquement depuis la rédaction d'un contenu.

**User Stories concernées** : US-026, US-027

**Valeur métier** : Outil de travail quotidien de l'unique responsable éditorial ; sans lui, la production et la maintenance des contenus ne sont pas viables dans le temps.

**Priorité** : Haute

**Justification** : Fonctionnalité indispensable à l'autonomie de l'administrateur unique ; ne nécessite aucune gestion de droits multi-utilisateurs, ce qui simplifie considérablement sa réalisation.

---

## Version 2

**Logique de la V2** : une fois l'audience initiale construite et la valeur éditoriale validée, cette version introduit la couche de monétisation et de gestion des accès (comptes, contenus premium, abonnements payants), ainsi que les outils d'administration associés. C'est la version qui transforme le média en modèle économique viable, conformément à l'objectif business de valorisation des contenus à forte valeur ajoutée.

### 8. Comptes utilisateurs

**Description** : Permettre à un visiteur de créer un compte et de gérer son profil, nécessaire pour accéder aux ressources réservées.

**User Stories concernées** : US-009, US-010

**Valeur métier** : Prérequis technique et fonctionnel à toute logique d'abonnement ou d'accès réservé.

**Priorité** : Haute (au sein de la V2)

**Justification** : Non nécessaire au lancement puisque tous les contenus du MVP sont publics ; son introduction est conditionnée par l'arrivée des contenus premium, ce qui justifie son report en V2 plutôt qu'un investissement anticipé non exploité.

---

### 9. Contenus premium

**Description** : Permettre de désigner certains contenus comme premium, d'en afficher un aperçu aux non-abonnés, d'en donner l'accès complet aux abonnés, et de faire évoluer leur statut d'accès.

**User Stories concernées** : US-013, US-015, US-016, US-017, US-018, US-025

**Valeur métier** : Cœur du modèle de monétisation du média ; permet de valoriser économiquement les analyses approfondies, enquêtes et dossiers documentaires.

**Priorité** : Haute (au sein de la V2)

**Justification** : Fonctionnalité à forte valeur ajoutée mais non indispensable pour démarrer ; elle nécessite que l'audience et le volume de contenus soient suffisants pour qu'un modèle d'abonnement soit crédible, ce qui en fait un objectif de seconde étape plutôt que de lancement.

---

### 10. Abonnement payant

**Description** : Permettre à un visiteur de souscrire à une offre d'abonnement payant, et de la gérer (suivi, renouvellement, résiliation).

**User Stories concernées** : US-011, US-012

**Valeur métier** : Génère le revenu récurrent du média et concrétise l'objectif business de modèle économique pérenne.

**Priorité** : Haute (au sein de la V2)

**Justification** : Implique l'intégration d'un système de paiement, plus coûteuse et plus longue à sécuriser (conformité, fiabilité) qu'une fonctionnalité éditoriale classique ; la différer permet une mise en production rapide du MVP sans bloquer le lancement sur cette complexité.

---

### 11. Administration des abonnements et des accès

**Description** : Permettre à l'administrateur de gérer les offres d'abonnement, les conditions d'accès aux contenus premium, et de suivre les abonnements actifs.

**User Stories concernées** : US-028, US-014

**Valeur métier** : Pilotage opérationnel du modèle économique introduit par les fonctionnalités 9 et 10.

**Priorité** : Moyenne

**Justification** : Dépend directement de l'existence des contenus premium et des abonnements ; n'a pas de raison d'être avant leur mise en place.

---

### 12. Suivi des audiences et de la newsletter (back-office)

**Description** : Permettre à l'administrateur de consulter les listes d'utilisateurs inscrits, d'abonnés et d'inscrits à la newsletter, et de déclencher l'envoi de communications aux inscrits.

**User Stories concernées** : US-029, US-021

**Valeur métier** : Permet de mesurer la croissance de l'audience et d'activer la newsletter comme canal de diffusion structuré, au-delà de la simple collecte d'e-mails du MVP.

**Priorité** : Moyenne

**Justification** : Le MVP capte déjà les e-mails (fonctionnalité 6) ; l'outillage avancé de pilotage et d'envoi n'est utile qu'une fois l'audience suffisamment développée pour justifier des campagnes régulières.

---

### 13. Archives et consultation documentaire enrichie

**Description** : Permettre la consultation des contenus archivés et une vue dédiée aux rapports et dossiers documentaires organisés par thématique ou par pays.

**User Stories concernées** : US-007, US-024

**Valeur métier** : Renforce le positionnement de fonds documentaire pérenne, valorisant l'accumulation de contenus dans le temps.

**Priorité** : Moyenne

**Justification** : Au lancement, la navigation par catégorie/zone (fonctionnalité 2) et la recherche (fonctionnalité 4) couvrent déjà l'essentiel du besoin ; une vue dédiée n'apporte une valeur significative qu'une fois le volume d'archives suffisant pour la justifier.

**Précision (DR-001)** : ce report en V2 concerne exclusivement la vue de navigation dédiée aux archives (liste, filtres par date/catégorie/zone). L'accessibilité de base d'un contenu archivé via son URL directe est effective dès la V1 (cf. `domain-model.md`, Invariants métier).

---

## Version 3

**Logique de la V3** : fonctionnalités d'amélioration continue, utiles une fois le média installé et son modèle économique stabilisé, mais sans impact sur la viabilité du lancement ni sur la version monétisée.

### 14. Tableau de bord d'activité

**Description** : Permettre à l'administrateur de suivre des indicateurs clés (contenus publiés, évolution des abonnés et des inscrits à la newsletter) afin d'évaluer l'atteinte des objectifs business.

**User Stories concernées** : US-030

**Valeur métier** : Aide au pilotage stratégique du média sur la durée.

**Priorité** : Faible

**Justification** : Fonctionnalité de confort analytique ; les informations sous-jacentes restent consultables manuellement via les listes de la V2, ce qui rend un tableau de bord dédié non bloquant pour les versions précédentes.

---

### 15. Ouverture à de futurs contributeurs (exploratoire, conditionnel)

**Description** : Possibilité d'élargir, à terme, la production éditoriale à d'autres rédacteurs, avec des droits différenciés entre rédaction et gestion complète du site.

**User Stories concernées** : Aucune à ce jour — fonctionnalité non couverte par le catalogue actuel de User Stories ; à redéfinir intégralement si le besoin se confirme.

**Valeur métier** : Permettrait d'augmenter le volume de production éditoriale si l'activité du média se développe au-delà de la capacité d'une seule personne.

**Priorité** : Faible

**Justification** : Le client a explicitement indiqué qu'aucun rédacteur ou gestionnaire additionnel n'est prévu à ce stade (`discovery.md`, section 5). Cette piste n'est mentionnée ici qu'au titre d'une opportunité identifiée dans `discovery.md` (section 9) et ne doit en aucun cas être anticipée dans la conception de la V1 ou de la V2 : elle impliquerait une gestion de rôles et de droits complexe, explicitement hors périmètre sauf décision future et justifiée du client.

---

## Hors périmètre (exclusions explicites)

Les éléments suivants ne font partie d'aucune version (V1, V2, V3) du projet, en l'absence de justification métier forte exprimée par le client :

- **Gestion multi-rédacteurs et rôles complexes** : le client a confirmé qu'il est l'unique responsable éditorial et administrateur du site, sans équipe prévue.
- **Forum** : aucun besoin de discussion communautaire structurée n'a été exprimé.
- **Commentaires avancés** : aucun besoin de modération ou d'interaction commentée n'a été exprimé ; un risque de dérive sur des sujets géopolitiques sensibles existe en l'absence de modération dédiée.
- **Chat / messagerie instantanée** : aucun besoin d'échange en temps réel avec les visiteurs n'a été exprimé.
- **Application mobile** : aucun besoin spécifique à une application native n'a été exprimé ; le site doit rester consultable sur mobile via le navigateur, sans nécessiter de développement applicatif dédié.

---

## Synthèse

| Version   | Nombre de fonctionnalités | Logique dominante                                                                          |
| --------- | ------------------------- | ------------------------------------------------------------------------------------------ |
| MVP (V1)  | 7                         | Publier, structurer et diffuser librement l'information ; construire une audience initiale |
| Version 2 | 6                         | Monétiser les contenus à forte valeur ajoutée via comptes, contenus premium et abonnements |
| Version 3 | 2                         | Affiner le pilotage et explorer, sous condition, l'évolution du modèle éditorial           |

Le périmètre du MVP a été volontairement restreint aux fonctionnalités ne nécessitant ni système de comptes, ni paiement, ni gestion multi-utilisateurs, afin de permettre une mise en production rapide et de limiter le risque budgétaire. La monétisation et la gestion fine des audiences sont délibérément reportées en Version 2, une fois la valeur éditoriale du média validée auprès de son public cible.
