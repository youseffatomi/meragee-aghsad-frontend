/**
 * Matches the financial report: title row, filter card, three KPI rows, a
 * chart pair and two table rows. The skeleton mirrors those blocks so the real
 * content does not jump when the parallel reads land.
 */

const KPIS = [0, 1, 2, 3] as const;
const ROWS = [0, 1, 2] as const;

export default function ReportsLoading() {
  return (
    <div className="flex animate-pulse flex-col gap-6" aria-hidden="true">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="h-5 w-32 rounded-full bg-surface-muted" />
          <div className="h-3 w-64 rounded-full bg-surface-muted" />
        </div>
        <div className="h-11 w-44 rounded-field bg-surface-muted" />
      </div>

      <div className="rounded-card border border-line bg-surface p-4 shadow-card sm:p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {KPIS.map((item) => (
            <div key={item} className="h-11 rounded-field bg-surface-muted" />
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          {KPIS.map((item) => (
            <div key={item} className="h-8 w-20 rounded-full bg-surface-sunken" />
          ))}
        </div>
      </div>

      {ROWS.map((row) => (
        <div key={row} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {KPIS.map((card) => (
            <div
              key={card}
              className="flex h-32 flex-col gap-3 rounded-card border border-line bg-surface p-4"
            >
              <div className="h-3 w-1/2 rounded-full bg-surface-muted" />
              <div className="mt-2 h-7 w-2/3 rounded-full bg-surface-muted" />
              <div className="mt-auto h-3 w-1/3 rounded-full bg-surface-sunken" />
            </div>
          ))}
        </div>
      ))}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="h-96 rounded-card border border-line bg-surface xl:col-span-2" />
        <div className="h-96 rounded-card border border-line bg-surface" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="h-72 rounded-card border border-line bg-surface" />
        <div className="h-72 rounded-card border border-line bg-surface" />
      </div>
    </div>
  );
}
