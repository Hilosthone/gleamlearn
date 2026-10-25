/**
 * ---------------------------------------------------------------------------
 * lib/profile.ts — The learner's own profile and preferences (typed wrappers over existing api.ts clients)
 * ---------------------------------------------------------------------------
 * Backend contract (verified 2026-10-25):
 *   GET   /users/me                     → the learner (no password hash, codes or tokens)
 *   PATCH /users/me                     ← { fullName?, username?, dateOfBirth?, country? } (email can't be changed here)
 *   PATCH /users/me/academic-profile    ← { educationType?, secondarySchool?, secondaryStream?, university?, faculty?,
 *                                           department?, courseOfStudy?, levelOrClass? (stored in `level`), examAimOrGoals? }
 *   PATCH /users/me/preferences         ← { preferredStudyTime? }   (preferredLearningPace is accepted but not stored)
 *   GET/PATCH /notifications/settings   ↔ { emailAlerts, pushNotifications, aiTutorReminders, marketingEmails }
 *   GET/PATCH /ai-companion             ↔ { name, gender, personality, teachingStyle, voice, appearance, outfit }
 *   GET   /achievements/me              → { unlockedAchievements: [...] }
 * Not stored by the backend (so not offered as editable): bio, profile picture, privacy settings, learning pace,
 * session length, difficulty. Only changed fields are sent.
 */

import { achievementsApi, aiCompanionApi, notificationsApi, usersApi } from './api.ts';

const str = (v: unknown): string => (typeof v === 'string' ? v : '');

export interface LearnerProfile {
  id: string;
  fullName: string;
  username: string;
  email: string;
  country: string;
  dateOfBirth: string;
  educationType: string;
  secondarySchool: string;
  secondaryClass: string;
  secondaryStream: string;
  university: string;
  faculty: string;
  department: string;
  courseOfStudy: string;
  level: string;
  examAimOrGoals: string;
  preferredStudyTime: string;
  isEmailVerified: boolean;
  createdAt: string;
}

/** Accepts the user object or `{ data: user }`. */
export function toProfile(res: unknown): LearnerProfile {
  const r = ((res as { data?: unknown })?.data && typeof (res as { data?: unknown }).data === 'object'
    ? (res as { data: Record<string, unknown> }).data
    : (res ?? {})) as Record<string, unknown>;
  return {
    id: str(r.id),
    fullName: str(r.fullName),
    username: str(r.username),
    email: str(r.email),
    country: str(r.country),
    dateOfBirth: str(r.dateOfBirth),
    educationType: str(r.educationType),
    secondarySchool: str(r.secondarySchool),
    secondaryClass: str(r.secondaryClass),
    secondaryStream: str(r.secondaryStream),
    university: str(r.university),
    faculty: str(r.faculty),
    department: str(r.department),
    courseOfStudy: str(r.courseOfStudy),
    level: str(r.level),
    examAimOrGoals: str(r.examAimOrGoals),
    preferredStudyTime: str(r.preferredStudyTime),
    isEmailVerified: r.isEmailVerified === true,
    createdAt: str(r.createdAt),
  };
}

// ---------------------------------------------------------------------------------------------------------
// Basic details
// ---------------------------------------------------------------------------------------------------------

export interface BasicForm {
  fullName: string;
  username: string;
  country: string;
  dateOfBirth: string;
}

export const basicFormOf = (p: LearnerProfile): BasicForm => ({
  fullName: p.fullName,
  username: p.username,
  country: p.country,
  dateOfBirth: p.dateOfBirth,
});

/** Same limits as the backend (users table / DTOs), so the learner sees the problem before saving. */
export function validateBasic(f: BasicForm): Partial<Record<keyof BasicForm, string>> {
  const e: Partial<Record<keyof BasicForm, string>> = {};
  if (!f.fullName.trim()) e.fullName = 'Enter your full name.';
  else if (f.fullName.trim().length > 150) e.fullName = 'Use at most 150 characters.';
  if (!f.username.trim()) e.username = 'Enter a username.';
  else if (f.username.trim().length > 100) e.username = 'Use at most 100 characters.';
  if (f.country.trim().length > 100) e.country = 'Use at most 100 characters.';
  if (f.dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(f.dateOfBirth)) e.dateOfBirth = 'Use the date picker (YYYY-MM-DD).';
  return e;
}

/** Only the fields that changed (trimmed). Required fields are never cleared. */
export function basicChanges(p: LearnerProfile, f: BasicForm): Partial<BasicForm> {
  const out: Partial<BasicForm> = {};
  for (const key of ['fullName', 'username', 'country', 'dateOfBirth'] as const) {
    const next = f[key].trim();
    if ((key === 'fullName' || key === 'username') && !next) continue;
    if (next !== p[key]) out[key] = next;
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------------
// Academic details
// ---------------------------------------------------------------------------------------------------------

export type Track = 'Secondary' | 'University' | '';

export interface AcademicForm {
  educationType: Track;
  secondarySchool: string;
  secondaryStream: string;
  university: string;
  faculty: string;
  department: string;
  courseOfStudy: string;
  level: string;
  examAimOrGoals: string;
}

export function academicFormOf(p: LearnerProfile): AcademicForm {
  const track: Track = p.educationType === 'Secondary' || p.educationType === 'University' ? p.educationType : '';
  return {
    educationType: track,
    secondarySchool: p.secondarySchool,
    secondaryStream: p.secondaryStream,
    university: p.university,
    faculty: p.faculty,
    department: p.department,
    courseOfStudy: p.courseOfStudy,
    level: p.level,
    examAimOrGoals: p.examAimOrGoals,
  };
}

/** Changed academic fields, as the backend expects them (`level` is sent as `levelOrClass`). */
export function academicChanges(p: LearnerProfile, f: AcademicForm): Record<string, string> {
  const out: Record<string, string> = {};
  const before = academicFormOf(p);
  for (const key of Object.keys(f) as (keyof AcademicForm)[]) {
    const next = f[key].trim();
    if (next === before[key]) continue;
    if (key === 'educationType' && !next) continue; // no "unset track" in the backend
    out[key === 'level' ? 'levelOrClass' : key] = next;
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------------
// Notification settings, companion, achievements
// ---------------------------------------------------------------------------------------------------------

export interface NotificationSettings {
  emailAlerts: boolean;
  pushNotifications: boolean;
  aiTutorReminders: boolean;
  marketingEmails: boolean;
}
export const NOTIFICATION_SETTING_KEYS: (keyof NotificationSettings)[] = ['emailAlerts', 'pushNotifications', 'aiTutorReminders', 'marketingEmails'];

export function toNotificationSettings(res: unknown): NotificationSettings {
  const d = ((res as { data?: unknown })?.data ?? res ?? {}) as Record<string, unknown>;
  return {
    emailAlerts: d.emailAlerts !== false,
    pushNotifications: d.pushNotifications !== false,
    aiTutorReminders: d.aiTutorReminders !== false,
    marketingEmails: d.marketingEmails === true,
  };
}

export interface Companion {
  name: string;
  gender: string;
  personality: string;
  teachingStyle: string;
  voice: string;
  appearance: string;
}
export const COMPANION_KEYS: (keyof Companion)[] = ['name', 'gender', 'personality', 'teachingStyle', 'voice', 'appearance'];

/** Same choices as onboarding (StepAiCompanion); the current value is always kept selectable. */
export const COMPANION_OPTIONS: Partial<Record<keyof Companion, string[]>> = {
  gender: ['Neutral', 'Female', 'Male'],
  personality: ['Encouraging & Detailed', 'Strict & Analytical', 'Casual & Friendly'],
  teachingStyle: ['Socratic (Question-based)', 'Direct Explanations', 'Analogy-driven'],
  appearance: ['Modern Hologram', 'Friendly Robot', 'Academic Scholar'],
};

export function toCompanion(res: unknown): Companion {
  const d = ((res as { data?: unknown })?.data ?? res ?? {}) as Record<string, unknown>;
  return { name: str(d.name), gender: str(d.gender), personality: str(d.personality), teachingStyle: str(d.teachingStyle), voice: str(d.voice), appearance: str(d.appearance) };
}

export function changedFields<T extends object>(before: T, after: T): Partial<T> {
  const out: Partial<T> = {};
  for (const key of Object.keys(after) as (keyof T)[]) if (after[key] !== before[key]) out[key] = after[key];
  return out;
}

export function achievementCount(res: unknown): number {
  const list = (res as { unlockedAchievements?: unknown })?.unlockedAchievements;
  return Array.isArray(list) ? list.length : 0;
}

// ---------------------------------------------------------------------------------------------------------
// Requests
// ---------------------------------------------------------------------------------------------------------

export const loadProfile = async () => toProfile(await usersApi.getMe());
export const saveBasic = async (changes: Partial<BasicForm>) => toProfile(await usersApi.updateMe(changes));
export const saveAcademic = (changes: Record<string, string>) => usersApi.updateAcademicProfile(changes);
export const saveStudyTime = (preferredStudyTime: string) => usersApi.updatePreferences({ preferredStudyTime });
export const loadNotificationSettings = async () => toNotificationSettings(await notificationsApi.getSettings());
export const saveNotificationSettings = async (changes: Partial<NotificationSettings>) => toNotificationSettings(await notificationsApi.updateSettings(changes));
export const loadCompanion = async () => toCompanion(await aiCompanionApi.getAiCompanion());
export const saveCompanion = async (changes: Partial<Companion>) => toCompanion(await aiCompanionApi.updateAiCompanion(changes));
export const loadAchievementCount = async () => achievementCount(await achievementsApi.getMyAchievements());
