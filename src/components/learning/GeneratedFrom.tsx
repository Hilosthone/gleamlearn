'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, ClipboardList, GraduationCap, Layers, ListChecks } from 'lucide-react';
import { useApiQuery } from '@/hooks/useApiQuery';
import { ErrorState, LoadingState } from '@/components/ui/states';
import { kindInfo, loadLearnerAssessments, loadResources, resourceHref } from '@/lib/self-learning';

const card = 'bg-white dark:bg-[#111827] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs';

interface Filter {
  materialId?: string;
  personalCourseId?: string;
  youtubeSessionId?: string;
}

/** Everything the learner generated from one material, course or video: lessons, notes, decks, quizzes, mock exams. */
export function GeneratedFrom({ filter, title = 'Made from this' }: { filter: Filter; title?: string }) {
  const data = useApiQuery(async () => {
    const [resources, assessments] = await Promise.all([loadResources(filter), loadLearnerAssessments(undefined, filter.personalCourseId)]);
    const mine = assessments.filter(
      (a) => (!filter.materialId || a.materialId === filter.materialId) && (!filter.youtubeSessionId || a.youtubeSessionId === filter.youtubeSessionId),
    );
    return { resources, assessments: mine };
  }, [filter.materialId, filter.personalCourseId, filter.youtubeSessionId]);

  if (data.isLoading) return <LoadingState rows={2} label="Loading what you made…" />;
  if (data.error && !data.data) return data.error.kind === 'not_implemented' ? null : <ErrorState error={data.error} onRetry={data.retry} compact />;
  const { resources = [], assessments = [] } = data.data ?? {};
  if (!resources.length && !assessments.length) return null;

  return (
    <section className={`${card} p-5 sm:p-6 space-y-3`} aria-label={title}>
      <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">{title}</h2>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {resources.map((r) => {
          const Icon = r.kind === 'flashcards' ? Layers : r.kind === 'course_plan' ? ListChecks : BookOpen;
          return (
            <li key={r.id}>
              <Link href={resourceHref(r)} className="flex items-start gap-2 p-3 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-[var(--color-brand-blue)]">
                <Icon className="w-4 h-4 text-[var(--color-brand-blue)] shrink-0 mt-0.5" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-gray-900 dark:text-white truncate">{r.title}</span>
                  <span className="block text-[11px] text-gray-500">
                    {r.kind === 'course_plan' ? 'Course plan' : (kindInfo(r.kind)?.label ?? r.kind)}
                    {r.completed && ' · done'}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
        {assessments.map((a) => {
          const Icon = a.kind === 'exam' ? GraduationCap : ClipboardList;
          return (
            <li key={a.id}>
              <Link href={`/practice/${encodeURIComponent(a.id)}`} className="flex items-start gap-2 p-3 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-[var(--color-brand-blue)]">
                <Icon className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-gray-900 dark:text-white truncate">{a.title}</span>
                  <span className="block text-[11px] text-gray-500">
                    {a.kind === 'exam' ? 'Mock exam' : 'Quiz'} · {a.questionCount} questions
                    {a.bestScore !== null && ` · best ${a.bestScore}%`}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
