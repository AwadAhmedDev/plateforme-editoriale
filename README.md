# Plateforme éditoriale — média en ligne sur la Corne de l'Afrique

[![CI](https://github.com/AwadAhmedDev/plateforme-editoriale/actions/workflows/ci.yml/badge.svg)](https://github.com/AwadAhmedDev/plateforme-editoriale/actions/workflows/ci.yml)

**Site en ligne : https://snowy-floralwhite-giraffe-20.hostingersite.com**

Média en ligne francophone consacré à la Corne de l'Afrique (asile, migrations, droits humains, analyses par pays), avec son back-office de rédaction. Réalisé pour l'éditeur Harbi Egueh Aouled : une seule personne administre le site, rédige et publie.

## Fonctionnalités

**Site public**
- Accueil éditorial : article à la une, « Actualités & terrain », analyses et enquêtes, derniers contenus, fil « En continu ».
- Pages par rubrique et par pays, liste de tous les articles avec filtres et pagination.
- **Recherche plein texte** (PostgreSQL `tsvector`).
- Page article : temps de lecture, partage (X, LinkedIn, e-mail), bloc « citer cet article », articles liés.
- Newsletter (inscription, désinscription par lien), formulaire de contact protégé par Cloudflare Turnstile.
- Pages À propos, méthodologie, mentions légales, confidentialité, conditions générales.
- Référencement : métadonnées et Open Graph par page, image de partage générée, `sitemap.xml` et `robots.txt` dynamiques.

**Back-office** (`/admin`)
- Tableau de bord avec les chiffres clés.
- Articles : création, édition, image principale avec texte alternatif, mots-clés, statuts brouillon / publié / archivé.
- Rubriques et pays, inscrits à la newsletter, messages de contact.

## Qualité

| Lighthouse (site en ligne, 21/11/2026) | Performance | Accessibilité | Bonnes pratiques | SEO |
|---|---|---|---|---|
| Ordinateur | 100 | 100 | 100 | 100 |
| Mobile | 93 | 100 | 100 | 100 |

- **16 tests unitaires** (Vitest) sur les règles de sécurité : contrôle des images, cookie de session signé, échappement JSON-LD, slugs.
- **ESLint sans aucun avertissement** et **TypeScript strict**.
- **Intégration continue** (GitHub Actions) : types, lint et tests à chaque push.

## Stack technique

| Couche | Technologies |
|---|---|
| Application | Next.js 16 (App Router, Server Components, Server Actions), React 19, TypeScript |
| Interface | Tailwind CSS 4 (classes écrites à la main, sans bibliothèque de composants) |
| Données | PostgreSQL (Supabase), Prisma 7 avec l'adaptateur `@prisma/adapter-pg` |
| Validation | Zod, à chaque frontière (formulaires, Server Actions) |
| Médias | Cloudflare R2 (stockage objet compatible S3) |
| Services | Resend (e-mails), Cloudflare Turnstile (anti-robots), Cloudflare Web Analytics |
| Qualité | Vitest, ESLint, GitHub Actions |
| Hébergement | Hostinger (Node.js), déployé à chaque push sur `master` |

## Architecture

```
Server Action → validation Zod → contrôle de la session → repository → base de données
```

```
frontend/
├── app/
│   ├── (public)/        # pages publiques
│   ├── admin/           # connexion et back-office protégé
│   ├── sitemap.ts, robots.ts, og-image/
├── src/
│   ├── features/        # un dossier par domaine : articles, taxonomies, newsletter, contact, authentification…
│   ├── components/      # composants partagés (cartes d'articles, en-tête, pagination…)
│   └── lib/
│       ├── db/          # repositories : seul endroit qui utilise Prisma
│       ├── auth/        # session, mots de passe, jetons
│       ├── media/       # contrôle et envoi des images vers R2
│       └── email/       # envoi des e-mails
├── prisma/              # schéma et migrations
└── tests/               # tests Vitest
docs/project/            # cadrage, spécifications, modèle de données, sécurité, déploiement
```

Choix importants :
- **Prisma n'est utilisé que dans les repositories**. Les champs modifiables sont limités dès le typage : le statut et la date de publication ne changent que par des actions dédiées (publier, dépublier, archiver).
- **Chaque Server Action d'administration revérifie la session**, en plus du middleware (`proxy.ts`) et du layout protégé : c'est une défense en profondeur.

## Sécurité

- Session administrateur : jeton aléatoire dans un cookie `httpOnly` signé (HMAC). Seul son hash est stocké en base, et l'expiration après inactivité est contrôlée côté serveur.
- Mots de passe hachés avec bcrypt ; limitation des tentatives de connexion.
- Images : format détecté par sa signature binaire (jamais par l'extension), SVG refusés, 5 Mo maximum, nom de fichier régénéré.
- Données structurées JSON-LD échappées contre l'injection de script.
- Newsletter : même message dans tous les cas, pour ne pas révéler si une adresse est déjà inscrite.

## Lancer le projet en local

Prérequis : Node.js 22 et un projet Supabase (ou une base PostgreSQL).

```bash
cd frontend
npm install

# 1. Variables d'environnement : copier le modèle puis remplir
#    (base, SESSION_SECRET, durée de session, R2, Resend, Turnstile…)
cp .env.example .env

# 2. Créer le schéma de la base
npx prisma migrate deploy

# 3. Lancer le site sur http://localhost:3000
npm run dev
```

Toutes les variables sont décrites dans `frontend/.env.example`.

| Commande | Rôle |
|---|---|
| `npm run dev` | serveur de développement |
| `npm test` | tests Vitest |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | vérification TypeScript |
| `npm run build` | build de production |

## Déploiement

Hostinger construit et redéploie le site à chaque push sur `master`. Les migrations ne sont pas lancées au déploiement : après en avoir ajouté une, exécuter `npx prisma migrate deploy` depuis `frontend/`.

## Auteur

**Awad Ahmed** — Développeur Full Stack · [LinkedIn](https://www.linkedin.com/in/awad-dev) · [GitHub](https://github.com/AwadAhmedDev)
