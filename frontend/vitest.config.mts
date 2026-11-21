import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Tests unitaires des règles de sécurité et du mode démo : aucune base de données ni
// service externe (Prisma, R2, session) — ces dépendances sont simulées dans chaque test.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
