import { apiEndpoints } from "@/config/api-endpoints";
import { landingPathFor } from "@/config/navigation";
import { isStaffRole, permissionsFor } from "@/config/permissions";
import { verifyOtpSchema } from "@/features/auth/schemas";
import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { readJson, routeHandler } from "@/lib/api/route-handler";
import { setSessionCookies } from "@/lib/auth/cookies";
import type { AuthTokens } from "@/types/auth";
import type { User } from "@/types/domain";

/**
 * Second login step: exchange the OTP for tokens, store them in `httpOnly`
 * cookies, and tell the browser where to go next.
 *
 * The landing page is decided here rather than in the form because only the
 * server can look up the role — and the role decides which page a user may
 * open at all.
 */
export const POST = routeHandler(async (request) => {
  const body = await readJson(request, verifyOtpSchema);

  const tokens = await apiClient.post<AuthTokens>(apiEndpoints.auth.verifyOtp, body);
  const me = await apiClient.get<User>(apiEndpoints.users.me, { token: tokens.access });

  // Customers (`USER`) have no panel. Reject before the session cookies are
  // written, so a rejected login leaves no usable session behind.
  if (!isStaffRole(me.role)) {
    throw new ApiError({
      message:
        "ورود کاربران عادی به پنل مجاز نیست. برای مشاهدهٔ فاکتور از لینک اختصاصی همان فاکتور استفاده کنید.",
      statusCode: 403,
    });
  }

  await setSessionCookies(tokens);

  return { redirectTo: landingPathFor(permissionsFor(me.role)) };
});
