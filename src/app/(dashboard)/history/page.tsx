'use client';

import React, { useState } from 'react';
import { History, BookOpen, CheckCircle2, Clock, Sparkles, Zap, Coins, Flame, MessageSquare, GraduationCap } from 'lucide-react';
import { useApiQuery } from '@/hooks/useApiQuery';
import { EmptyState, ErrorState, FeatureUnavailable, LoadingState } from '@/components/ui/states';
import { relativeTime } from '@/lib/notifications';
import { buildActivityTimeline, loadCheckInDates, loadCoinLedger, loadStudySessions, loadStudyStats, loadXpLedger, type ActivityKind } from '@/lib/gamification';
import { loadAiHistory } from '@/lib/history';

type HistoryView = 'learning' | 'assessment' | 'ai';

const panel = 'bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs';
const KIND_ICON: Record<ActivityKind, typeof Zap> = { xp: Zap, coins: Coins, study: Clock, 'check-in': Flame };
const KIND_FILTERS: { id: 'all' | ActivityKind; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'study', label: 'Study sessions' },
  { id: 'xp', label: 'XP' },
  { id: 'coins', label: 'Coins' },
  { id: 'check-in', label: 'Check-ins' },
];

/** The learner's real activity. Previously every log, count and date on this page was invented. */
export default function HistoryHub() {
  const [view, setView] = useState<HistoryView>('learning');
  return (
    <div className="w-full min-h-screen pb-16 space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 bg-white dark:bg-[#111827] p-4 sm:px-8 sm:py-5 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-500/10 text-[#2563EB] border border-blue-200/50">
            <History className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white">History</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Your study sessions, rewards, check-ins and AI conversations.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full xl:w-auto overflow-x-auto" role="tablist">
          {[
            { id: 'learning', label: 'Learning', icon: BookOpen },
            { id: 'assessment', label: 'Assessments', icon: CheckCircle2 },
            { id: 'ai', label: 'AI', icon: Sparkles },
          ].map((v) => (
            <button
              key={v.id}
              type="button"
              role="tab"
              aria-selected={view === v.id}
              onClick={() => setView(v.id as HistoryView)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap ${
                view === v.id ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
              }`}
            >
              <v.icon className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{v.label}</span>
            </button>
          ))}
        </div>
      </div>

      {view === 'learning' && <LearningHistory />}
      {view === 'assessment' && (
        <FeatureUnavailable
          title="Assessment history isn't available yet"
          description="Quiz, test and exam attempts aren't saved yet, so past attempts and scores can't be listed. Rewards you earned from quizzes appear under Learning → XP."
        />
      )}
      {view === 'ai' && <AiHistory />}
    </div>
  );
}

function LearningHistory() {
  const [filter, setFilter] = useState<'all' | ActivityKind>('all');
  const stats = useApiQuery(() => loadStudyStats(), []);
  const activity = useApiQuery(async () => {
    const [xp, coins, sessions, checkIns] = await Promise.all([loadXpLedger(), loadCoinLedger(), loadStudySessions(), loadCheckInDates()]);
    return buildActivityTimeline({ xp, coins, sessions, checkIns });
  }, []);
  const items = (activity.data ?? []).filter((i) => filter === 'all' || i.kind === filter);
  const hours = stats.data ? Math.round((stats.data.minutes / 60) * 10) / 10 : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Study sessions completed', value: stats.data ? String(stats.data.sessions) : '—', icon: GraduationCap },
          { label: 'Time studied', value: hours === null ? '—' : `${hours} h`, icon: Clock },
          { label: 'Activity entries', value: activity.data ? String(activity.data.length) : '—', icon: History },
        ].map((s) => (
          <div key={s.label} className={`${panel} space-y-1`}>
            <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
              <s.icon className="w-3.5 h-3.5 text-[#2563EB]" aria-hidden="true" /> {s.label}
            </span>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <section className={`${panel} space-y-4`} aria-labelledby="activity-heading">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 id="activity-heading" className="text-sm font-extrabold text-gray-900 dark:text-white">Activity</h2>
          <div className="flex gap-2 flex-wrap" role="tablist" aria-label="Filter activity">
            {KIND_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${filter === f.id ? 'bg-[#2563EB] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        {activity.isLoading ? (
          <LoadingState layout="list" rows={5} />
        ) : activity.error && !activity.data ? (
          <ErrorState error={activity.error} onRetry={activity.retry} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={History}
            title="Nothing here yet"
            description="Completed study sessions, XP and coins you earn, and daily check-ins will be listed here."
          />
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {items.map((i) => {
              const Icon = KIND_ICON[i.kind];
              return (
                <li key={i.id} className="py-3 flex items-center justify-between gap-4">
                  <span className="flex items-center gap-3">
                    <span className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-xs font-bold text-gray-900 dark:text-white">{i.title}</span>
                      <time dateTime={i.at} className="block text-[11px] text-gray-400">{i.kind === 'check-in' ? i.at.slice(0, 10) : relativeTime(i.at)}</time>
                    </span>
                  </span>
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-300 whitespace-nowrap">{i.detail}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function AiHistory() {
  const history = useApiQuery(() => loadAiHistory(), []);
  return (
    <section className={`${panel} space-y-4`} aria-labelledby="ai-heading">
      <h2 id="ai-heading" className="text-sm font-extrabold text-gray-900 dark:text-white">AI tutor sessions and assistant conversations</h2>
      {history.isLoading ? (
        <LoadingState layout="list" rows={4} />
      ) : history.error && !history.data ? (
        <ErrorState error={history.error} onRetry={history.retry} />
      ) : !history.data?.length ? (
        <EmptyState icon={MessageSquare} title="No AI conversations yet" description="Sessions with the AI tutor and conversations with the assistant will appear here." />
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {history.data.map((h) => (
            <li key={`${h.kind}-${h.id}`} className="py-3 flex items-center justify-between gap-4">
              <span className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
                  {h.kind === 'tutor' ? <GraduationCap className="w-4 h-4" aria-hidden="true" /> : <MessageSquare className="w-4 h-4" aria-hidden="true" />}
                </span>
                <span>
                  <span className="block text-xs font-bold text-gray-900 dark:text-white">{h.title}</span>
                  <span className="block text-[11px] text-gray-400">
                    {h.kind === 'tutor' ? 'AI tutor' : 'AI assistant'}
                    {h.status ? ` · ${h.status}` : ''} · <time dateTime={h.at}>{relativeTime(h.at)}</time>
                  </span>
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
