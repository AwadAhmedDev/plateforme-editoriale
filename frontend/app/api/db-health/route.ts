import { prisma } from "@/lib/prisma";

// Route de diagnostic technique : prouve que le Client Prisma applicatif
// (adaptateur pg, DATABASE_URL) exécute une requête réelle contre Supabase
// depuis le runtime Next.js. Pas de logique métier.
export const runtime = "nodejs";

export async function GET() {
  const administrateurCount = await prisma.administrateur.count();

  return Response.json({
    ok: true,
    administrateurCount,
    checkedAt: new Date().toISOString(),
  });
}
