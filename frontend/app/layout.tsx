import type { Metadata } from "next";
import { Spectral, Archivo } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { resoudreSiteUrl } from "@/lib/site-url";
import "./globals.css";

// Polices auto-hébergées via l'optimisation Next.js (frontend-specification.md
// §Performance) — remplace Geist/Geist Mono du scaffold create-next-app.
// Familles et poids alignés sur le design Claude Design (Lot 1, migration UI) :
// Spectral n'est pas une police variable sur Google Fonts, poids explicites
// requis par next/font/google — mêmes poids que ceux chargés par le design
// source (400/500/600/700/800, italique 400 pour le chapô d'article).
const spectral = Spectral({
  variable: "--font-spectral",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

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
  // Aperçu réseaux sociaux par défaut (app/og-image/route.tsx) ; les articles le remplacent.
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Corne de l'Afrique",
    images: [{ url: "/og-image", width: 1200, height: 630, alt: "Corne de l'Afrique" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${spectral.variable} ${archivo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        {/* Mesure d'audience sans cookie : aucun bandeau de consentement requis (CNIL). */}
        <Analytics />
      </body>
    </html>
  );
}
