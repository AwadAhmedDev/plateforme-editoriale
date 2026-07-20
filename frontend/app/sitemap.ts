import type { MetadataRoute } from "next";
import { resoudreSiteUrl } from "@/lib/site-url";
import { listPublishedArticleSlugs } from "@/features/articles/list-published-article-slugs";

// Sitemap V1 (Lot L7e, contrat validé) : limité à / et /articles/{slug}
// publiés — seules routes publiques réellement existantes à ce jour.
// Revalidation à la demande déjà câblée via revalidatePath("/sitemap.xml")
// dans revalidate-article-surfaces.ts : aucune option de cache ajoutée ici.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = resoudreSiteUrl();
  const absoluteUrl = (path: string) => new URL(path, siteUrl).toString();

  const articles = await listPublishedArticleSlugs();

  return [
    { url: absoluteUrl("/") },
    ...articles.map((article) => ({
      url: absoluteUrl(`/articles/${article.slug}`),
      lastModified: article.dateDerniereModification,
    })),
  ];
}
