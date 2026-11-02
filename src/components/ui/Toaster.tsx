'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, Coins, Info, X, type LucideIcon } from 'lucide-react';
import { TOAST_EVENT, addToast, type Toast, type ToastTone } from '@/lib/toast';

const tone: Record<ToastTone, { icon: LucideIcon; ring: string; iconClass: string }> = {
  reward: { icon: Coins, ring: 'border-amber-200 dark:border-amber-900/60', iconClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-500' },
  success: { icon: CheckCircle2, ring: 'border-emerald-200 dark:border-emerald-900/60', iconClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600' },
  warning: { icon: AlertCircle, ring: 'border-orange-200 dark:border-orange-900/60', iconClass: 'bg-orange-50 dark:bg-orange-950/40 text-orange-500' },
  info: { icon: Info, ring: 'border-blue-200 dark:border-blue-900/60', iconClass: 'bg-blue-50 dark:bg-blue-950/40 text-[var(--color-brand-blue)]' },
};

/** Shows the toasts sent with showToast() (lib/toast.ts), bottom-right (above the mobile nav), announced politely. */
export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: string) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
  }, []);

  useEffect(() => {
    const all = timers.current;
    const onToast = (e: Event) => {
      const t = (e as CustomEvent<Toast>).detail;
      if (!t?.id) return;
      setToasts((list) => addToast(list, t));
      if (t.durationMs > 0) all.set(t.id, setTimeout(() => dismiss(t.id), t.durationMs));
    };
    window.addEventListener(TOAST_EVENT, onToast);
    return () => {
      window.removeEventListener(TOAST_EVENT, onToast);
      for (const timer of all.values()) clearTimeout(timer);
      all.clear();
    };
  }, [dismiss]);

  return (
    <div aria-live="polite" aria-atomic="false" className="fixed z-[60] bottom-24 md:bottom-6 right-4 left-4 sm:left-auto sm:w-96 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => {
        const s = tone[t.tone];
        const Icon = s.icon;
        return (
          <div key={t.id} role="status" className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border ${s.ring} bg-white dark:bg-[#111827] shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200`}>
            <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${s.iconClass}`}>
              <Icon className="w-4 h-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-sm font-bold text-gray-900 dark:text-white">{t.title}</p>
              {t.message && <p className="text-xs text-gray-600 dark:text-gray-300">{t.message}</p>}
              {t.href && (
                <Link href={t.href} onClick={() => dismiss(t.id)} className="inline-block text-xs font-semibold text-[var(--color-brand-blue)] hover:underline">
                  {t.actionLabel ?? 'Open'}
                </Link>
              )}
            </div>
            <button type="button" onClick={() => dismiss(t.id)} className="shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Dismiss">
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
