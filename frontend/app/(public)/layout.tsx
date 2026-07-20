import Link from "next/link";
import { FooterTaxonomies } from "@/components/shared/footer-taxonomies";

// Layout de l'espace public (Lot L0A Étape 1, frontend-specification.md
// §Layouts) : fournit uniquement le chrome partagé (header + footer) dans un
// conteneur neutre autour de {children} — jamais de balise <main> ici (audit
// « Double landmark <main> » validé : chaque page publique reste seule
// responsable de son unique <main>, à l'image exacte de
// app/admin/(protected)/layout.tsx, qui applique déjà ce même principe côté
// admin — sa <div className="flex-1"> autour de {children}, jamais un <main>).
//
// Contenu volontairement réduit à ce qui est réellement résolvable aujourd'hui :
// aucun menu Catégories/Zones, aucun champ de recherche, aucun lien À
// propos/Contact (pages inexistantes, cf. ui-specification.md §Navigation
// principale) ; aucun menu mobile (rien à révéler tant que ces pages
// n'existent pas). Server Component pur, aucune interactivité cliente.
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

      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-bg-primary px-5 lg:h-16 lg:px-15">
        <Link href="/" className="font-editorial text-lg font-medium text-text-primary">
          Corne de l&apos;Afrique
        </Link>
        <Link
          href="/newsletter"
          className="rounded-sm bg-accent-warm px-5 py-2 text-sm font-medium text-white transition-colors duration-[120ms] hover:opacity-90"
        >
          S&apos;abonner
        </Link>
      </header>

      <div id="contenu-principal" className="flex flex-1 flex-col">
        {children}
      </div>

      <footer className="border-t border-border bg-bg-secondary px-5 py-8 text-sm text-text-secondary lg:px-15">
        <nav aria-label="Pied de page" className="flex flex-wrap gap-6">
          <Link href="/" className="transition-colors duration-[120ms] hover:text-accent-primary">
            Accueil
          </Link>
          <Link href="/articles" className="transition-colors duration-[120ms] hover:text-accent-primary">
            Articles
          </Link>
          <Link href="/newsletter" className="transition-colors duration-[120ms] hover:text-accent-primary">
            Newsletter
          </Link>
          <Link
            href="/confidentialite"
            className="transition-colors duration-[120ms] hover:text-accent-primary"
          >
            Politique de confidentialité
          </Link>
        </nav>

        <FooterTaxonomies />
      </footer>
    </div>
  );
}
