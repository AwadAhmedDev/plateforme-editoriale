import { ContenuEditorialRepository } from "@/lib/db/contenu-editorial-repository";

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

// Contenu phare de l'Accueil (Lot Homepage — hero, maquettes-haute-fidelite.md
// §1 "Accueil" : "Contenu phare (dossier/analyse en cours)", distinct de la
// grille "À la une"). Un contenu de plus que HomeArticle : typeContenu
// (garanti non nul pour un article Publié — chk_publie_champs_requis, même
// garantie déjà exploitée ci-dessous pour titre!/categorieNom!) et chapo
// (facultatif même pour un contenu Publié, cf. domain-model.md — jamais
// force-unwrappé).
export type FeaturedHomeArticle = HomeArticle & {
  typeContenu: string;
  chapo: string | null;
};

export type HomePageData = {
  featured: FeaturedHomeArticle | null;
  articles: HomeArticle[];
};

const HOME_ARTICLES_LIMIT = 6;

// Lecture publique pour app/(public)/page.tsx (Lot L8b, contrat validé ; étendu
// Lot Homepage pour le contenu phare) : réutilise
// ContenuEditorialRepository.findLatestPublished sans modification ni
// validation supplémentaire — statut 'publie' (non contournable, porté par
// le repository) combiné à la contrainte DB chk_publie_champs_requis
// (migration 20260716202832_init_schema) garantit déjà que tout article
// retourné a titre/type de contenu/catégorie/zone/image_principale_url/
// image_alt_text/date_publication non nuls ; onDelete: Restrict sur
// categorie/zone exclut toute relation orpheline.
//
// "Contenu phare" (maquettes-haute-fidelite.md) = le contenu Publié le plus
// récent, pas un champ de mise en avant distinct : aucun champ "épinglé"/
// "featured" n'existe dans domain-model.md/le schéma Prisma, et
// maquettes-haute-fidelite.md documente lui-même l'état vide comme "aucun
// contenu phare n'est encore publié" — la mise en avant découle donc de la
// même sélection par date que "À la une", jamais d'une donnée inventée. Un
// article de plus est demandé au repository (HOME_ARTICLES_LIMIT + 1) : le
// premier (le plus récent) devient le contenu phare, les suivants
// alimentent "À la une" — jamais le même article dans les deux blocs.
export async function getHomeArticles(): Promise<HomePageData> {
  const items = await ContenuEditorialRepository.findLatestPublished(HOME_ARTICLES_LIMIT + 1);

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
      ? { ...toHomeArticle(featuredItem), typeContenu: featuredItem.typeContenu!, chapo: featuredItem.chapo }
      : null,
    articles: restItems.map(toHomeArticle),
  };
}
