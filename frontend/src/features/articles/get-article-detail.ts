import { cache } from "react";
import { ContenuEditorialRepository } from "@/lib/db/contenu-editorial-repository";
import type { StatutContenu, TypeContenu } from "@prisma/client";

// Lecture publique d'un article par slug (Lot L2, contrat révisé) — branchement
// DR-001 centralisé ici, jamais dans le repository ni dans une future page.
// Mémoïsée pour dédupliquer un futur second appelant (ex. generateMetadata,
// hors périmètre de ce lot) au sein d'un même rendu — pas une anticipation de
// ce futur consommateur, seulement la définition propre de cette fonction.
const lireArticleParSlug = cache((slug: string) => ContenuEditorialRepository.findBySlug(slug));

export type BreadcrumbSegment = {
  label: string;
  href?: string;
};

export type ArticleDetailViewModel = {
  id: string;
  slug: string;
  statut: Exclude<StatutContenu, "brouillon">;
  isArchived: boolean;
  titre: string | null;
  chapo: string | null;
  corps: string | null;
  typeContenu: TypeContenu | null;
  categorie: { nom: string; slug: string } | null;
  zone: { nom: string; slug: string } | null;
  image: { url: string; alt: string; largeur: number; hauteur: number } | null;
  auteur: string | null;
  sources: string | null;
  datePublicationAffichee: Date | null;
  dateDerniereModification: Date;
  motsCles: string[];
  breadcrumb: BreadcrumbSegment[];
  relatedContext: { id: string; categorieId: string | null; zoneId: string | null };
};

export async function getArticleDetail(slug: string): Promise<ArticleDetailViewModel | null> {
  const article = await lireArticleParSlug(slug);

  if (!article || article.statut === "brouillon") {
    return null;
  }

  const image =
    article.imagePrincipaleUrl && article.imageAltText && article.imageLargeur && article.imageHauteur
      ? {
          url: article.imagePrincipaleUrl,
          alt: article.imageAltText,
          largeur: article.imageLargeur,
          hauteur: article.imageHauteur,
        }
      : null;

  const breadcrumb: BreadcrumbSegment[] = [{ label: "Accueil", href: "/" }];
  if (article.categorie) {
    breadcrumb.push({ label: article.categorie.nom, href: `/categorie/${article.categorie.slug}` });
  }
  if (article.zone) {
    breadcrumb.push({ label: article.zone.nom, href: `/zone/${article.zone.slug}` });
  }
  // Segment final ajouté uniquement si `titre` est non nul (contrat L2 §4.2,
  // corrigé) : cas limite Archivé-direct-depuis-Brouillon, jamais publié.
  // Aucune valeur de repli inventée — le fil d'Ariane se termine alors sur le
  // dernier segment réellement connu (Zone, sinon Catégorie, sinon Accueil),
  // déjà rendu non cliquable par Breadcrumb (L1) sans modification de ce
  // composant.
  if (article.titre !== null) {
    breadcrumb.push({ label: article.titre });
  }

  return {
    id: article.id,
    slug: article.slug,
    statut: article.statut,
    isArchived: article.statut === "archive",
    titre: article.titre,
    chapo: article.chapo,
    corps: article.corps,
    typeContenu: article.typeContenu,
    categorie: article.categorie ? { nom: article.categorie.nom, slug: article.categorie.slug } : null,
    zone: article.zone ? { nom: article.zone.nom, slug: article.zone.slug } : null,
    image,
    auteur: article.auteur,
    sources: article.sources,
    datePublicationAffichee: article.datePublication,
    dateDerniereModification: article.dateDerniereModification,
    motsCles: article.motsCles.map((motCle) => motCle.motCle),
    breadcrumb,
    relatedContext: {
      id: article.id,
      categorieId: article.categorieId,
      zoneId: article.zoneId,
    },
  };
}
