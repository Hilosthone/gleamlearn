/**
 * ---------------------------------------------------------------------------
 * lib/session.ts — Token storage and session-expiry notifications
 * ---------------------------------------------------------------------------
 * Learner and admin sessions are stored under separate keys and never share a token.
 *
 * IMPORTANT: a stored token is only a credential to send to the backend. Its presence
 * does NOT grant access to anything: every protected endpoint is authorized by the
 * backend (JwtAuthGuard for learners, AdminJwtGuard for admins), and the admin UI only
 * renders privileged data that the backend actually returned.
 *
 * SSR-safe: all storage access is guarded for `window` and wrapped in try/catch
 * (storage can be unavailable in private mode or when blocked).
 */

export type SessionScope = 'learner' | 'admin';

const TOKEN_KEYS: Record<SessionScope, string> = {
  learner: 'accessToken', // pre-existing key used by lib/api.ts
  admin: 'gleamlearn.adminAccessToken',
};

export const SESSION_EXPIRED_EVENT = 'gleamlearn:session-expired';

function storage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getStoredToken(scope: SessionScope): string | null {
  try {
    return storage()?.getItem(TOKEN_KEYS[scope]) ?? null;
  } catch {
    return null;
  }
}

export function setStoredToken(scope: SessionScope, token: string): void {
  try {
    storage()?.setItem(TOKEN_KEYS[scope], token);
  } catch {
    // Storage unavailable: the session simply will not persist across reloads.
  }
}

export function clearStoredToken(scope: SessionScope): void {
  try {
    storage()?.removeItem(TOKEN_KEYS[scope]);
  } catch {
    // ignore
  }
}

/** Broadcasts that the backend rejected the session (HTTP 401) for a scope. */
export function notifySessionExpired(scope: SessionScope): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT, { detail: { scope } }));
}
