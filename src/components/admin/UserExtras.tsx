// src/components/admin/UserExtras.tsx — a learner's learning overview and the remaining account actions
'use client';

import React, { useState } from 'react';
import { GraduationCap, KeyRound, Megaphone, Zap } from 'lucide-react';
import { adminNotificationsApi, adminUserInsightsApi } from '@/lib/admin-api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { ErrorState, LoadingState } from '@/components/ui/states';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ADMIN_LOGIN_PATH, useAdminSession } from './AdminSessionProvider';
import { adminCard, adminInput, fmt } from './ui';

const PROGRESS_LABELS: Array<[string, string]> = [
  ['coursesEnrolled', 'Catalogue courses enrolled'],
  ['coursesCompleted', 'Catalogue courses completed'],
  ['lessonsCompleted', 'Lessons completed'],
  ['officialAttemptsSubmitted', 'Official quizzes, tests and exams submitted'],
  ['ownAssessmentsSubmitted', 'Own quizzes and mock exams submitted'],
  ['personalCourses', 'Personal courses'],
  ['generatedResources', 'Generated lessons and notes'],
  ['uploadedMaterials', 'Uploaded materials'],
];
const ANALYTICS_LABELS: Array<[string, string]> = [
  ['xpEarned', 'XP earned'],
  ['coinsBalance', 'Coin balance'],
  ['currentStreak', 'Current streak (days)'],
  ['longestStreak', 'Longest streak (days)'],
  ['trackedStudyHours', 'Study hours (timed sessions)'],
];

function Figures({ title, rows, data }: { title: string; rows: Array<[string, string]>; data?: Record<string, unknown> }) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">{title}</h3>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
        {rows.map(([k, label]) => (
          <div key={k} className="flex justify-between gap-3 border-b border-gray-100 dark:border-gray-800 py-1">
            <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
            <dd className="font-semibold text-gray-900 dark:text-white tabular-nums">{fmt(data?.[k])}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** GET /admin/users/:id/progress and /analytics — counted from the learner's own records. */
export function UserLearning({ userId, version = 0 }: { userId: string; version?: number }) {
  const progress = useApiQuery((signal) => adminUserInsightsApi.progress(userId, { signal }), [userId, version]);
  const analytics = useApiQuery((signal) => adminUserInsightsApi.analytics(userId, { signal }), [userId, version]);
  const err = progress.error ?? analytics.error;
  return (
    <section className={`${adminCard} p-6 space-y-4`} aria-labelledby="learning-heading">
      <h2 id="learning-heading" className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
        <GraduationCap className="w-4 h-4 text-gray-400" aria-hidden="true" /> Learning overview
      </h2>
      {progress.isLoading || analytics.isLoading ? (
        <LoadingState layout="list" rows={3} label="Loading learning overview…" />
      ) : err ? (
        <ErrorState error={err} onRetry={() => { progress.retry(); analytics.retry(); }} signInHref={ADMIN_LOGIN_PATH} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Figures title="Progress" rows={PROGRESS_LABELS} data={progress.data?.data as unknown as Record<string, unknown>} />
          <Figures title="Rewards and study" rows={ANALYTICS_LABELS} data={analytics.data?.data as unknown as Record<string, unknown>} />
        </div>
      )}
      <p className="text-[11px] text-gray-500 dark:text-gray-400">Counted from the learner&apos;s records. Personal course and material contents stay private; only their counts are shown.</p>
    </section>
  );
}

type Pending = { kind: 'password' } | { kind: 'xp' | 'coins' } | null;

/** Reset password, adjust XP or coins, and message the learner. Each needs users.manage / notifications.send and is logged. */
export function UserMoreActions({ userId, onChanged }: { userId: string; onChanged: () => void }) {
  const { can } = useAdminSession();
  const [pending, setPending] = useState<Pending>(null);
  const [password, setPassword] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState({ title: '', message: '' });
  const [done, setDone] = useState<string | null>(null);

  const act = useAsyncAction(async (signal: AbortSignal) => {
    if (!pending) return;
    if (pending.kind === 'password') {
      await adminUserInsightsApi.resetPassword(userId, password, { signal });
      setDone('The password was reset. Tell the learner through a channel you trust; it is not emailed.');
    } else {
      await adminUserInsightsApi.adjust(userId, pending.kind, Number(amount), reason.trim(), { signal });
      setDone(`${pending.kind === 'xp' ? 'XP' : 'Coins'} adjusted by ${Number(amount).toLocaleString()}.`);
    }
    setPending(null);
    setPassword('');
    setAmount('');
    setReason('');
    onChanged();
  });
  const send = useAsyncAction(async (signal: AbortSignal) => {
    const res = await adminNotificationsApi.sendToUser({ userId, title: note.title.trim(), message: note.message.trim() }, { signal });
    setNote({ title: '', message: '' });
    return res;
  });

  if (!can('users.manage') && !can('notifications.send')) return null;
  const amountValid = /^-?\d+$/.test(amount.trim()) && Number(amount) !== 0 && Math.abs(Number(amount)) <= 100000;
  const reasonValid = reason.trim().length >= 5;

  return (
    <section className={`${adminCard} p-6 space-y-5`} aria-labelledby="more-actions-heading">
      <h2 id="more-actions-heading" className="text-sm font-bold text-gray-900 dark:text-white">More actions</h2>
      {done && <Alert variant="success">{done}</Alert>}

      {can('users.manage') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form className="space-y-2" aria-label="Reset password" onSubmit={(e) => { e.preventDefault(); if (password.length >= 8) { act.reset(); setPending({ kind: 'password' }); } }}>
            <h3 className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300"><KeyRound className="w-3.5 h-3.5" aria-hidden="true" /> Reset password</h3>
            <input type="password" autoComplete="new-password" className={adminInput} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password (8+ characters)" aria-label="New password" />
            <Button type="submit" size="sm" variant="outline" disabled={password.length < 8}>Reset password…</Button>
          </form>

          <form className="space-y-2" aria-label="Adjust XP or coins" onSubmit={(e) => e.preventDefault()}>
            <h3 className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300"><Zap className="w-3.5 h-3.5" aria-hidden="true" /> Adjust XP or coins</h3>
            <div className="grid grid-cols-2 gap-2">
              <input inputMode="numeric" className={adminInput} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount, e.g. 50 or -20" aria-label="Amount" />
              <input className={adminInput} value={reason} maxLength={300} onChange={(e) => setReason(e.target.value)} placeholder="Reason (5+ characters)" aria-label="Reason" />
            </div>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" disabled={!amountValid || !reasonValid} onClick={() => { act.reset(); setPending({ kind: 'xp' }); }}>Adjust XP…</Button>
              <Button type="button" size="sm" variant="outline" disabled={!amountValid || !reasonValid} onClick={() => { act.reset(); setPending({ kind: 'coins' }); }}>Adjust coins…</Button>
            </div>
          </form>
        </div>
      )}

      {can('notifications.send') && (
        <form className="space-y-2" aria-label="Message this learner" onSubmit={(e) => { e.preventDefault(); if (note.title.trim() && note.message.trim()) void send.run(); }}>
          <h3 className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300"><Megaphone className="w-3.5 h-3.5" aria-hidden="true" /> Message this learner</h3>
          <input className={adminInput} value={note.title} maxLength={150} onChange={(e) => setNote({ ...note, title: e.target.value })} placeholder="Title" aria-label="Title" />
          <textarea className={`${adminInput} min-h-20`} value={note.message} maxLength={2000} onChange={(e) => setNote({ ...note, message: e.target.value })} placeholder="Message" aria-label="Message" />
          {send.error && <ErrorState error={send.error} compact signInHref={ADMIN_LOGIN_PATH} />}
          {send.status === 'success' && <Alert variant="success">Delivered to the learner&apos;s notifications.</Alert>}
          <Button type="submit" size="sm" isLoading={send.isPending} disabled={!note.title.trim() || !note.message.trim()}>Send to this learner</Button>
        </form>
      )}

      <ConfirmDialog
        open={pending !== null}
        title={pending?.kind === 'password' ? 'Reset this learner’s password?' : `Adjust ${pending?.kind === 'xp' ? 'XP' : 'coins'}?`}
        description={
          pending?.kind === 'password'
            ? 'The learner’s current password stops working immediately. The action is recorded in the audit log.'
            : `${Number(amount) > 0 ? 'Adds' : 'Removes'} ${Math.abs(Number(amount)).toLocaleString()} ${pending?.kind === 'xp' ? 'XP' : 'coins'}. Reason: “${reason.trim()}”. Recorded in the audit log.`
        }
        confirmLabel={pending?.kind === 'password' ? 'Reset password' : 'Apply adjustment'}
        isPending={act.isPending}
        error={act.error ? <ErrorState error={act.error} compact signInHref={ADMIN_LOGIN_PATH} /> : undefined}
        onConfirm={() => void act.run()}
        onCancel={() => setPending(null)}
      />
    </section>
  );
}
