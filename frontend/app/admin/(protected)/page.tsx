// Placeholder technique, sans donnée métier : sert uniquement à rendre le périmètre
// /admin/(protected)/* atteignable pour vérifier la garde de session (proxy.ts +
// layout.tsx). N'est pas le Dashboard (technical-architecture.md §2.1, Phase 4/5) —
// à retirer/remplacer lors de son implémentation, hors périmètre de la présente mission.
export default function ProtectedAdminPlaceholderPage() {
  return <p>Accès administrateur vérifié.</p>;
}
