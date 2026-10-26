'use client';

import React, { useState } from 'react';
import { Check, ShieldAlert, Sparkles, Trash2, X } from 'lucide-react';
import { adminModerationApi } from '@/lib/admin-api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { Alert } from '@/components/ui/Alert';
import { ADMIN_LOGIN_PATH } from '@/components/admin/AdminSessionProvider';
import { RequirePermission } from '@/components/admin/RequirePermission';

const card = 'bg-white dark:bg-[#111827] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs';
const STATUSES = ['PENDING', 'RESOLVED', 'REJECTED'] as const;
const AI_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const;

/** Moderation queues (GET /admin/reports, /admin/ai/generated-content). Requires moderation.manage. */
export default function AdminModerationPage() {
  return (
    <RequirePermission permission="moderation.manage">
      <Moderation />
    </RequirePermission>
  );
}

function Moderation() {
  const [tab, setTab] = useState<'reports' | 'ai'>('reports');
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Reports & moderation</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review reported items and AI-generated content.</p>
      </div>
      <Alert variant="info">
        These queues only show what has been stored. Learners can&apos;t submit reports from the app yet (their report storage doesn&apos;t exist), and AI answers are not
        saved for review, so both queues stay empty until those are built.
      </Alert>
      <div role="tablist" aria-label="Moderation queues" className="flex gap-1.5">
        {([['reports', 'Reports', ShieldAlert], ['ai', 'AI content', Sparkles]] as const).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 ${tab === id ? 'bg-[var(--color-brand-blue)] text-white' : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800'}`}
          >
            <Icon className="w-3.5 h-3.5" aria-hidden="true" /> {label}
          </button>
        ))}
      </div>
      {tab === 'reports' ? <Reports /> : <AiContent />}
    </div>
  );
}

function StatusFilter<T extends string>({ value, options, onChange }: { value: T; options: readonly T[]; onChange: (v: T) => void }) {
  return (
    <label className="inline-flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
      Status
      <select className="px-2 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800" value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o} value={o}>{o.charAt(0) + o.slice(1).toLowerCase()}</option>
        ))}
      </select>
    </label>
  );
}

function Reports() {
  const [status, setStatus] = useState<(typeof STATUSES)[number]>('PENDING');
  const list = useApiQuery((signal) => adminModerationApi.listReports({ status }, { signal }), [status]);
  const act = useAsyncAction(async (signal: AbortSignal, id: string, resolve: boolean) => {
    await (resolve ? adminModerationApi.resolveReport(id, { signal }) : adminModerationApi.rejectReport(id, { signal }));
    list.retry();
  });
  const items = list.data?.data.reports ?? [];

  return (
    <div className="space-y-3">
      <StatusFilter value={status} options={STATUSES} onChange={setStatus} />
      {act.error && <ErrorState error={act.error} compact signInHref={ADMIN_LOGIN_PATH} />}
      {list.isLoading ? (
        <LoadingState label="Loading reports…" />
      ) : list.error && !list.data ? (
        <ErrorState error={list.error} onRetry={list.retry} signInHref={ADMIN_LOGIN_PATH} />
      ) : items.length === 0 ? (
        <EmptyState icon={ShieldAlert} title={`No ${status.toLowerCase()} reports`} />
      ) : (
        <ul className="space-y-2">
          {items.map((r) => (
            <li key={r.id} className={`${card} p-4 flex items-start justify-between gap-3`}>
              <div className="min-w-0 space-y-0.5">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{r.reason || 'Report'}</p>
                <p className="text-[11px] text-gray-500">
                  {[r.reportedItemType, r.reportedItemId].filter(Boolean).join(' · ')}
                  {r.createdAt && ` · ${new Date(r.createdAt).toLocaleString()}`}
                </p>
                {r.description && <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-line">{r.description}</p>}
              </div>
              {r.status === 'PENDING' && (
                <div className="flex gap-1 shrink-0">
                  <button type="button" disabled={act.isPending} onClick={() => void act.run(r.id, true)} aria-label="Resolve report" className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 disabled:opacity-50">
                    <Check className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button type="button" disabled={act.isPending} onClick={() => void act.run(r.id, false)} aria-label="Reject report" className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 disabled:opacity-50">
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AiContent() {
  const [status, setStatus] = useState<(typeof AI_STATUSES)[number]>('PENDING');
  const list = useApiQuery((signal) => adminModerationApi.listAiContent({ status }, { signal }), [status]);
  const act = useAsyncAction(async (signal: AbortSignal, id: string, action: 'approve' | 'reject' | 'delete') => {
    if (action === 'delete' && !window.confirm('Delete this record?')) return;
    const call = { approve: adminModerationApi.approveAiContent, reject: adminModerationApi.rejectAiContent, delete: adminModerationApi.deleteAiContent }[action];
    await call(id, { signal });
    list.retry();
  });
  const items = list.data?.data.contents ?? [];

  return (
    <div className="space-y-3">
      <StatusFilter value={status} options={AI_STATUSES} onChange={setStatus} />
      {act.error && <ErrorState error={act.error} compact signInHref={ADMIN_LOGIN_PATH} />}
      {list.isLoading ? (
        <LoadingState label="Loading AI content…" />
      ) : list.error && !list.data ? (
        <ErrorState error={list.error} onRetry={list.retry} signInHref={ADMIN_LOGIN_PATH} />
      ) : items.length === 0 ? (
        <EmptyState icon={Sparkles} title={`No ${status.toLowerCase()} AI content`} />
      ) : (
        <ul className="space-y-2">
          {items.map((c) => (
            <li key={c.id} className={`${card} p-4 space-y-2`}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  {c.contentType || 'Content'}
                  {c.createdAt && ` · ${new Date(c.createdAt).toLocaleString()}`}
                </p>
                <div className="flex gap-1 shrink-0">
                  {c.status === 'PENDING' && (
                    <>
                      <button type="button" disabled={act.isPending} onClick={() => void act.run(c.id, 'approve')} aria-label="Approve" className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 disabled:opacity-50">
                        <Check className="w-4 h-4" aria-hidden="true" />
                      </button>
                      <button type="button" disabled={act.isPending} onClick={() => void act.run(c.id, 'reject')} aria-label="Reject" className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 disabled:opacity-50">
                        <X className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </>
                  )}
                  <button type="button" disabled={act.isPending} onClick={() => void act.run(c.id, 'delete')} aria-label="Delete" className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50">
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
              {c.contentPayload && <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-line line-clamp-6">{c.contentPayload}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
