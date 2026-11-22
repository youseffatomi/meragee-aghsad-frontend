import { cn } from "@/lib/utils/cn";
import type { InstallmentStatus } from "@/types/domain";

/**
 * The three states an installment row can be in, dressed consistently wherever
 * it appears. `paid` is deliberately near-black rather than green: the table
 * shows amounts in brand orange, and a green pill beside them would pull the
 * eye to the settled rows instead of the outstanding ones.
 */

const STATUSES: Record<InstallmentStatus, { label: string; className: string }> = {
  paid: { label: "پرداخت شده", className: "bg-ink text-white" },
  pending: { label: "در انتظار", className: "bg-brand-soft text-brand-text" },
  overdue: { label: "معوقه", className: "bg-danger text-white" },
};

export function InstallmentStatusBadge({ status }: { status: InstallmentStatus }) {
  const { label, className } = STATUSES[status];

  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-3 text-[11px] font-bold whitespace-nowrap",
        className,
      )}
    >
      {label}
    </span>
  );
}
