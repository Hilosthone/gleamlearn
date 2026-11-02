/**
 * ---------------------------------------------------------------------------
 * lib/gamification.ts — XP, coins, streak, achievements, badges, leaderboards, study time (typed, real data)
 * ---------------------------------------------------------------------------
 * Backend contract (verified 2026-10-25; all learner-JWT except catalogues and leaderboards):
 *   GET  /xp                    → { totalXp, level, currentXp, nextLevelXp }      (500 XP per level)
 *   GET  /xp/history            → XpTransaction[] { id, amount, source, description, createdAt }, newest first
 *   GET  /coins                 → { balance, ... }
 *   GET  /coins/history         → CoinTransaction[] { id, amount, type: 'EARN'|'SPEND', source, description, createdAt }
 *   GET  /streak                → { currentStreak, longestStreak, activeToday, recoveryTokens (= recoveries left this month),
 *                                   recovery: { missedDays, nextMissedDay, remainingThisMonth, monthlyAllowance, recoverable, reason } }
 *   GET  /streak/calendar?month=YYYY-MM → { checkInDates, month, days: [{ date, kind: active|recovered|missed|today_pending }] }
 *   GET  /streak/history        → { history, recoveries: [{ missedDate, recoveredOn, streakBefore }] }
 *   POST /streak/recover { missedDate } → recovers ONE missed day (the oldest); 4 per calendar month
 *   POST /engagement/daily      → the first signed-in visit of the day counts towards the streak (lib/engagement.ts);
 *                                 the old POST /streak/check-in still exists but the app no longer has a button for it
 *   GET  /achievements (public) → { achievements: Achievement[] }; GET /achievements/me → { unlockedAchievements: [{ achievement, unlockedAt }] }
 *   GET  /badges (public)       → { badges: Badge[] };             GET /badges/me → { earnedBadges: [{ badge, earnedAt }] }
 *   GET  /leaderboards/{global|weekly|monthly} and /leaderboards/country?name= (public) → { leaderboard: [{ rank, userId, name, totalXp }] }
 *   GET  /study-sessions/stats  → { totalCompletedSessions, totalStudyTimeHours, totalStudyTimeMinutes }
 *   GET  /study-sessions/history→ { history: StudySession[] } (completed only)
 * XP and coins are only ever awarded by the backend (quiz submission, admins). This module never awards anything.
 */

import { achievementsApi, badgesApi, coinsApi, leaderboardsApi, levelsApi, masteryApi, progressApi, streaksApi, studySessionsApi, xpApi } from './api.ts';
import { invalidateLearnerStats, toStreakRecovery, type StreakSummary } from './learning.ts';

type Raw = Record<string, unknown>;
const str = (v: unknown) => (typeof v === 'string' ? v : '');
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)) ? Number(v) : 0);
const rows = (res: unknown, key?: string): Raw[] => {
  const list = Array.isArray(res) ? res : key && res && typeof res === 'object' ? (res as Raw)[key] : undefined;
  return Array.isArray(list) ? (list.filter((x) => x && typeof x === 'object') as Raw[]) : [];
};
const byDateDesc = <T extends { at: string }>(a: T, b: T) => Date.parse(b.at) - Date.parse(a.at);

// ---------------------------------------------------------------------------------------------------------
// Ledgers
// ---------------------------------------------------------------------------------------------------------

export interface LedgerEntry {
  id: string;
  amount: number; // signed: spending is negative
  source: string;
  description: string;
  at: string;
}

/** Turns 'QUIZ_COMPLETED' into 'Quiz completed'. */
export function humanizeSource(source: string): string {
  const s = source.replace(/[_-]+/g, ' ').trim().toLowerCase();
  return s ? s[0].toUpperCase() + s.slice(1) : 'Other';
}

export function toXpLedger(res: unknown): LedgerEntry[] {
  return rows(res)
    .filter((r) => typeof r.id === 'string')
    .map((r) => ({ id: r.id as string, amount: num(r.amount), source: str(r.source), description: str(r.description), at: str(r.createdAt) }))
    .sort(byDateDesc);
}

export function toCoinLedger(res: unknown): LedgerEntry[] {
  return rows(res)
    .filter((r) => typeof r.id === 'string')
    .map((r) => {
      // Spending is stored negative by CoinsService; admin deductions are negative with type ADMIN_DEDUCT.
      const raw = num(r.amount);
      const deducts = /SPEND|DEDUCT/.test(str(r.type).toUpperCase());
      return { id: r.id as string, amount: raw < 0 || !deducts ? raw : -raw, source: str(r.source), description: str(r.description), at: str(r.createdAt) };
    })
    .sort(byDateDesc);
}

// ---------------------------------------------------------------------------------------------------------
// Streak
// ---------------------------------------------------------------------------------------------------------

export type StreakStatus = StreakSummary;

export function toStreakStatus(res: unknown): StreakStatus {
  const r = (res ?? {}) as Raw;
  return {
    currentStreak: num(r.currentStreak),
    longestStreak: num(r.longestStreak),
    checkedInToday: (r.activeToday ?? r.checkedInToday) === true,
    brokenStreak: num(r.brokenStreak),
    recoveryTokens: num(r.recoveryTokens),
    lastCheckInDate: typeof r.lastCheckInDate === 'string' ? r.lastCheckInDate : null,
    today: typeof r.today === 'string' ? r.today : null,
    recovery: toStreakRecovery(r.recovery),
  };
}

const isoDay = (d: Date) => d.toISOString().split('T')[0];

export function toCheckInDates(res: unknown): string[] {
  const d = (res as Raw | null)?.checkInDates;
  return Array.isArray(d) ? d.filter((x): x is string => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x)) : [];
}

/**
 * The backend decides (in its streak time zone) which days were missed and whether the recoveries left this month
 * can close the gap. An older backend without `recovery` falls back to the token count.
 */
export function canRecoverStreak(s: StreakStatus): boolean {
  if (s.recovery) return s.recovery.recoverable && s.recovery.missedDays.length > 0 && s.recovery.nextMissedDay !== null;
  return s.recoveryTokens > 0 && !s.checkedInToday && s.brokenStreak > 0;
}

/** What the learner is told about missed days (null when nothing was missed). */
export function recoveryMessage(r: StreakSummary['recovery']): string | null {
  if (!r || !r.missedDays.length) return null;
  const missed = r.missedDays.length === 1 ? 'You missed a day' : `You missed ${r.missedDays.length} days`;
  const left = `${r.remainingThisMonth} of ${r.monthlyAllowance} recover${r.monthlyAllowance === 1 ? 'y' : 'ies'} left this month`;
  if (r.recoverable) {
    return r.missedDays.length === 1
      ? `${missed}. Recover it to keep your ${r.brokenStreak}-day streak (${left}).`
      : `${missed}. Each missed day needs its own recovery: recover all ${r.missedDays.length} to restore your ${r.brokenStreak}-day streak (${left}).`;
  }
  if (r.reason === 'allowance_exhausted') return `${missed} and have used all ${r.monthlyAllowance} recoveries this month, so your streak started again today.`;
  return `${missed}, more than the ${r.remainingThisMonth} recover${r.remainingThisMonth === 1 ? 'y' : 'ies'} you have left this month, so your streak started again today.`;
}

export type CalendarDayKind = 'active' | 'recovered' | 'missed' | 'today_pending';

/** GET /streak/calendar → day kinds by date (`days`); an older backend's checkInDates count as active. */
export function toStreakCalendar(res: unknown): { month: string | null; kinds: Record<string, CalendarDayKind> } {
  const r = (res ?? {}) as Raw;
  const kinds: Record<string, CalendarDayKind> = {};
  const days = Array.isArray(r.days) ? (r.days as unknown[]) : null;
  if (days) {
    for (const d of days) {
      const x = (d ?? {}) as Raw;
      const k = x.kind;
      if (typeof x.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x.date) && (k === 'active' || k === 'recovered' || k === 'missed' || k === 'today_pending')) kinds[x.date] = k;
    }
  } else {
    for (const d of toCheckInDates(res)) kinds[d] = 'active';
  }
  return { month: typeof r.month === 'string' ? r.month : null, kinds };
}

export interface RecoveryRecord {
  missedDate: string;
  recoveredOn: string;
  streakBefore: number;
}

export function toRecoveryHistory(res: unknown): RecoveryRecord[] {
  return rows(res, 'recoveries')
    .filter((x) => typeof x.missedDate === 'string')
    .map((x) => ({ missedDate: str(x.missedDate).slice(0, 10), recoveredOn: str(x.recoveredOn).slice(0, 10), streakBefore: num(x.streakBefore) }))
    .sort((a, b) => b.missedDate.localeCompare(a.missedDate));
}

/** A month grid (Monday first) marking checked-in days. `month` is 0-based. */
export interface CalendarCell {
  day: number | null;
  date: string | null;
  checkedIn: boolean;
  kind: CalendarDayKind | null;
}

/** A month grid (Monday first). `marks` is a list of streak days or the calendar's day kinds. `month` is 0-based. */
export function calendarMonth(marks: string[] | Record<string, CalendarDayKind>, year: number, month: number): CalendarCell[] {
  const kinds: Record<string, CalendarDayKind> = Array.isArray(marks) ? Object.fromEntries(marks.map((d) => [d, 'active' as const])) : marks;
  const first = new Date(Date.UTC(year, month, 1));
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const lead = (first.getUTCDay() + 6) % 7;
  const cells: CalendarCell[] = Array.from({ length: lead }, () => ({ day: null, date: null, checkedIn: false, kind: null }));
  for (let d = 1; d <= days; d++) {
    const date = isoDay(new Date(Date.UTC(year, month, d)));
    const kind = kinds[date] ?? null;
    cells.push({ day: d, date, checkedIn: kind === 'active' || kind === 'recovered', kind });
  }
  return cells;
}

// ---------------------------------------------------------------------------------------------------------
// Achievements, badges, leaderboards
// ---------------------------------------------------------------------------------------------------------

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  rewardXp: number;
  rewardCoins: number;
  unlockedAt: string | null;
}

/** The public catalogue merged with what the learner unlocked (unlocked first, newest first). */
export function mergeAchievements(catalogRes: unknown, mineRes: unknown): AchievementItem[] {
  const unlocked = new Map<string, string>();
  for (const r of rows(mineRes, 'unlockedAchievements')) {
    const a = (r.achievement ?? {}) as Raw;
    const id = str(r.achievementId) || str(a.id);
    if (id) unlocked.set(id, str(r.unlockedAt));
  }
  const items = rows(catalogRes, 'achievements')
    .filter((a) => typeof a.id === 'string')
    .map((a) => ({
      id: a.id as string,
      title: str(a.title),
      description: str(a.description),
      rewardXp: num(a.rewardXp),
      rewardCoins: num(a.rewardCoins),
      unlockedAt: unlocked.get(a.id as string) ?? null,
    }));
  return items.sort((x, y) => (x.unlockedAt && y.unlockedAt ? Date.parse(y.unlockedAt) - Date.parse(x.unlockedAt) : x.unlockedAt ? -1 : y.unlockedAt ? 1 : x.title.localeCompare(y.title)));
}

export interface BadgeItem {
  id: string;
  name: string;
  criteria: string;
  iconUrl: string;
  earnedAt: string | null;
}

export function mergeBadges(catalogRes: unknown, mineRes: unknown): BadgeItem[] {
  const earned = new Map<string, string>();
  for (const r of rows(mineRes, 'earnedBadges')) {
    const b = (r.badge ?? {}) as Raw;
    const id = str(r.badgeId) || str(b.id);
    if (id) earned.set(id, str(r.earnedAt));
  }
  return rows(catalogRes, 'badges')
    .filter((b) => typeof b.id === 'string')
    .map((b) => ({ id: b.id as string, name: str(b.name), criteria: str(b.criteria), iconUrl: str(b.iconUrl), earnedAt: earned.get(b.id as string) ?? null }))
    .sort((x, y) => (x.earnedAt ? 0 : 1) - (y.earnedAt ? 0 : 1) || x.name.localeCompare(y.name));
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  totalXp: number;
}

export function toLeaderboard(res: unknown): LeaderboardEntry[] {
  return rows(res, 'leaderboard')
    .filter((r) => typeof r.userId === 'string')
    .map((r) => ({ rank: num(r.rank), userId: r.userId as string, name: str(r.name) || 'Learner', totalXp: num(r.totalXp) }))
    .sort((a, b) => a.rank - b.rank);
}

/** school / university / department use the learner's own profile value (the backend fills it in). */
export type LeaderboardScope = 'global' | 'weekly' | 'monthly' | 'country' | 'school' | 'university' | 'department' | 'course';

// ---------------------------------------------------------------------------------------------------------
// Study time and the activity timeline
// ---------------------------------------------------------------------------------------------------------

export interface StudyStats {
  sessions: number;
  minutes: number;
}

export function toStudyStats(res: unknown): StudyStats {
  const r = (res ?? {}) as Raw;
  return { sessions: num(r.totalCompletedSessions), minutes: num(r.totalStudyTimeMinutes) };
}

export interface StudySessionItem {
  id: string;
  title: string;
  courseId: string | null;
  minutes: number;
  at: string;
}

export function toStudySessions(res: unknown): StudySessionItem[] {
  return rows(res, 'history')
    .filter((r) => typeof r.id === 'string')
    .map((r) => ({
      id: r.id as string,
      title: str(r.title) || 'Study session',
      courseId: str(r.courseId) || null,
      minutes: Math.round(num(r.durationSeconds) / 60),
      at: str(r.endTime) || str(r.updatedAt) || str(r.createdAt),
    }))
    .sort(byDateDesc);
}

export type ActivityKind = 'xp' | 'coins' | 'study' | 'check-in';

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  title: string;
  detail: string;
  at: string;
}

/** One newest-first timeline from the real ledgers, completed study sessions and check-ins. */
export function buildActivityTimeline(input: { xp: LedgerEntry[]; coins: LedgerEntry[]; sessions: StudySessionItem[]; checkIns: string[] }): ActivityItem[] {
  const sign = (n: number) => (n > 0 ? `+${n}` : `${n}`);
  const items: ActivityItem[] = [
    ...input.xp.map((e) => ({ id: `xp-${e.id}`, kind: 'xp' as const, title: e.description || humanizeSource(e.source), detail: `${sign(e.amount)} XP`, at: e.at })),
    ...input.coins.map((e) => ({ id: `coins-${e.id}`, kind: 'coins' as const, title: e.description || humanizeSource(e.source), detail: `${sign(e.amount)} coins`, at: e.at })),
    ...input.sessions.map((s) => ({ id: `study-${s.id}`, kind: 'study' as const, title: s.title, detail: `${s.minutes} min studied`, at: s.at })),
    ...input.checkIns.map((d) => ({ id: `check-in-${d}`, kind: 'check-in' as const, title: 'Streak day', detail: 'Streak kept', at: `${d}T00:00:00.000Z` })),
  ];
  return items.filter((i) => Number.isFinite(Date.parse(i.at))).sort(byDateDesc);
}

// ---------------------------------------------------------------------------------------------------------
// Requests
// ---------------------------------------------------------------------------------------------------------

export const loadXpLedger = async () => toXpLedger(await xpApi.getXpHistory());
export const loadCoinLedger = async () => toCoinLedger(await coinsApi.getCoinHistory());
export const loadStreakStatus = async () => toStreakStatus(await streaksApi.getStreakSummary());
export const loadCheckInDates = async () => toCheckInDates(await streaksApi.getStreakCalendar());
/** `month` is 'YYYY-MM' (the backend's streak time zone); the current month when omitted. */
export const loadStreakCalendar = async (month?: string) => toStreakCalendar(await streaksApi.getStreakCalendar(undefined, month));
export const loadRecoveryHistory = async () => toRecoveryHistory(await streaksApi.getStreakHistory());
export async function loadAchievements(): Promise<AchievementItem[]> {
  const [catalog, mine] = await Promise.all([achievementsApi.getAllAchievements(), achievementsApi.getMyAchievements()]);
  return mergeAchievements(catalog, mine);
}
export async function loadBadges(): Promise<BadgeItem[]> {
  const [catalog, mine] = await Promise.all([badgesApi.getAllBadges(), badgesApi.getMyBadges()]);
  return mergeBadges(catalog, mine);
}
export async function loadLeaderboard(scope: LeaderboardScope, country?: string, courseId?: string): Promise<LeaderboardEntry[]> {
  if (scope === 'country') return country ? toLeaderboard(await leaderboardsApi.getCountryLeaderboard(country)) : [];
  // learners enrolled in that catalogue course, by XP
  if (scope === 'course') return courseId ? toLeaderboard(await leaderboardsApi.getCourseLeaderboard(courseId)) : [];
  if (scope === 'school') return toLeaderboard(await leaderboardsApi.getSchoolLeaderboard(''));
  if (scope === 'university') return toLeaderboard(await leaderboardsApi.getUniversityLeaderboard(''));
  if (scope === 'department') return toLeaderboard(await leaderboardsApi.getDepartmentLeaderboard(''));
  if (scope === 'weekly') return toLeaderboard(await leaderboardsApi.getWeeklyLeaderboard());
  if (scope === 'monthly') return toLeaderboard(await leaderboardsApi.getMonthlyLeaderboard());
  return toLeaderboard(await leaderboardsApi.getGlobalLeaderboard());
}
export const loadStudyStats = async () => toStudyStats(await studySessionsApi.getStudySessionStats());
export const loadStudySessions = async () => toStudySessions(await studySessionsApi.getStudySessionHistory());

/**
 * Recovers one missed day (the oldest, `missedDate` = recovery.nextMissedDay); repeating it for the same day is
 * harmless. Returns the streak afterwards. The shared stats (Navbar streak) are refreshed.
 */
export async function recoverStreak(missedDate?: string): Promise<{ currentStreak: number; message: string }> {
  const res = ((await streaksApi.recoverStreak(missedDate ? { missedDate } : undefined)) ?? {}) as Raw;
  invalidateLearnerStats();
  return { currentStreak: num(res.currentStreak), message: str(res.message) };
}

// ---------------------------------------------------------------------------------------------------------
// Level, rank and learning progress
// ---------------------------------------------------------------------------------------------------------

export interface LevelInfo {
  level: number;
  totalXp: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  title: string | null;
  tiers: { level: number; title: string; minXp: number }[];
  rank: number | null;
}

export async function loadLevel(): Promise<LevelInfo> {
  const [me, all, rank] = (await Promise.all([levelsApi.getMyLevel(), levelsApi.getAllLevels(), leaderboardsApi.getMyRank()])) as (Raw | null)[];
  const n = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
  const progress = (me?.progress ?? {}) as Raw;
  const tiers = (Array.isArray(all?.tiers) ? all.tiers : [])
    .map((t) => (t ?? {}) as Raw)
    .map((t) => ({ level: n(t.level), title: typeof t.title === 'string' ? t.title : '', minXp: n(t.minXp) }))
    .filter((t) => t.title)
    .sort((a, b) => a.level - b.level);
  const level = n(me?.currentLevel) || 1;
  const title = [...tiers].reverse().find((t) => t.level <= level)?.title ?? null;
  return { level, totalXp: n(me?.totalXp), xpIntoLevel: n(progress.xpIntoCurrentLevel), xpForNextLevel: n(progress.xpNeededForNextLevel), title, tiers, rank: typeof rank?.rank === 'number' ? rank.rank : null };
}

export interface LearningProgress {
  trackedCourses: number;
  completionPercentage: number | null;
  masteryScore: number | null;
  masteryLevel: string | null;
  courses: { courseId: string; completionPercentage: number; isCompleted: boolean }[];
}

/** GET /progress and /mastery: lesson completion and mastery records (catalogue courses). Empty when none. */
export async function loadLearningProgress(): Promise<LearningProgress> {
  const [p, m] = (await Promise.all([progressApi.getOverallProgress(), masteryApi.getOverallMasteryMetrics()])) as (Raw | null)[];
  const rows = Array.isArray(p?.progressRecords) ? (p.progressRecords as Raw[]) : [];
  const masteries = Array.isArray(m?.breakdown) ? (m.breakdown as unknown[]) : [];
  return {
    trackedCourses: rows.length,
    completionPercentage: rows.length && typeof p?.overallCompletionPercentage === 'number' ? p.overallCompletionPercentage : null,
    masteryScore: masteries.length && typeof m?.overallMasteryScore === 'number' ? m.overallMasteryScore : null,
    masteryLevel: masteries.length && typeof m?.masteryLevel === 'string' ? m.masteryLevel : null,
    courses: rows.map((r) => ({ courseId: String(r.courseId ?? ''), completionPercentage: typeof r.completionPercentage === 'number' ? r.completionPercentage : 0, isCompleted: r.isCompleted === true })).filter((c) => c.courseId),
  };
}
