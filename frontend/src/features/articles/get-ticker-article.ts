import { cache } from "react";
import { ContenuEditorialRepository } from "@/lib/db/contenu-editorial-repository";

export type TickerArticle = {
  titre: string;
  slug: string;
};

// Lecture dédiée au ticker du header (Lot REPO-3, Corne de l'Afrique.dc.html
// l.35-38 : "En continu" + titre du dernier contenu publié). Distincte de
// getHomeArticles (Accueil, get-home-articles.ts) : le ticker n'a besoin que
// du titre/slug du contenu le plus récent, jamais de la sélection en deux
// blocs (contenu phare / "À la une") propre à la Homepage — réutiliser cette
// dernière coupleraient le header à une sémantique éditoriale qui n'appartient
// qu'à l'Accueil (Architecture B, audit REPO-3G). Mémoïsée (React.cache) sur
// le modèle de listCategorieMenu/listZoneMenu, consommée uniquement par
// PublicHeader.
export const getTickerArticle = cache(async (): Promise<TickerArticle | null> => {
  const [item] = await ContenuEditorialRepository.findLatestPublished(1);

  return item ? { titre: item.titre!, slug: item.slug } : null;
});
