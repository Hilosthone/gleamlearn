/**
 * ---------------------------------------------------------------------------
 * lib/async-state.ts — Pure helpers shared by the request hooks
 * ---------------------------------------------------------------------------
 * Kept framework-free so the rules can be unit-tested with `node --test`.
 */

import { ApiError } from './api-error.ts';

export type AsyncStatus = 'idle' | 'pending' | 'success' | 'error';

/** Converts anything thrown into an ApiError without leaking unknown internals. */
export function toApiError(error: unknown, fallbackMessage = 'Something went wrong. Please try again.'): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof DOMException && error.name === 'AbortError') {
    return new ApiError('The request was cancelled.', null, 'aborted');
  }
  return new ApiError(fallbackMessage, null, 'unknown');
}

/** Cancellations are not failures: they must never show an error state. */
export function isCancellation(error: unknown): boolean {
  return error instanceof ApiError && error.kind === 'aborted';
}

/**
 * Guards a single in-flight operation. `tryStart` returns false while another run is
 * active, which is how duplicate submissions are ignored.
 */
export function createSingleFlight() {
  let active = false;
  return {
    tryStart(): boolean {
      if (active) return false;
      active = true;
      return true;
    },
    finish(): void {
      active = false;
    },
    get active(): boolean {
      return active;
    },
  };
}
