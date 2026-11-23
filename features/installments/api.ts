import "server-only";

import { apiEndpoints } from "@/config/api-endpoints";
import { apiClient } from "@/lib/api/client";
import { readSessionCookies } from "@/lib/auth/cookies";
import type { Paginated } from "@/types/api";
import type { Installment, InstallmentFilterStatus } from "@/types/domain";

/** Server-side read for the installments page. */

export const INSTALLMENTS_PAGE_SIZE = 10;

export async function getInstallments({
  status = "all",
  fromDate,
  toDate,
  user,
  page,
  limit = INSTALLMENTS_PAGE_SIZE,
}: {
  status?: InstallmentFilterStatus;
  fromDate?: string;
  toDate?: string;
  user?: string;
  page: number;
  limit?: number;
}): Promise<Paginated<Installment>> {
  const { access } = await readSessionCookies();

  // The backend ignores dates for `overdue`, and so do we: the filter form
  // clears them and the request must not carry a stale range either.
  const useDates = status !== "overdue";

  return apiClient.get<Paginated<Installment>>(apiEndpoints.installments.search, {
    token: access,
    query: {
      status,
      page,
      limit,
      fromDate: useDates ? fromDate : undefined,
      toDate: useDates ? toDate : undefined,
      user,
    },
  });
}
