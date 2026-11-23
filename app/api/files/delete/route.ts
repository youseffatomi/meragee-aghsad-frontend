import { z } from "zod";

import { apiEndpoints } from "@/config/api-endpoints";
import { apiClient } from "@/lib/api/client";
import { readJson, routeHandler } from "@/lib/api/route-handler";
import { readSessionCookies } from "@/lib/auth/cookies";
import { requireAnyApiPermission } from "@/lib/auth/require-permission";

const deleteFileSchema = z.object({
  filename: z.string().min(1),
});

/** Removes an abandoned temp upload after the user removes its thumbnail. */
export const POST = routeHandler(async (request) => {
  await requireAnyApiPermission(["users:create", "invoice:create", "installment:pay"]);

  const body = await readJson(request, deleteFileSchema);
  const { access } = await readSessionCookies();

  return apiClient.post<null>(apiEndpoints.files.remove, body, {
    token: access,
  });
});
