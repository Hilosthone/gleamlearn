'use client';

import React, { useState } from 'react';
import { BarChart3, BookOpenCheck, CalendarClock, CheckCircle2, Flag, Pencil, Trash2, XCircle } from 'lucide-react';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { EmptyState, ErrorState, FeatureUnavailable, LoadingState } from '@/components/ui/states';
import { Button } from '@/components/ui/Button';
import {
  createPrepPlan,
  daysUntil,
  deletePrepPlan,
  loadPastQuestionFacets,
  loadPastQuestions,
  loadQuestionBank,
  loadPerformance,
  loadPrepPlans,
  prepPayload,
  updatePrepPlan,
  type PastQuestionFilter,
  type PrepDraft,
  type PrepPlan,
  type TopicStat,
} from '@/lib/exam-prep';
import { reportQuestion } from '@/lib/support';

const panel = 'bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs';
const input =
  'w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600';
const TYPE_LABEL = { quiz: 'Quizzes', test: 'Tests', exam: 'Exams' } as const;
const EXAMS = ['JAMB', 'WAEC', 'NECO', 'Post-UTME', 'GCE', 'BECE'];

// ------------------------------------------------------------------------------------------------ past questions

/**
 * Real past questions (stored or from the configured provider) or the shared question bank, filtered by subject,
 * year and topic; answers are checked here against the stored key.
 */
export function PastQuestions() {
  const [source, setSource] = useState<'past' | 'bank'>('past');
  const facets = useApiQuery(() => loadPastQuestionFacets(), []);
  const [filter, setFilter] = useState<PastQuestionFilter>({});
  const [applied, setApplied] = useState<(PastQuestionFilter & { source: 'past' | 'bank' }) | null>(null);
  const questions = useApiQuery(() => (applied ? (applied.source === 'bank' ? loadQuestionBank(applied) : loadPastQuestions(applied)) : Promise.resolve(null)), [JSON.stringify(applied)]);
  const [chosen, setChosen] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  if (facets.error?.kind === 'not_implemented' && source === 'past') return <FeatureUnavailable title="Past questions aren't available yet" description="This server has no past-question bank yet." />;
  const f = source === 'past' ? facets.data : undefined; // the question bank is searched by typed filters
  return (
    <div className={`${panel} space-y-5`}>
      <div>
        <h2 className="text-base font-extrabold text-gray-900 dark:text-white">Past questions</h2>
        <p className="text-xs text-gray-500">Questions from real past examinations, or GleamLearn&apos;s question bank. Choose a subject and, if you like, a year or topic.</p>
      </div>
      <div className="flex gap-1.5" role="group" aria-label="Question source">
        {(['past', 'bank'] as const).map((src) => (
          <button key={src} type="button" aria-pressed={source === src} onClick={() => { setSource(src); setApplied(null); }} className={`px-3 py-1.5 rounded-xl text-xs font-bold ${source === src ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
            {src === 'past' ? 'Past exam questions' : 'Question bank'}
          </button>
        ))}
      </div>
      <form
        className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end"
        aria-label="Find past questions"
        onSubmit={(e) => {
          e.preventDefault();
          setChosen({});
          setRevealed({});
          setApplied({ ...filter, source });
        }}
      >
        {(['subject', 'year', 'topic'] as const).map((k) => (
          <label key={k} className="block space-y-1">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 capitalize">{k}</span>
            {f && (k === 'subject' ? f.subjects : k === 'year' ? f.years : f.topics).length ? (
              <select className={input} value={filter[k] ?? ''} onChange={(e) => setFilter({ ...filter, [k]: e.target.value || undefined })}>
                <option value="">{k === 'subject' ? 'Choose…' : 'Any'}</option>
                {(k === 'subject' ? f.subjects : k === 'year' ? f.years : f.topics).map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            ) : (
              <input className={input} value={filter[k] ?? ''} maxLength={60} onChange={(e) => setFilter({ ...filter, [k]: e.target.value || undefined })} placeholder={k === 'subject' ? 'e.g. biology' : k === 'year' ? 'e.g. 2019' : 'Any'} />
            )}
          </label>
        ))}
        <Button type="submit" size="sm" variant="success" disabled={!filter.subject?.trim()}>Find questions</Button>
      </form>
      {facets.error && !facets.data && <ErrorState error={facets.error} onRetry={facets.retry} compact />}
      {questions.isLoading ? (
        <LoadingState rows={3} label="Loading past questions…" />
      ) : questions.error ? (
        <ErrorState error={questions.error} onRetry={questions.retry} />
      ) : !questions.data ? null : !questions.data.length ? (
        <EmptyState icon={BookOpenCheck} title="No past questions found" description="Try another subject, year or topic." />
      ) : (
        <ol className="space-y-3" aria-label="Past questions">
          {questions.data.map((q, i) => {
            const pick = chosen[q.id];
            const shown = revealed[q.id];
            return (
              <li key={q.id} className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">{[q.examType, q.subject, q.year, q.topic].filter(Boolean).join(' · ')}</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white break-words">{i + 1}. {q.text}</p>
                <div className="space-y-1.5" role="radiogroup" aria-label={`Question ${i + 1} options`}>
                  {q.options.map((o) => (
                    <label key={o} className={`flex items-start gap-2 p-2 rounded-xl border cursor-pointer text-sm ${pick === o ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30' : 'border-gray-200 dark:border-gray-800'}`}>
                      <input type="radio" name={`pq-${q.id}`} value={o} checked={pick === o} disabled={shown} onChange={() => setChosen({ ...chosen, [q.id]: o })} className="mt-0.5 accent-emerald-600" />
                      <span className="break-words">{o}</span>
                    </label>
                  ))}
                </div>
                {shown ? (
                  <div className={`text-xs p-3 rounded-xl ${q.answer && pick === q.answer ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300'}`} role="status">
                    <p className="font-bold flex items-center gap-1.5">
                      {q.answer && pick === q.answer ? <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> : <XCircle className="w-4 h-4" aria-hidden="true" />}
                      {q.answer ? (pick === q.answer ? 'Correct' : `The answer is “${q.answer}”`) : 'No answer key for this question'}
                    </p>
                    {q.explanation && <p className="mt-1">{q.explanation}</p>}
                  </div>
                ) : null}
                {shown ? (
                  <ReportQuestion questionId={q.id} />
                ) : (
                  <Button type="button" size="sm" variant="outline" disabled={!pick} onClick={() => setRevealed({ ...revealed, [q.id]: true })}>Check answer</Button>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

/** POST /questions/:id/report: a wrong key or a broken question goes to the moderators (see Help & Support). */
function ReportQuestion({ questionId }: { questionId: string }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const send = useAsyncAction(async () => {
    await reportQuestion(questionId, text);
    setText('');
  });
  if (send.status === 'success') return <p className="text-[11px] text-emerald-700 dark:text-emerald-400" role="status">Thanks — reported. You can follow it in Help &amp; Support.</p>;
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
        <Flag className="w-3 h-3" aria-hidden="true" /> Report a problem with this question
      </button>
    );
  return (
    <form className="space-y-2" aria-label="Report this question" onSubmit={(e) => { e.preventDefault(); if (text.trim().length >= 5) void send.run(); }}>
      <label className="block space-y-1">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">What&apos;s wrong? (e.g. the answer key, a typo, a missing option)</span>
        <textarea className={`${input} min-h-16`} value={text} maxLength={4000} onChange={(e) => setText(e.target.value)} />
      </label>
      {send.error && <ErrorState error={send.error} compact />}
      <div className="flex gap-2">
        <Button type="submit" size="sm" variant="outline" isLoading={send.isPending} disabled={text.trim().length < 5}>Send report</Button>
        <button type="button" onClick={() => setOpen(false)} className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">Cancel</button>
      </div>
    </form>
  );
}

// ------------------------------------------------------------------------------------------------ prep plans

const emptyDraft: PrepDraft = { title: '', examType: 'JAMB', subjects: '', targetDate: '', notes: '' };

function PrepForm({ initial, busy, error, onSave, onCancel }: { initial: PrepDraft; busy: boolean; error: React.ReactNode; onSave: (d: PrepDraft) => void; onCancel?: () => void }) {
  const [d, setD] = useState(initial);
  const problem = prepPayload(d);
  return (
    <form
      className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      aria-label="Exam preparation plan"
      onSubmit={(e) => {
        e.preventDefault();
        if (typeof problem !== 'string') onSave(d);
      }}
    >
      <label className="block space-y-1 sm:col-span-2">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Plan name</span>
        <input className={input} value={d.title} maxLength={200} onChange={(e) => setD({ ...d, title: e.target.value })} placeholder="e.g. JAMB 2027" />
      </label>
      <label className="block space-y-1">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Exam</span>
        <select className={input} value={d.examType} onChange={(e) => setD({ ...d, examType: e.target.value })}>
          {EXAMS.map((x) => (
            <option key={x} value={x}>{x}</option>
          ))}
        </select>
      </label>
      <label className="block space-y-1">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Exam date</span>
        <input type="date" className={input} value={d.targetDate} onChange={(e) => setD({ ...d, targetDate: e.target.value })} />
      </label>
      <label className="block space-y-1 sm:col-span-2">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Subjects (comma-separated)</span>
        <input className={input} value={d.subjects} onChange={(e) => setD({ ...d, subjects: e.target.value })} placeholder="Biology, Chemistry, Physics, English" />
      </label>
      <label className="block space-y-1 sm:col-span-2">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Notes (optional)</span>
        <textarea className={`${input} min-h-20`} value={d.notes} maxLength={2000} onChange={(e) => setD({ ...d, notes: e.target.value })} />
      </label>
      {typeof problem === 'string' && (d.title || d.subjects || d.targetDate) && <p className="text-xs text-amber-700 sm:col-span-2">{problem}</p>}
      {error}
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" size="sm" variant="success" isLoading={busy} disabled={typeof problem === 'string'}>Save plan</Button>
        {onCancel && <Button type="button" size="sm" variant="outline" onClick={onCancel}>Cancel</Button>}
      </div>
    </form>
  );
}

const toDraft = (p: PrepPlan): PrepDraft => ({ title: p.title, examType: p.examType || 'JAMB', subjects: p.subjects.join(', '), targetDate: p.targetDate ? p.targetDate.slice(0, 10) : '', notes: p.notes });

/** The learner's own exam-preparation plans: exam, date, subjects, countdown. */
export function PrepPlans() {
  const plans = useApiQuery(() => loadPrepPlans(), []);
  const [editing, setEditing] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0); // a new, empty form after each plan is created
  const save = useAsyncAction(async (_signal: AbortSignal, d: PrepDraft, id?: string) => {
    const p = prepPayload(d);
    if (typeof p === 'string') throw new Error(p);
    await (id ? updatePrepPlan(id, p) : createPrepPlan(p));
    if (!id) setFormKey((k) => k + 1);
    setEditing(null);
    plans.retry();
  });
  const remove = useAsyncAction(async (_signal: AbortSignal, id: string) => {
    if (!window.confirm('Delete this preparation plan?')) return;
    await deletePrepPlan(id);
    plans.retry();
  });

  if (plans.error?.kind === 'not_implemented') return <FeatureUnavailable title="Prep plans aren't available yet" description="This server can't store preparation plans yet." />;
  return (
    <div className="space-y-6">
      <div className={`${panel} space-y-4`}>
        <h2 className="text-base font-extrabold text-gray-900 dark:text-white">New preparation plan</h2>
        <PrepForm key={`new-${formKey}`} initial={emptyDraft} busy={save.isPending && editing === null} error={editing === null && save.error ? <div className="sm:col-span-2"><ErrorState error={save.error} compact /></div> : null} onSave={(d) => void save.run(d)} />
      </div>
      {remove.error && <ErrorState error={remove.error} compact />}
      {plans.isLoading ? (
        <LoadingState rows={2} label="Loading your plans…" />
      ) : plans.error && !plans.data ? (
        <ErrorState error={plans.error} onRetry={plans.retry} />
      ) : !(plans.data ?? []).length ? (
        <EmptyState icon={CalendarClock} title="No preparation plans yet" description="Add the exam you're preparing for, its date and your subjects." />
      ) : (
        <ul className="space-y-3" aria-label="Your preparation plans">
          {(plans.data ?? []).map((p) => {
            const days = daysUntil(p.targetDate);
            return (
              <li key={p.id} className={`${panel} space-y-3`}>
                {editing === p.id ? (
                  <PrepForm initial={toDraft(p)} busy={save.isPending} error={save.error ? <div className="sm:col-span-2"><ErrorState error={save.error} compact /></div> : null} onSave={(d) => void save.run(d, p.id)} onCancel={() => setEditing(null)} />
                ) : (
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold text-gray-900 dark:text-white break-words">{p.title}</p>
                      <p className="text-xs text-gray-500">{[p.examType, p.subjects.join(', '), p.targetDate && new Date(p.targetDate).toLocaleDateString()].filter(Boolean).join(' · ')}</p>
                      {days !== null && <p className={`text-xs font-bold mt-1 ${days < 0 ? 'text-gray-400' : days <= 30 ? 'text-amber-600' : 'text-emerald-600'}`}>{days < 0 ? 'Exam date has passed' : days === 0 ? 'Exam is today' : `${days} day${days === 1 ? '' : 's'} to go`}</p>}
                      {p.notes && <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 whitespace-pre-line">{p.notes}</p>}
                    </div>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => setEditing(p.id)} aria-label={`Edit ${p.title}`} className="p-2.5 rounded-xl text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30">
                        <Pencil className="w-4 h-4" aria-hidden="true" />
                      </button>
                      <button type="button" onClick={() => void remove.run(p.id)} disabled={remove.isPending} aria-label={`Delete ${p.title}`} className="p-2.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50">
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ------------------------------------------------------------------------------------------------ analytics

function TopicBars({ items, empty }: { items: TopicStat[]; empty: string }) {
  if (!items.length) return <p className="text-xs text-gray-500">{empty}</p>;
  return (
    <ul className="space-y-2">
      {items.slice(0, 8).map((t) => (
        <li key={t.topic} className="text-xs">
          <div className="flex justify-between gap-2">
            <span className="font-semibold text-gray-800 dark:text-gray-200 break-words">{t.topic}</span>
            <span className="text-gray-500 shrink-0">{t.correct}/{t.total} · {t.percent}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden" aria-hidden="true">
            <div className={`h-full ${t.percent >= 80 ? 'bg-emerald-500' : t.percent >= 60 ? 'bg-sky-500' : 'bg-amber-500'}`} style={{ width: `${t.percent}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** The learner's performance: overview, by type, mastery, strong and weak topics — from their graded submissions. */
export function PerformanceAnalytics() {
  const perf = useApiQuery(() => loadPerformance(), []);
  if (perf.isLoading) return <LoadingState layout="cards" rows={3} label="Loading your performance…" />;
  if (perf.error?.kind === 'not_implemented') return <FeatureUnavailable title="Analytics aren't available yet" description="This server can't compute analytics yet." />;
  if (perf.error && !perf.data) return <ErrorState error={perf.error} onRetry={perf.retry} />;
  const p = perf.data!;
  if (!p.totalAssessments && !p.questionsAnswered) {
    return <div className={panel}><EmptyState icon={BarChart3} title="No results yet" description="Submit a quiz, test or exam — yours or GleamLearn's — and your scores, time and topics will show here." /></div>;
  }
  const stat = (label: string, value: string) => (
    <div className="rounded-2xl bg-gray-50 dark:bg-gray-900 p-4">
      <p className="text-[11px] font-semibold text-gray-500">{label}</p>
      <p className="text-xl font-black text-gray-900 dark:text-white">{value}</p>
    </div>
  );
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" aria-label="Overview">
        {stat('Assessments completed', String(p.totalAssessments))}
        {stat('Average score', p.averageScore === null ? '—' : `${Math.round(p.averageScore)}%`)}
        {stat('Mastery', p.masteryPercentage === null ? '—' : `${p.masteryPercentage}%`)}
        {stat('Time practising', `${p.totalTimeSpentMinutes} min`)}
      </div>
      <div className={`${panel} space-y-3`}>
        <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">By type</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {p.byType.map((t) => (
            <li key={t.type} className="rounded-2xl border border-gray-200 dark:border-gray-800 p-3 text-xs">
              <p className="font-bold text-gray-900 dark:text-white">{TYPE_LABEL[t.type]}</p>
              <p className="text-gray-500">{t.completed} completed{t.averageScore !== null ? ` · average ${Math.round(t.averageScore)}%` : ''}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className={`${panel} space-y-3`} aria-label="Topics to revise">
          <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">Topics to revise</h2>
          <TopicBars items={p.weak} empty="No weak topics: every topic with at least two questions is at 60% or more." />
        </section>
        <section className={`${panel} space-y-3`} aria-label="Strong topics">
          <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">Strong topics</h2>
          <TopicBars items={p.strong} empty="No topic at 80% or more yet (with at least two questions)." />
        </section>
      </div>
      <section className={`${panel} space-y-3`} aria-label="All topics">
        <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">All topics ({p.questionsAnswered} questions answered)</h2>
        <TopicBars items={p.topics} empty="Topics appear when your questions have topics." />
      </section>
    </div>
  );
}
