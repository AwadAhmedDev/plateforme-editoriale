import { ImageResponse } from "next/og";

// Image d'aperçu par défaut (réseaux sociaux), référencée par app/layout.tsx. Route
// handler plutôt que la convention opengraph-image.tsx : celle-ci écraserait les images
// propres à chaque article (le file-based metadata prime sur generateMetadata).
export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#141210",
          color: "#ffffff",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 6, textTransform: "uppercase", color: "#e0705a" }}>
          Information indépendante · francophone · documentée
        </div>
        <div style={{ fontSize: 96, fontWeight: 800, marginTop: 24 }}>Corne de l&apos;Afrique</div>
        <div style={{ fontSize: 36, marginTop: 24, color: "#c8c2b6" }}>
          Actualité, analyses et documentation sur la Corne de l&apos;Afrique
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
