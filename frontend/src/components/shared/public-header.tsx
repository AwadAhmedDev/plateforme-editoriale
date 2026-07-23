import Link from "next/link";
import { listCategorieMenu } from "@/features/taxonomies/list-categorie-menu";
import { listZoneMenu } from "@/features/taxonomies/list-zone-menu";
import { aProposContent } from "../../../app/(public)/a-propos/content";
import { MobileHeaderControls } from "@/components/shared/mobile-header-controls";

// Header public (Lot 6.1, contrat consolidé) : 100% Server Component,
// asynchrone (charge catégories/zones via les mêmes fonctions déjà
// utilisées par FooterTaxonomies, enveloppées dans React.cache() — une
// seule requête base de données par fonction et par requête HTTP malgré
// l'appel indépendant du footer). Hauteur pilotée par les tokens
// --header-height-mobile/--header-height-desktop (app/globals.css),
// partagés avec l'offset sticky de ShareBar.
//
// Ordre non négociable (conforme aux 9 écrans du wireframe Claude Design) :
// Logo → Catégories → Zones géographiques → À propos → Recherche → CTA.
// Catégories/Zones en <details>/<summary> natif (zéro JS) — couvre le
// "clic" de l'exigence "au survol/clic" de ui-specification.md. À propos
// en lien plat, sans menu. Destination des menus : /categorie/[slug] et
// /zone/[slug] (pages éditoriales canoniques), jamais /recherche?categorie=
// — cf. décision L11 documentée dans recherche/page.tsx (les combinaisons
// de filtres sont des résultats utilisateur, pas des pages permanentes).
// Chaque menu est omis entièrement si sa liste est vide — jamais un
// <details> sans contenu.
//
// Recherche : formulaire GET natif vers /recherche, seul paramètre `q`,
// aucun bouton visible (conforme au wireframe) — visible en desktop
// uniquement (lg et au-delà) ; sous lg, remplacée par l'icône + overlay de
// MobileHeaderControls (Lot 6.2), qui réutilise ce même formulaire.
//
// Menu mobile (Catégories/Zones/À propos/Contact/S'abonner, panneau plein
// écran) livré par MobileHeaderControls (Lot 6.2, contrat technique) — seul
// Client Component du header, recevant les données déjà chargées ici en
// props.
//
// Hors périmètre assumé (contrat consolidé §8) : item de navigation actif,
// fermeture au clavier/clic extérieur des <details> desktop.
export async function PublicHeader() {
  const [categories, zones] = await Promise.all([listCategorieMenu(), listZoneMenu()]);

  return (
    <header className="sticky top-0 z-40 flex h-(--header-height-mobile) items-center gap-4 bg-accent-primary px-5 lg:h-(--header-height-desktop) lg:justify-between lg:px-15">
      <Link
        href="/"
        className="font-editorial text-lg font-medium text-white outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        Corne de l&apos;Afrique
      </Link>

      <nav aria-label="Navigation principale" className="hidden lg:flex lg:items-center">
        <ul className="flex items-center gap-6">
          {categories.length > 0 && (
            <li>
              <details className="relative">
                <summary className="cursor-pointer list-none text-sm text-white/80 outline-none [&::-webkit-details-marker]:hidden hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                  Catégories
                </summary>
                <ul className="absolute left-0 top-full z-50 mt-2 min-w-40 rounded-sm border border-border bg-bg-primary p-2 shadow-lg">
                  {categories.map((categorie) => (
                    <li key={categorie.slug}>
                      <Link
                        href={`/categorie/${categorie.slug}`}
                        className="block rounded-sm px-3 py-2 text-sm text-text-secondary outline-none transition-colors duration-fast hover:text-accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
                      >
                        {categorie.nom}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          )}

          {zones.length > 0 && (
            <li>
              <details className="relative">
                <summary className="cursor-pointer list-none text-sm text-white/80 outline-none [&::-webkit-details-marker]:hidden hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                  Zones géographiques
                </summary>
                <ul className="absolute left-0 top-full z-50 mt-2 min-w-40 rounded-sm border border-border bg-bg-primary p-2 shadow-lg">
                  {zones.map((zone) => (
                    <li key={zone.slug}>
                      <Link
                        href={`/zone/${zone.slug}`}
                        className="block rounded-sm px-3 py-2 text-sm text-text-secondary outline-none transition-colors duration-fast hover:text-accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
                      >
                        {zone.nom}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          )}

          <li>
            <Link
              href="/a-propos"
              className="text-sm text-white/80 outline-none transition-colors duration-fast hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              À propos
            </Link>
          </li>
        </ul>
      </nav>

      <form
        role="search"
        action="/recherche"
        method="GET"
        className="hidden lg:flex lg:max-w-55 lg:flex-none"
      >
        <label htmlFor="header-search-q" className="sr-only">
          Rechercher un article
        </label>
        <input
          id="header-search-q"
          type="search"
          name="q"
          placeholder="Rechercher…"
          className="h-9 w-full rounded-full border border-border bg-bg-primary px-4 text-sm text-text-primary outline-none placeholder:text-text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
        />
      </form>

      <Link
        href="/newsletter"
        className="hidden rounded-sm bg-accent-warm px-5 py-2 text-sm font-medium text-white outline-none transition-colors duration-120 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary lg:inline-block"
      >
        S&apos;abonner
      </Link>

      <MobileHeaderControls
        categories={categories}
        zones={zones}
        ctaHref="/newsletter"
        contactEmail={aProposContent.contact.email}
      />
    </header>
  );
}
