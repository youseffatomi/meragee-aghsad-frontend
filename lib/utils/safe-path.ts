/**
 * Keeps a redirect target inside the application.
 *
 * `?next=` arrives from the URL, so it is attacker-controlled. Without this
 * check, `?next=https://evil.example` would turn the login page into an open
 * redirect after a successful sign-in.
 */
export function safeInternalPath(
  candidate: string | null | undefined,
  fallback: string,
): string {
  if (!candidate) return fallback;
  if (!candidate.startsWith("/")) return fallback;
  if (candidate.startsWith("//")) return fallback;

  return candidate;
}
