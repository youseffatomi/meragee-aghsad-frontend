/**
 * Token helpers. Deliberately free of any `server-only` or Next.js import, so
 * the edge route guard in `proxy.ts` can use them too.
 *
 * Nothing here verifies a signature. It does not need to: the backend is the
 * only authority on whether a token is valid, and we read the payload purely to
 * know *when* to refresh. Never make a security decision from these values.
 */

export type TokenPayload = {
  exp?: number;
  iat?: number;
  sub?: string;
  [claim: string]: unknown;
};

/**
 * Backend tokens already include the `Bearer ` prefix. Sending them as-is is
 * correct; prefixing them again would produce `Bearer Bearer eyJ...`.
 */
export function stripBearer(token: string): string {
  return token.startsWith("Bearer ") ? token.slice("Bearer ".length) : token;
}

/** Guarantees exactly one `Bearer ` prefix, whatever the caller was handed. */
export function toAuthorizationHeader(token: string): string {
  return `Bearer ${stripBearer(token)}`;
}

/** Decodes the payload segment of a JWT. Returns `null` for anything malformed. */
export function decodeToken(token: string): TokenPayload | null {
  const segment = stripBearer(token).split(".")[1];
  if (!segment) return null;

  try {
    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));

    return JSON.parse(new TextDecoder().decode(bytes)) as TokenPayload;
  } catch {
    return null;
  }
}

/** Unix seconds, or `null` when the token carries no usable `exp`. */
export function tokenExpiresAt(token: string): number | null {
  const exp = decodeToken(token)?.exp;
  return typeof exp === "number" ? exp : null;
}

/**
 * @param leewaySeconds Treat a token expiring within this window as already
 * expired, so a request in flight does not arrive after it lapses.
 */
export function isTokenExpired(token: string, leewaySeconds = 0): boolean {
  const expiresAt = tokenExpiresAt(token);
  if (expiresAt === null) return false;

  return expiresAt * 1000 <= Date.now() + leewaySeconds * 1000;
}
