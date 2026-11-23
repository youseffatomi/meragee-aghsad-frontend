import "server-only";

import { apiEndpoints } from "@/config/api-endpoints";
import { apiClient } from "@/lib/api/client";
import { readSessionCookies } from "@/lib/auth/cookies";
import type { Paginated } from "@/types/api";
import type { Product } from "@/types/domain";

/** Server-side reads for the products page. */

export const PRODUCTS_PAGE_SIZE = 12;

export async function getProducts({
  search,
  page,
  limit = PRODUCTS_PAGE_SIZE,
}: {
  search?: string;
  page: number;
  limit?: number;
}): Promise<Paginated<Product>> {
  const { access } = await readSessionCookies();

  return apiClient.get<Paginated<Product>>(apiEndpoints.products.search, {
    token: access,
    query: {
      // `search` is optional; an empty value lists every product.
      search: search ?? "",
      page,
      limit,
    },
    keepEmpty: ["search"],
  });
}
