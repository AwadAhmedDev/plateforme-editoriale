import type { Metadata } from "next";
import { Source_Serif_4, Public_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// Polices auto-hébergées via l'optimisation Next.js (frontend-specification.md
// §Performance) — remplace Geist/Geist Mono du scaffold create-next-app.
// IBM Plex Mono n'est pas une police variable sur Google Fonts : poids explicites
// (400/500, ui-specification.md §Typographie) requis par next/font/google.
const sourceSerif4 = Source_Serif_4({
  variable: "--font-source-serif-4",
  subsets: ["latin"],
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

// Résolution de l'URL absolue du site (Lot L7a, contrat validé) — point
// unique de vérité pour metadataBase, jamais recalculé route par route.
// SITE_URL présente → utilisée telle quelle. Absente en développement →
// repli sur http://localhost:3000 (valeur techniquement exacte, pas une
// donnée inventée). Absente en production → erreur explicite au chargement
// du module (donc dès `next build`, avant tout déploiement) plutôt qu'un
// repli silencieux vers localhost dans des URLs canoniques/Open Graph
// publiées.
function resoudreSiteUrl(): URL {
  const siteUrl = process.env.SITE_URL;
  if (siteUrl) {
    return new URL(siteUrl);
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SITE_URL doit être définie en production (canonical/Open Graph/Twitter en dépendent) — aucun repli n'est accepté hors développement."
    );
  }
  return new URL("http://localhost:3000");
}

// Titre/description provisoires — aucun nom de marque réel n'est fixé par le
// corpus documentaire (qui désigne le produit uniquement comme « le média »).
// Repris de la formulation déjà utilisée par les documents de spécification
// eux-mêmes (ex. ui-specification.md:1), à réviser dès qu'un nom définitif est
// arrêté par le porteur du produit — cf. rapport d'implémentation.
export const metadata: Metadata = {
  metadataBase: resoudreSiteUrl(),
  title: {
    default: "Plateforme éditoriale — Corne de l'Afrique",
    template: "%s | Plateforme éditoriale — Corne de l'Afrique",
  },
  description:
    "Média francophone consacré à l'actualité, l'analyse et la documentation sur la Corne de l'Afrique.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${sourceSerif4.variable} ${publicSans.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
