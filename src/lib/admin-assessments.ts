/**
 * ---------------------------------------------------------------------------
 * lib/admin-assessments.ts — Editing quizzes, tests and exams (pure helpers for the admin Assessments page)
 * ---------------------------------------------------------------------------
 * Questions are stored as JSON: { question, options[], correctAnswer, explanation? }. The grader
 * (backend gradeQuiz) accepts correctAnswer as the option text or as a letter (A = first option); the editor
 * always saves the option text.
 */

import type { AdminAssessment, AssessmentInput } from './admin-api.ts';

export interface QuestionDraft {
  question: string;
  options: string; // one option per line
  correctAnswer: string; // the option text
  explanation: string;
}

export interface AssessmentDraft {
  title: string;
  description: string;
  durationMinutes: string; // tests and exams; '' = none
  questions: QuestionDraft[];
}

const str = (v: unknown) => (typeof v === 'string' ? v : typeof v === 'number' ? String(v) : '');
export const optionsOf = (q: QuestionDraft) => q.options.split('\n').map((o) => o.trim()).filter(Boolean);
export const emptyQuestion = (): QuestionDraft => ({ question: '', options: '', correctAnswer: '', explanation: '' });

/** A stored answer may be a letter ("B") or the option text; the editor shows the option text. */
export function answerText(options: string[], stored: unknown): string {
  const s = str(stored).trim();
  if (options.includes(s)) return s;
  if (/^[A-Za-z]$/.test(s)) return options[s.toUpperCase().charCodeAt(0) - 65] ?? s;
  return s;
}

export function toDraft(a: AdminAssessment | null): AssessmentDraft {
  if (!a) return { title: '', description: '', durationMinutes: '', questions: [emptyQuestion()] };
  const questions = (Array.isArray(a.questions) ? a.questions : []).map((q) => {
    const options = (Array.isArray(q?.options) ? q.options : []).map(str).filter(Boolean);
    return { question: str(q?.question), options: options.join('\n'), correctAnswer: answerText(options, q?.correctAnswer ?? q?.answer ?? q?.correct_answer), explanation: str(q?.explanation) };
  });
  return {
    title: str(a.title),
    description: str(a.description),
    durationMinutes: typeof a.durationMinutes === 'number' ? String(a.durationMinutes) : '',
    questions: questions.length ? questions : [emptyQuestion()],
  };
}

/** Returns the problems to fix (empty when the draft can be saved). */
export function validateDraft(d: AssessmentDraft, timed: boolean): string[] {
  const errors: string[] = [];
  if (!d.title.trim()) errors.push('Enter a title.');
  if (timed && d.durationMinutes.trim() && !(Number.isInteger(Number(d.durationMinutes)) && Number(d.durationMinutes) > 0)) errors.push('The duration must be a whole number of minutes.');
  if (d.questions.length === 0) errors.push('Add at least one question.');
  d.questions.forEach((q, i) => {
    const n = i + 1;
    const opts = optionsOf(q);
    if (!q.question.trim()) errors.push(`Question ${n}: enter the question.`);
    if (opts.length < 2) errors.push(`Question ${n}: add at least two options.`);
    if (new Set(opts).size !== opts.length) errors.push(`Question ${n}: options must be different.`);
    if (!opts.includes(q.correctAnswer.trim())) errors.push(`Question ${n}: choose the correct option.`);
  });
  return errors;
}

export function toInput(d: AssessmentDraft, timed: boolean): AssessmentInput {
  return {
    title: d.title.trim(),
    ...(d.description.trim() ? { description: d.description.trim() } : {}),
    ...(timed && d.durationMinutes.trim() ? { durationMinutes: Number(d.durationMinutes) } : {}),
    questions: d.questions.map((q) => ({
      question: q.question.trim(),
      options: optionsOf(q),
      correctAnswer: q.correctAnswer.trim(),
      ...(q.explanation.trim() ? { explanation: q.explanation.trim() } : {}),
    })),
  };
}

export const questionCount = (a: AdminAssessment) => (Array.isArray(a.questions) ? a.questions.length : 0);
