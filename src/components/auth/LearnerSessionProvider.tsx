// src/components/auth/LearnerSessionProvider.tsx
'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldOff } from 'lucide-react';
import { ApiError } from '@/lib/api-error';
import { toApiError } from '@/lib/async-state';
import { SESSION_EXPIRED_EVENT, clearStoredToken } from '@/lib/session';
import { fetchCurrentLearner, hasLearnerSession, signOut as endSession, type AccountStatus, type LearnerUser } from '@/lib/learner-auth';
import { ErrorState, LoadingState } from '@/components/ui/states';

interface LearnerSession {
  user: LearnerUser;
  accountStatus: AccountStatus;
  /** Re-reads GET /auth/me (e.g. after a profile change or unfreezing); resolves once the new state is applied. */
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const LearnerSessionContext = createContext<LearnerSession | null>(null);

export function useLearnerSession(): LearnerSession {
  const session = useContext(LearnerSessionContext);
  if (!session) throw new Error('useLearnerSession must be used inside <LearnerSessionProvider>');
  return session;
}

/** Same as useLearnerSession, but null outside the provider (for components shared with public pages). */
export function useOptionalLearnerSession(): LearnerSession | null {
  return useContext(LearnerSessionContext);
}

type GateState =
  | { kind: 'checking' }
  | { kind: 'authenticated'; user: LearnerUser; accountStatus: AccountStatus }
  | { kind: 'restricted'; message: string }
  | { kind: 'error'; error: ApiError };

export const LEARNER_LOGIN_PATH = '/auth/login';
/** Frozen accounts may only see this page (the backend refuses them everywhere else with 403 ACCOUNT_FROZEN). */
export const FROZEN_ACCOUNT_PATH = '/account-state';

/**
 * Gate for every learner page in src/app/(dashboard).
 * Nothing renders until the BACKEND confirms the session (GET /auth/me, JwtAuthGuard + account status).
 * - no token / 401 → sign-in page (?next= returns here afterwards)
 * - 403 ACCOUNT_RESTRICTED → restricted screen; the app is not shown
 * - accountStatus 'frozen' → /account-state, where the learner can unfreeze
 * - network / timeout / 503 → error with retry (the token is kept)
 * A 401 from any later request triggers one re-check of /auth/me before signing out, so an
 * endpoint that answers 401 for another reason (e.g. "Incorrect old password") does not end the session.
 */
export function LearnerSessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<GateState>({ kind: 'checking' });
  const [attempt, setAttempt] = useState(0);
  const recheckInFlight = useRef(false);

  const goToLogin = useCallback(
    (reason?: 'expired') => {
      clearStoredToken('learner');
      const next = encodeURIComponent(pathname || '/dashboard');
      router.replace(`${LEARNER_LOGIN_PATH}?next=${next}${reason ? `&reason=${reason}` : ''}`);
    },
    [router, pathname],
  );

  const handleFailure = useCallback(
    (err: unknown) => {
      const error = toApiError(err);
      if (error.kind === 'aborted') return;
      if (error.kind === 'unauthorized') return goToLogin('expired');
      if (error.code === 'ACCOUNT_RESTRICTED') {
        clearStoredToken('learner');
        return setState({ kind: 'restricted', message: error.message });
      }
      setState({ kind: 'error', error });
    },
    [goToLogin],
  );

  useEffect(() => {
    if (!hasLearnerSession()) {
      goToLogin();
      return;
    }
    const controller = new AbortController();
    fetchCurrentLearner(controller.signal)
      .then((res) => {
        if (!controller.signal.aborted) setState({ kind: 'authenticated', user: res.user, accountStatus: res.accountStatus });
      })
      .catch((err) => {
        if (!controller.signal.aborted) handleFailure(err);
      });
    return () => controller.abort();
    // pathname is intentionally not a dependency: navigation inside the app does not re-check the session
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  // A frozen account can only use the account-state page
  useEffect(() => {
    if (state.kind === 'authenticated' && state.accountStatus === 'frozen' && pathname !== FROZEN_ACCOUNT_PATH) {
      router.replace(FROZEN_ACCOUNT_PATH);
    }
  }, [state, pathname, router]);

  // Any learner request answered with 401: confirm with /auth/me once, then sign out if the session is really gone
  useEffect(() => {
    const onExpired = (event: Event) => {
      const scope = (event as CustomEvent<{ scope?: string }>).detail?.scope;
      if (scope !== 'learner' || recheckInFlight.current) return;
      recheckInFlight.current = true;
      fetchCurrentLearner()
        .then((res) => setState({ kind: 'authenticated', user: res.user, accountStatus: res.accountStatus }))
        .catch(handleFailure)
        .finally(() => {
          recheckInFlight.current = false;
        });
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, [handleFailure]);

  const signOut = useCallback(async () => {
    await endSession();
    router.replace(LEARNER_LOGIN_PATH);
  }, [router]);

  if (state.kind === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0b0f19] p-6">
        <LoadingState layout="detail" label="Checking your session…" className="w-full max-w-md" />
      </div>
    );
  }

  if (state.kind === 'restricted') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0b0f19] p-6">
        <div role="alert" className="max-w-md w-full bg-white dark:bg-[#111827] rounded-3xl border border-gray-200 dark:border-gray-800 p-8 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
            <ShieldOff className="w-6 h-6 text-[var(--color-brand-red)]" aria-hidden="true" />
          </div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Account restricted</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{state.message}</p>
          <Link href="/support" className="inline-block text-sm font-semibold text-[var(--color-brand-blue)] hover:underline">
            Contact support
          </Link>
        </div>
      </main>
    );
  }

  if (state.kind === 'error') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0b0f19] p-6">
        <ErrorState error={state.error} onRetry={() => { setState({ kind: 'checking' }); setAttempt((n) => n + 1); }} className="w-full max-w-md" />
      </main>
    );
  }

  // Frozen account on another page: render nothing while redirecting to /account-state
  if (state.accountStatus === 'frozen' && pathname !== FROZEN_ACCOUNT_PATH) {
    return null;
  }

  return (
    <LearnerSessionContext.Provider
      value={{
        user: state.user,
        accountStatus: state.accountStatus,
        refresh: () =>
          fetchCurrentLearner()
            .then((res) => setState({ kind: 'authenticated', user: res.user, accountStatus: res.accountStatus }))
            .catch(handleFailure),
        signOut,
      }}
    >
      {children}
    </LearnerSessionContext.Provider>
  );
}
