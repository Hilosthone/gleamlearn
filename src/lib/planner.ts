/**
 * ---------------------------------------------------------------------------
 * lib/planner.ts — Study plan sessions and study goals (typed wrappers over existing api.ts clients)
 * ---------------------------------------------------------------------------
 * Backend contract (verified 2026-10-26; learner-JWT, owner-scoped):
 *   GET  /planner                     → { schedule: [{ id, title, description, scheduledDate, startTime, endTime, activityType, isCompleted, isSkipped }] }
 *   POST /planner { title, scheduledDate, startTime?, endTime?, activityType? }  → { item }
 *   POST /planner/:id/complete | /skip
 *   POST /planner/regenerate          → moves unfinished sessions dated today or earlier to two days from now
 *   POST /planner/generate            → 501: no AI plan generation yet
 *   GET/POST /goals, POST /goals/:id/complete, DELETE /goals/:id   { title, description?, targetValue?, targetDate? }
 *   PATCH /goals/:id { title?, description?, targetDate?, targetValue? (> 0), currentValue? (kept within the target;
 *                      reaching it completes the goal, lowering it reopens it) }
 *   /calendar                         → 501: its tables don't exist yet
 */

import { calendarApi, goalsApi, plannerApi, studySessionsApi, type CreatePlannerItemPayload } from './api.ts';

type Raw = Record<string, unknown>;
const str = (v: unknown) => (typeof v === 'string' ? v : '');
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : Number(v) || 0);
function list(res: unknown, key: string): Raw[] {
  const v = res && typeof res === 'object' ? (res as Raw)[key] : undefined;
  return Array.isArray(v) ? (v.filter((x) => x && typeof x === 'object') as Raw[]) : [];
}

export const ACTIVITY_TYPES = [
  { id: 'study', label: 'Study' },
  { id: 'revision', label: 'Revision' },
  { id: 'quiz_practice', label: 'Practice' },
  { id: 'exam_prep', label: 'Exam prep' },
] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number]['id'];
export const activityLabel = (id: string) => ACTIVITY_TYPES.find((a) => a.id === id)?.label ?? 'Study';

export interface PlanItem {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  activityType: string;
  state: 'done' | 'skipped' | 'planned';
}

export function toPlanItems(res: unknown): PlanItem[] {
  return list(res, 'schedule')
    .filter((r) => typeof r.id === 'string' && /^\d{4}-\d{2}-\d{2}/.test(str(r.scheduledDate)))
    .map((r) => ({
      id: r.id as string,
      title: str(r.title) || 'Study session',
      description: str(r.description),
      date: str(r.scheduledDate).slice(0, 10),
      startTime: str(r.startTime),
      endTime: str(r.endTime),
      activityType: str(r.activityType) || 'study',
      state: r.isCompleted === true ? ('done' as const) : r.isSkipped === true ? ('skipped' as const) : ('planned' as const),
    }))
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
}

/** Local calendar date as YYYY-MM-DD. */
export const localDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export interface PlanGroups {
  overdue: PlanItem[]; // planned, dated before today
  today: PlanItem[];
  upcoming: { date: string; items: PlanItem[] }[];
  past: PlanItem[]; // done or skipped, dated before today
}

export function groupPlan(items: PlanItem[], today: string): PlanGroups {
  const upcoming = new Map<string, PlanItem[]>();
  const out: PlanGroups = { overdue: [], today: [], upcoming: [], past: [] };
  for (const i of items) {
    if (i.date === today) out.today.push(i);
    else if (i.date > today) upcoming.set(i.date, [...(upcoming.get(i.date) ?? []), i]);
    else if (i.state === 'planned') out.overdue.push(i);
    else out.past.push(i);
  }
  out.upcoming = Array.from(upcoming, ([date, its]) => ({ date, items: its }));
  out.past.reverse(); // most recent first
  return out;
}

export interface PlanDraft {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  activityType: ActivityType;
}

/** Returns the error to show, or null when the draft can be sent. */
export function validatePlanDraft(d: PlanDraft): string | null {
  if (!d.title.trim()) return 'Enter what you will study.';
  if (d.title.trim().length > 255) return 'Keep the title under 255 characters.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date)) return 'Choose a date.';
  if (d.startTime && d.endTime && d.endTime <= d.startTime) return 'The end time must be after the start time.';
  return null;
}

export function planPayload(d: PlanDraft): CreatePlannerItemPayload {
  return {
    title: d.title.trim(),
    scheduledDate: d.date,
    activityType: d.activityType,
    ...(d.startTime ? { startTime: d.startTime } : {}),
    ...(d.endTime ? { endTime: d.endTime } : {}),
  };
}

export const loadPlan = async () => toPlanItems(await plannerApi.getAllPlannerSessions());
export const addPlanItem = (d: PlanDraft) => plannerApi.createPlannerItem(planPayload(d));
export const completePlanItem = (id: string) => plannerApi.completePlannerSession(id);
export const skipPlanItem = (id: string) => plannerApi.skipPlannerSession(id);
/** Moves unfinished sessions dated today or earlier forward; returns how many moved. */
export async function rescheduleMissed(): Promise<number> {
  const res = (await plannerApi.regeneratePlanner()) as Raw | null;
  return num(res?.missedSessionsAdjusted);
}

// Goals --------------------------------------------------------------------------------------------------------

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: string | null;
  percent: number;
  completed: boolean;
  /** progress so far and the target, in the goal's own unit (100 = percent when no target was set) */
  current: number;
  target: number;
}

export function toGoals(res: unknown): Goal[] {
  return list(res, 'goals')
    .filter((r) => typeof r.id === 'string')
    .map((r) => {
      const target = num(r.targetValue);
      const current = num(r.currentValue);
      const completed = r.isCompleted === true;
      return {
        id: r.id as string,
        title: str(r.title) || 'Goal',
        description: str(r.description),
        targetDate: str(r.targetDate).slice(0, 10) || null,
        percent: completed ? 100 : target > 0 ? Math.max(0, Math.min(100, Math.round((current / target) * 100))) : 0,
        completed,
        current,
        target,
      };
    })
    .sort((a, b) => Number(a.completed) - Number(b.completed));
}

export const loadGoals = async () => toGoals(await goalsApi.getAllGoals());
export const createGoal = (g: { title: string; description: string; targetDate: string }) =>
  goalsApi.createGoal({ title: g.title.trim(), ...(g.description.trim() ? { description: g.description.trim() } : {}), ...(g.targetDate ? { targetDate: g.targetDate } : {}) });
export const completeGoal = (id: string) => goalsApi.completeGoal(id);

export interface GoalDraft {
  title: string;
  description: string;
  targetDate: string;
  target: string;
  current: string;
}
export const goalDraftOf = (g: Goal): GoalDraft => ({ title: g.title, description: g.description, targetDate: g.targetDate ?? '', target: String(g.target), current: String(g.current) });

/** Only the changed fields, as PATCH /goals/:id expects them; an error message instead when the draft is invalid. */
export function goalChanges(g: Goal, d: GoalDraft): { changes: Record<string, string | number> } | { error: string } {
  const title = d.title.trim();
  if (!title) return { error: 'Give the goal a name.' };
  const target = Number(d.target);
  const current = Number(d.current);
  if (!d.target.trim() || !Number.isFinite(target) || target <= 0) return { error: 'The target must be a number above 0.' };
  if (!d.current.trim() || !Number.isFinite(current) || current < 0) return { error: 'Progress must be 0 or more.' };
  const out: Record<string, string | number> = {};
  if (title !== g.title) out.title = title;
  if (d.description.trim() !== g.description) out.description = d.description.trim();
  if (d.targetDate && d.targetDate !== (g.targetDate ?? '')) out.targetDate = d.targetDate;
  if (target !== g.target) out.targetValue = target;
  if (current !== g.current) out.currentValue = current;
  return { changes: out };
}

export const updateGoal = (id: string, changes: Record<string, string | number>) => goalsApi.updateGoal(id, changes);
export const deleteGoal = (id: string) => goalsApi.deleteGoal(id);

// ---------------------------------------------------------------------------------------------------------------
// Generated study plans (POST /planner/generate: from one of the learner's courses or exam-prep plans)
// ---------------------------------------------------------------------------------------------------------------

export type Intensity = 'light' | 'normal' | 'intensive';
export interface GeneratedPlanSummary {
  sessions: number;
  from: string | null;
  to: string | null;
  topics: number;
  targetTitle: string;
}

export async function generatePlan(targetId: string, deadline: string, intensity: Intensity): Promise<GeneratedPlanSummary> {
  const r = ((await plannerApi.generatePlanner({ targetId, deadline, intensity })) ?? {}) as Raw;
  const target = (r.target ?? {}) as Raw;
  return {
    sessions: typeof r.sessions === 'number' ? r.sessions : 0,
    from: typeof r.from === 'string' ? r.from : null,
    to: typeof r.to === 'string' ? r.to : null,
    topics: typeof r.topics === 'number' ? r.topics : 0,
    targetTitle: typeof target.title === 'string' ? target.title : '',
  };
}

// ---------------------------------------------------------------------------------------------------------------
// Live study sessions (POST /study-sessions/start, /:id/pause, /:id/resume, /:id/complete)
// ---------------------------------------------------------------------------------------------------------------

export interface LiveSession {
  id: string;
  title: string;
  status: 'active' | 'paused' | 'completed';
  durationSeconds: number;
  startTime: string | null;
}

export function toLiveSession(res: unknown): LiveSession | null {
  const r = (((res as Raw | null)?.session ?? res) ?? {}) as Raw;
  if (typeof r.id !== 'string') return null;
  const status = r.status === 'paused' || r.status === 'completed' ? r.status : 'active';
  return { id: r.id, title: typeof r.title === 'string' ? r.title : 'Study session', status, durationSeconds: typeof r.durationSeconds === 'number' ? r.durationSeconds : 0, startTime: typeof r.startTime === 'string' ? r.startTime : null };
}

/** Seconds studied so far: stored seconds, plus the running stretch while active. */
export function elapsedSeconds(s: LiveSession, now = Date.now()): number {
  const running = s.status === 'active' && s.startTime ? Math.max(0, Math.floor((now - Date.parse(s.startTime)) / 1000)) : 0;
  return s.durationSeconds + running;
}

/** The learner's open (active or paused) session, if any — so the timer survives a reload. */
export async function loadOpenSession(): Promise<LiveSession | null> {
  const res = (await studySessionsApi.getAllStudySessions()) as Raw | unknown[] | null;
  const rows = Array.isArray(res) ? res : Array.isArray((res as Raw | null)?.sessions) ? ((res as Raw).sessions as unknown[]) : [];
  return rows.map(toLiveSession).find((s): s is LiveSession => !!s && s.status !== 'completed') ?? null;
}
export const startSession = async (title: string) => toLiveSession(await studySessionsApi.startStudySession({ title: title.trim().slice(0, 200) }));
export const pauseSession = async (id: string) => toLiveSession(await studySessionsApi.pauseStudySession(id));
export const resumeSession = async (id: string) => toLiveSession(await studySessionsApi.resumeStudySession(id));
export const completeSession = async (id: string) => toLiveSession(await studySessionsApi.completeStudySession(id));

// ---------------------------------------------------------------------------------------------------------------
// Calendar events (GET /calendar/month?year&month, POST/PATCH/DELETE /calendar/events)
// ---------------------------------------------------------------------------------------------------------------

export interface CalendarItem {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
}

export function toCalendarItems(res: unknown): CalendarItem[] {
  const rows = Array.isArray(res) ? res : Array.isArray((res as Raw | null)?.events) ? ((res as Raw).events as unknown[]) : [];
  return rows
    .map((x) => (x ?? {}) as Raw)
    .filter((r) => typeof r.id === 'string' && typeof r.startTime === 'string')
    .map((r) => ({ id: r.id as string, title: typeof r.title === 'string' ? r.title : 'Event', description: typeof r.description === 'string' ? r.description : '', startTime: r.startTime as string, endTime: typeof r.endTime === 'string' ? r.endTime : (r.startTime as string), isAllDay: r.isAllDay === true }));
}

export interface EventDraft {
  title: string;
  date: string; // YYYY-MM-DD (local)
  start: string; // HH:MM
  end: string; // HH:MM
  allDay: boolean;
  description: string;
}

/** The DTO wants ISO start/end; local date + times are converted here. Returns the payload or the problem. */
export function eventPayload(d: EventDraft): { title: string; description?: string; startTime: string; endTime: string; isAllDay: boolean } | string {
  if (!d.title.trim()) return 'Give the event a title.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date)) return 'Choose a date.';
  const start = new Date(`${d.date}T${d.allDay ? '00:00' : d.start || '09:00'}:00`);
  const end = new Date(`${d.date}T${d.allDay ? '23:59' : d.end || d.start || '10:00'}:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 'Check the times.';
  if (end < start) return 'The event cannot end before it starts.';
  return { title: d.title.trim().slice(0, 200), ...(d.description.trim() ? { description: d.description.trim() } : {}), startTime: start.toISOString(), endTime: end.toISOString(), isAllDay: d.allDay };
}

export const loadMonthEvents = async (year: number, month: number) => toCalendarItems(await calendarApi.getEventsByMonth(year, month));
export const createEvent = (p: Exclude<ReturnType<typeof eventPayload>, string>) => calendarApi.createEvent(p);
export const updateEvent = (id: string, p: Exclude<ReturnType<typeof eventPayload>, string>) => calendarApi.updateEvent(id, p);
export const deleteEvent = (id: string) => calendarApi.deleteEvent(id);
