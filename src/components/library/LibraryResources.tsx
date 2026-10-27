'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ClipboardCheck, Search, Sparkles, Trash2 } from 'lucide-react';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { EmptyState, ErrorState, FeatureUnavailable, LoadingState } from '@/components/ui/states';
import {
  KINDS,
  deleteLearnerAssessment,
  deleteResource,
  kindInfo,
  loadAttempts,
  loadLearnerAssessments,
  loadResources,
  resourceHref,
} from '@/lib/self-learning';

const card = 'bg-white dark:bg-[#111827] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs';
const input =
  'px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600';
const fmtDate = (iso: string) => (iso && !Number.isNaN(Date.parse(iso)) ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '');

const SOURCE_LABEL: Record<string, string> = {
  material: 'Uploaded file',
  text: 'Pasted text',
  course: 'Your course',
  module: 'Course module',
  resource: 'Earlier lesson',
  note: 'Your note',
  youtube: 'YouTube video',
};
const RESOURCE_KINDS = KINDS.filter((k) => !['quiz', 'exam'].includes(k.id));

function Filters({ q, setQ, children }: { q: string; setQ: (v: string) => void; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <label className="relative flex-1">
        <span className="sr-only">Filter by title</span>
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
        <input className={`${input} w-full pl-9`} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by title" />
      </label>
      {children}
    </div>
  );
}

/** Lessons, notes, summaries, study plans and other material the learner generated from their own sources. */
export function GeneratedResources() {
  const [kind, setKind] = useState('');
  const [q, setQ] = useState('');
  const items = useApiQuery(() => loadResources(kind ? { kind } : {}), [kind]);
  const remove = useAsyncAction(async (_signal: AbortSignal, id: string) => {
    if (!window.confirm('Delete this item?')) return;
    await deleteResource(id);
    items.retry();
  });
  const shown = useMemo(() => (items.data ?? []).filter((r) => r.title.toLowerCase().includes(q.trim().toLowerCase())), [items.data, q]);

  if (items.error?.kind === 'not_implemented') return <FeatureUnavailable title="Generated lessons aren't available yet" description="This server can't save generated material yet." />;
  return (
    <div className="space-y-4">
      <Filters q={q} setQ={setQ}>
        <label>
          <span className="sr-only">Type</span>
          <select className={`${input} w-full sm:w-48`} value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="">All types</option>
            {RESOURCE_KINDS.map((k) => (
              <option key={k.id} value={k.id}>{k.label}</option>
            ))}
          </select>
        </label>
      </Filters>
      {remove.error && <ErrorState error={remove.error} compact />}
      {items.isLoading ? (
        <LoadingState rows={3} label="Loading your lessons and notes…" />
      ) : items.error && !items.data ? (
        <ErrorState error={items.error} onRetry={items.retry} />
      ) : !shown.length ? (
        <EmptyState
          icon={Sparkles}
          title={q || kind ? 'Nothing matches' : 'Nothing generated yet'}
          description={q || kind ? 'Try another title or type.' : 'Upload a file or paste text on the Learn page, then pick what to make from it.'}
          action={q || kind ? undefined : <Link href="/learn" className="text-sm font-semibold text-purple-600 hover:underline">Start learning</Link>}
        />
      ) : (
        <ul className="space-y-2" aria-label="Generated lessons and notes">
          {shown.map((r) => (
            <li key={r.id} className={`${card} p-4 flex flex-wrap items-center gap-3`}>
              <div className="min-w-0 flex-1">
                <Link href={resourceHref(r)} className="text-sm font-bold text-gray-900 dark:text-white hover:text-purple-600 break-words">{r.title}</Link>
                <p className="text-[11px] text-gray-500">
                  {[kindInfo(r.kind)?.label ?? r.kind, SOURCE_LABEL[r.sourceType], fmtDate(r.createdAt), r.completed && 'Completed'].filter(Boolean).join(' · ')}
                </p>
              </div>
              <button type="button" onClick={() => void remove.run(r.id)} disabled={remove.isPending} aria-label={`Delete ${r.title}`} className="p-2.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50">
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** The learner's own quizzes and mock exams, with their attempt history. */
export function MyAssessmentsLibrary() {
  const [kind, setKind] = useState<'' | 'quiz' | 'exam'>('');
  const [q, setQ] = useState('');
  const items = useApiQuery(() => loadLearnerAssessments(kind || undefined), [kind]);
  const attempts = useApiQuery(() => loadAttempts(), []);
  const remove = useAsyncAction(async (_signal: AbortSignal, id: string) => {
    if (!window.confirm('Delete this quiz or exam and its attempts?')) return;
    await deleteLearnerAssessment(id);
    items.retry();
    attempts.retry();
  });
  const shown = useMemo(() => (items.data ?? []).filter((a) => a.title.toLowerCase().includes(q.trim().toLowerCase())), [items.data, q]);

  if (items.error?.kind === 'not_implemented') return <FeatureUnavailable title="Your quizzes aren't available yet" description="This server can't save quizzes yet." />;
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Filters q={q} setQ={setQ}>
          <label>
            <span className="sr-only">Type</span>
            <select className={`${input} w-full sm:w-40`} value={kind} onChange={(e) => setKind(e.target.value as '' | 'quiz' | 'exam')}>
              <option value="">Quizzes and exams</option>
              <option value="quiz">Quizzes</option>
              <option value="exam">Mock exams</option>
            </select>
          </label>
        </Filters>
        {remove.error && <ErrorState error={remove.error} compact />}
        {items.isLoading ? (
          <LoadingState rows={3} label="Loading your quizzes…" />
        ) : items.error && !items.data ? (
          <ErrorState error={items.error} onRetry={items.retry} />
        ) : !shown.length ? (
          <EmptyState
            icon={ClipboardCheck}
            title={q || kind ? 'Nothing matches' : 'No quizzes or exams yet'}
            description={q || kind ? 'Try another title or type.' : 'Make a quiz or a mock exam from your own material on the Practice page.'}
            action={q || kind ? undefined : <Link href="/practice" className="text-sm font-semibold text-purple-600 hover:underline">Make one</Link>}
          />
        ) : (
          <ul className="space-y-2" aria-label="Your quizzes and exams">
            {shown.map((a) => (
              <li key={a.id} className={`${card} p-4 flex flex-wrap items-center gap-3`}>
                <div className="min-w-0 flex-1">
                  <Link href={`/practice/${encodeURIComponent(a.id)}`} className="text-sm font-bold text-gray-900 dark:text-white hover:text-purple-600 break-words">{a.title}</Link>
                  <p className="text-[11px] text-gray-500">
                    {[
                      a.kind === 'exam' ? 'Mock exam' : 'Quiz',
                      `${a.questionCount} questions`,
                      a.examType,
                      SOURCE_LABEL[a.sourceType],
                      a.attemptCount ? `${a.attemptCount} attempt${a.attemptCount === 1 ? '' : 's'}` : 'Not taken yet',
                      a.bestScore != null && `best ${a.bestScore}%`,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
                <button type="button" onClick={() => void remove.run(a.id)} disabled={remove.isPending} aria-label={`Delete ${a.title}`} className="p-2.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50">
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <section className="space-y-2" aria-label="Attempt history">
        <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">Attempt history</h2>
        {attempts.isLoading ? (
          <LoadingState rows={2} label="Loading attempts…" />
        ) : attempts.error && !attempts.data ? (
          <ErrorState error={attempts.error} onRetry={attempts.retry} compact />
        ) : !(attempts.data ?? []).length ? (
          <p className="text-xs text-gray-500">Your submitted attempts will be listed here.</p>
        ) : (
          <ul className={`${card} divide-y divide-gray-100 dark:divide-gray-800`}>
            {(attempts.data ?? []).map((t) => (
              <li key={t.id} className="p-3 sm:px-4 flex flex-wrap items-center justify-between gap-2 text-sm">
                <Link
                  href={t.status === 'submitted' ? `/practice/attempts/${encodeURIComponent(t.id)}` : `/practice/${encodeURIComponent(t.assessmentId)}`}
                  className="font-semibold text-gray-900 dark:text-white hover:text-purple-600 break-words min-w-0"
                >
                  {t.title}
                </Link>
                <span className="text-xs text-gray-500">
                  {t.status === 'submitted' ? `${t.score ?? 0}% · ${fmtDate(t.submittedAt ?? t.startedAt)}` : 'In progress — continue'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
