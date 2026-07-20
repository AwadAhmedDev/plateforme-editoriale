import Link from "next/link";

export default function CategoriePageNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center gap-4 px-5 py-16 text-center">
      <h1 className="font-editorial text-2xl">Contenu introuvable</h1>
      <p className="text-text-secondary">Cette catégorie n&apos;existe pas ou n&apos;est plus disponible.</p>
      <Link
        href="/"
        className="text-accent-primary transition-colors duration-fast hover:text-accent-primary-hover"
      >
        Retour à l&apos;Accueil
      </Link>
    </main>
  );
}
