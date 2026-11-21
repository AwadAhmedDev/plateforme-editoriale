import { beforeEach, describe, expect, it, vi } from "vitest";

// Le stockage R2 est simulé : on vérifie ce qui lui serait envoyé, sans réseau.
const send = vi.fn();
vi.mock("@/lib/media/storage-client", () => ({
  getR2Client: () => ({ send }),
  getBucketName: () => "bucket-test",
  getPublicUrl: (cle: string) => `https://cdn.test/${cle}`,
}));

const { detecterFormatParSignature, uploadImage } = await import("@/lib/media/upload-image");

// PNG valide de 1 × 1 pixel
const PNG_1PX = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64"
);

beforeEach(() => send.mockReset());

describe("détection du format par signature binaire", () => {
  it("reconnaît JPEG, PNG et WebP", () => {
    expect(detecterFormatParSignature(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))).toBe("image/jpeg");
    expect(detecterFormatParSignature(PNG_1PX)).toBe("image/png");
    expect(detecterFormatParSignature(Buffer.from("RIFF\0\0\0\0WEBPVP8 ", "latin1"))).toBe("image/webp");
  });

  it("refuse tout le reste, quelle que soit l'extension annoncée", () => {
    expect(detecterFormatParSignature(Buffer.from("GIF89a"))).toBeNull();
    expect(detecterFormatParSignature(Buffer.from("%PDF-1.7"))).toBeNull();
    expect(detecterFormatParSignature(Buffer.alloc(0))).toBeNull();
  });
});

describe("envoi de l'image principale", () => {
  it("refuse une image de plus de 5 Mo avant tout envoi", async () => {
    const tropGrande = Buffer.concat([PNG_1PX, Buffer.alloc(5 * 1024 * 1024)]);
    await expect(uploadImage(tropGrande)).rejects.toMatchObject({ code: "TAILLE_EXCESSIVE" });
    expect(send).not.toHaveBeenCalled();
  });

  it.each([
    ["balise svg", "<svg xmlns='http://www.w3.org/2000/svg'></svg>"],
    ["déclaration XML", "<?xml version='1.0'?><svg></svg>"],
    ["BOM et espaces", "﻿   \n<SVG></SVG>"],
  ])("refuse un SVG (%s)", async (_cas, contenu) => {
    await expect(uploadImage(Buffer.from(contenu))).rejects.toMatchObject({ code: "SVG_REFUSE" });
    expect(send).not.toHaveBeenCalled();
  });

  it("refuse un format non autorisé", async () => {
    await expect(uploadImage(Buffer.from("GIF89a....."))).rejects.toMatchObject({
      code: "FORMAT_NON_AUTORISE",
    });
    expect(send).not.toHaveBeenCalled();
  });

  it("envoie une image valide sous un nom régénéré (UUID), avec son vrai format", async () => {
    const resultat = await uploadImage(PNG_1PX);
    expect(send).toHaveBeenCalledOnce();
    const { input } = send.mock.calls[0][0];
    expect(input.Key).toMatch(/^[0-9a-f-]{36}\.png$/);
    expect(input.ContentType).toBe("image/png");
    expect(resultat).toEqual({
      url: `https://cdn.test/${input.Key}`,
      largeur: 1,
      hauteur: 1,
      contentType: "image/png",
    });
  });
});
