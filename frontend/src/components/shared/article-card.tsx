import Image from "next/image";
import Link from "next/link";

// Carte de listing (REPO-1→9, clôture RC-1 : alignement sur Corne de l'Afrique.dc.html
// l.273-286, section isListing) — consommée par app/(public)/categorie/[slug]/page.tsx
// et app/(public)/zone/[slug]/page.tsx, seuls consommateurs restants (le 3e,
// app/(public)/articles/page.tsx, a été supprimé — redirection vers /recherche, RC-1).
// Image 16/9, rubrique · pays, titre, extrait, "auteur · date · temps de lecture" —
// mêmes champs que la carte de listing du design, tous déjà disponibles sur
// ArticlePublicListItem (aucune modification de repository requise).
//
// Aucune prop de désactivation des liens rubrique/pays (contrairement à une version
// antérieure de ce composant) : ses deux consommateurs actuels sont eux-mêmes des pages
// de rubrique/pays, où ces routes existent toujours — plus aucun appelant ne désactivait
// ce comportement.
export type ArticleCardProps = {
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

export function ArticleCard({
  slug,
  titre,
  chapo,
  imagePrincipaleUrl,
  imageAltText,
  categorieNom,
  categorieSlug,
  zoneNom,
  zoneSlug,
  auteur,
  datePublication,
  tempsLecture,
}: ArticleCardProps) {
  const dateFormatee = datePublication.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="flex flex-col overflow-hidden rounded-sm border border-border bg-bg-secondary transition-shadow duration-fast hover:shadow-lg">
      <Link
        href={`/articles/${slug}`}
        className="relative block aspect-video overflow-hidden outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
      >
        <Image
          src={imagePrincipaleUrl}
          alt={imageAltText}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 600px) 50vw, 100vw"
          className="object-cover"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="flex flex-wrap items-center gap-1 text-[11px] font-semibold uppercase tracking-[.1em] text-accent-primary">
          <Link
            href={`/categorie/${categorieSlug}`}
            className="outline-none transition-colors duration-fast hover:text-accent-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
          >
            {categorieNom}
          </Link>
          <span aria-hidden="true">·</span>
          <Link
            href={`/zone/${zoneSlug}`}
            className="outline-none transition-colors duration-fast hover:text-accent-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
          >
            {zoneNom}
          </Link>
        </p>

        <h3 className="font-editorial text-lg font-semibold leading-tight">
          <Link
            href={`/articles/${slug}`}
            className="outline-none transition-colors duration-fast hover:text-accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
          >
            {titre}
          </Link>
        </h3>

        {chapo && <p className="line-clamp-2 text-sm text-text-secondary">{chapo}</p>}

        <p className="mt-auto text-xs text-text-secondary">
          {auteur && <>{auteur} · </>}
          {dateFormatee} · {tempsLecture}
        </p>
      </div>
    </article>
  );
}
