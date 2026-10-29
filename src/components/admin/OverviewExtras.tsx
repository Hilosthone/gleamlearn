// src/components/admin/OverviewExtras.tsx — the overview's "needs attention", health, recent activity and quick links
'use client';

import React from 'react';
import Link from 'next/link';
import { adminModerationApi, adminSecurityApi, adminSystemApi } from '@/lib/admin-api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { LoadingState } from '@/components/ui/states';
import { useAdminSession } from './AdminSessionProvider';
import { visibleNavSections } from './admin-nav';
import { adminCard } from './ui';

/** A count from a real list endpoint (its pagination total). Errors read "—" rather than a guessed number. */
function AttentionCard({ label, href, load }: { label: string; href: string; load: (signal: AbortSignal) => Promise<number> }) {
  const q = useApiQuery(load, []);
  return (
    <Link href={href} className={`${adminCard} p-5 block hover:border-[var(--color-brand-blue)] transition-colors`}>
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-gray-900 dark:text-white tabular-nums" aria-live="polite">
        {q.isLoading ? '…' : q.error ? '—' : (q.data ?? 0).toLocaleString()}
      </p>
    </Link>
  );
}

export function NeedsAttention() {
  const { can } = useAdminSession();
  const cards = [
    can('moderation.manage') && (
      <AttentionCard key="r" label="Reports waiting for review" href="/admin/moderation" load={async (signal) => (await adminModerationApi.listReports({ status: 'PENDING' }, { signal })).data.pagination.total} />
    ),
    can('moderation.manage') && (
      <AttentionCard key="a" label="AI content waiting for review" href="/admin/moderation?tab=ai" load={async (signal) => (await adminModerationApi.listAiContent({ status: 'PENDING' }, { signal })).data.pagination.total} />
    ),
    can('security.view') && (
      <AttentionCard key="s" label="Restricted accounts" href="/admin/security" load={async (signal) => (await adminSecurityApi.restrictedUsers({ signal })).data.suspiciousUsersCount} />
    ),
  ].filter(Boolean);
  if (!cards.length) return null;
  return (
    <section className="space-y-3" aria-label="Needs attention">
      <h2 className="text-sm font-bold text-gray-900 dark:text-white">Needs attention</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{cards}</div>
    </section>
  );
}

export function HealthAndActivity() {
  const { can } = useAdminSession();
  const health = useApiQuery((signal) => adminSystemApi.health({ signal }), [], { enabled: can('system.view') });
  const recent = useApiQuery((signal) => adminSecurityApi.auditLogs({}, { signal }), [], { enabled: can('security.view') });
  if (!can('system.view') && !can('security.view')) return null;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {can('system.view') && (
        <section className={`${adminCard} p-5 space-y-2`} aria-label="System health">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">System health</h2>
            <Link href="/admin/system" className="text-xs font-semibold text-[var(--color-brand-blue)] hover:underline">Details</Link>
          </div>
          {health.isLoading ? (
            <LoadingState layout="list" rows={1} />
          ) : health.data ? (
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Server <strong>{health.data.data.serverStatus}</strong> · database {health.data.data.database.connected ? <strong>connected</strong> : <strong className="text-red-600">not connected</strong>} · up{' '}
              {Math.round(health.data.data.uptimeSeconds / 60).toLocaleString()} min
            </p>
          ) : (
            <p className="text-sm text-gray-500">The health check did not answer.</p>
          )}
        </section>
      )}
      {can('security.view') && (
        <section className={`${adminCard} p-5 space-y-2`} aria-label="Recent admin activity">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Recent admin activity</h2>
            <Link href="/admin/security?tab=audit" className="text-xs font-semibold text-[var(--color-brand-blue)] hover:underline">Audit log</Link>
          </div>
          {recent.isLoading ? (
            <LoadingState layout="list" rows={2} />
          ) : !recent.data?.data.auditLogs.length ? (
            <p className="text-sm text-gray-500">No administrative actions recorded yet.</p>
          ) : (
            <ul className="text-xs divide-y divide-gray-100 dark:divide-gray-800">
              {recent.data.data.auditLogs.slice(0, 5).map((l) => (
                <li key={l.id} className="py-1.5 flex justify-between gap-3">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{l.action}</span>
                  <span className="text-gray-500 tabular-nums">{new Date(l.timestamp).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

export function QuickAccess() {
  const { can } = useAdminSession();
  const sections = visibleNavSections(can).filter((s) => s.title !== 'Overview');
  return (
    <section className="space-y-3" aria-label="Quick access">
      <h2 className="text-sm font-bold text-gray-900 dark:text-white">Manage</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {sections.map((s) => (
          <div key={s.title} className={`${adminCard} p-5 space-y-2`}>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{s.title}</p>
            <ul className="space-y-1">
              {s.items.map((i) => (
                <li key={i.href}>
                  <Link href={i.href} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200 hover:text-[var(--color-brand-blue)]">
                    <i.icon className="w-4 h-4 text-gray-400" aria-hidden="true" /> {i.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
