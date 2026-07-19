import Link from "next/link";

// Composant partagé (Lot L1, contrat révisé §D/§D') : fil d'Ariane desktop +
// lien "← Retour" mobile, un seul composant, bascule par media query — jamais
// de détection JavaScript de taille d'écran (même principe que
// app/admin/(protected)/layout.tsx). Nombre de segments variable (2 à 4 selon
// l'écran), jamais figé.
//
// Lien mobile : cible le href de l'avant-dernier segment (niveau parent
// immédiat), jamais un retour d'historique navigateur — validé par l'audit
// « Breadcrumb mobile » (précédent de code réel : app/admin/(protected)/
// articles/[id]/page.tsx, lien statique vers une route canonique fixe).
// Le cas `items.length < 2` n'est pas spécifié par le contrat (aucun
// consommateur actuel ne le produit) : le lien mobile n'est simplement pas
// rendu dans ce cas, pour éviter une erreur d'exécution — ce n'est pas une
// règle produit, seulement une garde technique.
export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  const parent = items.length >= 2 ? items[items.length - 2] : undefined;

  return (
    <>
      <nav aria-label="Fil d'Ariane" className="hidden lg:block">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-text-secondary">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={`${item.label}-${index}`} className="flex items-center gap-1">
                {index > 0 && <span aria-hidden="true">/</span>}
                {isLast || !item.href ? (
                  <span aria-current={isLast ? "page" : undefined} className="text-text-primary">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="transition-colors duration-fast hover:text-accent-primary"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {parent?.href && (
        <Link
          href={parent.href}
          className="inline-block text-sm text-text-secondary transition-colors duration-fast hover:text-accent-primary lg:hidden"
        >
          ← Retour
        </Link>
      )}
    </>
  );
}
