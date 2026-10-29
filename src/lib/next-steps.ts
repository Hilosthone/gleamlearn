/**
 * ---------------------------------------------------------------------------------------------------------------
 * lib/next-steps.ts — "What to study next" (GET /recommendations): topics to revise, quizzes, unfinished work and
 * exams, each computed by the backend from the learner's own records, with the reason it is suggested.
 * ---------------------------------------------------------------------------------------------------------------
 */
import { recommendationsApi } from './api.ts';

export interface NextStep {
  type: string;
  id: string | null;
  title: string;
  reason: string;
  /** an in-app path ("/…"), never an external link */
  href: string;
}
export interface NextSteps {
  topics: NextStep[];
  quizzes: NextStep[];
  revision: NextStep[];
  exams: NextStep[];
}

type Raw = Record<string, unknown>;
const steps = (v: unknown): NextStep[] =>
  (Array.isArray(v) ? v : [])
    .map((x) => (x ?? {}) as Raw)
    .filter((r) => typeof r.title === 'string' && typeof r.href === 'string' && /^\/(?![/\\])/.test(r.href as string))
    .map((r) => ({ type: String(r.type ?? ''), id: typeof r.id === 'string' ? r.id : null, title: r.title as string, reason: typeof r.reason === 'string' ? r.reason : '', href: r.href as string }));

export function toNextSteps(res: unknown): NextSteps {
  const r = (res ?? {}) as Raw;
  return { topics: steps(r.topics), quizzes: steps(r.quizzes), revision: steps(r.revision), exams: steps(r.exams) };
}

export const loadNextSteps = async () => toNextSteps(await recommendationsApi.getAllRecommendations());
export const isEmpty = (n: NextSteps) => !n.topics.length && !n.quizzes.length && !n.revision.length && !n.exams.length;
