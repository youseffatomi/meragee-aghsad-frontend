import { NextResponse, type NextRequest } from "next/server";

import { isPublicRoute, routes } from "@/config/routes";
import { refreshTokens } from "@/lib/auth/refresh";
import {
  SESSION_COOKIE_BASE,
  SESSION_COOKIES,
  sessionCookieMaxAge,
} from "@/lib/auth/session-cookie";
import { isTokenExpired } from "@/lib/auth/token";

/**
 * The edge of the application: every page request passes through here before
 * anything renders.
 *
 * Two jobs, and nothing else:
 *
 * 1. Decide whether the request may proceed at all. This is a *presence* check
 *    on the session cookie, not an authorisation check — the proxy cannot know
 *    what a role may open. Pages assert their own permission with
 *    `requirePermission`.
 * 2. Renew the session *before* it lapses. Refreshing here rather than after a
 *    401 means no Server Component ever renders with a dead token, and the user
 *    never sees a spurious "session expired" for a session that was fine.
 */

/** Renew this long before `exp`, so a request in flight cannot arrive too late. */
const REFRESH_LEEWAY_SECONDS = 60;

function loginUrl(request: NextRequest): URL {
  const url = new URL(routes.login, request.url);
  const { pathname, search } = request.nextUrl;

  // Remember where the user was headed, so login can send them back there.
  if (pathname !== "/" && !isPublicRoute(pathname)) {
    url.searchParams.set("next", `${pathname}${search}`);
  }

  return url;
}

function redirectToLogin(request: NextRequest, clearCookies = false): NextResponse {
  const response = NextResponse.redirect(loginUrl(request));

  if (clearCookies) {
    response.cookies.delete(SESSION_COOKIES.access);
    response.cookies.delete(SESSION_COOKIES.refresh);
  }

  return response;
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const access = request.cookies.get(SESSION_COOKIES.access)?.value ?? null;
  const refresh = request.cookies.get(SESSION_COOKIES.refresh)?.value ?? null;
  const publicRoute = isPublicRoute(pathname);

  if (!access) {
    return publicRoute ? NextResponse.next() : redirectToLogin(request);
  }

  if (publicRoute) {
    return NextResponse.redirect(new URL(routes.dashboard, request.url));
  }

  if (!isTokenExpired(access, REFRESH_LEEWAY_SECONDS)) {
    return NextResponse.next();
  }

  if (!refresh) {
    return redirectToLogin(request, true);
  }

  try {
    const tokens = await refreshTokens(refresh);

    // The render that follows reads cookies from the *request*, so the new pair
    // has to be written there as well as onto the response.
    request.cookies.set(SESSION_COOKIES.access, tokens.access);
    request.cookies.set(SESSION_COOKIES.refresh, tokens.refresh);

    const response = NextResponse.next({ request });

    response.cookies.set(SESSION_COOKIES.access, tokens.access, {
      ...SESSION_COOKIE_BASE,
      maxAge: sessionCookieMaxAge(tokens.access),
    });

    response.cookies.set(SESSION_COOKIES.refresh, tokens.refresh, {
      ...SESSION_COOKIE_BASE,
      maxAge: sessionCookieMaxAge(tokens.refresh),
    });

    return response;
  } catch {
    // The refresh token is dead too. Start over rather than loop.
    return redirectToLogin(request, true);
  }
}

export const config = {
  /**
   * Everything except API routes, Next's own assets, and any path with a file
   * extension (the logo, the avatar). Without this the guard would try to
   * redirect image requests to the login page.
   */
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
