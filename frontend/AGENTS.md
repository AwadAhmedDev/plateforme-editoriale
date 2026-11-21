<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

Two breaking changes already hit in this project: `middleware.ts` is renamed `proxy.ts` (export `proxy`, not `middleware`); Prisma 7 no longer accepts a URL directly in `schema.prisma` — the client needs a driver adapter.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind CSS v4 (hand-written utility classes, no component library — no shadcn/ui is installed, despite `docs/project/frontend-specification.md`) · Prisma 7 + `@prisma/adapter-pg` · PostgreSQL/Supabase · Zod · bcryptjs · `@aws-sdk/client-s3` (Cloudflare R2).

Path alias `@/*` → `./src/*` (see `tsconfig.json`).

## Architecture

`Server Action → Zod validation → authorization check → Repository → Database`. No direct Prisma access outside `src/lib/db/*-repository.ts`.

Every admin-only Server Action re-checks the session itself (`ensureAdministrateurAuthentifie`), independent of `proxy.ts` and the protected layout — defense in depth, not redundancy to remove.

`statut` and `datePublication` on `ContenuEditorial` are never read from user input — only changed via dedicated transitions (`publishArticle`, `unpublishArticle`, `archiveArticle`).

`src/components/shared/` holds shared public UI components (e.g. `public-header.tsx`, `article-card.tsx`) — REPO-1→9 lots edit these in place. Interactive forms follow the `useActionState` + directly-imported Server Action pattern (see `NewsletterForm`, `CategoryCreateForm`).

## Auth

Session = httpOnly signed cookie, never JWT. Token hashed in DB, never stored plain. Inactivity expiry checked server-side against `derniereActiviteAt`, never delegated to cookie lifetime. Two-level guard (`proxy.ts` + protected layout) plus the per-action re-check above.

## Database

`DATABASE_URL` = pooled Supavisor connection (runtime app). `DIRECT_URL` = Prisma CLI/migrations only. Never swap them. `rechercheVecteur` is trigger-maintained — never read/written via Prisma Client.

## Media (Cloudflare R2)

Format detected by binary signature (magic bytes), never by declared `Content-Type` or file extension. SVG always rejected. Filenames regenerated server-side (UUID). Max 5MB, JPEG/PNG/WebP only.

Known debt: `createArticle`/`updateArticle` still accept `imagePrincipaleUrl` as a plain string, alongside the separate `uploadMainImage` pipeline (scoped to an already-existing article id).

## Revalidation

Public-surface revalidation goes through one centralized function per domain (`revalidateArticleSurfaces` for Articles) — never a scattered `revalidatePath`.

## Naming

Business-domain fields/functions in French (`statut`, `motsCles`, `categorieId`); generic technical infrastructure in English.

## Tests

Vitest (`npm test`, files in `tests/*.test.ts`, config `vitest.config.mts`): unit tests of the security rules (image signature/SVG/size checks, signed session cookie, JSON-LD escaping, slugs) and of the demo-account guard wired into real Server Actions. No database or network: Prisma repositories, session, R2 and `next/cache` are mocked per test. CI (`.github/workflows/ci.yml`) runs types, lint (`--max-warnings=0`) and tests on every push.

## Documentation priority

When docs conflict, trust in this order: (0) `docs/project/regle-fidelite-design.md` and `Corne de l'Afrique.dc.html` for anything visual/UX in scope of REPO-1→9 — `ui-specification.md` (2) remains authoritative only for what the design doesn't cover (responsive/mobile, scroll behavior); (1) the code and `tsconfig.json`, (2) `docs/project/ui-specification.md` for anything visual/behavioral, (3) `docs/project/security-specification.md` and `docs/project/domain-model.md` for security rules and domain decisions (DR-00x), (4) `docs/project/frontend-specification.md` last and with caution — it contains claims not aligned with the real code (see Stack above).

## Repository rule

`src/lib/db/*-repository.ts` files are the only layer that touches Prisma — no exceptions from a Server Action or a feature component. Field allowlists are enforced at the type level inside the repository (e.g. `UpdateArticleData` structurally excludes `statut`/`datePublication`/`motsCles`), not just as a runtime check upstream — a deliberate double guarantee, not redundancy to remove.

## MVP scope

Single administrator, no roles system. No V2/V3 features anywhere in the code: no user accounts, no premium/paid content, no subscriptions, no advanced statistics/charts. Don't add scaffolding "for later" — the features-based architecture already extends without a rewrite when V2 actually starts. (The reference design `Corne de l'Afrique.dc.html` shows a premium/subscription tier and per-country publication counts — the former is excluded per `docs/project/plan-implementation-repositionnement-asile.md` §E; the latter, a simple aggregate count, is not "advanced statistics" under this rule.)
