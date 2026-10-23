/**
 * ---------------------------------------------------------------------------
 * lib/registration/draft.ts — Privacy-conscious registration drafts (resume after refresh / return)
 * ---------------------------------------------------------------------------
 * The backend has no registration-draft endpoint, so drafts are client-side only:
 *   - always kept for the current TAB (sessionStorage) so a refresh does not lose progress;
 *   - kept on the DEVICE (localStorage) only when the learner ticks "Save progress on this device",
 *     with a visible notice that non-secret details are stored on this device.
 * Never stored: password, confirmPassword, tokens, OTPs (they are not in the allowlist below).
 * Drafts are versioned and expire; malformed, expired or newer-format drafts are discarded safely.
 * No draft data is ever put in a URL or sent anywhere.
 *
 * Kept free of path aliases so it can be unit-tested with `node --test`.
 */

import { EMPTY_VALUES, STEPS, type LearnerPath, type RegistrationValues, type StepId } from './wizard.ts';

export const DRAFT_KEY = 'gleamlearn.registrationDraft';
export const DRAFT_VERSION = 1;
export const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days on the device

/** The ONLY keys a draft may contain. Secrets are deliberately absent. */
const STRING_KEYS = [
  'fullName', 'username', 'email', 'dateOfBirth', 'country',
  'secondarySchool', 'secondaryClass', 'secondaryStream',
  'university', 'faculty', 'department', 'courseOfStudy', 'level',
  'examTimeframe', 'subjects', 'goals', 'preferredStudyTime',
] as const satisfies ReadonlyArray<keyof RegistrationValues>;

const PATHS: ReadonlyArray<LearnerPath> = ['secondary', 'university', 'exam'];

export interface Draft {
  version: number;
  savedAt: number; // epoch ms
  step: StepId;
  persistent: boolean; // saved on the device (opt-in) vs this tab only
  values: RegistrationValues;
}

export type ParsedDraft =
  | { ok: true; draft: Draft }
  | { ok: false; reason: 'none' | 'malformed' | 'expired' | 'unsupported-version' };

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Serializes ONLY allowlisted, non-secret values. The review step is never restored as the current step. */
export function serializeDraft(values: RegistrationValues, step: StepId, persistent: boolean, now: number): string {
  const safe: Record<string, unknown> = { path: values.path, termsAccepted: false, exams: values.exams.slice(0, 8).map((x) => String(x).slice(0, 60)) };
  for (const key of STRING_KEYS) safe[key] = String(values[key] ?? '').slice(0, 1000);
  // Terms are re-confirmed on return (consent is given at the moment of creating the account).
  return JSON.stringify({ version: DRAFT_VERSION, savedAt: now, step: step === 'review' ? 'goals' : step, persistent, values: safe });
}

export function parseDraft(raw: string | null | undefined, now: number): ParsedDraft {
  if (!raw) return { ok: false, reason: 'none' };
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { ok: false, reason: 'malformed' };
  }
  if (!data || typeof data !== 'object') return { ok: false, reason: 'malformed' };
  const d = data as Record<string, unknown>;
  if (typeof d.version !== 'number') return { ok: false, reason: 'malformed' };
  if (d.version > DRAFT_VERSION) return { ok: false, reason: 'unsupported-version' };
  // (future versions: migrate older shapes here before validating)
  if (typeof d.savedAt !== 'number' || d.savedAt > now + 60_000) return { ok: false, reason: 'malformed' };
  if (now - d.savedAt > DRAFT_TTL_MS) return { ok: false, reason: 'expired' };
  const src = d.values && typeof d.values === 'object' ? (d.values as Record<string, unknown>) : null;
  if (!src) return { ok: false, reason: 'malformed' };

  const values: RegistrationValues = { ...EMPTY_VALUES, exams: [] };
  values.path = PATHS.includes(src.path as LearnerPath) ? (src.path as LearnerPath) : null;
  for (const key of STRING_KEYS) values[key] = typeof src[key] === 'string' ? (src[key] as string).slice(0, 1000) : '';
  values.exams = Array.isArray(src.exams) ? src.exams.filter((x): x is string => typeof x === 'string').slice(0, 8) : [];
  values.termsAccepted = false;

  let step: StepId = STEPS.includes(d.step as StepId) ? (d.step as StepId) : 'path';
  if (!values.path) step = 'path'; // a path is needed before any later step makes sense
  if (step === 'review') step = 'goals';
  return { ok: true, draft: { version: DRAFT_VERSION, savedAt: d.savedAt, step, persistent: d.persistent === true, values } };
}

/** True when a draft holds something worth offering to resume. */
export function draftHasContent(values: RegistrationValues): boolean {
  return Boolean(values.path || values.fullName.trim() || values.email.trim() || values.username.trim());
}

/** Storage helpers: sessionStorage always, localStorage only when the learner opted in. Failures are ignored. */
export function saveDraft(stores: { session?: KeyValueStore | null; local?: KeyValueStore | null }, serialized: string, persistent: boolean): void {
  try { stores.session?.setItem(DRAFT_KEY, serialized); } catch { /* storage unavailable */ }
  try {
    if (persistent) stores.local?.setItem(DRAFT_KEY, serialized);
    else stores.local?.removeItem(DRAFT_KEY); // opting out removes the device copy immediately
  } catch { /* storage unavailable */ }
}

/** The newest valid draft (this tab first, then the device). Invalid copies are removed. */
export function loadDraft(stores: { session?: KeyValueStore | null; local?: KeyValueStore | null }, now: number): ParsedDraft {
  let fallback: ParsedDraft = { ok: false, reason: 'none' };
  for (const store of [stores.session, stores.local]) {
    if (!store) continue;
    let raw: string | null = null;
    try { raw = store.getItem(DRAFT_KEY); } catch { continue; }
    const parsed = parseDraft(raw, now);
    if (parsed.ok) return parsed;
    if (parsed.reason !== 'none') {
      try { store.removeItem(DRAFT_KEY); } catch { /* ignore */ }
      if (fallback.ok === false && fallback.reason === 'none') fallback = parsed;
    }
  }
  return fallback;
}

export function clearDraft(stores: { session?: KeyValueStore | null; local?: KeyValueStore | null }): void {
  for (const store of [stores.session, stores.local]) {
    try { store?.removeItem(DRAFT_KEY); } catch { /* ignore */ }
  }
}

/** Browser stores, or nulls during prerendering / when storage is blocked. */
export function browserStores(): { session: KeyValueStore | null; local: KeyValueStore | null } {
  if (typeof window === 'undefined') return { session: null, local: null };
  const pick = (name: 'sessionStorage' | 'localStorage') => {
    try {
      return window[name];
    } catch {
      return null;
    }
  };
  return { session: pick('sessionStorage'), local: pick('localStorage') };
}
