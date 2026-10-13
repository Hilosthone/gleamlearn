/**
 * ---------------------------------------------------------------------------
 * lib/http-client.ts — Shared HTTP request core
 * ---------------------------------------------------------------------------
 * The single fetch wrapper used by every API module (lib/api.ts for learners,
 * lib/admin-api.ts for administrators). Responsibilities:
 *   - base URL, JSON/FormData bodies, bearer token injection
 *   - request timeout + caller cancellation (AbortSignal)
 *   - typed errors (ApiError) for every failure, including network and timeout
 *   - bounded retries with exponential backoff + jitter, ONLY for idempotent
 *     requests (GET/HEAD by default) and only for transient failures
 *   - a session-expired notification when the backend answers 401
 *
 * Dependency-free and alias-free so it can be unit-tested with `node --test`.
 */

import { ApiError, apiErrorFromResponse, recoveryHint } from './api-error.ts';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD';

export interface HttpRequestOptions {
  method?: HttpMethod;
  body?: unknown;
  /** Explicit bearer token. When omitted, `getToken` of the client config is used. */
  token?: string;
  headers?: Record<string, string>;
  /** Cancels the request (e.g. on component unmount). Results in ApiError kind 'aborted'. */
  signal?: AbortSignal;
  /** Overrides the client default timeout. 0 disables the timeout. */
  timeoutMs?: number;
  /** Retries for transient failures. Defaults to the client setting for idempotent methods, 0 otherwise. */
  retries?: number;
  /**
   * Allows retries for a non-GET request. Only set this when repeating the request
   * cannot create duplicates (the server de-duplicates or the operation is a pure read).
   */
  idempotent?: boolean;
}

export interface HttpClientConfig {
  baseUrl: string;
  /** Token lookup used when a request does not pass `token`. */
  getToken?: () => string | null | undefined;
  /** Default timeout for every request (ms). */
  timeoutMs?: number;
  /** Default retry count for idempotent requests. */
  retries?: number;
  /** Called once per 401 response (e.g. to show "session expired"). */
  onUnauthorized?: (error: ApiError) => void;
  /** Injection points for tests. */
  fetchImpl?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
  random?: () => number;
}

export const DEFAULT_TIMEOUT_MS = 30_000;
export const DEFAULT_RETRIES = 2;
const BACKOFF_BASE_MS = 500;
const BACKOFF_MAX_MS = 5_000;

const RETRYABLE_STATUSES = new Set([408, 429, 502, 503, 504]);

function isRetryable(error: ApiError): boolean {
  if (error.kind === 'aborted') return false;
  if (error.kind === 'network' || error.kind === 'timeout') return true;
  return error.status !== null && RETRYABLE_STATUSES.has(error.status);
}

/** Exponential backoff with full jitter, capped. attempt starts at 1. */
export function backoffDelay(attempt: number, random: () => number = Math.random, retryAfterMs?: number): number {
  if (retryAfterMs !== undefined && retryAfterMs >= 0) return Math.min(retryAfterMs, BACKOFF_MAX_MS);
  const ceiling = Math.min(BACKOFF_MAX_MS, BACKOFF_BASE_MS * 2 ** (attempt - 1));
  return Math.round(random() * ceiling);
}

function parseRetryAfter(value: string | null): number | undefined {
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return seconds * 1000;
  const date = Date.parse(value);
  return Number.isNaN(date) ? undefined : Math.max(0, date - Date.now());
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function createHttpClient(config: HttpClientConfig) {
  const fetchImpl = config.fetchImpl ?? ((...args: Parameters<typeof fetch>) => fetch(...args));
  const sleep = config.sleep ?? defaultSleep;
  const random = config.random ?? Math.random;
  const baseUrl = config.baseUrl.replace(/\/+$/, '');

  async function attempt<T>(endpoint: string, options: HttpRequestOptions): Promise<{ data: T } | { error: ApiError; retryAfterMs?: number }> {
    const { method = 'GET', body, headers = {}, signal } = options;
    const timeoutMs = options.timeoutMs ?? config.timeoutMs ?? DEFAULT_TIMEOUT_MS;

    const requestHeaders: Record<string, string> = { ...headers };
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    if (!isFormData && body !== undefined) {
      requestHeaders['Content-Type'] = 'application/json';
    }
    const token = options.token ?? config.getToken?.();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    // One controller per attempt: aborted by the caller's signal or by the timeout
    const controller = new AbortController();
    let timedOut = false;
    const onCallerAbort = () => controller.abort();
    if (signal) {
      if (signal.aborted) return { error: new ApiError('The request was cancelled.', null, 'aborted') };
      signal.addEventListener('abort', onCallerAbort, { once: true });
    }
    const timer =
      timeoutMs > 0
        ? setTimeout(() => {
            timedOut = true;
            controller.abort();
          }, timeoutMs)
        : undefined;

    try {
      let response: Response;
      try {
        response = await fetchImpl(`${baseUrl}${endpoint}`, {
          method,
          headers: requestHeaders,
          body: isFormData ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });
      } catch {
        if (timedOut) return { error: new ApiError(recoveryHint('timeout'), null, 'timeout') };
        if (signal?.aborted) return { error: new ApiError('The request was cancelled.', null, 'aborted') };
        // fetch rejects only when no HTTP response was received (offline, DNS, CORS, connection refused)
        return { error: new ApiError(recoveryHint('network'), null, 'network') };
      }

      let data: unknown = null;
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        return {
          error: apiErrorFromResponse(response.status, response.statusText, data),
          retryAfterMs: parseRetryAfter(response.headers.get('Retry-After')),
        };
      }
      return { data: data as T };
    } finally {
      if (timer) clearTimeout(timer);
      signal?.removeEventListener('abort', onCallerAbort);
    }
  }

  async function request<T>(endpoint: string, options: HttpRequestOptions = {}): Promise<T> {
    const method = options.method ?? 'GET';
    const idempotent = options.idempotent ?? (method === 'GET' || method === 'HEAD');
    const maxRetries = idempotent ? (options.retries ?? config.retries ?? DEFAULT_RETRIES) : 0;

    for (let attemptNo = 0; ; attemptNo++) {
      const result = await attempt<T>(endpoint, options);
      if ('data' in result) return result.data;

      const { error } = result;
      if (error.kind === 'unauthorized') {
        config.onUnauthorized?.(error);
        throw error;
      }
      if (attemptNo >= maxRetries || !isRetryable(error) || options.signal?.aborted) {
        throw error;
      }
      await sleep(backoffDelay(attemptNo + 1, random, result.retryAfterMs));
      if (options.signal?.aborted) throw new ApiError('The request was cancelled.', null, 'aborted');
    }
  }

  return { request, baseUrl };
}

export type HttpClient = ReturnType<typeof createHttpClient>;
