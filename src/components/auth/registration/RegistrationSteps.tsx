'use client';

import React, { useId, useMemo, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Check, Eye, EyeOff, GraduationCap, Pencil, School, Target, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import {
  EXAM_SUGGESTIONS,
  LIMITS,
  PASSWORD_MIN,
  PATH_INFO,
  STUDY_TIMES,
  cleanExams,
  reviewSections,
  type FieldErrors,
  type LearnerPath,
  type RegistrationValues,
  type Secrets,
  type StepId,
} from '@/lib/registration/wizard';

export interface AcademicOptions {
  secondaryLevels: string[];
  universityLevels: string[];
  secondaryStreams: string[];
}

interface StepProps {
  values: RegistrationValues;
  errors: FieldErrors;
  set: <K extends keyof RegistrationValues>(key: K, value: RegistrationValues[K]) => void;
}

const fieldClass =
  'w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#111827] border text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 transition-all';

/** <select> when the backend provided options; a text input when it did not (never blocks registration). */
function ChoiceField({
  id,
  label,
  value,
  options,
  onChange,
  error,
  placeholder,
  optional,
}: {
  id: string;
  label: string;
  value: string;
  options: string[] | null;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  optional?: boolean;
}) {
  const fullLabel = optional ? `${label} (optional)` : label;
  if (!options || options.length === 0) {
    return <Input id={id} label={fullLabel} value={value} onChange={(e) => onChange(e.target.value)} error={error} placeholder={placeholder} maxLength={LIMITS.text} />;
  }
  const noteId = error ? `${id}-note` : undefined;
  return (
    <div className="w-full flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {fullLabel}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={noteId}
        className={`${fieldClass} ${error ? 'border-[var(--color-brand-red)] focus:ring-[var(--color-brand-red)]/20' : 'border-gray-300 dark:border-[#1F2937] focus:border-[var(--color-brand-blue)] focus:ring-[var(--color-brand-blue)]/20'}`}
      >
        <option value="">{optional ? 'Not now' : 'Choose…'}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {error && <span id={noteId} className="text-xs text-[var(--color-brand-red)] font-medium">{error}</span>}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------
// Step 1 — learning path
// ---------------------------------------------------------------------------------------------------------
const PATH_ICONS: Record<LearnerPath, typeof School> = { secondary: School, university: GraduationCap, exam: Target };

export function StepPath({ values, errors, set }: StepProps) {
  return (
    <fieldset className="space-y-3" aria-describedby={errors.path ? 'path-error' : undefined}>
      <legend className="sr-only">Which best describes you?</legend>
      {(Object.keys(PATH_INFO) as LearnerPath[]).map((path) => {
        const Icon = PATH_ICONS[path];
        const selected = values.path === path;
        return (
          <label
            key={path}
            className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all focus-within:ring-2 focus-within:ring-[var(--color-brand-blue)]/40 ${
              selected
                ? 'border-[var(--color-brand-gold)] bg-amber-50/60 dark:bg-amber-950/20 shadow-sm'
                : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-[#111827]'
            }`}
          >
            <input type="radio" name="learner-path" value={path} checked={selected} onChange={() => set('path', path)} className="sr-only" />
            <span className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center ${selected ? 'bg-[var(--color-brand-gold)] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
              <Icon className="w-5 h-5" aria-hidden="true" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-bold text-gray-900 dark:text-white">{PATH_INFO[path].title}</span>
              <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">{PATH_INFO[path].description}</span>
            </span>
            <span
              className={`w-5 h-5 mt-0.5 shrink-0 rounded-full border-2 flex items-center justify-center ${selected ? 'border-[var(--color-brand-gold)] bg-[var(--color-brand-gold)]' : 'border-gray-300 dark:border-gray-600'}`}
              aria-hidden="true"
            >
              {selected && <Check className="w-3 h-3 text-white" />}
            </span>
          </label>
        );
      })}
      {errors.path && (
        <p id="path-error" className="text-xs font-medium text-[var(--color-brand-red)]">
          {errors.path}
        </p>
      )}
      <p className="text-[11px] text-gray-500 dark:text-gray-400">You can change this later in your profile.</p>
    </fieldset>
  );
}

// ---------------------------------------------------------------------------------------------------------
// Step 2 — about you
// ---------------------------------------------------------------------------------------------------------
export function StepPersonal({ values, errors, set }: StepProps) {
  return (
    <div className="space-y-4">
      <Input id="reg-fullName" label="Full name" autoComplete="name" value={values.fullName} onChange={(e) => set('fullName', e.target.value)} error={errors.fullName} maxLength={LIMITS.fullName} placeholder="e.g. Ada Okafor" />
      <Input
        id="reg-username"
        label="Username"
        autoComplete="username"
        value={values.username}
        onChange={(e) => set('username', e.target.value)}
        error={errors.username}
        maxLength={LIMITS.username}
        placeholder="e.g. ada_learns"
        helperText="Shown on leaderboards. Availability is checked when you create the account."
        spellCheck={false}
        autoCapitalize="none"
      />
      <Input id="reg-email" label="Email address" type="email" inputMode="email" autoComplete="email" value={values.email} onChange={(e) => set('email', e.target.value)} error={errors.email} maxLength={LIMITS.email} placeholder="name@example.com" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input id="reg-dob" label="Date of birth (optional)" type="date" autoComplete="bday" value={values.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)} error={errors.dateOfBirth} />
        <Input id="reg-country" label="Country (optional)" autoComplete="country-name" value={values.country} onChange={(e) => set('country', e.target.value)} error={errors.country} maxLength={LIMITS.country} placeholder="e.g. Nigeria" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------
// Step 3 — security (secrets are kept outside `values` and are never saved in a draft)
// ---------------------------------------------------------------------------------------------------------
function strength(password: string): { score: number; label: string } {
  const checks = [password.length >= 8, /[A-Z]/.test(password) && /[a-z]/.test(password), /\d/.test(password), /[^A-Za-z0-9]/.test(password)];
  const score = password ? checks.filter(Boolean).length : 0;
  return { score, label: ['', 'Weak', 'Fair', 'Good', 'Strong'][score] };
}

export function StepSecurity({
  values,
  errors,
  set,
  secrets,
  setSecret,
}: StepProps & { secrets: Secrets; setSecret: (key: keyof Secrets, value: string) => void }) {
  const [show, setShow] = useState(false);
  const s = strength(secrets.password);
  const meterId = useId();
  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          id="reg-password"
          label="Password"
          type={show ? 'text' : 'password'}
          autoComplete="new-password"
          value={secrets.password}
          onChange={(e) => setSecret('password', e.target.value)}
          error={errors.password}
          helperText={`At least ${PASSWORD_MIN} characters. Longer passwords with numbers and symbols are stronger.`}
          className="pr-11"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? 'Hide password' : 'Show password'}
          aria-pressed={show}
          className="absolute right-2 top-[30px] p-2 rounded-lg text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-blue)]"
        >
          {show ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
        </button>
      </div>
      {secrets.password && (
        <div className="space-y-1" id={meterId}>
          <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden" aria-hidden="true">
            <div
              className={`h-full transition-all duration-300 ${s.score <= 1 ? 'bg-[var(--color-brand-red)]' : s.score <= 2 ? 'bg-[var(--color-brand-orange)]' : s.score === 3 ? 'bg-[var(--color-brand-gold)]' : 'bg-[var(--color-brand-green)]'}`}
              style={{ width: `${(s.score / 4) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-500" aria-live="polite">
            Password strength: {s.label}
          </p>
        </div>
      )}
      <Input
        id="reg-confirm"
        label="Confirm password"
        type={show ? 'text' : 'password'}
        autoComplete="new-password"
        value={secrets.confirmPassword}
        onChange={(e) => setSecret('confirmPassword', e.target.value)}
        error={errors.confirmPassword}
      />
      <div className="pt-1">
        <label className="flex items-start gap-2.5 text-xs text-gray-600 dark:text-gray-300 leading-snug cursor-pointer">
          <input
            type="checkbox"
            checked={values.termsAccepted}
            onChange={(e) => set('termsAccepted', e.target.checked)}
            aria-invalid={errors.termsAccepted ? true : undefined}
            aria-describedby={errors.termsAccepted ? 'terms-error' : undefined}
            className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-[var(--color-brand-blue)]"
          />
          <span>
            I agree to the{' '}
            <Link href="/Legal&Help/TermsOfService" target="_blank" className="font-semibold text-[var(--color-brand-blue)] hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/Legal&Help/PrivacyPolicy" target="_blank" className="font-semibold text-[var(--color-brand-blue)] hover:underline">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        {errors.termsAccepted && (
          <p id="terms-error" className="text-xs font-medium text-[var(--color-brand-red)] mt-1">
            {errors.termsAccepted}
          </p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------
// Step 4 — education / examinations (only the selected path's fields)
// ---------------------------------------------------------------------------------------------------------
export function StepEducation({ values, errors, set, options }: StepProps & { options: AcademicOptions | null }) {
  const [examInput, setExamInput] = useState('');
  const exams = useMemo(() => cleanExams(values.exams), [values.exams]);
  const toggleExam = (name: string) => {
    const on = exams.some((e) => e.toLowerCase() === name.toLowerCase());
    set('exams', on ? exams.filter((e) => e.toLowerCase() !== name.toLowerCase()) : cleanExams([...exams, name]));
  };

  if (values.path === 'secondary') {
    return (
      <div className="space-y-4">
        <Input id="reg-school" label="School name (optional)" autoComplete="organization" value={values.secondarySchool} onChange={(e) => set('secondarySchool', e.target.value)} error={errors.secondarySchool} maxLength={LIMITS.text} placeholder="e.g. Federal Government College" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ChoiceField id="reg-class" label="Current class" value={values.secondaryClass} options={options?.secondaryLevels ?? null} onChange={(v) => set('secondaryClass', v)} error={errors.secondaryClass} placeholder="e.g. SS 2" />
          <ChoiceField id="reg-stream" label="Stream" optional value={values.secondaryStream} options={options?.secondaryStreams ?? null} onChange={(v) => set('secondaryStream', v)} placeholder="e.g. Science" />
        </div>
      </div>
    );
  }

  if (values.path === 'university') {
    return (
      <div className="space-y-4">
        <Input id="reg-university" label="University or institution" autoComplete="organization" value={values.university} onChange={(e) => set('university', e.target.value)} error={errors.university} maxLength={LIMITS.text} placeholder="e.g. Obafemi Awolowo University" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input id="reg-faculty" label="Faculty (optional)" value={values.faculty} onChange={(e) => set('faculty', e.target.value)} error={errors.faculty} maxLength={LIMITS.text} placeholder="e.g. Technology" />
          <Input id="reg-department" label="Department (optional)" value={values.department} onChange={(e) => set('department', e.target.value)} error={errors.department} maxLength={LIMITS.text} placeholder="e.g. Computer Science" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input id="reg-course" label="Course of study (optional)" value={values.courseOfStudy} onChange={(e) => set('courseOfStudy', e.target.value)} error={errors.courseOfStudy} maxLength={LIMITS.text} placeholder="e.g. Computer Engineering" />
          <ChoiceField id="reg-level" label="Level" optional value={values.level} options={options?.universityLevels ?? null} onChange={(v) => set('level', v)} placeholder="e.g. 200 Level" />
        </div>
      </div>
    );
  }

  // exam preparation
  return (
    <div className="space-y-4">
      <fieldset aria-describedby={errors.exams ? 'exams-error' : 'exams-help'}>
        <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Which examinations are you preparing for?</legend>
        <div className="flex flex-wrap gap-2">
          {[...EXAM_SUGGESTIONS, ...exams.filter((e) => !EXAM_SUGGESTIONS.some((s) => s.toLowerCase() === e.toLowerCase()))].map((name) => {
            const on = exams.some((e) => e.toLowerCase() === name.toLowerCase());
            return (
              <button
                key={name}
                type="button"
                aria-pressed={on}
                onClick={() => toggleExam(name)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-blue)] ${
                  on ? 'border-[var(--color-brand-gold)] bg-[var(--color-brand-gold)] text-white' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                }`}
              >
                {on && <Check className="w-3 h-3 inline mr-1" aria-hidden="true" />}
                {name}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2 mt-3">
          <label htmlFor="reg-exam-other" className="sr-only">Add another examination</label>
          <input
            id="reg-exam-other"
            value={examInput}
            onChange={(e) => setExamInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (examInput.trim()) toggleExam(examInput);
                setExamInput('');
              }
            }}
            maxLength={60}
            placeholder="Another exam, e.g. IELTS"
            className={`${fieldClass} border-gray-300 dark:border-[#1F2937] focus:border-[var(--color-brand-blue)] focus:ring-[var(--color-brand-blue)]/20`}
          />
          <button
            type="button"
            onClick={() => {
              if (examInput.trim()) toggleExam(examInput);
              setExamInput('');
            }}
            className="px-4 rounded-xl text-sm font-semibold border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Add
          </button>
        </div>
        {errors.exams ? (
          <p id="exams-error" className="text-xs font-medium text-[var(--color-brand-red)] mt-2">{errors.exams}</p>
        ) : (
          <p id="exams-help" className="text-[11px] text-gray-500 mt-2">Common examinations are listed; add any other you are preparing for.</p>
        )}
      </fieldset>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input id="reg-timeframe" label="When is your exam? (optional)" value={values.examTimeframe} onChange={(e) => set('examTimeframe', e.target.value)} maxLength={80} placeholder="e.g. May 2027" />
        <Input id="reg-subjects" label="Subjects (optional)" value={values.subjects} onChange={(e) => set('subjects', e.target.value)} error={errors.subjects} maxLength={LIMITS.text} placeholder="e.g. Maths, Physics, English" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------
// Step 5 — goals & preferences (all optional)
// ---------------------------------------------------------------------------------------------------------
export function StepGoals({ values, errors, set }: StepProps) {
  return (
    <div className="space-y-4">
      <div className="w-full flex flex-col gap-1.5">
        <label htmlFor="reg-goals" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          What do you want to achieve? (optional)
        </label>
        <textarea
          id="reg-goals"
          rows={3}
          value={values.goals}
          onChange={(e) => set('goals', e.target.value)}
          maxLength={LIMITS.goals}
          aria-invalid={errors.goals ? true : undefined}
          placeholder={values.path === 'exam' ? 'e.g. Score 300+ in JAMB' : values.path === 'university' ? 'e.g. First-class degree' : 'e.g. Distinctions in my WAEC subjects'}
          className={`${fieldClass} border-gray-300 dark:border-[#1F2937] focus:border-[var(--color-brand-blue)] focus:ring-[var(--color-brand-blue)]/20`}
        />
        {errors.goals && <span className="text-xs text-[var(--color-brand-red)] font-medium">{errors.goals}</span>}
      </div>
      <fieldset>
        <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">When do you usually study? (optional)</legend>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {STUDY_TIMES.map((t) => {
            const on = values.preferredStudyTime === t;
            return (
              <button
                key={t}
                type="button"
                aria-pressed={on}
                onClick={() => set('preferredStudyTime', on ? '' : t)}
                className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-blue)] ${
                  on ? 'border-[var(--color-brand-blue)] bg-[var(--color-brand-blue)] text-white' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </fieldset>
      <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
        <BookOpen className="w-3.5 h-3.5" aria-hidden="true" /> You can skip this — it only helps us suggest what to study first.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------
// Step 6 — review
// ---------------------------------------------------------------------------------------------------------
export function StepReview({ values, onEdit }: { values: RegistrationValues; onEdit: (step: StepId) => void }) {
  return (
    <div className="space-y-3">
      {reviewSections(values).map((section) => (
        <section key={section.step} className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4" aria-labelledby={`review-${section.step}`}>
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 id={`review-${section.step}`} className="text-xs font-bold uppercase tracking-wider text-gray-500">
              {section.title}
            </h3>
            <button type="button" onClick={() => onEdit(section.step)} className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-brand-blue)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-blue)] rounded">
              <Pencil className="w-3 h-3" aria-hidden="true" /> Edit<span className="sr-only"> {section.title}</span>
            </button>
          </div>
          {section.rows.length === 0 ? (
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <X className="w-3 h-3" aria-hidden="true" /> Nothing added
            </p>
          ) : (
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              {section.rows.map(([k, v]) => (
                <React.Fragment key={k}>
                  <dt className="text-gray-500 dark:text-gray-400">{k}</dt>
                  <dd className="text-gray-900 dark:text-gray-100 break-words">{v}</dd>
                </React.Fragment>
              ))}
            </dl>
          )}
        </section>
      ))}
    </div>
  );
}
