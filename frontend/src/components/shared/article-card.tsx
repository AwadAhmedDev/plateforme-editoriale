import Image from "next/image";
import Link from "next/link";

// Composant partagé (Lot L1, contrat révisé §E/§E') : variante réduite
// d'ArticleCard, seul consommateur visé pour l'instant : la section
// "Contenus liés" de la page Détail d'un article. Toutes les props sont
// obligatoires — justifié par DR-001 (domain-model.md : un contenu Archivé
// est exclu de toute surface de découverte, dont les contenus liés) combiné
// à `chk_publie_champs_requis` (tout contenu Publié possède obligatoirement
// titre, catégorie, zone, image principale, texte alternatif et date de
// publication) et à la contrainte `onDelete: Restrict` sur les clés
// étrangères catégorie/zone (aucune relation ne peut devenir orpheline).
// Aucune de ces garanties ne dépend de l'algorithme de sélection des
// contenus liés (catégorie → zone → récents), lui-même non encore validé —
// c'est pourquoi cette nullabilité n'en dépend pas non plus.
//
// Ni variante grille/liste complète, ni `typeContenu`, ni logique
// d'omission contextuelle : hors périmètre de cette variante réduite
// (cf. carte P1-T1, development-tasks.md).
export type ArticleCardProps = {
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

export function ArticleCard({
  slug,
  titre,
  imagePrincipaleUrl,
  imageAltText,
  categorieNom,
  categorieSlug,
  zoneNom,
  zoneSlug,
  datePublication,
}: ArticleCardProps) {
  const dateFormatee = datePublication.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="rounded-sm border border-border p-3">
      <Link href={`/articles/${slug}`} className="relative block aspect-video overflow-hidden rounded-sm">
        <Image
          src={imagePrincipaleUrl}
          alt={imageAltText}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 600px) 50vw, 100vw"
          className="object-cover"
        />
      </Link>

      <h3 className="mt-3 font-editorial text-xl">
        <Link href={`/articles/${slug}`} className="transition-colors duration-fast hover:text-accent-primary">
          {titre}
        </Link>
      </h3>

      <p className="mt-2 flex flex-wrap items-center gap-1 font-meta text-[13px] text-text-secondary">
        <Link
          href={`/categorie/${categorieSlug}`}
          className="transition-colors duration-fast hover:text-accent-primary"
        >
          {categorieNom}
        </Link>
        <span aria-hidden="true">·</span>
        <Link href={`/zone/${zoneSlug}`} className="transition-colors duration-fast hover:text-accent-primary">
          {zoneNom}
        </Link>
        <span aria-hidden="true">·</span>
        <span>{dateFormatee}</span>
      </p>
    </article>
  );
}
