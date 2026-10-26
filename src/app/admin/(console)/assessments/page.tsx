'use client';

import React, { useState } from 'react';
import { ClipboardCheck, Pencil, Plus, Trash2, X } from 'lucide-react';
import { adminAssessmentsApi, type AdminAssessment, type AssessmentKind } from '@/lib/admin-api';
import { emptyQuestion, optionsOf, questionCount, toDraft, toInput, validateDraft, type AssessmentDraft } from '@/lib/admin-assessments';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { ADMIN_LOGIN_PATH } from '@/components/admin/AdminSessionProvider';
import { RequirePermission } from '@/components/admin/RequirePermission';

const card = 'bg-white dark:bg-[#111827] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs';
const input =
  'w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]';

const KINDS: { id: AssessmentKind; label: string; singular: string }[] = [
  { id: 'quizzes', label: 'Quizzes', singular: 'quiz' },
  { id: 'tests', label: 'Tests', singular: 'test' },
  { id: 'exams', label: 'Exams', singular: 'exam' },
];

/**
 * The quizzes, tests and exams learners take in /practice and /exams (tables `quizzes`, `tests`, `exams`).
 * Reads use the admin routes that include the answer key; learners never receive it. Requires content.manage.
 */
export default function AdminAssessmentsPage() {
  return (
    <RequirePermission permission="content.manage">
      <Assessments />
    </RequirePermission>
  );
}

function Assessments() {
  const [kind, setKind] = useState<AssessmentKind>('quizzes');
  const [editing, setEditing] = useState<{ id: string | null } | null>(null);
  const meta = KINDS.find((k) => k.id === kind)!;
  const list = useApiQuery((signal) => adminAssessmentsApi.list(kind, { signal }), [kind]);

  const remove = useAsyncAction(async (signal: AbortSignal, a: AdminAssessment) => {
    if (!window.confirm(`Delete “${a.title || 'Untitled'}”? Learners will no longer see it.`)) return;
    await adminAssessmentsApi.remove(kind, a.id, { signal });
    list.retry();
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Assessments</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          The quizzes, tests and exams learners take. Changes apply immediately. Learners see the questions and options, never the correct answers or explanations.
        </p>
      </div>

      <div role="tablist" aria-label="Assessment type" className="flex gap-1.5">
        {KINDS.map((k) => (
          <button
            key={k.id}
            type="button"
            role="tab"
            aria-selected={kind === k.id}
            onClick={() => {
              setKind(k.id);
              setEditing(null);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold ${kind === k.id ? 'bg-[var(--color-brand-blue)] text-white' : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800'}`}
          >
            {k.label}
          </button>
        ))}
      </div>

      {editing ? (
        <Editor
          key={`${kind}:${editing.id ?? 'new'}`}
          kind={kind}
          id={editing.id}
          singular={meta.singular}
          onDone={() => {
            setEditing(null);
            list.retry();
          }}
        />
      ) : (
        <>
          <Button type="button" size="sm" onClick={() => setEditing({ id: null })}>
            <Plus className="w-4 h-4" aria-hidden="true" /> New {meta.singular}
          </Button>
          {remove.error && <ErrorState error={remove.error} compact signInHref={ADMIN_LOGIN_PATH} />}
          {list.isLoading ? (
            <LoadingState label={`Loading ${meta.label.toLowerCase()}…`} />
          ) : list.error && !list.data ? (
            <ErrorState error={list.error} onRetry={list.retry} signInHref={ADMIN_LOGIN_PATH} />
          ) : (list.data ?? []).length === 0 ? (
            <EmptyState icon={ClipboardCheck} title={`No ${meta.label.toLowerCase()} yet`} description={`Create a ${meta.singular}; learners see it straight away.`} />
          ) : (
            <ul className="space-y-2">
              {(list.data ?? []).map((a) => (
                <li key={a.id} className={`${card} p-4 flex items-center justify-between gap-3`}>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{a.title || 'Untitled'}</p>
                    <p className="text-[11px] text-gray-500">
                      {questionCount(a)} question{questionCount(a) === 1 ? '' : 's'}
                      {typeof a.durationMinutes === 'number' && ` · ${a.durationMinutes} min`}
                      {a.updatedAt && ` · updated ${new Date(a.updatedAt).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button type="button" onClick={() => setEditing({ id: a.id })} aria-label={`Edit ${a.title || 'Untitled'}`} className="p-2 rounded-xl text-gray-400 hover:text-[var(--color-brand-blue)] hover:bg-blue-50 dark:hover:bg-blue-950/30">
                      <Pencil className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button type="button" disabled={remove.isPending} onClick={() => void remove.run(a)} aria-label={`Delete ${a.title || 'Untitled'}`} className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50">
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

function Editor({ kind, id, singular, onDone }: { kind: AssessmentKind; id: string | null; singular: string; onDone: () => void }) {
  const timed = kind !== 'quizzes';
  const existing = useApiQuery((signal) => adminAssessmentsApi.get(kind, id as string, { signal }), [kind, id], { enabled: id !== null });
  const [draft, setDraft] = useState<AssessmentDraft | null>(id === null ? toDraft(null) : null);
  const [errors, setErrors] = useState<string[]>([]);
  const d = draft ?? (existing.data ? toDraft(existing.data) : null);

  const save = useAsyncAction(async (signal: AbortSignal, value: AssessmentDraft) => {
    const body = toInput(value, timed);
    const res = id ? await adminAssessmentsApi.update(kind, id, body, { signal }) : await adminAssessmentsApi.create(kind, body, { signal });
    onDone();
    return res;
  });

  if (id !== null && !d) {
    if (existing.error) return <ErrorState error={existing.error} onRetry={existing.retry} signInHref={ADMIN_LOGIN_PATH} />;
    return <LoadingState layout="detail" label={`Loading ${singular}…`} />;
  }
  if (!d) return null;

  const set = (patch: Partial<AssessmentDraft>) => setDraft({ ...d, ...patch });
  const setQuestion = (i: number, patch: Partial<AssessmentDraft['questions'][number]>) => set({ questions: d.questions.map((q, j) => (j === i ? { ...q, ...patch } : q)) });

  return (
    <form
      className={`${card} p-5 space-y-5`}
      aria-label={id ? `Edit ${singular}` : `New ${singular}`}
      onSubmit={(e) => {
        e.preventDefault();
        const problems = validateDraft(d, timed);
        setErrors(problems);
        if (problems.length === 0) void save.run(d);
      }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-base font-extrabold text-gray-900 dark:text-white">{id ? `Edit ${singular}` : `New ${singular}`}</h2>
        <button type="button" onClick={onDone} aria-label="Close editor" className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block space-y-1 sm:col-span-2">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Title</span>
          <input className={input} value={d.title} maxLength={255} onChange={(e) => set({ title: e.target.value })} />
        </label>
        <label className="block space-y-1 sm:col-span-2">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Description (optional)</span>
          <input className={input} value={d.description} onChange={(e) => set({ description: e.target.value })} />
        </label>
        {timed && (
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Duration in minutes (optional)</span>
            <input className={input} inputMode="numeric" value={d.durationMinutes} onChange={(e) => set({ durationMinutes: e.target.value })} />
          </label>
        )}
      </div>

      <ol className="space-y-4">
        {d.questions.map((q, i) => {
          const opts = optionsOf(q);
          return (
            <li key={i} className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-3" aria-label={`Question ${i + 1}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500">Question {i + 1}</span>
                {d.questions.length > 1 && (
                  <button type="button" onClick={() => set({ questions: d.questions.filter((_, j) => j !== i) })} aria-label={`Remove question ${i + 1}`} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600">
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Question</span>
                <textarea className={input} value={q.question} onChange={(e) => setQuestion(i, { question: e.target.value })} />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Options (one per line)</span>
                <textarea className={`${input} min-h-24`} value={q.options} onChange={(e) => setQuestion(i, { options: e.target.value })} />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Correct option</span>
                <select className={input} value={opts.includes(q.correctAnswer) ? q.correctAnswer : ''} onChange={(e) => setQuestion(i, { correctAnswer: e.target.value })}>
                  <option value="">Choose…</option>
                  {opts.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Explanation (optional, never shown before submitting)</span>
                <input className={input} value={q.explanation} onChange={(e) => setQuestion(i, { explanation: e.target.value })} />
              </label>
            </li>
          );
        })}
      </ol>
      <Button type="button" size="sm" variant="outline" onClick={() => set({ questions: [...d.questions, emptyQuestion()] })}>
        <Plus className="w-4 h-4" aria-hidden="true" /> Add question
      </Button>

      {errors.length > 0 && (
        <Alert variant="error" title="Fix these before saving">
          <ul className="list-disc pl-4">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </Alert>
      )}
      {save.error && <ErrorState error={save.error} compact signInHref={ADMIN_LOGIN_PATH} />}
      <div className="flex gap-2">
        <Button type="submit" size="sm" isLoading={save.isPending}>{id ? 'Save changes' : `Create ${singular}`}</Button>
        <Button type="button" size="sm" variant="outline" onClick={onDone} disabled={save.isPending}>Cancel</Button>
      </div>
    </form>
  );
}
