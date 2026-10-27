/**
 * ---------------------------------------------------------------------------
 * lib/self-learning.ts — Learning from your own material (typed wrappers over the api.ts clients)
 * ---------------------------------------------------------------------------
 * Backend contract (2026-10-28; learner JWT; every record belongs to the signed-in learner, others get 404):
 *   POST /learning/generate { requestId, kind, sourceType, sourceId?, text?, personalCourseId?, options }
 *        → { type: resource|assessment|deck|course, id, resourceId, kind, title, reused }
 *        The same requestId returns the first result (no second AI call): a retry or double click is safe.
 *   GET/PATCH/DELETE /learning/resources[/:id], POST /learning/resources/:id/complete (counts towards the streak)
 *   GET /materials/:id, GET /materials/:id/text, POST /materials/text, POST /materials/:id/process (retry)
 *   /learner-assessments: list, get (no answer key), start/resume attempt, autosave, submit (graded on the
 *        server; idempotent), attempts history, attempt review
 *   /youtube-sessions: create, list, get (+ transcript segments), transcript (paste / refetch), ask, messages
 *   GET /search/everything?q= → { results: [{ type, id, title, subtitle, href }], unavailableTypes }
 * All answer 501 until docs/migrations/proposed/2026-10-28_self_service_learning.sql has run.
 */

import {
  globalSearchApi,
  learnerAssessmentsApi,
  learningApi,
  youtubeSessionsApi,
  type GenerateLearningPayload,
  type LearningKind,
  type LearningSourceType,
} from './api.ts';

type Raw = Record<string, unknown>;
const str = (v: unknown) => (typeof v === 'string' ? v : '');
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
const obj = (v: unknown): Raw => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Raw) : {});
const list = (v: unknown): Raw[] => (Array.isArray(v) ? (v.filter((x) => x && typeof x === 'object') as Raw[]) : []);
const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
const orNull = (v: unknown) => str(v) || null;

export type { LearningKind, LearningSourceType };

/** A fresh id for one generation request (kept by the form so a retry reuses it). */
export function newRequestId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  // RFC 4122 v4 fallback for old browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// ---------------------------------------------------------------------------------------------------------------
// What can be generated
// ---------------------------------------------------------------------------------------------------------------

export interface KindInfo {
  id: LearningKind;
  label: string;
  description: string;
  /** quiz / exam / flashcards / course_plan take a count */
  count?: { label: string; min: number; max: number; default: number };
}

export const KINDS: KindInfo[] = [
  { id: 'lesson', label: 'Structured lesson', description: 'A lesson with sections, examples and a recap.' },
  { id: 'summary', label: 'Summary', description: 'The key points, briefly.' },
  { id: 'notes', label: 'Revision notes', description: 'Headings, bullet points, definitions and formulas.' },
  { id: 'key_concepts', label: 'Key concepts', description: 'Each concept with a short explanation.' },
  { id: 'explanation', label: 'Step-by-step explanation', description: 'Explained simply, with examples from the material.' },
  { id: 'flashcards', label: 'Flashcards', description: 'A deck of question-and-answer cards.', count: { label: 'Cards', min: 3, max: 50, default: 12 } },
  { id: 'quiz', label: 'Quiz', description: 'Multiple-choice practice with explanations.', count: { label: 'Questions', min: 3, max: 30, default: 10 } },
  { id: 'exam', label: 'Mock exam', description: 'A timed multiple-choice mock examination.', count: { label: 'Questions', min: 5, max: 60, default: 20 } },
  { id: 'study_plan', label: 'Study plan', description: 'Ordered study sessions to cover the material.' },
  { id: 'course_plan', label: 'Course plan', description: 'Split it into modules, added to the course.', count: { label: 'Modules', min: 3, max: 20, default: 8 } },
];
/** Kinds offered by default (a course plan only makes sense on a course). */
export const DEFAULT_KINDS: LearningKind[] = ['lesson', 'summary', 'notes', 'key_concepts', 'explanation', 'flashcards', 'quiz', 'exam', 'study_plan'];
export const kindInfo = (id: string) => KINDS.find((k) => k.id === id) ?? null;
export const EXAM_GOALS = ['WAEC', 'NECO', 'JAMB', 'Post-UTME', 'GCE', 'BECE', 'University course'];

export interface GenerateResult {
  type: 'resource' | 'assessment' | 'deck' | 'course';
  id: string;
  resourceId: string | null;
  kind: LearningKind;
  title: string;
  reused: boolean;
}

export function toGenerateResult(res: unknown): GenerateResult {
  const r = obj(res);
  const type = str(r.type);
  if (!['resource', 'assessment', 'deck', 'course'].includes(type) || !str(r.id)) throw new Error('The result could not be read.');
  return { type: type as GenerateResult['type'], id: str(r.id), resourceId: orNull(r.resourceId), kind: str(r.kind) as LearningKind, title: str(r.title), reused: r.reused === true };
}

/** Where to open what was generated. */
export function hrefFor(r: Pick<GenerateResult, 'type' | 'id'>): string {
  if (r.type === 'resource') return `/learn/resources/${encodeURIComponent(r.id)}`;
  if (r.type === 'assessment') return `/practice/${encodeURIComponent(r.id)}`;
  if (r.type === 'course') return `/my-courses/${encodeURIComponent(r.id)}`;
  return '/library?tab=flashcards';
}

export const generateLearning = async (payload: GenerateLearningPayload) => toGenerateResult(await learningApi.generate(payload));

// ---------------------------------------------------------------------------------------------------------------
// Materials (processing state)
// ---------------------------------------------------------------------------------------------------------------

export interface MaterialState {
  id: string;
  name: string;
  sourceType: string;
  status: 'PROCESSING' | 'READY' | 'FAILED' | string;
  textChars: number;
  processingError: string | null;
  personalCourseId: string | null;
  createdAt: string;
}

export function toMaterialState(res: unknown): MaterialState {
  const r = obj(res);
  if (!str(r.id)) throw new Error('This material could not be read.');
  return {
    id: str(r.id),
    name: str(r.originalName) || 'Material',
    sourceType: str(r.sourceType) || 'upload',
    status: str(r.status) || 'READY',
    textChars: num(r.textChars),
    processingError: orNull(r.processingError),
    personalCourseId: orNull(r.personalCourseId),
    createdAt: str(r.createdAt),
  };
}

export const loadMaterial = async (id: string) => toMaterialState(await learningApi.material(id));
export const loadMaterialText = async (id: string) => str(obj(await learningApi.materialText(id)).text);
export const addTextMaterial = async (title: string, text: string, personalCourseId?: string) => toMaterialState(await learningApi.addTextMaterial(title, text, personalCourseId));
export const retryMaterial = async (id: string) => toMaterialState(await learningApi.processMaterial(id));

/** Waits for text extraction to finish (READY or FAILED), checking every few seconds. */
export async function waitForMaterial(id: string, { signal, intervalMs = 1500, timeoutMs = 180_000 }: { signal?: AbortSignal; intervalMs?: number; timeoutMs?: number } = {}): Promise<MaterialState> {
  const end = Date.now() + timeoutMs;
  for (;;) {
    const m = await loadMaterial(id);
    if (m.status !== 'PROCESSING' || Date.now() > end) return m;
    await new Promise<void>((resolve, reject) => {
      const t = setTimeout(resolve, intervalMs);
      signal?.addEventListener('abort', () => (clearTimeout(t), reject(new DOMException('Aborted', 'AbortError'))), { once: true });
    });
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Generated resources
// ---------------------------------------------------------------------------------------------------------------

export interface LearningResourceItem {
  id: string;
  kind: string;
  title: string;
  content: string;
  sourceType: string;
  materialId: string | null;
  personalCourseId: string | null;
  moduleId: string | null;
  youtubeSessionId: string | null;
  deckId: string | null;
  truncated: boolean;
  completed: boolean;
  createdAt: string;
}

export function toResource(res: unknown): LearningResourceItem {
  const r = obj(res);
  if (!str(r.id)) throw new Error('This item could not be read.');
  return {
    id: str(r.id),
    kind: str(r.kind),
    title: str(r.title) || 'Untitled',
    content: str(r.content),
    sourceType: str(r.sourceType),
    materialId: orNull(r.materialId),
    personalCourseId: orNull(r.personalCourseId),
    moduleId: orNull(r.moduleId),
    youtubeSessionId: orNull(r.youtubeSessionId),
    deckId: orNull(obj(r.options).deckId),
    truncated: r.truncated === true,
    completed: !!r.completedAt,
    createdAt: str(r.createdAt),
  };
}

export const toResources = (res: unknown) => list(res).filter((r) => str(r.id)).map(toResource);
export const loadResources = async (filter: Parameters<typeof learningApi.resources>[0] = {}) => toResources(await learningApi.resources(filter));
export const loadResource = async (id: string) => toResource(await learningApi.resource(id));
export const completeResource = (id: string) => learningApi.completeResource(id);
export const deleteResource = (id: string) => learningApi.deleteResource(id);

/** Where a resource item opens (decks and course plans open what they created). */
export function resourceHref(r: LearningResourceItem): string {
  if (r.kind === 'flashcards') return '/library?tab=flashcards';
  if (r.kind === 'course_plan' && r.personalCourseId) return `/my-courses/${encodeURIComponent(r.personalCourseId)}`;
  return `/learn/resources/${encodeURIComponent(r.id)}`;
}

/** Plain-text blocks from the lesson's Markdown subset (rendered as React text: no HTML is injected). */
export type Block = { type: 'h2' | 'h3' | 'p'; text: string } | { type: 'ul' | 'ol'; items: string[] };

export function parseBlocks(markdown: string): Block[] {
  const blocks: Block[] = [];
  let para: string[] = [];
  let listBlock: { type: 'ul' | 'ol'; items: string[] } | null = null;
  const flush = () => {
    if (para.length) blocks.push({ type: 'p', text: para.join(' ') });
    para = [];
    if (listBlock) blocks.push(listBlock);
    listBlock = null;
  };
  const clean = (s: string) => s.replace(/\*\*(.+?)\*\*/g, '$1').replace(/__(.+?)__/g, '$1').replace(/`([^`]+)`/g, '$1').trim();
  for (const line of markdown.replace(/\r\n?/g, '\n').split('\n')) {
    const t = line.trim();
    if (!t) {
      flush();
      continue;
    }
    const h = t.match(/^(#{1,6})\s+(.*)$/);
    const ul = t.match(/^[-*•]\s+(.*)$/);
    const ol = t.match(/^\d+[.)]\s+(.*)$/);
    if (h) {
      flush();
      blocks.push({ type: h[1].length <= 2 ? 'h2' : 'h3', text: clean(h[2]) });
    } else if (ul || ol) {
      if (para.length) {
        blocks.push({ type: 'p', text: para.join(' ') });
        para = [];
      }
      const type = ul ? 'ul' : 'ol';
      if (!listBlock || listBlock.type !== type) {
        if (listBlock) blocks.push(listBlock);
        listBlock = { type, items: [] };
      }
      listBlock.items.push(clean((ul ?? ol)![1]));
    } else {
      if (listBlock) {
        blocks.push(listBlock);
        listBlock = null;
      }
      para.push(clean(t));
    }
  }
  flush();
  return blocks;
}

// ---------------------------------------------------------------------------------------------------------------
// Learner assessments and attempts
// ---------------------------------------------------------------------------------------------------------------

export interface AssessmentQuestion {
  index: number;
  question: string;
  options: string[];
  topic: string | null;
}

export interface LearnerAssessment {
  id: string;
  kind: 'quiz' | 'exam';
  title: string;
  examType: string | null;
  difficulty: string | null;
  durationMinutes: number | null;
  feedbackMode: 'after_submit' | 'immediate';
  sourceType: string;
  materialId: string | null;
  personalCourseId: string | null;
  resourceId: string | null;
  youtubeSessionId: string | null;
  questionCount: number;
  requestedCount: number;
  truncated: boolean;
  notice: string;
  createdAt: string;
  questions: AssessmentQuestion[];
  attemptCount: number;
  bestScore: number | null;
  lastScore: number | null;
  inProgressAttemptId: string | null;
}

export function toLearnerAssessment(res: unknown): LearnerAssessment {
  const r = obj(res);
  if (!str(r.id)) throw new Error('This quiz or exam could not be read.');
  const questions = list(r.questions).map((q, i) => ({ index: typeof q.index === 'number' ? q.index : i, question: str(q.question), options: strings(q.options), topic: orNull(q.topic) }));
  const n = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
  return {
    id: str(r.id),
    kind: r.kind === 'exam' ? 'exam' : 'quiz',
    title: str(r.title) || 'Untitled',
    examType: orNull(r.examType),
    difficulty: orNull(r.difficulty),
    durationMinutes: n(r.durationMinutes),
    feedbackMode: r.feedbackMode === 'immediate' ? 'immediate' : 'after_submit',
    sourceType: str(r.sourceType),
    materialId: orNull(r.materialId),
    personalCourseId: orNull(r.personalCourseId),
    resourceId: orNull(r.resourceId),
    youtubeSessionId: orNull(r.youtubeSessionId),
    questionCount: num(r.questionCount) || questions.length,
    requestedCount: num(r.requestedCount),
    truncated: r.truncated === true,
    notice: str(r.notice),
    createdAt: str(r.createdAt),
    questions,
    attemptCount: num(r.attemptCount),
    bestScore: n(r.bestScore),
    lastScore: n(r.lastScore),
    inProgressAttemptId: orNull(r.inProgressAttemptId),
  };
}

export interface QuestionReview {
  index: number;
  question: string;
  options: string[];
  chosen: string | null;
  answer: string;
  correct: boolean;
  explanation: string;
  topic: string;
}

export interface AttemptView {
  attempt: {
    id: string;
    assessmentId: string;
    status: 'in_progress' | 'submitted';
    score: number | null;
    correctCount: number | null;
    totalQuestions: number;
    startedAt: string;
    deadlineAt: string | null;
    submittedAt: string | null;
    autoSubmitted: boolean;
  };
  assessment: LearnerAssessment;
  answers: Record<string, string>;
  review: { questions: QuestionReview[]; topics: { topic: string; correct: number; total: number; percent: number }[]; strengths: string[]; toRevise: string[] } | null;
  checked: { index: number; correct: boolean; answer: string; explanation: string }[];
}

export function toAttemptView(res: unknown): AttemptView {
  const r = obj(res);
  const t = obj(r.attempt);
  if (!str(t.id)) throw new Error('This attempt could not be read.');
  const rv = r.review ? obj(r.review) : null;
  return {
    attempt: {
      id: str(t.id),
      assessmentId: str(t.assessmentId),
      status: t.status === 'submitted' ? 'submitted' : 'in_progress',
      score: typeof t.score === 'number' ? t.score : null,
      correctCount: typeof t.correctCount === 'number' ? t.correctCount : null,
      totalQuestions: num(t.totalQuestions),
      startedAt: str(t.startedAt),
      deadlineAt: orNull(t.deadlineAt),
      submittedAt: orNull(t.submittedAt),
      autoSubmitted: t.autoSubmitted === true,
    },
    assessment: toLearnerAssessment(r.assessment),
    answers: Object.fromEntries(Object.entries(obj(r.answers)).filter(([, v]) => typeof v === 'string')) as Record<string, string>,
    review: rv
      ? {
          questions: list(rv.questions).map((q) => ({ index: num(q.index), question: str(q.question), options: strings(q.options), chosen: orNull(q.chosen), answer: str(q.answer), correct: q.correct === true, explanation: str(q.explanation), topic: str(q.topic) })),
          topics: list(rv.topics).map((x) => ({ topic: str(x.topic), correct: num(x.correct), total: num(x.total), percent: num(x.percent) })),
          strengths: strings(rv.strengths),
          toRevise: strings(rv.toRevise),
        }
      : null,
    checked: list(r.checked).map((c) => ({ index: num(c.index), correct: c.correct === true, answer: str(c.answer), explanation: str(c.explanation) })),
  };
}

export const loadLearnerAssessments = async (kind?: 'quiz' | 'exam', personalCourseId?: string) => list(await learnerAssessmentsApi.list(kind, personalCourseId)).map(toLearnerAssessment);
export const loadLearnerAssessment = async (id: string) => toLearnerAssessment(await learnerAssessmentsApi.get(id));
export const startAttempt = async (id: string) => toAttemptView(await learnerAssessmentsApi.start(id));
export const loadAttempt = async (attemptId: string) => toAttemptView(await learnerAssessmentsApi.attempt(attemptId));
export const saveAnswers = async (attemptId: string, answers: Record<string, string>) => toAttemptView(await learnerAssessmentsApi.save(attemptId, answers));
export const submitAttempt = async (attemptId: string, answers: Record<string, string>) => toAttemptView(await learnerAssessmentsApi.submit(attemptId, answers));
export const deleteLearnerAssessment = (id: string) => learnerAssessmentsApi.remove(id);

export interface AttemptListItem {
  id: string;
  assessmentId: string;
  title: string;
  kind: 'quiz' | 'exam' | null;
  status: 'in_progress' | 'submitted';
  score: number | null;
  startedAt: string;
  submittedAt: string | null;
}

export async function loadAttempts(assessmentId?: string): Promise<AttemptListItem[]> {
  return list(await learnerAssessmentsApi.attempts(assessmentId)).map((t) => ({
    id: str(t.id),
    assessmentId: str(t.assessmentId),
    title: str(t.title) || 'Untitled',
    kind: t.kind === 'exam' ? 'exam' : t.kind === 'quiz' ? 'quiz' : null,
    status: t.status === 'submitted' ? 'submitted' : 'in_progress',
    score: typeof t.score === 'number' ? t.score : null,
    startedAt: str(t.startedAt),
    submittedAt: orNull(t.submittedAt),
  }));
}

/** Seconds left before a timed attempt's deadline (null when untimed). */
export function secondsLeft(deadlineAt: string | null, now = Date.now()): number | null {
  if (!deadlineAt) return null;
  const t = Date.parse(deadlineAt);
  return Number.isNaN(t) ? null : Math.max(0, Math.floor((t - now) / 1000));
}

export function formatClock(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = String(seconds % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}

/** Where to study again after an attempt: the lesson, material, course or video it came from. */
export function sourceLinks(a: Pick<LearnerAssessment, 'resourceId' | 'materialId' | 'personalCourseId' | 'youtubeSessionId'>): { href: string; label: string }[] {
  const out: { href: string; label: string }[] = [];
  if (a.resourceId) out.push({ href: `/learn/resources/${encodeURIComponent(a.resourceId)}`, label: 'Review the lesson' });
  if (a.materialId) out.push({ href: `/learn/materials/${encodeURIComponent(a.materialId)}`, label: 'Open the material' });
  if (a.youtubeSessionId) out.push({ href: `/ai/youtube/${encodeURIComponent(a.youtubeSessionId)}`, label: 'Rewatch the video' });
  if (a.personalCourseId) out.push({ href: `/my-courses/${encodeURIComponent(a.personalCourseId)}`, label: 'Go to the course' });
  return out;
}

// ---------------------------------------------------------------------------------------------------------------
// YouTube sessions
// ---------------------------------------------------------------------------------------------------------------

export interface YoutubeSession {
  id: string;
  videoId: string;
  url: string;
  title: string;
  channelTitle: string | null;
  thumbnailUrl: string | null;
  goal: string | null;
  level: string | null;
  subject: string | null;
  personalCourseId: string | null;
  embeddable: boolean | null;
  transcriptStatus: 'ready' | 'processing' | 'unavailable';
  transcriptSource: 'youtube' | 'learner' | null;
  transcriptError: string | null;
  segments: { start: number; text: string }[];
  transcriptText: string | null;
  updatedAt: string;
}

export function toYoutubeSession(res: unknown): YoutubeSession {
  const r = obj(res);
  if (!str(r.id)) throw new Error('This session could not be read.');
  const status = str(r.transcriptStatus);
  return {
    id: str(r.id),
    videoId: str(r.videoId),
    url: str(r.url),
    title: str(r.title) || 'YouTube session',
    channelTitle: orNull(r.channelTitle),
    thumbnailUrl: orNull(r.thumbnailUrl),
    goal: orNull(r.goal),
    level: orNull(r.level),
    subject: orNull(r.subject),
    personalCourseId: orNull(r.personalCourseId),
    embeddable: typeof r.embeddable === 'boolean' ? r.embeddable : null,
    transcriptStatus: status === 'ready' || status === 'processing' ? status : 'unavailable',
    transcriptSource: r.transcriptSource === 'youtube' || r.transcriptSource === 'learner' ? r.transcriptSource : null,
    transcriptError: orNull(r.transcriptError),
    segments: list(r.segments).map((s) => ({ start: num(s.start), text: str(s.text) })),
    transcriptText: orNull(r.transcriptText),
    updatedAt: str(r.updatedAt),
  };
}

export interface SessionMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations: number[];
}

const toMessage = (m: Raw): SessionMessage => ({ id: str(m.id), role: m.role === 'user' ? 'user' : 'assistant', content: str(m.content), citations: Array.isArray(m.citations) ? m.citations.filter((c): c is number => typeof c === 'number') : [] });

export const loadYoutubeSessions = async () => list(await youtubeSessionsApi.list()).map(toYoutubeSession);
export const loadYoutubeSession = async (id: string) => toYoutubeSession(await youtubeSessionsApi.get(id));
export const createYoutubeSession = async (input: Parameters<typeof youtubeSessionsApi.create>[0]) => toYoutubeSession(await youtubeSessionsApi.create(input));
export const setTranscript = async (id: string, text: string) => toYoutubeSession(await youtubeSessionsApi.setTranscript(id, text));
export const refetchTranscript = async (id: string) => toYoutubeSession(await youtubeSessionsApi.refetchTranscript(id));
export const deleteYoutubeSession = (id: string) => youtubeSessionsApi.remove(id);
export const loadSessionMessages = async (id: string) => list(await youtubeSessionsApi.messages(id)).map(toMessage);
export async function askVideo(id: string, question: string): Promise<SessionMessage[]> {
  const r = obj(await youtubeSessionsApi.ask(id, question));
  return [toMessage(obj(r.question)), toMessage(obj(r.answer))];
}

/** "dQw4w9WgXcQ" from the usual YouTube link shapes, or null (the server validates again). */
export function youtubeIdFrom(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\.|^m\.|^music\./, '');
  let id: string | null = null;
  if (host === 'youtu.be') id = url.pathname.slice(1).split('/')[0];
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    id = url.pathname === '/watch' ? url.searchParams.get('v') : (url.pathname.match(/^\/(?:shorts|embed|live|v)\/([^/?#]+)/)?.[1] ?? null);
  }
  return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
}

/** The privacy-enhanced embed, optionally starting at a timestamp. */
export const embedUrl = (videoId: string, start?: number) =>
  `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?rel=0${start !== undefined ? `&start=${Math.floor(start)}&autoplay=1` : ''}`;

/** Splits an answer into text and the [mm:ss] timestamps it cites (only those the server verified become links). */
export function answerParts(content: string, citations: number[]): ({ text: string } | { seconds: number; label: string })[] {
  const allowed = new Set(citations);
  const parts: ({ text: string } | { seconds: number; label: string })[] = [];
  let last = 0;
  for (const m of content.matchAll(/\[(\d{1,2}):(\d{2})(?::(\d{2}))?\]/g)) {
    const seconds = m[3] !== undefined ? Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) : Number(m[1]) * 60 + Number(m[2]);
    if (!allowed.has(seconds)) continue;
    if (m.index! > last) parts.push({ text: content.slice(last, m.index) });
    parts.push({ seconds, label: m[0].slice(1, -1) });
    last = m.index! + m[0].length;
  }
  if (last < content.length) parts.push({ text: content.slice(last) });
  return parts;
}

// ---------------------------------------------------------------------------------------------------------------
// Global search
// ---------------------------------------------------------------------------------------------------------------

export interface SearchHit {
  type: string;
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

export async function searchEverything(q: string, signal?: AbortSignal): Promise<{ results: SearchHit[]; unavailableTypes: string[] }> {
  const r = obj(await globalSearchApi.everything(q, signal));
  return {
    // only app-internal links are followed ("/x", never "//host" or "/\host")
    results: list(r.results)
      .filter((x) => str(x.id) && /^\/(?![/\\])/.test(str(x.href)))
      .map((x) => ({ type: str(x.type), id: str(x.id), title: str(x.title) || 'Untitled', subtitle: str(x.subtitle), href: str(x.href) })),
    unavailableTypes: strings(r.unavailableTypes),
  };
}

export const SEARCH_TYPE_LABEL: Record<string, string> = {
  course: 'GleamLearn courses',
  personal_course: 'My courses',
  material: 'Materials',
  resource: 'Lessons & notes',
  assessment: 'Quizzes & mock exams',
  youtube: 'YouTube sessions',
  note: 'Notes',
  deck: 'Flashcards',
};
