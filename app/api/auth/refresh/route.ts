import { messages } from "@/config/messages";
import { ApiError } from "@/lib/api/errors";
import { routeHandler } from "@/lib/api/route-handler";
import { readSessionCookies, setSessionCookies } from "@/lib/auth/cookies";
import { refreshTokens } from "@/lib/auth/refresh";

/**
 * Renews the session on demand.
 *
 * The proxy already refreshes ahead of expiry on page requests; this endpoint
 * exists for the case where a call happens without a page load — a long-lived
 * tab, or a retry after the tab was asleep.
 */
export const POST = routeHandler(async () => {
  const { refresh } = await readSessionCookies();

  if (!refresh) {
    throw new ApiError({ message: messages.errors.unauthorized, statusCode: 401 });
  }

  const tokens = await refreshTokens(refresh);
  await setSessionCookies(tokens);

  return null;
});
