/**
 * lib/toast.ts — short in-app messages (rewards, streak reminders, results). Any code can call showToast(); the
 * <Toaster /> in the learner layout shows them. Nothing is sent anywhere: these are not push notifications.
 */

export const TOAST_EVENT = 'gleamlearn:toast';

export type ToastTone = 'reward' | 'info' | 'success' | 'warning';

export interface ToastInput {
  title: string;
  message?: string;
  tone?: ToastTone;
  /** an in-app link shown as the action, e.g. '/progress?view=streak' */
  href?: string;
  actionLabel?: string;
  /** ms before it closes by itself (default 6 s; 0 = stays until closed) */
  durationMs?: number;
}

export interface Toast extends Required<Pick<ToastInput, 'title' | 'tone' | 'durationMs'>> {
  id: string;
  message: string;
  href: string | null;
  actionLabel: string | null;
}

let seq = 0;

export function toToast(input: ToastInput): Toast {
  seq += 1;
  return {
    id: `t${Date.now().toString(36)}${seq}`,
    title: input.title,
    message: input.message ?? '',
    tone: input.tone ?? 'info',
    href: input.href && input.href.startsWith('/') && !input.href.startsWith('//') ? input.href : null, // in-app links only
    actionLabel: input.actionLabel ?? null,
    durationMs: input.durationMs ?? 6000,
  };
}

export function showToast(input: ToastInput): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<Toast>(TOAST_EVENT, { detail: toToast(input) }));
}

/** At most `max` toasts on screen: the oldest go first. */
export function addToast(list: Toast[], t: Toast, max = 4): Toast[] {
  return [...list.filter((x) => x.id !== t.id), t].slice(-max);
}
