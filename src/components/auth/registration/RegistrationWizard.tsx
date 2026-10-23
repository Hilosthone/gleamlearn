'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, History, RotateCcw, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { SlowNotice } from '@/components/ui/states';
import { useSlowFlag } from '@/hooks/useSlowFlag';
import { academicApi } from '@/lib/api';
import { fetchCurrentLearner, hasLearnerSession, signOut, type LearnerUser } from '@/lib/learner-auth';
import {
  EMPTY_SECRETS,
  EMPTY_VALUES,
  PATH_INFO,
  STEPS,
  STEP_LABELS,
  buildSignupPayload,
  firstInvalidStep,
  hasErrors,
  validateStep,
  type FieldErrors,
  type RegistrationValues,
  type Secrets,
  type StepId,
} from '@/lib/registration/wizard';
import { browserStores, clearDraft, draftHasContent, loadDraft, saveDraft, serializeDraft, type Draft } from '@/lib/registration/draft';
import { reconcile, submitRegistration, type SubmitResult } from '@/lib/registration/submit';
import { RegistrationVisual } from './RegistrationVisual';
import { StepEducation, StepGoals, StepPath, StepPersonal, StepReview, StepSecurity, type AcademicOptions } from './RegistrationSteps';

const STEP_HEADINGS: Record<StepId, string> = {
  path: 'Which best describes you?',
  personal: 'Tell us about you',
  security: 'Secure your account',
  education: 'Your studies',
  goals: 'Goals and preferences',
  review: 'Review and create your account',
};

type Banner = { tone: 'error' | 'warning' | 'info' | 'success'; title: string; text: string; action?: 'signin' | 'reconcile' };

function timeAgo(ms: number): string {
  const mins = Math.round(ms / 60000);
  if (mins < 2) return 'just now';
  if (mins < 60) return `${mins} minutes ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

/**
 * Adaptive registration wizard (secondary school / university / examination preparation).
 * - No request is sent until "Create account" on the review step (exactly one POST /auth/signup).
 * - Progress survives a refresh in this tab; it survives closing the browser only if the learner opts in.
 * - Passwords are kept in memory only (never in a draft, URL or log).
 * - An unknown outcome (connection lost) is reconciled by signing in — never by blindly re-submitting.
 */
export function RegistrationWizard() {
  const router = useRouter();
  const reducedMotion = Boolean(useReducedMotion());
  const [values, setValues] = useState<RegistrationValues>(EMPTY_VALUES);
  const [secrets, setSecrets] = useState<Secrets>(EMPTY_SECRETS);
  const [step, setStep] = useState<StepId>('path');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [persist, setPersist] = useState(false);
  const [offer, setOffer] = useState<Draft | null>(null);
  const [offerAgo, setOfferAgo] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [submitting, setSubmitting] = useState<null | 'signup' | 'reconcile'>(null);
  const [existing, setExisting] = useState<LearnerUser | null>(null);
  // While a stored session is being checked, the form is not shown (a signed-in learner gets the account panel instead)
  const [checkingSession, setCheckingSession] = useState(false);
  const [options, setOptions] = useState<AcademicOptions | null>(null);
  const [ready, setReady] = useState(false);
  const isSlow = useSlowFlag(submitting !== null);
  const inFlight = useRef(false);
  const done = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const index = STEPS.indexOf(step);

  // ---- mount: existing session, saved draft, academic options ----
  useEffect(() => {
    let cancelled = false;
    if (hasLearnerSession()) {
      void Promise.resolve().then(() => !cancelled && setCheckingSession(true));
      fetchCurrentLearner()
        .then((res) => !cancelled && setExisting(res.user))
        .catch(() => undefined) // an expired token just means "not signed in" here
        .finally(() => !cancelled && setCheckingSession(false));
    }
    // Storage is only readable in the browser; apply what it holds right after mount (outside the effect body)
    void Promise.resolve().then(() => {
      if (cancelled) return;
      const now = Date.now();
      const parsed = loadDraft(browserStores(), now);
      if (parsed.ok && draftHasContent(parsed.draft.values)) {
        setOffer(parsed.draft);
        setOfferAgo(timeAgo(now - parsed.draft.savedAt));
        setPersist(parsed.draft.persistent);
      } else if (!parsed.ok && (parsed.reason === 'expired' || parsed.reason === 'unsupported-version')) {
        setNotice(parsed.reason === 'expired' ? 'Your saved registration progress had expired, so we started a fresh form.' : 'GleamLearn was updated since you saved your progress, so we started a fresh form.');
      }
      setReady(true);
    });
    academicApi
      .getAcademicLevels()
      .then((res: unknown) => {
        const r = res as Partial<AcademicOptions> | null;
        if (!cancelled && r && Array.isArray(r.secondaryLevels) && Array.isArray(r.universityLevels)) {
          setOptions({ secondaryLevels: r.secondaryLevels, universityLevels: r.universityLevels, secondaryStreams: Array.isArray(r.secondaryStreams) ? r.secondaryStreams : [] });
        }
      })
      .catch(() => undefined); // free-text inputs are used instead
    return () => {
      cancelled = true;
    };
  }, []);

  // ---- autosave (non-secret values only) ----
  useEffect(() => {
    if (!ready || offer || done.current || !draftHasContent(values)) return;
    const timer = setTimeout(() => saveDraft(browserStores(), serializeDraft(values, step, persist, Date.now()), persist), 400);
    return () => clearTimeout(timer);
  }, [values, step, persist, ready, offer]);

  // ---- focus + browser history on step change ----
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
    // The first step has no hash (the page URL itself), so an empty hash counts as the first step
    if (typeof window !== 'undefined' && (window.location.hash.replace('#', '') || STEPS[0]) !== step) {
      window.history.pushState({ step }, '', `#${step}`);
    }
  }, [step]);

  useEffect(() => {
    // Browser Back/Forward moves between steps; Forward only when every step before the target is valid
    const onPop = () => {
      const target = (window.location.hash.replace('#', '') || STEPS[0]) as StepId;
      if (!STEPS.includes(target) || target === step) return;
      const t = STEPS.indexOf(target);
      if (t < STEPS.indexOf(step) || STEPS.slice(0, t).every((s) => !hasErrors(validateStep(s, values, secrets)))) setStep(target);
      else window.history.replaceState({ step }, '', `#${step}`);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [step, values, secrets]);

  const set = useCallback(<K extends keyof RegistrationValues>(key: K, value: RegistrationValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setBanner(null);
  }, []);
  const setSecret = useCallback((key: keyof Secrets, value: string) => {
    setSecrets((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const goTo = (target: StepId) => {
    setErrors({});
    setBanner(null);
    setStep(target);
  };

  const focusFirstError = (e: FieldErrors) => {
    requestAnimationFrame(() => {
      const first = document.querySelector<HTMLElement>('[aria-invalid="true"]');
      first?.focus();
      if (!first && e.path) document.querySelector<HTMLElement>('input[name="learner-path"]')?.focus();
    });
  };

  const next = () => {
    const e = validateStep(step, values, secrets);
    if (hasErrors(e)) {
      setErrors(e);
      focusFirstError(e);
      return;
    }
    if (step === 'review') return void createAccount();
    goTo(STEPS[index + 1]);
  };

  const back = () => {
    if (index > 0) goTo(STEPS[index - 1]);
  };

  // ---- the one and only account-creation request ----
  const createAccount = async () => {
    if (inFlight.current) return; // duplicate clicks / Enter presses are ignored
    const invalid = firstInvalidStep(values, secrets);
    if (invalid) {
      const e = validateStep(invalid, values, secrets);
      setStep(invalid);
      setErrors(e);
      setBanner({ tone: 'warning', title: 'Almost there', text: 'Please fix the highlighted details first.' });
      focusFirstError(e);
      return;
    }
    inFlight.current = true;
    setSubmitting('signup');
    setBanner(null);
    let result: SubmitResult;
    try {
      result = await submitRegistration(buildSignupPayload(values, secrets));
    } finally {
      inFlight.current = false;
      setSubmitting(null);
    }
    handleResult(result);
  };

  const finish = (delivery: string) => {
    done.current = true;
    clearDraft(browserStores()); // the draft is no longer needed once the account exists
    setSecrets(EMPTY_SECRETS);
    router.replace(`/auth/verify-email?email=${encodeURIComponent(values.email.trim())}&delivery=${delivery}`);
  };

  const handleResult = (r: SubmitResult) => {
    switch (r.kind) {
      case 'created':
        return finish(r.verificationEmail);
      case 'invalid':
        setErrors(r.fieldErrors);
        if (r.step) setStep(r.step);
        setBanner({ tone: 'warning', title: 'Some details need attention', text: 'We could not create your account with these details. Please check the highlighted fields.' });
        return focusFirstError(r.fieldErrors);
      case 'exists':
        return setBanner({ tone: 'warning', title: 'Account already exists', text: r.message, action: 'signin' });
      case 'uncertain':
        return setBanner({ tone: 'warning', title: 'We lost the connection', text: `${r.message} Check below before trying again — we won’t create a second account.`, action: 'reconcile' });
      default:
        return setBanner({ tone: 'error', title: 'Account not created', text: r.message });
    }
  };

  const checkUncertain = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setSubmitting('reconcile');
    try {
      const r = await reconcile(values.email.trim(), secrets.password);
      if (r.kind === 'created') return finish('unknown');
      if (r.kind === 'not_created') {
        setBanner({ tone: 'info', title: 'Your account was not created', text: 'Nothing was saved, so it is safe to create your account now.' });
      } else {
        setBanner({ tone: 'error', title: r.kind === 'restricted' ? 'Account restricted' : 'Still offline', text: r.message, action: r.kind === 'still_unknown' ? 'reconcile' : undefined });
      }
    } finally {
      inFlight.current = false;
      setSubmitting(null);
    }
  };

  const resume = () => {
    if (!offer) return;
    setValues(offer.values);
    setStep(offer.step);
    setOffer(null);
  };
  const startOver = () => {
    clearDraft(browserStores());
    setValues(EMPTY_VALUES);
    setSecrets(EMPTY_SECRETS);
    setStep('path');
    setPersist(false);
    setOffer(null);
  };

  const stepLabel = (s: StepId) => (s === 'education' && values.path ? PATH_INFO[values.path].educationStepLabel : STEP_LABELS[s]);
  const motionProps = reducedMotion
    ? { initial: false, animate: { opacity: 1 }, exit: { opacity: 1 } }
    : { initial: { opacity: 0, x: 16 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -16 }, transition: { duration: 0.18 } };

  return (
    <main className="min-h-screen bg-[#FCFAF8] dark:bg-[#0B0F19] transition-colors">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-10 grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-8 items-start">
        {/* ---------- brand / visual column (decorative 3D on large screens only) ---------- */}
        <aside className="hidden lg:flex flex-col gap-6 sticky top-10">
          <Link href="/welcome" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-brand-blue)] hover:underline w-fit">
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> Back to welcome
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Learn smarter with GleamLearn</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 max-w-md">
              Courses, practice questions, exam preparation and an AI tutor — set up around where you are in your studies.
            </p>
          </div>
          <div className="relative h-72 rounded-3xl bg-gradient-to-br from-white to-amber-50/60 dark:from-[#111827] dark:to-[#17120F] border border-gray-200/80 dark:border-gray-800 overflow-hidden">
            <RegistrationVisual path={values.path} reducedMotion={reducedMotion} />
            {values.path && (
              <p className="absolute bottom-4 left-4 right-4 text-xs font-semibold text-gray-700 dark:text-gray-300">{PATH_INFO[values.path].title}</p>
            )}
          </div>
          <p className="text-[11px] text-gray-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-brand-green)]" aria-hidden="true" /> Your password is sent over a secure connection and stored hashed.
          </p>
        </aside>

        {/* ---------- wizard card ---------- */}
        <section className="bg-white dark:bg-[#111827] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-sm p-5 sm:p-8" aria-labelledby="wizard-heading">
          <Link href="/welcome" className="lg:hidden inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-brand-blue)] hover:underline mb-4">
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> Back
          </Link>

          {existing ? (
            <ExistingAccount user={existing} onSignOut={async () => { await signOut(); setExisting(null); }} />
          ) : checkingSession ? (
            <p role="status" className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">Checking your account…</p>
          ) : (
            <>
              {/* progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500 mb-2">
                  <span>
                    Step {index + 1} of {STEPS.length} · {stepLabel(step)}
                  </span>
                  <Link href="/auth/login" className="text-[var(--color-brand-blue)] hover:underline">
                    I have an account
                  </Link>
                </div>
                <ol className="grid grid-cols-6 gap-1.5" aria-label="Registration progress">
                  {STEPS.map((s, i) => (
                    <li key={s} aria-current={s === step ? 'step' : undefined}>
                      <span className={`block h-1.5 rounded-full transition-colors ${i < index ? 'bg-[var(--color-brand-green)]' : i === index ? 'bg-[var(--color-brand-gold)]' : 'bg-gray-200 dark:bg-gray-800'}`} />
                      <span className="sr-only">
                        {stepLabel(s)}: {i < index ? 'completed' : i === index ? 'current' : 'not started'}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              {notice && (
                <div className="mb-4">
                  <Alert variant="info" action={<button type="button" className="text-xs font-semibold underline" onClick={() => setNotice(null)}>OK</button>}>
                    {notice}
                  </Alert>
                </div>
              )}

              {offer ? (
                <ResumeOffer draft={offer} ago={offerAgo} onResume={resume} onStartOver={startOver} stepLabel={stepLabel(offer.step)} />
              ) : (
                <form
                  noValidate
                  onSubmit={(e) => {
                    e.preventDefault();
                    next();
                  }}
                >
                  <h2 id="wizard-heading" ref={headingRef} tabIndex={-1} className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white mb-5 focus:outline-none">
                    {STEP_HEADINGS[step]}
                  </h2>
                  <p className="sr-only" aria-live="polite">
                    Step {index + 1} of {STEPS.length}: {stepLabel(step)}
                  </p>

                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div key={step} {...motionProps}>
                      {step === 'path' && <StepPath values={values} errors={errors} set={set} />}
                      {step === 'personal' && <StepPersonal values={values} errors={errors} set={set} />}
                      {step === 'security' && <StepSecurity values={values} errors={errors} set={set} secrets={secrets} setSecret={setSecret} />}
                      {step === 'education' && <StepEducation values={values} errors={errors} set={set} options={options} />}
                      {step === 'goals' && <StepGoals values={values} errors={errors} set={set} />}
                      {step === 'review' && <StepReview values={values} onEdit={goTo} />}
                    </motion.div>
                  </AnimatePresence>

                  {hasErrors(errors) && (
                    <p className="sr-only" role="alert">
                      {Object.keys(errors).length} {Object.keys(errors).length === 1 ? 'field needs' : 'fields need'} attention.
                    </p>
                  )}

                  <div className="mt-6 space-y-3">
                    {isSlow && <SlowNotice />}
                    {banner && (
                      <Alert variant={banner.tone} title={banner.title}>
                        <span className="block">{banner.text}</span>
                        {banner.action === 'signin' && (
                          <Link href="/auth/login" className="inline-block mt-1 font-semibold underline">
                            Go to sign in
                          </Link>
                        )}
                        {banner.action === 'reconcile' && (
                          <button type="button" onClick={checkUncertain} disabled={submitting !== null} className="inline-block mt-1 font-semibold underline disabled:opacity-50">
                            {submitting === 'reconcile' ? 'Checking…' : 'Check whether my account was created'}
                          </button>
                        )}
                      </Alert>
                    )}

                    <label className="flex items-start gap-2.5 text-[11px] text-gray-500 dark:text-gray-400 cursor-pointer">
                      <input type="checkbox" checked={persist} onChange={(e) => setPersist(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[var(--color-brand-blue)]" />
                      <span>
                        <strong className="text-gray-700 dark:text-gray-300">Save progress on this device</strong> for 7 days, so you can finish later. Your name, email and
                        study details are stored on this device; your password is never saved. Leave unticked on shared computers — progress is then kept only until you close this tab.
                      </span>
                    </label>

                    <div className="flex items-center justify-between gap-3 pt-1">
                      <Button type="button" variant="outline" size="md" onClick={back} disabled={index === 0 || submitting !== null} className={index === 0 ? 'invisible' : ''}>
                        <ArrowLeft className="w-4 h-4 mr-1.5" aria-hidden="true" /> Back
                      </Button>
                      <Button type="submit" variant="primary" size="md" isLoading={submitting === 'signup'} disabled={submitting !== null}>
                        {step === 'review' ? 'Create account' : 'Continue'}
                        {step !== 'review' && <ArrowRight className="w-4 h-4 ml-1.5" aria-hidden="true" />}
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function ResumeOffer({ draft, ago, onResume, onStartOver, stepLabel }: { draft: Draft; ago: string; onResume: () => void; onStartOver: () => void; stepLabel: string }) {
  return (
    <div className="space-y-4" role="region" aria-labelledby="resume-heading">
      <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-[var(--color-brand-gold)] flex items-center justify-center">
        <History className="w-6 h-6" aria-hidden="true" />
      </div>
      <h2 id="resume-heading" className="text-xl font-extrabold text-gray-900 dark:text-white">
        Continue where you left off?
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        You started registering {ago}
        {draft.values.path ? ` as a ${PATH_INFO[draft.values.path].title.toLowerCase()}` : ''}. We&apos;ll take you back to <strong>{stepLabel}</strong>. For your security you&apos;ll
        re-enter your password and confirm the terms.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button type="button" variant="primary" size="md" onClick={onResume}>
          Continue registration
        </Button>
        <Button type="button" variant="outline" size="md" onClick={onStartOver}>
          <RotateCcw className="w-4 h-4 mr-1.5" aria-hidden="true" /> Start over
        </Button>
      </div>
      <p className="text-[11px] text-gray-500">&ldquo;Start over&rdquo; deletes the saved progress from this device.</p>
    </div>
  );
}

function ExistingAccount({ user, onSignOut }: { user: LearnerUser; onSignOut: () => void }) {
  const router = useRouter();
  const verified = Boolean(user.isEmailVerified);
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">You already have an account</h2>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        You&apos;re signed in as <strong>{user.email}</strong>. There&apos;s no need to register again.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        {verified ? (
          <Button type="button" variant="primary" size="md" onClick={() => router.replace('/onboarding')}>
            Continue
          </Button>
        ) : (
          <Button type="button" variant="primary" size="md" onClick={() => router.replace(`/auth/verify-email?email=${encodeURIComponent(user.email)}`)}>
            Verify my email
          </Button>
        )}
        <Button type="button" variant="outline" size="md" onClick={onSignOut}>
          Sign out to create a different account
        </Button>
      </div>
    </div>
  );
}
