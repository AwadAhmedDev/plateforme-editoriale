import { ContenuEditorialRepository } from "@/lib/db/contenu-editorial-repository";
import { estimerTempsLecture } from "@/features/articles/reading-time";

export type RelatedArticle = {
  slug: string;
  titre: string;
  chapo: string | null;
  imagePrincipaleUrl: string;
  imageAltText: string;
  categorieNom: string;
  categorieSlug: string;
  zoneNom: string;
  zoneSlug: string;
  auteur: string | null;
  datePublication: Date;
  tempsLecture: string;
};

const RELATED_LIMIT = 3;

// Contenus associés de la page Détail d'un article (Lot 2C, sitemap.md §Navigation
// secondaire) : lecture via ContenuEditorialRepository.findRelatedPublished uniquement.
// Prend directement le `relatedContext` déjà exposé par get-article-detail.ts, sans le
// modifier — ce champ portait exactement les trois entrées nécessaires (l'identifiant à
// exclure, et les deux axes de rapprochement).
//
// Rapprochement par rubrique OU pays, en une seule requête : un article correspondant aux
// deux axes n'apparaît qu'une fois (cf. findRelatedPublished). Tri par date de publication
// décroissante seule, aucun classement de pertinence.
//
// Projection alignée champ pour champ sur ArticleCardProps : la page réutilise ArticleCard
// tel quel, aucune variante de carte créée pour cette section.
//
// Non mémoïsée (React.cache) volontairement : un seul appelant, la page — generateMetadata
// n'affiche pas de contenus associés. Même convention que get-home-latest.ts et les autres
// lectures d'Accueil, contrairement à getArticleDetail qui a deux appelants par rendu.
export async function getRelatedArticles(context: {
  id: string;
  categorieId: string | null;
  zoneId: string | null;
}): Promise<RelatedArticle[]> {
  // Article sans rubrique ni pays : aucun axe de rapprochement, donc aucun accès base de
  // données — jamais une requête dont on sait déjà qu'elle ne peut rien remonter.
  if (!context.categorieId && !context.zoneId) {
    return [];
  }

  const items = await ContenuEditorialRepository.findRelatedPublished(
    {
      excludeId: context.id,
      categorieId: context.categorieId,
      zoneId: context.zoneId,
    },
    RELATED_LIMIT
  );

  return items.map((item) => ({
    slug: item.slug,
    titre: item.titre!,
    chapo: item.chapo,
    imagePrincipaleUrl: item.imagePrincipaleUrl!,
    imageAltText: item.imageAltText!,
    categorieNom: item.categorie!.nom,
    categorieSlug: item.categorie!.slug,
    zoneNom: item.zone!.nom,
    zoneSlug: item.zone!.slug,
    auteur: item.auteur,
    datePublication: item.datePublication!,
    tempsLecture: estimerTempsLecture(item.corps),
  }));
}
