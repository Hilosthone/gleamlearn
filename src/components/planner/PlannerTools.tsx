'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Pause, Pencil, Play, Plus, Sparkles, Square, Timer, Trash2 } from 'lucide-react';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { EmptyState, ErrorState, FeatureUnavailable, LoadingState } from '@/components/ui/states';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { loadPersonalCourses } from '@/lib/learner-content';
import { loadPrepPlans } from '@/lib/exam-prep';
import { invalidateLearnerStats } from '@/lib/learning';
import {
  completeSession,
  createEvent,
  deleteEvent,
  elapsedSeconds,
  eventPayload,
  generatePlan,
  loadMonthEvents,
  loadOpenSession,
  localDate,
  pauseSession,
  resumeSession,
  startSession,
  updateEvent,
  type CalendarItem,
  type EventDraft,
  type GeneratedPlanSummary,
  type Intensity,
  type LiveSession,
} from '@/lib/planner';

const card = 'bg-white dark:bg-[#111827] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs';
const input =
  'w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]';

// ------------------------------------------------------------------------------------------------ generate a plan

/** Generates study sessions until a deadline from one of the learner's courses or exam-prep plans (no AI). */
export function GeneratePlan({ onDone }: { onDone: () => void }) {
  const courses = useApiQuery(() => loadPersonalCourses(), []);
  const preps = useApiQuery(() => loadPrepPlans().catch(() => []), []);
  const [targetId, setTargetId] = useState('');
  const [deadline, setDeadline] = useState('');
  const [intensity, setIntensity] = useState<Intensity>('normal');
  const run = useAsyncAction(async (): Promise<GeneratedPlanSummary> => {
    const r = await generatePlan(targetId, deadline, intensity);
    onDone();
    return r;
  });
  const options = [...(courses.data ?? []).map((c) => ({ id: c.id, label: `Course: ${c.title}` })), ...(preps.data ?? []).map((p) => ({ id: p.id, label: `Exam plan: ${p.title}` }))];
  const [tomorrow] = useState(() => localDate(new Date(Date.now() + 86_400_000))); // fixed for this form

  return (
    <form
      className={`${card} p-5 space-y-3`}
      aria-label="Generate a study plan"
      onSubmit={(e) => {
        e.preventDefault();
        if (targetId && deadline) void run.run();
      }}
    >
      <h2 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-[var(--color-brand-blue)]" aria-hidden="true" /> Generate a study plan</h2>
      <p className="text-xs text-gray-500">Sessions are scheduled from your course&apos;s unfinished modules (or your exam subjects) and the topics you&apos;ve found hardest, up to your deadline. Generating again for the same course or exam replaces its earlier generated sessions that you haven&apos;t done.</p>
      {!options.length && !courses.isLoading && !preps.isLoading ? (
        <p className="text-xs text-gray-600 dark:text-gray-300">Create a course (My courses) or an exam preparation plan (Practice → Exam prep plans) first.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">For</span>
            <select className={input} value={targetId} onChange={(e) => setTargetId(e.target.value)}>
              <option value="">Choose…</option>
              {options.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Deadline</span>
            <input type="date" className={input} min={tomorrow} value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Intensity</span>
            <select className={input} value={intensity} onChange={(e) => setIntensity(e.target.value as Intensity)}>
              <option value="light">Light (3 days a week)</option>
              <option value="normal">Normal (weekdays)</option>
              <option value="intensive">Intensive (every day)</option>
            </select>
          </label>
        </div>
      )}
      {run.error && <ErrorState error={run.error} compact />}
      {run.result && <Alert variant="success">{run.result.sessions} sessions planned for {run.result.targetTitle}, from {run.result.from} to {run.result.to}.</Alert>}
      <Button type="submit" size="sm" isLoading={run.isPending} disabled={!targetId || !deadline}>Generate plan</Button>
    </form>
  );
}

// ------------------------------------------------------------------------------------------------ live session

const hms = (s: number) => `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

/** Start, pause, resume and finish a timed study session; an open session is picked up again after a reload. */
export function LiveSessionPanel({ onFinished }: { onFinished: () => void }) {
  const open = useApiQuery(() => loadOpenSession(), []);
  const [session, setSession] = useState<LiveSession | null | undefined>(undefined);
  const [title, setTitle] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const current = session === undefined ? open.data ?? null : session;
  useEffect(() => {
    if (current?.status !== 'active') return;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [current?.status]);
  const act = useAsyncAction(async (_signal: AbortSignal, op: 'start' | 'pause' | 'resume' | 'complete') => {
    const s = op === 'start' ? await startSession(title || 'Study session') : op === 'pause' ? await pauseSession(current!.id) : op === 'resume' ? await resumeSession(current!.id) : await completeSession(current!.id);
    setNow(Date.now());
    if (op === 'complete') {
      setSession(null);
      setTitle('');
      invalidateLearnerStats();
      onFinished();
    } else setSession(s);
    return s;
  });

  if (open.error?.kind === 'not_implemented') return null;
  return (
    <section className={`${card} p-5 space-y-3`} aria-label="Study timer">
      <h2 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5"><Timer className="w-4 h-4 text-[var(--color-brand-blue)]" aria-hidden="true" /> Study timer</h2>
      {open.isLoading && session === undefined ? (
        <LoadingState rows={1} label="Checking for a session in progress…" />
      ) : current ? (
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white break-words">{current.title}</p>
            <p className="text-2xl font-black tabular-nums text-gray-900 dark:text-white" role="timer" aria-label="Time studied">{hms(elapsedSeconds(current, now))}</p>
            <p className="text-[11px] text-gray-500">{current.status === 'paused' ? 'Paused' : 'Running'}</p>
          </div>
          {current.status === 'active' ? (
            <Button type="button" size="sm" variant="outline" isLoading={act.isPending} onClick={() => void act.run('pause')}><Pause className="w-4 h-4" aria-hidden="true" /> Pause</Button>
          ) : (
            <Button type="button" size="sm" variant="outline" isLoading={act.isPending} onClick={() => void act.run('resume')}><Play className="w-4 h-4" aria-hidden="true" /> Resume</Button>
          )}
          <Button type="button" size="sm" variant="success" isLoading={act.isPending} onClick={() => void act.run('complete')}><Square className="w-4 h-4" aria-hidden="true" /> Finish</Button>
        </div>
      ) : (
        <form className="flex flex-wrap items-end gap-2" onSubmit={(e) => { e.preventDefault(); void act.run('start'); }}>
          <label className="flex-1 min-w-48 space-y-1">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">What are you studying?</span>
            <input className={input} value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Photosynthesis" />
          </label>
          <Button type="submit" size="sm" isLoading={act.isPending}><Play className="w-4 h-4" aria-hidden="true" /> Start</Button>
        </form>
      )}
      {act.error && <ErrorState error={act.error} compact />}
    </section>
  );
}

// ------------------------------------------------------------------------------------------------ calendar

const emptyEvent = (date: string): EventDraft => ({ title: '', date, start: '09:00', end: '10:00', allDay: false, description: '' });
const toDraft = (e: CalendarItem): EventDraft => {
  const s = new Date(e.startTime);
  const en = new Date(e.endTime);
  const hm = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return { title: e.title, date: localDate(s), start: hm(s), end: hm(en), allDay: e.isAllDay, description: e.description };
};

function EventForm({ initial, busy, onSave, onCancel }: { initial: EventDraft; busy: boolean; onSave: (d: EventDraft) => void; onCancel: () => void }) {
  const [d, setD] = useState(initial);
  const p = eventPayload(d);
  return (
    <form className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-end" aria-label="Calendar event" onSubmit={(e) => { e.preventDefault(); if (typeof p !== 'string') onSave(d); }}>
      <label className="col-span-2 space-y-1"><span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Title</span><input className={input} value={d.title} maxLength={200} onChange={(e) => setD({ ...d, title: e.target.value })} /></label>
      <label className="col-span-2 space-y-1"><span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Date</span><input type="date" className={input} value={d.date} onChange={(e) => setD({ ...d, date: e.target.value })} /></label>
      {!d.allDay && (
        <>
          <label className="space-y-1"><span className="text-xs font-semibold text-gray-700 dark:text-gray-300">From</span><input type="time" className={input} value={d.start} onChange={(e) => setD({ ...d, start: e.target.value })} /></label>
          <label className="space-y-1"><span className="text-xs font-semibold text-gray-700 dark:text-gray-300">To</span><input type="time" className={input} value={d.end} onChange={(e) => setD({ ...d, end: e.target.value })} /></label>
        </>
      )}
      <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 col-span-2"><input type="checkbox" checked={d.allDay} onChange={(e) => setD({ ...d, allDay: e.target.checked })} /> All day</label>
      <label className="col-span-2 sm:col-span-4 space-y-1"><span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Notes (optional)</span><input className={input} value={d.description} maxLength={1000} onChange={(e) => setD({ ...d, description: e.target.value })} /></label>
      {typeof p === 'string' && d.title && <p className="text-xs text-amber-700 col-span-2 sm:col-span-4">{p}</p>}
      <div className="flex gap-2 col-span-2 sm:col-span-4">
        <Button type="submit" size="sm" isLoading={busy} disabled={typeof p === 'string'}>Save event</Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

/** The learner's calendar: a month of events, with add / edit / delete. */
export function CalendarPanel() {
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() + 1 };
  });
  const events = useApiQuery(() => loadMonthEvents(month.y, month.m), [month.y, month.m]);
  const [editing, setEditing] = useState<{ id: string | null; draft: EventDraft } | null>(null);
  const save = useAsyncAction(async (_signal: AbortSignal, d: EventDraft, id: string | null) => {
    const p = eventPayload(d);
    if (typeof p === 'string') throw new Error(p);
    await (id ? updateEvent(id, p) : createEvent(p));
    setEditing(null);
    events.retry();
  });
  const remove = useAsyncAction(async (_signal: AbortSignal, id: string) => {
    if (!window.confirm('Delete this event?')) return;
    await deleteEvent(id);
    events.retry();
  });
  const byDay = useMemo(() => {
    const m = new Map<string, CalendarItem[]>();
    for (const e of events.data ?? []) {
      const k = localDate(new Date(e.startTime));
      m.set(k, [...(m.get(k) ?? []), e]);
    }
    return [...m].sort(([a], [b]) => a.localeCompare(b));
  }, [events.data]);
  const label = new Date(month.y, month.m - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const shift = (n: number) => setMonth(({ y, m }) => (m + n < 1 ? { y: y - 1, m: 12 } : m + n > 12 ? { y: y + 1, m: 1 } : { y, m: m + n }));

  if (events.error?.kind === 'not_implemented') return <FeatureUnavailable title="The calendar isn't available yet" description="Calendar events can't be stored on this server yet. Plan sessions in Study plan instead." />;
  return (
    <div className="space-y-4">
      <div className={`${card} p-4 flex flex-wrap items-center justify-between gap-2`}>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => shift(-1)} aria-label="Previous month" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"><ChevronLeft className="w-4 h-4" aria-hidden="true" /></button>
          <h2 className="text-sm font-extrabold text-gray-900 dark:text-white min-w-36 text-center" aria-live="polite">{label}</h2>
          <button type="button" onClick={() => shift(1)} aria-label="Next month" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"><ChevronRight className="w-4 h-4" aria-hidden="true" /></button>
        </div>
        <Button type="button" size="sm" onClick={() => setEditing({ id: null, draft: emptyEvent(localDate(new Date())) })}><Plus className="w-4 h-4" aria-hidden="true" /> Add event</Button>
      </div>
      {editing && (
        <div className={`${card} p-5`}>
          <EventForm initial={editing.draft} busy={save.isPending} onSave={(d) => void save.run(d, editing.id)} onCancel={() => setEditing(null)} />
          {save.error && <div className="mt-2"><ErrorState error={save.error} compact /></div>}
        </div>
      )}
      {remove.error && <ErrorState error={remove.error} compact />}
      {events.isLoading ? (
        <LoadingState rows={3} label="Loading your calendar…" />
      ) : events.error && !events.data ? (
        <ErrorState error={events.error} onRetry={events.retry} />
      ) : !byDay.length ? (
        <EmptyState icon={CalendarDays} title="Nothing in your calendar this month" description="Add classes, exams, deadlines or study blocks." />
      ) : (
        <ol className="space-y-3" aria-label="Events this month">
          {byDay.map(([day, items]) => (
            <li key={day} className={`${card} p-4 space-y-2`}>
              <p className="text-xs font-bold text-[var(--color-brand-blue)]">{new Date(`${day}T00:00:00`).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              <ul className="space-y-1.5">
                {items.map((e) => (
                  <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="min-w-0">
                      <span className="font-semibold text-gray-900 dark:text-white break-words">{e.title}</span>
                      <span className="text-xs text-gray-500"> · {e.isAllDay ? 'All day' : `${new Date(e.startTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}–${new Date(e.endTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`}</span>
                      {e.description && <span className="block text-xs text-gray-500 break-words">{e.description}</span>}
                    </span>
                    <span className="flex gap-1">
                      <button type="button" aria-label={`Edit ${e.title}`} onClick={() => setEditing({ id: e.id, draft: toDraft(e) })} className="p-2 rounded-xl text-gray-400 hover:text-[var(--color-brand-blue)] hover:bg-blue-50 dark:hover:bg-blue-950/30"><Pencil className="w-4 h-4" aria-hidden="true" /></button>
                      <button type="button" aria-label={`Delete ${e.title}`} onClick={() => void remove.run(e.id)} className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"><Trash2 className="w-4 h-4" aria-hidden="true" /></button>
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
