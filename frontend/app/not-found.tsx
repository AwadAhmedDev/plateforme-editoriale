import PublicLayout from "./(public)/layout";
import PublicNotFound from "./(public)/not-found";

// 404 des URL totalement inconnues (aucune route correspondante) : seule la racine
// app/not-found les intercepte. Réutilise le chrome public et la page 404 du groupe
// (public) plutôt que de dupliquer leur JSX.
export default function NotFound() {
  return (
    <PublicLayout>
      <PublicNotFound />
    </PublicLayout>
  );
}
