import { messages } from "@/config/messages";
import type { ApiFailure, ApiFieldError } from "@/types/api";
import type { ActionFailure } from "@/types/result";

/**
 * The single place where a backend error becomes copy a Persian user can read.
 *
 * The backend's own `message` is English ("Bad Request", "Unauthorized"), and
 * `errorDetails` is sometimes a sentence we should show verbatim. So: prefer our
 * wording for a known `errorCode`, fall back to the backend's own detail string
 * when it has one, and only then to generic copy.
 */
const ERROR_CODE_MESSAGES: Record<string, string> = {
  BAD_REQUEST: messages.errors.validation,
  INVALID_CREDENTIALS: "این شماره در سامانه ثبت نشده است.",
  ERROR_OTP_INVALID: "کد واردشده نادرست است.",
  ERROR_TOKEN_REQUIRED: messages.errors.unauthorized,
  UNAUTHORIZED: messages.errors.unauthorized,
  FORBIDDEN: messages.errors.forbidden,
  NOT_FOUND: messages.errors.notFound,
  USER_NOT_FOUND: messages.errors.notFound,
  TOO_MANY_REQUESTS: "تعداد درخواست‌ها بیش از حد مجاز است. کمی بعد دوباره تلاش کنید.",
  INTERNAL_SERVER_ERROR: "خطای داخلی سرور رخ داد. کمی بعد دوباره تلاش کنید.",
};

type ApiErrorInit = {
  message: string;
  statusCode: number;
  errorCode?: string | null;
  fieldErrors?: ApiFieldError[];
  details?: string | null;
};

export class ApiError extends Error {
  /** The HTTP status, or `0` when the request never reached the backend. */
  readonly statusCode: number;
  readonly errorCode: string | null;
  readonly fieldErrors: ApiFieldError[];
  readonly details: string | null;

  constructor(init: ApiErrorInit) {
    super(init.message);
    this.name = "ApiError";
    this.statusCode = init.statusCode;
    this.errorCode = init.errorCode ?? null;
    this.fieldErrors = init.fieldErrors ?? [];
    this.details = init.details ?? null;
  }

  /** The request failed before the backend answered — DNS, offline, timeout. */
  static network(): ApiError {
    return new ApiError({ message: messages.errors.network, statusCode: 0 });
  }

  static fromEnvelope(envelope: ApiFailure): ApiError {
    const { statusCode, errorCode, errorDetails } = envelope;
    const fieldErrors = Array.isArray(errorDetails) ? errorDetails : [];
    const details = typeof errorDetails === "string" ? errorDetails : null;

    const message =
      (errorCode ? ERROR_CODE_MESSAGES[errorCode] : undefined) ??
      details ??
      messages.errors.unexpected;

    return new ApiError({ message, statusCode, errorCode, fieldErrors, details });
  }

  /** The response was not an envelope at all — a gateway, an HTML error page. */
  static unreadable(statusCode: number): ApiError {
    return new ApiError({ message: messages.errors.unexpected, statusCode });
  }

  get isNetworkFailure(): boolean {
    return this.statusCode === 0;
  }

  get isUnauthorized(): boolean {
    return this.statusCode === 401;
  }
}

/**
 * Converts anything thrown inside a Route Handler into the response shape the
 * browser expects. Unknown errors are deliberately flattened: an internal
 * message is noise to the user and potential disclosure.
 */
export function toActionFailure(error: unknown): ActionFailure {
  if (error instanceof ApiError) {
    return { ok: false, message: error.message, fieldErrors: error.fieldErrors };
  }

  return { ok: false, message: messages.errors.unexpected, fieldErrors: [] };
}
