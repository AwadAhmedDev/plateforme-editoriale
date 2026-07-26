import { ContenuEditorialRepository } from "@/lib/db/contenu-editorial-repository";
import { estimerTempsLecture } from "@/features/articles/reading-time";

export type HomeActualiteItem = {
  slug: string;
  titre: string;
  imagePrincipaleUrl: string;
  imageAltText: string;
  categorieNom: string;
  categorieSlug: string;
  zoneNom: string;
  zoneSlug: string;
  tempsLecture: string;
};

const ACTUALITES_LIMIT = 4;

// Section "Actualités & terrain" de l'Accueil (grille 4 colonnes, REPO-4 : Corne de
// l'Afrique.dc.html l.118-139) : restreinte au type `article` (« Actualité »), pour se
// distinguer du bandeau "Analyses & enquêtes approfondies" (get-home-analyses.ts,
// analyse/enquête) — même contenu Publié, deux sections différentes par typeContenu,
// jamais par catégorie. Peut recouper le contenu phare/"À la une" (get-home-articles.ts) :
// aucune déduplication entre sections, chacune interroge indépendamment (cf.
// plan-implementation-repositionnement-asile.md, REPO-4 §Risques — volume de contenu
// insuffisant pour remplir toutes les sections sans répétition, situation acceptée).
export async function getHomeActualites(): Promise<HomeActualiteItem[]> {
  const items = await ContenuEditorialRepository.findLatestPublishedByTypes(["article"], ACTUALITES_LIMIT);

  return items.map((item) => ({
    slug: item.slug,
    titre: item.titre!,
    imagePrincipaleUrl: item.imagePrincipaleUrl!,
    imageAltText: item.imageAltText!,
    categorieNom: item.categorie!.nom,
    categorieSlug: item.categorie!.slug,
    zoneNom: item.zone!.nom,
    zoneSlug: item.zone!.slug,
    tempsLecture: estimerTempsLecture(item.corps),
  }));
}
