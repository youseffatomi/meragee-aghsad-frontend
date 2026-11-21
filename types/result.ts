import type { ApiFieldError } from "./api";

/**
 * The contract every Route Handler under `app/api` returns, and therefore the
 * only shape the browser ever has to understand.
 *
 * It intentionally hides the backend envelope. The backend reports validation
 * problems as an array of `{ field, message }` in most endpoints but as a bare
 * string in the file endpoints; normalising that at the boundary means no
 * client component ever has to defensively parse an error.
 *
 * `fieldErrors` is always present so callers can map over it unconditionally.
 */
export type ActionResult<T> =
  { ok: true; data: T } | { ok: false; message: string; fieldErrors: ApiFieldError[] };

export type ActionFailure = Extract<ActionResult<never>, { ok: false }>;
