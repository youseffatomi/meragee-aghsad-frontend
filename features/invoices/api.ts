import "server-only";

import { apiEndpoints } from "@/config/api-endpoints";
import { apiClient } from "@/lib/api/client";
import { readSessionCookies } from "@/lib/auth/cookies";
import type { Paginated } from "@/types/api";
import type { Invoice, PublicInvoice } from "@/types/domain";

/** Server-side reads for the invoices pages. */

export const INVOICES_PAGE_SIZE = 10;

export async function getInvoices({
  search,
  page,
  fromDate,
  toDate,
  limit = INVOICES_PAGE_SIZE,
}: {
  search?: string;
  page: number;
  fromDate?: string;
  toDate?: string;
  limit?: number;
}): Promise<Paginated<Invoice>> {
  const { access } = await readSessionCookies();

  return apiClient.get<Paginated<Invoice>>(apiEndpoints.invoices.search, {
    token: access,
    query: {
      // The backend requires the key to exist; an empty value lists everything.
      search: search ?? "",
      page,
      limit,
      fromDate,
      toDate,
    },
    keepEmpty: ["search"],
  });
}

export async function getInvoice(id: string): Promise<Invoice> {
  const { access } = await readSessionCookies();

  return apiClient.get<Invoice>(apiEndpoints.invoices.one(id), {
    token: access,
  });
}

/**
 * Reads the public, read-only invoice view.
 *
 * The token in the URL is the whole credential: this call deliberately sends no
 * session token, and the backend returns a censored projection.
 */
export async function getPublicInvoice(token: string): Promise<PublicInvoice> {
  return apiClient.get<PublicInvoice>(apiEndpoints.invoices.public(token));
}
