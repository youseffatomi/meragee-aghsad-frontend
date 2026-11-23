import { Check } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import type { InstallmentStatus } from "@/types/domain";

/**
 * The three states an installment row can be in, dressed consistently wherever
 * it appears. `paid` is a soft green so a settled row reads as a positive
 * outcome at a glance without shouting over the outstanding ones.
 */

const STATUSES: Record<InstallmentStatus, { label: string; className: string }> = {
  paid: { label: "پرداخت شده", className: "bg-success-soft text-success" },
  pending: { label: "در انتظار", className: "bg-brand-soft text-brand-text" },
  overdue: { label: "معوقه", className: "bg-danger text-white" },
};

export function InstallmentStatusBadge({ status }: { status: InstallmentStatus }) {
  const { label, className } = STATUSES[status];

  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-full px-3 text-[11px] font-bold whitespace-nowrap",
        className,
      )}
    >
      {status === "paid" ? <Check className="size-3" aria-hidden="true" /> : null}
      {label}
    </span>
  );
}
