'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { StartLearning } from '@/components/learning/StartLearning';
import { loadLearnerAssessments } from '@/lib/self-learning';
import { CheckCircle2, ClipboardList, FileText, GraduationCap, Sparkles, XCircle, ArrowLeft, Clock, History, Target, BookOpenCheck, CalendarClock, BarChart3 } from 'lucide-react';
import { PastQuestions, PerformanceAnalytics, PrepPlans } from '@/components/practice/ExamPrepPanels';
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
  loadExamReadiness,
  loadOfficialHistory,
  officialAttemptHref,
  startOfficialAttempt,
  type Assessment,
  type AssessmentKind,
  type GeneratedQuestion,
  type PracticeQuestion,
  type SubmitResult,
} from '@/lib/practice';

type Tab = AssessmentKind | 'ai' | 'history' | 'past' | 'prep' | 'analytics';

const EXTRA_TABS = {
  ai: { label: 'Quick AI practice', icon: Sparkles },
  history: { label: 'History', icon: History },
  past: { label: 'Past questions', icon: BookOpenCheck },
  prep: { label: 'Exam prep plans', icon: CalendarClock },
  analytics: { label: 'Performance', icon: BarChart3 },
} as const;

const panel = 'bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs';
const KIND_LABEL: Record<AssessmentKind, { one: string; many: string; icon: typeof FileText }> = {
  quiz: { one: 'quiz', many: 'Quizzes', icon: ClipboardList },
  test: { one: 'test', many: 'Tests', icon: FileText },
  exam: { one: 'exam', many: 'Exams', icon: GraduationCap },
};

/**
 * Practice and Exams: the learner's own AI-generated quizzes and mock exams (saved, with attempts and reviews),
 * created from their own material, plus any quizzes, tests and exams GleamLearn has published, and quick AI
 * practice (not saved). Nothing here depends on GleamLearn having published content.
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
            <p className="text-xs text-gray-500 dark:text-gray-400">Create quizzes and mock exams from your own material, take them, and review your results.</p>
          </div>
        </div>
        {!taking && (
          <div className="flex items-center gap-2 w-full xl:w-auto overflow-x-auto" role="tablist">
            {(['quiz', 'test', 'exam', 'past', 'prep', 'ai', 'history', 'analytics'] as Tab[]).map((t) => {
              const extra = EXTRA_TABS[t as keyof typeof EXTRA_TABS];
              const label = extra ? extra.label : t === 'exam' ? 'Mock exams' : KIND_LABEL[t as AssessmentKind].many;
              const Icon = extra ? extra.icon : KIND_LABEL[t as AssessmentKind].icon;
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
      ) : tab === 'history' ? (
        <OfficialHistory />
      ) : tab === 'past' ? (
        <PastQuestions />
      ) : tab === 'prep' ? (
        <PrepPlans />
      ) : tab === 'analytics' ? (
        <PerformanceAnalytics />
      ) : (
        <KindPanel kind={tab} onStart={(id) => setTaking({ kind: tab, id })} />
      )}
    </div>
  );
}

function KindPanel({ kind, onStart }: { kind: AssessmentKind; onStart: (id: string) => void }) {
  if (kind === 'test') return <AssessmentList kind="test" onStart={onStart} />;
  return (
    <div className="space-y-8">
      <MyAssessments kind={kind} />
      <StartLearning
        heading={kind === 'exam' ? 'Create a mock exam' : 'Create a quiz'}
        kinds={kind === 'exam' ? ['exam'] : ['quiz']}
        defaultKind={kind === 'exam' ? 'exam' : 'quiz'}
      />
      <AssessmentList kind={kind} onStart={onStart} />
    </div>
  );
}

/** The learner's own quizzes / mock exams, with their best score and any attempt in progress. */
function MyAssessments({ kind }: { kind: 'quiz' | 'exam' }) {
  const items = useApiQuery(() => loadLearnerAssessments(kind), [kind]);
  const label = kind === 'exam' ? 'mock exams' : 'quizzes';
  if (items.isLoading) return <LoadingState layout="cards" rows={2} label={`Loading your ${label}…`} />;
  if (items.error && !items.data) return items.error.kind === 'not_implemented' ? null : <ErrorState error={items.error} onRetry={items.retry} />;
  if (!items.data?.length)
    return (
      <EmptyState
        icon={kind === 'exam' ? GraduationCap : ClipboardList}
        title={`You have no ${label} yet`}
        description={`Create one below from a PDF, your notes, one of your courses or a YouTube video. It is saved here with your attempts and results.`}
      />
    );
  return (
    <section aria-label={`Your ${label}`} className="space-y-3">
      <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">Your {label}</h2>
      <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.data.map((a) => (
          <li key={a.id} className={`${panel} flex flex-col gap-2`}>
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white break-words">{a.title}</h3>
            <p className="text-[11px] text-gray-500">
              {a.questionCount} questions{a.durationMinutes ? ` · ${a.durationMinutes} min` : ''}{a.examType ? ` · ${a.examType}` : ''}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              {a.inProgressAttemptId ? 'In progress' : a.attemptCount ? `Best score ${a.bestScore}% · ${a.attemptCount} attempt${a.attemptCount === 1 ? '' : 's'}` : 'Not taken yet'}
            </p>
            <div className="mt-auto pt-2">
              <Link href={`/practice/${encodeURIComponent(a.id)}`} className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 min-h-10">
                {a.inProgressAttemptId ? 'Resume' : a.attemptCount ? 'Review or retake' : 'Start'}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Quizzes, tests and exams published by GleamLearn (shown only when there are some, except on Tests). */
function AssessmentList({ kind, onStart }: { kind: AssessmentKind; onStart: (id: string) => void }) {
  const items = useApiQuery(() => listAssessments(kind), [kind]);
  const { many, one, icon: Icon } = KIND_LABEL[kind];
  if (items.isLoading) return kind === 'test' ? <LoadingState layout="cards" rows={3} label={`Loading ${many.toLowerCase()}…`} /> : null;
  if (items.error && !items.data) return <ErrorState error={items.error} onRetry={items.retry} />;
  if (!items.data?.length)
    return kind === 'test' ? (
      <EmptyState
        icon={Icon}
        title="No GleamLearn tests right now"
        description="You don't need them to practise: create your own quiz or mock exam from your material."
        action={<span className="flex gap-3 text-xs font-semibold"><Link className="text-[var(--color-brand-blue)] underline" href="/practice">Create a quiz</Link><Link className="text-[var(--color-brand-blue)] underline" href="/exams">Create a mock exam</Link></span>}
      />
    ) : null;
  return (
    <section aria-label={`GleamLearn ${many.toLowerCase()}`} className="space-y-3">
    {kind !== 'test' && <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">From GleamLearn</h2>}
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
    </section>
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

const clock = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

/**
 * Taking an official quiz, test or exam: a stored attempt is started (or resumed) on the server; tests and exams
 * are timed from their duration and submitted automatically when time is up. When the server cannot store attempts
 * yet (501), the answers are still graded on submit, and the page says the result is not saved.
 */
function TakeAssessment({ kind, id, onExit }: { kind: AssessmentKind; id: string; onExit: () => void }) {
  const assessment = useApiQuery(() => getAssessment(kind, id), [kind, id]);
  const attempt = useApiQuery(() => startOfficialAttempt(kind, id), [kind, id]);
  const readiness = useApiQuery(() => (kind === 'exam' ? loadExamReadiness(id) : Promise.resolve(null)), [kind, id]);
  const [selected, setSelected] = useState<Record<number, string>>({});
  const [now, setNow] = useState(() => Date.now());
  // auto: submitted because time ran out
  const submit = useAsyncAction(async (_signal: AbortSignal, a: Assessment, auto?: boolean) => ({ ...(await submitAssessment(a.kind, a.id, selected)), auto: auto === true }));
  const result: (SubmitResult & { auto: boolean }) | undefined = submit.result;
  const autoSubmitted = useRef(false);
  const deadline = attempt.data?.deadlineAt ? Date.parse(attempt.data.deadlineAt) : null;
  const left = deadline ? Math.max(0, Math.floor((deadline - now) / 1000)) : null;

  useEffect(() => {
    if (!deadline || result) return;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [deadline, result]);
  useEffect(() => {
    // time is up: submit what has been answered, once
    if (left === 0 && assessment.data && !result && !submit.isPending && !autoSubmitted.current) {
      autoSubmitted.current = true;
      void submit.run(assessment.data, true);
    }
  }, [left, assessment.data, result, submit]);

  if (assessment.isLoading || attempt.isLoading) return <LoadingState layout="detail" />;
  if (assessment.error && !assessment.data) return <ErrorState error={assessment.error} onRetry={assessment.retry} />;
  const a = assessment.data!;
  const notStored = attempt.error?.kind === 'not_implemented';
  const answered = a.questions.filter((q) => (selected[q.index] ?? '').trim() !== '').length;

  return (
    <div className={`${panel} space-y-6`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg font-extrabold text-gray-900 dark:text-white break-words">{a.title}</h2>
          <p className="text-xs text-gray-500">
            {a.questions.length} questions{a.durationMinutes ? ` · ${a.durationMinutes} min` : ''}
            {attempt.data?.resumed ? ' · resumed your attempt in progress' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {left !== null && !result && (
            <span role="timer" aria-label="Time left" className={`inline-flex items-center gap-1.5 text-sm font-black tabular-nums ${left < 60 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
              <Clock className="w-4 h-4" aria-hidden="true" /> {clock(left)}
            </span>
          )}
          <Button type="button" variant="outline" size="sm" onClick={onExit} disabled={submit.isPending}>
            <ArrowLeft className="w-4 h-4 mr-1" aria-hidden="true" /> Back
          </Button>
        </div>
      </div>

      {kind === 'exam' && readiness.data && !result && (
        <div className="rounded-2xl bg-gray-50 dark:bg-gray-900 p-4 text-xs text-gray-700 dark:text-gray-300 flex flex-wrap gap-x-4 gap-y-1" aria-label="Exam readiness">
          <span className="font-bold text-gray-900 dark:text-white inline-flex items-center gap-1"><Target className="w-3.5 h-3.5" aria-hidden="true" /> Readiness: {readiness.data.status === 'ready' ? 'ready' : readiness.data.status === 'building' ? 'building up' : 'no attempts yet'}</span>
          {readiness.data.attempts > 0 && <span>{readiness.data.attempts} attempt(s) · best {readiness.data.bestScore}% · recent average {readiness.data.recentAverage}%</span>}
          {readiness.data.weakTopics.length > 0 && <span>To revise: {readiness.data.weakTopics.slice(0, 4).map((t) => `${t.topic} (${t.percent}%)`).join(', ')}</span>}
        </div>
      )}
      {attempt.error && !notStored && !result && <ErrorState error={attempt.error} onRetry={attempt.retry} compact />}

      {result ? (
        <div className="space-y-4" role="status">
          <p className="text-3xl font-black text-gray-900 dark:text-white">{result.graded ? `${result.score}%` : 'Not graded'}</p>
          <p className="text-xs text-gray-600 dark:text-gray-300">
            {result.correctAnswers !== null && result.graded ? `${result.correctAnswers} of ${result.totalQuestions} correct. ` : ''}
            {result.auto ? 'Time was up, so your answers were submitted automatically. ' : ''}
            {result.message}
          </p>
          {(result.xpAwarded > 0 || result.coinsAwarded > 0) && (
            <Alert variant="success" title="Rewards earned">
              +{result.xpAwarded} XP and +{result.coinsAwarded} coins were added to your account.
            </Alert>
          )}
          {result.attemptId ? (
            <Link href={officialAttemptHref({ kind, id: result.attemptId })} className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 min-h-10">
              Review your answers
            </Link>
          ) : (
            <p className="text-[11px] text-gray-400">This result could not be saved on this server, so it will not appear in your history.</p>
          )}
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
          <QuestionList questions={a.questions} selected={selected} onSelect={(i, v) => setSelected((cur) => ({ ...cur, [i]: v }))} />
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

/** The learner's stored attempts at official quizzes, tests and exams. */
function OfficialHistory() {
  const history = useApiQuery(() => loadOfficialHistory(), []);
  if (history.isLoading) return <LoadingState rows={3} label="Loading your attempts…" />;
  if (history.error && !history.data) return <ErrorState error={history.error} onRetry={history.retry} />;
  const { attempts, unavailable } = history.data!;
  return (
    <div className={`${panel} space-y-4`}>
      <div>
        <h2 className="text-base font-extrabold text-gray-900 dark:text-white">Your attempts at GleamLearn quizzes, tests and exams</h2>
        <p className="text-xs text-gray-500">Attempts at quizzes and exams you made yourself are in Library → Quizzes & exams.</p>
      </div>
      {unavailable.length === 3 ? (
        <EmptyState icon={History} title="Attempt history isn't available yet" description="This server can't store attempts yet. Your answers are still graded when you submit." />
      ) : !attempts.length ? (
        <EmptyState icon={History} title="No attempts yet" description="Take a quiz, test or exam and it will be listed here with its score and review." />
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-800" aria-label="Attempt history">
          {attempts.map((t) => (
            <li key={t.id} className="py-3 flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mr-2">{KIND_LABEL[t.kind].one}</span>
                {t.status === 'submitted' ? (
                  <Link href={officialAttemptHref(t)} className="font-semibold text-gray-900 dark:text-white hover:text-emerald-600 break-words">{t.title}</Link>
                ) : (
                  <span className="font-semibold text-gray-900 dark:text-white break-words">{t.title}</span>
                )}
              </span>
              <span className="text-xs text-gray-500">
                {t.status === 'submitted' ? `${t.graded ? `${t.score}%` : 'not graded'} · ${t.submittedAt ? new Date(t.submittedAt).toLocaleString() : ''}` : 'in progress'}
              </span>
            </li>
          ))}
        </ul>
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
