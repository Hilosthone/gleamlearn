'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Trophy, Flame, Coins, Award, TrendingUp, Zap, BookOpen, CheckCircle2, Lock, Clock, CalendarDays, Shield } from 'lucide-react';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useOptionalLearnerSession } from '@/components/auth/LearnerSessionProvider';
import { listEnrolledCourses, sharedLearnerStats } from '@/lib/learning';
import { relativeTime } from '@/lib/notifications';
import {
  calendarMonth,
  canRecoverStreak,
  checkInToday,
  humanizeSource,
  loadAchievements,
  loadBadges,
  loadCheckInDates,
  loadCoinLedger,
  loadLeaderboard,
  loadStudyStats,
  loadXpLedger,
  recoverStreak,
  type LeaderboardScope,
  type LedgerEntry,
} from '@/lib/gamification';

type View = 'dashboard' | 'xp' | 'coins' | 'achievements' | 'streak' | 'leaderboard';

const panel = 'bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs';

/**
 * Real progress, XP, coins, achievements, streak and leaderboards. Previously every number on this page was
 * invented ("Level 42 Scholar", "88.4% mastery", "142.5 hrs", a fixed leaderboard and calendar).
 */
export default function ProgressGamificationHub() {
  const [view, setView] = useState<View>('dashboard');
  return (
    <div className="w-full min-h-screen pb-16 space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 bg-white dark:bg-[#111827] p-4 sm:px-8 sm:py-5 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-[#F97316] border border-amber-200/50">
            <Trophy className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white">Progress</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Your courses, study time, XP, coins, achievements, streak and rankings.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full xl:w-auto overflow-x-auto pb-1 xl:pb-0" role="tablist">
          {[
            { id: 'dashboard', label: 'Overview', icon: TrendingUp },
            { id: 'xp', label: 'XP & Level', icon: Zap },
            { id: 'coins', label: 'Coins', icon: Coins },
            { id: 'achievements', label: 'Achievements', icon: Award },
            { id: 'streak', label: 'Streak', icon: Flame },
            { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
          ].map((v) => {
            const isActive = view === v.id;
            return (
              <button
                key={v.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setView(v.id as View)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive ? 'bg-[#7C3AED] text-white shadow-md shadow-purple-500/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <v.icon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{v.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {view === 'dashboard' && <Overview />}
      {view === 'xp' && <XpView />}
      {view === 'coins' && <CoinsView />}
      {view === 'achievements' && <AchievementsView />}
      {view === 'streak' && <StreakView />}
      {view === 'leaderboard' && <LeaderboardView />}
    </div>
  );
}

function Stat({ label, value, icon: Icon, color }: { label: string; value: string; icon: typeof Zap; color: string }) {
  return (
    <div className={`${panel} space-y-2`}>
      <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
        <Icon className={`w-3.5 h-3.5 ${color}`} aria-hidden="true" /> {label}
      </span>
      <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

const fmt = (v: number | undefined | null, unit = '') => (v === undefined || v === null ? '—' : `${v.toLocaleString()}${unit}`);

function Overview() {
  const stats = useApiQuery(() => sharedLearnerStats(), []);
  const study = useApiQuery(() => loadStudyStats(), []);
  const courses = useApiQuery(() => listEnrolledCourses(), []);
  const hours = study.data ? Math.round((study.data.minutes / 60) * 10) / 10 : undefined;
  const completed = courses.data?.filter((c) => (c.progressPercentage ?? 0) >= 100).length;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Stat label="Courses completed" value={completed === undefined ? '—' : `${completed} of ${courses.data!.length}`} icon={CheckCircle2} color="text-emerald-500" />
        <Stat label="Study time" value={fmt(hours, ' h')} icon={Clock} color="text-blue-500" />
        <Stat label="Study sessions" value={fmt(study.data?.sessions)} icon={BookOpen} color="text-purple-500" />
        <Stat label="Level" value={stats.data?.xp ? `Level ${stats.data.xp.level}` : '—'} icon={Zap} color="text-amber-500" />
      </div>

      <section className={`${panel} space-y-4`} aria-labelledby="courses-progress">
        <h2 id="courses-progress" className="text-sm font-extrabold text-gray-900 dark:text-white">Course progress</h2>
        {courses.isLoading ? (
          <LoadingState layout="list" rows={3} />
        ) : courses.error && !courses.data ? (
          <ErrorState error={courses.error} onRetry={courses.retry} />
        ) : !courses.data?.length ? (
          <EmptyState icon={BookOpen} title="No courses yet" description="Enrol in a course to see your progress here." action={<Link href="/learn" className="text-xs font-semibold text-[var(--color-brand-blue)] underline">Browse courses</Link>} />
        ) : (
          <ul className="space-y-4">
            {courses.data.map((c) => {
              const pct = Math.round(Math.min(100, Math.max(0, c.progressPercentage ?? 0)));
              return (
                <li key={c.id}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <Link href={`/learn/${encodeURIComponent(c.id)}`} className="font-bold text-gray-900 dark:text-white hover:underline">{c.title}</Link>
                    <span className="font-bold tabular-nums text-gray-500">{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${c.title} progress`}>
                    <div className="h-full bg-[#7C3AED]" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <p className="text-[11px] text-gray-400">Progress is the share of the lessons in a course you have completed.</p>
      </section>
    </div>
  );
}

function Ledger({ query, unit, emptyTitle, emptyText }: { query: ReturnType<typeof useApiQuery<LedgerEntry[]>>; unit: string; emptyTitle: string; emptyText: string }) {
  if (query.isLoading) return <LoadingState layout="list" rows={4} />;
  if (query.error && !query.data) return <ErrorState error={query.error} onRetry={query.retry} />;
  if (!query.data?.length) return <EmptyState icon={Award} title={emptyTitle} description={emptyText} />;
  return (
    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
      {query.data.map((e) => (
        <li key={e.id} className="py-3 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-gray-900 dark:text-white">{e.description || humanizeSource(e.source)}</p>
            <p className="text-[11px] text-gray-400">{humanizeSource(e.source)} · <time dateTime={e.at}>{relativeTime(e.at)}</time></p>
          </div>
          <span className={`text-xs font-black tabular-nums ${e.amount < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
            {e.amount > 0 ? '+' : ''}{e.amount} {unit}
          </span>
        </li>
      ))}
    </ul>
  );
}

function XpView() {
  const stats = useApiQuery(() => sharedLearnerStats(), []);
  const ledger = useApiQuery(() => loadXpLedger(), []);
  const xp = stats.data?.xp;
  const pct = xp && xp.nextLevelXp > 0 ? Math.round((xp.currentXp / xp.nextLevelXp) * 100) : 0;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className={`${panel} space-y-4`}>
        <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">Level</h2>
        {stats.isLoading ? (
          <LoadingState layout="detail" />
        ) : xp ? (
          <>
            <p className="text-3xl font-black text-gray-900 dark:text-white">Level {xp.level}</p>
            <p className="text-xs text-gray-500">{xp.totalXp.toLocaleString()} XP in total</p>
            <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to the next level">
              <div className="h-full bg-amber-500" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-[11px] text-gray-400">{xp.currentXp} / {xp.nextLevelXp} XP to level {xp.level + 1}</p>
          </>
        ) : (
          <p className="text-xs text-gray-500">XP is not available right now.</p>
        )}
      </div>
      <div className={`${panel} lg:col-span-2 space-y-2`}>
        <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">XP history</h2>
        <Ledger query={ledger} unit="XP" emptyTitle="No XP yet" emptyText="You earn XP by completing quizzes." />
      </div>
    </div>
  );
}

function CoinsView() {
  const stats = useApiQuery(() => sharedLearnerStats(), []);
  const ledger = useApiQuery(() => loadCoinLedger(), []);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className={`${panel} space-y-3`}>
        <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">Balance</h2>
        <p className="text-3xl font-black text-gray-900 dark:text-white">{fmt(stats.data?.coins?.balance)}</p>
        <p className="text-[11px] text-gray-400">Coins are awarded by the platform when you complete quizzes.</p>
      </div>
      <div className={`${panel} lg:col-span-2 space-y-2`}>
        <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">Coin history</h2>
        <Ledger query={ledger} unit="coins" emptyTitle="No coin activity yet" emptyText="Coins you earn or spend will be listed here." />
      </div>
    </div>
  );
}

function AchievementsView() {
  const achievements = useApiQuery(() => loadAchievements(), []);
  const badges = useApiQuery(() => loadBadges(), []);
  return (
    <div className="space-y-8">
      <section className={`${panel} space-y-4`} aria-labelledby="ach-heading">
        <h2 id="ach-heading" className="text-sm font-extrabold text-gray-900 dark:text-white">
          Achievements {achievements.data && <span className="text-gray-400 font-bold">({achievements.data.filter((a) => a.unlockedAt).length} of {achievements.data.length} unlocked)</span>}
        </h2>
        {achievements.isLoading ? (
          <LoadingState layout="cards" rows={3} />
        ) : achievements.error && !achievements.data ? (
          <ErrorState error={achievements.error} onRetry={achievements.retry} />
        ) : !achievements.data?.length ? (
          <EmptyState icon={Award} title="No achievements available yet" description="Achievements will appear here once they are added." />
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.data.map((a) => (
              <li key={a.id} className={`p-4 rounded-2xl border ${a.unlockedAt ? 'border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900/50' : 'border-gray-200 dark:border-gray-800 opacity-75'}`}>
                <div className="flex items-center gap-2">
                  {a.unlockedAt ? <Award className="w-4 h-4 text-amber-500" aria-hidden="true" /> : <Lock className="w-4 h-4 text-gray-400" aria-hidden="true" />}
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white">{a.title}</h3>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">{a.description}</p>
                <p className="text-[10px] text-gray-400 mt-2">
                  {a.unlockedAt ? `Unlocked ${relativeTime(a.unlockedAt)}` : 'Locked'}
                  {(a.rewardXp > 0 || a.rewardCoins > 0) && ` · ${[a.rewardXp > 0 && `${a.rewardXp} XP`, a.rewardCoins > 0 && `${a.rewardCoins} coins`].filter(Boolean).join(', ')}`}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className={`${panel} space-y-4`} aria-labelledby="badge-heading">
        <h2 id="badge-heading" className="text-sm font-extrabold text-gray-900 dark:text-white">Badges</h2>
        {badges.isLoading ? (
          <LoadingState layout="cards" rows={2} />
        ) : badges.error && !badges.data ? (
          <ErrorState error={badges.error} onRetry={badges.retry} />
        ) : !badges.data?.length ? (
          <EmptyState icon={Shield} title="No badges available yet" description="Badges will appear here once they are added." />
        ) : (
          <ul className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {badges.data.map((b) => (
              <li key={b.id} className={`p-4 rounded-2xl border text-center ${b.earnedAt ? 'border-purple-200 dark:border-purple-900/50' : 'border-gray-200 dark:border-gray-800 opacity-60'}`}>
                <Shield className={`w-6 h-6 mx-auto ${b.earnedAt ? 'text-purple-500' : 'text-gray-400'}`} aria-hidden="true" />
                <p className="text-xs font-bold text-gray-900 dark:text-white mt-2">{b.name}</p>
                <p className="text-[10px] text-gray-400">{b.earnedAt ? 'Earned' : b.criteria || 'Not earned yet'}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StreakView() {
  // Shared with the Navbar (one GET /streak); check-in and recovery invalidate it for both
  const status = useApiQuery(() => sharedLearnerStats(), []);
  const dates = useApiQuery(() => loadCheckInDates(), []);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return { year: now.getUTCFullYear(), month: now.getUTCMonth() };
  });
  const refresh = () => {
    status.retry();
    dates.retry();
  };
  const checkIn = useAsyncAction(async () => {
    await checkInToday();
    refresh();
  });
  const recover = useAsyncAction(async () => {
    await recoverStreak();
    refresh();
  });
  const s = status.data?.streak ?? null;
  const cells = calendarMonth(dates.data ?? [], month.year, month.month);
  const monthLabel = new Date(Date.UTC(month.year, month.month, 1)).toLocaleDateString(undefined, { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const shift = (delta: number) => setMonth(({ year, month: m }) => ({ year: m + delta < 0 ? year - 1 : m + delta > 11 ? year + 1 : year, month: (m + delta + 12) % 12 }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className={`${panel} space-y-4`}>
        <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">Your streak</h2>
        {status.isLoading ? (
          <LoadingState layout="detail" />
        ) : !s ? (
          status.error ? <ErrorState error={status.error} onRetry={status.retry} /> : <p className="text-xs text-gray-500">Your streak is not available right now.</p>
        ) : (
          <>
            <p className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <Flame className="w-7 h-7 text-orange-500" aria-hidden="true" /> {s.currentStreak} {s.currentStreak === 1 ? 'day' : 'days'}
            </p>
            <p className="text-xs text-gray-500">Longest: {s.longestStreak} days · Recovery tokens: {s.recoveryTokens}</p>
            <p className="text-[11px] text-gray-500">
              Your streak counts the days you study: completing a lesson, submitting a quiz, test or exam, reviewing flashcards, or checking in below. Signing in alone doesn&apos;t count.
            </p>
            {s.checkedInToday ? (
              <Alert variant="success">Today counts towards your streak.</Alert>
            ) : (
              <Button type="button" variant="orange" size="md" isLoading={checkIn.isPending} onClick={() => void checkIn.run()}>
                Check in for today
              </Button>
            )}
            {canRecoverStreak(s) && (
              <div className="space-y-2">
                <p className="text-[11px] text-gray-500">Your {s.brokenStreak}-day streak ended. You can use a recovery token to restore it.</p>
                <Button type="button" variant="outline" size="sm" isLoading={recover.isPending} onClick={() => void recover.run()}>
                  Use a recovery token
                </Button>
              </div>
            )}
            {(checkIn.error || recover.error) && <ErrorState error={(checkIn.error ?? recover.error)!} compact />}
          </>
        )}
      </div>
      <div className={`${panel} lg:col-span-2 space-y-4`}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarDays className="w-4 h-4" aria-hidden="true" /> {monthLabel}
          </h2>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => shift(-1)} aria-label="Previous month">‹</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => shift(1)} aria-label="Next month">›</Button>
          </div>
        </div>
        {dates.isLoading ? (
          <LoadingState layout="cards" rows={1} />
        ) : dates.error && !dates.data ? (
          <ErrorState error={dates.error} onRetry={dates.retry} />
        ) : (
          <div className="grid grid-cols-7 gap-1.5 text-center" role="grid" aria-label={`Check-ins in ${monthLabel}`}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <span key={d} className="text-[10px] font-bold text-gray-400" role="columnheader">{d}</span>
            ))}
            {cells.map((c, i) => (
              <span
                key={c.date ?? `blank-${i}`}
                role="gridcell"
                aria-label={c.date ? `${c.date}${c.checkedIn ? ', checked in' : ''}` : undefined}
                className={`h-9 rounded-lg text-xs flex items-center justify-center ${c.day === null ? '' : c.checkedIn ? 'bg-orange-500 text-white font-bold' : 'bg-gray-50 dark:bg-gray-900 text-gray-500'}`}
              >
                {c.day ?? ''}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LeaderboardView() {
  const session = useOptionalLearnerSession();
  const country = (session?.user.country as string | undefined) || '';
  const [scope, setScope] = useState<LeaderboardScope>('weekly');
  const board = useApiQuery(() => loadLeaderboard(scope, country), [scope, country]);
  const myId = session?.user.id;
  const scopes: { id: LeaderboardScope; label: string; disabled?: boolean }[] = [
    { id: 'weekly', label: 'This week' },
    { id: 'monthly', label: 'This month' },
    { id: 'global', label: 'All time' },
    { id: 'country', label: country ? country : 'My country', disabled: !country },
  ];
  return (
    <div className={`${panel} space-y-4`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">Leaderboard (XP)</h2>
        <div className="flex gap-2 flex-wrap" role="tablist">
          {scopes.map((s) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={scope === s.id}
              disabled={s.disabled}
              title={s.disabled ? 'Add your country in your profile to see this board' : undefined}
              onClick={() => setScope(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold disabled:opacity-40 ${scope === s.id ? 'bg-[#7C3AED] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      {board.isLoading ? (
        <LoadingState layout="table" rows={5} />
      ) : board.error && !board.data ? (
        <ErrorState error={board.error} onRetry={board.retry} />
      ) : !board.data?.length ? (
        <EmptyState icon={Trophy} title="No rankings yet" description="Learners appear here once they earn XP in this period." />
      ) : (
        <ol className="divide-y divide-gray-100 dark:divide-gray-800">
          {board.data.map((e) => (
            <li key={e.userId} className={`py-3 flex items-center justify-between ${e.userId === myId ? 'font-black text-[#7C3AED]' : ''}`}>
              <span className="flex items-center gap-3 text-xs">
                <span className="w-7 text-right tabular-nums font-black text-gray-400">#{e.rank}</span>
                <span className="font-bold text-gray-900 dark:text-white">{e.name}{e.userId === myId ? ' (you)' : ''}</span>
              </span>
              <span className="text-xs font-black tabular-nums">{e.totalXp.toLocaleString()} XP</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
