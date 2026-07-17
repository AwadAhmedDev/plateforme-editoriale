import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Prisma 7 n'accepte plus d'URL directement dans schema.prisma : le Client
// applicatif doit recevoir un adaptateur de driver. On utilise ici la
// connexion POOLÉE Supavisor (DATABASE_URL, port 6543) — jamais DIRECT_URL,
// réservée au CLI Prisma (cf. prisma.config.ts et prisma-config-specification.md §2).
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pgPool?: Pool;
};

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL est manquante : requise par le Client Prisma applicatif (connexion poolée Supavisor)."
    );
  }
  return url;
}

// Le pool pg est lui aussi mis en cache sur `globalThis` : sans cela, le hot
// reload de Next.js (dev + Turbopack) recréerait un nouveau pool de connexions
// à chaque rechargement de module et finirait par épuiser le pooler Supavisor.
const pgPool = globalForPrisma.pgPool ?? new Pool({ connectionString: getDatabaseUrl() });

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter: new PrismaPg(pgPool) });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pgPool = pgPool;
}
