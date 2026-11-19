// JS et non TS : sur Hostinger (glibc < 2.29) Next 16.4 retombe sur SWC WASM et ne sait plus
// charger un next.config.ts — un .mjs est importé tel quel, sans transpilation.

// `images.remotePatterns` pour le domaine public Cloudflare R2 (module Média, Lot 6) —
// dérivé de R2_PUBLIC_URL, jamais codé en dur. Absence tolérée : si la variable n'est pas
// encore configurée (aucun identifiant inventé, décision d'architecture validée),
// `remotePatterns` reste vide plutôt que de faire échouer le build.
const r2PublicUrl = process.env.R2_PUBLIC_URL;

/** @type {import("next").NextConfig} */
const nextConfig = {
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

  // Limite de corps des Server Actions (Lot 0). Sans cette clé, Next applique 1 Mo
  // (`defaultBodySizeLimit`, app-render/action-handler.js) : le compteur de corps rejette
  // la requête AVANT l'invocation de l'action, donc avant `ensureAdministrateurAuthentifie`,
  // avant Zod, et surtout avant le contrôle des 5 Mo de src/lib/media/upload-image.ts —
  // dont le message d'erreur était de ce fait structurellement inatteignable. Le rejet
  // remonte en 500 et non en 413 (TODO assumé dans action-handler.js), donc à la frontière
  // d'erreur admin : l'écran d'édition entier était remplacé, au lieu du message en ligne
  // du formulaire Image.
  //
  // 6 Mo et non 5 : le compteur mesure le CORPS ENTIER (fichier + imageAltText +
  // délimiteurs multipart + encodage de l'action RSC), là où TAILLE_MAX_OCTETS n'encadre
  // que le fichier. `bytes.parse("5mb")` vaut exactement 5 242 880 — la valeur qu'upload-
  // image.ts accepte encore — donc une limite à "5mb" rejetterait un fichier de 5 Mo pile
  // pour le seul surcoût multipart. La marge rend aussi la bande 5–6 Mo fonctionnelle : le
  // corps passe, l'action s'exécute, et c'est ImageValidationError qui répond, en français
  // et sans quitter l'écran.
  //
  // PLAFOND DUR — ne jamais atteindre 10 Mo : proxy.ts déclare matcher ["/admin/:path*"],
  // donc tout POST de l'Éditeur traverse le proxy, dont Next clone le corps avec
  // `experimental.proxyClientMaxBodySize` (défaut 10 485 760). Au-delà, body-streams.js
  // TRONQUE le flux en silence (console.warn, jamais d'erreur) : on passerait d'un rejet
  // propre à un fichier corrompu sans message exploitable.
  //
  // Portée globale assumée (arbitrage validé) : Next 16.2.9 n'offre aucune granularité par
  // action, la limite couvre donc aussi subscribeNewsletter et submitContactMessage, qui
  // sont publiques et non authentifiées. Accepté au vu du contexte (administrateur unique,
  // validation Zod en tête de chaque action) ; à réexaminer si une surface publique
  // acceptant des fichiers apparaissait.
  // HSTS : Vercel redirige déjà HTTP → HTTPS ; cet en-tête interdit au navigateur de
  // retenter en HTTP pendant 2 ans (protection contre le downgrade SSL-strip).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
