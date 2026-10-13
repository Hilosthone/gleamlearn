'use client';

import { useEffect, useState } from 'react';
import { SLOW_REQUEST_THRESHOLD_MS } from '@/lib/config';

/**
 * Returns true once `active` has stayed true for longer than `thresholdMs`.
 * Used to show a calm "taking longer than usual" message: a slow request is
 * never treated as a failed one.
 */
export function useSlowFlag(active: boolean, thresholdMs: number = SLOW_REQUEST_THRESHOLD_MS): boolean {
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => setIsSlow(true), thresholdMs);
    return () => {
      clearTimeout(timer);
      setIsSlow(false); // reset when the operation ends or the threshold changes
    };
  }, [active, thresholdMs]);

  return active && isSlow;
}
