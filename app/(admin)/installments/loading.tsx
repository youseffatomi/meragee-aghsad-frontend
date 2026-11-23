/**
 * Matches the installments page: a title row, a filter card and a grid of
 * installment cards, so the real content does not shift when the data lands.
 *
 * This boundary lives on the page segment itself. A boundary up in the layout
 * does not cover client navigations between sibling pages, and without one the
 * page's request-time reads would block the navigation instead of streaming.
 */

const FILTERS = [0, 1, 2, 3] as const;
const CARDS = [0, 1, 2, 3, 4, 5] as const;

export default function InstallmentsLoading() {
  return (
    <div className="flex animate-pulse flex-col gap-6" aria-hidden="true">
      <div className="space-y-2">
        <div className="h-5 w-32 rounded-full bg-surface-muted" />
        <div className="h-3 w-56 rounded-full bg-surface-muted" />
      </div>

      <div className="rounded-card border border-line bg-surface p-4 shadow-card sm:p-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-12">
          {FILTERS.map((filter) => (
            <div
              key={filter}
              className="col-span-2 h-10 rounded-field bg-surface-muted lg:col-span-3"
            />
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {CARDS.map((card) => (
            <div
              key={card}
              className="flex h-56 flex-col gap-3 rounded-field border border-line bg-surface p-4"
            >
              <div className="h-4 w-1/3 rounded-full bg-surface-muted" />
              <div className="h-8 w-2/3 rounded-full bg-surface-muted" />
              <div className="h-5 w-full rounded-field bg-surface-sunken" />
              <div className="mt-auto h-9 w-full rounded-field bg-surface-sunken" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
