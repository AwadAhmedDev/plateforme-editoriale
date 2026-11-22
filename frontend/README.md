# Plateforme éditoriale — application Next.js

Application de la plateforme éditoriale. Présentation, fonctionnalités, architecture et installation : voir le [README principal](../README.md).

```bash
cp .env.example .env      # variables décrites dans le fichier
npm install
npx prisma migrate deploy # schéma de la base
npm run dev               # http://localhost:3000
npm test                  # tests Vitest
npm run lint              # ESLint
npm run build             # build de production
```

Conventions du code (architecture, sécurité, nommage) : [`AGENTS.md`](./AGENTS.md).
