import Image from "next/image";
import Link from "next/link";

export type ArticleSearchResultCardProps = {
  slug: string;
  titre: string;
  imagePrincipaleUrl: string;
  imageAltText: string;
  categorieNom: string;
  zoneNom: string;
  datePublication: Date;
  chapo: string | null;
};

// Composant serveur pur (Lot L9, contrat validé) : affichage d'un résultat
// de recherche, liste verticale pleine largeur (jamais une grille,
// ui-specification.md) — distinct d'ArticleCard (conçu pour une grille,
// sans extrait), non réutilisé ici, non modifié. Aucune logique métier,
// aucun état, aucun "use client" : reçoit des données déjà projetées par
// search-articles.ts, se limite à les afficher.
export function ArticleSearchResultCard({
  slug,
  titre,
  imagePrincipaleUrl,
  imageAltText,
  categorieNom,
  zoneNom,
  datePublication,
  chapo,
}: ArticleSearchResultCardProps) {
  const dateFormatee = datePublication.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="flex flex-col gap-3 border-b border-border py-4 sm:flex-row">
      <Link
        href={`/articles/${slug}`}
        className="relative block h-[80px] w-full shrink-0 overflow-hidden rounded-sm outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary sm:w-[120px]"
      >
        <Image src={imagePrincipaleUrl} alt={imageAltText} fill sizes="120px" className="object-cover" />
      </Link>

      <div className="flex flex-1 flex-col">
        <h3 className="font-editorial text-lg">
          <Link
            href={`/articles/${slug}`}
            className="outline-none transition-colors duration-fast hover:text-accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
          >
            {titre}
          </Link>
        </h3>

        <p className="mt-1 flex flex-wrap items-center gap-1 font-meta text-[13px] text-text-secondary">
          <span>{categorieNom}</span>
          <span aria-hidden="true">·</span>
          <span>{zoneNom}</span>
          <span aria-hidden="true">·</span>
          <span>{dateFormatee}</span>
        </p>

        {chapo && <p className="mt-2 line-clamp-2 text-sm text-text-secondary">{chapo}</p>}
      </div>
    </article>
  );
}
