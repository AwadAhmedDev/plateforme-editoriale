import { randomBytes } from "node:crypto";

// Slugification partagée par les entités du domaine dont l'identifiant d'URL est dérivé
// d'un champ texte (Catégorie, Zone géographique) — extrait de categorie-actions.ts et
// zone-actions.ts, où la même fonction était dupliquée à l'identique.
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const DRAFT_SLUG_PREFIX = "brouillon-";

// Slug d'un Contenu éditorial créé sans Titre (domain-model.md : un Brouillon peut rester
// incomplet sur l'ensemble des champs) — `slug` reste NOT NULL UNIQUE en toute circonstance
// (database-schema.md §4.5). Suffixe aléatoire (crypto.randomBytes, jamais un horodatage
// ni un compteur séquentiel) : exclut toute collision sous création concurrente rapprochée
// et toute fuite d'information sur le volume/la cadence de production — cohérent avec la
// posture anti-énumération déjà appliquée ailleurs dans le projet (jetons Newsletter,
// sessions). Préfixe fixe non dérivé d'un contenu éditorial réel : délibérément non
// optimisé SEO, un Brouillon n'étant de toute façon jamais indexé ni exposé publiquement.
export function generateDraftSlug(): string {
  return `${DRAFT_SLUG_PREFIX}${randomBytes(4).toString("hex")}`;
}

// Détecte un slug jamais renseigné manuellement : sert à décider si le slug doit être
// régénéré à partir du Titre lors de sa première saisie, puis figé (article-actions.ts).
export function isDraftSlug(slug: string): boolean {
  return slug.startsWith(DRAFT_SLUG_PREFIX);
}
