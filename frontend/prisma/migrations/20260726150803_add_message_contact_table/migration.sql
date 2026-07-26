-- La ligne "DropIndex" générée automatiquement par `prisma migrate dev` a été retirée :
-- cet index GIN sur recherche_vecteur (Unsupported("tsvector"), non représentable dans
-- schema.prisma) est un ajout manuel, non un drift de schéma réel — même situation que
-- 20260725170231_add_type_contenu_rapport. Recréé ci-dessous (déjà recréé sur la base
-- de développement au moment de cette migration).
CREATE INDEX IF NOT EXISTS contenu_editorial_recherche_vecteur_idx ON contenu_editorial USING GIN (recherche_vecteur);

-- CreateTable
CREATE TABLE "message_contact" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "objet" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_contact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "message_contact_created_at_idx" ON "message_contact"("created_at" DESC);
