'use client';

import React, { useMemo, useState } from 'react';
import { CalendarDays, Check, Clock, FastForward, Pencil, Plus, SkipForward, Target, Trash2, Sparkles } from 'lucide-react';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import {
  ACTIVITY_TYPES,
  activityLabel,
  addPlanItem,
  completeGoal,
  completePlanItem,
  createGoal,
  deleteGoal,
  goalChanges,
  goalDraftOf,
  groupPlan,
  loadGoals,
  loadPlan,
  localDate,
  rescheduleMissed,
  skipPlanItem,
  updateGoal,
  validatePlanDraft,
  type Goal,
  type GoalDraft,
  type PlanDraft,
  type PlanItem,
} from '@/lib/planner';
import { loadStudySessions } from '@/lib/gamification';
import { CalendarPanel, GeneratePlan, LiveSessionPanel } from '@/components/planner/PlannerTools';

const card = 'bg-white dark:bg-[#111827] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs';
const input =
  'w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]';
const fmtDay = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });

type View = 'plan' | 'goals' | 'sessions' | 'calendar';
const VIEWS: { id: View; label: string; icon: typeof Target }[] = [
  { id: 'plan', label: 'Study plan', icon: CalendarDays },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'sessions', label: 'Study sessions', icon: Clock },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
];

/** The learner's own study plan, goals and recorded sessions (previously an invented week, streak and exam list). */
export default function PlannerPage() {
  const [view, setView] = useState<View>('plan');
  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Study Planning</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Plan your study sessions, set goals and see the time you have studied.</p>
      </div>
      <div role="tablist" aria-label="Planner sections" className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            role="tab"
            aria-selected={view === v.id}
            onClick={() => setView(v.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              view === v.id
                ? 'bg-[var(--color-brand-blue)] text-white shadow-xs'
                : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <v.icon className="w-3.5 h-3.5" aria-hidden="true" />
            {v.label}
          </button>
        ))}
      </div>
      <div role="tabpanel">
        {view === 'plan' && <Plan />}
        {view === 'goals' && <Goals />}
        {view === 'sessions' && <Sessions />}
        {view === 'calendar' && <CalendarPanel />}
      </div>
    </div>
  );
}

// Plan -----------------------------------------------------------------------------------------------------------

function Plan() {
  const plan = useApiQuery(() => loadPlan(), []);
  const generator = <GeneratePlan onDone={() => plan.retry()} />;
  const today = localDate(new Date());
  const groups = useMemo(() => groupPlan(plan.data ?? [], today), [plan.data, today]);
  const [draft, setDraft] = useState<PlanDraft | null>(null);
  const [draftError, setDraftError] = useState<string | null>(null);

  const add = useAsyncAction(async (_signal: AbortSignal, d: PlanDraft) => {
    const res = await addPlanItem(d);
    setDraft(null);
    plan.retry();
    return res;
  });
  const mark = useAsyncAction(async (_signal: AbortSignal, id: string, done: boolean) => {
    await (done ? completePlanItem(id) : skipPlanItem(id));
    plan.retry();
  });
  const move = useAsyncAction(async () => {
    const moved = await rescheduleMissed();
    plan.retry();
    return moved;
  });

  const submit = () => {
    if (!draft) return;
    const err = validatePlanDraft(draft);
    setDraftError(err);
    if (!err) void add.run(draft);
  };

  return (
    <div className="space-y-4">
      {generator}
      <div className="flex flex-wrap gap-2">
        {!draft && (
          <Button type="button" size="sm" onClick={() => { add.reset(); setDraftError(null); setDraft({ title: '', date: today, startTime: '', endTime: '', activityType: 'study' }); }}>
            <Plus className="w-4 h-4" aria-hidden="true" /> Add session
          </Button>
        )}
        <Button type="button" size="sm" variant="purple" disabled title="AI study plans aren't available yet">
          <Sparkles className="w-4 h-4" aria-hidden="true" /> AI plan (not available yet)
        </Button>
      </div>

      {draft && (
        <form className={`${card} p-5 grid grid-cols-1 sm:grid-cols-2 gap-3`} aria-label="New study session" onSubmit={(e) => { e.preventDefault(); submit(); }}>
          <label className="block space-y-1 sm:col-span-2">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">What will you study?</span>
            <input className={input} value={draft.title} maxLength={255} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Date</span>
            <input type="date" className={input} value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Type</span>
            <select className={input} value={draft.activityType} onChange={(e) => setDraft({ ...draft, activityType: e.target.value as PlanDraft['activityType'] })}>
              {ACTIVITY_TYPES.map((a) => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Start (optional)</span>
            <input type="time" className={input} value={draft.startTime} onChange={(e) => setDraft({ ...draft, startTime: e.target.value })} />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">End (optional)</span>
            <input type="time" className={input} value={draft.endTime} onChange={(e) => setDraft({ ...draft, endTime: e.target.value })} />
          </label>
          <div className="sm:col-span-2 space-y-2">
            {draftError && <Alert variant="error">{draftError}</Alert>}
            {add.error && <ErrorState error={add.error} compact />}
            <div className="flex gap-2">
              <Button type="submit" size="sm" isLoading={add.isPending}>Save session</Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setDraft(null)} disabled={add.isPending}>Cancel</Button>
            </div>
          </div>
        </form>
      )}

      {(mark.error || move.error) && <ErrorState error={(mark.error ?? move.error)!} compact />}
      {move.status === 'success' && <Alert variant="success">{move.result ? `Moved ${move.result} missed session${move.result === 1 ? '' : 's'} forward.` : 'There were no missed sessions to move.'}</Alert>}

      {plan.isLoading ? (
        <LoadingState label="Loading your plan…" />
      ) : plan.error && !plan.data ? (
        <ErrorState error={plan.error} onRetry={plan.retry} />
      ) : (plan.data ?? []).length === 0 ? (
        !draft && <EmptyState icon={CalendarDays} title="Your plan is empty" description="Add the sessions you want to study; they are saved to your account." />
      ) : (
        <div className="space-y-5">
          {groups.overdue.length > 0 && (
            <PlanSection title="Missed" items={groups.overdue} onMark={mark.run} busy={mark.isPending}
              action={<Button type="button" size="sm" variant="outline" isLoading={move.isPending} onClick={() => void move.run()}><FastForward className="w-3.5 h-3.5" aria-hidden="true" /> Move to later</Button>} />
          )}
          <PlanSection title={`Today · ${fmtDay(today)}`} items={groups.today} onMark={mark.run} busy={mark.isPending} empty="Nothing planned for today." />
          {groups.upcoming.map((g) => (
            <PlanSection key={g.date} title={fmtDay(g.date)} items={g.items} onMark={mark.run} busy={mark.isPending} />
          ))}
          {groups.past.length > 0 && <PlanSection title="Earlier" items={groups.past} onMark={mark.run} busy={mark.isPending} />}
        </div>
      )}
    </div>
  );
}

function PlanSection({ title, items, onMark, busy, empty, action }: { title: string; items: PlanItem[]; onMark: (id: string, done: boolean) => unknown; busy: boolean; empty?: string; action?: React.ReactNode }) {
  return (
    <section aria-label={title} className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">{title}</h2>
        {action}
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-gray-500">{empty}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((i) => (
            <li key={i.id} className={`${card} p-4 flex items-center justify-between gap-3`}>
              <div className="min-w-0">
                <p className={`text-sm font-semibold ${i.state === 'planned' ? 'text-gray-900 dark:text-white' : 'text-gray-400 line-through'}`}>{i.title}</p>
                <p className="text-[11px] text-gray-500">
                  {activityLabel(i.activityType)}
                  {i.startTime && ` · ${i.startTime}${i.endTime ? `–${i.endTime}` : ''}`}
                  {i.state === 'done' && ' · Done'}
                  {i.state === 'skipped' && ' · Skipped'}
                </p>
              </div>
              {i.state === 'planned' && (
                <div className="flex gap-1 shrink-0">
                  <button type="button" disabled={busy} onClick={() => void onMark(i.id, true)} aria-label={`Mark ${i.title} done`} className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 disabled:opacity-50">
                    <Check className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button type="button" disabled={busy} onClick={() => void onMark(i.id, false)} aria-label={`Skip ${i.title}`} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50">
                    <SkipForward className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// Goals ----------------------------------------------------------------------------------------------------------

const fmtAmount = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

/** PATCH /goals/:id: rename, re-date, change the target, or record progress (reaching the target completes it). */
function GoalEditor({ goal, onDone }: { goal: Goal; onDone: (saved: boolean) => void }) {
  const [draft, setDraft] = useState<GoalDraft>(() => goalDraftOf(goal));
  const [invalid, setInvalid] = useState<string | null>(null);
  const save = useAsyncAction(async () => {
    const res = goalChanges(goal, draft);
    if ('error' in res) return setInvalid(res.error);
    setInvalid(null);
    if (Object.keys(res.changes).length) await updateGoal(goal.id, res.changes);
    onDone(Object.keys(res.changes).length > 0);
  });
  const field = (k: keyof GoalDraft) => ({ value: draft[k], onChange: (e: React.ChangeEvent<HTMLInputElement>) => setDraft({ ...draft, [k]: e.target.value }) });
  return (
    <form className="space-y-3" aria-label={`Edit goal ${goal.title}`} onSubmit={(e) => { e.preventDefault(); void save.run(); }}>
      <label className="block space-y-1">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Goal</span>
        <input className={input} maxLength={200} {...field('title')} />
      </label>
      <label className="block space-y-1">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Details</span>
        <input className={input} maxLength={2000} {...field('description')} />
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Progress so far</span>
          <input type="number" min={0} step="any" inputMode="decimal" className={input} {...field('current')} />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Target</span>
          <input type="number" min={0} step="any" inputMode="decimal" className={input} {...field('target')} />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Target date</span>
          <input type="date" className={input} {...field('targetDate')} />
        </label>
      </div>
      <p className="text-[11px] text-gray-500">Use any unit — hours, topics, past papers. Reaching the target marks the goal complete.</p>
      {invalid && <p className="text-xs text-red-600" role="alert">{invalid}</p>}
      {save.error && <ErrorState error={save.error} compact />}
      <div className="flex gap-2">
        <Button type="submit" size="sm" isLoading={save.isPending}>Save</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => onDone(false)} disabled={save.isPending}>Cancel</Button>
      </div>
    </form>
  );
}

function Goals() {
  const goals = useApiQuery(() => loadGoals(), []);
  const [form, setForm] = useState<{ title: string; description: string; targetDate: string } | null>(null);

  const create = useAsyncAction(async (_signal: AbortSignal, f: { title: string; description: string; targetDate: string }) => {
    const res = await createGoal(f);
    setForm(null);
    goals.retry();
    return res;
  });
  const complete = useAsyncAction(async (_signal: AbortSignal, id: string) => {
    await completeGoal(id);
    goals.retry();
  });
  const remove = useAsyncAction(async (_signal: AbortSignal, id: string) => {
    await deleteGoal(id);
    goals.retry();
  });
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {!form ? (
        <Button type="button" size="sm" onClick={() => { create.reset(); setForm({ title: '', description: '', targetDate: '' }); }}>
          <Plus className="w-4 h-4" aria-hidden="true" /> New goal
        </Button>
      ) : (
        <form className={`${card} p-5 space-y-3`} aria-label="New goal" onSubmit={(e) => { e.preventDefault(); if (form.title.trim()) void create.run(form); }}>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Goal</span>
            <input className={input} value={form.title} maxLength={255} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Details (optional)</span>
            <input className={input} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Target date (optional)</span>
            <input type="date" className={input} value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} />
          </label>
          {create.error && <ErrorState error={create.error} compact />}
          <div className="flex gap-2">
            <Button type="submit" size="sm" isLoading={create.isPending} disabled={!form.title.trim()}>Save goal</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setForm(null)} disabled={create.isPending}>Cancel</Button>
          </div>
        </form>
      )}

      {(complete.error || remove.error) && <ErrorState error={(complete.error ?? remove.error)!} compact />}
      {goals.isLoading ? (
        <LoadingState label="Loading goals…" />
      ) : goals.error && !goals.data ? (
        <ErrorState error={goals.error} onRetry={goals.retry} />
      ) : (goals.data ?? []).length === 0 ? (
        !form && <EmptyState icon={Target} title="No goals yet" description="Set a goal and mark it complete when you reach it." />
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(goals.data ?? []).map((g) =>
            editing === g.id ? (
              <li key={g.id} className={`${card} p-5`}>
                <GoalEditor goal={g} onDone={(saved) => { setEditing(null); if (saved) goals.retry(); }} />
              </li>
            ) : (
            <li key={g.id} className={`${card} p-5 space-y-3`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className={`text-sm font-bold ${g.completed ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>{g.title}</h3>
                  {g.description && <p className="text-xs text-gray-500 mt-0.5">{g.description}</p>}
                  {g.targetDate && <p className="text-[11px] text-gray-500 mt-0.5">By {fmtDay(g.targetDate)}</p>}
                </div>
                <button type="button" disabled={remove.isPending} onClick={() => void remove.run(g.id)} aria-label={`Delete goal ${g.title}`} className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50">
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
              <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden" role="progressbar" aria-valuenow={g.percent} aria-valuemin={0} aria-valuemax={100} aria-label={`${g.title} progress`}>
                <div className="h-full bg-[var(--color-brand-blue)]" style={{ width: `${g.percent}%` }} />
              </div>
              <p className="text-[11px] text-gray-500">{fmtAmount(g.current)} of {fmtAmount(g.target)} ({g.percent}%)</p>
              <div className="flex flex-wrap gap-2">
                {g.completed ? (
                  <p className="text-xs font-semibold text-emerald-600 self-center">Completed</p>
                ) : (
                  <Button type="button" size="sm" variant="outline" disabled={complete.isPending} onClick={() => void complete.run(g.id)}>
                    <Check className="w-3.5 h-3.5" aria-hidden="true" /> Mark complete
                  </Button>
                )}
                <Button type="button" size="sm" variant="outline" onClick={() => setEditing(g.id)} aria-label={`Edit goal ${g.title}`}>
                  <Pencil className="w-3.5 h-3.5" aria-hidden="true" /> Edit or update progress
                </Button>
              </div>
            </li>
            ),
          )}
        </ul>
      )}
    </div>
  );
}

// Recorded study sessions ----------------------------------------------------------------------------------------

function Sessions() {
  const sessions = useApiQuery(() => loadStudySessions(), []);
  const timer = <LiveSessionPanel onFinished={() => sessions.retry()} />;
  if (sessions.isLoading) return <div className="space-y-4">{timer}<LoadingState label="Loading study sessions…" /></div>;
  if (sessions.error && !sessions.data) return <div className="space-y-4">{timer}<ErrorState error={sessions.error} onRetry={sessions.retry} /></div>;
  const items = sessions.data ?? [];
  if (items.length === 0) return <div className="space-y-4">{timer}<EmptyState icon={Clock} title="No study sessions recorded yet" description="Start the timer above, or study a lesson: the time is recorded here." /></div>;
  return (
    <div className="space-y-4">
    {timer}
    <ul className="space-y-2">
      {items.map((s) => (
        <li key={s.id} className={`${card} p-4 flex items-center justify-between gap-3`}>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{s.title}</p>
            {s.at && <p className="text-[11px] text-gray-500">{new Date(s.at).toLocaleString()}</p>}
          </div>
          <span className="text-xs font-bold text-gray-600 dark:text-gray-300 shrink-0">{s.minutes} min</span>
        </li>
      ))}
    </ul>
    </div>
  );
}
