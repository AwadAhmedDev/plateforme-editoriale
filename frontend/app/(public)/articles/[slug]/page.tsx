import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getArticleDetail } from "@/features/articles/get-article-detail";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { ShareBar } from "@/features/articles/share-bar";
import { CitationBlock } from "@/features/articles/citation-block";
import { construireCitation } from "@/features/articles/build-citation";
import { resoudreSiteUrl } from "@/lib/site-url";
import { serializeJsonLd } from "@/lib/json-ld";

// Route Détail d'un article (Lot L3, contrat révisé) : lecture via
// getArticleDetail uniquement — aucun accès repository ni Prisma direct ici.
// Fournit son propre <main> ; app/(public)/layout.tsx n'en pose pas (cf.
// audit « Double landmark <main> »). Ni barre de partage, ni contenus liés,
// ni generateMetadata/SEO/JSON-LD — hors périmètre de ce lot.
// Métadonnées minimales (Lot L6, contrat validé) : title/description
// uniquement — aucun canonical, openGraph, twitter, JSON-LD ni metadataBase.
// Réutilise getArticleDetail (déjà mémoïsé via React.cache() dans ce fichier
// source) : un seul accès base de données réel par requête, malgré l'appel
// indépendant depuis ArticleDetailPage. Si article est null, aucun title ni
// description n'est défini ici — héritage automatique des valeurs par défaut
// du layout racine, sans valeur inventée.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleDetail(slug);

  if (!article) {
    return {};
  }

  return {
    ...(article.titre ? { title: article.titre } : {}),
    ...(article.chapo ? { description: article.chapo } : {}),
    alternates: {
      canonical: `/articles/${slug}`,
    },
    openGraph: {
      type: "article",
      url: `/articles/${slug}`,
      ...(article.titre ? { title: article.titre } : {}),
      ...(article.chapo ? { description: article.chapo } : {}),
      ...(article.image
        ? {
            images: [
              {
                url: article.image.url,
                width: article.image.largeur,
                height: article.image.hauteur,
                alt: article.image.alt,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: article.image ? "summary_large_image" : "summary",
      ...(article.titre ? { title: article.titre } : {}),
      ...(article.chapo ? { description: article.chapo } : {}),
      ...(article.image ? { images: [article.image.url] } : {}),
    },
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleDetail(slug);

  if (!article) {
    notFound();
  }

  const dateFormatee = article.datePublicationAffichee?.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // JSON-LD (Lot L7d, contrat validé) : construit à partir de `article` déjà
  // chargé ci-dessus, aucun nouvel accès base de données. `absoluteUrl`
  // s'appuie sur le même point unique de vérité SITE_URL que `metadataBase`
  // (src/lib/site-url.ts) — non résolu automatiquement ici, contrairement à
  // l'API Metadata, d'où la construction manuelle via `new URL()`.
  const siteUrl = resoudreSiteUrl();
  const absoluteUrl = (path: string) => new URL(path, siteUrl).toString();

  const citation = article.titre
    ? construireCitation({
        titre: article.titre,
        auteur: article.auteur,
        dateFormatee: dateFormatee ?? null,
        url: absoluteUrl(`/articles/${slug}`),
      })
    : null;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    ...(article.titre ? { headline: article.titre } : {}),
    ...(article.chapo ? { description: article.chapo } : {}),
    ...(article.image ? { image: article.image.url } : {}),
    ...(article.auteur ? { author: { "@type": "Person", name: article.auteur } } : {}),
    ...(article.datePublicationAffichee
      ? { datePublished: article.datePublicationAffichee.toISOString() }
      : {}),
    dateModified: article.dateDerniereModification.toISOString(),
    mainEntityOfPage: absoluteUrl(`/articles/${slug}`),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: article.breadcrumb.map((segment, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: segment.label,
      ...(segment.href ? { item: absoluteUrl(segment.href) } : {}),
    })),
  };

  // Éléments de la ligne de métadonnées, construits uniquement à partir de ce
  // qui est réellement présent — jamais de placeholder, jamais `typeContenu`
  // (absent de la liste de contenu de sitemap.md pour cet écran).
  const metaItems: React.ReactNode[] = [];
  if (article.categorie) {
    metaItems.push(
      <Link
        key="categorie"
        href={`/categorie/${article.categorie.slug}`}
        className="transition-colors duration-fast hover:text-accent-primary"
      >
        {article.categorie.nom}
      </Link>
    );
  }
  if (article.zone) {
    metaItems.push(
      <Link
        key="zone"
        href={`/zone/${article.zone.slug}`}
        className="transition-colors duration-fast hover:text-accent-primary"
      >
        {article.zone.nom}
      </Link>
    );
  }
  if (article.auteur) {
    metaItems.push(<span key="auteur">{article.auteur}</span>);
  }
  if (dateFormatee) {
    metaItems.push(<span key="date">{dateFormatee}</span>);
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <main className="mx-auto w-full max-w-[680px] flex-1 px-5 py-8">
        <Breadcrumb items={article.breadcrumb} />

        <h1 className="mt-4 font-editorial text-4xl">{article.titre}</h1>

        {article.chapo && <p className="mt-3 font-ui text-lg text-text-secondary">{article.chapo}</p>}

        {metaItems.length > 0 && (
          <p className="mt-3 flex flex-wrap items-center gap-1 font-meta text-[13px] text-text-secondary">
            {metaItems.map((item, index) => (
              <span key={index} className="flex items-center gap-1">
                {index > 0 && <span aria-hidden="true">·</span>}
                {item}
              </span>
            ))}
          </p>
        )}

        {article.image && (
          <Image
            src={article.image.url}
            alt={article.image.alt}
            width={article.image.largeur}
            height={article.image.hauteur}
            sizes="680px"
            className="mt-6 h-auto w-full rounded-sm"
          />
        )}

        {article.titre && <ShareBar titre={article.titre} />}

        {citation && <CitationBlock citation={citation} />}

        {article.corps && (
          <div className="mt-6 whitespace-pre-wrap font-ui text-base leading-relaxed">{article.corps}</div>
        )}

        {article.sources && <p className="mt-6 text-sm text-text-secondary">{article.sources}</p>}

        {article.motsCles.length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-2 font-meta text-[13px] text-text-secondary">
            {article.motsCles.map((motCle) => (
              <li key={motCle} className="rounded-full border border-border px-3 py-1">
                {motCle}
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
