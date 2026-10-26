/**
 * ---------------------------------------------------------------------------
 * lib/support.ts — Problem reports and feedback (typed wrappers over existing api.ts clients)
 * ---------------------------------------------------------------------------
 * Backend contract (verified 2026-10-26):
 *   GET  /reports/me                         → the learner's reports; 501 FEATURE_UNAVAILABLE while the tables don't exist
 *   POST /reports { type, reason, details? } → type ∈ SPAM | INAPPROPRIATE | COPYRIGHT | OTHER
 *   POST /feedback { message, rating 1..5 }
 * While these are unavailable the page offers an email to the published support address instead.
 */

import { ApiError } from './api-error.ts';
import { reportsFeedbackApi, subscriptionsPaymentsApi } from './api.ts';

export const SUPPORT_EMAIL = 'gleamlearn.ai@gmail.com';

export const PROBLEM_CATEGORIES = ['Something is broken', 'Account or sign-in', 'Lessons or courses', 'Practice, quizzes or exams', 'AI tutor or assistant', 'Other'] as const;

/** true: reports can be sent; false: the backend says the feature isn't available (501). Other failures throw. */
export async function reportsAvailable(): Promise<boolean> {
  try {
    await reportsFeedbackApi.getMyReports();
    return true;
  } catch (e) {
    if (e instanceof ApiError && e.kind === 'not_implemented') return false;
    throw e;
  }
}

export const submitProblem = (category: string, description: string) =>
  reportsFeedbackApi.submitReport({ type: 'OTHER', reason: category, details: description.trim() });

export const submitFeedback = (rating: number, message: string) => reportsFeedbackApi.submitFeedback({ rating: Math.round(rating), message: message.trim() });

export function mailtoHref(subject: string, body: string): string {
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export interface HelpArticle {
  id: string;
  topic: string;
  title: string;
  body: string;
}

/** Only describes what the app does today. */
export const HELP_ARTICLES: HelpArticle[] = [
  { id: 'profile', topic: 'Account', title: 'Change your profile, school details or password', body: 'Open Settings. Edit profile changes your name, username and academic details; Account → Change password updates your password. Freezing or deleting your account is under Account state.' },
  { id: 'verify', topic: 'Account', title: "My verification email didn't arrive", body: 'You can still sign in and study. Check your spam folder; if nothing arrives, email support and tell us the address you signed up with.' },
  { id: 'ai', topic: 'AI', title: 'Using the AI assistant and tutor', body: 'Open AI. The assistant and tutor sessions save your conversations. Answers appear in full once ready. Each assistant message is answered on its own, so include the details the AI needs in every question.' },
  { id: 'xp', topic: 'Progress', title: 'How XP and coins are earned', body: 'XP and coins are awarded by the server when you submit a quiz. Submitting the same quiz again is graded but does not earn again. Your totals and history are in Progress.' },
  { id: 'streak', topic: 'Progress', title: 'Keeping your streak', body: 'Check in once a day in Progress → Streak. If you miss a day and have a recovery token, you can use it there to restore your streak.' },
  { id: 'practice', topic: 'Practice', title: 'How quizzes, tests and exams are graded', body: 'Your answers are graded automatically against the stored answers and you see your score straight away. Past attempts are not kept in a history yet.' },
  { id: 'library', topic: 'Library', title: 'Saving courses, notes and flashcards', body: 'Use “Save to library” on a course page. Notes and flashcard decks are created in Library; flashcards due today appear under Review today. Uploading your own files is not available yet.' },
  { id: 'premium', topic: 'Premium', title: 'Premium plans and payments', body: 'Premium plans are not available yet and no payments are taken. Everything you can use today is free.' },
];

// Premium --------------------------------------------------------------------------------------------------------

export type SubscriptionStatus = { kind: 'unavailable' } | { kind: 'none' } | { kind: 'active'; planName: string; endsAt: string | null };

/**
 * GET /subscription → { active: false } | { active: true, subscription: { plan: { name }, endDate } }; 501 while the
 * subscription tables don't exist. Paying, upgrading and cancelling all answer 501 until a payment provider with
 * server-side verification is integrated, so the page never offers them.
 */
export async function loadSubscriptionStatus(): Promise<SubscriptionStatus> {
  try {
    const res = (await subscriptionsPaymentsApi.getCurrentSubscription()) as Record<string, unknown> | null;
    if (res?.active !== true) return { kind: 'none' };
    const sub = (res.subscription ?? {}) as Record<string, unknown>;
    const plan = (sub.plan ?? {}) as Record<string, unknown>;
    return { kind: 'active', planName: typeof plan.name === 'string' && plan.name ? plan.name : 'Premium', endsAt: typeof sub.endDate === 'string' ? sub.endDate : null };
  } catch (e) {
    if (e instanceof ApiError && e.kind === 'not_implemented') return { kind: 'unavailable' };
    throw e;
  }
}
