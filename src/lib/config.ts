/**
 * ---------------------------------------------------------------------------
 * lib/config.ts — Client configuration (single source for API URLs)
 * ---------------------------------------------------------------------------
 * Only NEXT_PUBLIC_* values are available in the browser. Never put secrets here:
 * everything in this file ships to every visitor.
 */

/**
 * Backend base URL including the `/api/v1` prefix.
 * Kept identical to the previous fallback in lib/api.ts so deployments that do not
 * set NEXT_PUBLIC_API_URL keep working. Set NEXT_PUBLIC_API_URL explicitly per environment.
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gleamlearn-backend.onrender.com/api/v1';

/** Default request timeout. The backend itself allows up to 120s for AI calls. */
export const DEFAULT_REQUEST_TIMEOUT_MS = 30_000;

/** Timeout for AI generation requests (backend AI_HTTP_TIMEOUT_MS is 120s plus a Render cold start). */
export const AI_REQUEST_TIMEOUT_MS = 150_000;

/** After this long, the UI tells the user an operation is slower than usual (never treated as failure). */
export const SLOW_REQUEST_THRESHOLD_MS = 8_000;
