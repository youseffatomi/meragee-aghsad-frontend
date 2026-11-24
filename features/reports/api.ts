import "server-only";

import { apiEndpoints } from "@/config/api-endpoints";
import { apiClient } from "@/lib/api/client";
import { readSessionCookies } from "@/lib/auth/cookies";
import type { Paginated } from "@/types/api";
import type {
  FinancialSummary,
  FinancialTrend,
  ReportCustomerRow,
  ReportCustomerSort,
  TrendGranularity,
} from "@/types/domain";

/**
 * Server-side reads for the financial report.
 *
 * Every call happens on the server so the access token never leaves the
 * `httpOnly` cookie. The page calls these in parallel; the browser never sees
 * the backend envelope.
 */

export const REPORT_OVERVIEW_LIMIT = 5;

type RangeQuery = { fromDate: string; toDate: string };

export async function getFinancialSummary({
  fromDate,
  toDate,
}: RangeQuery): Promise<FinancialSummary> {
  const { access } = await readSessionCookies();

  return apiClient.get<FinancialSummary>(apiEndpoints.reports.summary, {
    token: access,
    query: { fromDate, toDate },
  });
}

export async function getFinancialTrend({
  fromDate,
  toDate,
  granularity,
}: RangeQuery & { granularity: TrendGranularity }): Promise<FinancialTrend> {
  const { access } = await readSessionCookies();

  return apiClient.get<FinancialTrend>(apiEndpoints.reports.trend, {
    token: access,
    query: { fromDate, toDate, granularity },
  });
}

export async function getReportCustomers({
  fromDate,
  toDate,
  sort,
  page = 1,
  limit = REPORT_OVERVIEW_LIMIT,
}: RangeQuery & {
  sort: ReportCustomerSort;
  page?: number;
  limit?: number;
}): Promise<Paginated<ReportCustomerRow>> {
  const { access } = await readSessionCookies();

  return apiClient.get<Paginated<ReportCustomerRow>>(apiEndpoints.reports.customers, {
    token: access,
    query: { fromDate, toDate, sort, page, limit },
  });
}
