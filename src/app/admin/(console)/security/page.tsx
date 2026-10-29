// src/app/admin/(console)/security/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, History, Lock, ShieldAlert, X } from 'lucide-react';
import { ACTIVITY_CATEGORIES, adminSecurityApi, type AdminLogEntry } from '@/lib/admin-api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { Alert } from '@/components/ui/Alert';
import { ADMIN_LOGIN_PATH } from '@/components/admin/AdminSessionProvider';
import { RequirePermission } from '@/components/admin/RequirePermission';
import { PageHeader, Pager, TabBar, adminCard, useAdminTabs } from '@/components/admin/ui';

const when = (iso?: string) => (iso ? new Date(iso).toLocaleString() : '—');

/** Security & access: restricted accounts, security events, the audit log, admin activity and the enforced access model. */
export default function AdminSecurityPage() {
  return (
    <RequirePermission permission="security.view">
      <Security />
    </RequirePermission>
  );
}

function Security() {
  const tabs = useAdminTabs([
    { id: 'restricted', label: 'Restricted accounts' },
    { id: 'events', label: 'Security events' },
    { id: 'audit', label: 'Audit log' },
    { id: 'activity', label: 'Activity', permission: 'analytics.view' },
    { id: 'access', label: 'Roles & access', permission: 'roles.manage' },
  ]);
  return (
    <div className="space-y-6">
      <PageHeader title="Security & access" description="Who is restricted, what administrators did, and which role may do what." />
      <TabBar label="Security sections" tabs={tabs.visible} active={tabs.active} onSelect={tabs.select} />
      <div role="tabpanel">
        {tabs.active === 'restricted' && <Restricted />}
        {tabs.active === 'events' && <Events />}
        {tabs.active === 'audit' && <Logs kind="audit" />}
        {tabs.active === 'activity' && <Logs kind="activity" />}
        {tabs.active === 'access' && <Access />}
      </div>
    </div>
  );
}

/** GET /admin/security/suspicious-users — accounts currently suspended or restricted (the enforced flag). */
function Restricted() {
  const q = useApiQuery((signal) => adminSecurityApi.restrictedUsers({ signal }), []);
  if (q.isLoading) return <LoadingState label="Loading restricted accounts…" />;
  if (q.error) return <ErrorState error={q.error} onRetry={q.retry} signInHref={ADMIN_LOGIN_PATH} />;
  const users = q.data?.data.users ?? [];
  if (!users.length) return <EmptyState icon={Lock} title="No restricted accounts" description="Learners you suspend or restrict from their user page appear here." />;
  return (
    <ul className="space-y-2" aria-label="Restricted accounts">
      {users.map((u) => (
        <li key={u.id} className={`${adminCard} p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2`}>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 dark:text-white break-words">{u.fullName || u.username || u.email}</p>
            <p className="text-[11px] text-gray-500 break-words">{u.email}{u.restrictionReason ? ` · ${u.restrictionReason}` : ''}</p>
          </div>
          <Link href={`/admin/users/${encodeURIComponent(u.id)}`} className="text-xs font-semibold text-[var(--color-brand-blue)] hover:underline shrink-0">
            Open account to lift
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** GET /admin/security/events — recorded security events (nothing records them automatically yet). */
function Events() {
  const [page, setPage] = useState(1);
  const [severity, setSeverity] = useState('');
  const q = useApiQuery((signal) => adminSecurityApi.events({ page, severity: severity || undefined }, { signal }), [page, severity]);
  const events = q.data?.data.securityEvents ?? [];
  return (
    <div className="space-y-3">
      <label className="inline-flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
        Severity
        <select className="px-2 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800" value={severity} onChange={(e) => { setPage(1); setSeverity(e.target.value); }}>
          {['', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((s) => (
            <option key={s} value={s}>{s ? s.charAt(0) + s.slice(1).toLowerCase() : 'All'}</option>
          ))}
        </select>
      </label>
      {q.isLoading ? (
        <LoadingState label="Loading security events…" />
      ) : q.error ? (
        <ErrorState error={q.error} onRetry={q.retry} signInHref={ADMIN_LOGIN_PATH} />
      ) : !events.length ? (
        <EmptyState icon={ShieldAlert} title="No security events recorded" description="Failed sign-ins and abuse signals are not recorded automatically yet, so this list fills only with events the platform stores." />
      ) : (
        <ul className="space-y-2">
          {events.map((e) => (
            <li key={e.id} className={`${adminCard} p-4 space-y-1`}>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{String(e.eventType ?? 'Event')} <span className="text-[11px] font-semibold text-gray-500">· {String(e.severity ?? '')}</span></p>
              {e.description && <p className="text-xs text-gray-600 dark:text-gray-300">{String(e.description)}</p>}
              <p className="text-[11px] text-gray-500">{when(e.createdAt)}</p>
            </li>
          ))}
        </ul>
      )}
      <Pager pagination={q.data?.data.pagination} onPage={setPage} />
    </div>
  );
}

const CATEGORIES = ['', 'USERS', 'SECURITY', 'SYSTEM', 'GAMIFICATION'] as const;

/** GET /admin/audit-logs (security.view) and GET /admin/activity[/:category] (analytics.view): the same admin action log. */
function Logs({ kind }: { kind: 'audit' | 'activity' }) {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const q = useApiQuery(
    async (signal) => {
      if (kind === 'audit') {
        const r = await adminSecurityApi.auditLogs({ page, category: category || undefined }, { signal });
        return { entries: r.data.auditLogs, pagination: r.data.pagination };
      }
      const r = await adminSecurityApi.activity({ page, category: (category || undefined) as (typeof ACTIVITY_CATEGORIES)[number] | undefined }, { signal });
      return { entries: r.data.activities, pagination: r.data.pagination };
    },
    [kind, page, category],
  );
  const options = kind === 'audit' ? CATEGORIES : (['', ...ACTIVITY_CATEGORIES] as const);
  return (
    <div className="space-y-3">
      <Alert variant="info">
        {kind === 'audit'
          ? 'Every recorded administrative action: account changes, XP and coin adjustments, restrictions and settings. Learner activity is not recorded here.'
          : 'Activity by area. Only administrative actions are recorded today, so learning, assessment, AI and payment activity stays empty until those are logged.'}
      </Alert>
      <label className="inline-flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
        Area
        <select className="px-2 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800" value={category} onChange={(e) => { setPage(1); setCategory(e.target.value); }}>
          {options.map((c) => (
            <option key={c} value={c}>{c ? c.charAt(0).toUpperCase() + c.slice(1).toLowerCase() : 'All'}</option>
          ))}
        </select>
      </label>
      {q.isLoading ? (
        <LoadingState label="Loading the log…" />
      ) : q.error ? (
        <ErrorState error={q.error} onRetry={q.retry} signInHref={ADMIN_LOGIN_PATH} />
      ) : !q.data?.entries.length ? (
        <EmptyState icon={History} title="Nothing recorded" description="Matching entries appear here as administrators act." />
      ) : (
        <ul className="space-y-2" aria-label={kind === 'audit' ? 'Audit log' : 'Activity'}>
          {q.data.entries.map((l) => (
            <li key={l.id} className={`${adminCard} p-4`}>
              <button type="button" className="w-full text-left flex flex-wrap items-center justify-between gap-2" aria-expanded={open === l.id} onClick={() => setOpen(open === l.id ? null : l.id)}>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{l.action}</span>
                <span className="text-[11px] text-gray-500">{[l.category, when(l.timestamp)].filter(Boolean).join(' · ')}</span>
              </button>
              {open === l.id && kind === 'audit' && <AuditDetail id={l.id} />}
              {open === l.id && kind === 'activity' && <EntryFields entry={l} />}
            </li>
          ))}
        </ul>
      )}
      <Pager pagination={q.data?.pagination} onPage={setPage} />
    </div>
  );
}

function EntryFields({ entry }: { entry: AdminLogEntry }) {
  return (
    <dl className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs">
      {([['Admin', entry.adminId], ['Learner', entry.userId], ['Target', entry.target], ['Details', entry.details]] as const).map(([k, v]) => (
        <div key={k} className="flex gap-2">
          <dt className="text-gray-500 w-16 shrink-0">{k}</dt>
          <dd className="text-gray-800 dark:text-gray-200 break-all">{v || '—'}</dd>
        </div>
      ))}
    </dl>
  );
}

/** GET /admin/audit-logs/:id */
function AuditDetail({ id }: { id: string }) {
  const q = useApiQuery((signal) => adminSecurityApi.auditLog(id, { signal }), [id]);
  if (q.isLoading) return <LoadingState layout="list" rows={1} />;
  if (q.error) return <ErrorState error={q.error} compact signInHref={ADMIN_LOGIN_PATH} />;
  return q.data ? <EntryFields entry={q.data.data} /> : null;
}

/** GET /admin/access — the access model the server actually enforces (read-only). */
function Access() {
  const q = useApiQuery((signal) => adminSecurityApi.access({ signal }), []);
  if (q.isLoading) return <LoadingState label="Loading roles…" />;
  if (q.error) return <ErrorState error={q.error} onRetry={q.retry} signInHref={ADMIN_LOGIN_PATH} />;
  const data = q.data!.data;
  const permissions = [...new Set(data.roles.flatMap((r) => r.permissions))];
  return (
    <div className="space-y-5">
      <Alert variant="info">
        These are the permissions the server enforces for each role. They are defined in the backend code, so they are shown read-only. The separate role
        tables behind <code>/admin/roles</code> are not used for authorization, so they are not offered for editing here.
      </Alert>
      <section className={`${adminCard} p-5 overflow-x-auto`} aria-label="Role permissions">
        <table className="text-xs min-w-full">
          <thead>
            <tr>
              <th className="text-left py-2 pr-4 font-bold text-gray-700 dark:text-gray-300">Permission</th>
              {data.roles.map((r) => (
                <th key={r.role} className="py-2 px-2 font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">{r.role}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {permissions.map((p) => (
              <tr key={p} className="border-t border-gray-100 dark:border-gray-800">
                <td className="py-1.5 pr-4 font-mono text-gray-700 dark:text-gray-300 whitespace-nowrap">{p}</td>
                {data.roles.map((r) => (
                  <td key={r.role} className="text-center">
                    {r.permissions.includes(p) ? <Check className="inline w-3.5 h-3.5 text-emerald-600" aria-label="granted" /> : <X className="inline w-3.5 h-3.5 text-gray-300" aria-label="not granted" />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className={`${adminCard} p-5 space-y-2`} aria-label="Admin accounts">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white">Administrator accounts</h2>
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {data.accounts.map((a) => (
            <li key={a.id} className="py-2 flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="min-w-0">
                <span className="font-semibold text-gray-900 dark:text-white">{a.fullName || a.email}</span>
                <span className="block text-[11px] text-gray-500 break-all">{a.email}</span>
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-300">{a.role}{a.isActive ? '' : ' · inactive'}</span>
            </li>
          ))}
        </ul>
        <p className="text-[11px] text-gray-500">Creating administrators and changing their roles is not available in the console.</p>
      </section>
    </div>
  );
}
