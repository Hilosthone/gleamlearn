'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, FolderPlus, Lock, Pencil, Plus, Trash2 } from 'lucide-react';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { EmptyState, ErrorState, FeatureUnavailable, LoadingState } from '@/components/ui/states';
import { Button } from '@/components/ui/Button';
import { MaterialsPanel } from '@/components/library/MaterialsPanel';
import { GenerateForm } from '@/components/learning/GenerateForm';
import { GeneratedFrom } from '@/components/learning/GeneratedFrom';
import { generateLearning, hrefFor, newRequestId } from '@/lib/self-learning';
import {
  EXAM_GOAL_SUGGESTIONS,
  addModule,
  createPersonalCourse,
  deleteModule,
  deletePersonalCourse,
  loadPersonalCourse,
  loadPersonalCourses,
  saveModuleNotes,
  setModuleDone,
  updatePersonalCourse,
  archivePersonalCourse,
  type CourseDraft,
  type PersonalCourseDetail,
} from '@/lib/learner-content';

const card = 'bg-white dark:bg-[#111827] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs';
const input =
  'w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]';
const emptyDraft: CourseDraft = { title: '', description: '', subjects: '', level: '', examGoals: '', objectives: '' };
const OUTLINE_PLACEHOLDER = ['Cell structure', 'Photosynthesis', 'Respiration'].join('\n');

export const PrivateBadge = () => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-gray-600 dark:text-gray-300">
    <Lock className="w-3 h-3" aria-hidden="true" /> Personal · only you
  </span>
);

function CourseForm({ initial, submitLabel, busy, onSubmit, onCancel }: { initial: CourseDraft; submitLabel: string; busy: boolean; onSubmit: (d: CourseDraft) => void; onCancel: () => void }) {
  const [d, setD] = useState(initial);
  return (
    <form
      className={`${card} p-5 grid grid-cols-1 sm:grid-cols-2 gap-3`}
      aria-label={submitLabel}
      onSubmit={(e) => {
        e.preventDefault();
        if (d.title.trim()) onSubmit(d);
      }}
    >
      <label className="block space-y-1 sm:col-span-2">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Course title</span>
        <input className={input} value={d.title} maxLength={200} onChange={(e) => setD({ ...d, title: e.target.value })} required />
      </label>
      <label className="block space-y-1 sm:col-span-2">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Description (optional)</span>
        <textarea className={`${input} min-h-20`} value={d.description} maxLength={2000} onChange={(e) => setD({ ...d, description: e.target.value })} />
      </label>
      <label className="block space-y-1">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Subjects (comma-separated)</span>
        <input className={input} value={d.subjects} onChange={(e) => setD({ ...d, subjects: e.target.value })} placeholder="e.g. Biology, Chemistry" />
      </label>
      <label className="block space-y-1">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Class or level (optional)</span>
        <input className={input} value={d.level} maxLength={100} onChange={(e) => setD({ ...d, level: e.target.value })} placeholder="e.g. SS 3 or 200 Level" />
      </label>
      <label className="block space-y-1 sm:col-span-2">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Exam goals (comma-separated)</span>
        <input className={input} value={d.examGoals} onChange={(e) => setD({ ...d, examGoals: e.target.value })} placeholder={EXAM_GOAL_SUGGESTIONS.join(', ')} list="exam-goal-suggestions" />
        <datalist id="exam-goal-suggestions">
          {EXAM_GOAL_SUGGESTIONS.map((g) => (
            <option key={g} value={g} />
          ))}
        </datalist>
      </label>
      <label className="block space-y-1 sm:col-span-2">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Outline: topics or learning objectives, one per line (optional)</span>
        <textarea className={`${input} min-h-24`} value={d.objectives ?? ''} onChange={(e) => setD({ ...d, objectives: e.target.value })} placeholder={OUTLINE_PLACEHOLDER} />
      </label>
      <div className="sm:col-span-2 flex gap-2">
        <Button type="submit" size="sm" isLoading={busy} disabled={!d.title.trim()}>{submitLabel}</Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel} disabled={busy}>Cancel</Button>
      </div>
    </form>
  );
}

/** The learner's own personal courses, with a create form. */
export function PersonalCourseList() {
  const router = useRouter();
  const list = useApiQuery(() => loadPersonalCourses(), []);
  const [creating, setCreating] = useState(false);
  const create = useAsyncAction(async (_signal: AbortSignal, d: CourseDraft) => {
    const created = (await createPersonalCourse(d)) as { id?: string } | null;
    setCreating(false);
    list.retry();
    if (created?.id) router.push(`/my-courses/${encodeURIComponent(created.id)}`);
    return created;
  });

  if (list.error?.kind === 'not_implemented') {
    return <FeatureUnavailable title="Personal courses aren't available yet" description="Your own courses can't be stored on this server yet." />;
  }
  const items = list.data ?? [];
  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">Organise your own studies: add modules, notes and files. Personal courses are private and never appear in the GleamLearn catalogue.</p>
      {!creating ? (
        <Button type="button" size="sm" onClick={() => { create.reset(); setCreating(true); }}>
          <FolderPlus className="w-4 h-4" aria-hidden="true" /> Create a course
        </Button>
      ) : (
        <>
          <CourseForm initial={emptyDraft} submitLabel="Create course" busy={create.isPending} onSubmit={(d) => void create.run(d)} onCancel={() => setCreating(false)} />
          {create.error && <ErrorState error={create.error} compact />}
        </>
      )}
      {list.isLoading ? (
        <LoadingState label="Loading your courses…" />
      ) : list.error && !list.data ? (
        <ErrorState error={list.error} onRetry={list.retry} />
      ) : items.length === 0 ? (
        !creating && <EmptyState icon={FolderPlus} title="No personal courses yet" description="Create one for any subject or exam you are preparing for." />
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3" aria-label="Your personal courses">
          {items.map((c) => (
            <li key={c.id} className={`${card} p-5 space-y-2`}>
              <div className="flex items-center justify-between gap-2">
                <Link href={`/my-courses/${encodeURIComponent(c.id)}`} className="text-sm font-bold text-gray-900 dark:text-white hover:text-[var(--color-brand-blue)] truncate">
                  {c.title}
                </Link>
                <PrivateBadge />
              </div>
              {c.description && <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{c.description}</p>}
              <p className="text-[11px] text-gray-500">
                {c.moduleCount} module{c.moduleCount === 1 ? '' : 's'} · {c.materialCount} file{c.materialCount === 1 ? '' : 's'}
                {c.examGoals.length > 0 && ` · ${c.examGoals.join(', ')}`}
              </p>
              {c.moduleCount > 0 && (
                <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden" role="progressbar" aria-label={`${c.title} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={c.percent}>
                  <div className="h-full bg-[var(--color-brand-blue)]" style={{ width: `${c.percent}%` }} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** One personal course: edit, modules with notes and progress, materials, delete. */
export function PersonalCourseView({ id }: { id: string }) {
  const router = useRouter();
  const course = useApiQuery(() => loadPersonalCourse(id), [id]);
  const [editing, setEditing] = useState(false);
  const [moduleTitle, setModuleTitle] = useState('');

  const save = useAsyncAction(async (_signal: AbortSignal, d: CourseDraft) => {
    await updatePersonalCourse(id, d);
    setEditing(false);
    course.retry();
  });
  const archive = useAsyncAction(async () => {
    await archivePersonalCourse(id, true);
    router.push('/my-courses');
  });
  const remove = useAsyncAction(async () => {
    if (!window.confirm('Delete this course and its modules? Its files stay in your library.')) return;
    await deletePersonalCourse(id);
    router.push('/my-courses');
  });
  const add = useAsyncAction(async () => {
    await addModule(id, moduleTitle, '');
    setModuleTitle('');
    course.retry();
  });

  const back = (
    <Link href="/my-courses" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-brand-blue)] hover:underline">
      <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> My courses
    </Link>
  );
  if (course.isLoading) return <div className="space-y-4">{back}<LoadingState layout="detail" label="Loading course…" /></div>;
  if (course.error?.kind === 'not_implemented') return <div className="space-y-4">{back}<FeatureUnavailable title="Personal courses aren't available yet" description="Your own courses can't be stored on this server yet." /></div>;
  if (course.error && !course.data) return <div className="space-y-4">{back}<ErrorState error={course.error} onRetry={course.retry} /></div>;
  const c = course.data as PersonalCourseDetail;

  return (
    <div className="space-y-6">
      {back}
      {editing ? (
        <>
          <CourseForm
            initial={{ title: c.title, description: c.description, subjects: c.subjects.join(', '), level: c.level, examGoals: c.examGoals.join(', '), objectives: c.objectives.join(String.fromCharCode(10)) }}
            submitLabel="Save changes"
            busy={save.isPending}
            onSubmit={(d) => void save.run(d)}
            onCancel={() => setEditing(false)}
          />
          {save.error && <ErrorState error={save.error} compact />}
        </>
      ) : (
        <section className={`${card} p-6 space-y-3`} aria-labelledby="course-title">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <PrivateBadge />
              <h1 id="course-title" className="text-xl font-extrabold text-gray-900 dark:text-white">{c.title}</h1>
              {c.description && <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">{c.description}</p>}
              <p className="text-xs text-gray-500">{[c.level, c.subjects.join(', '), c.examGoals.join(', ')].filter(Boolean).join(' · ')}</p>
              {c.objectives.length > 0 && (
                <ul className="list-disc pl-5 text-xs text-gray-600 dark:text-gray-300">
                  {c.objectives.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => setEditing(true)}>
                <Pencil className="w-3.5 h-3.5" aria-hidden="true" /> Edit
              </Button>
              <Button type="button" size="sm" variant="danger" isLoading={remove.isPending} onClick={() => void remove.run()}>
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" /> Delete
              </Button>
              <Button type="button" size="sm" variant="outline" isLoading={archive.isPending} onClick={() => void archive.run()}>
                Archive
              </Button>
            </div>
          </div>
          {remove.error && <ErrorState error={remove.error} compact />}
          {c.modules.length > 0 && (
            <p className="text-xs text-gray-500">
              {c.completedModules} of {c.modules.length} modules done ({c.percent}%)
            </p>
          )}
        </section>
      )}

      <section className="space-y-3" aria-label="Modules">
        <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">Modules</h2>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (moduleTitle.trim()) void add.run();
          }}
        >
          <label className="flex-1">
            <span className="sr-only">New module title</span>
            <input className={input} value={moduleTitle} maxLength={200} onChange={(e) => setModuleTitle(e.target.value)} placeholder="New module, e.g. Cell biology" />
          </label>
          <Button type="submit" size="sm" isLoading={add.isPending} disabled={!moduleTitle.trim()}>
            <Plus className="w-4 h-4" aria-hidden="true" /> Add module
          </Button>
        </form>
        {add.error && <ErrorState error={add.error} compact />}
        {c.modules.length === 0 ? (
          <p className="text-xs text-gray-500">No modules yet. Split the course into the topics you want to cover.</p>
        ) : (
          <ol className="space-y-2">
            {c.modules.map((m) => (
              <ModuleItem key={m.id} courseId={id} module={m} onChanged={course.retry} />
            ))}
          </ol>
        )}
      </section>

      <section className="space-y-3" aria-label="Course materials">
        <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">Materials</h2>
        <MaterialsPanel personalCourseId={id} onChanged={course.retry} />
      </section>

      <section className={`${card} p-5 sm:p-6`} aria-label="Learn with AI">
        <GenerateForm
          heading="Learn with AI from this course"
          source={{ sourceType: 'course', sourceId: id }}
          personalCourseId={id}
          kinds={['course_plan', 'lesson', 'study_plan', 'notes', 'flashcards', 'quiz', 'exam']}
          defaultKind={c.modules.length ? 'lesson' : 'course_plan'}
          onDone={(r) => (r.type === 'course' ? course.retry() : router.push(hrefFor(r)))}
        />
        <p className="text-[11px] text-gray-500 mt-3">Uses this course&apos;s outline, modules, notes and ready materials.</p>
      </section>

      <GeneratedFrom filter={{ personalCourseId: id }} title="Lessons, quizzes and exams for this course" />
    </div>
  );
}

function ModuleItem({ courseId, module: m, onChanged }: { courseId: string; module: PersonalCourseDetail['modules'][number]; onChanged: () => void }) {
  const [notes, setNotes] = useState<string | null>(null);
  const [lessonRequest] = useState(newRequestId); // one lesson per click, even if retried
  const toggle = useAsyncAction(async () => {
    await setModuleDone(courseId, m.id, !m.isCompleted);
    onChanged();
  });
  const saveNotes = useAsyncAction(async (_signal: AbortSignal, text: string) => {
    await saveModuleNotes(courseId, m.id, text);
    setNotes(null);
    onChanged();
  });
  const router = useRouter();
  const lesson = useAsyncAction(async () => {
    const r = await generateLearning({ requestId: lessonRequest, kind: 'lesson', sourceType: 'module', sourceId: m.id, personalCourseId: courseId, moduleId: m.id });
    router.push(hrefFor(r));
  });
  const remove = useAsyncAction(async () => {
    if (!window.confirm(`Delete the module “${m.title}”?`)) return;
    await deleteModule(courseId, m.id);
    onChanged();
  });
  const error = toggle.error ?? saveNotes.error ?? remove.error ?? lesson.error;

  return (
    <li className={`${card} p-4 space-y-2`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 min-w-0 cursor-pointer">
          <input type="checkbox" checked={m.isCompleted} disabled={toggle.isPending} onChange={() => void toggle.run()} className="w-4 h-4 accent-[var(--color-brand-blue)]" />
          <span className={`text-sm font-semibold truncate ${m.isCompleted ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>{m.title}</span>
          {m.isCompleted && <Check className="w-3.5 h-3.5 text-emerald-500" aria-label="Done" />}
        </label>
        <div className="flex flex-wrap gap-1">
          <Button type="button" size="sm" variant="outline" isLoading={lesson.isPending} onClick={() => void lesson.run()}>
            Make a lesson
          </Button>
          {notes === null && (
            <Button type="button" size="sm" variant="outline" onClick={() => setNotes(m.notes)}>
              {m.notes ? 'Edit notes' : 'Add notes'}
            </Button>
          )}
          <button type="button" onClick={() => void remove.run()} disabled={remove.isPending} aria-label={`Delete module ${m.title}`} className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50">
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      {notes === null ? (
        m.notes && <p className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-line pl-6">{m.notes}</p>
      ) : (
        <form
          className="space-y-2 pl-6"
          onSubmit={(e) => {
            e.preventDefault();
            void saveNotes.run(notes);
          }}
        >
          <label className="block">
            <span className="sr-only">Notes for {m.title}</span>
            <textarea className={`${input} min-h-24`} value={notes} maxLength={20000} onChange={(e) => setNotes(e.target.value)} />
          </label>
          <div className="flex gap-2">
            <Button type="submit" size="sm" isLoading={saveNotes.isPending}>Save notes</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setNotes(null)} disabled={saveNotes.isPending}>Cancel</Button>
          </div>
        </form>
      )}
      {error && <ErrorState error={error} compact />}
    </li>
  );
}
