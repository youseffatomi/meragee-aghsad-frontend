import "server-only";

import { z } from "zod";

/**
 * Server-side environment. Importing this from a Client Component throws at
 * build time, which is intentional: the API base URL must never reach the
 * browser, because every backend call is proxied through a Route Handler.
 *
 * Values come from `.env.local` (see `.env.example`).
 */
const envSchema = z.object({
  API_BASE_URL: z.url({ error: "API_BASE_URL must be an absolute URL" }),
  BASE_URL: z.url({ error: "BASE_URL must be an absolute URL" }),
});

const parsed = envSchema.safeParse({
  API_BASE_URL: process.env.API_BASE_URL,
  BASE_URL: process.env.BASE_URL,
});

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  • ${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("\n");

  throw new Error(
    `Invalid environment configuration:\n${details}\n\n` +
      "Copy .env.example to .env.local and fill it in.",
  );
}

export const env = parsed.data;
