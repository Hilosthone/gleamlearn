'use client';

import React from 'react';
import Link from 'next/link';
import { Compass } from 'lucide-react';
import { useApiQuery } from '@/hooks/useApiQuery';
import { ErrorState, LoadingState } from '@/components/ui/states';
import { isEmpty, loadNextSteps, type NextStep } from '@/lib/next-steps';

const SECTIONS: { key: 'topics' | 'quizzes' | 'revision' | 'exams'; title: string }[] = [
  { key: 'revision', title: 'Continue' },
  { key: 'topics', title: 'Topics to revise' },
  { key: 'quizzes', title: 'Practise' },
  { key: 'exams', title: 'Exams to try' },
];

/** Dashboard: what to study next, from the learner's own records (each with its reason). Hidden when there is nothing. */
export function NextSteps({ className = '' }: { className?: string }) {
  const steps = useApiQuery(() => loadNextSteps(), []);
  if (steps.isLoading) return <LoadingState rows={2} label="Finding what to study next…" />;
  if (steps.error?.kind === 'not_implemented') return null;
  if (steps.error && !steps.data) return <ErrorState error={steps.error} onRetry={steps.retry} compact />;
  const n = steps.data!;
  if (isEmpty(n)) return null; // a brand-new learner: nothing to suggest yet, and nothing is invented
  return (
    <section className={`bg-white dark:bg-[#111827] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs p-6 space-y-4 ${className}`} aria-labelledby="next-steps">
      <h2 id="next-steps" className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <Compass className="w-4 h-4 text-[var(--color-brand-blue)]" aria-hidden="true" /> What to study next
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SECTIONS.filter((s) => n[s.key].length).map((s) => (
          <div key={s.key} className="space-y-2 min-w-0">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">{s.title}</h3>
            <ul className="space-y-2">
              {n[s.key].slice(0, 3).map((x: NextStep, i) => (
                <li key={`${x.type}-${x.id ?? i}`}>
                  <Link href={x.href} className="block rounded-2xl border border-gray-200 dark:border-gray-800 p-3 hover:border-[var(--color-brand-blue)]">
                    <span className="block text-sm font-semibold text-gray-900 dark:text-white break-words">{x.title}</span>
                    {x.reason && <span className="block text-[11px] text-gray-500 break-words">{x.reason}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
