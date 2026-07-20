import type { MetadataRoute } from "next";
import { resoudreSiteUrl } from "@/lib/site-url";

// Fondation robots.txt (Lot L8a, contrat validé) : exclusion de /admin,
// référencement du sitemap déjà produit par app/sitemap.ts (L7e). Aucune
// couche métier — resoudreSiteUrl (src/lib/site-url.ts, L7d) est l'unique
// dépendance, même point unique de vérité que metadataBase et sitemap.ts.
export default function robots(): MetadataRoute.Robots {
  const siteUrl = resoudreSiteUrl();

  return {
    rules: {
      userAgent: "*",
      disallow: "/admin",
    },
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
  };
}
