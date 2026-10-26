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
 *   /calendar                         → 501: its tables don't exist yet
 */

import { goalsApi, plannerApi, type CreatePlannerItemPayload } from './api.ts';

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
      };
    })
    .sort((a, b) => Number(a.completed) - Number(b.completed));
}

export const loadGoals = async () => toGoals(await goalsApi.getAllGoals());
export const createGoal = (g: { title: string; description: string; targetDate: string }) =>
  goalsApi.createGoal({ title: g.title.trim(), ...(g.description.trim() ? { description: g.description.trim() } : {}), ...(g.targetDate ? { targetDate: g.targetDate } : {}) });
export const completeGoal = (id: string) => goalsApi.completeGoal(id);
export const deleteGoal = (id: string) => goalsApi.deleteGoal(id);
