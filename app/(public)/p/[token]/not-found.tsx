import { FileWarning } from "lucide-react";

export default function PublicInvoiceNotFound() {
  return (
    <section className="rounded-card border border-line bg-surface p-8 text-center shadow-card">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-danger-soft text-danger-text">
        <FileWarning className="size-6" aria-hidden="true" />
      </span>

      <h1 className="mt-5 text-xl font-black text-ink">فاکتور پیدا نشد</h1>
      <p className="mt-2 text-xs leading-6 text-ink-muted">
        لینک فاکتور نامعتبر است یا دیگر در دسترس نیست. لطفاً لینک را دوباره از فروشنده
        بگیرید.
      </p>
    </section>
  );
}
