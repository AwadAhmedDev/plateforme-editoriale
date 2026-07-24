import Link from "next/link";
import { listCategorieMenu } from "@/features/taxonomies/list-categorie-menu";
import { listZoneMenu } from "@/features/taxonomies/list-zone-menu";

// Composant partagé (Lot Homepage, contrat validé) : accès direct aux
// catégories et zones géographiques existantes depuis l'Accueil, sous forme
// de Pills (ui-specification.md §Composants UI) — jamais une page d'index
// intermédiaire, chaque pill est un lien direct vers /categorie/[slug] ou
// /zone/[slug]. Server Component pur, aucune interactivité, aucun
// "use client" : appelle listCategorieMenu()/listZoneMenu() lui-même
// (Promise.all interne) — React.cache() déjà en place dans ces deux
// fonctions garantit la déduplication avec les appels indépendants de
// PublicHeader et FooterTaxonomies dans la même requête HTTP, sans passage
// de props depuis page.tsx (décision d'architecture validée : meilleur
// découplage Server-to-Server qu'un fetch centralisé dans la page).
//
// Le titre de section et l'espacement (mt-12) sont portés par ce composant,
// pas par page.tsx : page.tsx ne connaît pas l'état des données
// (catégories/zones vides ou non), il ne peut donc pas conditionner
// l'affichage d'un titre de section pour un contenu qu'il ne charge pas
// lui-même. Composant entièrement omis si catégories et zones sont toutes
// deux vides — jamais un titre de section sans contenu (même règle que
// FooterTaxonomies).
//
// Mobile comme desktop : défilement horizontal, jamais de retour à la
// ligne (décision produit validée) — règle unique appliquée à tous les
// breakpoints, aucun comportement desktop distinct non spécifié ailleurs.
export async function TaxonomyPills() {
  const [categories, zones] = await Promise.all([listCategorieMenu(), listZoneMenu()]);

  if (categories.length === 0 && zones.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <h2 className="font-editorial text-2xl">Catégories et zones géographiques</h2>

      <div className="mt-6 flex flex-col gap-6">
        {categories.length > 0 && (
          <nav aria-label="Catégories">
            <p className="mb-2 font-meta text-[13px] uppercase text-text-secondary">Catégories</p>
            <ul className="flex flex-nowrap gap-3 overflow-x-auto">
              {categories.map((categorie) => (
                <li key={categorie.slug} className="shrink-0">
                  <Link
                    href={`/categorie/${categorie.slug}`}
                    className="inline-block rounded-full border-2 border-border px-4 py-1.5 text-sm font-medium text-text-primary outline-none transition-colors duration-fast hover:border-accent-primary hover:text-accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
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
            <ul className="flex flex-nowrap gap-3 overflow-x-auto">
              {zones.map((zone) => (
                <li key={zone.slug} className="shrink-0">
                  <Link
                    href={`/zone/${zone.slug}`}
                    className="inline-block rounded-full border-2 border-border px-4 py-1.5 text-sm font-medium text-text-primary outline-none transition-colors duration-fast hover:border-accent-primary hover:text-accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
                  >
                    {zone.nom}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </section>
  );
}
