'use client';

import React, { useState } from 'react';
import { CheckCircle2, ClipboardList, FileText, GraduationCap, Sparkles, XCircle, ArrowLeft, Clock } from 'lucide-react';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { EmptyState, ErrorState, LoadingState, SlowNotice } from '@/components/ui/states';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import {
  generatePracticeQuiz,
  getAssessment,
  gradeLocally,
  listAssessments,
  submitAssessment,
  type Assessment,
  type AssessmentKind,
  type GeneratedQuestion,
  type PracticeQuestion,
  type SubmitResult,
} from '@/lib/practice';

type Tab = AssessmentKind | 'ai';

const panel = 'bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs';
const KIND_LABEL: Record<AssessmentKind, { one: string; many: string; icon: typeof FileText }> = {
  quiz: { one: 'quiz', many: 'Quizzes', icon: ClipboardList },
  test: { one: 'test', many: 'Tests', icon: FileText },
  exam: { one: 'exam', many: 'Exams', icon: GraduationCap },
};

/**
 * Quizzes, tests and exams from the backend (graded server-side), plus AI practice graded in the browser.
 * Replaces the static prototype screens, which showed invented questions, scores and readiness.
 */
export function PracticeHub({ initialTab = 'quiz', title = 'Practice' }: { initialTab?: Tab; title?: string }) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [taking, setTaking] = useState<{ kind: AssessmentKind; id: string } | null>(null);

  return (
    <div className="w-full min-h-screen pb-16 space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 bg-white dark:bg-[#111827] p-4 sm:px-8 sm:py-5 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-200/50">
            <ClipboardList className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white">{title}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Quizzes, tests and exams, graded by GleamLearn, plus AI practice.</p>
          </div>
        </div>
        {!taking && (
          <div className="flex items-center gap-2 w-full xl:w-auto overflow-x-auto" role="tablist">
            {(['quiz', 'test', 'exam', 'ai'] as Tab[]).map((t) => {
              const label = t === 'ai' ? 'AI practice' : KIND_LABEL[t].many;
              const Icon = t === 'ai' ? Sparkles : KIND_LABEL[t].icon;
              return (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => setTab(t)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap ${
                    tab === t ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {taking ? (
        <TakeAssessment kind={taking.kind} id={taking.id} onExit={() => setTaking(null)} />
      ) : tab === 'ai' ? (
        <AiPractice />
      ) : (
        <AssessmentList kind={tab} onStart={(id) => setTaking({ kind: tab, id })} />
      )}
    </div>
  );
}

function AssessmentList({ kind, onStart }: { kind: AssessmentKind; onStart: (id: string) => void }) {
  const items = useApiQuery(() => listAssessments(kind), [kind]);
  const { many, one, icon: Icon } = KIND_LABEL[kind];
  if (items.isLoading) return <LoadingState layout="cards" rows={3} label={`Loading ${many.toLowerCase()}…`} />;
  if (items.error && !items.data) return <ErrorState error={items.error} onRetry={items.retry} />;
  if (!items.data?.length)
    return (
      <EmptyState
        icon={Icon}
        title={`No ${many.toLowerCase()} yet`}
        description={`When ${many.toLowerCase()} are added by GleamLearn they will appear here. You can try AI practice in the meantime.`}
      />
    );
  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {items.data.map((a) => (
        <li key={a.id} className={`${panel} flex flex-col gap-3`}>
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">{a.title}</h2>
          </div>
          {a.description && <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3">{a.description}</p>}
          <p className="text-[11px] text-gray-400 flex items-center gap-3">
            <span>{a.questions.length} {a.questions.length === 1 ? 'question' : 'questions'}</span>
            {a.durationMinutes && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" aria-hidden="true" /> {a.durationMinutes} min
              </span>
            )}
          </p>
          <div className="mt-auto pt-2">
            <Button type="button" variant="success" size="sm" disabled={a.questions.length === 0} onClick={() => onStart(a.id)}>
              {a.questions.length === 0 ? 'No questions yet' : `Start ${one}`}
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function QuestionList({
  questions,
  selected,
  onSelect,
  review,
}: {
  questions: PracticeQuestion[] | GeneratedQuestion[];
  selected: Record<number, string>;
  onSelect?: (index: number, value: string) => void;
  review?: { answer: string; explanation: string; correct: boolean }[];
}) {
  return (
    <ol className="space-y-6">
      {questions.map((q, pos) => (
        <li key={q.index} className="space-y-3">
          <p className="text-sm font-bold text-gray-900 dark:text-white">
            {pos + 1}. {q.text}
          </p>
          {q.options.length > 0 ? (
            <fieldset className="space-y-2" disabled={!onSelect}>
              <legend className="sr-only">Question {pos + 1}</legend>
              {q.options.map((o) => {
                const checked = selected[q.index] === o;
                const isAnswer = review && review[pos]?.answer === o;
                return (
                  <label
                    key={o}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer ${
                      isAnswer ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30' : checked ? 'border-[#2563EB] bg-blue-50 dark:bg-blue-950/30' : 'border-gray-200 dark:border-gray-800'
                    }`}
                  >
                    <input type="radio" name={`q-${q.index}`} value={o} checked={checked} onChange={() => onSelect?.(q.index, o)} className="accent-[#2563EB]" />
                    <span className="text-gray-800 dark:text-gray-200">{o}</span>
                  </label>
                );
              })}
            </fieldset>
          ) : (
            <Input
              id={`q-${q.index}`}
              label="Your answer"
              value={selected[q.index] ?? ''}
              onChange={(e) => onSelect?.(q.index, e.target.value)}
              disabled={!onSelect}
              maxLength={500}
            />
          )}
          {review?.[pos] && (
            <p className={`text-xs flex items-start gap-1.5 ${review[pos].correct ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {review[pos].correct ? <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" /> : <XCircle className="w-4 h-4 shrink-0" aria-hidden="true" />}
              <span>
                {review[pos].correct ? 'Correct.' : `Answer: ${review[pos].answer}.`} {review[pos].explanation}
              </span>
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}

function TakeAssessment({ kind, id, onExit }: { kind: AssessmentKind; id: string; onExit: () => void }) {
  const assessment = useApiQuery(() => getAssessment(kind, id), [kind, id]);
  const [selected, setSelected] = useState<Record<number, string>>({});
  const submit = useAsyncAction(async (_signal: AbortSignal, a: Assessment) => submitAssessment(a.kind, a.id, selected));
  const result: SubmitResult | undefined = submit.result;

  if (assessment.isLoading) return <LoadingState layout="detail" />;
  if (assessment.error && !assessment.data) return <ErrorState error={assessment.error} onRetry={assessment.retry} />;
  const a = assessment.data!;
  const answered = a.questions.filter((q) => (selected[q.index] ?? '').trim() !== '').length;

  return (
    <div className={`${panel} space-y-6`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">{a.title}</h2>
          <p className="text-xs text-gray-500">{a.questions.length} questions{a.durationMinutes ? ` · suggested time ${a.durationMinutes} min` : ''}</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onExit} disabled={submit.isPending}>
          <ArrowLeft className="w-4 h-4 mr-1" aria-hidden="true" /> Back
        </Button>
      </div>

      {result ? (
        <div className="space-y-4" role="status">
          <p className="text-3xl font-black text-gray-900 dark:text-white">{result.graded ? `${result.score}%` : 'Not graded'}</p>
          <p className="text-xs text-gray-600 dark:text-gray-300">
            {result.correctAnswers !== null && result.graded ? `${result.correctAnswers} of ${result.totalQuestions} correct. ` : ''}
            {result.message}
          </p>
          {(result.xpAwarded > 0 || result.coinsAwarded > 0) && (
            <Alert variant="success" title="Rewards earned">
              +{result.xpAwarded} XP and +{result.coinsAwarded} coins were added to your account.
            </Alert>
          )}
          {kind !== 'quiz' && <p className="text-[11px] text-gray-400">Results are not saved yet, so this score will not appear in your history.</p>}
          <Button type="button" variant="primary" size="md" onClick={onExit}>
            Back to {KIND_LABEL[kind].many.toLowerCase()}
          </Button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submit.run(a);
          }}
          className="space-y-6"
        >
          <QuestionList questions={a.questions} selected={selected} onSelect={(i, v) => setSelected((s) => ({ ...s, [i]: v }))} />
          {submit.error && <ErrorState error={submit.error} compact />}
          {submit.isSlow && <SlowNotice />}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <span className="text-xs text-gray-500">
              {answered} of {a.questions.length} answered
            </span>
            <Button type="submit" variant="success" size="md" isLoading={submit.isPending} disabled={answered === 0}>
              Submit answers
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

/** AI-generated practice through the backend (POST /quizzes/generate). Graded here; nothing is saved or rewarded. */
function AiPractice() {
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState<GeneratedQuestion[] | null>(null);
  const [selected, setSelected] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const generate = useAsyncAction(async () => {
    const qs = await generatePracticeQuiz(topic.trim());
    setQuestions(qs);
    setSelected({});
    setChecked(false);
    return qs;
  });
  const graded = questions && checked ? gradeLocally(questions, selected) : null;

  return (
    <div className={`${panel} space-y-6`}>
      <div>
        <h2 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" aria-hidden="true" /> AI practice
        </h2>
        <p className="text-xs text-gray-500 mt-1">Practice questions generated by AI. They are checked in your browser, not saved, and do not earn XP. AI can make mistakes.</p>
      </div>
      <form
        className="flex flex-col sm:flex-row gap-3 sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          if (topic.trim()) void generate.run();
        }}
      >
        <div className="flex-1">
          <Input id="ai-topic" label="Topic" value={topic} onChange={(e) => setTopic(e.target.value)} maxLength={120} placeholder="e.g. Photosynthesis, quadratic equations" />
        </div>
        <Button type="submit" variant="purple" size="md" isLoading={generate.isPending} disabled={!topic.trim()}>
          Generate questions
        </Button>
      </form>
      {generate.isSlow && <SlowNotice message="Generating questions can take up to a minute." />}
      {generate.error && <ErrorState error={generate.error} compact />}
      {questions && questions.length === 0 && (
        <Alert variant="warning" title="No usable questions">The AI answer could not be turned into multiple-choice questions. Try again or change the topic.</Alert>
      )}
      {questions && questions.length > 0 && (
        <div className="space-y-6">
          <QuestionList
            questions={questions}
            selected={selected}
            onSelect={checked ? undefined : (i, v) => setSelected((s) => ({ ...s, [i]: v }))}
            review={graded ? questions.map((q, i) => ({ answer: q.answer, explanation: q.explanation, correct: graded.perQuestion[i].correct })) : undefined}
          />
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            {graded ? (
              <span className="text-sm font-black text-gray-900 dark:text-white" role="status">
                {graded.correct} of {graded.total} correct ({graded.score}%)
              </span>
            ) : (
              <span className="text-xs text-gray-500">{Object.keys(selected).length} of {questions.length} answered</span>
            )}
            {graded ? (
              <Button type="button" variant="outline" size="md" onClick={() => { setChecked(false); setSelected({}); }}>
                Try again
              </Button>
            ) : (
              <Button type="button" variant="purple" size="md" disabled={Object.keys(selected).length === 0} onClick={() => setChecked(true)}>
                Check answers
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
