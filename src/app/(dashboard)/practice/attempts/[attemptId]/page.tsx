'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { useApiQuery } from '@/hooks/useApiQuery';
import { ErrorState, LoadingState } from '@/components/ui/states';
import { Alert } from '@/components/ui/Alert';
import { loadAttempt, sourceLinks } from '@/lib/self-learning';

const card = 'bg-white dark:bg-[#111827] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs';

/** The review of a submitted attempt: score, strengths, topics to revise, every question with its explanation. */
export default function AttemptReviewPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const data = useApiQuery(() => loadAttempt(attemptId), [attemptId]);
  const v = data.data;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 max-w-3xl">
      <Link href={v ? `/practice/${encodeURIComponent(v.assessment.id)}` : '/practice'} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-brand-blue)] hover:underline">
        <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> Back
      </Link>
      {data.isLoading ? (
        <LoadingState layout="detail" label="Loading your result…" />
      ) : data.error && !v ? (
        <ErrorState error={data.error} onRetry={data.retry} />
      ) : v && v.attempt.status !== 'submitted' ? (
        <Alert variant="info">
          This attempt is still in progress. <Link className="underline" href={`/practice/${encodeURIComponent(v.assessment.id)}`}>Continue it</Link>.
        </Alert>
      ) : v && v.review ? (
        <>
          <section className={`${card} p-5 sm:p-8 space-y-3`} aria-labelledby="result-title">
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">{v.assessment.kind === 'exam' ? 'Mock exam result' : 'Quiz result'}</p>
            <h1 id="result-title" className="text-xl font-extrabold text-gray-900 dark:text-white break-words">{v.assessment.title}</h1>
            <p className="text-4xl font-black text-gray-900 dark:text-white">{v.attempt.score}%</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {v.attempt.correctCount} of {v.attempt.totalQuestions} correct
              {v.attempt.submittedAt && ` · ${new Date(v.attempt.submittedAt).toLocaleString()}`}
            </p>
            {v.attempt.autoSubmitted && <Alert variant="info">Time ran out, so your saved answers were submitted automatically.</Alert>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30">
                <h2 className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Strengths</h2>
                <p className="text-sm text-emerald-900 dark:text-emerald-200">{v.review.strengths.length ? v.review.strengths.join(', ') : 'None yet'}</p>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30">
                <h2 className="text-xs font-bold text-amber-800 dark:text-amber-300">To revise</h2>
                <p className="text-sm text-amber-900 dark:text-amber-200">{v.review.toRevise.length ? v.review.toRevise.join(', ') : 'Nothing — well done'}</p>
              </div>
            </div>
            {sourceLinks(v.assessment).length > 0 && (
              <p className="text-xs flex flex-wrap gap-3">
                {sourceLinks(v.assessment).map((l) => (
                  <Link key={l.href} href={l.href} className="font-semibold text-[var(--color-brand-blue)] hover:underline">{l.label}</Link>
                ))}
                <Link href={`/practice/${encodeURIComponent(v.assessment.id)}`} className="font-semibold text-[var(--color-brand-blue)] hover:underline">Try again</Link>
              </p>
            )}
          </section>
          <ol className="space-y-3" aria-label="Your answers">
            {v.review.questions.map((q) => (
              <li key={q.index} className={`${card} p-4 sm:p-5 space-y-2`}>
                <p className="text-sm font-bold text-gray-900 dark:text-white flex items-start gap-2 break-words">
                  {q.correct ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-label="Correct" /> : <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" aria-label="Incorrect" />}
                  {q.index + 1}. {q.question}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300">Your answer: {q.chosen ?? 'not answered'}</p>
                {!q.correct && <p className="text-xs text-emerald-700 dark:text-emerald-400">Correct answer: {q.answer}</p>}
                {q.explanation && <p className="text-xs text-gray-600 dark:text-gray-400">{q.explanation}</p>}
                {q.topic && <p className="text-[10px] uppercase tracking-wider text-gray-400">{q.topic}</p>}
              </li>
            ))}
          </ol>
        </>
      ) : null}
    </div>
  );
}
