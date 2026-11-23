import { apiEndpoints } from "@/config/api-endpoints";
import { apiClient } from "@/lib/api/client";
import { routeHandler } from "@/lib/api/route-handler";
import { readSessionCookies } from "@/lib/auth/cookies";
import { requireAnyApiPermission } from "@/lib/auth/require-permission";
import type { Paginated } from "@/types/api";
import type { User } from "@/types/domain";

/**
 * Customer lookup for the invoice wizard.
 *
 * The backend matches name, last name, national ID and phone by prefix, so the
 * same box can be used for all four.
 */
export const GET = routeHandler(async (request) => {
  await requireAnyApiPermission(["users:read", "invoice:create"]);

  const url = new URL(request.url);
  const search = url.searchParams.get("search") ?? "";
  const limitParam = Number.parseInt(url.searchParams.get("limit") ?? "", 10);
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 8;
  const { access } = await readSessionCookies();

  return apiClient.get<Paginated<User>>(apiEndpoints.users.list, {
    token: access,
    query: { search, page: 1, limit },
  });
});
