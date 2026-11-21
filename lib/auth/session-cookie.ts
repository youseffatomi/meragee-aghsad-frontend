/**
 * Cookie names and options, kept free of `next/headers` so both the server
 * helpers (`lib/auth/cookies.ts`) and `proxy.ts` can share them. The proxy
 * writes cookies onto a `NextResponse` directly and never touches the request
 * store, so importing the request-scoped module there would be wrong.
 */

export const SESSION_COOKIES = {
  access: "mrj_access",
  refresh: "mrj_refresh",
} as const;

/** Only used if a token carries no `exp`; the backend always sends one. */
const FALLBACK_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export const SESSION_COOKIE_BASE = {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  secure: process.env.NODE_ENV === "production",
} as const;

/**
 * A cookie should die exactly when its token does. Deriving `maxAge` from `exp`
 * means a stale cookie never lingers to be sent on a request certain to fail.
 */
export function sessionCookieMaxAge(token: string): number {
  const segment = token.startsWith("Bearer ") ? token.slice(7) : token;
  const payload = segment.split(".")[1];

  if (!payload) return FALLBACK_MAX_AGE_SECONDS;

  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
    const decoded = JSON.parse(new TextDecoder().decode(bytes)) as { exp?: unknown };

    if (typeof decoded.exp !== "number") return FALLBACK_MAX_AGE_SECONDS;

    return Math.max(1, decoded.exp - Math.floor(Date.now() / 1000));
  } catch {
    return FALLBACK_MAX_AGE_SECONDS;
  }
}
