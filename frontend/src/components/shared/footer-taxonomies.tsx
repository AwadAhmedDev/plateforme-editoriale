import Link from "next/link";
import { listCategorieMenu } from "@/features/taxonomies/list-categorie-menu";
import { listZoneMenu } from "@/features/taxonomies/list-zone-menu";

// Composant serveur (Lot L8e.2, contrat validé) : liens statiques vers les
// catégories et zones géographiques existantes, rendu dans le footer de
// PublicLayout — à côté de, jamais à l'intérieur de, la nav "Pied de page"
// existante (deux landmarks nav distincts). Aucune interactivité, aucun
// composant client, aucun état React. Bloc (ou sous-bloc) omis si la liste
// correspondante est vide — jamais un titre de section sans contenu.
export async function FooterTaxonomies() {
  const [categories, zones] = await Promise.all([listCategorieMenu(), listZoneMenu()]);

  if (categories.length === 0 && zones.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 flex flex-wrap gap-8">
      {categories.length > 0 && (
        <nav aria-label="Catégories">
          <p className="mb-2 font-meta text-[13px] uppercase text-text-secondary">Catégories</p>
          <ul className="flex flex-wrap gap-4">
            {categories.map((categorie) => (
              <li key={categorie.slug}>
                <Link
                  href={`/categorie/${categorie.slug}`}
                  className="transition-colors duration-[120ms] hover:text-accent-primary"
                >
                  {categorie.nom}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {zones.length > 0 && (
        <nav aria-label="Zones géographiques">
          <p className="mb-2 font-meta text-[13px] uppercase text-text-secondary">Zones géographiques</p>
          <ul className="flex flex-wrap gap-4">
            {zones.map((zone) => (
              <li key={zone.slug}>
                <Link
                  href={`/zone/${zone.slug}`}
                  className="transition-colors duration-[120ms] hover:text-accent-primary"
                >
                  {zone.nom}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
