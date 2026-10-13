// src/components/admin/AdminSessionProvider.tsx
'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminAuthApi, type AdminPermissionName, type AdminProfile } from '@/lib/admin-api';
import { ApiError } from '@/lib/api-error';
import { toApiError } from '@/lib/async-state';
import { SESSION_EXPIRED_EVENT, clearStoredToken } from '@/lib/session';
import { ErrorState, LoadingState } from '@/components/ui/states';

interface AdminSession {
  admin: AdminProfile;
  /**
   * Whether the backend reported this permission for the admin's role (from GET /admin/auth/me).
   * UI hint only — every request is still authorized by the backend, which returns 403 otherwise.
   */
  can: (permission: AdminPermissionName) => boolean;
  logout: () => Promise<void>;
}

const AdminSessionContext = createContext<AdminSession | null>(null);

export function useAdminSession(): AdminSession {
  const session = useContext(AdminSessionContext);
  if (!session) throw new Error('useAdminSession must be used inside <AdminSessionProvider>');
  return session;
}

type GateState =
  | { kind: 'checking' }
  | { kind: 'authenticated'; admin: AdminProfile }
  | { kind: 'error'; error: ApiError };

export const ADMIN_LOGIN_PATH = '/admin/login';

/**
 * Gate for every admin console page.
 * Nothing privileged renders until the BACKEND confirms the session (GET /admin/auth/me,
 * protected by AdminJwtAuthGuard). A token in localStorage alone never grants access:
 * a missing, expired, forged or learner token is rejected by the backend and the user is
 * sent to the admin sign-in page.
 */
export function AdminSessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<GateState>({ kind: 'checking' });
  const [attempt, setAttempt] = useState(0);

  const goToLogin = useCallback(
    (reason?: 'expired') => {
      clearStoredToken('admin');
      router.replace(reason ? `${ADMIN_LOGIN_PATH}?reason=${reason}` : ADMIN_LOGIN_PATH);
    },
    [router],
  );

  useEffect(() => {
    if (!adminAuthApi.hasStoredSession()) {
      goToLogin();
      return;
    }
    const controller = new AbortController();
    adminAuthApi
      .me({ signal: controller.signal })
      .then((res) => {
        if (!controller.signal.aborted) setState({ kind: 'authenticated', admin: res.data });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const error = toApiError(err);
        if (error.kind === 'aborted') return;
        if (error.kind === 'unauthorized' || error.kind === 'forbidden') {
          goToLogin('expired');
          return;
        }
        // 503 (admin auth not configured), network, timeout, server errors: show, allow retry
        setState({ kind: 'error', error });
      });
    return () => controller.abort();
  }, [attempt, goToLogin]);

  // Any admin request that gets a 401 later ends the session everywhere in the console
  useEffect(() => {
    const onExpired = (event: Event) => {
      const scope = (event as CustomEvent<{ scope?: string }>).detail?.scope;
      if (scope === 'admin') goToLogin('expired');
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, [goToLogin]);

  const logout = useCallback(async () => {
    await adminAuthApi.logout();
    router.replace(ADMIN_LOGIN_PATH);
  }, [router]);

  if (state.kind === 'checking') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0b0f19] p-6 sm:p-10">
        <LoadingState layout="cards" rows={4} label="Checking your admin session…" />
      </div>
    );
  }

  if (state.kind === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0b0f19] p-6 sm:p-10 flex items-center justify-center">
        <div className="w-full max-w-md">
          <ErrorState
            error={
              state.error.status === 503
                ? new ApiError(
                    'Admin access is temporarily unavailable because admin authentication is not configured on the server. Please contact the platform owner.',
                    503,
                    'unknown', // 'unknown' has no generic hint, so this specific message is shown
                  )
                : state.error
            }
            onRetry={() => {
              setState({ kind: 'checking' });
              setAttempt((n) => n + 1);
            }}
            signInHref={ADMIN_LOGIN_PATH}
          />
        </div>
      </div>
    );
  }

  return (
    <AdminSessionContext.Provider
      value={{ admin: state.admin, can: (p) => Boolean(state.admin.permissions?.includes(p)), logout }}
    >
      {children}
    </AdminSessionContext.Provider>
  );
}
