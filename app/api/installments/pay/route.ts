import { z } from "zod";

import { apiEndpoints } from "@/config/api-endpoints";
import { apiClient } from "@/lib/api/client";
import { readJson, routeHandler } from "@/lib/api/route-handler";
import { readSessionCookies } from "@/lib/auth/cookies";
import { requireApiPermission } from "@/lib/auth/require-permission";

const payInstallmentSchema = z.object({
  installmentId: z.string().regex(/^[a-f0-9]{24}$/i, "شناسه قسط معتبر نیست."),
  paymentReceipt: z.string().min(1, "تصویر رسید پرداخت را اضافه کنید."),
});

/** Marks an installment paid and moves its receipt out of the temp folder. */
export const POST = routeHandler(async (request) => {
  await requireApiPermission("installment:pay");

  const body = await readJson(request, payInstallmentSchema);
  const { access } = await readSessionCookies();

  return apiClient.post<unknown>(apiEndpoints.installments.pay, body, {
    token: access,
  });
});
