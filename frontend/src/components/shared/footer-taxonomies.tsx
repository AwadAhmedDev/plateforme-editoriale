import Link from "next/link";
import { listCategorieMenu } from "@/features/taxonomies/list-categorie-menu";
import { listZoneMenu } from "@/features/taxonomies/list-zone-menu";

const LIEN_COLONNE =
  "block text-left text-[#c8c2b6] outline-none transition-colors duration-fast hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

const TITRE_COLONNE = "mb-3.5 text-[11px] font-semibold uppercase tracking-[.14em] text-[#8c8678]";

// Colonnes "Rubriques" et "Pays" du footer (REPO-8, Corne de l'Afrique.dc.html
// l.464-475) : deux enfants directs du <> rendus comme grid items du footer
// (app/(public)/layout.tsx) — le parent est en `display:grid`, donc chaque
// colonne doit rester un enfant de premier niveau de la grille, jamais niché
// dans une div commune ici. Listes verticales simples sur tous les
// breakpoints (pas d'accordéon `<details>` : cohérent avec le choix REPO-3 de
// remplacer les menus taxonomiques par des listes plates plutôt que des
// disclosures, cf. mobile-header-controls.tsx). Colonne omise si sa liste est
// vide — jamais un titre sans contenu.
export async function FooterTaxonomies() {
  const [categories, zones] = await Promise.all([listCategorieMenu(), listZoneMenu()]);

  return (
    <>
      {categories.length > 0 && (
        <nav aria-label="Rubriques">
          <p className={TITRE_COLONNE}>Rubriques</p>
          <ul className="flex flex-col gap-2.5">
            {categories.map((categorie) => (
              <li key={categorie.slug}>
                <Link href={`/categorie/${categorie.slug}`} className={LIEN_COLONNE}>
                  {categorie.nom}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {zones.length > 0 && (
        <nav aria-label="Pays">
          <p className={TITRE_COLONNE}>Pays</p>
          <ul className="flex flex-col gap-2.5">
            {zones.map((zone) => (
              <li key={zone.slug}>
                <Link href={`/zone/${zone.slug}`} className={LIEN_COLONNE}>
                  {zone.nom}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  );
}
