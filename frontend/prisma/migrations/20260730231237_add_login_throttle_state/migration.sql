-- La ligne "DropIndex" générée automatiquement par `prisma migrate diff` a été retirée :
-- cet index GIN sur recherche_vecteur (Unsupported("tsvector"), non représentable dans
-- schema.prisma) est un ajout manuel de la migration initiale (20260716202832_init_schema),
-- pas une dérive de schéma. Le supprimer casserait la recherche plein texte, hors périmètre
-- de cette migration (état d'étranglement de la connexion uniquement). Troisième occurrence
-- du même faux positif, après 20260725170231 et 20260726150803 — le mécanisme est
-- structurel, pas accidentel. Recréé ci-dessous pour laisser la base dans l'état attendu.
CREATE INDEX IF NOT EXISTS contenu_editorial_recherche_vecteur_idx ON contenu_editorial USING GIN (recherche_vecteur);

-- CreateTable
CREATE TABLE "etranglement_connexion" (
    "surface" TEXT NOT NULL,
    "echecs_consecutifs" INTEGER NOT NULL DEFAULT 0,
    "dernier_echec_at" TIMESTAMPTZ,

    CONSTRAINT "etranglement_connexion_pkey" PRIMARY KEY ("surface")
);

-- Ligne unique de la surface de connexion administrateur, ajoutée manuellement :
-- `prisma migrate diff` ne produit que du DDL, jamais de donnée de référence. Sans elle,
-- la table serait vide et l'instruction atomique d'incrément du lot suivant n'affecterait
-- aucune ligne. `ON CONFLICT DO NOTHING` rend la migration rejouable sans erreur.
INSERT INTO "etranglement_connexion" ("surface", "echecs_consecutifs", "dernier_echec_at")
VALUES ('ADMIN_LOGIN', 0, NULL)
ON CONFLICT ("surface") DO NOTHING;
