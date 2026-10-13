'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ApiError } from '@/lib/api-error';
import { createSingleFlight, isCancellation, toApiError, type AsyncStatus } from '@/lib/async-state';
import { useSlowFlag } from './useSlowFlag';

export interface AsyncActionState<TArgs extends unknown[], TResult> {
  /** Runs the action. Returns undefined when ignored (already running) or when it failed. */
  run: (...args: TArgs) => Promise<TResult | undefined>;
  status: AsyncStatus;
  isPending: boolean;
  isSlow: boolean;
  error: ApiError | null;
  result: TResult | undefined;
  reset: () => void;
}

/**
 * For user-triggered operations (submit, save, delete, generate).
 * - Ignores repeated calls while one is in flight (prevents duplicate submissions).
 * - Never retries automatically: a mutation may already have been applied by the
 *   server even if the response was lost.
 * - Stops updating state after unmount and aborts the in-flight request.
 */
export function useAsyncAction<TArgs extends unknown[], TResult>(
  action: (signal: AbortSignal, ...args: TArgs) => Promise<TResult>,
): AsyncActionState<TArgs, TResult> {
  const [status, setStatus] = useState<AsyncStatus>('idle');
  const [error, setError] = useState<ApiError | null>(null);
  const [result, setResult] = useState<TResult | undefined>(undefined);
  const flight = useRef(createSingleFlight());
  const controllerRef = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  const actionRef = useRef(action);

  // Keep the latest action without re-creating `run` (refs are updated after render, not during it)
  useEffect(() => {
    actionRef.current = action;
  }, [action]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      controllerRef.current?.abort();
    };
  }, []);

  const run = useCallback(async (...args: TArgs) => {
    if (!flight.current.tryStart()) return undefined;
    const controller = new AbortController();
    controllerRef.current = controller;
    setStatus('pending');
    setError(null);
    try {
      const value = await actionRef.current(controller.signal, ...args);
      if (mounted.current) {
        setResult(value);
        setStatus('success');
      }
      return value;
    } catch (err) {
      if (mounted.current && !isCancellation(err)) {
        setError(toApiError(err));
        setStatus('error');
      }
      return undefined;
    } finally {
      flight.current.finish();
      if (controllerRef.current === controller) controllerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
    setResult(undefined);
  }, []);

  const isPending = status === 'pending';
  const isSlow = useSlowFlag(isPending);

  return { run, status, isPending, isSlow, error, result, reset };
}
