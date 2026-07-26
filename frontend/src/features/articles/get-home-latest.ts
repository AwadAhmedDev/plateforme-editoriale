import { ContenuEditorialRepository } from "@/lib/db/contenu-editorial-repository";
import { estimerTempsLecture } from "@/features/articles/reading-time";

export type HomeLatestItem = {
  slug: string;
  titre: string;
  categorieNom: string;
  categorieSlug: string;
  zoneNom: string;
  zoneSlug: string;
  datePublication: Date;
  tempsLecture: string;
};

const LATEST_LIMIT = 6;

// Section "Dernières publications" de l'Accueil (liste tabulaire compacte, REPO-4 :
// Corne de l'Afrique.dc.html l.180-195) : les 6 contenus Publiés les plus récents, tous
// types confondus — recoupe nécessairement le contenu phare/"À la une" et les sections
// filtrées par type (même acceptation qu'ailleurs sur cette page, voir
// get-home-actualites.ts).
export async function getHomeLatest(): Promise<HomeLatestItem[]> {
  const items = await ContenuEditorialRepository.findLatestPublished(LATEST_LIMIT);

  return items.map((item) => ({
    slug: item.slug,
    titre: item.titre!,
    categorieNom: item.categorie!.nom,
    categorieSlug: item.categorie!.slug,
    zoneNom: item.zone!.nom,
    zoneSlug: item.zone!.slug,
    datePublication: item.datePublication!,
    tempsLecture: estimerTempsLecture(item.corps),
  }));
}
