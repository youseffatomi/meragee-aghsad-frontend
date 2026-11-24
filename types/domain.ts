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

/** One installment as exposed by `GET /public/invoice/{token}`. */
export type PublicInvoiceInstallment = {
  no: number;
  /** The installment principal, without interest. */
  amount: number;
  /** The installment with its 5% interest. */
  amountWithInterest: number;
  /** The final payable: `amountWithInterest` plus any late penalty. */
  payableAmount: number;
  /** The overdue penalty, already reduced by any waived days. */
  latePenalty: number;
  /** How many days past the due date this installment is. */
  daysOverdue: number;
  /** Days of lateness that were forgiven, reducing the penalty. */
  waivedLateDays: number;
  dueDate: string;
  /** Note the single "l": the public endpoint uses `dueDateJalali`. */
  dueDateJalali: string;
  status: InstallmentStatus;
  paidAt: string | null;
};

/**
 * The `data` of `GET /public/invoice/{token}`.
 *
 * The backend censors this projection: there is no national id, and the phone
 * number and IMEI arrive partially masked. It is deliberately a separate shape
 * from `Invoice` so the public page cannot accidentally render a field the
 * endpoint never sends.
 */
export type PublicInvoice = {
  invoice: {
    name: string;
    startDateJalali: string;
    installmentCount: number;
    downPayment: number;
    totalAmount: number;
    createdAt: string;
  };
  customer: {
    name: string | null;
    lastName: string | null;
    phone: string | null;
  };
  products: {
    name: string;
    details?: string | null;
    price: number;
    pictures?: string[] | null;
    imei?: string | null;
  }[];
  installments: PublicInvoiceInstallment[];
  installmentsStatus: {
    paid: number;
    pending: number;
    overdue: number;
  };
  /** Aggregate of the overdue installments, computed by the backend. */
  overdueSummary: {
    count: number;
    totalPayable: number;
    totalPenalty: number;
    totalWaivedDays: number;
    maxDaysOverdue: number;
  };
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
  /** The unguessable token behind the public, read-only invoice link. */
  publicToken?: string;
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

/* -------------------------------------------------------------------------- */
/* Financial reports (`/reports/financial/*`)                                  */
/* -------------------------------------------------------------------------- */

/** The resolved Gregorian range a report was computed for. */
export type ReportRange = {
  fromDate: string;
  toDate: string;
};

/** Sales figures, filtered by `invoice.start_date`. */
export type ReportSales = {
  invoiceCount: number;
  customerCount: number;
  /** Line items sold, not distinct product names. */
  productCount: number;
  grossSales: number;
  downPayments: number;
  financedPrincipal: number;
  interest: number;
  contractValue: number;
  averageInvoice: number;
};

/** Cash collected in the period, filtered by `installment.paidAt`. */
export type ReportCollections = {
  paidCount: number;
  principalCollected: number;
  interestCollected: number;
  penaltyCollected: number;
  totalCollected: number;
  waivedDays: number;
  /** Paid share of the installments of the invoices in the range, 0–100. */
  collectionRate: number;
};

/**
 * Outstanding money as of now — deliberately independent of the date range.
 * `upcoming30/60/90` are the amounts due within the next 30/60/90 days.
 */
export type ReportReceivables = {
  pendingCount: number;
  pendingOutstanding: number;
  overdueCount: number;
  overdueOutstanding: number;
  totalOutstanding: number;
  upcoming30: number;
  upcoming60: number;
  upcoming90: number;
};

export type ReportAgingBucketName = "0-30" | "31-60" | "61-90" | "90+";

export type ReportAgingBucket = {
  bucket: ReportAgingBucketName;
  count: number;
  amount: number;
};

export type ReportStatusSlice = {
  count: number;
  amount: number;
};

/** Every installment's current state, independent of the date range. */
export type ReportStatusBreakdown = {
  paid: ReportStatusSlice;
  pending: ReportStatusSlice;
  overdue: ReportStatusSlice;
};

export type ReportPenalties = {
  /** Accrued on installments that are overdue right now. */
  accrued: number;
  /** Charged on every paid installment, all time. */
  collected: number;
  waivedDays: number;
  overdueWithPenaltyCount: number;
};

/**
 * The same flow metrics for the equal-length range immediately before the
 * selected one. Snapshot metrics are `null` because a period-over-period delta
 * would be meaningless; the UI hides their delta badge.
 */
export type ReportPrevious = {
  fromDate: string;
  toDate: string;
  grossSales: number;
  totalCollected: number;
  interest: number;
  totalOutstanding: number | null;
  overdueOutstanding: number | null;
  collectionRate: number | null;
};

/** The `data` of `GET /reports/financial/summary`. */
export type FinancialSummary = {
  range: ReportRange;
  sales: ReportSales;
  collections: ReportCollections;
  receivables: ReportReceivables;
  aging: ReportAgingBucket[];
  statusBreakdown: ReportStatusBreakdown;
  penalties: ReportPenalties;
  previous: ReportPrevious;
};

export type TrendGranularity = "day" | "week" | "month";

export type FinancialTrendPoint = {
  key: string;
  label: string;
  fromDate: string;
  toDate: string;
  invoicedAmount: number;
  invoiceCount: number;
  /** Due in this period, without penalty. */
  dueAmount: number;
  dueCount: number;
  collectedAmount: number;
  collectedCount: number;
  /** Still unpaid and past due, including the penalty accrued so far. */
  overdueAmount: number;
  overdueCount: number;
};

/** The `data` of `GET /reports/financial/trend`. */
export type FinancialTrend = {
  granularity: TrendGranularity;
  points: FinancialTrendPoint[];
};

export type ReportInvoiceStatus = "paid" | "pending" | "overdue";
export type ReportInvoiceFilterStatus = ReportInvoiceStatus | "all";
export type ReportInvoiceSort = "startDate" | "total" | "remaining" | "overdue";
export type ReportCustomerSort = "outstanding" | "paid" | "purchases";
export type ReportProductSort = "revenue" | "units";
export type ReportExportType = "invoices" | "customers" | "products" | "installments";

export type ReportInvoiceRow = {
  invoiceId: string;
  invoiceName: string;
  customer: {
    id: string | null;
    fullName: string;
    phone: string;
    nationalId: string;
  };
  startDate: string;
  startDateJalali: string;
  productCount: number;
  grossSales: number;
  downPayment: number;
  financedPrincipal: number;
  interest: number;
  paidAmount: number;
  remainingAmount: number;
  overdueAmount: number;
  penaltyAmount: number;
  installmentCount: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
  collectionRate: number;
  status: ReportInvoiceStatus;
};

export type ReportCustomerRow = {
  userId: string;
  fullName: string;
  phone: string;
  nationalId: string;
  invoiceCount: number;
  purchasesAmount: number;
  downPayments: number;
  paidAmount: number;
  outstandingAmount: number;
  overdueAmount: number;
  penaltyAmount: number;
  collectionRate: number;
  lastPaymentAt: string | null;
};

export type ReportProductRow = {
  name: string;
  unitsSold: number;
  invoiceCount: number;
  totalRevenue: number;
  /** Share of the period revenue, 0–100. */
  share: number;
  totalPaid: number;
  totalOutstanding: number;
};
