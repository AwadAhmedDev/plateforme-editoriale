"use server";

import type { z } from "zod";
import { ContenuEditorialRepository, type ArticleForEdit } from "@/lib/db/contenu-editorial-repository";
import { ensureAdministrateurAuthentifie } from "@/lib/auth/require-admin-session";
import { articleFieldsSchema, type ArticleFieldsInput } from "@/features/articles/article-schema";
import { generateDraftSlug, isDraftSlug, slugify } from "@/lib/slug";
import { revalidateArticleSurfaces, toArticleSurfaceState } from "@/features/articles/revalidate-article-surfaces";

// Server Actions Articles (server-actions-specification.md §3.1-§3.6). Architecture
// imposée : Server Action → Zod → Autorisation → Repository → Database. Chacune revérifie
// elle-même la Session administrateur (security-specification.md §3), indépendamment de la
// garde déjà appliquée en amont (proxy.ts + layout.tsx) — aucune n'est publique, contrairement
// à Newsletter. Aucun accès Prisma direct ici : uniquement ContenuEditorialRepository.
export type ArticleActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
  // Erreurs par champ (validation Zod ou complétude de publication) — un `message` seul
  // ne suffit pas dès qu'il y a plus d'un défaut simultané (ex. Titre ET Image manquants).
  errors?: Record<string, string>;
  values?: ArticleFieldsInput;
  articleId?: string;
};

const GENERIC_ERROR_MESSAGE = "Une erreur est survenue, veuillez réessayer.";
const NOT_FOUND_MESSAGE = "Contenu introuvable.";

function optionalString(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

// Allowlist explicite des champs lus depuis le formulaire — `statut` et `datePublication`
// ne sont JAMAIS lus ici, quel que soit le contenu réel du FormData soumis par le client.
function extraireChampsFormulaire(formData: FormData): Record<string, unknown> {
  return {
    slug: optionalString(formData.get("slug")),
    titre: optionalString(formData.get("titre")),
    chapo: optionalString(formData.get("chapo")),
    corps: optionalString(formData.get("corps")),
    typeContenu: optionalString(formData.get("typeContenu")),
    categorieId: optionalString(formData.get("categorieId")),
    zoneId: optionalString(formData.get("zoneId")),
    imagePrincipaleUrl: optionalString(formData.get("imagePrincipaleUrl")),
    imageAltText: optionalString(formData.get("imageAltText")),
    auteur: optionalString(formData.get("auteur")),
    sources: optionalString(formData.get("sources")),
    motsCles: formData
      .getAll("motsCles")
      .map(String)
      .map((m) => m.trim())
      .filter((m) => m.length > 0),
  };
}

function erreursZodParChamp(error: z.ZodError): Record<string, string> {
  const erreurs: Record<string, string> = {};
  for (const issue of error.issues) {
    const cle = issue.path.join(".") || "_global";
    if (!erreurs[cle]) erreurs[cle] = issue.message;
  }
  return erreurs;
}

// Résout le slug final pour Créer/Modifier (décision d'architecture validée) :
// - slug fourni explicitement (saisie manuelle) → toujours prioritaire, normalisé ;
// - sinon, Titre fourni ET (création, ou slug actuel encore un slug de brouillon jamais
//   retouché) → dérivé du Titre ;
// - sinon, en édition : slug actuel conservé tel quel ;
// - sinon, en création sans Titre ni slug : slug de brouillon généré aléatoirement.
function resoudreSlug(params: { slugFourni?: string; titre?: string; slugActuel?: string }): string {
  if (params.slugFourni) {
    return slugify(params.slugFourni);
  }
  if (params.titre && (params.slugActuel === undefined || isDraftSlug(params.slugActuel))) {
    return slugify(params.titre);
  }
  if (params.slugActuel !== undefined) {
    return params.slugActuel;
  }
  return generateDraftSlug();
}

const CHAMPS_REQUIS_PUBLICATION: Array<{ champ: keyof ArticleForEdit; message: string }> = [
  { champ: "titre", message: "Le titre est requis pour publier" },
  { champ: "typeContenu", message: "Le type de contenu est requis pour publier" },
  { champ: "categorieId", message: "La catégorie est requise pour publier" },
  { champ: "zoneId", message: "La zone géographique est requise pour publier" },
  { champ: "imagePrincipaleUrl", message: "L'image principale est requise pour publier" },
  { champ: "imageAltText", message: "Le texte alternatif de l'image est requis pour publier" },
];

export async function createArticle(
  _previousState: ArticleActionState,
  formData: FormData
): Promise<ArticleActionState> {
  await ensureAdministrateurAuthentifie();

  const brut = extraireChampsFormulaire(formData);
  const analyse = articleFieldsSchema.safeParse(brut);
  if (!analyse.success) {
    return {
      status: "error",
      message: analyse.error.issues[0]?.message ?? GENERIC_ERROR_MESSAGE,
      errors: erreursZodParChamp(analyse.error),
      values: brut as ArticleFieldsInput,
    };
  }
  const values = analyse.data;

  const slug = resoudreSlug({ slugFourni: values.slug, titre: values.titre });
  if (slug.length === 0) {
    return {
      status: "error",
      message: "Le titre doit contenir au moins une lettre ou un chiffre.",
      values,
    };
  }

  const conflit = await ContenuEditorialRepository.findBySlug(slug);
  if (conflit) {
    return { status: "error", message: "Ce slug est déjà utilisé.", values };
  }

  try {
    const cree = await ContenuEditorialRepository.create({
      slug,
      titre: values.titre,
      chapo: values.chapo,
      corps: values.corps,
      typeContenu: values.typeContenu,
      categorieId: values.categorieId,
      zoneId: values.zoneId,
      imagePrincipaleUrl: values.imagePrincipaleUrl,
      imageAltText: values.imageAltText,
      auteur: values.auteur,
      sources: values.sources,
    });

    if (values.motsCles) {
      await ContenuEditorialRepository.syncMotsCles(cree.id, values.motsCles);
    }

    return { status: "success", message: "Brouillon créé.", articleId: cree.id };
  } catch {
    return { status: "error", message: GENERIC_ERROR_MESSAGE, values };
  }
}

export async function updateArticle(
  id: string,
  _previousState: ArticleActionState,
  formData: FormData
): Promise<ArticleActionState> {
  await ensureAdministrateurAuthentifie();

  const existante = await ContenuEditorialRepository.findById(id);
  if (!existante) {
    return { status: "error", message: NOT_FOUND_MESSAGE };
  }

  const brut = extraireChampsFormulaire(formData);
  const analyse = articleFieldsSchema.safeParse(brut);
  if (!analyse.success) {
    return {
      status: "error",
      message: analyse.error.issues[0]?.message ?? GENERIC_ERROR_MESSAGE,
      errors: erreursZodParChamp(analyse.error),
      values: brut as ArticleFieldsInput,
    };
  }
  const values = analyse.data;

  const slug = resoudreSlug({ slugFourni: values.slug, titre: values.titre, slugActuel: existante.slug });
  if (slug.length === 0) {
    return {
      status: "error",
      message: "Le titre doit contenir au moins une lettre ou un chiffre.",
      values,
    };
  }

  if (slug !== existante.slug) {
    const conflit = await ContenuEditorialRepository.findBySlug(slug);
    if (conflit && conflit.id !== id) {
      return { status: "error", message: "Ce slug est déjà utilisé.", values };
    }
  }

  // `statut` et `datePublication` : absents de `values` (jamais lus depuis le formulaire,
  // cf. extraireChampsFormulaire) ET absents du type `UpdateArticleData` lui-même
  // (contenu-editorial-repository.ts, Lot 2) — double garantie, pas seulement une omission
  // volontaire ici.
  try {
    await ContenuEditorialRepository.update(id, {
      slug,
      titre: values.titre ?? null,
      chapo: values.chapo ?? null,
      corps: values.corps ?? null,
      typeContenu: values.typeContenu ?? null,
      categorieId: values.categorieId ?? null,
      zoneId: values.zoneId ?? null,
      imagePrincipaleUrl: values.imagePrincipaleUrl ?? null,
      imageAltText: values.imageAltText ?? null,
      auteur: values.auteur ?? null,
      sources: values.sources ?? null,
    });

    if (values.motsCles) {
      await ContenuEditorialRepository.syncMotsCles(id, values.motsCles);
    }

    // Calcul des surfaces impactées APRÈS l'écriture réussie uniquement — relecture pour
    // capturer l'état final réel (slug/catégorie/zone potentiellement modifiés).
    const apres = await ContenuEditorialRepository.findById(id);
    revalidateArticleSurfaces(toArticleSurfaceState(existante), apres ? toArticleSurfaceState(apres) : null);

    return { status: "success", message: "Article mis à jour.", articleId: id };
  } catch {
    // Couvre notamment une violation de `chk_publie_champs_requis` (vider un champ requis
    // sur un contenu déjà `publie` sans repasser par unpublishArticle) : jamais une erreur
    // technique brute exposée, toujours ce message générique fixe.
    return { status: "error", message: GENERIC_ERROR_MESSAGE, values };
  }
}

export async function publishArticle(
  id: string,
  _previousState: ArticleActionState,
  _formData: FormData
): Promise<ArticleActionState> {
  await ensureAdministrateurAuthentifie();

  const article = await ContenuEditorialRepository.findById(id);
  if (!article) {
    return { status: "error", message: NOT_FOUND_MESSAGE };
  }

  const erreurs: Record<string, string> = {};
  for (const { champ, message } of CHAMPS_REQUIS_PUBLICATION) {
    if (!article[champ]) {
      erreurs[champ] = message;
    }
  }
  if (Object.keys(erreurs).length > 0) {
    return {
      status: "error",
      message: erreurs.titre ?? Object.values(erreurs)[0],
      errors: erreurs,
    };
  }

  try {
    await ContenuEditorialRepository.publish(id);
    revalidateArticleSurfaces(toArticleSurfaceState(article), { ...toArticleSurfaceState(article), statut: "publie" });
    return { status: "success", message: "Article publié." };
  } catch {
    return { status: "error", message: GENERIC_ERROR_MESSAGE };
  }
}

export async function unpublishArticle(
  id: string,
  _previousState: ArticleActionState,
  _formData: FormData
): Promise<ArticleActionState> {
  await ensureAdministrateurAuthentifie();

  const existante = await ContenuEditorialRepository.findById(id);
  if (!existante) {
    return { status: "error", message: NOT_FOUND_MESSAGE };
  }

  try {
    await ContenuEditorialRepository.updateStatut(id, "brouillon");
    revalidateArticleSurfaces(toArticleSurfaceState(existante), {
      ...toArticleSurfaceState(existante),
      statut: "brouillon",
    });
    return { status: "success", message: "Brouillon enregistré." };
  } catch {
    return { status: "error", message: GENERIC_ERROR_MESSAGE };
  }
}

export async function archiveArticle(
  id: string,
  _previousState: ArticleActionState,
  _formData: FormData
): Promise<ArticleActionState> {
  await ensureAdministrateurAuthentifie();

  const existante = await ContenuEditorialRepository.findById(id);
  if (!existante) {
    return { status: "error", message: NOT_FOUND_MESSAGE };
  }

  // Transition toujours libre, sans exigence de champs — distincte de deleteArticle
  // (updateStatut, jamais delete) : la ligne reste en base, seul le statut change.
  try {
    await ContenuEditorialRepository.updateStatut(id, "archive");
    revalidateArticleSurfaces(toArticleSurfaceState(existante), {
      ...toArticleSurfaceState(existante),
      statut: "archive",
    });
    return { status: "success", message: "Article archivé." };
  } catch {
    return { status: "error", message: GENERIC_ERROR_MESSAGE };
  }
}

export async function deleteArticle(
  id: string,
  _previousState: ArticleActionState,
  _formData: FormData
): Promise<ArticleActionState> {
  await ensureAdministrateurAuthentifie();

  const existante = await ContenuEditorialRepository.findById(id);
  if (!existante) {
    return { status: "error", message: NOT_FOUND_MESSAGE };
  }

  // Suppression définitive — distincte d'archiveArticle (delete, jamais updateStatut) :
  // la ligne disparaît de la base, contrairement à un archivage.
  try {
    await ContenuEditorialRepository.delete(id);
    revalidateArticleSurfaces(toArticleSurfaceState(existante), null);
    return { status: "success", message: "Article supprimé." };
  } catch {
    return { status: "error", message: GENERIC_ERROR_MESSAGE };
  }
}
