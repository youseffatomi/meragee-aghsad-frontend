import "server-only";

import { apiEndpoints } from "@/config/api-endpoints";
import { apiClient } from "@/lib/api/client";
import { readSessionCookies } from "@/lib/auth/cookies";
import type { Paginated } from "@/types/api";
import type { User, UserWithInvoices } from "@/types/domain";

/**
 * Server-side reads for the users pages.
 *
 * Like the dashboard, these run inside the page's request and never reach the
 * browser: the token is read from the `httpOnly` cookie here, not passed down.
 */

export const USERS_PAGE_SIZE = 10;
export const USER_INVOICES_PAGE_SIZE = 10;

export async function getUsers({
  search,
  page,
  limit = USERS_PAGE_SIZE,
}: {
  search?: string;
  page: number;
  limit?: number;
}): Promise<Paginated<User>> {
  const { access } = await readSessionCookies();

  return apiClient.get<Paginated<User>>(apiEndpoints.users.list, {
    token: access,
    query: { search, page, limit },
  });
}

export async function getUserWithInvoices(
  id: string,
  { page, limit = USER_INVOICES_PAGE_SIZE }: { page: number; limit?: number },
): Promise<UserWithInvoices> {
  const { access } = await readSessionCookies();

  return apiClient.get<UserWithInvoices>(apiEndpoints.users.one(id), {
    token: access,
    query: { page, limit },
  });
}
