import type { NextConfig } from "next";

// `images.remotePatterns` pour le domaine public Cloudflare R2 (module Média, Lot 6) —
// dérivé de R2_PUBLIC_URL, jamais codé en dur. Absence tolérée : si la variable n'est pas
// encore configurée (aucun identifiant inventé, décision d'architecture validée),
// `remotePatterns` reste vide plutôt que de faire échouer le build.
const r2PublicUrl = process.env.R2_PUBLIC_URL;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: r2PublicUrl
      ? [
          {
            protocol: "https",
            hostname: new URL(r2PublicUrl).hostname,
            pathname: "/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
