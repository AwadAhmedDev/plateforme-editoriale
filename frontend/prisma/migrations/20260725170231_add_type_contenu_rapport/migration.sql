-- AlterEnum
ALTER TYPE "type_contenu" ADD VALUE 'rapport';

-- La ligne "DropIndex" générée automatiquement par `prisma migrate dev` a été retirée :
-- cet index GIN sur recherche_vecteur (Unsupported("tsvector"), non représentable dans
-- schema.prisma) est un ajout manuel de la migration initiale (20260716202832_init_schema),
-- pas une dérive de schéma. Le supprimer aurait cassé la recherche plein texte, hors
-- périmètre de REPO-1 (seed + enum uniquement). Recréé ci-dessous pour laisser la base
-- dans l'état où `prisma migrate dev` l'avait momentanément placée avant cette correction.
CREATE INDEX IF NOT EXISTS contenu_editorial_recherche_vecteur_idx ON contenu_editorial USING GIN (recherche_vecteur);
