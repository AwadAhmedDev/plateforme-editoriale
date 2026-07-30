import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// Accès aux données de l'état d'étranglement de la surface de connexion
// (security-specification.md §10). Aucune règle métier, aucun calcul de délai ici —
// uniquement les deux écritures atomiques dont la Server Action a besoin.
//
// Repository dédié plutôt qu'ajout à admin-repository.ts : l'état décrit la surface de
// connexion, jamais un compte (cf. commentaire du modèle dans schema.prisma). Le loger
// avec l'administrateur recréerait le couplage que le schéma évite délibérément.
export const SURFACE_CONNEXION_ADMIN = "ADMIN_LOGIN";

export const EtranglementConnexionRepository = {
  // Décroissance, incrément et lecture en UNE instruction atomique. C'est ce qui rend
  // l'étranglement résistant au parallélisme : une lecture suivie d'une écriture laisserait
  // N tentatives simultanées lire toutes la même valeur et n'écoper d'aucun délai. Ici le
  // verrou de ligne PostgreSQL sérialise les mises à jour, et chaque tentative concurrente
  // reçoit une valeur distincte et croissante.
  //
  // La décroissance est exprimée dans le CASE plutôt qu'en amont : l'heure de référence est
  // celle du serveur de base, donc immunisée contre la dérive d'horloge entre instances
  // serverless. `make_interval` reçoit les minutes en paramètre lié, jamais par
  // concaténation de chaîne.
  //
  // Retourne `null` si aucune ligne n'a été mise à jour (ligne d'état absente) — l'appelant
  // traite ce cas en ouverture, cf. adminLogin.
  async incrementerEchec(fenetreMinutes: number): Promise<number | null> {
    const lignes = await prisma.$queryRaw<{ echecs_consecutifs: number }[]>(Prisma.sql`
      UPDATE etranglement_connexion
      SET echecs_consecutifs = CASE
            WHEN dernier_echec_at IS NULL
              OR dernier_echec_at < now() - make_interval(mins => ${fenetreMinutes})
            THEN 1
            ELSE echecs_consecutifs + 1
          END,
          dernier_echec_at = now()
      WHERE surface = ${SURFACE_CONNEXION_ADMIN}
      RETURNING echecs_consecutifs
    `);

    return lignes[0]?.echecs_consecutifs ?? null;
  },

  // Remise à zéro après authentification réussie. `dernier_echec_at` repasse à NULL :
  // l'absence d'échec n'a pas de date, jamais une valeur de remplissage.
  async reinitialiser(): Promise<void> {
    await prisma.$executeRaw(Prisma.sql`
      UPDATE etranglement_connexion
      SET echecs_consecutifs = 0, dernier_echec_at = NULL
      WHERE surface = ${SURFACE_CONNEXION_ADMIN}
    `);
  },
};
