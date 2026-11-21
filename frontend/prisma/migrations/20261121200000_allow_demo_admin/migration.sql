-- Démo publique (portfolio) : un seul Compte Administrateur réel reste la règle, mais le
-- compte de démonstration « demo » (consultation seule, voir src/lib/auth/require-admin-session.ts)
-- peut exister en plus. L'unicité de l'identifiant empêche un second compte « demo ».
CREATE OR REPLACE FUNCTION fn_administrateur_unique() RETURNS trigger AS $$
BEGIN
  IF NEW.identifiant <> 'demo'
     AND (SELECT count(*) FROM administrateur WHERE identifiant <> 'demo') >= 1 THEN
    RAISE EXCEPTION 'Un seul Compte Administrateur peut exister dans ce domaine';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
