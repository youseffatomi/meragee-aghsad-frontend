/**
 * Matches the users page: a title row, a search bar and a table of rows, so the
 * real content does not shift when the data lands.
 */

const ROWS = [0, 1, 2, 3, 4, 5, 6, 7] as const;

export default function UsersLoading() {
  return (
    <div className="flex animate-pulse flex-col gap-6" aria-hidden="true">
      <div className="space-y-2">
        <div className="h-5 w-32 rounded-full bg-surface-muted" />
        <div className="h-3 w-56 rounded-full bg-surface-muted" />
      </div>

      <div className="rounded-card border border-line bg-surface p-4 shadow-card sm:p-5">
        <div className="h-11 w-full rounded-field bg-surface-muted" />

        <div className="mt-5 flex flex-col gap-3">
          {ROWS.map((row) => (
            <div key={row} className="h-10 w-full rounded-field bg-surface-sunken" />
          ))}
        </div>
      </div>
    </div>
  );
}
