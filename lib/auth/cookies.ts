import "server-only";

import { cookies } from "next/headers";

import type { AuthTokens } from "@/types/auth";
import {
  SESSION_COOKIE_BASE,
  SESSION_COOKIES,
  sessionCookieMaxAge,
} from "./session-cookie";

/**
 * The session lives in two `httpOnly` cookies, so no JavaScript — ours or a
 * third party's — can read the tokens. Every backend call happens on the
 * server, in a Route Handler or a Server Component.
 */

export async function setSessionCookies(tokens: AuthTokens): Promise<void> {
  const store = await cookies();

  store.set(SESSION_COOKIES.access, tokens.access, {
    ...SESSION_COOKIE_BASE,
    maxAge: sessionCookieMaxAge(tokens.access),
  });

  store.set(SESSION_COOKIES.refresh, tokens.refresh, {
    ...SESSION_COOKIE_BASE,
    maxAge: sessionCookieMaxAge(tokens.refresh),
  });
}

export async function clearSessionCookies(): Promise<void> {
  const store = await cookies();

  store.delete(SESSION_COOKIES.access);
  store.delete(SESSION_COOKIES.refresh);
}

export type SessionCookies = {
  access: string | null;
  refresh: string | null;
};

export async function readSessionCookies(): Promise<SessionCookies> {
  const store = await cookies();

  return {
    access: store.get(SESSION_COOKIES.access)?.value ?? null,
    refresh: store.get(SESSION_COOKIES.refresh)?.value ?? null,
  };
}
