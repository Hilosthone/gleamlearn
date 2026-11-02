/**
 * ---------------------------------------------------------------------------
 * lib/support.ts — Problem reports and feedback (typed wrappers over existing api.ts clients)
 * ---------------------------------------------------------------------------
 * Backend contract (verified 2026-10-29):
 *   GET  /reports/me                         → [{ id, type, target, targetId, reason, details, status, createdAt }];
 *                                              501 FEATURE_UNAVAILABLE if the table is missing
 *   POST /reports { type, reason, details? } → type ∈ SPAM | INAPPROPRIATE | COPYRIGHT | OTHER; stored for moderators
 *   POST /questions/:id/report               → the same, about one question (past questions, question bank)
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

export const reportQuestion = (questionId: string, description: string) =>
  reportsFeedbackApi.reportQuestion(encodeURIComponent(questionId), { type: 'OTHER', reason: 'Problem with a question', details: description.trim() });

export interface MyReport {
  id: string;
  reason: string;
  details: string | null;
  /** GENERAL, QUESTION or CONTENT */
  target: string;
  /** PENDING, RESOLVED or REJECTED (set by moderators) */
  status: string;
  createdAt: string;
}

export function toMyReports(res: unknown): MyReport[] {
  return (Array.isArray(res) ? res : [])
    .map((x) => (x ?? {}) as Record<string, unknown>)
    .filter((r) => typeof r.id === 'string' && typeof r.reason === 'string')
    .map((r) => ({
      id: r.id as string,
      reason: r.reason as string,
      details: typeof r.details === 'string' ? r.details : null,
      target: typeof r.target === 'string' ? r.target : 'GENERAL',
      status: typeof r.status === 'string' ? r.status.toUpperCase() : 'PENDING',
      createdAt: typeof r.createdAt === 'string' ? r.createdAt : '',
    }));
}

export const loadMyReports = async () => toMyReports(await reportsFeedbackApi.getMyReports());

export const REPORT_STATUS_LABEL: Record<string, string> = { PENDING: 'Waiting for review', RESOLVED: 'Resolved', REJECTED: 'Closed — no action needed' };

export const submitFeedback = (rating: number, message: string) => reportsFeedbackApi.submitFeedback({ rating: Math.round(rating), message: message.trim() });

export function mailtoHref(subject: string, body: string): string {
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export interface HelpArticle {
  id: string;
  topic: string;
  title: string;
  body: string;
  /** where in the app this happens */
  link?: { href: string; label: string };
}

/** Only describes what the app does today (streak and reward numbers match the server's rules). */
export const HELP_ARTICLES: HelpArticle[] = [
  { id: 'profile', topic: 'Account', title: 'Change your profile, school details or password', body: 'Open Settings. Edit profile changes your name, username and academic details; Account → Change password updates your password. Freezing or deleting your account is under Account state.' },
  { id: 'verify', topic: 'Account', title: "My verification email didn't arrive", body: 'You can still sign in and study. Check your spam folder; if nothing arrives, email support and tell us the address you signed up with.' },
  { id: 'ai', topic: 'AI', title: 'Using the AI assistant and tutor', body: 'Open AI. The assistant and tutor sessions save your conversations. Answers appear in full once ready. Each assistant message is answered on its own, so include the details the AI needs in every question.' },
  {
    id: 'streak',
    topic: 'Streaks',
    title: 'How your streak works',
    body: 'Your streak is the number of days in a row you have used GleamLearn. The first time you open the app each day (signed in), that day counts automatically: there is no button to press. Completing a lesson, submitting a quiz, test or exam, or reviewing flashcards also counts. Days follow Nigerian time (WAT), so a new day starts at midnight WAT.',
    link: { href: '/progress?view=streak', label: 'Open your streak' },
  },
  {
    id: 'streak-recovery',
    topic: 'Streaks',
    title: 'Recovering missed days',
    body: 'If you miss a day, you can recover it when you come back, so your streak continues. Each recovery restores one missed day: if you missed three days in a row, you need three recoveries, and the oldest missed day is recovered first. You can use up to 4 recoveries each calendar month; the allowance starts again on the 1st. If the days you missed are more than the recoveries you have left this month, the gap cannot be recovered and your streak starts again from today (no recoveries are used). Recovered days count towards your streak and are listed in your recovery history.',
    link: { href: '/progress?view=streak', label: 'Recover on Progress → Streak' },
  },
  {
    id: 'streak-calendar',
    topic: 'Streaks',
    title: 'Reading the streak calendar',
    body: 'Progress → Streak shows a calendar for each month. Solid orange days are days you were active. Light orange days with an outline are days you recovered. Red, crossed-out days are days you missed after your first streak day. Today has an outline until it counts. Use the arrows to look at earlier months.',
    link: { href: '/progress?view=streak', label: 'Open the calendar' },
  },
  {
    id: 'rewards-daily',
    topic: 'Rewards',
    title: 'Daily visit reward',
    body: 'Your first signed-in visit each day earns 5 XP and 5 coins. It is given once per day, however many times you open the app, in how many tabs or on how many devices. You see a message on screen and the reward is saved in Notifications and in your XP and coin history.',
  },
  {
    id: 'rewards-time',
    topic: 'Rewards',
    title: 'Rewards for learning time',
    body: 'Every 10 minutes of active learning earns 2 XP and 2 coins, up to 60 minutes a day (6 rewards, 12 XP and 12 coins). Time counts while GleamLearn is open in front of you and you have used it in the last two minutes (clicked, typed, scrolled or tapped); a hidden tab or an idle screen does not count. Several tabs or devices share one clock, so time is never counted twice. Progress → Streak shows your learning time today and when the next reward is due.',
    link: { href: '/progress?view=streak', label: 'See your learning time today' },
  },
  {
    id: 'xp',
    topic: 'Rewards',
    title: 'How XP and coins are earned',
    body: 'XP and coins are given by the server, never by the app: when you submit a quiz (submitting the same quiz again is graded but does not earn again), for your daily visit, and for learning time. Your totals and full history are in Progress → XP history and Progress → Coins.',
    link: { href: '/progress?view=xp', label: 'Open your XP history' },
  },
  {
    id: 'notifications',
    topic: 'Rewards',
    title: 'Reward and streak messages',
    body: 'When you earn a reward or miss a streak day, a short message appears on screen and the same message is saved in Notifications. Browser and phone push notifications are not available yet, so you see these messages when you open GleamLearn.',
    link: { href: '/notifications', label: 'Open Notifications' },
  },
  {
    id: 'youtube-materials',
    topic: 'YouTube',
    title: 'Learning from a YouTube video',
    body: 'Open AI → YouTube and add a video link. GleamLearn reads the video’s captions as its transcript; you can then ask questions answered only from the transcript (with timestamps you can play) and make study material from it: lessons, summaries, notes, key concepts, flashcards, quizzes and mock exams. Everything you make is grouped in sections on the video’s page; open a section to see its items. Long transcripts are prepared once and reused, so making a second kind of material is quicker.',
    link: { href: '/ai?tab=youtube', label: 'Open YouTube sessions' },
  },
  {
    id: 'youtube-transcript',
    topic: 'YouTube',
    title: "When a video's transcript can't be fetched",
    body: 'The video page tells you why. “No captions” means the video has none; “private”, “age-restricted” or “unavailable” videos cannot be read. “YouTube refused”, “took too long” and “could not reach YouTube” are usually temporary: use “Try YouTube’s captions again” later. In every case you can upload the video’s caption file (.vtt or .srt, up to 2 MB) or paste the transcript or your own notes; lines that start with [mm:ss] become timestamps.',
  },
  { id: 'practice', topic: 'Practice', title: 'How quizzes, tests and exams are graded', body: 'Your answers are graded automatically against the stored answers and you see your score straight away. Official quizzes, tests and exams are saved: Practice → History lists them, and each one has a review of every question.' },
  { id: 'library', topic: 'Library', title: 'Saving courses, notes and flashcards', body: 'Use “Save to library” on a course page. Notes and flashcard decks are created in Library; flashcards due today appear under Review today. Upload your own PDF, Word or text files under Uploaded materials, and create private courses of your own under My courses. Only you can see them.' },
  { id: 'premium', topic: 'Premium', title: 'Premium plans and payments', body: 'Premium plans are not available yet and no payments are taken. Everything you can use today is free.' },
];

/** The articles linked from the learner dashboard. */
export const DASHBOARD_HELP: HelpArticle[] = ['streak', 'streak-recovery', 'rewards-daily', 'rewards-time', 'youtube-transcript']
  .map((id) => HELP_ARTICLES.find((a) => a.id === id))
  .filter((a): a is HelpArticle => Boolean(a));

export const helpArticle = (id: string | null | undefined) => (id ? (HELP_ARTICLES.find((a) => a.id === id) ?? null) : null);

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
