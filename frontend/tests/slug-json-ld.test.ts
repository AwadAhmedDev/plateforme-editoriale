import { describe, expect, it } from "vitest";
import { serializeJsonLd } from "@/lib/json-ld";
import { generateDraftSlug, isDraftSlug, slugify } from "@/lib/slug";

describe("JSON-LD", () => {
  it("empêche un titre de fermer la balise <script>", () => {
    const donnees = { headline: "Titre </script><script>alert(1)</script>" };
    const serialise = serializeJsonLd(donnees);
    expect(serialise).not.toContain("<");
    expect(JSON.parse(serialise)).toEqual(donnees);
  });
});

describe("slugs", () => {
  it("retire accents, ponctuation et tirets superflus", () => {
    expect(slugify("  Économie & Société  ")).toBe("economie-societe");
    expect(slugify("Corne (régional)")).toBe("corne-regional");
    expect(slugify("---")).toBe("");
  });

  it("génère un slug de brouillon aléatoire et reconnaissable", () => {
    const a = generateDraftSlug();
    expect(a).toMatch(/^brouillon-[0-9a-f]{8}$/);
    expect(generateDraftSlug()).not.toBe(a);
    expect(isDraftSlug(a)).toBe(true);
    expect(isDraftSlug("voies-de-recours")).toBe(false);
  });
});
