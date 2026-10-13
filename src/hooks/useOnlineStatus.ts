'use client';

import { useSyncExternalStore } from 'react';

function subscribe(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

/**
 * Browser connectivity as reported by `navigator.onLine`.
 * `false` reliably means the device has no network; `true` does not guarantee the
 * backend is reachable (that is reported separately as an API error).
 * Server render assumes online to avoid a false offline flash.
 */
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );
}
