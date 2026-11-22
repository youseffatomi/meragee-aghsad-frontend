import type {
  DashboardInstallmentRow,
  Installment,
  InstallmentStatus,
} from "@/types/domain";

/**
 * The single shape the dashboard tables render.
 *
 * Two different endpoints feed those tables — the dashboard payload for
 * "today" and the installments search for "overdue" — and their rows differ in
 * nesting and field names. Flattening both into this view-model keeps the table
 * itself ignorant of where a row came from, so only the adapters below care.
 */

export type InstallmentTableRow = {
  id: string;
  customerName: string;
  phone: string | null;
  productName: string;
  /** The installment itself, interest included — before any late penalty. */
  amount: number;
  /** Overdue-only breakdown; absent on rows that are not past their due date. */
  daysOverdue?: number;
  latePenalty?: number;
  payableAmount?: number;
  status: InstallmentStatus;
};

export function fromDashboardRow(row: DashboardInstallmentRow): InstallmentTableRow {
  return {
    id: row.installmentId,
    customerName: row.user.fullName,
    phone: row.user.phone,
    productName: row.productName,
    amount: row.amountWithInterest,
    status: row.status,
  };
}

export function fromInstallment(installment: Installment): InstallmentTableRow {
  const user = typeof installment.user === "object" ? installment.user : null;
  const invoice =
    typeof installment.invoiceId === "object" ? installment.invoiceId : null;

  const productName =
    invoice?.products
      ?.map((product) => product.name)
      .filter(Boolean)
      .join("، ") ?? "";

  return {
    id: installment._id,
    customerName: `${user?.name ?? ""} ${user?.lastName ?? ""}`.trim(),
    phone: user?.phoneNumbers?.primary ?? null,
    productName,
    amount: installment.amountWithInterest,
    daysOverdue: installment.daysOverdue,
    latePenalty: installment.latePenalty,
    payableAmount: installment.payableAmount,
    status: installment.status,
  };
}
