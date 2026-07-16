-- ============================================================================
-- Migration initiale — schéma complet du MVP
--
-- Contenu et ordre conformes à docs/project/sql-migration-specification.md.
-- Deux strates, dans un ordre strict (la seconde référence des objets créés
-- par la première) :
--   1. Généré par Prisma (`prisma migrate diff --from-empty --to-schema
--      prisma/schema.prisma --script`) à partir de schema.prisma — types
--      énumérés, tables, index déclaratifs, clés étrangères.
--   2. Ajout manuel (non exprimable dans le langage déclaratif de Prisma,
--      cf. prisma-schema-specification.md §10 et sql-migration-specification.md
--      §4-§7) — fonctions et triggers PL/pgSQL, contraintes CHECK, index GIN.
--
-- Aucune extension PostgreSQL requise : gen_random_uuid() est disponible
-- nativement à partir de PostgreSQL 13 (sql-migration-specification.md §3).
-- ============================================================================


-- ============================================================================
-- 1. GÉNÉRÉ PAR PRISMA — ne pas éditer manuellement cette section ; toute
--    évolution du schéma passe par schema.prisma puis une nouvelle migration.
-- ============================================================================

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "type_contenu" AS ENUM ('article', 'analyse', 'enquete', 'interview', 'dossier_thematique');

-- CreateEnum
CREATE TYPE "statut_contenu" AS ENUM ('brouillon', 'publie', 'archive');

-- CreateTable
CREATE TABLE "categorie" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nom" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description_courte" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categorie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zone_geographique" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nom" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description_courte" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "zone_geographique_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "administrateur" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "identifiant" TEXT NOT NULL,
    "mot_de_passe_hash" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "administrateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_administrateur" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "administrateur_id" UUID NOT NULL,
    "jeton_hash" TEXT NOT NULL,
    "derniere_activite_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_administrateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contenu_editorial" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "titre" TEXT,
    "chapo" TEXT,
    "corps" TEXT,
    "type_contenu" "type_contenu",
    "categorie_id" UUID,
    "zone_id" UUID,
    "image_principale_url" TEXT,
    "image_alt_text" TEXT,
    "image_largeur" INTEGER,
    "image_hauteur" INTEGER,
    "auteur" TEXT,
    "sources" TEXT,
    "statut" "statut_contenu" NOT NULL DEFAULT 'brouillon',
    "date_publication" TIMESTAMPTZ,
    "date_derniere_modification" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recherche_vecteur" tsvector,

    CONSTRAINT "contenu_editorial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contenu_mot_cle" (
    "contenu_id" UUID NOT NULL,
    "mot_cle" TEXT NOT NULL,

    CONSTRAINT "contenu_mot_cle_pkey" PRIMARY KEY ("contenu_id","mot_cle")
);

-- CreateTable
CREATE TABLE "inscrit_newsletter" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "date_inscription" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" TEXT NOT NULL DEFAULT 'inscrit',
    "jeton_desinscription" TEXT,
    "desinscrit_at" TIMESTAMPTZ,

    CONSTRAINT "inscrit_newsletter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categorie_nom_key" ON "categorie"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "categorie_slug_key" ON "categorie"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "zone_geographique_nom_key" ON "zone_geographique"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "zone_geographique_slug_key" ON "zone_geographique"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "administrateur_identifiant_key" ON "administrateur"("identifiant");

-- CreateIndex
CREATE UNIQUE INDEX "session_administrateur_jeton_hash_key" ON "session_administrateur"("jeton_hash");

-- CreateIndex
CREATE INDEX "session_administrateur_administrateur_id_idx" ON "session_administrateur"("administrateur_id");

-- CreateIndex
CREATE UNIQUE INDEX "contenu_editorial_slug_key" ON "contenu_editorial"("slug");

-- CreateIndex
CREATE INDEX "contenu_editorial_statut_date_publication_idx" ON "contenu_editorial"("statut", "date_publication" DESC);

-- CreateIndex
CREATE INDEX "contenu_editorial_categorie_id_idx" ON "contenu_editorial"("categorie_id");

-- CreateIndex
CREATE INDEX "contenu_editorial_zone_id_idx" ON "contenu_editorial"("zone_id");

-- CreateIndex
CREATE INDEX "contenu_mot_cle_mot_cle_idx" ON "contenu_mot_cle"("mot_cle");

-- CreateIndex
CREATE UNIQUE INDEX "inscrit_newsletter_email_key" ON "inscrit_newsletter"("email");

-- CreateIndex
CREATE UNIQUE INDEX "inscrit_newsletter_jeton_desinscription_key" ON "inscrit_newsletter"("jeton_desinscription");

-- AddForeignKey
ALTER TABLE "session_administrateur" ADD CONSTRAINT "session_administrateur_administrateur_id_fkey" FOREIGN KEY ("administrateur_id") REFERENCES "administrateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contenu_editorial" ADD CONSTRAINT "contenu_editorial_categorie_id_fkey" FOREIGN KEY ("categorie_id") REFERENCES "categorie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contenu_editorial" ADD CONSTRAINT "contenu_editorial_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zone_geographique"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contenu_mot_cle" ADD CONSTRAINT "contenu_mot_cle_contenu_id_fkey" FOREIGN KEY ("contenu_id") REFERENCES "contenu_editorial"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- ============================================================================
-- 2. AJOUT MANUEL — non exprimable par le schéma déclaratif Prisma
--    (prisma-schema-specification.md §10, sql-migration-specification.md §4-§7).
--    Reproduit intégralement et sans modification depuis technical-architecture.md
--    §6 / database-schema.md §6, dans l'ordre de dépendance imposé.
-- ============================================================================

-- --- Fonctions et triggers (sql-migration-specification.md §4-§5) --------------

-- Compte Administrateur unique
CREATE OR REPLACE FUNCTION fn_administrateur_unique() RETURNS trigger AS $$
BEGIN
  IF (SELECT count(*) FROM administrateur) >= 1 THEN
    RAISE EXCEPTION 'Un seul Compte Administrateur peut exister dans ce domaine';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_administrateur_unique
BEFORE INSERT ON administrateur
FOR EACH ROW EXECUTE FUNCTION fn_administrateur_unique();

-- Verrouillage + auto-renseignement de la Date de publication (DR-005) + Date de dernière modification
CREATE OR REPLACE FUNCTION fn_contenu_editorial_dates() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.date_publication IS NOT NULL AND NEW.date_publication IS DISTINCT FROM OLD.date_publication THEN
    RAISE EXCEPTION 'La Date de publication ne peut plus être modifiée après son premier renseignement (DR-005)';
  END IF;

  IF NEW.statut = 'publie' AND NEW.date_publication IS NULL THEN
    NEW.date_publication := now();
  END IF;

  IF TG_OP = 'UPDATE' THEN
    NEW.date_derniere_modification := now();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_contenu_editorial_dates
BEFORE INSERT OR UPDATE ON contenu_editorial
FOR EACH ROW EXECUTE FUNCTION fn_contenu_editorial_dates();

-- Entretien du vecteur de recherche (titre, chapô, corps, mots-clés)
CREATE OR REPLACE FUNCTION fn_maj_recherche_vecteur(p_contenu_id UUID) RETURNS void AS $$
BEGIN
  UPDATE contenu_editorial c SET recherche_vecteur =
    setweight(to_tsvector('french', coalesce(c.titre, '')), 'A') ||
    setweight(to_tsvector('french', coalesce((SELECT string_agg(mot_cle, ' ') FROM contenu_mot_cle WHERE contenu_id = c.id), '')), 'A') ||
    setweight(to_tsvector('french', coalesce(c.chapo, '')), 'B') ||
    setweight(to_tsvector('french', coalesce(c.corps, '')), 'C')
  WHERE c.id = p_contenu_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_contenu_editorial_recherche_trg() RETURNS trigger AS $$
BEGIN
  PERFORM fn_maj_recherche_vecteur(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_contenu_editorial_recherche
AFTER INSERT OR UPDATE OF titre, chapo, corps ON contenu_editorial
FOR EACH ROW EXECUTE FUNCTION fn_contenu_editorial_recherche_trg();

CREATE OR REPLACE FUNCTION fn_contenu_mot_cle_recherche_trg() RETURNS trigger AS $$
BEGIN
  PERFORM fn_maj_recherche_vecteur(COALESCE(NEW.contenu_id, OLD.contenu_id));
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_contenu_mot_cle_recherche
AFTER INSERT OR DELETE ON contenu_mot_cle
FOR EACH ROW EXECUTE FUNCTION fn_contenu_mot_cle_recherche_trg();

-- --- Contraintes CHECK (sql-migration-specification.md §6) --------------------

-- Invariant domain-model.md : jamais Publié sans Titre/Type/Catégorie/Zone/Image+Alt ;
-- Date de publication garantie non nulle si Publié (DR-005).
ALTER TABLE contenu_editorial ADD CONSTRAINT chk_publie_champs_requis CHECK (
  statut <> 'publie' OR (
    titre IS NOT NULL AND type_contenu IS NOT NULL AND categorie_id IS NOT NULL
    AND zone_id IS NOT NULL AND image_principale_url IS NOT NULL AND image_alt_text IS NOT NULL
    AND date_publication IS NOT NULL
  )
);

-- Fermeture du domaine de valeurs de inscrit_newsletter.statut (database-schema.md §4.7).
-- Nom de contrainte non fixé par les documents source (sql-migration-specification.md §6) —
-- convention retenue ici : chk_inscrit_newsletter_statut.
ALTER TABLE inscrit_newsletter ADD CONSTRAINT chk_inscrit_newsletter_statut CHECK (
  statut IN ('inscrit', 'desinscrit')
);

-- --- Index GIN (sql-migration-specification.md §7) -----------------------------

-- Recherche full-text (technical-architecture.md §4.6, database-schema.md §7).
-- Nom d'index non fixé par les documents source — convention retenue ici, alignée
-- sur la convention de nommage déjà utilisée par Prisma pour les index déclaratifs
-- ci-dessus (<table>_<colonne(s)>_idx).
CREATE INDEX contenu_editorial_recherche_vecteur_idx ON contenu_editorial USING GIN (recherche_vecteur);
