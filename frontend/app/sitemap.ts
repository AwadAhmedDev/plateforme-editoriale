import type { MetadataRoute } from "next";
import { resoudreSiteUrl } from "@/lib/site-url";
import { listPublishedArticleSlugs } from "@/features/articles/list-published-article-slugs";
import { listCategorieSlugs } from "@/features/taxonomies/list-categorie-slugs";
import { listZoneSlugs } from "@/features/taxonomies/list-zone-slugs";

// Sitemap V1 (Lot L7e, étendu en L8c/L8d/L9, 6.1, puis clôture RC-1) : routes
// publiques réellement existantes à ce jour. `/articles` n'y figure plus —
// page supprimée (redirection permanente vers /recherche, cf. next.config.ts) :
// elle n'avait aucun lien interne et faisait doublon avec /recherche sans
// filtre. Aucun accès repository direct ici, uniquement des features
// publiques de lecture (list-published-article-slugs.ts,
// list-categorie-slugs.ts, list-zone-slugs.ts). Revalidation à la demande
// déjà câblée via revalidatePath("/sitemap.xml") dans
// revalidate-article-surfaces.ts : aucune option de cache ajoutée ici.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = resoudreSiteUrl();
  const absoluteUrl = (path: string) => new URL(path, siteUrl).toString();

  const [articles, categories, zones] = await Promise.all([
    listPublishedArticleSlugs(),
    listCategorieSlugs(),
    listZoneSlugs(),
  ]);

  return [
    { url: absoluteUrl("/") },
    { url: absoluteUrl("/recherche") },
    { url: absoluteUrl("/a-propos") },
    { url: absoluteUrl("/methodologie") },
    { url: absoluteUrl("/contact") },
    { url: absoluteUrl("/mentions-legales") },
    { url: absoluteUrl("/confidentialite") },
    { url: absoluteUrl("/newsletter") },
    ...articles.map((article) => ({
      url: absoluteUrl(`/articles/${article.slug}`),
      lastModified: article.dateDerniereModification,
    })),
    ...categories.map((categorie) => ({
      url: absoluteUrl(`/categorie/${categorie.slug}`),
    })),
    ...zones.map((zone) => ({
      url: absoluteUrl(`/zone/${zone.slug}`),
    })),
  ];
}
