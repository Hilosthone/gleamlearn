// src/app/admin/(console)/question-bank/page.tsx
'use client';

import React, { useState } from 'react';
import { Flag, Library, Pencil, Plus, Trash2 } from 'lucide-react';
import { adminModerationApi, adminQuestionBankApi, type BankQuestion, type BankQuestionInput } from '@/lib/admin-api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ADMIN_LOGIN_PATH } from '@/components/admin/AdminSessionProvider';
import { RequirePermission } from '@/components/admin/RequirePermission';
import { PageHeader, Pager, TabBar, adminCard, adminInput, useAdminTabs } from '@/components/admin/ui';

const EXAMS = ['JAMB', 'WAEC', 'NECO', 'Post-UTME', 'GCE', 'BECE', 'University'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];

/**
 * The shared question bank: the `questions` table learners practise from (Past questions → Question bank, and the
 * official assessments' sources). Changes here are visible to learners immediately. Requires content.manage.
 */
export default function AdminQuestionBankPage() {
  return (
    <RequirePermission permission="content.manage">
      <QuestionBank />
    </RequirePermission>
  );
}

function QuestionBank() {
  const tabs = useAdminTabs([
    { id: 'bank', label: 'Question bank' },
    { id: 'reported', label: 'Reported by learners', permission: 'moderation.manage' },
  ]);
  return (
    <div className="space-y-6">
      <PageHeader title="Question bank" description="The questions learners practise from. Edits are live for learners as soon as you save." />
      <TabBar label="Question bank sections" tabs={tabs.visible} active={tabs.active} onSelect={tabs.select} />
      <div role="tabpanel">{tabs.active === 'reported' ? <Reported /> : <Bank />}</div>
    </div>
  );
}

type Draft = { [K in keyof BankQuestionInput]-?: string } & { optionsText: string };
const emptyDraft: Draft = { questionText: '', optionsText: '', correctAnswer: '', explanation: '', subject: '', topic: '', examination: 'JAMB', year: '', difficulty: 'medium', type: 'objective', source: '', options: '' };

const draftOf = (q: BankQuestion): Draft => ({
  ...emptyDraft,
  questionText: q.questionText,
  optionsText: (q.options ?? []).join('\n'),
  correctAnswer: q.correctAnswer,
  explanation: q.explanation ?? '',
  subject: q.subject ?? '',
  topic: q.topic ?? '',
  examination: q.examination ?? '',
  year: q.year ? String(q.year) : '',
  difficulty: q.difficulty ?? '',
  type: q.type ?? 'objective',
  source: q.source ?? '',
});

/** The backend's DTO; an error message instead when the draft is incomplete. */
function questionPayload(d: Draft): { input: BankQuestionInput } | { error: string } {
  const questionText = d.questionText.trim();
  const options = d.optionsText.split('\n').map((o) => o.trim()).filter(Boolean);
  const correctAnswer = d.correctAnswer.trim();
  if (!questionText) return { error: 'Write the question.' };
  if (!correctAnswer) return { error: 'Give the correct answer.' };
  if (options.length === 1) return { error: 'Give at least two options, or none for a written-answer question.' };
  if (options.length && !options.includes(correctAnswer) && !/^[A-Z]$/i.test(correctAnswer)) return { error: 'The correct answer must be one of the options (or its letter, e.g. B).' };
  const year = d.year.trim() ? Number(d.year) : null;
  if (year !== null && (!Number.isInteger(year) || year < 1950 || year > 2100)) return { error: 'The year must be a four-digit year.' };
  const opt = (v: string) => (v.trim() ? v.trim() : null);
  return {
    input: {
      questionText,
      options,
      correctAnswer,
      explanation: opt(d.explanation),
      subject: opt(d.subject),
      topic: opt(d.topic),
      examination: opt(d.examination),
      year,
      difficulty: opt(d.difficulty),
      type: options.length ? 'objective' : 'theory',
      source: opt(d.source),
    },
  };
}

function Editor({ question, onDone }: { question: BankQuestion | null; onDone: (saved: boolean) => void }) {
  const [d, setD] = useState<Draft>(() => (question ? draftOf(question) : emptyDraft));
  const [invalid, setInvalid] = useState<string | null>(null);
  const save = useAsyncAction(async (signal: AbortSignal) => {
    const res = questionPayload(d);
    if ('error' in res) return setInvalid(res.error);
    setInvalid(null);
    await (question ? adminQuestionBankApi.update(question.id, res.input, { signal }) : adminQuestionBankApi.create(res.input, { signal }));
    onDone(true);
  });
  const field = (k: keyof Draft, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="block space-y-1">
      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{label}</span>
      <input className={adminInput} value={d[k]} onChange={(e) => setD({ ...d, [k]: e.target.value })} {...props} />
    </label>
  );
  return (
    <form className={`${adminCard} p-5 space-y-3`} aria-label={question ? 'Edit question' : 'New question'} onSubmit={(e) => { e.preventDefault(); void save.run(); }}>
      <label className="block space-y-1">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Question</span>
        <textarea className={`${adminInput} min-h-20`} value={d.questionText} maxLength={5000} onChange={(e) => setD({ ...d, questionText: e.target.value })} />
      </label>
      <label className="block space-y-1">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Options (one per line; leave empty for a written answer)</span>
        <textarea className={`${adminInput} min-h-24`} value={d.optionsText} onChange={(e) => setD({ ...d, optionsText: e.target.value })} />
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {field('correctAnswer', 'Correct answer (option text or letter)', { maxLength: 2000 })}
        {field('explanation', 'Explanation (optional)', { maxLength: 5000 })}
        {field('subject', 'Subject', { maxLength: 120 })}
        {field('topic', 'Topic', { maxLength: 120 })}
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Examination</span>
          <select className={adminInput} value={d.examination} onChange={(e) => setD({ ...d, examination: e.target.value })}>
            <option value="">None</option>
            {[...new Set([...EXAMS, d.examination].filter(Boolean))].map((x) => (
              <option key={x} value={x}>{x}</option>
            ))}
          </select>
        </label>
        {field('year', 'Year (optional)', { inputMode: 'numeric', maxLength: 4 })}
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Difficulty</span>
          <select className={adminInput} value={d.difficulty} onChange={(e) => setD({ ...d, difficulty: e.target.value })}>
            <option value="">Not set</option>
            {DIFFICULTIES.map((x) => (
              <option key={x} value={x}>{x}</option>
            ))}
          </select>
        </label>
        {field('source', 'Source (optional)', { maxLength: 200 })}
      </div>
      {invalid && <p role="alert" className="text-xs text-red-600">{invalid}</p>}
      {save.error && <ErrorState error={save.error} compact signInHref={ADMIN_LOGIN_PATH} />}
      <div className="flex gap-2">
        <Button type="submit" size="sm" isLoading={save.isPending}>{question ? 'Save question' : 'Add question'}</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => onDone(false)} disabled={save.isPending}>Cancel</Button>
      </div>
    </form>
  );
}

function Bank() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [applied, setApplied] = useState({ search: '', subject: '', examination: '' });
  const [subject, setSubject] = useState('');
  const [exam, setExam] = useState('');
  const [editing, setEditing] = useState<BankQuestion | 'new' | null>(null);
  const [deleting, setDeleting] = useState<BankQuestion | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const list = useApiQuery((signal) => adminQuestionBankApi.list({ page, ...applied }, { signal }), [page, applied.search, applied.subject, applied.examination]);
  const remove = useAsyncAction(async (signal: AbortSignal) => {
    if (!deleting) return;
    await adminQuestionBankApi.remove(deleting.id, { signal });
    setDeleting(null);
    setNotice('Question deleted.');
    list.retry();
  });
  const items = list.data?.data.questions ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2 justify-between">
        <form className="flex flex-wrap items-end gap-2" aria-label="Search questions" onSubmit={(e) => { e.preventDefault(); setPage(1); setApplied({ search, subject, examination: exam }); }}>
          <input className={`${adminInput} w-56`} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search question, topic or subject" aria-label="Search" />
          <input className={`${adminInput} w-36`} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" aria-label="Subject" />
          <select className={`${adminInput} w-36`} value={exam} onChange={(e) => setExam(e.target.value)} aria-label="Examination">
            <option value="">Any exam</option>
            {EXAMS.map((x) => (
              <option key={x} value={x}>{x}</option>
            ))}
          </select>
          <Button type="submit" size="sm" variant="outline">Search</Button>
        </form>
        {!editing && (
          <Button type="button" size="sm" onClick={() => { setNotice(null); setEditing('new'); }}>
            <Plus className="w-4 h-4" aria-hidden="true" /> New question
          </Button>
        )}
      </div>
      {notice && <Alert variant="success">{notice}</Alert>}
      {editing === 'new' && <Editor question={null} onDone={(saved) => { setEditing(null); if (saved) { setNotice('Question added.'); list.retry(); } }} />}
      {list.isLoading ? (
        <LoadingState label="Loading questions…" />
      ) : list.error ? (
        <ErrorState error={list.error} onRetry={list.retry} signInHref={ADMIN_LOGIN_PATH} />
      ) : !items.length ? (
        <EmptyState icon={Library} title="No questions found" description={applied.search || applied.subject || applied.examination ? 'Try other filters.' : 'Add the first question to the bank.'} />
      ) : (
        <ul className="space-y-2" aria-label="Questions">
          {items.map((q) =>
            editing !== 'new' && editing?.id === q.id ? (
              <li key={q.id}>
                <Editor question={q} onDone={(saved) => { setEditing(null); if (saved) { setNotice('Question saved.'); list.retry(); } }} />
              </li>
            ) : (
              <li key={q.id} className={`${adminCard} p-4 space-y-1.5`}>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white whitespace-pre-line break-words min-w-0">{q.questionText}</p>
                  <div className="flex shrink-0">
                    <button type="button" aria-label="Edit question" onClick={() => { setNotice(null); setEditing(q); }} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"><Pencil className="w-4 h-4" aria-hidden="true" /></button>
                    <button type="button" aria-label="Delete question" onClick={() => { remove.reset(); setDeleting(q); }} className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"><Trash2 className="w-4 h-4" aria-hidden="true" /></button>
                  </div>
                </div>
                {!!q.options?.length && (
                  <ol className="text-xs text-gray-600 dark:text-gray-300 list-[upper-alpha] pl-5">
                    {q.options.map((o, i) => (
                      <li key={i} className={o === q.correctAnswer || String.fromCharCode(65 + i) === q.correctAnswer.toUpperCase() ? 'font-bold text-emerald-700 dark:text-emerald-400' : ''}>{o}</li>
                    ))}
                  </ol>
                )}
                <p className="text-[11px] text-gray-500">{[q.examination, q.subject, q.topic, q.year, q.difficulty].filter(Boolean).join(' · ') || 'No subject'} · answer: {q.correctAnswer}</p>
              </li>
            ),
          )}
        </ul>
      )}
      <Pager pagination={list.data?.data.pagination} onPage={setPage} />
      <ConfirmDialog
        open={deleting !== null}
        title="Delete this question?"
        description="It is removed from the bank for every learner. This cannot be undone."
        confirmLabel="Delete question"
        isPending={remove.isPending}
        error={remove.error ? <ErrorState error={remove.error} compact signInHref={ADMIN_LOGIN_PATH} /> : undefined}
        onConfirm={() => void remove.run()}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

/** Pending learner reports about questions (from Past questions and the bank); resolved in Reports & moderation. */
function Reported() {
  const q = useApiQuery((signal) => adminModerationApi.listReports({ status: 'PENDING' }, { signal }), []);
  if (q.isLoading) return <LoadingState label="Loading reports…" />;
  if (q.error) return <ErrorState error={q.error} onRetry={q.retry} signInHref={ADMIN_LOGIN_PATH} />;
  const items = (q.data?.data.reports ?? []).filter((r) => r.reportedItemType === 'QUESTION');
  if (!items.length) return <EmptyState icon={Flag} title="No pending question reports" description="Learners can report a question from Practice → Past questions." />;
  return (
    <ul className="space-y-2" aria-label="Question reports">
      {items.map((r) => (
        <li key={r.id} className={`${adminCard} p-4 space-y-1`}>
          <p className="text-sm font-bold text-gray-900 dark:text-white">{r.description || r.reason}</p>
          <p className="text-[11px] text-gray-500 break-all">Question {r.reportedItemId} · {r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}</p>
          <a href="/admin/moderation" className="text-xs font-semibold text-[var(--color-brand-blue)] hover:underline">Resolve in Reports &amp; moderation</a>
        </li>
      ))}
    </ul>
  );
}
