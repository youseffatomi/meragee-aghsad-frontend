export default function PublicInvoiceLoading() {
  return (
    <div className="flex animate-pulse flex-col gap-5" aria-hidden="true">
      <div className="h-40 rounded-card border border-line bg-surface" />
      <div className="h-56 rounded-card border border-line bg-surface" />
      <div className="h-56 rounded-card border border-line bg-surface" />
    </div>
  );
}
