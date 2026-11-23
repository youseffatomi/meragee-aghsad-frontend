import type { Role } from "@/config/permissions";
import type { Paginated } from "@/types/api";

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

/** A product reference inside the invoices embedded in `GET /users/find/one`. */
export type UserInvoiceProduct = {
  _id: string;
  price?: number;
};

/** An installment reference inside the invoices embedded in `GET /users/find/one`. */
export type UserInvoiceInstallment = {
  _id: string;
  status: InstallmentStatus;
  dueDate: string;
};

/**
 * One invoice row as returned inside `GET /users/find/one/{id}`.
 *
 * That endpoint selects a narrower projection than `/invoice/search`: products
 * carry only `price` (no name) and installments only `status`/`dueDate`. The
 * `totalAmount` and `installmentsStatus` fields are Mongoose virtuals, so they
 * are computed server-side and may be absent if the projection changes.
 */
export type UserInvoice = {
  _id: string;
  name: string;
  downPayment: number;
  installmentCount: number;
  start_date: string;
  start_date_jalaly: string;
  products?: UserInvoiceProduct[] | null;
  installments?: UserInvoiceInstallment[] | null;
  totalAmount?: number;
  installmentsStatus?: {
    pending: number;
    paid: number;
    overdue: number;
  };
  createdAt?: string;
  updatedAt?: string;
};

/** The `data` of `GET /users/find/one/{id}` — the user plus a page of invoices. */
export type UserWithInvoices = User & {
  invoices: Paginated<UserInvoice>;
};

/** Whether an installment is still owed, settled, or past its due date. */
export type InstallmentStatus = "pending" | "paid" | "overdue";

/** The status filter on the installments page, where "all" means no filter. */
export type InstallmentFilterStatus = InstallmentStatus | "all";

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
  waivedLateDays?: number | null;
  daysOverdue?: number;
  latePenalty?: number;
  payableAmount: number;
  createdAt?: string;
  updatedAt?: string;
};

/** The customer projection embedded in an invoice row. */
export type InvoiceUserRef = {
  _id: string;
  name?: string;
  lastName?: string;
  nationalId?: string;
  /** `/invoice/search` populates this (not `phoneNumbers.primary`). */
  phone?: string | null;
  phoneNumbers?: { primary?: string | null } | null;
};

/** A product as embedded in an invoice. Search returns only `price`. */
export type InvoiceProduct = {
  _id: string;
  name?: string;
  price?: number;
  pictures?: string[] | null;
  details?: string | null;
  imei?: string | null;
};

export type InvoicePledge = {
  _id?: string;
  name: string;
  picture: string;
  details: string;
};

/** An installment reference inside an invoice. */
export type InvoiceInstallmentRef = {
  _id: string;
  no?: number;
  amount?: number;
  amountWithInterest?: number;
  status: InstallmentStatus;
  dueDate: string;
  dueDateJalaly: string;
  paidAt?: string | null;
  paymentReceipt?: string | null;
  waivedLateDays?: number | null;
  daysOverdue?: number;
  latePenalty?: number;
  payableAmount?: number;
};

/**
 * An invoice as returned by `/invoice/search` or `/invoice/find/one`.
 *
 * The search endpoint populates a narrower projection than the detail endpoint,
 * so product names and installment amounts are optional here.
 */
export type Invoice = {
  _id: string;
  name: string;
  user: InvoiceUserRef | string;
  products?: InvoiceProduct[] | null;
  pledge?: InvoicePledge[] | null;
  installments?: InvoiceInstallmentRef[] | null;
  downPayment: number;
  start_date: string;
  start_date_jalaly: string;
  installmentCount: number;
  totalAmount?: number;
  installmentsStatus?: {
    pending: number;
    paid: number;
    overdue: number;
  };
  createdAt?: string;
  updatedAt?: string;
};

/** The customer projection populated on a product from `/products/search`. */
export type ProductUserRef = {
  _id: string;
  name?: string;
  lastName?: string;
  phoneNumbers?: { primary?: string | null } | null;
};

/** The invoice projection populated on a product from `/products/search`. */
export type ProductInvoiceRef = {
  _id: string;
  name?: string;
};

/**
 * A product as returned by `GET /products/search`.
 *
 * Both `invoiceId` and `user` are populated by the endpoint, but they can still
 * be a bare ObjectId (or null) when the reference is missing.
 */
export type Product = {
  _id: string;
  invoiceId: ProductInvoiceRef | string | null;
  user: ProductUserRef | string | null;
  name: string;
  price: number;
  pictures?: string[] | null;
  details?: string | null;
  imei?: string | null;
  createdAt?: string;
  updatedAt?: string;
};
