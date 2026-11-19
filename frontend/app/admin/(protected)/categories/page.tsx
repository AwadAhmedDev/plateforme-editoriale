import { listCategories } from "@/features/taxonomies/list-categories";
import { listZones } from "@/features/taxonomies/list-zones";
import { CategoryCreateForm } from "@/features/taxonomies/category-create-form";
import { CategoryTable } from "@/features/taxonomies/category-table";
import { ZoneCreateForm } from "@/features/taxonomies/zone-create-form";
import { ZoneTable } from "@/features/taxonomies/zone-table";

// Gestion des catégories et zones géographiques MVP (sitemap.md, api-contracts.md
// §2.3-§2.4, server-actions-specification.md §4-§5) : un seul écran, deux sections
// symétriques (US-027) — liste + création + modification + suppression conditionnée
// pour chaque taxonomie. Sidebar et navigation différées.
export default async function AdminCategoriesPage() {
  const [categories, zones] = await Promise.all([listCategories(), listZones()]);

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <h1 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Gestion des catégories et zones géographiques
      </h1>

      <section className="mb-10">
        <h2 className="mb-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">Catégories</h2>

        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Ajouter une catégorie</h3>
          <CategoryCreateForm />
        </div>

        {categories.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Aucune catégorie créée. Utilisez le formulaire ci-dessus pour en ajouter une.
          </p>
        ) : (
          <CategoryTable categories={categories} />
        )}
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">Zones géographiques</h2>

        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Ajouter une zone géographique
          </h3>
          <ZoneCreateForm />
        </div>

        {zones.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Aucune zone géographique créée. Utilisez le formulaire ci-dessus pour en ajouter une.
          </p>
        ) : (
          <ZoneTable zones={zones} />
        )}
      </section>
    </main>
  );
}
