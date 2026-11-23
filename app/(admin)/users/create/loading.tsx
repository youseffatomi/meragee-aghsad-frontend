export default function CreateUserLoading() {
  return (
    <div className="flex animate-pulse flex-col gap-6" aria-hidden="true">
      <div className="space-y-2">
        <div className="h-3 w-28 rounded-full bg-surface-muted" />
        <div className="h-5 w-40 rounded-full bg-surface-muted" />
        <div className="h-3 w-64 rounded-full bg-surface-muted" />
      </div>

      <div className="h-20 rounded-card bg-surface-muted" />
      <div className="h-96 rounded-card bg-surface-muted" />
    </div>
  );
}
