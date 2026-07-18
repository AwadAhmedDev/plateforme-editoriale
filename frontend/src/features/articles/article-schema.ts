import { z } from "zod";

// Schémas de validation Articles (server-actions-specification.md §3, api-contracts.md §1.5,
// §2.2, §9.1 ; security-specification.md §5 : « schéma Zod unique par formulaire/contrat »,
// le serveur restant seule autorité). Premier usage de Zod dans le projet — décision
// d'architecture validée pour le module Articles (dette pré-existante sur les modules
// Newsletter/Catégories/Zones assumée, non corrigée ici, hors périmètre de ce lot).
//
// Ne valide que des objets déjà extraits (ex. d'un FormData) — l'extraction FormData →
// objet reste la responsabilité de la Server Action appelante, pas de ce fichier.

const TYPES_CONTENU = ["article", "analyse", "enquete", "interview", "dossier_thematique"] as const;
const STATUTS_CONTENU = ["brouillon", "publie", "archive"] as const;

// Champs d'un Contenu éditorial (création ou modification) — tous optionnels, cohérent
// avec « aucun champ requis à la création » (domain-model.md) ; la complétude requise
// pour Publier est une vérification distincte, hors périmètre de ce schéma (Lot 5/7).
export const articleFieldsSchema = z.object({
  slug: z.string().trim().min(1).optional(),
  titre: z.string().trim().min(1).optional(),
  chapo: z.string().trim().min(1).optional(),
  corps: z.string().trim().min(1).optional(),
  typeContenu: z.enum(TYPES_CONTENU).optional(),
  categorieId: z.string().uuid().optional(),
  zoneId: z.string().uuid().optional(),
  imagePrincipaleUrl: z.string().trim().url().optional(),
  imageAltText: z.string().trim().min(1).optional(),
  auteur: z.string().trim().min(1).optional(),
  sources: z.string().trim().min(1).optional(),
  motsCles: z.array(z.string().trim().min(1)).optional(),
});

export type ArticleFieldsInput = z.infer<typeof articleFieldsSchema>;

// Paramètres de `listArticles` (server-actions-specification.md §3.8) : tri restreint à
// une liste fermée de colonnes (date | statut) — jamais une chaîne libre, cohérent avec
// le repository (Lot 1), qui n'accepte lui-même que cette même union fermée.
export const listArticlesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  statut: z.enum(STATUTS_CONTENU).optional(),
  categorieId: z.string().uuid().optional(),
  zoneId: z.string().uuid().optional(),
  sort: z
    .object({
      champ: z.enum(["date", "statut"]),
      sens: z.enum(["asc", "desc"]),
    })
    .optional(),
});

export type ListArticlesQuery = z.infer<typeof listArticlesQuerySchema>;

// Paramètres de `searchContent` (server-actions-specification.md §9.1, api-contracts.md
// §1.7) : tous optionnels — une recherche sans `q` reste valide (filtres seuls).
export const searchQuerySchema = z.object({
  q: z.string().trim().optional(),
  categorieId: z.string().uuid().optional(),
  zoneId: z.string().uuid().optional(),
  typeContenu: z.enum(TYPES_CONTENU).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;
