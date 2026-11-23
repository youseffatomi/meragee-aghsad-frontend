/**
 * Matches the products page: a title row, a search bar and a grid of cards, so
 * the real content does not shift when the data lands.
 */

const CARDS = [0, 1, 2, 3, 4, 5, 6, 7] as const;

export default function ProductsLoading() {
  return (
    <div className="flex animate-pulse flex-col gap-6" aria-hidden="true">
      <div className="space-y-2">
        <div className="h-5 w-32 rounded-full bg-surface-muted" />
        <div className="h-3 w-56 rounded-full bg-surface-muted" />
      </div>

      <div className="rounded-card border border-line bg-surface p-4 shadow-card sm:p-5">
        <div className="h-11 w-full rounded-field bg-surface-muted" />

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {CARDS.map((card) => (
            <div
              key={card}
              className="flex flex-col overflow-hidden rounded-card border border-line"
            >
              <div className="aspect-[4/3] w-full bg-surface-muted" />
              <div className="flex flex-col gap-3 p-4">
                <div className="h-4 w-2/3 rounded-full bg-surface-muted" />
                <div className="h-3 w-1/3 rounded-full bg-surface-sunken" />
                <div className="h-3 w-1/2 rounded-full bg-surface-sunken" />
                <div className="mt-2 h-9 w-full rounded-field bg-surface-sunken" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
