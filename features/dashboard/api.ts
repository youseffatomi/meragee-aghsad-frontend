import "server-only";

import { apiEndpoints } from "@/config/api-endpoints";
import { apiClient } from "@/lib/api/client";
import { readSessionCookies } from "@/lib/auth/cookies";
import type { Paginated } from "@/types/api";
import type { DashboardData, Installment } from "@/types/domain";

/**
 * The dashboard is read once per request on the server, so it needs no Route
 * Handler: the page calls this directly and the browser never issues the
 * request. The token is read from the `httpOnly` cookie here rather than passed
 * down, so no token ever crosses into a Client Component.
 */

const DEFAULT_LIMIT = 10;

export async function getDashboardData(limit = DEFAULT_LIMIT): Promise<DashboardData> {
  const { access } = await readSessionCookies();

  return apiClient.get<DashboardData>(apiEndpoints.dashboard, {
    token: access,
    query: { limit },
  });
}

/**
 * The overdue list comes from the installments search rather than the dashboard
 * payload: the dashboard's list is a capped snapshot, while this is the same
 * paginated feed the installments page will use — and, unlike the dashboard
 * one, it excludes installments that were already paid.
 */
export async function getOverdueInstallments(
  limit = DEFAULT_LIMIT,
): Promise<Paginated<Installment>> {
  const { access } = await readSessionCookies();

  return apiClient.get<Paginated<Installment>>(apiEndpoints.installments.search, {
    token: access,
    query: { page: 1, limit, status: "overdue" },
  });
}
