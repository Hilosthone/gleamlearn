/**
 * ---------------------------------------------------------------------------
 * lib/registration/submit.ts — One sign-up request, and safe reconciliation when the outcome is unknown
 * ---------------------------------------------------------------------------
 * POST /auth/signup is sent ONCE, from the review step, with the explicit payload from wizard.ts.
 * Outcomes (real backend behaviour):
 *   201 → account created; the response carries a session token and verificationEmail (sent/pending/failed)
 *   400 → validation errors (class-validator messages) → mapped to fields/steps
 *   409 → "Email or username is already registered"
 *   429 → throttled (sign-up allows 2/s, 10/min per IP)
 *   network failure / timeout → OUTCOME UNKNOWN: the account may or may not exist.
 * For an unknown outcome we never blindly resend. `reconcile()` tries to sign in with the same credentials
 * (existing POST /auth/login): success proves the account was created (and gives a session); 401 means it
 * was not created (or the email belongs to someone else) — a retry is then safe, because a second sign-up
 * for an existing email/username returns 409 instead of creating a duplicate.
 * There is no signup-status or idempotency endpoint, so none is used.
 */

import { ApiError } from '../api-error.ts';
import { signIn, signUp, type EmailDelivery } from '../learner-auth.ts';
import type { FieldErrors, SignupBody, StepId } from './wizard.ts';

export type SubmitResult =
  | { kind: 'created'; verificationEmail: EmailDelivery }
  | { kind: 'invalid'; message: string; fieldErrors: FieldErrors; step: StepId | null }
  | { kind: 'exists'; message: string }
  | { kind: 'rate_limited'; message: string }
  | { kind: 'unavailable'; message: string }
  | { kind: 'uncertain'; message: string };

const FIELD_STEP: Record<string, StepId> = {
  fullName: 'personal', username: 'personal', email: 'personal', dateOfBirth: 'personal', country: 'personal',
  password: 'security', confirmPassword: 'security',
  secondarySchool: 'education', secondaryClass: 'education', secondaryStream: 'education',
  university: 'education', faculty: 'education', department: 'education', courseOfStudy: 'education', level: 'education',
  examAimOrGoals: 'goals', preferredStudyTime: 'goals', educationType: 'path',
};

/** Maps NestJS validation messages ("email must be an email", "Passwords do not match") to fields. */
export function mapValidationErrors(error: ApiError): { fieldErrors: FieldErrors; step: StepId | null } {
  const messages = error.details.length ? error.details : [error.message];
  const fieldErrors: FieldErrors = {};
  let step: StepId | null = null;
  for (const message of messages) {
    const lower = message.toLowerCase();
    let field: string | undefined =
      Object.keys(FIELD_STEP).find((f) => lower.startsWith(f.toLowerCase() + ' ') || lower.includes(` ${f.toLowerCase()} `));
    if (!field && /password/.test(lower)) field = /match|confirm/.test(lower) ? 'confirmPassword' : 'password';
    if (!field) continue;
    const friendly =
      field === 'email' ? 'Enter a valid email address.' :
      field === 'password' ? 'Use at least 6 characters.' :
      field === 'confirmPassword' ? 'Passwords do not match.' :
      message.charAt(0).toUpperCase() + message.slice(1) + '.';
    (fieldErrors as Record<string, string>)[field] = friendly;
    const s = FIELD_STEP[field];
    if (s && (step === null || order(s) < order(step))) step = s;
  }
  return { fieldErrors, step };
}

const ORDER: StepId[] = ['path', 'personal', 'security', 'education', 'goals', 'review'];
const order = (s: StepId) => ORDER.indexOf(s);

export async function submitRegistration(body: SignupBody): Promise<SubmitResult> {
  try {
    const { verificationEmail } = await signUp(body);
    return { kind: 'created', verificationEmail };
  } catch (err) {
    const e = err instanceof ApiError ? err : new ApiError('Could not create your account.', null, 'unknown');
    if (e.status === 400) {
      const mapped = mapValidationErrors(e);
      return { kind: 'invalid', message: 'Some details need attention.', ...mapped };
    }
    if (e.status === 409) {
      return { kind: 'exists', message: 'This email or username is already registered. Sign in instead, or use a different email and username.' };
    }
    if (e.kind === 'rate_limited') return { kind: 'rate_limited', message: 'Too many attempts. Please wait a minute, then try again.' };
    if (e.kind === 'network' || e.kind === 'timeout' || e.kind === 'aborted') {
      return { kind: 'uncertain', message: 'The connection dropped before we heard back, so we can’t tell yet whether your account was created.' };
    }
    if (e.status === 503) return { kind: 'unavailable', message: 'Sign-up is temporarily unavailable. Your details are still here — please try again shortly.' };
    if (typeof e.status === 'number' && e.status >= 500) {
      return { kind: 'unavailable', message: 'Something went wrong on our side. Your details are still here — please try again shortly.' };
    }
    return { kind: 'unavailable', message: 'Could not create your account. Please try again.' };
  }
}

export type ReconcileResult =
  | { kind: 'created' } // sign-in succeeded → the earlier request DID create the account (session now stored)
  | { kind: 'not_created' } // 401 → safe to submit again (a duplicate would be refused with 409)
  | { kind: 'restricted'; message: string }
  | { kind: 'still_unknown'; message: string };

/** Uses the existing login endpoint to find out whether an uncertain sign-up created the account. */
export async function reconcile(email: string, password: string): Promise<ReconcileResult> {
  try {
    await signIn(email, password);
    return { kind: 'created' };
  } catch (err) {
    const e = err instanceof ApiError ? err : new ApiError('', null, 'unknown');
    if (e.status === 401) return { kind: 'not_created' };
    if (e.code === 'ACCOUNT_RESTRICTED') return { kind: 'restricted', message: 'This account has been restricted. Please contact support.' };
    return { kind: 'still_unknown', message: 'We still can’t reach GleamLearn. Check your connection and try again — nothing will be duplicated.' };
  }
}
