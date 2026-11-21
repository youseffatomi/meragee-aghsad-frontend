/**
 * The boundary around every page in the group.
 *
 * Pages assert their own permission, which reads the session, which is request
 * data — so without a boundary here the page segment would block on it. This
 * gives each navigation an immediate frame to render into while that resolves.
 *
 * The two bars stand in for the page title and its description, so the frame
 * matches `PageTitle` rather than approximating it.
 */
export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <div className="animate-pulse space-y-2">
        <div className="h-5 w-32 rounded-full bg-surface-muted" />
        <div className="h-3 w-56 rounded-full bg-surface-muted" />
      </div>

      <div className="h-64 animate-pulse rounded-card border border-line bg-surface-sunken" />
    </div>
  );
}
