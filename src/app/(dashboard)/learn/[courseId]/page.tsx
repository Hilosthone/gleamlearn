'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, BookOpen, Bookmark, BookmarkCheck, CheckCircle2, Circle, ListOrdered, PlayCircle } from 'lucide-react';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { QueryState, LoadingState, EmptyState, ErrorState, SlowNotice } from '@/components/ui/states';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import {
  courseCompletion,
  enroll,
  getCourse,
  listEnrolledCourses,
  listLessonProgress,
  listLessons,
  nextLessonToStudy,
  sortTopics,
  unenroll,
  type Course,
  type Lesson,
  type LessonProgress,
} from '@/lib/learning';
import { loadCourseSaved, setCourseSaved } from '@/lib/library';

const card = 'bg-white dark:bg-[#111827] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs';

interface CourseView {
  course: Course;
  lessons: Lesson[];
  progress: Record<string, LessonProgress>;
  enrolled: boolean;
  saved: boolean | null; // null: the library could not be read
}

/** Course detail: topics, lessons with the learner's real progress, enrol / leave. */
export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();

  const view = useApiQuery<CourseView>(async () => {
    const [course, lessons, enrolledList, saved] = await Promise.all([getCourse(courseId), listLessons(courseId), listEnrolledCourses(), loadCourseSaved(courseId)]);
    const progress = await listLessonProgress(lessons);
    return { course, lessons, progress, enrolled: enrolledList.some((c) => c.id === courseId), saved };
  }, [courseId], { enabled: Boolean(courseId) });

  const enrollment = useAsyncAction(async (_signal, join: boolean) => {
    const res = join ? await enroll(courseId) : await unenroll(courseId);
    view.retry(); // show the server's state
    return res;
  });

  const library = useAsyncAction(async (_signal, save: boolean) => {
    const saved = await setCourseSaved(courseId, save);
    view.retry();
    return saved;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Link href="/learn" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-brand-blue)] hover:underline">
        <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> Learning Hub
      </Link>

      <QueryState query={view} loading={<LoadingState layout="detail" label="Loading course…" />}>
        {(v) => <CourseBody v={v} enrollment={enrollment} library={library} />}
      </QueryState>
    </div>
  );
}

type Toggle<T = unknown> = ReturnType<typeof useAsyncAction<[boolean], T>>;

function CourseBody({ v, enrollment, library }: { v: CourseView; enrollment: Toggle; library: Toggle<boolean> }) {
  const { course, lessons, progress, enrolled } = v;
  // The state the server just confirmed wins over a refresh that may have failed (e.g. throttled)
  const saved = library.status === 'success' && library.result !== undefined ? library.result : v.saved;
  const topics = useMemo(() => sortTopics(course.topics), [course.topics]);
  const completion = courseCompletion(lessons, progress);
  const next = nextLessonToStudy(lessons, progress);

  return (
    <>
      <section className={`${card} p-6 sm:p-8 space-y-5`} aria-labelledby="course-title">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-brand-blue)]">{[course.track, course.level].filter(Boolean).join(' · ')}</p>
            <h1 id="course-title" className="text-2xl font-extrabold text-gray-900 dark:text-white">{course.title}</h1>
            {course.description && <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line max-w-2xl">{course.description}</p>}
          </div>
          <div className="flex flex-col gap-2 min-w-48">
            {enrolled && next && (
              <Link href={`/learn/lesson/${encodeURIComponent(next.id)}`} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-brand-blue)] text-white text-sm font-semibold hover:opacity-90">
                <PlayCircle className="w-4 h-4" aria-hidden="true" /> {completion.completed ? 'Continue' : 'Start learning'}
              </Link>
            )}
            <Button type="button" variant={enrolled ? 'outline' : 'primary'} size="sm" isLoading={enrollment.isPending} onClick={() => enrollment.run(!enrolled)}>
              {enrolled ? 'Leave course' : 'Enrol in this course'}
            </Button>
            {saved !== null && (
              <Button type="button" variant="outline" size="sm" isLoading={library.isPending} onClick={() => library.run(!saved)} aria-pressed={saved}>
                {saved ? <BookmarkCheck className="w-4 h-4" aria-hidden="true" /> : <Bookmark className="w-4 h-4" aria-hidden="true" />}
                {saved ? 'Saved to library' : 'Save to library'}
              </Button>
            )}
          </div>
        </div>
        {enrollment.isSlow && <SlowNotice />}
        {enrollment.error && <ErrorState error={enrollment.error} compact />}
        {library.error && <ErrorState error={library.error} compact />}
        {enrollment.status === 'success' && <Alert variant="success">{enrolled ? 'You are enrolled in this course.' : 'You have left this course.'}</Alert>}
        {enrolled && lessons.length > 0 && (
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>
                {completion.completed} of {completion.total} lessons completed
              </span>
              <span className="tabular-nums">{completion.percent}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden" role="progressbar" aria-valuenow={completion.percent} aria-valuemin={0} aria-valuemax={100} aria-label="Lessons completed">
              <div className="h-full bg-[var(--color-brand-blue)]" style={{ width: `${completion.percent}%` }} />
            </div>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className={`${card} p-6 lg:col-span-2 space-y-4`} aria-labelledby="lessons-title">
          <h2 id="lessons-title" className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-gray-400" aria-hidden="true" /> Lessons
          </h2>
          {lessons.length === 0 ? (
            <EmptyState icon={BookOpen} title="No lessons yet" description="Lessons for this course have not been published." />
          ) : (
            <ol className="divide-y divide-gray-100 dark:divide-gray-800">
              {lessons.map((l, i) => {
                const done = progress[l.id]?.isCompleted;
                return (
                  <li key={l.id}>
                    <Link href={`/learn/lesson/${encodeURIComponent(l.id)}`} className="flex items-center gap-3 py-3 hover:text-[var(--color-brand-blue)]">
                      {done ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" aria-label="Completed" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300 shrink-0" aria-label={progress[l.id]?.startedAt ? 'Started' : 'Not started'} />
                      )}
                      <span className="text-xs text-gray-400 tabular-nums w-6">{i + 1}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{l.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          )}
          {!enrolled && lessons.length > 0 && <p className="text-[11px] text-gray-500">Enrol to keep this course in your hub. Lesson progress is saved when you open and complete lessons.</p>}
        </section>

        <section className={`${card} p-6 space-y-4`} aria-labelledby="topics-title">
          <h2 id="topics-title" className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ListOrdered className="w-4 h-4 text-gray-400" aria-hidden="true" /> Topics
          </h2>
          {topics.length === 0 ? (
            <p className="text-xs text-gray-500">No topics listed for this course.</p>
          ) : (
            <ul className="space-y-2">
              {topics.map((t) => (
                <li key={t.id} className="text-sm">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{t.title}</p>
                  {t.description && <p className="text-xs text-gray-500">{t.description}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
