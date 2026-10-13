/**
 * ---------------------------------------------------------------------------
 * lib/learner-auth.ts — Real learner sign-in, sign-up, verification, sign-out
 * ---------------------------------------------------------------------------
 * Replaces the simulated (setTimeout) sign-in/sign-up. All decisions are made by the backend:
 *   POST /auth/signup  → { message, accessToken, data: user }        (201; 409 if email/username taken)
 *   POST /auth/verify-email { email, token }                          (400 invalid / expired / too many attempts)
 *   POST /auth/resend-verification { email }
 *   POST /auth/login { email, password } → { accessToken, accountStatus: 'active' | 'frozen', data }
 *        401 wrong credentials · 403 { code: 'ACCOUNT_RESTRICTED' } · 503 learner auth not configured
 *   GET  /auth/me → { data: user, accountStatus }
 *   POST /auth/logout (stateless: the token stays valid until it expires; we delete it locally)
 *
 * The token is stored under the learner key only (lib/session.ts); it never grants access by itself.
 * There is no refresh token: POST /auth/refresh-token is a backend mock and is deliberately not used.
 *
 * Kept free of path aliases so it can be unit-tested with `node --test`.
 */

import { authApi } from './api.ts';
import { ApiError } from './api-error.ts';
import { clearStoredToken, getStoredToken, setStoredToken } from './session.ts';

export type AccountStatus = 'active' | 'frozen';

export interface LearnerUser {
  id: string;
  email: string;
  username?: string | null;
  fullName?: string | null;
  isEmailVerified?: boolean;
  educationType?: string | null;
  [key: string]: unknown;
}

export interface SignInResult {
  user: LearnerUser;
  accountStatus: AccountStatus;
}

export interface SignUpInput {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth?: string;
}

function takeToken(res: unknown): string {
  const token = (res as { accessToken?: unknown } | null)?.accessToken;
  if (typeof token !== 'string' || token.length < 20) {
    throw new ApiError('The server did not return a session. Please try again.', null, 'unknown');
  }
  return token;
}

function normalizeStatus(value: unknown): AccountStatus {
  return value === 'frozen' ? 'frozen' : 'active';
}

export async function signIn(email: string, password: string): Promise<SignInResult> {
  const res = await authApi.login({ email: email.trim(), password });
  setStoredToken('learner', takeToken(res));
  return { user: (res as { data: LearnerUser }).data, accountStatus: normalizeStatus((res as { accountStatus?: unknown }).accountStatus) };
}

/** Creates the account and signs in with the returned token. The email still has to be verified. */
export async function signUp(input: SignUpInput): Promise<LearnerUser> {
  const res = await authApi.signup({
    fullName: input.fullName.trim(),
    username: input.username.trim(),
    email: input.email.trim(),
    password: input.password,
    confirmPassword: input.confirmPassword,
    ...(input.dateOfBirth ? { dateOfBirth: input.dateOfBirth } : {}),
  });
  setStoredToken('learner', takeToken(res));
  return (res as { data: LearnerUser }).data;
}

export async function verifyEmail(email: string, code: string): Promise<void> {
  await authApi.verifyEmail({ email: email.trim(), token: code.trim() });
}

export async function resendVerification(email: string): Promise<void> {
  await authApi.resendVerification({ email: email.trim() });
}

/** Ends the session locally even if the request fails (the backend logout is stateless). */
export async function signOut(): Promise<void> {
  const token = getStoredToken('learner');
  try {
    if (token) await authApi.logout(token);
  } catch {
    // ignore: the token is removed below either way
  } finally {
    clearStoredToken('learner');
  }
}

export function hasLearnerSession(): boolean {
  return Boolean(getStoredToken('learner'));
}

export async function fetchCurrentLearner(signal?: AbortSignal): Promise<SignInResult> {
  const res = (await authApi.getMe(undefined, { signal })) as { data: LearnerUser; accountStatus?: unknown };
  return { user: res.data, accountStatus: normalizeStatus(res.accountStatus) };
}

/** Only same-site paths are allowed as post-sign-in destinations (no open redirects). */
export function safeNextPath(next: string | null | undefined, fallback = '/dashboard'): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return fallback;
  if (next.startsWith('/auth/') || next.startsWith('/admin')) return fallback;
  return next;
}

/** User-facing message for a failed sign-in (never reveals whether the email exists). */
export function signInErrorMessage(error: ApiError): string {
  if (error.code === 'ACCOUNT_RESTRICTED') return 'This account has been restricted. Please contact support.';
  if (error.status === 401) return 'Incorrect email or password.';
  if (error.status === 400) return 'Enter a valid email address and your password.';
  if (error.status === 503) return 'Sign-in is temporarily unavailable. Please try again later.';
  if (error.kind === 'rate_limited') return 'Too many attempts. Please wait a minute and try again.';
  if (error.kind === 'network') return 'We could not reach GleamLearn. Check your connection and try again.';
  if (error.kind === 'timeout') return 'Signing in took too long. Please try again.';
  return 'Could not sign in. Please try again.';
}

/** User-facing message for a failed sign-up; `field` says which input it belongs to when known. */
export function signUpErrorMessage(error: ApiError): { message: string; field?: 'email' | 'username' | 'password' } {
  if (error.status === 409) return { message: 'This email or username is already registered. Sign in instead, or choose another.', field: 'email' };
  if (error.status === 400) {
    const text = [error.message, ...error.details].join(' ').toLowerCase();
    if (text.includes('password')) return { message: error.message, field: 'password' };
    if (text.includes('email')) return { message: 'Enter a valid email address.', field: 'email' };
    if (text.includes('username')) return { message: error.message, field: 'username' };
    return { message: error.message };
  }
  if (error.status === 503) return { message: 'Sign-up is temporarily unavailable. Please try again later.' };
  if (error.kind === 'rate_limited') return { message: 'Too many attempts. Please wait a minute and try again.' };
  if (error.kind === 'network') return { message: 'We could not reach GleamLearn. Check your connection and try again.' };
  return { message: 'Could not create your account. Please try again.' };
}

/** User-facing message for a failed verification. */
export function verifyErrorMessage(error: ApiError): string {
  if (/too many incorrect codes/i.test(error.message)) return 'Too many incorrect codes. Send a new code and try again.';
  if (/expired/i.test(error.message) && !/invalid/i.test(error.message)) return 'This code has expired. Send a new code.';
  if (error.status === 400) return 'This code is incorrect or has expired. Check it, or send a new code.';
  if (error.kind === 'rate_limited') return 'Too many attempts. Please wait a minute and try again.';
  if (error.kind === 'network') return 'We could not reach GleamLearn. Check your connection and try again.';
  return 'Could not verify your email. Please try again.';
}
