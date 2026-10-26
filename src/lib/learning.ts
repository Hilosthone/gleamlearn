/**
 * ---------------------------------------------------------------------------
 * lib/learning.ts — Typed learner catalog, enrollment, lesson progress and stats
 * ---------------------------------------------------------------------------
 * Types follow the responses of the running backend (probed with test/live/probe-shapes.mjs):
 *   GET  /courses                     → Course[] (with topics)
 *   GET  /courses/search?q&track&level → Course[]
 *   GET  /courses/:id                 → Course (with topics)
 *   GET  /courses/:id/lessons         → Lesson[]
 *   GET  /users/me/courses            → EnrolledCourse[] (course + progressPercentage, enrolledAt)
 *   POST/DELETE /courses/:id/enroll
 *   GET  /lessons/:id                 → Lesson
 *   GET  /lessons/:id/progress        → LessonProgress   (isCompleted false when never started)
 *   POST /lessons/:id/start | /complete → LessonProgress
 *   GET  /xp → { totalXp, level, currentXp, nextLevelXp } · GET /coins → { balance, totalTransactions }
 *   GET  /streak → { currentStreak (0 once broken), longestStreak, activeToday/checkedInToday, brokenStreak, recoveryTokens, lastCheckInDate, today }
 *        A day counts when the learner completes a lesson, submits a quiz/test/exam, reviews a flashcard or checks in;
 *        days are calendar days in the backend's streak time zone (Africa/Lagos), which `today` reports.
 * Progress shown in the UI comes from the backend; nothing here awards XP or marks progress by itself.
 *
 * Kept free of path aliases so it can be unit-tested with `node --test`.
 */

import { coinsApi, coursesApi, lessonsApi, notificationsApi, streaksApi, studySessionsApi, xpApi } from './api.ts';

export interface Topic {
  id: string;
  courseId: string;
  title: string;
  description?: string | null;
  order: number;
}

export interface Course {
  id: string;
  title: string;
  description?: string | null;
  track: string;
  level?: string | null;
  departmentId?: string | null;
  topics?: Topic[];
  createdAt?: string;
  updatedAt?: string;
}

export interface EnrolledCourse extends Course {
  progressPercentage: number;
  enrolledAt: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  content?: string | null;
  orderIndex: number;
}

export interface LessonProgress {
  lessonId: string;
  isCompleted: boolean;
  startedAt: string | null;
  completedAt: string | null;
}

/** GET /streak. `checkedInToday`: today already counts. `brokenStreak`: the streak that ended (restorable with a token). */
export interface StreakSummary {
  currentStreak: number;
  longestStreak: number;
  checkedInToday: boolean;
  brokenStreak: number;
  recoveryTokens: number;
  lastCheckInDate: string | null;
  today: string | null;
}

export interface LearnerStats {
  xp: { totalXp: number; level: number; currentXp: number; nextLevelXp: number } | null;
  coins: { balance: number } | null;
  streak: StreakSummary | null;
}

export const TRACKS = ['All', 'University', 'Secondary'] as const;
export type TrackFilter = (typeof TRACKS)[number];

const asArray = <T>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

export async function listCourses(params: { q?: string; track?: TrackFilter } = {}): Promise<Course[]> {
  const q = params.q?.trim();
  const track = params.track && params.track !== 'All' ? params.track : undefined;
  if (q || track) return asArray<Course>(await coursesApi.searchCourses({ q: q ?? '', track }));
  return asArray<Course>(await coursesApi.getAllCourses());
}

export async function listEnrolledCourses(): Promise<EnrolledCourse[]> {
  return asArray<EnrolledCourse>(await coursesApi.getEnrolledCourses());
}

export async function getCourse(id: string): Promise<Course> {
  return (await coursesApi.getCourseById(id)) as Course;
}

export async function listLessons(courseId: string): Promise<Lesson[]> {
  return sortLessons(asArray<Lesson>(await lessonsApi.getCourseLessons(courseId)));
}

export async function getLesson(id: string): Promise<Lesson> {
  return (await lessonsApi.getLessonById(id)) as Lesson;
}

export async function getLessonProgress(id: string): Promise<LessonProgress> {
  return normalizeProgress(id, await lessonsApi.getLessonProgress(id));
}

export async function startLesson(id: string): Promise<LessonProgress> {
  return normalizeProgress(id, await lessonsApi.startLesson(id));
}

export async function completeLesson(id: string): Promise<LessonProgress> {
  const progress = normalizeProgress(id, await lessonsApi.completeLesson(id));
  invalidateLearnerStats(); // completing a lesson counts towards today's streak
  return progress;
}

export const enroll = (courseId: string) => coursesApi.enrollInCourse(courseId);
export const unenroll = (courseId: string) => coursesApi.unenrollFromCourse(courseId);

/** Progress for every lesson of a course (one request per lesson; courses are small). */
export async function listLessonProgress(lessons: Lesson[]): Promise<Record<string, LessonProgress>> {
  const entries = await Promise.all(lessons.map(async (l) => [l.id, await getLessonProgress(l.id)] as const));
  return Object.fromEntries(entries);
}

/**
 * One stats request shared by every caller on the page (the Navbar and the dashboard both show XP, coins and
 * streak). Before, each loaded them separately: 2 requests per endpoint per dashboard load, against a backend
 * limit of 2 per 2 s on /xp, so any extra navigation got 429s. Callers within `maxAgeMs` reuse the same promise;
 * a failed load is not cached. Call `invalidateLearnerStats()` after anything that changes XP, coins or streak.
 */
const STATS_MAX_AGE_MS = 10_000;
let sharedStats: { promise: Promise<LearnerStats>; at: number } | null = null;

export function sharedLearnerStats(now: number = Date.now(), load: () => Promise<LearnerStats> = loadLearnerStats): Promise<LearnerStats> {
  if (sharedStats && now - sharedStats.at < STATS_MAX_AGE_MS) return sharedStats.promise;
  const entry = { promise: load(), at: now };
  sharedStats = entry;
  entry.promise.catch(() => {
    if (sharedStats === entry) sharedStats = null;
  });
  return entry.promise;
}

/** Window event fired after XP, coins or streak may have changed; the Navbar reloads its stats. */
export const LEARNER_STATS_CHANGED_EVENT = 'gleamlearn:stats-changed';

export function invalidateLearnerStats(): void {
  sharedStats = null;
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(LEARNER_STATS_CHANGED_EVENT));
}

/** Each stat is loaded independently: one failing endpoint shows as unavailable instead of failing the page. */
export async function loadLearnerStats(): Promise<LearnerStats> {
  const [xp, coins, streak] = await Promise.allSettled([xpApi.getXpOverview(), coinsApi.getCoinBalance(), streaksApi.getStreakSummary()]);
  type Raw = Record<string, unknown>;
  const value = <T>(r: PromiseSettledResult<unknown>, pick: (v: Raw) => T | null): T | null =>
    r.status === 'fulfilled' && r.value && typeof r.value === 'object' ? pick(r.value as Raw) : null;
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
  return {
    xp: value(xp, (v) =>
      typeof v.totalXp === 'number' ? { totalXp: v.totalXp, level: num(v.level), currentXp: num(v.currentXp), nextLevelXp: num(v.nextLevelXp) } : null,
    ),
    coins: value(coins, (v) => (typeof v.balance === 'number' ? { balance: v.balance } : null)),
    streak: value(streak, (v) =>
      typeof v.currentStreak === 'number'
        ? {
            currentStreak: v.currentStreak,
            longestStreak: num(v.longestStreak),
            checkedInToday: Boolean(v.activeToday ?? v.checkedInToday),
            brokenStreak: num(v.brokenStreak),
            recoveryTokens: num(v.recoveryTokens),
            lastCheckInDate: typeof v.lastCheckInDate === 'string' ? v.lastCheckInDate : null,
            today: typeof v.today === 'string' ? v.today : null,
          }
        : null,
    ),
  };
}

export interface LearnerNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

/** GET /notifications → { status, data: Notification[] }, newest first, first `limit` items. */
export async function recentNotifications(limit = 3): Promise<LearnerNotification[]> {
  const res = (await notificationsApi.getAll()) as { data?: unknown };
  return asArray<LearnerNotification>(res?.data)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, limit);
}

/** GET /study-sessions/stats → total completed study time in minutes (null if unavailable). */
export async function studyMinutes(): Promise<number | null> {
  const res = (await studySessionsApi.getStudySessionStats()) as { totalStudyTimeMinutes?: unknown };
  return typeof res?.totalStudyTimeMinutes === 'number' ? res.totalStudyTimeMinutes : null;
}

/** Time-of-day greeting for the learner's local clock. */
export function greeting(date: Date = new Date()): string {
  const h = date.getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

export function sortLessons(lessons: Lesson[]): Lesson[] {
  return [...lessons].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0) || a.title.localeCompare(b.title));
}

export function sortTopics(topics: Topic[] = []): Topic[] {
  return [...topics].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function normalizeProgress(lessonId: string, raw: unknown): LessonProgress {
  const r = (raw ?? {}) as Partial<LessonProgress>;
  return { lessonId, isCompleted: Boolean(r.isCompleted), startedAt: r.startedAt ?? null, completedAt: r.completedAt ?? null };
}

/** Completed / total lessons, from the backend's per-lesson progress records. */
export function courseCompletion(lessons: Lesson[], progress: Record<string, LessonProgress>) {
  const completed = lessons.filter((l) => progress[l.id]?.isCompleted).length;
  return { completed, total: lessons.length, percent: lessons.length ? Math.round((completed / lessons.length) * 100) : 0 };
}

/** Previous / next lesson in course order. */
export function neighbours(lessons: Lesson[], lessonId: string): { prev: Lesson | null; next: Lesson | null } {
  const ordered = sortLessons(lessons);
  const i = ordered.findIndex((l) => l.id === lessonId);
  return { prev: i > 0 ? ordered[i - 1] : null, next: i >= 0 && i < ordered.length - 1 ? ordered[i + 1] : null };
}

/** First lesson that is not completed (where "Continue" should go). */
export function nextLessonToStudy(lessons: Lesson[], progress: Record<string, LessonProgress>): Lesson | null {
  return sortLessons(lessons).find((l) => !progress[l.id]?.isCompleted) ?? null;
}

/**
 * Splits lesson content into paragraphs for plain-text rendering. Content is NEVER rendered as HTML
 * (no dangerouslySetInnerHTML), so markup in lesson text is shown as text, not executed.
 */
export function lessonParagraphs(content: string | null | undefined): string[] {
  return (content ?? '')
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}
