/**
 * ---------------------------------------------------------------------------
 * lib/notifications.ts — Learner notifications (typed wrappers over notificationsApi)
 * ---------------------------------------------------------------------------
 * Backend contract (src/notifications, verified 2026-10-25):
 *   GET    /notifications            → { status, data: Notification[] }   newest first, own notifications only
 *   GET    /notifications/unread     → { status, data: Notification[] }   unread only
 *   PATCH  /notifications/:id/read   → { status, message, data }          404 if not the learner's
 *   PATCH  /notifications/read-all   → { status, message }
 *   DELETE /notifications/:id        → { status, message }                404 if not the learner's
 * Notification: { id, userId, title, message, type: 'general' | 'reminder' | 'ai' | 'system', isRead, createdAt }
 *
 * Kept dependency-free apart from api.ts so the mapping can be unit-tested with `node --test`.
 */

import { notificationsApi } from './api.ts';

/** Window event fired after the learner reads or deletes notifications (the Navbar bell re-checks). */
export const NOTIFICATIONS_CHANGED_EVENT = 'gleamlearn:notifications-changed';

export type NotificationType = 'general' | 'reminder' | 'ai' | 'system';

export interface LearnerNotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

export type NotificationFilter = 'all' | 'unread' | NotificationType;

export const NOTIFICATION_FILTERS: { id: NotificationFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'reminder', label: 'Reminders' },
  { id: 'ai', label: 'AI' },
  { id: 'system', label: 'System' },
  { id: 'general', label: 'General' },
];

const TYPES: NotificationType[] = ['general', 'reminder', 'ai', 'system'];

/** Maps one backend row; unknown types become 'general', rows without an id or title are dropped. */
export function toNotification(raw: unknown): LearnerNotificationItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'string' || typeof r.title !== 'string') return null;
  const type = TYPES.includes(r.type as NotificationType) ? (r.type as NotificationType) : 'general';
  return {
    id: r.id,
    title: r.title,
    message: typeof r.message === 'string' ? r.message : '',
    type,
    isRead: r.isRead === true,
    createdAt: typeof r.createdAt === 'string' ? r.createdAt : new Date(0).toISOString(),
  };
}

/** Accepts `{ data: [...] }` (current backend) or a bare array; always newest first. */
export function toNotificationList(res: unknown): LearnerNotificationItem[] {
  const rows = Array.isArray(res) ? res : Array.isArray((res as { data?: unknown })?.data) ? (res as { data: unknown[] }).data : [];
  return rows
    .map(toNotification)
    .filter((n): n is LearnerNotificationItem => n !== null)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function filterNotifications(items: LearnerNotificationItem[], filter: NotificationFilter): LearnerNotificationItem[] {
  if (filter === 'all') return items;
  if (filter === 'unread') return items.filter((n) => !n.isRead);
  return items.filter((n) => n.type === filter);
}

export const unreadCount = (items: LearnerNotificationItem[]) => items.filter((n) => !n.isRead).length;

/** "just now", "5 min ago", "3 h ago", "2 d ago", then the date. */
export function relativeTime(iso: string, now: number = Date.now()): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return '';
  const s = Math.max(0, Math.round((now - t) / 1000));
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 7 * 86400) return `${Math.floor(s / 86400)} d ago`;
  return new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export async function listNotifications(): Promise<LearnerNotificationItem[]> {
  return toNotificationList(await notificationsApi.getAll());
}

export async function countUnreadNotifications(): Promise<number> {
  return toNotificationList(await notificationsApi.getUnread()).length;
}

export const markNotificationRead = (id: string) => notificationsApi.markAsRead(id);
export const markAllNotificationsRead = () => notificationsApi.markAllAsRead();
export const deleteNotification = (id: string) => notificationsApi.delete(id);
