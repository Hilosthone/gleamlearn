'use client';

import { useSyncExternalStore } from 'react';

const subscribe = (onChange: () => void) => {
  window.addEventListener('popstate', onChange);
  return () => window.removeEventListener('popstate', onChange);
};

/**
 * A query-string value of the current URL (null on the server and when absent). Unlike useSearchParams it needs no
 * Suspense boundary, so statically rendered pages can read it; the first client render after hydration picks it up.
 */
export function useUrlParam(name: string): string | null {
  return useSyncExternalStore(
    subscribe,
    () => new URLSearchParams(window.location.search).get(name),
    () => null,
  );
}
