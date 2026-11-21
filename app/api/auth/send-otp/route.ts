import { apiEndpoints } from "@/config/api-endpoints";
import { sendOtpSchema } from "@/features/auth/schemas";
import { apiClient } from "@/lib/api/client";
import { readJson, routeHandler } from "@/lib/api/route-handler";

/** First login step. The backend answers `null`; the OTP goes out by SMS. */
export const POST = routeHandler(async (request) => {
  const body = await readJson(request, sendOtpSchema);

  await apiClient.post<null>(apiEndpoints.auth.sendOtp, body);

  return null;
});
