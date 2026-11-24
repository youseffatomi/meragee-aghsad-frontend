"use client";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function PublicInvoiceError({ reset }: { reset: () => void }) {
  return (
    <section className="rounded-card border border-line bg-surface p-8 text-center shadow-card">
      <h1 className="text-xl font-black text-ink">مشکلی پیش آمد</h1>
      <p className="mt-2 text-xs leading-6 text-ink-muted">
        نمایش فاکتور ممکن نشد. اتصال اینترنت را بررسی کنید و دوباره تلاش کنید.
      </p>

      <Alert tone="error" className="mt-4 text-start">
        اگر مشکل ادامه داشت، لطفاً با فروشنده تماس بگیرید.
      </Alert>

      <Button type="button" onClick={reset} className="mt-5">
        تلاش دوباره
      </Button>
    </section>
  );
}
