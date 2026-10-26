'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Bell, BookOpen, Clock, Coins, Flame, GraduationCap, PenTool, Sparkles, Trophy, Zap } from 'lucide-react';
import { useApiQuery } from '@/hooks/useApiQuery';
import { QueryState, LoadingState, EmptyState } from '@/components/ui/states';
import { useLearnerSession } from '@/components/auth/LearnerSessionProvider';
import { greeting, listEnrolledCourses, recentNotifications, sharedLearnerStats, studyMinutes } from '@/lib/learning';

const card = 'bg-white dark:bg-[#111827] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs';

function formatMinutes(total: number): string {
  if (total < 60) return `${total} min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

function Stat({ label, value, hint, icon: Icon, tone }: { label: string; value: React.ReactNode; hint?: string; icon: typeof Zap; tone: string }) {
  return (
    <div className={`${card} p-5 space-y-3`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</span>
        <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${tone}`}>
          <Icon className="w-4 h-4" aria-hidden="true" />
        </span>
      </div>
      <p className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">{value}</p>
      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

/**
 * Learner dashboard. Every figure comes from the backend for the signed-in learner:
 * GET /xp, /coins, /streak, /study-sessions/stats, /users/me/courses, /notifications.
 * A stat whose endpoint fails is shown as "—" instead of a made-up number.
 */
export default function DashboardPage() {
  const { user } = useLearnerSession();
  const name = (user.fullName || user.username || '').split(' ')[0];

  const stats = useApiQuery(() => sharedLearnerStats(), []); // shared with the Navbar (one request)
  const minutes = useApiQuery(() => studyMinutes().catch(() => null), []);
  const courses = useApiQuery(() => listEnrolledCourses(), []);
  const notifications = useApiQuery(() => recentNotifications(3), []);

  const s = stats.data;
  const streak = s?.streak?.currentStreak ?? null;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" aria-hidden="true" />
        <div className="space-y-2 z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {greeting()}
            {name ? `, ${name}` : ''}!
          </h1>
          <p className="text-sm text-blue-100 max-w-xl">
            {streak && streak > 0 ? (
              <>
                You are on a <span className="font-bold text-amber-300 inline-flex items-center gap-1"><Flame className="w-3.5 h-3.5 fill-amber-300 inline" aria-hidden="true" /> {streak}-day streak</span>. Keep it going today.
              </>
            ) : (
              'Pick up where you left off, or start a new course.'
            )}
          </p>
        </div>
        <Link href="/learn" className="z-10 px-5 py-3 rounded-2xl bg-white text-blue-900 font-bold text-sm hover:bg-blue-50 transition-all shadow-md flex items-center gap-2 group self-start md:self-auto">
          <span>Go to my courses</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
        </Link>
      </div>

      {stats.isLoading ? (
        <LoadingState layout="cards" rows={4} label="Loading your stats…" />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat
            label="Level & XP"
            icon={Zap}
            tone="bg-blue-50 dark:bg-blue-950/40 text-[var(--color-brand-blue)]"
            value={s?.xp ? <>Lv {s.xp.level} <span className="text-xs font-semibold text-blue-600">{s.xp.totalXp.toLocaleString()} XP</span></> : '—'}
            hint={s?.xp ? `${s.xp.currentXp.toLocaleString()} / ${s.xp.nextLevelXp.toLocaleString()} XP to the next level` : 'Unavailable right now'}
          />
          <Stat label="gleamCoins" icon={Coins} tone="bg-amber-50 dark:bg-amber-950/40 text-amber-500" value={s?.coins ? s.coins.balance.toLocaleString() : '—'} hint={s?.coins ? undefined : 'Unavailable right now'} />
          <Stat
            label="Streak"
            icon={Flame}
            tone="bg-orange-50 dark:bg-orange-950/40 text-orange-500"
            value={s?.streak ? `${s.streak.currentStreak} day${s.streak.currentStreak === 1 ? '' : 's'}` : '—'}
            hint={s?.streak ? `Longest: ${s.streak.longestStreak} · ${s.streak.checkedInToday ? 'today counts' : 'study today to keep it'}` : 'Unavailable right now'}
          />
          <Stat
            label="Study time"
            icon={Clock}
            tone="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600"
            value={typeof minutes.data === 'number' ? formatMinutes(minutes.data) : '—'}
            hint={typeof minutes.data === 'number' ? 'Completed study sessions' : 'Unavailable right now'}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className={`${card} p-6 lg:col-span-2 space-y-4`} aria-labelledby="continue">
          <div className="flex items-center justify-between">
            <h2 id="continue" className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[var(--color-brand-blue)]" aria-hidden="true" /> Continue learning
            </h2>
            <Link href="/learn" className="text-xs font-semibold text-[var(--color-brand-blue)] hover:underline">All courses</Link>
          </div>
          <QueryState
            query={courses}
            loading={<LoadingState layout="list" rows={2} label="Loading your courses…" />}
            isEmpty={(list) => list.length === 0}
            empty={<EmptyState icon={GraduationCap} title="No courses yet" description="Enrol in a course from the Learning Hub to see it here." action={<Link href="/learn" className="text-xs font-semibold text-[var(--color-brand-blue)] underline">Browse courses</Link>} />}
          >
            {(list) => (
              <ul className="space-y-3">
                {list.slice(0, 3).map((c) => (
                  <li key={c.id}>
                    <Link href={`/learn/${encodeURIComponent(c.id)}`} className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-[var(--color-brand-blue)] transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{c.title}</p>
                        <p className="text-xs text-gray-500">{[c.track, c.level].filter(Boolean).join(' · ')}</p>
                      </div>
                      <span className="text-xs font-bold text-[var(--color-brand-blue)] tabular-nums shrink-0">{Math.round(c.progressPercentage ?? 0)}%</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </QueryState>
        </section>

        <section className={`${card} p-6 space-y-4`} aria-labelledby="updates">
          <div className="flex items-center justify-between">
            <h2 id="updates" className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-gray-400" aria-hidden="true" /> Updates
            </h2>
            <Link href="/notifications" className="text-xs font-semibold text-[var(--color-brand-blue)] hover:underline">All</Link>
          </div>
          <QueryState
            query={notifications}
            loading={<LoadingState layout="list" rows={2} label="Loading updates…" />}
            isEmpty={(list) => list.length === 0}
            empty={<p className="text-xs text-gray-500">No updates yet.</p>}
          >
            {(list) => (
              <ul className="space-y-3">
                {list.map((n) => (
                  <li key={n.id} className="text-sm">
                    <p className={`font-semibold ${n.isRead ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>{n.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-2">{n.message}</p>
                  </li>
                ))}
              </ul>
            )}
          </QueryState>
        </section>
      </div>

      <section aria-labelledby="practice" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <h2 id="practice" className="sr-only">Practice</h2>
        {[
          { href: '/practice', title: 'Practice quizzes', icon: PenTool },
          { href: '/exams', title: 'Exam preparation', icon: Trophy },
          { href: '/ai', title: 'AI tutor', icon: Sparkles },
        ].map((t) => (
          <Link key={t.href} href={t.href} className={`${card} p-5 flex items-center justify-between gap-3 hover:shadow-md transition-shadow`}>
            <span className="flex items-center gap-3 text-sm font-bold text-gray-900 dark:text-white">
              <t.icon className="w-5 h-5 text-[var(--color-brand-blue)]" aria-hidden="true" /> {t.title}
            </span>
            <ArrowRight className="w-4 h-4 text-gray-400" aria-hidden="true" />
          </Link>
        ))}
      </section>
    </div>
  );
}
