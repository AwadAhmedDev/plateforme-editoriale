import { ContenuEditorialRepository } from "@/lib/db/contenu-editorial-repository";
import { estimerTempsLecture } from "@/features/articles/reading-time";

export type HomeArticle = {
  slug: string;
  titre: string;
  imagePrincipaleUrl: string;
  imageAltText: string;
  categorieNom: string;
  categorieSlug: string;
  zoneNom: string;
  zoneSlug: string;
  datePublication: Date;
};

// Contenu phare de l'Accueil (hero, REPO-4 : Corne de l'Afrique.dc.html l.93-104) : un
// contenu de plus que HomeArticle : typeContenu (garanti non nul pour un article Publié
// — chk_publie_champs_requis), chapo/auteur (facultatifs même pour un contenu Publié,
// cf. domain-model.md — jamais force-unwrappés) et tempsLecture (dérivé de `corps`,
// jamais stocké — cf. reading-time.ts).
export type FeaturedHomeArticle = HomeArticle & {
  typeContenu: string;
  chapo: string | null;
  auteur: string | null;
  tempsLecture: string;
};

export type HomePageData = {
  featured: FeaturedHomeArticle | null;
  // "À la une" (hero, colonne latérale, REPO-4 : design l.106-115) : 3 éléments, pas 6 —
  // remplace l'ancienne grille "À la une" à 6 cartes (Lot Homepage précédent), absorbée
  // par la nouvelle grille "Actualités & terrain" (get-home-actualites.ts).
  secondary: HomeArticle[];
};

const SECONDARY_LIMIT = 3;

// Lecture publique pour app/(public)/page.tsx : réutilise
// ContenuEditorialRepository.findLatestPublished sans modification ni validation
// supplémentaire — statut 'publie' (non contournable, porté par le repository) combiné à
// la contrainte DB chk_publie_champs_requis garantit déjà que tout article retourné a
// titre/type de contenu/catégorie/zone/image_principale_url/image_alt_text/date_publication
// non nuls ; onDelete: Restrict sur categorie/zone exclut toute relation orpheline.
//
// "Contenu phare" = le contenu Publié le plus récent, pas un champ de mise en avant
// distinct : aucun champ "épinglé"/"featured" n'existe dans domain-model.md/le schéma
// Prisma. Un article de plus est demandé au repository (SECONDARY_LIMIT + 1) : le
// premier (le plus récent) devient le contenu phare, les 3 suivants alimentent "À la
// une" — jamais le même article dans les deux blocs.
export async function getHomeArticles(): Promise<HomePageData> {
  const items = await ContenuEditorialRepository.findLatestPublished(SECONDARY_LIMIT + 1);

  const toHomeArticle = (item: (typeof items)[number]): HomeArticle => ({
    slug: item.slug,
    titre: item.titre!,
    imagePrincipaleUrl: item.imagePrincipaleUrl!,
    imageAltText: item.imageAltText!,
    categorieNom: item.categorie!.nom,
    categorieSlug: item.categorie!.slug,
    zoneNom: item.zone!.nom,
    zoneSlug: item.zone!.slug,
    datePublication: item.datePublication!,
  });

  const [featuredItem, ...restItems] = items;

  return {
    featured: featuredItem
      ? {
          ...toHomeArticle(featuredItem),
          typeContenu: featuredItem.typeContenu!,
          chapo: featuredItem.chapo,
          auteur: featuredItem.auteur,
          tempsLecture: estimerTempsLecture(featuredItem.corps),
        }
      : null,
    secondary: restItems.map(toHomeArticle),
  };
}
