import Link from "next/link";
import type { ContactMessageListItem } from "@/features/contact/list-contact-messages";

const PAGE_SIZE = 20;

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

// Table Gestion contact (REPO-7, D6 : consultation admin seule — pas de suppression ni de
// filtre demandés, contrairement à SubscriberTable). Server Component pur : aucune
// interactivité cliente n'étant nécessaire, la pagination est de simples liens `<Link>`
// plutôt qu'une navigation programmatique.
export function ContactMessageTable({
  messages,
  total,
  page,
}: {
  messages: ContactMessageListItem[];
  total: number;
  page: number;
}) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">{total} message{total > 1 ? "s" : ""}</p>

      {messages.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Aucun message pour le moment.</p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-[12px] font-mono uppercase text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <th className="py-2">Date</th>
              <th className="py-2">Nom</th>
              <th className="py-2">Courriel</th>
              <th className="py-2">Objet</th>
              <th className="py-2">Message</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((item) => (
              <tr key={item.id} className="border-b border-zinc-100 align-top dark:border-zinc-800">
                <td className="whitespace-nowrap py-3 pr-4">{formatDate(item.createdAt)}</td>
                <td className="py-3 pr-4">{item.nom}</td>
                <td className="py-3 pr-4">{item.email}</td>
                <td className="py-3 pr-4">{item.objet}</td>
                <td className="max-w-[420px] whitespace-pre-wrap py-3">{item.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-4 flex gap-2">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
            <Link
              key={pageNumber}
              href={`/admin/contact?page=${pageNumber}`}
              aria-current={pageNumber === page ? "page" : undefined}
              className={`flex h-9 w-9 items-center justify-center rounded-md border text-sm ${
                pageNumber === page
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                  : "border-zinc-300 text-zinc-900 dark:border-zinc-700 dark:text-zinc-100"
              }`}
            >
              {pageNumber}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
