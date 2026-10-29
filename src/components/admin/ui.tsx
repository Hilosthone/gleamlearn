// src/components/admin/ui.tsx — small building blocks shared by the admin console pages
'use client';

import React, { useState } from 'react';
import { useUrlParam } from '@/hooks/useUrlParam';
import { useApiQuery } from '@/hooks/useApiQuery';
import { ErrorState, LoadingState } from '@/components/ui/states';
import type { AdminPermissionName, Pagination } from '@/lib/admin-api';
import { ADMIN_LOGIN_PATH, useAdminSession } from './AdminSessionProvider';

export const adminCard = 'bg-white dark:bg-[#111827] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs';
export const adminInput =
  'w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]';

export function PageHeader({ title, description, actions }: { title: string; description?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{title}</h1>
        {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
      </div>
      {actions}
    </div>
  );
}

export interface AdminTab {
  id: string;
  label: string;
  /** hidden when the admin's role lacks it (the backend enforces it regardless) */
  permission?: AdminPermissionName;
}

/** Tabs remembered in ?tab= so a section can be linked to; only tabs the admin's role can use are shown. */
export function useAdminTabs(tabs: AdminTab[]) {
  const { can } = useAdminSession();
  const visible = tabs.filter((t) => !t.permission || can(t.permission));
  const fromUrl = useUrlParam('tab');
  const [chosen, setChosen] = useState<string | null>(null);
  const wanted = chosen ?? fromUrl;
  const active = visible.find((t) => t.id === wanted)?.id ?? visible[0]?.id ?? '';
  const select = (id: string) => {
    setChosen(id);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', id);
    window.history.replaceState(window.history.state, '', url.toString());
  };
  return { visible, active, select };
}

export function TabBar({ label, tabs, active, onSelect }: { label: string; tabs: AdminTab[]; active: string; onSelect: (id: string) => void }) {
  return (
    <div role="tablist" aria-label={label} className="flex gap-1.5 overflow-x-auto pb-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={active === t.id}
          onClick={() => onSelect(t.id)}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap ${
            active === t.id ? 'bg-[var(--color-brand-blue)] text-white' : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <div className={`${adminCard} p-5`}>
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-gray-900 dark:text-white tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">{hint}</p>}
    </div>
  );
}

/** "—" for values the server does not measure (null), never a made-up number. */
export const fmt = (v: unknown) => (v === null || v === undefined ? '—' : typeof v === 'number' ? v.toLocaleString() : String(v));

export function Pager({ pagination, onPage }: { pagination?: Pagination; onPage: (page: number) => void }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages } = pagination;
  return (
    <div className="flex items-center gap-2 text-xs" aria-label="Pages">
      <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 disabled:opacity-40">
        Previous
      </button>
      <span>
        Page {page} of {totalPages}
      </span>
      <button type="button" disabled={page >= totalPages} onClick={() => onPage(page + 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 disabled:opacity-40">
        Next
      </button>
    </div>
  );
}

const label = (key: string) => key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase());

/**
 * Shows a metrics endpoint as it answers: its real values, or the "not available yet" state when it answers 501.
 * Nested objects are listed one level deep; nothing is filled in.
 */
export function MetricPanel({ title, load }: { title: string; load: (signal: AbortSignal) => Promise<{ data: Record<string, unknown> }> }) {
  const q = useApiQuery(load, []);
  return (
    <section className={`${adminCard} p-5 space-y-3`} aria-label={title}>
      <h2 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h2>
      {q.isLoading ? (
        <LoadingState layout="list" rows={2} label={`Loading ${title.toLowerCase()}…`} />
      ) : q.error ? (
        <ErrorState error={q.error} onRetry={q.retry} signInHref={ADMIN_LOGIN_PATH} />
      ) : (
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {Object.entries(q.data?.data ?? {}).map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3 border-b border-gray-100 dark:border-gray-800 py-1.5">
              <dt className="text-gray-500 dark:text-gray-400">{label(k)}</dt>
              <dd className="font-semibold text-gray-900 dark:text-white text-right break-words">{typeof v === 'object' && v !== null ? JSON.stringify(v) : fmt(v)}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
