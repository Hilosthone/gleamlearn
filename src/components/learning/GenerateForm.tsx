'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { ErrorState, SlowNotice } from '@/components/ui/states';
import { Button } from '@/components/ui/Button';
import { useOptionalLearnerSession } from '@/components/auth/LearnerSessionProvider';
import { DEFAULT_KINDS, EXAM_GOALS, KINDS, generateLearning, hrefFor, kindInfo, newRequestId, type GenerateResult, type LearningKind, type LearningSourceType } from '@/lib/self-learning';

const input =
  'w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]';

export interface GenerateSource {
  sourceType: LearningSourceType;
  sourceId?: string;
  text?: string;
  title?: string;
}

interface Props {
  source: GenerateSource;
  personalCourseId?: string;
  moduleId?: string;
  defaultKind?: LearningKind;
  /** Limit the choices (e.g. only quiz on the Practice page). */
  kinds?: LearningKind[];
  /** Called instead of opening the result. */
  onDone?: (r: GenerateResult) => void;
  submitLabel?: string;
  /** Rendered with the form's own label, e.g. "Generate from Biology.pdf". */
  heading?: string;
}

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

/** Profile defaults the learner can change: class / level and the first exam named in their goals. */
function profileDefaults(user: Record<string, unknown> | undefined) {
  const level = str(user?.level) || str(user?.secondaryClass) || str(user?.levelOrClass);
  const goals = str(user?.examAimOrGoals);
  const examGoal = EXAM_GOALS.find((g) => new RegExp(`\\b${g.replace('-', '[- ]?')}\\b`, 'i').test(goals)) ?? '';
  return { level, examGoal };
}

/**
 * Choose what to generate from a source (lesson, summary, notes, flashcards, quiz, mock exam, study plan) and the
 * learner's settings. The request id is kept until the settings change, so retrying after an error never creates
 * a second copy or a second AI charge (the server returns the first result).
 */
export function GenerateForm({ source, personalCourseId, moduleId, defaultKind = 'lesson', kinds, onDone, submitLabel, heading }: Props) {
  const router = useRouter();
  const session = useOptionalLearnerSession();
  const defaults = profileDefaults(session?.user as Record<string, unknown> | undefined);
  const choices = KINDS.filter((k) => (kinds ?? DEFAULT_KINDS).includes(k.id));
  const [kind, setKind] = useState<LearningKind>(choices.some((k) => k.id === defaultKind) ? defaultKind : choices[0].id);
  const info = kindInfo(kind);
  const [count, setCount] = useState<number>(info?.count?.default ?? 10);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('medium');
  const [level, setLevel] = useState(defaults.level);
  const [examGoal, setExamGoal] = useState(defaults.examGoal);
  const [objective, setObjective] = useState('');
  const [duration, setDuration] = useState(30);
  const [practiceMode, setPracticeMode] = useState(true);
  const [requestId, setRequestId] = useState(newRequestId);
  const fresh = () => setRequestId(newRequestId()); // new settings = a new generation

  const run = useAsyncAction(async () => {
    const result = await generateLearning({
      requestId,
      kind,
      sourceType: source.sourceType,
      ...(source.sourceId ? { sourceId: source.sourceId } : {}),
      ...(source.text ? { text: source.text } : {}),
      // pasted text has no stored name: its title names the result; other sources name it after themselves
      ...(source.sourceType === 'text' && source.title ? { title: source.title } : {}),
      ...(personalCourseId ? { personalCourseId } : {}),
      ...(moduleId ? { moduleId } : {}),
      options: {
        ...(info?.count ? { count } : {}),
        ...(kind === 'quiz' || kind === 'exam' ? { difficulty } : {}),
        ...(level.trim() ? { level: level.trim() } : {}),
        ...(examGoal.trim() ? { examGoal: examGoal.trim() } : {}),
        ...(objective.trim() ? { objective: objective.trim() } : {}),
        ...(kind === 'exam' ? { durationMinutes: duration } : {}),
        ...(kind === 'quiz' ? { feedbackMode: practiceMode ? 'immediate' : 'after_submit' } : {}),
      },
    });
    setRequestId(newRequestId());
    if (onDone) onDone(result);
    else router.push(hrefFor(result));
    return result;
  });

  const change = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    fresh();
    run.reset();
  };

  return (
    <form
      className="space-y-4"
      aria-label={heading ?? 'Generate'}
      onSubmit={(e) => {
        e.preventDefault();
        void run.run();
      }}
    >
      {heading && <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">{heading}</h3>}
      {choices.length > 1 && (
        <fieldset>
          <legend className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">What do you want?</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {choices.map((k) => (
              <label key={k.id} className={`flex gap-2 p-3 rounded-2xl border cursor-pointer text-xs ${kind === k.id ? 'border-[var(--color-brand-blue)] bg-blue-50/60 dark:bg-blue-950/30' : 'border-gray-200 dark:border-gray-800'}`}>
                <input
                  type="radio"
                  name="generate-kind"
                  value={k.id}
                  checked={kind === k.id}
                  onChange={() => {
                    change(setKind)(k.id);
                    setCount(k.count?.default ?? 10);
                  }}
                  className="mt-0.5 accent-[var(--color-brand-blue)]"
                />
                <span>
                  <span className="block font-bold text-gray-900 dark:text-white">{k.label}</span>
                  <span className="block text-gray-500">{k.description}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {info?.count && (
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{info.count.label} ({info.count.min}–{info.count.max})</span>
            <input type="number" inputMode="numeric" className={input} min={info.count.min} max={info.count.max} value={count} onChange={(e) => change(setCount)(Math.max(info.count!.min, Math.min(info.count!.max, Number(e.target.value) || info.count!.min)))} />
          </label>
        )}
        {(kind === 'quiz' || kind === 'exam') && (
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Difficulty</span>
            <select className={input} value={difficulty} onChange={(e) => change(setDifficulty)(e.target.value as typeof difficulty)}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="mixed">Mixed</option>
            </select>
          </label>
        )}
        {kind === 'exam' && (
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Time limit (minutes)</span>
            <input type="number" inputMode="numeric" className={input} min={5} max={300} value={duration} onChange={(e) => change(setDuration)(Math.max(5, Math.min(300, Number(e.target.value) || 5)))} />
          </label>
        )}
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Class or level</span>
          <input className={input} value={level} maxLength={100} onChange={(e) => change(setLevel)(e.target.value)} placeholder="e.g. SS 3 or 200 Level" />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Exam goal (optional)</span>
          <input className={input} value={examGoal} maxLength={60} list="exam-goal-options" onChange={(e) => change(setExamGoal)(e.target.value)} placeholder="e.g. WAEC, JAMB" />
          <datalist id="exam-goal-options">
            {EXAM_GOALS.map((g) => (
              <option key={g} value={g} />
            ))}
          </datalist>
        </label>
        <label className="block space-y-1 sm:col-span-2">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">What do you want to learn? (optional)</span>
          <input className={input} value={objective} maxLength={500} onChange={(e) => change(setObjective)(e.target.value)} placeholder="e.g. Understand the light reactions" />
        </label>
        {kind === 'quiz' && (
          <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 sm:col-span-2">
            <input type="checkbox" checked={practiceMode} onChange={(e) => change(setPracticeMode)(e.target.checked)} className="w-4 h-4 accent-[var(--color-brand-blue)]" />
            Check each answer as I go (otherwise answers are shown after I submit)
          </label>
        )}
      </div>

      {(kind === 'quiz' || kind === 'exam') && <p className="text-[11px] text-gray-500">Questions are written by AI from your material for practice. They are not official past questions.</p>}
      {run.isPending && <p role="status" className="text-xs text-gray-500">Generating from your material… this can take up to a minute.</p>}
      {run.isSlow && <SlowNotice message="Still working on it. No need to press the button again." />}
      {run.error && <ErrorState error={run.error} compact />}
      <Button type="submit" size="sm" isLoading={run.isPending}>
        <Sparkles className="w-4 h-4" aria-hidden="true" /> {submitLabel ?? `Generate ${info?.label.toLowerCase() ?? ''}`.trim()}
      </Button>
    </form>
  );
}
