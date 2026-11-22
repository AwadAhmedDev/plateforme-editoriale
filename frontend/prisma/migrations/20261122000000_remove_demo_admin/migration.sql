-- Retrait du compte de démonstration « demo » (migration 20261121200000_allow_demo_admin) :
-- le compte est supprimé (ses sessions avec lui) et la règle d'origine est rétablie,
-- un seul Compte Administrateur au total.
DELETE FROM administrateur WHERE identifiant = 'demo';

CREATE OR REPLACE FUNCTION fn_administrateur_unique() RETURNS trigger AS $$
BEGIN
  IF (SELECT count(*) FROM administrateur) >= 1 THEN
    RAISE EXCEPTION 'Un seul Compte Administrateur peut exister dans ce domaine';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
