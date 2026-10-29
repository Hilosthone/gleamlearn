'use client';

import React, { useState } from 'react';
import { Check, MessageSquare, ShieldAlert, Sparkles, Star, Trash2, X } from 'lucide-react';
import { adminFeedbackApi, adminModerationApi, adminModerationDetailApi } from '@/lib/admin-api';
import { TabBar, adminInput, useAdminTabs } from '@/components/admin/ui';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { Alert } from '@/components/ui/Alert';
import { ADMIN_LOGIN_PATH } from '@/components/admin/AdminSessionProvider';
import { RequirePermission } from '@/components/admin/RequirePermission';

const card = 'bg-white dark:bg-[#111827] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs';
const STATUSES = ['PENDING', 'RESOLVED', 'REJECTED'] as const;
const AI_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const;

/** Moderation queues (GET /admin/reports, /admin/feedback, /admin/ai/generated-content). Requires moderation.manage. */
export default function AdminModerationPage() {
  return (
    <RequirePermission permission="moderation.manage">
      <Moderation />
    </RequirePermission>
  );
}

function Moderation() {
  const tabs = useAdminTabs([
    { id: 'reports', label: 'Reports' },
    { id: 'feedback', label: 'Feedback' },
    { id: 'ai', label: 'AI content' },
  ]);
  const tab = tabs.active;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Reports & moderation</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review learners&apos; problem reports, their feedback, and AI-generated content.</p>
      </div>
      <Alert variant="info">
        Learners send reports from Help &amp; Support and from past questions; they see each report&apos;s status (waiting, resolved or closed) as you decide it. AI answers
        are not saved for review, so the AI content queue stays empty until that is built.
      </Alert>
      <TabBar label="Moderation queues" tabs={tabs.visible} active={tab} onSelect={tabs.select} />
      {tab === 'reports' ? <Reports /> : tab === 'feedback' ? <Feedback /> : <AiContent />}
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
                <ReportNotes id={r.id} />
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

const RATINGS = ['all', '5', '4', '3', '2', '1'] as const;

/** GET /admin/feedback: ratings and messages from Help & Support, newest first, with the overall average. */
function Feedback() {
  const [rating, setRating] = useState<(typeof RATINGS)[number]>('all');
  const [page, setPage] = useState(1);
  const list = useApiQuery((signal) => adminFeedbackApi.list({ page, rating: rating === 'all' ? undefined : Number(rating) }, { signal }), [rating, page]);
  const data = list.data?.data;
  const items = data?.feedback ?? [];
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="inline-flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
          Rating
          <select className="px-2 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800" value={rating} onChange={(e) => { setPage(1); setRating(e.target.value as (typeof RATINGS)[number]); }}>
            {RATINGS.map((r) => (
              <option key={r} value={r}>{r === 'all' ? 'All' : `${r} star${r === '1' ? '' : 's'}`}</option>
            ))}
          </select>
        </label>
        {data && (
          <p className="text-xs text-gray-600 dark:text-gray-300" aria-label="Feedback summary">
            {data.summary.count} in total{data.summary.averageRating !== null && <> · average <strong>{data.summary.averageRating}</strong> / 5</>}
          </p>
        )}
      </div>
      {list.isLoading ? (
        <LoadingState label="Loading feedback…" />
      ) : list.error && !list.data ? (
        <ErrorState error={list.error} onRetry={list.retry} signInHref={ADMIN_LOGIN_PATH} />
      ) : items.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No feedback yet" />
      ) : (
        <>
          <ul className="space-y-2" aria-label="Feedback">
            {items.map((f) => (
              <li key={f.id} className={`${card} p-4 space-y-1`}>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex gap-0.5" aria-label={`${f.rating} of 5 stars`}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} className={`w-3.5 h-3.5 ${n <= f.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} aria-hidden="true" />
                    ))}
                  </span>
                  <span className="text-[11px] text-gray-500">{new Date(f.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line break-words">{f.message}</p>
              </li>
            ))}
          </ul>
          {data && data.pagination.totalPages > 1 && (
            <div className="flex items-center gap-2 text-xs">
              <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 disabled:opacity-40">Previous</button>
              <span>Page {page} of {data.pagination.totalPages}</span>
              <button type="button" disabled={page >= data.pagination.totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 disabled:opacity-40">Next</button>
            </div>
          )}
        </>
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
              <AiContentDetail id={c.id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** GET /admin/reports/:id, then PATCH { description } — the moderator's notes on a report (shown to other moderators). */
function ReportNotes({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const detail = useApiQuery((signal) => adminModerationDetailApi.report(id, { signal }), [id], { enabled: open });
  const [text, setText] = useState<string | null>(null);
  const save = useAsyncAction(async (signal: AbortSignal) => {
    await adminModerationDetailApi.updateReport(id, { description: (text ?? '').trim() }, { signal });
    setText(null);
    detail.retry();
  });
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-[11px] font-semibold text-[var(--color-brand-blue)] hover:underline">
        Details &amp; notes
      </button>
    );
  if (detail.isLoading) return <LoadingState layout="list" rows={1} />;
  if (detail.error) return <ErrorState error={detail.error} compact signInHref={ADMIN_LOGIN_PATH} />;
  const rec = detail.data!.data;
  const value = text ?? rec.description ?? '';
  return (
    <form className="mt-2 space-y-2" aria-label="Report notes" onSubmit={(e) => { e.preventDefault(); void save.run(); }}>
      <p className="text-[11px] text-gray-500 break-all">Report {rec.id} · reporter {rec.reporterId ?? 'unknown'} · status {rec.status}</p>
      <label className="block space-y-1">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Details (the learner&apos;s text; you can add a note)</span>
        <textarea className={`${adminInput} min-h-16`} value={value} maxLength={4000} onChange={(e) => setText(e.target.value)} />
      </label>
      {save.error && <ErrorState error={save.error} compact signInHref={ADMIN_LOGIN_PATH} />}
      <div className="flex gap-2">
        <button type="submit" disabled={save.isPending || text === null} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--color-brand-blue)] text-white disabled:opacity-50">Save</button>
        <button type="button" onClick={() => { setText(null); setOpen(false); }} className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 dark:border-gray-800">Close</button>
      </div>
    </form>
  );
}

/** GET /admin/ai/generated-content/:id — the full stored record. */
function AiContentDetail({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const q = useApiQuery((signal) => adminModerationDetailApi.aiContent(id, { signal }), [id], { enabled: open });
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-[11px] font-semibold text-[var(--color-brand-blue)] hover:underline">
        Full record
      </button>
    );
  if (q.isLoading) return <LoadingState layout="list" rows={1} />;
  if (q.error) return <ErrorState error={q.error} compact signInHref={ADMIN_LOGIN_PATH} />;
  return <pre className="text-[11px] bg-gray-50 dark:bg-gray-900 rounded-xl p-3 overflow-x-auto whitespace-pre-wrap break-words">{JSON.stringify(q.data!.data, null, 2)}</pre>;
}
