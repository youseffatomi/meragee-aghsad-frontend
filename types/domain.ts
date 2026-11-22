import type { Role } from "@/config/permissions";

/**
 * Backend domain models, mirroring the schemas in the OpenAPI spec.
 *
 * These describe what the API actually sends — optional fields are optional
 * because the backend may omit them, not because we chose to model them loosely.
 */

export type User = {
  _id: string;
  name: string;
  lastName: string;
  nationalId: string;
  role: Role;
  phoneNumbers: {
    primary: string;
    secondary?: string | null;
  };
  residentialAddress?: string | null;
  employmentDetails?: {
    occupation?: string | null;
    workplace?: string | null;
  } | null;
  guarantorContact?: string | null;
  identityDocuments?: {
    nationalCardImage?: string | null;
    otherDocuments?: string[] | null;
  } | null;
  createdAt?: string;
  updatedAt?: string;
};

/** Whether an installment is still owed, settled, or past its due date. */
export type InstallmentStatus = "pending" | "paid" | "overdue";

/** One time window on the dashboard, measured in "payable amount". */
export type DashboardPeriodSummary = {
  count: number;
  totalAmount: number;
  paidCount: number;
  remainingCount: number;
  paidAmount: number;
  remainingAmount: number;
};

export type DashboardSummary = {
  thisMonth: DashboardPeriodSummary;
  thisWeek: DashboardPeriodSummary;
  overdue: DashboardPeriodSummary;
};

export type DashboardStats = {
  customersCount: number;
  soldProductsCount: number;
  totalPaidAmount: number;
};

/**
 * A row in the "today" / "overdue" tables. `status` is computed by the backend
 * at request time (`overdue` is never persisted), so it can disagree with the
 * stored document — this is the authoritative value to render.
 */
export type DashboardInstallmentRow = {
  installmentId: string;
  invoiceId: string | null;
  invoiceName: string | null;
  no: number;
  amount: number;
  amountWithInterest: number;
  latePenalty: number;
  payableAmount: number;
  daysOverdue: number;
  dueDate: string;
  dueDateJalaly: string;
  status: InstallmentStatus;
  user: {
    id: string | null;
    fullName: string;
    phone: string | null;
  };
  productName: string;
};

/** The `data` of `GET /dashboard`. */
export type DashboardData = {
  summary: DashboardSummary;
  stats: DashboardStats;
  todayInstallments: DashboardInstallmentRow[];
  overdueInstallments: DashboardInstallmentRow[];
};

/**
 * A populated installment as returned by `GET /installments/search`.
 *
 * `user` and `invoiceId` are ObjectId strings in the raw document but objects
 * here, because the endpoint populates them. The union keeps the type honest
 * without forcing a cast at the call site.
 */
export type InstallmentUserRef = {
  _id: string;
  name: string;
  lastName: string;
  phoneNumbers?: { primary?: string | null } | null;
};

export type InstallmentProductRef = {
  _id: string;
  name: string;
  price?: number;
};

export type InstallmentInvoiceRef = {
  _id: string;
  name: string;
  products?: InstallmentProductRef[] | null;
};

export type Installment = {
  _id: string;
  invoiceId: InstallmentInvoiceRef | string | null;
  user: InstallmentUserRef | string | null;
  no: number;
  amount: number;
  amountWithInterest: number;
  status: InstallmentStatus;
  dueDate: string;
  dueDateJalaly: string;
  paidAt: string | null;
  paymentReceipt?: string | null;
  daysOverdue?: number;
  latePenalty?: number;
  payableAmount: number;
  createdAt?: string;
  updatedAt?: string;
};
