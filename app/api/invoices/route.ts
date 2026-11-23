import { apiEndpoints } from "@/config/api-endpoints";
import { invoiceInputSchema } from "@/features/invoices/schemas";
import { apiClient } from "@/lib/api/client";
import { readJson, routeHandler } from "@/lib/api/route-handler";
import { readSessionCookies } from "@/lib/auth/cookies";
import { requireApiPermission } from "@/lib/auth/require-permission";
import type { Invoice } from "@/types/domain";

/**
 * Creates an invoice. The backend generates its installments in the same call,
 * so nothing else has to be scheduled from the browser.
 */
export const POST = routeHandler(async (request) => {
  await requireApiPermission("invoice:create");

  const body = await readJson(request, invoiceInputSchema);
  const { access } = await readSessionCookies();

  return apiClient.post<Invoice>(apiEndpoints.invoices.create, body, {
    token: access,
  });
});
