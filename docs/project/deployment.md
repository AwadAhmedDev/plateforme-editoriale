# Deployment

## Environnement

Production

## Architecture

Application monolithique Next.js (App Router) — aucun backend séparé. Server Actions et Server Components exécutés dans le même processus.

## Hébergement

Vercel (intégration native Next.js/ISR)

## Base de données

PostgreSQL (Supabase), accès applicatif exclusivement via Prisma (connexion poolée Supavisor, `DATABASE_URL`) ; `DIRECT_URL` réservée au CLI Prisma (migrations).

## Variables d'environnement

Tableau complet des secrets : `security-specification.md §11`. Notamment : `DIRECT_URL`, `DATABASE_URL`, secret de signature du cookie de session, `SESSION_INACTIVITY_TIMEOUT_MINUTES`, clé du service d'envoi transactionnel, identifiants du stockage objet (Cloudflare R2). Aucune valeur codée en dur, jamais commitées.

## Procédure

Séquence détaillée : `implementation-roadmap.md` Phase 9.

1. RLS activé avec politiques de refus total, ou API PostgREST/Data API explicitement neutralisée — condition bloquante avant toute exposition publique de la base.
2. `prisma migrate deploy` exécuté contre `DIRECT_URL` de production.
3. Variables d'environnement de production renseignées sur la plateforme d'hébergement.
4. Parcours de bout en bout rejoués avec succès en production.

## Checklist

Checklist complète : `security-specification.md §14`. Points clés :

- RLS ou neutralisation PostgREST vérifiée, jamais supposée.
- Secrets de production distincts de développement, jamais commités.
- `robots.txt` exclut `/admin`.
- Aucune donnée de test ne subsiste en base de production.
- Fonctions et triggers PL/pgSQL manuels vérifiés actifs en production.
