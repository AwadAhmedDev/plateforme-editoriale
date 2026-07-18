import { randomUUID } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { imageSize } from "image-size";
import { getBucketName, getPublicUrl, getR2Client } from "./storage-client";

// Pipeline d'upload de l'image principale (décision d'architecture validée, module
// Articles §3/§10) : bibliothèque pure, sans "use server" — invocable uniquement depuis
// une Server Action appelée par la couche applicative (hors périmètre de ce lot). Aucun
// accès Prisma, aucune écriture en base : `imageLargeur`/`imageHauteur` ne sont pas
// persistées ici (traité par un futur lot d'orchestration Article + Média).
//
//   Server Action future → upload-image.ts → storage-client.ts → Cloudflare R2

export type FormatImageAutorise = "image/jpeg" | "image/png" | "image/webp";

export type UploadImageResult = {
  url: string;
  largeur: number;
  hauteur: number;
  contentType: FormatImageAutorise;
};

export type ImageValidationErrorCode = "TAILLE_EXCESSIVE" | "SVG_REFUSE" | "FORMAT_NON_AUTORISE";

export class ImageValidationError extends Error {
  readonly code: ImageValidationErrorCode;

  constructor(code: ImageValidationErrorCode, message: string) {
    super(message);
    this.name = "ImageValidationError";
    this.code = code;
  }
}

const TAILLE_MAX_OCTETS = 5 * 1024 * 1024;

const EXTENSION_PAR_FORMAT: Record<FormatImageAutorise, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// Détection du format par lecture des octets de signature (magic bytes) du fichier —
// jamais par le `Content-Type` déclaré par le client, ni par l'extension du nom de
// fichier (tous deux trivialement falsifiables). Liste blanche stricte : JPEG, PNG, WebP
// uniquement (décision d'architecture validée) — tout autre format retourne `null`.
export function detecterFormatParSignature(buffer: Buffer): FormatImageAutorise | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }

  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "image/webp";
  }

  return null;
}

// SVG est un format XML pouvant embarquer du script exécutable (vecteur XSS stocké déjà
// identifié) — détecté et rejeté explicitement, avec un message dédié, plutôt que de le
// laisser silencieusement échouer la détection de signature binaire ci-dessus.
function estProbablementSvg(buffer: Buffer): boolean {
  const debut = buffer
    .subarray(0, 256)
    .toString("utf8")
    .replace(/^﻿/, "")
    .trimStart()
    .toLowerCase();
  return debut.startsWith("<?xml") || debut.startsWith("<svg");
}

// Pipeline complet : taille → SVG → signature → dimensions → renommage → envoi R2. Chaque
// étape de validation s'exécute avant toute tentative de connexion au stockage objet — un
// buffer invalide ne déclenche jamais d'accès réseau ni de lecture des identifiants R2.
export async function uploadImage(buffer: Buffer): Promise<UploadImageResult> {
  if (buffer.byteLength > TAILLE_MAX_OCTETS) {
    throw new ImageValidationError("TAILLE_EXCESSIVE", "L'image dépasse la taille maximale autorisée de 5 Mo.");
  }

  if (estProbablementSvg(buffer)) {
    throw new ImageValidationError("SVG_REFUSE", "Le format SVG n'est pas autorisé pour l'image principale.");
  }

  const format = detecterFormatParSignature(buffer);
  if (!format) {
    throw new ImageValidationError(
      "FORMAT_NON_AUTORISE",
      "Format d'image non reconnu ou non autorisé (JPEG, PNG ou WebP uniquement)."
    );
  }

  const dimensions = imageSize(buffer);
  if (!dimensions.width || !dimensions.height) {
    throw new ImageValidationError("FORMAT_NON_AUTORISE", "Impossible de déterminer les dimensions de l'image.");
  }

  // Nom de fichier régénéré côté serveur (UUID + extension dérivée du format détecté) —
  // jamais le nom de fichier original, pour exclure toute injection dans la clé de
  // stockage et toute fuite d'un nom de fichier potentiellement sensible.
  const cle = `${randomUUID()}.${EXTENSION_PAR_FORMAT[format]}`;

  await getR2Client().send(
    new PutObjectCommand({
      Bucket: getBucketName(),
      Key: cle,
      Body: buffer,
      ContentType: format,
    })
  );

  return {
    url: getPublicUrl(cle),
    largeur: dimensions.width,
    hauteur: dimensions.height,
    contentType: format,
  };
}
