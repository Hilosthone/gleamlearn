'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { QueryState, LoadingState, ErrorState, SlowNotice } from '@/components/ui/states';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import {
  completeLesson,
  getCourse,
  getLesson,
  getLessonProgress,
  lessonParagraphs,
  listLessons,
  neighbours,
  startLesson,
  type Course,
  type Lesson,
  type LessonProgress,
} from '@/lib/learning';

const card = 'bg-white dark:bg-[#111827] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs';

interface LessonView {
  lesson: Lesson;
  course: Course | null;
  lessons: Lesson[];
  progress: LessonProgress;
}

/**
 * A lesson: GET /lessons/:id (+ its course and sibling lessons for navigation).
 * Opening it records a start (POST /lessons/:id/start, once); "Mark as complete" calls POST /lessons/:id/complete.
 * Content is rendered as plain text paragraphs, never as HTML.
 */
export default function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();

  const view = useApiQuery<LessonView>(async () => {
    const lesson = await getLesson(lessonId);
    const [course, lessons, progress] = await Promise.all([
      getCourse(lesson.courseId).catch(() => null), // a lesson can outlive its course (no FK); still show it
      listLessons(lesson.courseId).catch(() => [lesson]),
      getLessonProgress(lessonId),
    ]);
    return { lesson, course, lessons, progress };
  }, [lessonId], { enabled: Boolean(lessonId) });

  // Record the start once per lesson (only if the backend has no start yet)
  const started = useRef<string | null>(null);
  useEffect(() => {
    const v = view.data;
    if (!v || started.current === lessonId || v.progress.startedAt) return;
    started.current = lessonId;
    startLesson(lessonId).catch(() => undefined); // best effort: the page works without it
  }, [view.data, lessonId]);

  const completion = useAsyncAction(async () => {
    const res = await completeLesson(lessonId);
    view.retry();
    return res;
  });

  return (
    <div className="space-y-6 max-w-3xl animate-in fade-in duration-300">
      <QueryState query={view} loading={<LoadingState layout="detail" label="Loading lesson…" />}>
        {(v) => {
          const { prev, next } = neighbours(v.lessons, v.lesson.id);
          const paragraphs = lessonParagraphs(v.lesson.content);
          const done = v.progress.isCompleted;
          return (
            <>
              <Link href={`/learn/${encodeURIComponent(v.lesson.courseId)}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-brand-blue)] hover:underline">
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> {v.course?.title ?? 'Back to course'}
              </Link>

              <article className={`${card} p-6 sm:p-8 space-y-5`} aria-labelledby="lesson-title">
                <header className="space-y-1">
                  <h1 id="lesson-title" className="text-2xl font-extrabold text-gray-900 dark:text-white">{v.lesson.title}</h1>
                  {done && (
                    <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> Completed
                    </p>
                  )}
                </header>
                {paragraphs.length === 0 ? (
                  <p className="text-sm text-gray-500">This lesson has no written content yet.</p>
                ) : (
                  <div className="space-y-4 text-[15px] leading-relaxed text-gray-800 dark:text-gray-200">
                    {paragraphs.map((p, i) => (
                      <p key={i} className="whitespace-pre-wrap break-words">{p}</p>
                    ))}
                  </div>
                )}
              </article>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-2">
                  {!done && (
                    <Button type="button" variant="success" size="md" isLoading={completion.isPending} onClick={() => completion.run()}>
                      <CheckCircle2 className="w-4 h-4 mr-1.5" aria-hidden="true" /> Mark as complete
                    </Button>
                  )}
                  {completion.isSlow && <SlowNotice />}
                  {completion.error && <ErrorState error={completion.error} compact />}
                  {completion.status === 'success' && done && <Alert variant="success">Lesson completed.</Alert>}
                </div>
                <nav aria-label="Lesson navigation" className="flex gap-2">
                  {prev && (
                    <Link href={`/learn/lesson/${encodeURIComponent(prev.id)}`} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> Previous
                    </Link>
                  )}
                  {next && (
                    <Link href={`/learn/lesson/${encodeURIComponent(next.id)}`} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-brand-blue)] text-white text-xs font-semibold hover:opacity-90">
                      Next lesson <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </Link>
                  )}
                </nav>
              </div>
            </>
          );
        }}
      </QueryState>
    </div>
  );
}
