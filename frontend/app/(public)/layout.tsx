import Link from "next/link";
import { PublicHeader } from "@/components/shared/public-header";
import { FooterTaxonomies } from "@/components/shared/footer-taxonomies";
import { NewsletterForm } from "@/features/newsletter/newsletter-form";

// Layout de l'espace public (Lot L0A Étape 1, frontend-specification.md
// §Layouts) : fournit uniquement le chrome partagé (header + footer) dans un
// conteneur neutre autour de {children} — jamais de balise <main> ici (audit
// « Double landmark <main> » validé : chaque page publique reste seule
// responsable de son unique <main>, à l'image exacte de
// app/admin/(protected)/layout.tsx, qui applique déjà ce même principe côté
// admin — sa <div className="flex-1"> autour de {children}, jamais un <main>).
//
// Header délégué à PublicHeader (Lot REPO-3) : voir ce fichier pour le détail
// de sa structure. Server Component pur, aucune interactivité cliente au
// niveau de ce layout lui-même (le bandeau newsletter et le footer en
// contiennent, via NewsletterForm et FooterTaxonomies respectivement).
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-bg-primary font-ui text-text-primary">
      <a
        href="#contenu-principal"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-accent-primary focus:px-4 focus:py-2 focus:text-white"
      >
        Aller au contenu principal
      </a>

      <PublicHeader />

      <div id="contenu-principal" className="flex flex-1 flex-col">
        {children}
      </div>

      {/* Bandeau newsletter sitewide (REPO-8, B27) : sur toutes les pages
          publiques, pas seulement l'Accueil — juste avant le footer, fond
          sombre partagé avec lui (design l.436-455). */}
      <section className="bg-[#1b1915]">
        <div className="mx-auto grid max-w-[1220px] gap-8 px-5 py-10 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-10 lg:px-[28px] lg:py-12">
          <div>
            <h2 className="font-editorial text-[28px] font-bold leading-[1.15] text-white">Recevez nos publications</h2>
            <p className="mt-2.5 max-w-[52ch] text-[15px] text-[#c8c2b6]">
              Analyses, enquêtes et actualités sur la Corne de l&apos;Afrique, directement dans votre boîte. Une
              édition par semaine, sans publicité.
            </p>
          </div>

          <NewsletterForm variant="banner" />
        </div>
      </section>

      {/* Footer 4 colonnes (REPO-8, B26, design l.457-488 ; Contact/Méthodologie
          livrées en REPO-7) : marque / Rubriques (FooterTaxonomies) / Pays
          (FooterTaxonomies) / Le média. Mentions légales reste un lien mort
          (aucune page dédiée pour l'instant, hors périmètre de REPO-7).
          Abonnement pointe vers /newsletter : l'abonnement payant du design
          est hors périmètre MVP (AGENTS.md §MVP scope), la newsletter
          gratuite en est l'équivalent fonctionnel le plus proche. "À propos"
          ajoutée en plus des liens du design (D4, plan-implementation-
          repositionnement-asile.md §D0) : la page existe, n'est référencée
          nulle part dans le design, mais reste accessible via ce lien plutôt
          que retirée de toute navigation. */}
      <footer className="bg-[#141210] text-[14px] text-[#c8c2b6]">
        <div className="mx-auto grid max-w-[1220px] grid-cols-1 gap-9 px-5 pb-7 pt-12 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:px-[28px]">
          <div>
            <div className="font-editorial text-[22px] font-extrabold text-white">Corne de l&apos;Afrique</div>
            <p className="mt-3 max-w-[34ch] leading-[1.6] text-[#9a9484]">
              Le média francophone de référence sur la Corne de l&apos;Afrique : information vérifiée, analyses
              géopolitiques, juridiques et culturelles, documentation.
            </p>
          </div>

          <FooterTaxonomies />

          <nav aria-label="Le média">
            <p className="mb-3.5 text-[11px] font-semibold uppercase tracking-[.14em] text-[#8c8678]">Le média</p>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link href="/recherche" className="block text-left text-[#c8c2b6] outline-none transition-colors duration-fast hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                  Recherche documentaire
                </Link>
              </li>
              <li>
                <Link href="/newsletter" className="block text-left text-[#c8c2b6] outline-none transition-colors duration-fast hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                  Abonnement
                </Link>
              </li>
              <li>
                <Link href="/contact" className="block text-left text-[#c8c2b6] outline-none transition-colors duration-fast hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/methodologie" className="block text-left text-[#c8c2b6] outline-none transition-colors duration-fast hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                  Méthodologie
                </Link>
              </li>
              <li>
                <Link href="/mentions-legales" className="block text-left text-[#c8c2b6] outline-none transition-colors duration-fast hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/conditions-generales" className="block text-left text-[#c8c2b6] outline-none transition-colors duration-fast hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                  Conditions générales
                </Link>
              </li>
              <li>
                <Link href="/confidentialite" className="block text-left text-[#c8c2b6] outline-none transition-colors duration-fast hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                  Confidentialité
                </Link>
              </li>
              <li>
                <Link href="/a-propos" className="block text-left text-[#c8c2b6] outline-none transition-colors duration-fast hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                  À propos
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="border-t border-[#2a2622]">
          <div className="mx-auto flex max-w-[1220px] flex-wrap justify-between gap-2 px-5 py-4.5 text-[12px] text-[#8c8678] lg:px-[28px]">
            <span>© 2026 Corne de l&apos;Afrique — Tous droits réservés</span>
            <span>Information indépendante · francophone · documentée</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
