/**
 * ---------------------------------------------------------------------------
 * lib/api-error.ts — Normalized API error
 * ---------------------------------------------------------------------------
 * Every failed request made through lib/api.ts throws an ApiError.
 * It extends Error with the same message as before, so existing
 * `catch (err) { err.message }` code keeps working, and adds a `status` and
 * a `kind` the UI can use to choose the right recovery action.
 *
 * Kept dependency-free (no path aliases) so it can be unit-tested with `node --test`.
 */

export type ApiErrorKind =
  | 'validation' // 400 / 422 — the user can fix the input
  | 'unauthorized' // 401 — session missing or expired: sign in again
  | 'forbidden' // 403
  | 'not_found' // 404
  | 'conflict' // 409
  | 'payload_too_large' // 413
  | 'unsupported' // 415
  | 'rate_limited' // 429 — wait and retry
  | 'ai_unavailable' // 502 / 503 from the backend — AI or upstream service problem
  | 'timeout' // 504, or the request exceeded the client timeout
  | 'not_implemented' // 501 — the feature is not available yet (code FEATURE_UNAVAILABLE); retrying never helps
  | 'server' // other 5xx
  | 'network' // no response at all (offline, DNS, CORS, connection refused)
  | 'aborted' // cancelled by the caller
  | 'unknown';

export class ApiError extends Error {
  readonly status: number | null;
  readonly kind: ApiErrorKind;
  /** Field-level messages when the backend returned a validation array. */
  readonly details: string[];
  /** Machine-readable reason when the backend provides one, e.g. 'ACCOUNT_RESTRICTED', 'ACCOUNT_FROZEN'. */
  readonly code: string | null;
  /** How long the server asked us to wait (429 / provider busy), from the body or the Retry-After header. */
  readonly retryAfterSeconds: number | null;

  constructor(message: string, status: number | null, kind: ApiErrorKind, details: string[] = [], code: string | null = null, retryAfterSeconds: number | null = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.kind = kind;
    this.details = details;
    this.code = code;
    this.retryAfterSeconds = retryAfterSeconds;
  }

  /** True when retrying the same request later may succeed without user changes. */
  get isTransient(): boolean {
    return ['rate_limited', 'ai_unavailable', 'timeout', 'server', 'network'].includes(this.kind);
  }
}

export function kindFromStatus(status: number): ApiErrorKind {
  if (status === 400 || status === 422) return 'validation';
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  if (status === 409) return 'conflict';
  if (status === 413) return 'payload_too_large';
  if (status === 415) return 'unsupported';
  if (status === 429) return 'rate_limited';
  if (status === 502 || status === 503) return 'ai_unavailable';
  if (status === 504) return 'timeout';
  if (status === 501) return 'not_implemented';
  if (status >= 500) return 'server';
  return 'unknown';
}

/**
 * Builds an ApiError from a backend error body.
 * NestJS returns `{ statusCode, message, error }`, where `message` may be a string
 * or (for validation failures) an array of strings.
 */
export function apiErrorFromResponse(status: number, statusText: string, body: unknown, retryAfterHeaderSeconds?: number): ApiError {
  const data = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  const rawMessage = data.message ?? data.error;
  const details = Array.isArray(rawMessage) ? rawMessage.filter((m): m is string => typeof m === 'string') : [];
  const message =
    details.length > 0
      ? details.join('; ')
      : typeof rawMessage === 'string' && rawMessage
        ? rawMessage
        : `API Error: ${status} ${statusText}`.trim();
  const code = typeof data.code === 'string' ? data.code : null;
  const bodyWait = typeof data.retryAfterSeconds === 'number' && data.retryAfterSeconds > 0 ? Math.ceil(data.retryAfterSeconds) : null;
  const headerWait = retryAfterHeaderSeconds !== undefined && retryAfterHeaderSeconds > 0 ? Math.ceil(retryAfterHeaderSeconds) : null;
  return new ApiError(message, status, kindFromStatus(status), details, code, bodyWait ?? headerWait);
}

/** Short, user-facing guidance for an error kind (never includes server internals). */
/**
 * Error codes whose message is written by GleamLearn for learners (safe to show as-is): our own rate limit, the AI
 * provider's capacity or quota, AI outages and timeouts. They are more precise than the generic hint per kind.
 */
const SERVER_WORDED_CODES = new Set(['RATE_LIMITED', 'AI_RATE_LIMITED', 'AI_PROVIDER_BUSY', 'AI_PROVIDER_QUOTA', 'AI_UNAVAILABLE', 'AI_TIMEOUT', 'AI_FAILED']);

/** The message to show for an error: the server's own wording for coded errors, else the generic hint for its kind. */
export function errorMessage(error: ApiError): string {
  if (error.code && SERVER_WORDED_CODES.has(error.code) && error.message) return error.message;
  return recoveryHint(error.kind) || error.message;
}

export function recoveryHint(kind: ApiErrorKind): string {
  switch (kind) {
    case 'unauthorized':
      return 'Your session has expired. Please sign in again.';
    case 'rate_limited':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'timeout':
      return 'The request took too long. Please try again.';
    case 'ai_unavailable':
      return 'The service is temporarily unavailable. Please try again shortly.';
    case 'network':
      return 'We could not reach GleamLearn. Check your internet connection and try again.';
    case 'not_implemented':
      return 'This feature is not available yet.';
    case 'server':
      return 'Something went wrong on our side. Please try again later.';
    default:
      return '';
  }
}
