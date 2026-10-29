'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { useApiQuery } from '@/hooks/useApiQuery';
import { ErrorState, LoadingState } from '@/components/ui/states';
import { Alert } from '@/components/ui/Alert';
import { loadOfficialAttempt, type AssessmentKind } from '@/lib/practice';

const card = 'bg-white dark:bg-[#111827] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs';
const KINDS: AssessmentKind[] = ['quiz', 'test', 'exam'];

/** Review of one of the learner's own submitted attempts at an official quiz, test or exam. */
export default function OfficialAttemptPage() {
  const { kind: rawKind, attemptId } = useParams<{ kind: string; attemptId: string }>();
  const kind = (KINDS as string[]).includes(rawKind) ? (rawKind as AssessmentKind) : null;
  const res = useApiQuery(() => (kind ? loadOfficialAttempt(kind, attemptId) : Promise.reject(new Error('Unknown kind of assessment.'))), [kind, attemptId]);
  const back = (
    <Link href={kind === 'exam' ? '/exams' : '/practice'} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-brand-blue)] hover:underline">
      <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> {kind === 'exam' ? 'Exams' : 'Practice'}
    </Link>
  );
  if (res.isLoading) return <div className="space-y-4">{back}<LoadingState layout="detail" label="Loading your result…" /></div>;
  if (res.error && !res.data) return <div className="space-y-4">{back}<ErrorState error={res.error} onRetry={res.retry} /></div>;
  const a = res.data!;

  return (
    <div className="space-y-6 pb-12 max-w-3xl animate-in fade-in duration-300">
      {back}
      <section className={`${card} p-5 sm:p-8 space-y-3`} aria-labelledby="result-title">
        <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">{a.kind} result</p>
        <h1 id="result-title" className="text-xl font-extrabold text-gray-900 dark:text-white break-words">{a.title}</h1>
        {a.status !== 'submitted' ? (
          <Alert variant="info">This attempt is still in progress.</Alert>
        ) : (
          <>
            <p className="text-4xl font-black text-gray-900 dark:text-white">{a.graded ? `${a.score}%` : 'Not graded'}</p>
            <p className="text-xs text-gray-500">
              {a.graded ? `${a.correctCount} of ${a.gradableCount} graded questions correct` : 'This assessment has no answer key to grade against'}
              {a.submittedAt ? ` · submitted ${new Date(a.submittedAt).toLocaleString()}` : ''}
            </p>
          </>
        )}
        {a.review && a.review.topics.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-2">By topic</h2>
            <ul className="space-y-1.5" aria-label="Score by topic">
              {a.review.topics.map((t) => (
                <li key={t.topic} className="text-xs">
                  <div className="flex justify-between gap-2"><span className="font-semibold text-gray-800 dark:text-gray-200">{t.topic}</span><span className="text-gray-500">{t.correct}/{t.total} · {t.percent}%</span></div>
                  <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden" aria-hidden="true"><div className={`h-full ${t.percent >= 70 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${t.percent}%` }} /></div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {a.review && (
        <ol className="space-y-3" aria-label="Questions">
          {a.review.questions.map((q) => (
            <li key={q.index} className={`${card} p-4 sm:p-5 space-y-2`}>
              <p className="text-sm font-bold text-gray-900 dark:text-white break-words">{q.index + 1}. {q.question}</p>
              {q.gradable ? (
                <p className={`text-xs font-semibold flex items-center gap-1.5 ${q.correct ? 'text-emerald-600' : 'text-red-600'}`}>
                  {q.correct ? <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> : <XCircle className="w-4 h-4" aria-hidden="true" />}
                  {q.correct ? 'Correct' : q.chosen ? `Your answer: ${q.chosen} · correct answer: ${q.answer}` : `Not answered · correct answer: ${q.answer}`}
                </p>
              ) : (
                <p className="text-xs text-gray-500">Not graded (no answer key){q.chosen ? ` · your answer: ${q.chosen}` : ''}</p>
              )}
              {q.explanation && <p className="text-xs text-gray-600 dark:text-gray-300">{q.explanation}</p>}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
