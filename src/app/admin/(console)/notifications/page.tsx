// src/app/admin/(console)/notifications/page.tsx
'use client';

import React, { useState } from 'react';
import { Megaphone, Trash2 } from 'lucide-react';
import { BROADCAST_TARGETS, adminNotificationsApi } from '@/lib/admin-api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ADMIN_LOGIN_PATH } from '@/components/admin/AdminSessionProvider';
import { RequirePermission } from '@/components/admin/RequirePermission';
import { PageHeader, Pager, TabBar, adminCard, adminInput, useAdminTabs } from '@/components/admin/ui';

const AUDIENCE = Object.fromEntries(BROADCAST_TARGETS) as Record<string, string>;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Notifications (notifications.send): delivered into learners' in-app notifications, with a history of what was sent. */
export default function AdminNotificationsPage() {
  return (
    <RequirePermission permission="notifications.send">
      <Notifications />
    </RequirePermission>
  );
}

function Notifications() {
  const tabs = useAdminTabs([
    { id: 'compose', label: 'New notification' },
    { id: 'history', label: 'Sent' },
  ]);
  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" description="Send in-app notifications to one learner or an audience." />
      <TabBar label="Notification sections" tabs={tabs.visible} active={tabs.active} onSelect={tabs.select} />
      <div role="tabpanel">{tabs.active === 'history' ? <History /> : <Compose onSent={() => tabs.select('history')} />}</div>
    </div>
  );
}

function Compose({ onSent }: { onSent: () => void }) {
  const [target, setTarget] = useState<string>('SINGLE_USER');
  const [targetId, setTargetId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const needsName = target === 'SPECIFIC_INSTITUTION' || target === 'SPECIFIC_DEPARTMENT';
  const valid = title.trim() && message.trim() && (target === 'SINGLE_USER' ? UUID.test(targetId.trim()) : !needsName || targetId.trim());
  const send = useAsyncAction(async (signal: AbortSignal) => {
    const res =
      target === 'SINGLE_USER'
        ? await adminNotificationsApi.sendToUser({ userId: targetId.trim(), title: title.trim(), message: message.trim() }, { signal })
        : await adminNotificationsApi.broadcast({ target, ...(needsName ? { targetId: targetId.trim() } : {}), title: title.trim(), message: message.trim() }, { signal });
    setConfirming(false);
    setResult(`Delivered to ${res.data.deliveredCount ?? 0} learner(s).`);
    setTitle('');
    setMessage('');
  });
  const audience = target === 'SINGLE_USER' ? 'one learner' : needsName ? `${AUDIENCE[target].toLowerCase()}: “${targetId.trim()}”` : AUDIENCE[target].toLowerCase();

  return (
    <>
    <form className={`${adminCard} p-6 space-y-4 max-w-2xl`} aria-label="New notification" onSubmit={(e) => { e.preventDefault(); if (valid) { send.reset(); setResult(null); setConfirming(true); } }}>
      {result && (
        <Alert variant="success">
          {result}{' '}
          <button type="button" className="underline" onClick={onSent}>See sent notifications</button>
        </Alert>
      )}
      <label className="block space-y-1">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Audience</span>
        <select className={adminInput} value={target} onChange={(e) => { setTarget(e.target.value); setTargetId(''); }}>
          <option value="SINGLE_USER">One learner (by account id)</option>
          {BROADCAST_TARGETS.map(([id, label]) => (
            <option key={id} value={id}>{label}</option>
          ))}
        </select>
      </label>
      {(target === 'SINGLE_USER' || needsName) && (
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            {target === 'SINGLE_USER' ? 'Learner account id (from their page under Users)' : target === 'SPECIFIC_INSTITUTION' ? 'School or university name (as learners saved it)' : 'Department name'}
          </span>
          <input className={adminInput} value={targetId} maxLength={200} onChange={(e) => setTargetId(e.target.value)} />
        </label>
      )}
      <label className="block space-y-1">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Title</span>
        <input className={adminInput} value={title} maxLength={150} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label className="block space-y-1">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Message</span>
        <textarea className={`${adminInput} min-h-28`} value={message} maxLength={2000} onChange={(e) => setMessage(e.target.value)} />
      </label>
      <p className="text-[11px] text-gray-500">Deleted and frozen accounts are skipped. Premium-only audiences are not offered: there are no live subscriptions.</p>
      <Button type="submit" size="sm" disabled={!valid}>Review and send…</Button>
    </form>
    {/* outside the form: its buttons must not submit the form */}
    <ConfirmDialog
        open={confirming}
        title="Send this notification?"
        description={`“${title.trim()}” goes to ${audience}. It appears in their notifications straight away and cannot be recalled.`}
        confirmLabel="Send"
        isPending={send.isPending}
        error={send.error ? <ErrorState error={send.error} compact signInHref={ADMIN_LOGIN_PATH} /> : undefined}
        onConfirm={() => void send.run()}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}

/** GET /admin/notifications — what was sent; removing a record does not unsend it. */
function History() {
  const [page, setPage] = useState(1);
  const q = useApiQuery((signal) => adminNotificationsApi.history(page, { signal }), [page]);
  const remove = useAsyncAction(async (signal: AbortSignal, id: string) => {
    if (!window.confirm('Remove this record from the history? Learners keep the notification they received.')) return;
    await adminNotificationsApi.removeRecord(id, { signal });
    q.retry();
  });
  if (q.isLoading) return <LoadingState label="Loading sent notifications…" />;
  if (q.error) return <ErrorState error={q.error} onRetry={q.retry} signInHref={ADMIN_LOGIN_PATH} />;
  const rows = q.data!.data.notifications;
  if (!rows.length) return <EmptyState icon={Megaphone} title="Nothing sent yet" />;
  return (
    <div className="space-y-2">
      {remove.error && <ErrorState error={remove.error} compact signInHref={ADMIN_LOGIN_PATH} />}
      <ul className="space-y-2" aria-label="Sent notifications">
        {rows.map((n) => (
          <li key={n.id} className={`${adminCard} p-4 flex items-start justify-between gap-3`}>
            <div className="min-w-0 space-y-0.5">
              <p className="text-sm font-bold text-gray-900 dark:text-white break-words">{n.title}</p>
              <p className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-line break-words">{n.message}</p>
              <p className="text-[11px] text-gray-500 break-all">
                {n.targetType === 'SINGLE_USER' ? 'One learner' : AUDIENCE[n.targetType] ?? n.targetType}
                {n.targetId ? ` · ${n.targetId}` : ''}
                {n.createdAt ? ` · ${new Date(n.createdAt).toLocaleString()}` : ''}
              </p>
            </div>
            <button type="button" disabled={remove.isPending} onClick={() => void remove.run(n.id)} aria-label="Remove from history" className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50">
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      <Pager pagination={q.data!.data.pagination} onPage={setPage} />
    </div>
  );
}
