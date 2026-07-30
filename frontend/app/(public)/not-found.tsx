import Link from "next/link";

// Page 404 du groupe (public) (Lot 1B) : intercepte tout notFound() levé par une page
// publique sans not-found.tsx plus spécifique (ex. pagination hors bornes sur
// /articles, Lot 1A). Habillée automatiquement par app/(public)/layout.tsx via la
// composition de layout native de Next.js — aucun composant partagé créé, aucun JSX
// du layout déplacé ou dupliqué ici. Ne couvre pas les URL totalement inconnues (hors
// périmètre : seule la racine app/not-found.js a cette garantie, vérifié empiriquement
// avant ce lot) — décision assumée, pas un oubli. Même patron que
// articles/[slug]/not-found.tsx, categorie/[slug]/not-found.tsx, zone/[slug]/not-found.tsx :
// <main> dédié (chaque page publique reste seule responsable de son unique landmark
// <main>, cf. app/(public)/layout.tsx), un seul lien de retour.
export default function PublicNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center gap-4 px-5 py-16 text-center">
      <h1 className="font-editorial text-2xl">Page introuvable</h1>
      <p className="text-text-secondary">Cette page n&apos;existe pas ou n&apos;est plus disponible.</p>
      <Link
        href="/"
        className="text-accent-primary transition-colors duration-fast hover:text-accent-primary-hover"
      >
        Retour à l&apos;Accueil
      </Link>
    </main>
  );
}
