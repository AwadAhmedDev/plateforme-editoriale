import { S3Client } from "@aws-sdk/client-s3";

// Client S3-compatible pour Cloudflare R2 (décision d'architecture validée, module Articles
// §3). Lecture des variables d'environnement strictement paresseuse (jamais au chargement
// du module) : aucun identifiant n'est requis pour que ce fichier soit importé, compilé ou
// inclus dans le build — seule l'exécution réelle d'un upload les exige. Permet de valider
// ce module par tests unitaires sans identifiants R2 réels (aucun identifiant inventé ici).

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} est manquante : requise pour la connexion au stockage objet Cloudflare R2.`);
  }
  return value;
}

const globalForR2 = globalThis as unknown as { r2Client?: S3Client };

// Client mis en cache sur `globalThis` en développement (même raisonnement que le pool de
// connexions Prisma, src/lib/prisma.ts) : évite de recréer un client à chaque rechargement
// à chaud de Next.js.
export function getR2Client(): S3Client {
  if (globalForR2.r2Client) {
    return globalForR2.r2Client;
  }

  const accountId = requireEnv("R2_ACCOUNT_ID");
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    },
  });

  if (process.env.NODE_ENV !== "production") {
    globalForR2.r2Client = client;
  }

  return client;
}

export function getBucketName(): string {
  return requireEnv("R2_BUCKET_NAME");
}

// URL publique d'un objet une fois déposé — dépend d'un domaine public déjà configuré côté
// bucket R2 (hors périmètre applicatif), jamais construite à partir de l'endpoint S3 privé.
export function getPublicUrl(objectKey: string): string {
  const base = requireEnv("R2_PUBLIC_URL").replace(/\/+$/, "");
  return `${base}/${objectKey}`;
}
