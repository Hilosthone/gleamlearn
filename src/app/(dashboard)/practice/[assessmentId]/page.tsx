'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Clock, Trash2, XCircle } from 'lucide-react';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { ErrorState, LoadingState } from '@/components/ui/states';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { invalidateLearnerStats } from '@/lib/learning';
import {
  deleteLearnerAssessment,
  formatClock,
  loadAttempts,
  loadLearnerAssessment,
  saveAnswers,
  secondsLeft,
  sourceLinks,
  startAttempt,
  submitAttempt,
  type AttemptView,
} from '@/lib/self-learning';

const card = 'bg-white dark:bg-[#111827] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs';

/** A learner-generated quiz or mock exam: start or resume, answer (saved as you go), submit, then review. */
export default function TakeLearnerAssessmentPage() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const router = useRouter();
  const assessment = useApiQuery(() => loadLearnerAssessment(assessmentId), [assessmentId]);
  const history = useApiQuery(() => loadAttempts(assessmentId), [assessmentId]);
  const [view, setView] = useState<AttemptView | null>(null);

  const start = useAsyncAction(async () => setView(await startAttempt(assessmentId)));
  const remove = useAsyncAction(async () => {
    if (!window.confirm('Delete this and all its attempts?')) return;
    await deleteLearnerAssessment(assessmentId);
    router.push('/practice');
  });

  const a = assessment.data;
  const back = (
    <Link href={a?.kind === 'exam' ? '/exams' : '/practice'} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-brand-blue)] hover:underline">
      <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> {a?.kind === 'exam' ? 'Exams' : 'Practice'}
    </Link>
  );

  if (view) return <div className="space-y-6 pb-12">{back}<Attempt initial={view} /></div>;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 max-w-3xl">
      {back}
      {assessment.isLoading ? (
        <LoadingState layout="detail" label="Loading…" />
      ) : assessment.error && !a ? (
        <ErrorState error={assessment.error} onRetry={assessment.retry} />
      ) : a ? (
        <section className={`${card} p-5 sm:p-8 space-y-4`} aria-labelledby="assessment-title">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">{a.kind === 'exam' ? 'Mock exam' : 'Quiz'}{a.examType && ` · ${a.examType}`}</p>
          <h1 id="assessment-title" className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white break-words">{a.title}</h1>
          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <li>{a.questionCount} questions{a.requestedCount > a.questionCount && ` (${a.requestedCount} were requested; only ${a.questionCount} usable ones were produced)`}</li>
            {a.durationMinutes && <li className="flex items-center gap-1.5"><Clock className="w-4 h-4" aria-hidden="true" /> {a.durationMinutes} minutes, submitted automatically when time is up</li>}
            <li>{a.feedbackMode === 'immediate' ? 'Each answer is checked as you go.' : 'Answers and explanations are shown after you submit.'}</li>
            {a.difficulty && <li>Difficulty: {a.difficulty}</li>}
          </ul>
          <Alert variant="info">{a.notice || 'AI-generated practice questions — not official past questions.'}</Alert>
          {a.truncated && <Alert variant="warning">Your material was long, so only its first part was used.</Alert>}
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="success" isLoading={start.isPending} onClick={() => void start.run()}>
              {a.inProgressAttemptId ? 'Resume' : a.attemptCount ? 'Try again' : 'Start'}
            </Button>
            <Button type="button" variant="outline" size="sm" isLoading={remove.isPending} onClick={() => void remove.run()}>
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" /> Delete
            </Button>
          </div>
          {(start.error || remove.error) && <ErrorState error={(start.error ?? remove.error)!} compact />}
          {sourceLinks(a).length > 0 && (
            <p className="text-xs text-gray-500 flex flex-wrap gap-3">
              {sourceLinks(a).map((l) => (
                <Link key={l.href} href={l.href} className="text-[var(--color-brand-blue)] hover:underline">{l.label}</Link>
              ))}
            </p>
          )}
          {(history.data ?? []).some((t) => t.status === 'submitted') && (
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Previous attempts</h2>
              <ul className="space-y-1">
                {(history.data ?? []).filter((t) => t.status === 'submitted').map((t) => (
                  <li key={t.id}>
                    <Link href={`/practice/attempts/${encodeURIComponent(t.id)}`} className="text-sm text-[var(--color-brand-blue)] hover:underline">
                      {t.score}% · {t.submittedAt ? new Date(t.submittedAt).toLocaleString() : ''}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}

function Attempt({ initial }: { initial: AttemptView }) {
  const router = useRouter();
  const [view, setView] = useState(initial);
  const [answers, setAnswers] = useState<Record<string, string>>(initial.answers);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const pending = useRef<Record<string, string>>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const a = view.assessment;
  const attemptId = view.attempt.id;

  const flush = async () => {
    const batch = pending.current;
    pending.current = {};
    if (!Object.keys(batch).length) return;
    try {
      const v = await saveAnswers(attemptId, batch);
      setView(v);
      setSaved(true);
      setSaveError(null);
    } catch {
      pending.current = { ...batch, ...pending.current }; // keep them for the next save or the submit
      setSaveError('Your latest answers could not be saved yet. They will be sent when you submit.');
    }
  };

  const choose = (index: number, option: string) => {
    setAnswers((prev) => ({ ...prev, [index]: option }));
    pending.current[String(index)] = option;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void flush(), a.feedbackMode === 'immediate' ? 150 : 700);
  };

  const submit = useAsyncAction(async (_signal: AbortSignal, auto: boolean) => {
    if (timer.current) clearTimeout(timer.current);
    if (!auto) {
      const unanswered = a.questions.length - Object.keys(answers).length;
      if (unanswered > 0 && !window.confirm(`${unanswered} question${unanswered === 1 ? ' is' : 's are'} unanswered. Submit anyway?`)) return;
    }
    const done = await submitAttempt(attemptId, answers);
    invalidateLearnerStats(); // a submission counts towards today's streak
    router.push(`/practice/attempts/${encodeURIComponent(done.attempt.id)}`);
  });

  // countdown for timed mock exams; submitted automatically at zero
  const [left, setLeft] = useState(() => secondsLeft(view.attempt.deadlineAt));
  const submittedRef = useRef(false);
  const { run: runSubmit } = submit;
  useEffect(() => {
    if (!view.attempt.deadlineAt) return;
    const t = setInterval(() => {
      const s = secondsLeft(view.attempt.deadlineAt);
      setLeft(s);
      if (s === 0 && !submittedRef.current) {
        submittedRef.current = true;
        void runSubmit(true);
      }
    }, 1000);
    return () => clearInterval(t);
  }, [view.attempt.deadlineAt, runSubmit]);

  const checked = new Map(view.checked.map((c) => [c.index, c]));
  const answered = Object.keys(answers).length;

  return (
    <div className="space-y-4 max-w-3xl">
      <div className={`${card} p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 sticky top-2 z-10`}>
        <div className="min-w-0">
          <h1 className="text-base font-extrabold text-gray-900 dark:text-white truncate">{a.title}</h1>
          <p className="text-xs text-gray-500" aria-live="polite">
            {answered} of {a.questions.length} answered{saved ? ' · saved' : ''}
          </p>
        </div>
        {left !== null && (
          <p className={`text-sm font-black tabular-nums flex items-center gap-1.5 ${left < 60 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`} role="timer" aria-label="Time left">
            <Clock className="w-4 h-4" aria-hidden="true" /> {formatClock(left)}
          </p>
        )}
      </div>
      {saveError && <Alert variant="warning">{saveError}</Alert>}
      <ol className="space-y-4">
        {a.questions.map((q) => {
          const c = checked.get(q.index);
          return (
            <li key={q.index} className={`${card} p-4 sm:p-6 space-y-3`}>
              <fieldset>
                <legend className="text-sm font-bold text-gray-900 dark:text-white break-words">
                  {q.index + 1}. {q.question}
                </legend>
                <div className="mt-3 space-y-2">
                  {q.options.map((o) => (
                    <label key={o} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer text-sm min-h-11 ${answers[q.index] === o ? 'border-[var(--color-brand-blue)] bg-blue-50/60 dark:bg-blue-950/30' : 'border-gray-200 dark:border-gray-800'}`}>
                      <input type="radio" name={`q${q.index}`} value={o} checked={answers[q.index] === o} disabled={!!c} onChange={() => choose(q.index, o)} className="mt-0.5 accent-[var(--color-brand-blue)]" />
                      <span className="break-words">{o}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              {c && (
                <div className={`text-xs p-3 rounded-xl ${c.correct ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300'}`} role="status">
                  <p className="font-bold flex items-center gap-1.5">
                    {c.correct ? <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> : <XCircle className="w-4 h-4" aria-hidden="true" />}
                    {c.correct ? 'Correct' : `Not quite — the answer is “${c.answer}”`}
                  </p>
                  {c.explanation && <p className="mt-1">{c.explanation}</p>}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      {submit.error && <ErrorState error={submit.error} compact />}
      <Button type="button" variant="success" isLoading={submit.isPending} onClick={() => void submit.run(false)}>
        Submit answers
      </Button>
    </div>
  );
}
