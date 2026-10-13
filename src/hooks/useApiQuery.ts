'use client';

import { useCallback, useEffect, useEffectEvent, useState } from 'react';
import type { ApiError } from '@/lib/api-error';
import { isCancellation, toApiError, type AsyncStatus } from '@/lib/async-state';
import { useSlowFlag } from './useSlowFlag';

export interface ApiQueryState<T> {
  data: T | undefined;
  error: ApiError | null;
  status: AsyncStatus;
  /** True for the first load (no data yet). */
  isLoading: boolean;
  /** True while reloading data that is already shown. */
  isRefreshing: boolean;
  /** True when the current request is taking longer than usual. */
  isSlow: boolean;
  /** Re-runs the request (e.g. a "Try again" button). */
  retry: () => void;
}

function sameDeps(a: readonly unknown[], b: readonly unknown[]): boolean {
  return a.length === b.length && a.every((value, i) => Object.is(value, b[i]));
}

/**
 * Loads data when the component mounts and whenever `deps` change.
 * - Each run gets an AbortSignal; the previous run is cancelled when deps change
 *   or the component unmounts, so stale responses never overwrite newer state.
 * - Previously loaded data is kept while refreshing and when a refresh fails.
 * - Pass `enabled: false` to wait (e.g. until an id is known).
 */
export function useApiQuery<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: readonly unknown[],
  options: { enabled?: boolean } = {},
): ApiQueryState<T> {
  const enabled = options.enabled ?? true;
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<ApiError | null>(null);
  const [status, setStatus] = useState<AsyncStatus>(enabled ? 'pending' : 'idle');
  const [reloadKey, setReloadKey] = useState(0);

  // Mark the query pending as soon as its inputs change (state adjusted during render,
  // as React recommends, instead of a synchronous setState inside the effect).
  const requestKey = [enabled, reloadKey, ...deps];
  const [lastRequestKey, setLastRequestKey] = useState<readonly unknown[]>(requestKey);
  if (!sameDeps(lastRequestKey, requestKey)) {
    setLastRequestKey(requestKey);
    setStatus(enabled ? 'pending' : 'idle');
    setError(null);
  }

  // Always calls the latest fetcher without making it an effect dependency
  const load = useEffectEvent((signal: AbortSignal) => fetcher(signal));

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();

    load(controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setData(result);
        setStatus('success');
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted || isCancellation(err)) return;
        setError(toApiError(err));
        setStatus('error');
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps are supplied by the caller
  }, [enabled, reloadKey, ...deps]);

  const retry = useCallback(() => setReloadKey((k) => k + 1), []);
  const pending = status === 'pending';
  const isSlow = useSlowFlag(pending);

  return {
    data,
    error,
    status,
    isLoading: pending && data === undefined,
    isRefreshing: pending && data !== undefined,
    isSlow,
    retry,
  };
}
