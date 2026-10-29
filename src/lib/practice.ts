/**
 * ---------------------------------------------------------------------------
 * lib/practice.ts — Quizzes, tests and exams (typed wrappers over existing api.ts clients)
 * ---------------------------------------------------------------------------
 * Backend contract (verified 2026-10-26, after the assessment containment batch):
 *   GET  /quizzes | /tests | /exams           → stored assessments; questions WITHOUT answer keys
 *   GET  /quizzes/:id | /tests/:id | /exams/:id → one assessment; questions without answer keys
 *   POST /quizzes/:id/submit  { answers }      → graded server-side { score, totalQuestions, correctAnswers, graded,
 *                                                passed, xpAwarded, coinsAwarded, message }; rewards once per quiz
 *   POST /tests/:id/submit | /exams/:id/submit → graded server-side (no rewards; nothing stored)
 *   POST /quizzes/generate { title, description, topic } → { status, quiz: <model output> } (AI; nothing stored)
 *   Attempts, results, history, readiness, simulation: 501 FEATURE_UNAVAILABLE (attempts are not stored).
 * Answers are sent keyed by question index ("0", "1", …), which the backend grader matches.
 * Generated practice quizzes include their answer key, so they are graded here in the browser and award nothing.
 */

import { examsApi, quizzesApi, testsApi } from './api.ts';
import { invalidateLearnerStats } from './learning.ts';

export type AssessmentKind = 'quiz' | 'test' | 'exam';

export interface PracticeQuestion {
  index: number;
  text: string;
  options: string[];
}

export interface Assessment {
  id: string;
  kind: AssessmentKind;
  title: string;
  description: string;
  courseId: string | null;
  durationMinutes: number | null;
  questions: PracticeQuestion[];
}

type Raw = Record<string, unknown>;
const str = (v: unknown) => (typeof v === 'string' ? v : typeof v === 'number' ? String(v) : '');

function optionText(o: unknown): string {
  if (typeof o === 'string' || typeof o === 'number') return String(o);
  if (o && typeof o === 'object') {
    const r = o as Raw;
    return str(r.text) || str(r.label) || str(r.value) || str(r.option);
  }
  return '';
}

export function toPracticeQuestion(raw: unknown, index: number): PracticeQuestion | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Raw;
  const text = str(r.question) || str(r.text) || str(r.questionText) || str(r.prompt) || str(r.title);
  if (!text) return null;
  const rawOptions = r.options ?? r.choices;
  const options = Array.isArray(rawOptions)
    ? rawOptions.map(optionText).filter(Boolean)
    : rawOptions && typeof rawOptions === 'object'
      ? Object.values(rawOptions as Raw).map(optionText).filter(Boolean)
      : [];
  return { index, text, options };
}

export function toAssessment(raw: unknown, kind: AssessmentKind): Assessment | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Raw;
  if (typeof r.id !== 'string') return null;
  const qs = Array.isArray(r.questions) ? r.questions : [];
  return {
    id: r.id,
    kind,
    title: str(r.title) || 'Untitled',
    description: str(r.description),
    courseId: str(r.courseId) || null,
    durationMinutes: typeof r.durationMinutes === 'number' && r.durationMinutes > 0 ? r.durationMinutes : null,
    // keep the stored position: the backend grades answers by question index
    questions: qs.map((q, i) => toPracticeQuestion(q, i)).filter((q): q is PracticeQuestion => q !== null),
  };
}

export function toAssessmentList(res: unknown, kind: AssessmentKind): Assessment[] {
  const rows = Array.isArray(res) ? res : Array.isArray((res as Raw | null)?.data) ? ((res as Raw).data as unknown[]) : [];
  return rows.map((r) => toAssessment(r, kind)).filter((a): a is Assessment => a !== null);
}

export interface SubmitResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number | null;
  graded: boolean;
  passed: boolean | null;
  xpAwarded: number;
  coinsAwarded: number;
  message: string;
  /** the stored attempt (null when the server could not save it yet) */
  attemptId: string | null;
}

export function toSubmitResult(res: unknown): SubmitResult {
  const r = (res ?? {}) as Raw;
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
  return {
    score: num(r.score),
    totalQuestions: num(r.totalQuestions),
    correctAnswers: typeof r.correctAnswers === 'number' ? r.correctAnswers : null,
    graded: r.graded !== false,
    passed: typeof r.passed === 'boolean' ? r.passed : null,
    xpAwarded: num(r.xpAwarded),
    coinsAwarded: num(r.coinsAwarded),
    message: str(r.message),
    attemptId: r.saved === true && typeof r.attemptId === 'string' ? r.attemptId : null,
  };
}

/** `{ "0": "Abuja", "2": "4" }` from the selected option per question index (unanswered questions are omitted). */
export function answersPayload(selected: Record<number, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(selected).filter(([, v]) => typeof v === 'string' && v !== ''));
}

const list = { quiz: () => quizzesApi.getAllQuizzes(), test: () => testsApi.getAllTests(), exam: () => examsApi.getAllExams() };
const one = { quiz: (id: string) => quizzesApi.getQuizById(id), test: (id: string) => testsApi.getTestById(id), exam: (id: string) => examsApi.getExamById(id) };

export async function listAssessments(kind: AssessmentKind): Promise<Assessment[]> {
  return toAssessmentList(await list[kind](), kind);
}

export async function getAssessment(kind: AssessmentKind, id: string): Promise<Assessment> {
  const a = toAssessment(await one[kind](id), kind);
  if (!a) throw new Error('This assessment could not be read.');
  return a;
}

export async function submitAssessment(kind: AssessmentKind, id: string, selected: Record<number, string>): Promise<SubmitResult> {
  const answers = answersPayload(selected);
  const res =
    kind === 'quiz'
      ? await quizzesApi.submitQuizAttempt(id, { answers } as never)
      : kind === 'test'
        ? await testsApi.submitTestAttempt(id, { answers })
        : await examsApi.submitExamAttempt(id, { answers });
  const result = toSubmitResult(res);
  invalidateLearnerStats(); // a submission counts towards today's streak, and may award XP and coins
  return result;
}

// ---------------------------------------------------------------------------------------------------------
// AI-generated practice (graded locally; nothing is stored or rewarded)
// ---------------------------------------------------------------------------------------------------------

export interface GeneratedQuestion extends PracticeQuestion {
  answer: string;
  explanation: string;
}

/** Finds the JSON in model output (may be fenced or wrapped in prose) and reads the questions with their answers. */
export function parseGeneratedQuiz(output: unknown): GeneratedQuestion[] {
  let data: unknown = output;
  if (typeof output === 'string') {
    const fenced = output.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
    const text = (fenced ?? output).trim();
    const start = text.search(/[[{]/);
    if (start < 0) return [];
    const end = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'));
    try {
      data = JSON.parse(text.slice(start, end + 1));
    } catch {
      return [];
    }
  }
  const container = data && typeof data === 'object' && !Array.isArray(data) ? (data as Raw) : null;
  const rows = Array.isArray(data) ? data : Array.isArray(container?.questions) ? (container!.questions as unknown[]) : Array.isArray((container?.quiz as Raw | undefined)?.questions) ? ((container!.quiz as Raw).questions as unknown[]) : [];
  const out: GeneratedQuestion[] = [];
  rows.forEach((raw) => {
    const q = toPracticeQuestion(raw, out.length);
    if (!q || q.options.length < 2) return;
    const r = raw as Raw;
    const key = str(r.correctAnswer) || str(r.correct_answer) || str(r.answer) || str(r.correct);
    const answer = resolveAnswer(key, q.options);
    if (!answer) return;
    out.push({ ...q, answer, explanation: str(r.explanation) });
  });
  return out;
}

/** "B", "b)", "B. text" or the full option text → the option text. */
function resolveAnswer(key: string, options: string[]): string {
  const k = key.trim();
  if (!k) return '';
  const letter = k.match(/^([a-hA-H])(?:[.)\s:]|$)/)?.[1];
  if (letter) {
    const i = 'abcdefgh'.indexOf(letter.toLowerCase());
    if (i < options.length) return options[i];
  }
  return options.find((o) => o.trim().toLowerCase() === k.toLowerCase()) ?? '';
}

export function gradeLocally(questions: GeneratedQuestion[], selected: Record<number, string>) {
  const perQuestion = questions.map((q) => ({ index: q.index, correct: selected[q.index] === q.answer }));
  const correct = perQuestion.filter((p) => p.correct).length;
  return { correct, total: questions.length, score: questions.length ? Math.round((correct / questions.length) * 100) : 0, perQuestion };
}

export async function generatePracticeQuiz(topic: string): Promise<GeneratedQuestion[]> {
  const res = (await quizzesApi.generateAiQuiz({
    title: `Practice: ${topic}`,
    topic,
    description: `Create a 5-question multiple-choice practice quiz about "${topic}". Return ONLY JSON: {"questions":[{"question":"…","options":["…","…","…","…"],"correctAnswer":"exact option text","explanation":"…"}]}`,
  })) as Raw;
  return parseGeneratedQuiz(res?.quiz ?? res?.data ?? res);
}

// ---------------------------------------------------------------------------------------------------------------
// Stored attempts at official quizzes, tests and exams (start → submit → results → history, exam readiness)
// ---------------------------------------------------------------------------------------------------------------

export interface OfficialQuestionReview {
  index: number;
  question: string;
  options: string[];
  chosen: string | null;
  answer: string | null;
  correct: boolean;
  gradable: boolean;
  explanation: string;
  topic: string;
}

export interface OfficialAttempt {
  id: string;
  kind: AssessmentKind;
  assessmentId: string;
  title: string;
  status: 'in_progress' | 'submitted';
  score: number | null;
  correctCount: number | null;
  gradableCount: number | null;
  totalQuestions: number;
  graded: boolean;
  startedAt: string;
  deadlineAt: string | null;
  submittedAt: string | null;
  resumed: boolean;
  review: { questions: OfficialQuestionReview[]; topics: { topic: string; correct: number; total: number; percent: number }[] } | null;
}

const kindOf = (v: unknown): AssessmentKind => (v === 'test' || v === 'exam' ? v : 'quiz');
const n = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v !== '' && Number.isFinite(Number(v)) ? Number(v) : null);

export function toOfficialAttempt(res: unknown): OfficialAttempt {
  const r = (res ?? {}) as Raw;
  if (typeof r.id !== 'string') throw new Error('This attempt could not be read.');
  const rv = r.review && typeof r.review === 'object' ? (r.review as Raw) : null;
  const rows = (v: unknown) => (Array.isArray(v) ? (v.filter((x) => x && typeof x === 'object') as Raw[]) : []);
  return {
    id: r.id,
    kind: kindOf(r.kind),
    assessmentId: str(r.assessmentId),
    title: str(r.title) || 'Untitled',
    status: r.status === 'submitted' ? 'submitted' : 'in_progress',
    score: n(r.score),
    correctCount: n(r.correctCount),
    gradableCount: n(r.gradableCount),
    totalQuestions: n(r.totalQuestions) ?? 0,
    graded: r.graded === true,
    startedAt: str(r.startedAt),
    deadlineAt: str(r.deadlineAt) || null,
    submittedAt: str(r.submittedAt) || null,
    resumed: r.resumed === true,
    review: rv
      ? {
          questions: rows(rv.questions).map((q) => ({ index: n(q.index) ?? 0, question: str(q.question), options: Array.isArray(q.options) ? q.options.map((o) => str(o)) : [], chosen: str(q.chosen) || null, answer: str(q.answer) || null, correct: q.correct === true, gradable: q.gradable !== false, explanation: str(q.explanation), topic: str(q.topic) })),
          topics: rows(rv.topics).map((t) => ({ topic: str(t.topic), correct: n(t.correct) ?? 0, total: n(t.total) ?? 0, percent: n(t.percent) ?? 0 })),
        }
      : null,
  };
}

const START = { quiz: (id: string) => quizzesApi.startQuizAttempt(id), test: (id: string) => testsApi.startTestAttempt(id), exam: (id: string) => examsApi.startExamAttempt(id) };
const HISTORY = { quiz: () => quizzesApi.getUserAttempts(), test: () => testsApi.getUserTestAttempts(), exam: () => examsApi.getStudentExamHistory() };
const ATTEMPT = { quiz: (id: string) => quizzesApi.getAttemptById(id), test: (id: string) => testsApi.getTestAttemptById(id), exam: (id: string) => examsApi.getExamAttemptById(id) };

/** Starts (or resumes) a stored attempt; tests and exams come back with a deadline from their duration. */
export const startOfficialAttempt = async (kind: AssessmentKind, id: string) => toOfficialAttempt(await START[kind](id));
export const loadOfficialAttempt = async (kind: AssessmentKind, attemptId: string) => toOfficialAttempt(await ATTEMPT[kind](attemptId));

/** The learner's attempts at official quizzes, tests and exams, newest first. A kind the server can't list yet is skipped. */
export async function loadOfficialHistory(): Promise<{ attempts: OfficialAttempt[]; unavailable: AssessmentKind[] }> {
  const kinds: AssessmentKind[] = ['quiz', 'test', 'exam'];
  const settled = await Promise.allSettled(kinds.map((k) => HISTORY[k]()));
  const attempts: OfficialAttempt[] = [];
  const unavailable: AssessmentKind[] = [];
  settled.forEach((s, i) => {
    if (s.status === 'fulfilled') attempts.push(...(Array.isArray(s.value) ? s.value : []).map(toOfficialAttempt));
    else if ((s.reason as { kind?: string })?.kind === 'not_implemented') unavailable.push(kinds[i]);
    else throw s.reason;
  });
  return { attempts: attempts.sort((a, b) => (b.startedAt > a.startedAt ? 1 : -1)), unavailable };
}

export interface ExamReadiness {
  status: 'not_started' | 'building' | 'ready';
  attempts: number;
  bestScore: number | null;
  lastScore: number | null;
  recentAverage: number | null;
  trend: number | null;
  weakTopics: { topic: string; percent: number }[];
  readyAt: number;
}

export async function loadExamReadiness(examId: string): Promise<ExamReadiness> {
  const r = ((await examsApi.getExamReadiness(examId)) ?? {}) as Raw;
  return {
    status: r.status === 'ready' ? 'ready' : r.status === 'building' ? 'building' : 'not_started',
    attempts: n(r.attempts) ?? 0,
    bestScore: n(r.bestScore),
    lastScore: n(r.lastScore),
    recentAverage: n(r.recentAverage),
    trend: n(r.trend),
    weakTopics: (Array.isArray(r.weakTopics) ? r.weakTopics : []).map((t) => ({ topic: str((t as Raw).topic), percent: n((t as Raw).percent) ?? 0 })),
    readyAt: n(r.readyAt) ?? 70,
  };
}

export const officialAttemptHref = (a: Pick<OfficialAttempt, 'kind' | 'id'>) => `/practice/official/${a.kind}/attempts/${encodeURIComponent(a.id)}`;
