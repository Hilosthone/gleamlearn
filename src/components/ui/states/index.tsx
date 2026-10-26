// src/components/ui/states/index.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, Inbox, RefreshCw, ShieldAlert, WifiOff, AlertTriangle, type LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import type { ApiError } from '@/lib/api-error';
import { errorMessage, recoveryHint } from '@/lib/api-error';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

const card = 'bg-white dark:bg-[#111827] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs';

// ---------------------------------------------------------------------------
// Loading
// ---------------------------------------------------------------------------

type SkeletonLayout = 'list' | 'cards' | 'table' | 'detail';

interface LoadingStateProps {
  layout?: SkeletonLayout;
  rows?: number;
  label?: string;
  className?: string;
}

/** Skeleton placeholder shaped like the content it replaces, announced to screen readers once. */
export function LoadingState({ layout = 'list', rows = 4, label = 'Loading…', className = '' }: LoadingStateProps) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className={`space-y-4 ${className}`}>
      <span className="sr-only">{label}</span>
      {layout === 'cards' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className={`${card} p-5 space-y-3`}>
              <Skeleton className="h-3 w-20 rounded-md" />
              <Skeleton className="h-8 w-24 rounded-lg" />
              <Skeleton className="h-2.5 w-16 rounded-md" />
            </div>
          ))}
        </div>
      )}
      {layout === 'list' &&
        Array.from({ length: rows }).map((_, i) => (
          <div key={i} className={`${card} p-4 flex items-center gap-4`}>
            <Skeleton className="w-11 h-11 shrink-0 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-3/5 rounded-md" />
              <Skeleton className="h-2.5 w-2/5 rounded-md" />
            </div>
          </div>
        ))}
      {layout === 'table' && (
        <div className={`${card} p-4 space-y-3`}>
          <Skeleton className="h-4 w-1/3 rounded-md" />
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-lg" />
          ))}
        </div>
      )}
      {layout === 'detail' && (
        <div className={`${card} p-6 space-y-4`}>
          <Skeleton className="h-6 w-1/2 rounded-lg" />
          <Skeleton className="h-3 w-full rounded-md" />
          <Skeleton className="h-3 w-5/6 rounded-md" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      )}
    </div>
  );
}

/** Calm, non-alarming notice for requests that are slower than usual. Never implies failure. */
export function SlowNotice({ message }: { message?: string }) {
  return (
    <p role="status" aria-live="polite" className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
      <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      {message ?? 'This is taking longer than usual. Your request is still in progress — no need to resend it.'}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Empty
// ---------------------------------------------------------------------------

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/** Explains why there is nothing here and offers the next useful action. */
export function EmptyState({ icon: Icon = Inbox, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`${card} p-8 flex flex-col items-center text-center gap-3 ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
        <Icon className="w-6 h-6 text-[var(--color-brand-blue)]" aria-hidden="true" />
      </div>
      <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
      {description && <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm">{description}</p>}
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Not available yet
// ---------------------------------------------------------------------------

interface FeatureUnavailableProps {
  title: string;
  /** What is missing, in learner terms. */
  description: string;
  /** e.g. a link back to something that does work */
  action?: React.ReactNode;
  className?: string;
}

/**
 * For features that are not built yet (backend 501 FEATURE_UNAVAILABLE, or screens with no backend support).
 * Neutral, not an error: it never simulates progress or success and offers no retry.
 */
export function FeatureUnavailable({ title, description, action, className = '' }: FeatureUnavailableProps) {
  return (
    <div role="status" className={`${card} p-8 flex flex-col items-center text-center gap-3 ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
        <Clock className="w-6 h-6 text-[var(--color-brand-gold)]" aria-hidden="true" />
      </div>
      <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm">{description}</p>
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error
// ---------------------------------------------------------------------------

function errorTitle(error: ApiError, isOnline: boolean): string {
  if (!isOnline || error.kind === 'network') return 'You appear to be offline';
  switch (error.kind) {
    case 'unauthorized':
      return 'Your session has ended';
    case 'forbidden':
      return 'You do not have access to this';
    case 'not_found':
      return 'Not found';
    case 'rate_limited':
      return error.code === 'AI_RATE_LIMITED' ? 'AI limit reached for now' : 'Slow down a little';
    case 'timeout':
      return 'This took too long';
    case 'ai_unavailable':
      return error.code === 'AI_PROVIDER_BUSY' || error.code === 'AI_PROVIDER_QUOTA' ? 'AI is at capacity' : 'Service temporarily unavailable';
    case 'validation':
      return 'Please check the details';
    case 'not_implemented':
      return 'Not available yet';
    default:
      return 'Something went wrong';
  }
}

interface ErrorStateProps {
  error: ApiError;
  onRetry?: () => void;
  /** Where "sign in again" should go for this area (learner vs admin). */
  signInHref?: string;
  /** Inline banner instead of a full card (e.g. above data that is still shown). */
  compact?: boolean;
  className?: string;
}

/**
 * User-facing error with a recovery action matched to the failure:
 * sign in again (401), retry (transient), or nothing to retry (validation / forbidden).
 * Shows only the normalized message — never stack traces or provider details.
 */
export function ErrorState({ error, onRetry, signInHref = '/auth/login', compact = false, className = '' }: ErrorStateProps) {
  const isOnline = useOnlineStatus();
  // 501 FEATURE_UNAVAILABLE is not a failure: say plainly that the feature does not exist yet (no retry)
  if (isOnline && error.kind === 'not_implemented' && !compact) {
    return <FeatureUnavailable title={errorTitle(error, isOnline)} description={recoveryHint('not_implemented')} className={className} />;
  }
  const offline = !isOnline || error.kind === 'network';
  const message = offline ? recoveryHint('network') : errorMessage(error);
  const canRetry = Boolean(onRetry) && (offline || error.isTransient || error.kind === 'unknown');

  const action =
    error.kind === 'unauthorized' ? (
      <Link href={signInHref} className="text-xs font-semibold text-[var(--color-brand-blue)] underline">
        Sign in again
      </Link>
    ) : canRetry ? (
      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
        Try again
      </Button>
    ) : null;

  if (compact) {
    return (
      <Alert variant={offline ? 'offline' : 'error'} title={errorTitle(error, isOnline)} action={action} className={className}>
        {message}
      </Alert>
    );
  }

  const Icon = offline ? WifiOff : error.kind === 'forbidden' || error.kind === 'unauthorized' ? ShieldAlert : AlertTriangle;
  return (
    <div role="alert" className={`${card} p-8 flex flex-col items-center text-center gap-3 ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
        <Icon className="w-6 h-6 text-[var(--color-brand-red)]" aria-hidden="true" />
      </div>
      <h3 className="text-sm font-bold text-gray-900 dark:text-white">{errorTitle(error, isOnline)}</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm">{message}</p>
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Offline banner
// ---------------------------------------------------------------------------

/** Global connectivity banner. Appears only when the browser reports it is offline. */
export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;
  return (
    <div role="status" aria-live="polite" className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-gray-900 text-white text-xs font-semibold px-4 py-2">
      <WifiOff className="w-3.5 h-3.5" aria-hidden="true" />
      You are offline. Changes will not be saved until your connection returns.
    </div>
  );
}

// ---------------------------------------------------------------------------
// Query boundary
// ---------------------------------------------------------------------------

interface QueryStateProps<T> {
  query: {
    data: T | undefined;
    error: ApiError | null;
    isLoading: boolean;
    isRefreshing: boolean;
    isSlow: boolean;
    retry: () => void;
  };
  isEmpty?: (data: T) => boolean;
  loading?: React.ReactNode;
  empty?: React.ReactNode;
  signInHref?: string;
  children: (data: T) => React.ReactNode;
}

/**
 * Renders the right state for a useApiQuery result:
 * loading skeleton → error (with retry) → empty → data.
 * When a refresh fails, the previously loaded data stays visible under a compact error.
 */
export function QueryState<T>({ query, isEmpty, loading, empty, signInHref, children }: QueryStateProps<T>) {
  const { data, error, isLoading, isRefreshing, isSlow, retry } = query;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {loading ?? <LoadingState />}
        {isSlow && <SlowNotice />}
      </div>
    );
  }
  if (error && data === undefined) {
    return <ErrorState error={error} onRetry={retry} signInHref={signInHref} />;
  }
  if (data === undefined) return null;
  if (isEmpty?.(data)) return <>{empty ?? <EmptyState title="Nothing here yet" />}</>;

  return (
    <div className="space-y-3">
      {error && <ErrorState error={error} onRetry={retry} signInHref={signInHref} compact />}
      {isRefreshing && isSlow && <SlowNotice message="Refreshing is taking longer than usual." />}
      {children(data)}
    </div>
  );
}
