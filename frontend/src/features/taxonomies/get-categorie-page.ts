import { cache } from "react";
import { CategorieRepository } from "@/lib/db/categorie-repository";
import { ContenuEditorialRepository } from "@/lib/db/contenu-editorial-repository";
import { estimerTempsLecture } from "@/features/articles/reading-time";

export type CategoriePageArticle = {
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

export type CategoriePageData = {
  nom: string;
  slug: string;
  descriptionCourte: string | null;
  count: number;
  articles: CategoriePageArticle[];
};

// Lecture publique pour app/(public)/categorie/[slug]/page.tsx : CategorieRepository.findBySlug
// puis ContenuEditorialRepository.findManyPublished({ categorieId }), tous deux existants et
// non modifiés. Page 1 uniquement (24 articles, déjà triés datePublication desc par le
// repository) — aucune pagination dans ce lot. Champs `chapo`/`auteur` déjà retournés par
// la requête Prisma sous-jacente (ARTICLE_PUBLIC_LIST_INCLUDE) : simple projection
// supplémentaire, aucune modification de repository (clôture RC-1, alignement sur la
// carte de listing du design, Corne de l'Afrique.dc.html l.273-286). `count` = total réel
// (pas seulement `items.length`) : correct même si le volume dépassait un jour la page 1.
// Mémoïsée (React.cache) : generateMetadata et la page appellent toutes deux cette fonction,
// un seul accès base de données réel par requête.
export const getCategoriePage = cache(async (slug: string): Promise<CategoriePageData | null> => {
  const categorie = await CategorieRepository.findBySlug(slug);

  if (!categorie) {
    return null;
  }

  const { items, total } = await ContenuEditorialRepository.findManyPublished({
    categorieId: categorie.id,
    page: 1,
  });

  return {
    nom: categorie.nom,
    slug: categorie.slug,
    descriptionCourte: categorie.descriptionCourte,
    count: total,
    articles: items.map((item) => ({
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
    })),
  };
});
