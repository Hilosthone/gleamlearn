'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, MessageCircleQuestion, Send } from 'lucide-react';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { ErrorState, SlowNotice } from '@/components/ui/states';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Blocks } from '@/components/learning/Blocks';
import { askAboutStep, type VisualLesson } from '@/lib/visual-lesson';
import { VisualView } from './VisualView';

const input =
  'w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600';

/** A visual lesson, one step at a time: explanation, its visual (3D or 2D), and follow-up questions to the AI tutor. */
export function VisualLessonView({ lesson, onFinished }: { lesson: VisualLesson; onFinished?: () => void }) {
  const [i, setI] = useState(0);
  const [question, setQuestion] = useState('');
  const [answers, setAnswers] = useState<Record<number, { q: string; a: string }[]>>({});
  const step = lesson.steps[i];
  const last = i === lesson.steps.length - 1;

  const ask = useAsyncAction(async (_signal: AbortSignal, q: string) => {
    const a = await askAboutStep(lesson, step, q);
    setAnswers((prev) => ({ ...prev, [i]: [...(prev[i] ?? []), { q, a }] }));
    setQuestion('');
    return a;
  });

  return (
    <div className="space-y-5">
      {lesson.basis === 'topic' && <Alert variant="info">Made by AI from general knowledge about this topic, not from your own material. Check important facts with your textbook or teacher.</Alert>}
      {lesson.summary && <p className="text-sm text-gray-700 dark:text-gray-300">{lesson.summary}</p>}

      <nav aria-label="Lesson steps" className="flex flex-wrap gap-1.5">
        {lesson.steps.map((s, n) => (
          <button
            key={n}
            type="button"
            onClick={() => setI(n)}
            aria-current={n === i ? 'step' : undefined}
            aria-label={`Step ${n + 1}: ${s.title}`}
            className={`min-w-9 h-9 px-2 rounded-xl text-xs font-bold ${n === i ? 'bg-purple-600 text-white' : n < i ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
          >
            {n + 1}
          </button>
        ))}
      </nav>

      <section aria-labelledby="step-title" className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        <div className="space-y-3 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-purple-600">Step {i + 1} of {lesson.steps.length}</p>
          <h2 id="step-title" className="text-lg font-extrabold text-gray-900 dark:text-white break-words">{step.title}</h2>
          <Blocks markdown={step.explanation} />
        </div>
        <div className="min-w-0">{step.visual ? <VisualView key={i} visual={step.visual} /> : <p className="text-xs text-gray-500 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900">This step is explained in words only.</p>}</div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button type="button" size="sm" variant="outline" disabled={i === 0} onClick={() => setI(i - 1)}>
          <ChevronLeft className="w-4 h-4" aria-hidden="true" /> Previous
        </Button>
        {last ? (
          onFinished && (
            <Button type="button" size="sm" variant="success" onClick={onFinished}>
              Finish the lesson
            </Button>
          )
        ) : (
          <Button type="button" size="sm" variant="purple" onClick={() => setI(i + 1)}>
            Next <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Button>
        )}
      </div>

      <section aria-label="Ask about this step" className="space-y-2 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
        <h3 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
          <MessageCircleQuestion className="w-4 h-4 text-purple-600" aria-hidden="true" /> Ask the AI tutor about this step
        </h3>
        {(answers[i] ?? []).map((x, n) => (
          <div key={n} className="space-y-1">
            <p className="text-xs font-semibold text-gray-900 dark:text-white">You: {x.q}</p>
            <div className="text-sm p-3 rounded-xl bg-gray-50 dark:bg-gray-900">
              <Blocks markdown={x.a} />
            </div>
          </div>
        ))}
        {ask.isSlow && <SlowNotice message="The tutor is still thinking. No need to resend." />}
        {ask.error && <ErrorState error={ask.error} compact />}
        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (question.trim() && !ask.isPending) void ask.run(question.trim());
          }}
        >
          <label className="flex-1">
            <span className="sr-only">Your question</span>
            <textarea rows={2} maxLength={2000} className={`${input} resize-none`} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="e.g. Why is the molecule bent?" />
          </label>
          <Button type="submit" size="sm" variant="purple" isLoading={ask.isPending} disabled={!question.trim()}>
            <Send className="w-4 h-4" aria-hidden="true" /> Ask
          </Button>
        </form>
      </section>

      {last && lesson.keyTakeaways.length > 0 && (
        <section aria-label="Key takeaways" className="rounded-2xl bg-purple-50 dark:bg-purple-950/30 p-4">
          <h3 className="text-sm font-extrabold text-gray-900 dark:text-white mb-2">Key takeaways</h3>
          <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300 space-y-1">
            {lesson.keyTakeaways.map((k, n) => (
              <li key={n}>{k}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
