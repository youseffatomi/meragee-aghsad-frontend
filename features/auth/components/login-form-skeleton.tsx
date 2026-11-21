/**
 * Shown for the instant the login page waits on `?next=`.
 *
 * It mirrors the real form's rhythm — a heading, one field, one button — so the
 * card does not jump when the form replaces it.
 */
export function LoginFormSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-6" aria-hidden="true">
      <div className="space-y-2">
        <div className="mx-auto h-4 w-40 rounded-full bg-surface-muted" />
        <div className="mx-auto h-3 w-56 rounded-full bg-surface-muted" />
      </div>

      <div className="h-12 rounded-field bg-surface-muted" />
      <div className="h-12 rounded-field bg-surface-muted" />
    </div>
  );
}
