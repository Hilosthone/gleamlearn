/**
 * ---------------------------------------------------------------------------
 * lib/engagement.ts — daily-visit and active-time rewards (typed wrappers over engagementApi)
 * ---------------------------------------------------------------------------
 * Backend contract (mycoursea-backend src/engagement, 2026-11-02):
 *   POST /engagement/daily     → { today, streakCounted, streak, reward: { granted, xp, coins, message? }, policy }
 *                                The first signed-in visit of the day counts towards the streak and earns 5 XP + 5
 *                                coins once; any number of calls, tabs or devices count once.
 *   POST /engagement/heartbeat { active } → { today, activeSecondsToday, rewardedBlocksToday, maxBlocksPerDay,
 *                                capReached, nextRewardInSeconds, rewards: [{ xp, coins, message }] }
 *                                Every 10 minutes of active time earns 2 XP + 2 coins, up to 60 minutes a day.
 *   GET  /engagement/today     → { dailyVisitRewarded, activeSecondsToday, rewardedBlocksToday, maxBlocksPerDay,
 *                                nextRewardInSeconds, policy }
 * The server measures the time (several tabs share one clock) and decides every amount. The client only says
 * whether the learner is active: the page is visible and they interacted within the last two minutes.
 */

import { engagementApi } from './api.ts';
import { toStreakRecovery, type StreakRecovery } from './learning.ts';

export const HEARTBEAT_INTERVAL_MS = 60_000;
export const ACTIVITY_WINDOW_MS = 120_000;

type Raw = Record<string, unknown>;
const obj = (v: unknown): Raw => (v && typeof v === 'object' ? (v as Raw) : {});
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
const str = (v: unknown) => (typeof v === 'string' ? v : '');

export interface Reward {
  xp: number;
  coins: number;
  message: string;
}

export interface DailyVisit {
  today: string | null;
  streakCounted: boolean;
  currentStreak: number;
  recovery: StreakRecovery | null;
  reward: Reward | null;
}

export function toDailyVisit(res: unknown): DailyVisit {
  const r = obj(res);
  const reward = obj(r.reward);
  const streak = obj(r.streak);
  return {
    today: str(r.today) || null,
    streakCounted: r.streakCounted === true,
    currentStreak: num(streak.currentStreak),
    recovery: toStreakRecovery(streak.recovery),
    reward:
      reward.granted === true
        ? { xp: num(reward.xp), coins: num(reward.coins), message: str(reward.message) || `You've earned ${num(reward.xp)} XP and ${num(reward.coins)} coins for checking in today.` }
        : null,
  };
}

export interface Heartbeat {
  today: string | null;
  activeSecondsToday: number;
  rewardedBlocksToday: number;
  maxBlocksPerDay: number;
  capReached: boolean;
  nextRewardInSeconds: number | null;
  rewards: Reward[];
}

export function toHeartbeat(res: unknown): Heartbeat {
  const r = obj(res);
  const max = num(r.maxBlocksPerDay) || 6;
  return {
    today: str(r.today) || null,
    activeSecondsToday: num(r.activeSecondsToday),
    rewardedBlocksToday: num(r.rewardedBlocksToday),
    maxBlocksPerDay: max,
    capReached: r.capReached === true || num(r.rewardedBlocksToday) >= max,
    nextRewardInSeconds: typeof r.nextRewardInSeconds === 'number' ? r.nextRewardInSeconds : null,
    rewards: (Array.isArray(r.rewards) ? r.rewards : []).map(obj).map((x) => ({ xp: num(x.xp), coins: num(x.coins), message: str(x.message) || `You've earned ${num(x.xp)} XP and ${num(x.coins)} coins.` })),
  };
}

export interface EngagementToday {
  dailyVisitRewarded: boolean;
  activeMinutesToday: number;
  rewardedBlocksToday: number;
  maxBlocksPerDay: number;
  nextRewardInSeconds: number | null;
  /** XP and coins per block and the daily cap, as the server applies them */
  blockXp: number;
  blockCoins: number;
  dailyVisitXp: number;
  dailyVisitCoins: number;
}

export function toEngagementToday(res: unknown): EngagementToday {
  const r = obj(res);
  const policy = obj(r.policy);
  const daily = obj(policy.dailyVisit);
  const active = obj(policy.activeTime);
  return {
    dailyVisitRewarded: r.dailyVisitRewarded === true,
    activeMinutesToday: Math.floor(num(r.activeSecondsToday) / 60),
    rewardedBlocksToday: num(r.rewardedBlocksToday),
    maxBlocksPerDay: num(r.maxBlocksPerDay) || 6,
    nextRewardInSeconds: typeof r.nextRewardInSeconds === 'number' ? r.nextRewardInSeconds : null,
    blockXp: num(active.xp),
    blockCoins: num(active.coins),
    dailyVisitXp: num(daily.xp),
    dailyVisitCoins: num(daily.coins),
  };
}

/** Active = the page is visible and the learner interacted within the activity window. */
export function isLearnerActive(input: { visible: boolean; lastInteractionAt: number; now: number; windowMs?: number }): boolean {
  return input.visible && input.now - input.lastInteractionAt <= (input.windowMs ?? ACTIVITY_WINDOW_MS);
}

/**
 * What the next heartbeat tick should send: `true` while active, a single `false` when the learner stops being
 * active (so the server stops the clock), then nothing until they are active again.
 */
export function nextHeartbeat(active: boolean, wasActive: boolean): boolean | null {
  if (active) return true;
  return wasActive ? false : null;
}

export const recordDailyVisit = async () => toDailyVisit(await engagementApi.daily());
export const sendHeartbeat = async (active: boolean) => toHeartbeat(await engagementApi.heartbeat(active));
export const loadEngagementToday = async () => toEngagementToday(await engagementApi.today());
