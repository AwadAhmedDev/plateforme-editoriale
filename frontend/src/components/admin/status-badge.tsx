// Pastille de statut en lecture seule, pour les tables (StatusPills reste le sélecteur de l'Éditeur).
const STYLES: Record<string, { label: string; className: string }> = {
  brouillon: {
    label: "Brouillon",
    className: "bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-950 dark:text-amber-300",
  },
  publie: {
    label: "Publié",
    className: "bg-green-50 text-green-800 ring-green-600/20 dark:bg-green-950 dark:text-green-300",
  },
  archive: {
    label: "Archivé",
    className: "bg-zinc-100 text-zinc-700 ring-zinc-500/20 dark:bg-zinc-800 dark:text-zinc-300",
  },
};

export function StatusBadge({ statut }: { statut: string }) {
  const style = STYLES[statut] ?? { label: statut, className: STYLES.archive.className };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style.className}`}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      {style.label}
    </span>
  );
}
