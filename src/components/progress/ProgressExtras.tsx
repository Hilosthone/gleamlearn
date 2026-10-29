'use client';

import React from 'react';
import Link from 'next/link';
import { BarChart3, Medal, TrendingUp } from 'lucide-react';
import { useApiQuery } from '@/hooks/useApiQuery';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { loadLearningProgress, loadLevel } from '@/lib/gamification';
import { loadPerformance } from '@/lib/exam-prep';

const panel = 'bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs';

/** Level, title, progress to the next level, rank, and the level ladder — from /levels/me, /levels, /leaderboards/me. */
export function LevelView() {
  const lv = useApiQuery(() => loadLevel(), []);
  if (lv.isLoading) return <LoadingState layout="detail" label="Loading your level…" />;
  if (lv.error && !lv.data) return <ErrorState error={lv.error} onRetry={lv.retry} />;
  const l = lv.data!;
  const pct = l.xpForNextLevel > 0 ? Math.min(100, Math.round((l.xpIntoLevel / l.xpForNextLevel) * 100)) : 0;
  return (
    <div className="space-y-6">
      <section className={`${panel} space-y-3`} aria-label="Your level">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#7C3AED]">Level {l.level}{l.title ? ` · ${l.title}` : ''}</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{l.totalXp.toLocaleString()} XP</p>
          </div>
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5"><Medal className="w-4 h-4 text-amber-500" aria-hidden="true" /> {l.rank ? `Rank #${l.rank} overall` : 'Not ranked yet — earn XP to join the leaderboard'}</p>
        </div>
        <div>
          <div className="h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden" role="progressbar" aria-label="Progress to the next level" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
            <div className="h-full bg-[#7C3AED]" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-gray-500 mt-1">{l.xpIntoLevel} of {l.xpForNextLevel} XP to level {l.level + 1}</p>
        </div>
      </section>
      {l.tiers.length > 0 && (
        <section className={`${panel} space-y-2`} aria-label="Level titles">
          <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">Titles</h2>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {l.tiers.map((t) => (
              <li key={t.level} className={`rounded-2xl p-3 text-xs ${t.level <= l.level ? 'bg-purple-50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200' : 'bg-gray-50 dark:bg-gray-900 text-gray-500'}`}>
                <span className="font-bold">Level {t.level}: {t.title}</span> · from {t.minXp.toLocaleString()} XP
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

/** Course completion and mastery records plus assessment performance — all from real records, empty when none. */
export function LearningProgressView() {
  const p = useApiQuery(() => loadLearningProgress(), []);
  const perf = useApiQuery(() => loadPerformance().catch(() => null), []);
  if (p.isLoading) return <LoadingState layout="cards" rows={2} label="Loading your progress…" />;
  if (p.error && !p.data) return <ErrorState error={p.error} onRetry={p.retry} />;
  const d = p.data!;
  const stat = (label: string, value: string) => (
    <div className="rounded-2xl bg-gray-50 dark:bg-gray-900 p-4">
      <p className="text-[11px] font-semibold text-gray-500">{label}</p>
      <p className="text-xl font-black text-gray-900 dark:text-white">{value}</p>
    </div>
  );
  const pf = perf.data;
  if (!d.trackedCourses && !pf?.totalAssessments) {
    return (
      <div className={panel}>
        <EmptyState icon={TrendingUp} title="No progress recorded yet" description="Complete lessons in a course or submit a quiz, test or exam, and your progress and mastery will show here." />
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" aria-label="Progress overview">
        {stat('Courses with progress', String(d.trackedCourses))}
        {stat('Average completion', d.completionPercentage === null ? '—' : `${Math.round(d.completionPercentage)}%`)}
        {stat('Question mastery', pf?.masteryPercentage == null ? '—' : `${pf.masteryPercentage}%`)}
        {stat('Assessments done', String(pf?.totalAssessments ?? 0))}
      </div>
      {d.courses.length > 0 && (
        <section className={`${panel} space-y-2`} aria-label="Course completion">
          <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">Course completion</h2>
          <ul className="space-y-2">
            {d.courses.map((c) => (
              <li key={c.courseId} className="text-xs">
                <div className="flex justify-between gap-2">
                  <Link href={`/learn/${encodeURIComponent(c.courseId)}`} className="font-semibold text-[var(--color-brand-blue)] hover:underline">Open course</Link>
                  <span className="text-gray-500">{c.isCompleted ? 'Completed' : `${Math.round(c.completionPercentage)}%`}</span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden" aria-hidden="true"><div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, c.completionPercentage)}%` }} /></div>
              </li>
            ))}
          </ul>
        </section>
      )}
      <p className="text-xs text-gray-500 flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5" aria-hidden="true" /> Scores by topic, strengths and topics to revise are in <Link href="/practice" className="font-semibold text-[var(--color-brand-blue)] hover:underline">Practice → Performance</Link>.</p>
    </div>
  );
}
