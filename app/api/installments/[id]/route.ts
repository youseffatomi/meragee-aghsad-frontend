import { z } from "zod";

import { apiEndpoints } from "@/config/api-endpoints";
import { messages } from "@/config/messages";
import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { readJson, routeHandler } from "@/lib/api/route-handler";
import { readSessionCookies } from "@/lib/auth/cookies";
import { requireApiPermission } from "@/lib/auth/require-permission";
import type { Installment } from "@/types/domain";

type RouteContext = { params: Promise<{ id: string }> };

const OBJECT_ID = /^[a-f0-9]{24}$/i;

const waiverSchema = z.object({
  waivedLateDays: z
    .number({ error: "تعداد روزهای بخشودگی باید عدد باشد." })
    .int("تعداد روزهای بخشودگی باید عدد صحیح باشد.")
    .min(0, "تعداد روزهای بخشودگی نمی‌تواند منفی باشد.")
    .nullable(),
});

async function readId(context: RouteContext): Promise<string> {
  const { id } = await context.params;

  if (!OBJECT_ID.test(id)) {
    throw new ApiError({ message: messages.errors.notFound, statusCode: 404 });
  }

  return id;
}

/**
 * Records how many overdue days are waived for an installment and returns the
 * recalculated installment. `POST /installments/paid` later uses the stored
 * value, so this must run before paying.
 */
export const PATCH = routeHandler(async (request, context: RouteContext) => {
  await requireApiPermission("installment:pay");

  const id = await readId(context);
  const body = await readJson(request, waiverSchema);
  const { access } = await readSessionCookies();

  return apiClient.patch<Installment>(apiEndpoints.installments.update(id), body, {
    token: access,
  });
});
