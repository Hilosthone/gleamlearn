/**
 * ---------------------------------------------------------------------------------------------------------------
 * lib/exam-prep.ts — past questions, examination boards, exam-prep plans and the learner's performance analytics
 * ---------------------------------------------------------------------------------------------------------------
 * Backend (learner JWT):
 *   GET /examinations, /examinations/:id                         examination boards
 *   GET /past-questions?subject&year&topic&type&limit, /past-questions/{years,subjects,topics,:id}
 *        real past questions (stored, or fetched from the configured provider) — never AI-generated
 *   GET /questions?subject&topic&year&examination&difficulty   the shared question bank (read-only for learners;
 *        GleamLearn admins maintain it)
 *   GET/POST /exam-prep, GET/PATCH/DELETE /exam-prep/:id          the learner's own prep plans
 *        DTO: { title, examType, subjects[], targetDate (ISO), notes? }; stored as targetSubject / targetExamDate /
 *        studyPlan { title, examType, subjects, notes }
 *   GET /analytics/{overview,courses,courses/:id,topics,weak-topics,strong-topics,quiz-performance,
 *        test-performance,exam-performance,time-spent,mastery}   computed from the learner's graded submissions
 */

import { analyticsApi, examPrepApi, examinationBoardsApi, pastQuestionsApi, questionsApi } from './api.ts';

type Raw = Record<string, unknown>;
const str = (v: unknown) => (typeof v === 'string' ? v : typeof v === 'number' ? String(v) : '');
const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)) ? Number(v) : null);
const rows = (v: unknown): Raw[] => (Array.isArray(v) ? (v.filter((x) => x && typeof x === 'object') as Raw[]) : []);
const list = (res: unknown): Raw[] => rows(Array.isArray(res) ? res : (res as Raw | null)?.data ?? (res as Raw | null)?.items);

// --------------------------------------------------------------------------------------------- past questions

export interface PastQuestion {
  id: string;
  text: string;
  options: string[];
  answer: string | null;
  explanation: string;
  examType: string;
  subject: string;
  year: number | null;
  topic: string;
}

function optionsOf(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((o) => (o && typeof o === 'object' ? str((o as Raw).text ?? (o as Raw).value) : str(o))).filter(Boolean);
  if (v && typeof v === 'object') return Object.values(v as Raw).map(str).filter(Boolean);
  return [];
}

/** The correct option's text: providers give a letter ("b") or the text itself. */
function answerText(key: unknown, options: string[]): string | null {
  const k = str(key).trim();
  if (!k) return null;
  const letter = /^([a-h])$/i.exec(k);
  if (letter && options.length) return options['abcdefgh'.indexOf(letter[1].toLowerCase())] ?? k;
  return options.find((o) => o.trim().toLowerCase() === k.toLowerCase()) ?? k;
}

export function toPastQuestion(r: Raw): PastQuestion | null {
  const id = str(r.id);
  const text = str(r.text ?? r.question);
  if (!id || !text) return null;
  const options = optionsOf(r.options);
  return { id, text, options, answer: answerText(r.correctAnswer ?? r.answer, options), explanation: str(r.explanation), examType: str(r.examType), subject: str(r.subject), year: num(r.year), topic: str(r.topic) };
}

export interface PastQuestionFilter {
  subject?: string;
  year?: string;
  topic?: string;
  type?: string;
}

export const loadPastQuestions = async (f: PastQuestionFilter, limit = 20) =>
  list(await pastQuestionsApi.getPastQuestions({ ...f, limit })).map(toPastQuestion).filter((q): q is PastQuestion => !!q);

/** The shared question bank, shown in the same form as past questions. */
export const loadQuestionBank = async (f: PastQuestionFilter, limit = 20) =>
  list(await questionsApi.getAllQuestions({ subject: f.subject, topic: f.topic, year: f.year ? Number(f.year) : undefined, examination: f.type }))
    .map((r) => toPastQuestion({ ...r, text: r.questionText ?? r.text, examType: r.examination ?? r.examType }))
    .filter((q): q is PastQuestion => !!q)
    .slice(0, limit);

export async function loadPastQuestionFacets() {
  const [years, subjects, topics] = await Promise.all([pastQuestionsApi.getPastQuestionYears(), pastQuestionsApi.getPastQuestionSubjects(), pastQuestionsApi.getPastQuestionTopics()]);
  const clean = (v: unknown) => [...new Set((Array.isArray(v) ? v : []).map(str).filter(Boolean))];
  return { years: clean(years).sort((a, b) => Number(b) - Number(a)), subjects: clean(subjects).sort(), topics: clean(topics).sort() };
}

export const loadExaminationBoards = async () =>
  list(await examinationBoardsApi.getAllExaminationBoards())
    .map((r) => ({ id: str(r.id), name: str(r.name ?? r.title), description: str(r.description) }))
    .filter((b) => b.id && b.name);

// --------------------------------------------------------------------------------------------- prep plans

export interface PrepPlan {
  id: string;
  title: string;
  examType: string;
  subjects: string[];
  targetDate: string | null;
  notes: string;
  createdAt: string;
}

export function toPrepPlan(r: Raw): PrepPlan | null {
  const id = str(r.id);
  if (!id) return null;
  const plan = (r.studyPlan && typeof r.studyPlan === 'object' ? r.studyPlan : {}) as Raw;
  const subjects = Array.isArray(plan.subjects) ? plan.subjects.map(str).filter(Boolean) : str(r.targetSubject).split(',').map((s) => s.trim()).filter(Boolean);
  return { id, title: str(plan.title) || 'Exam preparation', examType: str(plan.examType) || str(r.examinationId), subjects, targetDate: str(r.targetExamDate) || null, notes: str(plan.notes), createdAt: str(r.createdAt) };
}

export interface PrepDraft {
  title: string;
  examType: string;
  subjects: string;
  targetDate: string;
  notes: string;
}

/** The backend DTO requires title, examType, subjects[] and an ISO targetDate. Returns the payload or the problem. */
export function prepPayload(d: PrepDraft): { title: string; examType: string; subjects: string[]; targetDate: string; notes?: string } | string {
  const subjects = [...new Set(d.subjects.split(',').map((s) => s.trim()).filter(Boolean))].slice(0, 12);
  if (!d.title.trim()) return 'Give the plan a name.';
  if (!d.examType.trim()) return 'Choose the exam.';
  if (!subjects.length) return 'Add at least one subject.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.targetDate) || Number.isNaN(Date.parse(d.targetDate))) return 'Choose the exam date.';
  return { title: d.title.trim(), examType: d.examType.trim(), subjects, targetDate: new Date(`${d.targetDate}T00:00:00.000Z`).toISOString(), ...(d.notes.trim() ? { notes: d.notes.trim() } : {}) };
}

export const loadPrepPlans = async () => list(await examPrepApi.getAllExamPrepPlans()).map(toPrepPlan).filter((p): p is PrepPlan => !!p);
export const createPrepPlan = (p: Exclude<ReturnType<typeof prepPayload>, string>) => examPrepApi.createExamPrepPlan(p);
export const updatePrepPlan = (id: string, p: Exclude<ReturnType<typeof prepPayload>, string>) => examPrepApi.updateExamPrepPlan(id, p);
export const deletePrepPlan = (id: string) => examPrepApi.deleteExamPrepPlan(id);

/** Whole days from today (UTC) to the exam date; null without a date. */
export function daysUntil(iso: string | null, now = Date.now()): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  const day = 86_400_000;
  return Math.ceil((Math.floor(t / day) * day - Math.floor(now / day) * day) / day);
}

// --------------------------------------------------------------------------------------------- analytics

export interface TopicStat {
  topic: string;
  correct: number;
  total: number;
  percent: number;
  attempts: number;
}
export interface PerformanceSummary {
  totalAssessments: number;
  averageScore: number | null;
  totalTimeSpentMinutes: number;
  masteryLevel: string | null;
  masteryPercentage: number | null;
  questionsAnswered: number;
  byType: { type: 'quiz' | 'test' | 'exam'; completed: number; averageScore: number | null }[];
  topics: TopicStat[];
  weak: TopicStat[];
  strong: TopicStat[];
}

const toTopic = (r: Raw): TopicStat => ({ topic: str(r.topic) || 'General', correct: num(r.correct) ?? 0, total: num(r.total) ?? 0, percent: num(r.percent) ?? 0, attempts: num(r.attempts) ?? 0 });

export async function loadPerformance(): Promise<PerformanceSummary> {
  const [overview, mastery, topics, weak, strong, quiz, test, exam] = (await Promise.all([
    analyticsApi.getPerformanceOverview(),
    analyticsApi.getOverallMastery(),
    analyticsApi.getTopicAnalytics(),
    analyticsApi.getWeakTopics(),
    analyticsApi.getStrongTopics(),
    analyticsApi.getQuizPerformance(),
    analyticsApi.getTestPerformance(),
    analyticsApi.getExamPerformance(),
  ])) as (Raw | null)[];
  const t = (r: Raw | null, k: string) => rows(r?.[k]).map(toTopic);
  const perf = (type: 'quiz' | 'test' | 'exam', r: Raw | null) => ({ type, completed: num(r?.totalCompleted) ?? 0, averageScore: num(r?.averageScore) });
  return {
    totalAssessments: num(overview?.totalAssessments) ?? 0,
    averageScore: num(overview?.averageScore),
    totalTimeSpentMinutes: num(overview?.totalTimeSpentMinutes) ?? 0,
    masteryLevel: str(overview?.masteryLevel) || null,
    masteryPercentage: num(mastery?.overallMasteryPercentage),
    questionsAnswered: num(mastery?.questionsAnswered) ?? 0,
    byType: [perf('quiz', quiz), perf('test', test), perf('exam', exam)],
    topics: t(topics, 'topics'),
    weak: t(weak, 'weakTopics'),
    strong: t(strong, 'strongTopics'),
  };
}
