'use client';

import React, { useState } from 'react';
import { Bell, CheckCheck, Trash2, Sparkles, Settings, Check, Filter, AlarmClock } from 'lucide-react';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { Alert } from '@/components/ui/Alert';
import {
  NOTIFICATION_FILTERS,
  NOTIFICATIONS_CHANGED_EVENT,
  deleteNotification,
  filterNotifications,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  relativeTime,
  unreadCount,
  type NotificationFilter,
  type NotificationType,
} from '@/lib/notifications';

const TYPE_ICON: Record<NotificationType, typeof Bell> = { general: Bell, reminder: AlarmClock, ai: Sparkles, system: Settings };
const TYPE_LABEL: Record<NotificationType, string> = { general: 'General', reminder: 'Reminder', ai: 'AI', system: 'System' };

/** The learner's own notifications from GET /notifications (previously eight invented items in local state). */
export default function NotificationsHub() {
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const list = useApiQuery(() => listNotifications(), []);

  const afterChange = () => {
    list.retry();
    window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
  };
  const markOne = useAsyncAction(async (_signal: AbortSignal, id: string) => {
    await markNotificationRead(id);
    afterChange();
  });
  const markAll = useAsyncAction(async () => {
    await markAllNotificationsRead();
    afterChange();
  });
  const remove = useAsyncAction(async (_signal: AbortSignal, id: string) => {
    await deleteNotification(id);
    afterChange();
  });
  const busy = markOne.isPending || markAll.isPending || remove.isPending;
  const actionError = markOne.error ?? markAll.error ?? remove.error;

  const items = list.data ?? [];
  const unread = unreadCount(items);
  const shown = filterNotifications(items, filter);
  const filterLabel = NOTIFICATION_FILTERS.find((f) => f.id === filter)?.label ?? 'All';

  return (
    <div className="w-full min-h-screen pb-16 space-y-8 animate-in fade-in duration-300">
      {/* Header & Global Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-blue-500/10 text-[#2563EB] border border-blue-200/50 relative">
            <Bell className="w-6 h-6" aria-hidden="true" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
                {unread}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">Notifications</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {list.isLoading ? 'Loading…' : unread > 0 ? `${unread} unread` : 'You are all caught up.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => void markAll.run()}
            disabled={unread === 0 || busy}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              unread > 0 && !busy
                ? 'bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400 border border-blue-200/50 hover:bg-blue-100'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
            }`}
          >
            <CheckCheck className="w-4 h-4" aria-hidden="true" />
            <span>{markAll.isPending ? 'Marking…' : 'Mark all read'}</span>
          </button>
        </div>
      </div>

      {/* Filter tabs (the backend's notification types) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none" role="tablist" aria-label="Filter notifications">
        {NOTIFICATION_FILTERS.map((tab) => {
          const isActive = filter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
                  : 'bg-white dark:bg-[#111827] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {actionError && <ErrorState error={actionError} compact />}

      {/* List */}
      <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#2563EB]" aria-hidden="true" />
            {filter === 'all' ? 'All notifications' : filterLabel}
            {list.data && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 font-bold">{shown.length}</span>
            )}
          </h2>
          {list.isRefreshing && <span className="text-[11px] text-gray-400">Updating…</span>}
        </div>

        {list.isLoading ? (
          <LoadingState layout="list" rows={4} label="Loading notifications…" />
        ) : list.error && !list.data ? (
          <ErrorState error={list.error} onRetry={list.retry} />
        ) : shown.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={items.length === 0 ? 'No notifications yet' : 'Nothing here'}
            description={
              items.length === 0
                ? 'Reminders and updates about your learning will appear here.'
                : `No ${filterLabel.toLowerCase()} notifications.`
            }
          />
        ) : (
          <ul className="space-y-3">
            {shown.map((item) => {
              const Icon = TYPE_ICON[item.type];
              return (
                <li
                  key={item.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    item.isRead
                      ? 'bg-gray-50/60 dark:bg-gray-900/40 border-gray-200 dark:border-gray-800/80'
                      : 'bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-900/50 shadow-xs'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className={`p-3 rounded-2xl shrink-0 ${!item.isRead ? 'bg-blue-500/10 text-[#2563EB]' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'}`}>
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`text-xs sm:text-sm ${!item.isRead ? 'text-gray-900 dark:text-white font-black' : 'font-bold text-gray-700 dark:text-gray-300'}`}>
                          {item.title}
                        </h3>
                        {!item.isRead && <span className="w-2 h-2 rounded-full bg-[#2563EB]" aria-label="Unread" />}
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 font-semibold">{TYPE_LABEL[item.type]}</span>
                      </div>
                      {item.message && <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xl">{item.message}</p>}
                      <time dateTime={item.createdAt} className="text-[10px] text-gray-400 block pt-0.5">
                        {relativeTime(item.createdAt)}
                      </time>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {!item.isRead && (
                      <button
                        type="button"
                        onClick={() => void markOne.run(item.id)}
                        disabled={busy}
                        className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400 hover:bg-blue-100 transition-all text-xs font-bold flex items-center gap-1 px-3 disabled:opacity-50"
                        aria-label={`Mark "${item.title}" as read`}
                      >
                        <Check className="w-3.5 h-3.5" aria-hidden="true" />
                        <span className="hidden sm:inline">Mark read</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => void remove.run(item.id)}
                      disabled={busy}
                      className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 transition-all text-xs font-bold flex items-center gap-1 px-3 disabled:opacity-50"
                      aria-label={`Delete "${item.title}"`}
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {list.error && list.data && <Alert variant="warning">Showing the last loaded notifications; the latest could not be loaded.</Alert>}
    </div>
  );
}
