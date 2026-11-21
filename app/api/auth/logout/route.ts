import { routeHandler } from "@/lib/api/route-handler";
import { clearSessionCookies } from "@/lib/auth/cookies";

/**
 * Drops the session cookies. There is no backend logout endpoint, and there
 * does not need to be: the tokens are stateless, so forgetting them is enough.
 */
export const POST = routeHandler(async () => {
  await clearSessionCookies();

  return null;
});
