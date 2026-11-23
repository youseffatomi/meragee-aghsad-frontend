/**
 * Field limits, mirroring the backend contract. Both the zod schemas and the
 * UI hints read from here, so a limit can never drift between what we validate
 * and what we tell the user.
 */
export const validation = {
  phoneNumber: {
    /** The backend rejects anything shorter; it does not require the `09` prefix. */
    minLength: 11,
    maxLength: 15,
    example: "09123456789",
  },

  otp: {
    length: 4,
  },

  nationalId: {
    length: 10,
  },

  invoice: {
    installmentCount: { min: 1, max: 60 },
  },

  upload: {
    maxBytes: 5 * 1024 * 1024,
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
  },
} as const;
