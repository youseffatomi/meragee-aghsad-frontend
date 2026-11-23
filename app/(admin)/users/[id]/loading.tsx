export default function UserLoading() {
  return (
    <div className="flex animate-pulse flex-col gap-6" aria-hidden="true">
      <div className="space-y-2">
        <div className="h-3 w-28 rounded-full bg-surface-muted" />
        <div className="h-5 w-44 rounded-full bg-surface-muted" />
        <div className="h-3 w-64 rounded-full bg-surface-muted" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="h-[30rem] rounded-card bg-surface-muted" />
        <div className="h-80 rounded-card bg-surface-muted" />
      </div>

      <div className="h-72 rounded-card bg-surface-muted" />
    </div>
  );
}
