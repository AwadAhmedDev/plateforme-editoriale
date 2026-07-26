import Image from "next/image";
import Link from "next/link";

export type ArticleSearchResultCardProps = {
  slug: string;
  titre: string;
  imagePrincipaleUrl: string;
  imageAltText: string;
  categorieNom: string;
  zoneNom: string;
  typeLabel: string;
  auteur: string | null;
  datePublication: Date;
  tempsLecture: string;
  chapo: string | null;
};

// Composant serveur pur (REPO-6, Corne de l'Afrique.dc.html l.334-346) : ligne de résultat
// de recherche — deux lignes de métadonnées (rubrique · type · pays, puis auteur · date ·
// temps de lecture) encadrant titre/extrait, conforme au design. Distinct d'ArticleCard
// (grille, sans extrait), non réutilisé ici, non modifié.
export function ArticleSearchResultCard({
  slug,
  titre,
  imagePrincipaleUrl,
  imageAltText,
  categorieNom,
  zoneNom,
  typeLabel,
  auteur,
  datePublication,
  tempsLecture,
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
        className="relative block aspect-[16/10] w-full shrink-0 overflow-hidden rounded-sm outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary sm:w-[150px]"
      >
        <Image
          src={imagePrincipaleUrl}
          alt={imageAltText}
          fill
          sizes="150px"
          className="object-cover"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-[.1em] text-accent-primary">
          {categorieNom} · {typeLabel} · {zoneNom}
        </p>

        <h3 className="font-editorial text-lg font-semibold leading-tight">
          <Link
            href={`/articles/${slug}`}
            className="outline-none transition-colors duration-fast hover:text-accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
          >
            {titre}
          </Link>
        </h3>

        {chapo && (
          <p className="line-clamp-2 text-sm text-text-secondary">{chapo}</p>
        )}

        <p className="text-xs text-text-secondary">
          {auteur && <>{auteur} · </>}
          {dateFormatee} · {tempsLecture}
        </p>
      </div>
    </article>
  );
}
