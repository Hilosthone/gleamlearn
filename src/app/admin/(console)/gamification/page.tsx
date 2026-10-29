// src/app/admin/(console)/gamification/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { History, Trophy } from 'lucide-react';
import { adminGamificationApi, adminSecurityApi } from '@/lib/admin-api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { Alert } from '@/components/ui/Alert';
import { ADMIN_LOGIN_PATH, useAdminSession } from '@/components/admin/AdminSessionProvider';
import { RequirePermission } from '@/components/admin/RequirePermission';
import { PageHeader, Pager, StatCard, TabBar, adminCard, fmt, useAdminTabs } from '@/components/admin/ui';

/** Gamification from the real XP, coin and streak tables (analytics.view); adjustments are made per learner. */
export default function AdminGamificationPage() {
  return (
    <RequirePermission permission="analytics.view">
      <Gamification />
    </RequirePermission>
  );
}

function Gamification() {
  const tabs = useAdminTabs([
    { id: 'overview', label: 'Overview' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'adjustments', label: 'Adjustments', permission: 'security.view' },
  ]);
  return (
    <div className="space-y-6">
      <PageHeader title="Gamification" description="XP, coins and streaks as recorded for learners." />
      <TabBar label="Gamification sections" tabs={tabs.visible} active={tabs.active} onSelect={tabs.select} />
      <div role="tabpanel">
        {tabs.active === 'overview' && <Overview />}
        {tabs.active === 'leaderboard' && <Leaderboard />}
        {tabs.active === 'adjustments' && <Adjustments />}
      </div>
    </div>
  );
}

function Overview() {
  const xp = useApiQuery((signal) => adminGamificationApi.xp({ signal }), []);
  const coins = useApiQuery((signal) => adminGamificationApi.coins({ signal }), []);
  const streaks = useApiQuery((signal) => adminGamificationApi.streaks({ signal }), []);
  const err = xp.error ?? coins.error ?? streaks.error;
  if (xp.isLoading || coins.isLoading || streaks.isLoading) return <LoadingState layout="cards" rows={6} label="Loading gamification figures…" />;
  if (err) return <ErrorState error={err} onRetry={() => { xp.retry(); coins.retry(); streaks.retry(); }} signInHref={ADMIN_LOGIN_PATH} />;
  const x = xp.data!.data;
  const c = coins.data!.data;
  const s = streaks.data!.data;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="XP awarded (net)" value={fmt(x.totalXpGenerated)} hint={`${fmt(x.learnersWithXp)} learners have XP`} />
        <StatCard label="Average XP per earner" value={fmt(x.averageXpPerEarner)} />
        <StatCard label="Coins earned" value={fmt(c.totalCoinsEarned)} hint={`${fmt(c.totalCoinsSpent)} spent · ${fmt(c.totalCoinsCirculating)} held`} />
        <StatCard label="Active streaks" value={fmt(s.activeStreaksCount)} hint="Checked in today or yesterday (WAT)" />
        <StatCard label="Longest active streak" value={s.longestActiveStreak === null ? '—' : `${s.longestActiveStreak} days`} />
        <StatCard label="Average active streak" value={s.averageActiveStreakDays === null ? '—' : `${s.averageActiveStreakDays} days`} />
        <StatCard label="Longest streak ever" value={`${s.longestStreakEver} days`} />
        <StatCard
          label="Top earner"
          value={x.topXpEarner ? `${fmt(x.topXpEarner.xp)} XP` : '—'}
          hint={x.topXpEarner ? <Link className="underline" href={`/admin/users/${encodeURIComponent(x.topXpEarner.userId)}`}>{x.topXpEarner.email}</Link> : 'Nobody has XP yet'}
        />
      </div>
      <Alert variant="info">
        XP and coins are awarded by the server for graded quizzes, tests and exams and other rewarded actions; the reward amounts, levels and achievements are defined in
        the backend and are not editable here. To correct a learner&apos;s XP or coins, open the learner under Users → More actions.
      </Alert>
    </div>
  );
}

function Leaderboard() {
  const [page, setPage] = useState(1);
  const q = useApiQuery((signal) => adminGamificationApi.leaderboard(page, { signal }), [page]);
  const { can } = useAdminSession();
  if (q.isLoading) return <LoadingState layout="table" rows={6} label="Loading the leaderboard…" />;
  if (q.error) return <ErrorState error={q.error} onRetry={q.retry} signInHref={ADMIN_LOGIN_PATH} />;
  const rows = q.data!.data.leaderboard;
  if (!rows.length) return <EmptyState icon={Trophy} title="Nobody has earned XP yet" />;
  return (
    <div className={`${adminCard} p-5 space-y-3 overflow-x-auto`}>
      <table className="min-w-full text-sm" aria-label="XP leaderboard">
        <thead>
          <tr className="text-left text-xs text-gray-500">
            <th className="py-2 pr-3">#</th>
            <th className="py-2 pr-3">Learner</th>
            <th className="py-2 pr-3 text-right">XP</th>
            <th className="py-2 pr-3 text-right">Coins</th>
            <th className="py-2 text-right">Streak</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.userId} className="border-t border-gray-100 dark:border-gray-800">
              <td className="py-2 pr-3 tabular-nums text-gray-500">{r.rank}</td>
              <td className="py-2 pr-3 break-all">
                {can('users.view') ? <Link className="font-semibold hover:underline" href={`/admin/users/${encodeURIComponent(r.userId)}`}>{r.email}</Link> : r.email}
              </td>
              <td className="py-2 pr-3 text-right tabular-nums">{fmt(r.xp)}</td>
              <td className="py-2 pr-3 text-right tabular-nums">{fmt(r.coins)}</td>
              <td className="py-2 text-right tabular-nums">{fmt(r.streak)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pager pagination={q.data!.data.pagination} onPage={setPage} />
    </div>
  );
}

/** Manual XP / coin adjustments, from the audit log (category GAMIFICATION). */
function Adjustments() {
  const [page, setPage] = useState(1);
  const q = useApiQuery((signal) => adminSecurityApi.auditLogs({ page, category: 'GAMIFICATION' }, { signal }), [page]);
  if (q.isLoading) return <LoadingState label="Loading adjustments…" />;
  if (q.error) return <ErrorState error={q.error} onRetry={q.retry} signInHref={ADMIN_LOGIN_PATH} />;
  const rows = q.data!.data.auditLogs;
  if (!rows.length) return <EmptyState icon={History} title="No manual adjustments" description="XP and coin corrections made from a learner's page are listed here." />;
  return (
    <div className="space-y-2">
    <ul className="space-y-2" aria-label="Adjustments">
      {rows.map((l) => {
        let d: { amount?: number; reason?: string } = {};
        try {
          d = JSON.parse(l.details ?? '{}');
        } catch {
          /* older free-text details */
        }
        const userId = l.target?.replace(/^User: /, '');
        return (
          <li key={l.id} className={`${adminCard} p-4 flex flex-wrap items-center justify-between gap-2 text-sm`}>
            <span>
              <strong>{l.action === 'MANUAL_XP_ADJUSTMENT' ? 'XP' : 'Coins'} {d.amount !== undefined ? (d.amount > 0 ? `+${d.amount}` : d.amount) : ''}</strong>
              {d.reason && <span className="text-gray-600 dark:text-gray-300"> · {d.reason}</span>}
            </span>
            <span className="text-[11px] text-gray-500">
              {userId && <Link className="underline mr-2" href={`/admin/users/${encodeURIComponent(userId)}`}>learner</Link>}
              {new Date(l.timestamp).toLocaleString()}
            </span>
          </li>
        );
      })}
    </ul>
      <Pager pagination={q.data!.data.pagination} onPage={setPage} />
    </div>
  );
}
