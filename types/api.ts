/**
 * The shape every backend endpoint wraps its payload in. See `AGENTS.md`.
 *
 * A `200` always uses the success branch; every failure uses the error branch.
 * `errorDetails` is a `{ field, message }[]` for validation errors but a plain
 * string for upload/delete errors, which is why it is modelled as a union.
 */

export type ApiFieldError = {
  field: string;
  message: string;
};

export type ApiSuccess<T> = {
  success: true;
  timestamp: string;
  statusCode: number;
  errorCode: null;
  message: string;
  data: T;
  error: null;
  errorDetails: null;
};

export type ApiFailure = {
  success: false;
  timestamp: string;
  statusCode: number;
  errorCode: string | null;
  message: string;
  data: null;
  error: unknown;
  errorDetails: ApiFieldError[] | string | null;
};

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

/**
 * The `data` of every `search` endpoint. Note the key is `result`, not the
 * Mongoose default `docs`.
 */
export type Paginated<T> = {
  result: T[];
  meta: PaginationMeta;
};

export type PaginationMeta = {
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
};
