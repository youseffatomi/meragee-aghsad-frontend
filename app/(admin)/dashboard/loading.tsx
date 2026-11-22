/**
 * A skeleton that matches the dashboard's real footprint — three summary cards,
 * three stat cards, two tables — so the page does not jump when the data
 * arrives. It supersedes the generic `(admin)` skeleton for this route.
 */

const SUMMARY_CARDS = [0, 1, 2] as const;
const STAT_CARDS = [0, 1, 2] as const;
const TABLES = [0, 1] as const;

export default function DashboardLoading() {
  return (
    <div className="flex animate-pulse flex-col gap-6" aria-hidden="true">
      <div className="space-y-2">
        <div className="h-5 w-32 rounded-full bg-surface-muted" />
        <div className="h-3 w-56 rounded-full bg-surface-muted" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {SUMMARY_CARDS.map((card) => (
          <div key={card} className="h-56 rounded-card bg-surface-muted" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STAT_CARDS.map((card) => (
          <div key={card} className="h-32 rounded-card bg-surface-muted" />
        ))}
      </div>

      {TABLES.map((table) => (
        <div key={table} className="h-72 rounded-card bg-surface-muted" />
      ))}
    </div>
  );
}
