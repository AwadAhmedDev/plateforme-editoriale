// Échappement JSON-LD partagé (Lot L12, contrat validé) : extrait de
// app/(public)/articles/[slug]/page.tsx (Lot L7d), comportement strictement
// identique — remplace tout "<" par son équivalent JSON <, ce qui
// empêche toute rupture de balise </script> si un champ éditorial (titre,
// chapo, nom de catégorie/zone...) contient littéralement cette séquence.
// Fonction de sécurité (anti-injection) : un point unique évite toute
// divergence future entre les pages qui sérialisent du JSON-LD.
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
