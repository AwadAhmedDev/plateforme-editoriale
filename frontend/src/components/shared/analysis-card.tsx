import Image from "next/image";
import Link from "next/link";
import type { HomeAnalyseItem } from "@/features/articles/get-home-analyses";

// Carte horizontale du bandeau "Analyses & enquêtes approfondies" de l'Accueil (2
// colonnes, REPO-4 : Corne de l'Afrique.dc.html l.150-161) : image à gauche (largeur
// fixe), typeLabel · pays, titre, extrait, "auteur · temps de lecture" — seule section de
// l'Accueil affichant le type de contenu plutôt que la rubrique (get-home-analyses.ts).
export function AnalysisCard({ item }: { item: HomeAnalyseItem }) {
  return (
    <article className="flex gap-4 rounded-[6px] border border-border bg-bg-secondary p-4 transition-colors duration-fast hover:border-accent-primary">
      <Link
        href={`/articles/${item.slug}`}
        className="relative block w-[120px] shrink-0 self-stretch overflow-hidden rounded-[4px] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
      >
        <Image src={item.imagePrincipaleUrl} alt={item.imageAltText} fill sizes="120px" className="object-cover" />
      </Link>

      <div className="flex flex-1 flex-col gap-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-[.1em] text-accent-primary">
          {item.typeLabel} · {item.zoneNom}
        </p>

        <h3 className="font-editorial text-lg font-semibold leading-tight">
          <Link
            href={`/articles/${item.slug}`}
            className="outline-none transition-colors duration-fast hover:text-accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
          >
            {item.titre}
          </Link>
        </h3>

        {item.chapo && <p className="line-clamp-2 text-[13px] leading-relaxed text-text-secondary">{item.chapo}</p>}

        <p className="mt-auto text-xs text-text-secondary">
          {item.auteur && <>{item.auteur} · </>}
          {item.tempsLecture}
        </p>
      </div>
    </article>
  );
}
