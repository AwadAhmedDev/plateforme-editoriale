-- Sécurisation du schéma `public` face à l'API Data (PostgREST).
--
-- Contexte : les 10 tables de `public` étaient exposées via PostgREST sans RLS,
-- et `anon`/`authenticated` y disposaient de tous les privilèges (arwdDxtm) —
-- y compris sur `administrateur` (hash bcrypt) et `session_administrateur`
-- (jetons de session). L'application n'utilise ni supabase-js ni PostgREST :
-- elle passe exclusivement par Prisma + @prisma/adapter-pg avec le rôle
-- `postgres`. La surface REST est donc inutile au produit.
--
-- Aucun impact applicatif, pour deux raisons INDÉPENDANTES :
--   1. `postgres` a rolbypassrls = true ;
--   2. `postgres` est propriétaire des 10 tables et `FORCE ROW LEVEL SECURITY`
--      n'est positionné sur aucune — le propriétaire est exempté même sans
--      BYPASSRLS.
-- Il faudrait retirer les deux pour affecter l'application.
--
-- `service_role` conserve ses privilèges : clé d'administration légitime, à
-- traiter comme un secret, jamais exposée publiquement.

-- 1. Révocation des privilèges sur les objets EXISTANTS -----------------------

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;

-- 2. Neutralisation de la réattribution automatique ---------------------------
--
-- Point central du correctif. Des DEFAULT PRIVILEGES posés au nom de `postgres`
-- accordaient d'office `arwdDxtm` à `anon` et `authenticated` sur toute table
-- créée dans `public` :
--
--   pg_default_acl · postgres · public · TABLE
--     {postgres=arwdDxtm/postgres, anon=arwdDxtm/postgres,
--      authenticated=arwdDxtm/postgres, service_role=arwdDxtm/postgres}
--
-- Les migrations Prisma s'exécutant précisément comme `postgres`, chaque futur
-- CREATE TABLE rouvrait la brèche silencieusement. Sans ce bloc, le correctif
-- se périmerait à la prochaine migration créant une table.

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON TABLES FROM anon, authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON SEQUENCES FROM anon, authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON FUNCTIONS FROM anon, authenticated;

-- 3. RLS en défense en profondeur ---------------------------------------------
--
-- Activée sans AUCUNE policy : RLS active et sans policy = refus total pour
-- tout rôle non exempté. Tient même si des GRANT étaient réaccordés, ou si le
-- schéma `public` était réexposé à l'API Data.
--
-- `_prisma_migrations` est incluse délibérément : elle exposait l'historique de
-- schéma, et un DELETE y aurait cassé le prochain `migrate deploy`. Le CLI
-- Prisma y écrit comme `postgres`, donc sans être affecté.

ALTER TABLE administrateur ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_administrateur ENABLE ROW LEVEL SECURITY;
ALTER TABLE contenu_editorial ENABLE ROW LEVEL SECURITY;
ALTER TABLE contenu_mot_cle ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorie ENABLE ROW LEVEL SECURITY;
ALTER TABLE zone_geographique ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscrit_newsletter ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_contact ENABLE ROW LEVEL SECURITY;
ALTER TABLE etranglement_connexion ENABLE ROW LEVEL SECURITY;
ALTER TABLE _prisma_migrations ENABLE ROW LEVEL SECURITY;

-- Volontairement NON inclus : `REVOKE USAGE ON SCHEMA public`.
-- L'USAGE sur `public` est aussi accordé au pseudo-rôle PUBLIC (entrée
-- `=U/pg_database_owner`) : le révoquer à `anon`/`authenticated` seuls serait
-- sans effet, et le révoquer à PUBLIC toucherait des mécanismes Supabase hors
-- du périmètre de ce correctif. Les révocations du bloc 1 et la RLS du bloc 3
-- suffisent, chacune indépendamment.
