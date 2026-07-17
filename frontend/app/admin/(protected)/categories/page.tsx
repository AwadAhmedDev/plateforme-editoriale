import { listCategories } from "@/features/taxonomies/list-categories";
import { CategoryCreateForm } from "@/features/taxonomies/category-create-form";
import { CategoryTable } from "@/features/taxonomies/category-table";

// Gestion des catégories MVP (sitemap.md, api-contracts.md §2.3, server-actions-specification.md
// §4) : liste + création + modification + suppression conditionnée. Zone géographique
// (symétrique) hors périmètre de cette itération. Sidebar et navigation différées.
export default async function AdminCategoriesPage() {
  const categories = await listCategories();

  return (
    <main className="p-7">
      <h1 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-50">Gestion des catégories</h1>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Ajouter une catégorie</h2>
        <CategoryCreateForm />
      </section>

      {categories.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Aucune catégorie créée. Utilisez le formulaire ci-dessus pour en ajouter une.
        </p>
      ) : (
        <CategoryTable categories={categories} />
      )}
    </main>
  );
}
