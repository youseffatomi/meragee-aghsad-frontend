import "server-only";

import { apiEndpoints } from "@/config/api-endpoints";
import { apiClient } from "@/lib/api/client";
import type { AuthTokens } from "@/types/auth";

/**
 * Exchanges a refresh token for a new pair.
 *
 * Kept separate from the Route Handler so `proxy.ts` can reuse it: the proxy
 * renews the session *before* a request reaches a page, which means no Server
 * Component ever renders with a token that is about to lapse.
 */
export function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  return apiClient.post<AuthTokens>(apiEndpoints.auth.refresh, { refreshToken });
}
