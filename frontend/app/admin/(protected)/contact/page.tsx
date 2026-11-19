import { listContactMessages } from "@/features/contact/list-contact-messages";
import { ContactMessageTable } from "@/features/contact/contact-message-table";

// Gestion des messages de contact (REPO-7, D6 : stockage en base + consultation admin).
// Même patron que app/admin/(protected)/newsletter/page.tsx : page fine, la donnée vient
// d'une fonction de lecture dédiée, l'affichage d'un composant de table séparé.
export default async function AdminContactPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const result = await listContactMessages({ page });

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <h1 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-50">Messages de contact</h1>

      <ContactMessageTable messages={result.items} total={result.total} page={result.page} />
    </main>
  );
}
