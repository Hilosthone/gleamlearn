// src/app/admin/(console)/content/[id]/page.tsx
'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, BookOpen, FileText, ListOrdered, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  adminContentApi,
  type AdminCatalogCourseDetail,
  type AdminCatalogLesson,
  type AdminCatalogTopic,
  type CourseInput,
  type LessonInput,
  type TopicInput,
} from '@/lib/admin-api';
import { ApiError } from '@/lib/api-error';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { QueryState, LoadingState, EmptyState, ErrorState, SlowNotice } from '@/components/ui/states';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ADMIN_LOGIN_PATH } from '@/components/admin/AdminSessionProvider';
import { RequirePermission } from '@/components/admin/RequirePermission';
import { CourseForm, LessonForm, TopicForm } from '@/components/admin/content/CatalogForms';

const card = 'bg-white dark:bg-[#111827] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs';

type DeleteTarget =
  | { kind: 'course'; id: string; label: string }
  | { kind: 'topic'; id: string; label: string }
  | { kind: 'lesson'; id: string; label: string };

/** What is being edited inline: 'course', 'new-topic', 'new-lesson', or `topic:<id>` / `lesson:<id>`. */
type Editing = string | null;

export default function AdminCourseDetailPage() {
  return (
    <RequirePermission permission="content.manage">
      {/* useSearchParams needs a Suspense boundary */}
      <Suspense fallback={<LoadingState layout="detail" label="Loading course…" />}>
        <CourseDetail />
      </Suspense>
    </RequirePermission>
  );
}

function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const justCreated = useSearchParams().get('created') === '1';
  const [editing, setEditing] = useState<Editing>(null);
  const [message, setMessage] = useState(justCreated ? 'Course created. Add topics and lessons below.' : '');
  const [target, setTarget] = useState<DeleteTarget | null>(null);
  // Set when a delete ended without a server answer: it may have happened, so a later 404 means "already deleted"
  const [outcomeUnknownFor, setOutcomeUnknownFor] = useState<string | null>(null);
  const [courseDeleted, setCourseDeleted] = useState(false);

  const course = useApiQuery((signal) => adminContentApi.getCourse(id, { signal }), [id], { enabled: Boolean(id) });

  const saved = (text: string) => {
    setEditing(null);
    setMessage(text);
    course.retry(); // show the server's state, not an assumption
  };

  const removal = useAsyncAction(async (signal, t: DeleteTarget) => {
    try {
      const res =
        t.kind === 'course'
          ? await adminContentApi.deleteCourse(t.id, { signal })
          : t.kind === 'topic'
            ? await adminContentApi.deleteTopic(t.id, { signal })
            : await adminContentApi.deleteLesson(t.id, { signal });
      setOutcomeUnknownFor(null);
      return res;
    } catch (err) {
      if (err instanceof ApiError && (err.kind === 'timeout' || err.kind === 'network')) {
        setOutcomeUnknownFor(t.id);
      } else if (err instanceof ApiError && err.kind === 'not_found' && outcomeUnknownFor === t.id) {
        setOutcomeUnknownFor(null);
        return { status: 'success' as const, message: 'This item was already deleted by your previous attempt.' };
      }
      throw err;
    }
  });

  const confirmDelete = async () => {
    if (!target) return;
    const res = await removal.run(target);
    if (!res) return;
    setTarget(null);
    if (target.kind === 'course') {
      setCourseDeleted(true);
      return;
    }
    saved(res.message);
  };

  if (courseDeleted) {
    return (
      <div className="space-y-4 max-w-xl">
        <Alert variant="success" title="Course deleted">
          {removal.result?.message ?? 'The course was deleted.'}
        </Alert>
        <Link href="/admin/content" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-brand-blue)]">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to courses
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/content" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-brand-blue)] hover:underline">
        <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> All courses
      </Link>

      {message && (
        <Alert variant="success" action={<button type="button" className="text-xs font-semibold underline" onClick={() => setMessage('')}>Dismiss</button>}>
          {message}
        </Alert>
      )}

      <QueryState query={course} signInHref={ADMIN_LOGIN_PATH} loading={<LoadingState layout="detail" label="Loading course…" />}>
        {(res) => {
          const c = res.data;
          return (
            <>
              <CourseHeader
                course={c}
                editing={editing === 'course'}
                onEdit={() => setEditing('course')}
                onCancel={() => setEditing(null)}
                onSaved={saved}
                onDelete={() => {
                  removal.reset();
                  setTarget({ kind: 'course', id: c.id, label: c.title });
                }}
              />
              <TopicsSection
                course={c}
                editing={editing}
                setEditing={setEditing}
                onSaved={saved}
                onDelete={(t) => {
                  removal.reset();
                  setTarget({ kind: 'topic', id: t.id, label: t.title });
                }}
              />
              <LessonsSection
                course={c}
                editing={editing}
                setEditing={setEditing}
                onSaved={saved}
                onDelete={(l) => {
                  removal.reset();
                  setTarget({ kind: 'lesson', id: l.id, label: l.title });
                }}
              />
            </>
          );
        }}
      </QueryState>

      <ConfirmDialog
        open={target !== null}
        title={target ? `Delete this ${target.kind}?` : ''}
        description={
          target ? (
            <>
              <strong className="text-gray-900 dark:text-white">{target.label}</strong>{' '}
              {target.kind === 'course'
                ? 'will be removed from the catalog. This cannot be undone.'
                : 'will be removed from the course for every learner. This cannot be undone.'}{' '}
              It is only deleted if no learner data depends on it; otherwise nothing is changed and you are told why.
            </>
          ) : null
        }
        confirmLabel={outcomeUnknownFor && target?.id === outcomeUnknownFor ? 'Check and delete' : `Delete ${target?.kind ?? ''}`}
        confirmationText={target?.kind === 'course' ? target.label : undefined}
        isPending={removal.isPending}
        error={
          removal.error ? (
            <div className="space-y-2">
              <ErrorState error={removal.error} compact signInHref={ADMIN_LOGIN_PATH} />
              {(removal.error.kind === 'timeout' || removal.error.kind === 'network') && (
                <p className="text-[11px] text-gray-500">
                  The deletion may still have completed. Confirming again is safe: if the item is already gone you will be told,
                  and nothing else is deleted.
                </p>
              )}
            </div>
          ) : removal.isSlow ? (
            <SlowNotice />
          ) : undefined
        }
        onConfirm={confirmDelete}
        onCancel={() => {
          setTarget(null);
          if (removal.error) course.retry();
        }}
      />
    </div>
  );
}

function CourseHeader({
  course: c,
  editing,
  onEdit,
  onCancel,
  onSaved,
  onDelete,
}: {
  course: AdminCatalogCourseDetail;
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSaved: (message: string) => void;
  onDelete: () => void;
}) {
  const topicCount = c.topicCount ?? c.topics.length;
  const lessonCount = c.lessonCount ?? c.lessons.length;
  const enrollmentCount = c.enrollmentCount ?? 0;
  const deletable = topicCount === 0 && lessonCount === 0 && enrollmentCount === 0;

  return (
    <section className={`${card} p-6 space-y-5`} aria-labelledby="course-heading">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 id="course-heading" className="text-xl font-extrabold text-gray-900 dark:text-white">{c.title}</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {c.track}
            {c.level ? ` · ${c.level}` : ''} · {topicCount} topics · {lessonCount} lessons · {enrollmentCount} enrolled
          </p>
          {c.description && !editing && <p className="text-sm text-gray-700 dark:text-gray-300 mt-3 whitespace-pre-line">{c.description}</p>}
        </div>
        {!editing && (
          <Button type="button" variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="w-4 h-4 mr-1.5" aria-hidden="true" /> Edit details
          </Button>
        )}
      </div>

      {editing && (
        <CourseForm
          original={c}
          submitLabel="Save changes"
          onCancel={onCancel}
          onSubmit={async (payload, signal) => {
            const res = await adminContentApi.updateCourse(c.id, payload as Partial<CourseInput>, { signal });
            onSaved(res.message ?? 'Course updated.');
            return res;
          }}
        />
      )}

      <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p id="course-delete-note" className="text-[11px] text-gray-500 dark:text-gray-400">
          {deletable
            ? 'This course is empty and can be deleted.'
            : 'Only an empty course can be deleted. Remove its topics and lessons first; a course with enrolled learners cannot be deleted from here.'}
        </p>
        <Button type="button" variant="danger" size="sm" disabled={!deletable} aria-describedby="course-delete-note" onClick={onDelete}>
          <Trash2 className="w-4 h-4 mr-1.5" aria-hidden="true" /> Delete course
        </Button>
      </div>
    </section>
  );
}

interface SectionProps<T> {
  course: AdminCatalogCourseDetail;
  editing: Editing;
  setEditing: (value: Editing) => void;
  onSaved: (message: string) => void;
  onDelete: (item: T) => void;
}

function RowActions({ label, onEdit, onDelete }: { label: string; onEdit: () => void; onDelete: () => void }) {
  return (
    <span className="flex shrink-0 gap-1">
      <button
        type="button"
        onClick={onEdit}
        className="p-2 rounded-lg text-gray-500 hover:text-[var(--color-brand-blue)] hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-blue)]"
      >
        <Pencil className="w-4 h-4" aria-hidden="true" />
        <span className="sr-only">Edit {label}</span>
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="p-2 rounded-lg text-gray-500 hover:text-[var(--color-brand-red)] hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
      >
        <Trash2 className="w-4 h-4" aria-hidden="true" />
        <span className="sr-only">Delete {label}</span>
      </button>
    </span>
  );
}

function TopicsSection({ course: c, editing, setEditing, onSaved, onDelete }: SectionProps<AdminCatalogTopic>) {
  const topics = [...c.topics].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return (
    <section className={`${card} p-6 space-y-4`} aria-labelledby="topics-heading">
      <div className="flex items-center justify-between gap-3">
        <h2 id="topics-heading" className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
          <ListOrdered className="w-4 h-4 text-gray-400" aria-hidden="true" /> Topics
        </h2>
        {editing !== 'new-topic' && (
          <Button type="button" variant="outline" size="sm" onClick={() => setEditing('new-topic')}>
            <Plus className="w-4 h-4 mr-1.5" aria-hidden="true" /> Add topic
          </Button>
        )}
      </div>

      {editing === 'new-topic' && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
          <TopicForm
            submitLabel="Add topic"
            onCancel={() => setEditing(null)}
            onSubmit={async (payload, signal) => {
              const res = await adminContentApi.createTopic(c.id, payload as TopicInput, { signal });
              onSaved(res.message ?? 'Topic created.');
              return res;
            }}
          />
        </div>
      )}

      {topics.length === 0 ? (
        editing !== 'new-topic' && <EmptyState icon={ListOrdered} title="No topics yet" description="Topics organise the course and track learner mastery." />
      ) : (
        <ol className="divide-y divide-gray-100 dark:divide-gray-800">
          {topics.map((t) =>
            editing === `topic:${t.id}` ? (
              <li key={t.id} className="py-3">
                <TopicForm
                  original={t}
                  submitLabel="Save topic"
                  onCancel={() => setEditing(null)}
                  onSubmit={async (payload, signal) => {
                    const res = await adminContentApi.updateTopic(t.id, payload, { signal });
                    onSaved(res.message ?? 'Topic updated.');
                    return res;
                  }}
                />
              </li>
            ) : (
              <li key={t.id} className="py-2.5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    <span className="text-xs text-gray-400 tabular-nums mr-2">#{t.order ?? 0}</span>
                    {t.title}
                  </p>
                  {t.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{t.description}</p>}
                </div>
                <RowActions label={`topic ${t.title}`} onEdit={() => setEditing(`topic:${t.id}`)} onDelete={() => onDelete(t)} />
              </li>
            ),
          )}
        </ol>
      )}
      <p className="text-[11px] text-gray-500 dark:text-gray-400">A topic with learner progress or mastery records cannot be deleted.</p>
    </section>
  );
}

function LessonsSection({ course: c, editing, setEditing, onSaved, onDelete }: SectionProps<AdminCatalogLesson>) {
  const lessons = [...c.lessons].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  return (
    <section className={`${card} p-6 space-y-4`} aria-labelledby="lessons-heading">
      <div className="flex items-center justify-between gap-3">
        <h2 id="lessons-heading" className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
          <FileText className="w-4 h-4 text-gray-400" aria-hidden="true" /> Lessons
        </h2>
        {editing !== 'new-lesson' && (
          <Button type="button" variant="outline" size="sm" onClick={() => setEditing('new-lesson')}>
            <Plus className="w-4 h-4 mr-1.5" aria-hidden="true" /> Add lesson
          </Button>
        )}
      </div>

      {editing === 'new-lesson' && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
          <LessonForm
            submitLabel="Add lesson"
            onCancel={() => setEditing(null)}
            onSubmit={async (payload, signal) => {
              const res = await adminContentApi.createLesson(c.id, payload as LessonInput, { signal });
              onSaved(res.message ?? 'Lesson created.');
              return res;
            }}
          />
        </div>
      )}

      {lessons.length === 0 ? (
        editing !== 'new-lesson' && <EmptyState icon={BookOpen} title="No lessons yet" description="Add the first lesson for this course." />
      ) : (
        <ol className="divide-y divide-gray-100 dark:divide-gray-800">
          {lessons.map((l) =>
            editing === `lesson:${l.id}` ? (
              <li key={l.id} className="py-3">
                <LessonForm
                  original={l}
                  submitLabel="Save lesson"
                  onCancel={() => setEditing(null)}
                  onSubmit={async (payload, signal) => {
                    const res = await adminContentApi.updateLesson(l.id, payload, { signal });
                    onSaved(res.message ?? 'Lesson updated.');
                    return res;
                  }}
                />
              </li>
            ) : (
              <li key={l.id} className="py-2.5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    <span className="text-xs text-gray-400 tabular-nums mr-2">#{l.orderIndex ?? 0}</span>
                    {l.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {l.content ? `${l.content.length.toLocaleString()} characters` : 'No content yet'}
                  </p>
                </div>
                <RowActions label={`lesson ${l.title}`} onEdit={() => setEditing(`lesson:${l.id}`)} onDelete={() => onDelete(l)} />
              </li>
            ),
          )}
        </ol>
      )}
      <p className="text-[11px] text-gray-500 dark:text-gray-400">A lesson with learner progress records cannot be deleted.</p>
    </section>
  );
}
