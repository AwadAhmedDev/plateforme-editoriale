import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/**
 * Lu exclusivement par le CLI Prisma (migrate, generate, db pull/push, studio, validate) —
 * jamais par le Client Prisma au runtime applicatif (cf. prisma-config-specification.md §1).
 *
 * `datasource.url` doit rester la connexion DIRECTE (`DIRECT_URL`), jamais la connexion
 * poolée Supavisor : les migrations nécessitent une connexion directe, cf.
 * prisma-config-specification.md §2-§3 et sql-migration-specification.md.
 *
 * `shadowDatabaseUrl` reste conditionnelle (prisma-config-specification.md §4, point
 * d'arbitrage non tranché) : lue via `process.env` brut (optionnelle, contrairement à
 * `env()` qui échoue si la variable est absente) pour ne pas bloquer le CLI tant que
 * l'option (a)/(b) n'est pas choisie.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DIRECT_URL"),
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL || undefined,
  },
});
