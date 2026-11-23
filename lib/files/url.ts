/**
 * Turns a stored document filename into a URL the browser can load.
 *
 * The backend stores bare filenames (or occasionally an `/uploads/...` path)
 * and serves them from a different origin. Loading them directly would hit
 * Helmet's same-origin resource policy, so every document goes through our own
 * `/api/files/[...path]` proxy instead.
 */
export function fileSrc(filename?: string | null): string | null {
  if (!filename) return null;

  if (/^https?:\/\//i.test(filename)) return filename;

  const clean = filename.replace(/^\/?(uploads|files)\//, "");
  const encoded = clean.split("/").filter(Boolean).map(encodeURIComponent).join("/");

  return `/api/files/${encoded}`;
}
