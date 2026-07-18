# Plateforme Éditoriale

Application Next.js monolithique pour la gestion et la publication de contenus éditoriaux.

## Stack technique

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL / Supabase
- Cloudflare R2

## Architecture actuelle

- **App Router** — routage et rendu via l'App Router de Next.js
- **Server Actions** — mutations et logique métier exécutées côté serveur
- **Repository Pattern** — accès aux données encapsulé dans des repositories
- **Validation Zod** — validation des entrées aux frontières (formulaires, server actions)
- **Gestion média** — upload et stockage des images/documents sur Cloudflare R2

## Documentation

Le dossier `docs` contient :

- `docs/project` — documents de cadrage et de suivi du projet (requirements, architecture, specs, tests, déploiement)
- `docs/skills` — guides par rôle/compétence (frontend, backend, sécurité, etc.)
- `docs/templates` — modèles réutilisables pour la documentation projet

## Workflow projet

1. Analyse
2. Architecture
3. Développement
4. Tests
5. Déploiement
