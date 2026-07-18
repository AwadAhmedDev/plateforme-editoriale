# Test Plan

## Objectif

Valider que l'application fonctionne correctement avant mise en production.

## Source de vérité

La stratégie de test détaillée (scénarios, entités couvertes, jeux de données, points d'arbitrage) est intégralement définie dans `testing-specification.md`. Ce document n'en est pas une duplication — uniquement un sommaire de suivi, pour éviter toute divergence future entre deux sources concurrentes.

## Périmètre couvert (voir `testing-specification.md` pour le détail)

- Authentification administrateur (connexion, déconnexion, expiration de session par inactivité)
- Contenu éditorial (création, modification, transitions de statut, suppression)
- Catégories et Zones géographiques (CRUD, blocage de suppression si référencées)
- Newsletter (inscription, réactivation, désinscription par jeton, gestion admin)
- Recherche et filtrage
- Sécurité transverse (validation des entrées, protection contre l'énumération, permissions)

## Critères d'acceptation

- Aucun bug bloquant
- Responsive validé
- Performance acceptable
