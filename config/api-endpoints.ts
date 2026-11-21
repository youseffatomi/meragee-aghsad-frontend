/**
 * Backend paths, mirroring the API contract documented in `AGENTS.md`.
 *
 * Paths that carry an identifier are functions, so a caller cannot forget to
 * encode the value. The base URL is *not* included here — that belongs to
 * `config/env.ts` and is only ever read on the server.
 */
export const apiEndpoints = {
  auth: {
    sendOtp: "/auth/login/send-otp",
    verifyOtp: "/auth/login/verify-otp",
    refresh: "/auth/refresh",
  },

  users: {
    all: "/users/find/all",
    me: "/users/find/me",
    one: (id: string) => `/users/find/one/${encodeURIComponent(id)}`,
    create: "/users/create",
    update: (id: string) => `/users/update/${encodeURIComponent(id)}`,
    remove: (id: string) => `/users/remove/${encodeURIComponent(id)}`,
    roles: "/users/roles",
    checkPhoneUnique: "/users/check-phone-unique",
    checkNationalIdUnique: "/users/check-nationalid-unique",
    search: (nationalId: string) => `/users/search/${encodeURIComponent(nationalId)}`,
  },

  invoices: {
    create: "/invoice",
    one: (invoiceId: string) => `/invoice/find/one/${encodeURIComponent(invoiceId)}`,
    search: "/invoice/search",
  },

  installments: {
    search: "/installments/search",
    pay: "/installments/paid",
  },

  files: {
    send: "/file/send",
    remove: "/file/delete",
  },
} as const;

/**
 * Our own Route Handlers — the Browser-For-Frontend layer. The browser talks
 * only to these; they in turn call the endpoints above with the session token.
 */
export const bffEndpoints = {
  auth: {
    sendOtp: "/api/auth/send-otp",
    verifyOtp: "/api/auth/verify-otp",
    refresh: "/api/auth/refresh",
    logout: "/api/auth/logout",
  },
} as const;
