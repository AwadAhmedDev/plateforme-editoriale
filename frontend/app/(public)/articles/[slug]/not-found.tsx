import Link from "next/link";

// Page dédiée "contenu introuvable" (DR-001) — atteinte pour un slug
// inexistant ou un article revenu au statut Brouillon, jamais pour un
// Archivé. Message factuel, un seul lien de retour vers l'Accueil (la page
// Recherche n'existe pas encore, cf. contrat L3 §8).
export default function ArticleDetailNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center gap-4 px-5 py-16 text-center">
      <h1 className="font-editorial text-2xl">Contenu introuvable</h1>
      <p className="text-text-secondary">Cet article n&apos;existe pas ou n&apos;est plus disponible.</p>
      <Link
        href="/"
        className="text-accent-primary transition-colors duration-fast hover:text-accent-primary-hover"
      >
        Retour à l&apos;Accueil
      </Link>
    </main>
  );
}
