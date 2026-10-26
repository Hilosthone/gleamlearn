/**
 * ---------------------------------------------------------------------------
 * lib/gamification.ts — XP, coins, streak, achievements, badges, leaderboards, study time (typed, real data)
 * ---------------------------------------------------------------------------
 * Backend contract (verified 2026-10-25; all learner-JWT except catalogues and leaderboards):
 *   GET  /xp                    → { totalXp, level, currentXp, nextLevelXp }      (500 XP per level)
 *   GET  /xp/history            → XpTransaction[] { id, amount, source, description, createdAt }, newest first
 *   GET  /coins                 → { balance, ... }
 *   GET  /coins/history         → CoinTransaction[] { id, amount, type: 'EARN'|'SPEND', source, description, createdAt }
 *   GET  /streak                → { currentStreak, longestStreak, checkedInToday, recoveryTokens, lastCheckInDate }
 *   GET  /streak/calendar       → { checkInDates: 'YYYY-MM-DD'[] }
 *   POST /streak/check-in       → once per day (400 if already checked in); no XP is awarded
 *   POST /streak/recover        → spends a recovery token (400 without tokens or when already active today)
 *   GET  /achievements (public) → { achievements: Achievement[] }; GET /achievements/me → { unlockedAchievements: [{ achievement, unlockedAt }] }
 *   GET  /badges (public)       → { badges: Badge[] };             GET /badges/me → { earnedBadges: [{ badge, earnedAt }] }
 *   GET  /leaderboards/{global|weekly|monthly} and /leaderboards/country?name= (public) → { leaderboard: [{ rank, userId, name, totalXp }] }
 *   GET  /study-sessions/stats  → { totalCompletedSessions, totalStudyTimeHours, totalStudyTimeMinutes }
 *   GET  /study-sessions/history→ { history: StudySession[] } (completed only)
 * XP and coins are only ever awarded by the backend (quiz submission, admins). This module never awards anything.
 */

import { achievementsApi, badgesApi, coinsApi, leaderboardsApi, streaksApi, studySessionsApi, xpApi } from './api.ts';
import { invalidateLearnerStats, type StreakSummary } from './learning.ts';

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
  };
}

const isoDay = (d: Date) => d.toISOString().split('T')[0];

export function toCheckInDates(res: unknown): string[] {
  const d = (res as Raw | null)?.checkInDates;
  return Array.isArray(d) ? d.filter((x): x is string => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x)) : [];
}

/** Recovery only makes sense when the streak is broken: the last check-in is older than yesterday (UTC, like the backend). */
/** The backend decides whether the streak is broken (in its streak time zone); a token restores it. */
export function canRecoverStreak(s: StreakStatus): boolean {
  return s.recoveryTokens > 0 && !s.checkedInToday && s.brokenStreak > 0;
}

/** A month grid (Monday first) marking checked-in days. `month` is 0-based. */
export function calendarMonth(checkInDates: string[], year: number, month: number): { day: number | null; date: string | null; checkedIn: boolean }[] {
  const set = new Set(checkInDates);
  const first = new Date(Date.UTC(year, month, 1));
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const lead = (first.getUTCDay() + 6) % 7;
  const cells: { day: number | null; date: string | null; checkedIn: boolean }[] = Array.from({ length: lead }, () => ({ day: null, date: null, checkedIn: false }));
  for (let d = 1; d <= days; d++) {
    const date = isoDay(new Date(Date.UTC(year, month, d)));
    cells.push({ day: d, date, checkedIn: set.has(date) });
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

export type LeaderboardScope = 'global' | 'weekly' | 'monthly' | 'country';

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
    ...input.checkIns.map((d) => ({ id: `check-in-${d}`, kind: 'check-in' as const, title: 'Daily check-in', detail: 'Streak kept', at: `${d}T00:00:00.000Z` })),
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
export async function loadAchievements(): Promise<AchievementItem[]> {
  const [catalog, mine] = await Promise.all([achievementsApi.getAllAchievements(), achievementsApi.getMyAchievements()]);
  return mergeAchievements(catalog, mine);
}
export async function loadBadges(): Promise<BadgeItem[]> {
  const [catalog, mine] = await Promise.all([badgesApi.getAllBadges(), badgesApi.getMyBadges()]);
  return mergeBadges(catalog, mine);
}
export async function loadLeaderboard(scope: LeaderboardScope, country?: string): Promise<LeaderboardEntry[]> {
  if (scope === 'country') return country ? toLeaderboard(await leaderboardsApi.getCountryLeaderboard(country)) : [];
  if (scope === 'weekly') return toLeaderboard(await leaderboardsApi.getWeeklyLeaderboard());
  if (scope === 'monthly') return toLeaderboard(await leaderboardsApi.getMonthlyLeaderboard());
  return toLeaderboard(await leaderboardsApi.getGlobalLeaderboard());
}
export const loadStudyStats = async () => toStudyStats(await studySessionsApi.getStudySessionStats());
export const loadStudySessions = async () => toStudySessions(await studySessionsApi.getStudySessionHistory());

/** Daily check-in. The shared stats (Navbar streak) are refreshed afterwards. */
export async function checkInToday(): Promise<void> {
  await streaksApi.checkInStreak();
  invalidateLearnerStats();
}

export async function recoverStreak(): Promise<void> {
  await streaksApi.recoverStreak();
  invalidateLearnerStats();
}
