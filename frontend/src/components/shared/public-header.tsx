import Link from "next/link";
import { listCategorieMenu } from "@/features/taxonomies/list-categorie-menu";
import { listZoneMenu } from "@/features/taxonomies/list-zone-menu";
import { getTickerArticle } from "@/features/articles/get-ticker-article";
import { LanguageToggle } from "@/components/shared/language-toggle";
import { MobileHeaderControls } from "@/components/shared/mobile-header-controls";
import { HeaderHeightSync } from "@/components/shared/header-height-sync";

const LIEN_FOCUSABLE =
  "outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary";

// Header public (Lot REPO-3, refonte structurelle conforme à Corne de
// l'Afrique.dc.html l.33-83, contrat REPO-3M) : 100% Server Component,
// asynchrone. Quatre bandeaux empilés, dans l'ordre exact du fichier source :
// barre utilitaire (ticker + contact), barre principale (logo, nav plate,
// recherche, CTA), bandeau Pays, bandeau tagline. Hauteur non contrainte
// (plus de token --header-height-* sur cet élément, cf. audit REPO-3I/L) :
// le header occupe la hauteur réelle de ses 4 bandeaux. HeaderHeightSync
// (REPO-6) republie cette hauteur réelle dans --header-height à chaque
// changement de mise en page — seul consommateur actuel : la sidebar
// sticky de la page Recherche.
//
// Nav plate (6 rubriques, B7) : aucun état actif/courant, conforme au design
// (navStyle identique pour chaque item, aucune donnée "page courante" dans
// .dc.html). Bandeau Pays masqué si aucune zone n'existe (convention déjà en
// place dans le projet : une section sans donnée ne s'affiche pas).
//
// "Tous les articles" en tête de nav (révision d'architecture, rétablissement de
// /articles) : seule entrée de nav sans donnée dans .dc.html — dérogation assumée à la
// fidélité stricte du design, justifiée par sitemap.md (page "Liste des articles"
// documentée comme vue d'ensemble indépendante de /recherche, US-002/US-004). Appartient
// fonctionnellement à la navigation éditoriale (sur-ensemble des 6 rubriques, pas une
// action ni un CTA) : même traitement visuel qu'elles à l'identique (`navStyle` uniforme),
// aucune variante — seul le libellé le distingue.
//
// Sélecteur de langue FR/EN (design l.40-44) : omis, DIV-D3
// (regle-fidelite-design.md §6) — hors périmètre de ce lot.
//
// CTA "S'inscrire" : DIV-D7 (regle-fidelite-design.md §6), le design
// distingue "S'abonner" (abonnement payant, hors MVP) de "S'inscrire"
// (newsletter) — le libellé existant est aligné sur ce dernier.
export async function PublicHeader() {
  const [categories, zones, ticker] = await Promise.all([
    listCategorieMenu(),
    listZoneMenu(),
    getTickerArticle(),
  ]);

  return (
    <header
      id="site-header"
      className="sticky top-0 z-[60] border-b border-border bg-[rgba(246,243,236,0.94)] backdrop-blur-[10px]"
    >
      <style>{`.ticker-dot{animation:ticker-pulse 1.6s ease-in-out infinite}@keyframes ticker-pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
      <HeaderHeightSync />

      {/* Barre utilitaire : ticker + Contact (design l.34-47) */}
      <div className="mx-auto flex h-[38px] max-w-[1220px] items-center border-b border-border px-[28px] text-[12px] tracking-[.02em] text-text-secondary">
        {ticker && (
          <Link
            href={`/articles/${ticker.slug}`}
            className={`flex max-w-[52ch] items-center gap-[8px] overflow-hidden text-text-secondary hover:text-accent-primary ${LIEN_FOCUSABLE}`}
          >
            <span className="inline-flex flex-shrink-0 items-center gap-[6px] text-[11px] font-bold uppercase tracking-[.12em] text-accent-primary">
              <span aria-hidden="true" className="ticker-dot h-[7px] w-[7px] rounded-full bg-accent-primary" />
              En continu
            </span>
            <span className="overflow-hidden text-ellipsis whitespace-nowrap">{ticker.titre}</span>
          </Link>
        )}

        <div className="ml-auto flex items-center gap-[18px]">
          <LanguageToggle />

          <Link
            href="/contact"
            className={`font-medium text-text-secondary hover:text-text-secondary ${LIEN_FOCUSABLE}`}
          >
            Contact
          </Link>
        </div>
      </div>

      {/* Barre principale : logo, nav plate, recherche, CTA (design l.49-66) */}
      <div className="mx-auto flex max-w-[1220px] items-center justify-between gap-[20px] px-[28px] pb-[16px] pt-[18px]">
        <Link
          href="/"
          className={`flex flex-col gap-[2px] text-left font-editorial text-[28px] font-extrabold leading-none tracking-[-.01em] text-text-primary ${LIEN_FOCUSABLE}`}
        >
          Corne de l&apos;Afrique
        </Link>

        <nav aria-label="Navigation principale" className="hidden min-w-0 flex-1 flex-wrap items-center justify-center gap-[14px] lg:flex">
          <ul className="flex flex-wrap items-center justify-center gap-[14px]">
            <li className="flex-shrink-0">
              <Link
                href="/articles"
                className={`whitespace-nowrap text-[12px] font-medium tracking-[-.005em] text-text-secondary transition-colors duration-fast hover:text-accent-primary ${LIEN_FOCUSABLE}`}
              >
                Tous les articles
              </Link>
            </li>
            {categories.map((categorie) => (
              <li key={categorie.slug} className="flex-shrink-0">
                <Link
                  href={`/categorie/${categorie.slug}`}
                  className={`whitespace-nowrap text-[12px] font-medium tracking-[-.005em] text-text-secondary transition-colors duration-fast hover:text-accent-primary ${LIEN_FOCUSABLE}`}
                >
                  {categorie.nom}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-[12px] lg:flex">
          <Link
            href="/recherche"
            className={`flex items-center gap-[7px] rounded-full border border-border bg-bg-secondary px-[14px] py-[8px] text-[13px] text-text-secondary hover:border-accent-primary hover:text-accent-primary ${LIEN_FOCUSABLE}`}
          >
            <span aria-hidden="true" className="text-[15px]">
              ⌕
            </span>
            <span>Rechercher</span>
          </Link>
          <Link
            href="/newsletter"
            className={`rounded-full bg-accent-primary px-[18px] py-[9px] text-[13px] font-semibold tracking-[.01em] text-white hover:bg-accent-primary-hover ${LIEN_FOCUSABLE}`}
          >
            S&apos;inscrire
          </Link>
        </div>

        <MobileHeaderControls categories={categories} zones={zones} ctaHref="/newsletter" />
      </div>

      {/* Bandeau Pays (design l.68-77) */}
      {zones.length > 0 && (
        <div className="hidden border-t border-border bg-[#efeadf] lg:block">
          <div className="mx-auto flex max-w-[1220px] items-center gap-[8px] overflow-x-auto px-[28px] py-[9px]">
            <span className="mr-[6px] flex-shrink-0 text-[11px] font-semibold uppercase tracking-[.16em] text-[#8a8377]">
              Pays
            </span>
            {zones.map((zone) => (
              <Link
                key={zone.slug}
                href={`/zone/${zone.slug}`}
                className={`flex-shrink-0 rounded-full border border-border bg-bg-secondary px-[13px] py-[5px] text-[12.5px] text-text-secondary transition-colors duration-fast hover:border-accent-primary hover:text-accent-primary ${LIEN_FOCUSABLE}`}
              >
                {zone.nom}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bandeau tagline (design l.78-82) */}
      <div className="border-t border-border bg-bg-primary">
        <div className="mx-auto flex max-w-[1220px] items-center gap-[10px] px-[28px] py-[8px] text-[11.5px] font-semibold uppercase tracking-[.14em] text-[#8a8377]">
          <span className="text-left text-[14.5px] font-bold leading-[30.25px] text-accent-primary">
            Le média francophone de référence sur la Corne de l&apos;Afrique
          </span>
        </div>
      </div>
    </header>
  );
}
