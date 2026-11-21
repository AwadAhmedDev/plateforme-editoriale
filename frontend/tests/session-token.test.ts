import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  generateSessionToken,
  hashSessionToken,
  signSessionToken,
  verifySignedCookieValue,
} from "@/lib/auth/token";

beforeEach(() => {
  process.env.SESSION_SECRET = "secret-de-test-assez-long-pour-hmac";
});
afterEach(() => {
  delete process.env.SESSION_SECRET;
});

describe("cookie de session signé", () => {
  it("rend le jeton d'origine pour une signature valide", () => {
    const jeton = generateSessionToken();
    expect(jeton).toMatch(/^[0-9a-f]{64}$/);
    expect(verifySignedCookieValue(signSessionToken(jeton))).toBe(jeton);
  });

  it("refuse une signature modifiée, un jeton modifié ou une valeur sans signature", () => {
    const jeton = generateSessionToken();
    const signe = signSessionToken(jeton);
    const [, signature] = signe.split(".");
    const autreChiffre = signature[0] === "0" ? "1" : "0";

    expect(verifySignedCookieValue(`${jeton}.${autreChiffre}${signature.slice(1)}`)).toBeNull();
    expect(verifySignedCookieValue(`${generateSessionToken()}.${signature}`)).toBeNull();
    expect(verifySignedCookieValue(jeton)).toBeNull();
    expect(verifySignedCookieValue(`${jeton}.`)).toBeNull();
  });

  it("refuse un cookie signé avec un autre secret", () => {
    const signe = signSessionToken(generateSessionToken());
    process.env.SESSION_SECRET = "un-tout-autre-secret";
    expect(verifySignedCookieValue(signe)).toBeNull();
  });

  it("ne stocke qu'un hash déterministe, distinct du jeton", () => {
    const jeton = generateSessionToken();
    expect(hashSessionToken(jeton)).toBe(hashSessionToken(jeton));
    expect(hashSessionToken(jeton)).not.toContain(jeton);
  });

  it("refuse de fonctionner sans SESSION_SECRET", () => {
    delete process.env.SESSION_SECRET;
    expect(() => signSessionToken("abc")).toThrow(/SESSION_SECRET/);
  });
});
