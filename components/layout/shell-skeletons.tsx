/**
 * Placeholders for the shell's two asynchronous slots.
 *
 * They use the real footprints — the logo, four menu rows with their icon
 * tiles, the avatar and its two text lines, the header's two controls — so
 * nothing in the shell jumps when the session resolves.
 */

const ROWS = [1, 2, 3, 4] as const;

export function SidebarSkeleton() {
  return (
    <div
      className="flex h-full animate-pulse flex-col gap-stack px-3 pt-4 pb-4"
      aria-hidden="true"
    >
      <div className="h-9 w-24 rounded-field bg-surface-muted lg:h-11" />

      <div className="flex flex-col gap-1">
        {ROWS.map((row) => (
          <div key={row} className="flex h-11 items-center gap-2.5">
            <div className="size-9 shrink-0 rounded-tile bg-surface-muted" />
            <div className="h-3 w-24 rounded-full bg-surface-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AccountSkeleton() {
  return (
    <div className="flex min-w-0 animate-pulse items-center gap-2.5" aria-hidden="true">
      <div className="size-9 shrink-0 rounded-full bg-surface-muted sm:size-12" />

      <div className="hidden flex-col gap-1.5 sm:flex">
        <div className="h-3 w-24 rounded-full bg-surface-muted" />
        <div className="flex items-center gap-2">
          <div className="h-3.5 w-20 rounded-full bg-surface-muted" />
          <div className="h-4 w-14 rounded-full bg-surface-muted" />
        </div>
      </div>
    </div>
  );
}

export function ActionsSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-2.5" aria-hidden="true">
      <div className="h-9 w-20 rounded-field bg-surface-muted" />
      <div className="hidden h-6 w-px bg-line sm:block" />
      <div className="hidden h-11 w-44 rounded-field bg-surface-muted sm:block" />
    </div>
  );
}
