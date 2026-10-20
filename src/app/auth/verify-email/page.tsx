// src/app/auth/verify-email/page.tsx
'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { SlowNotice } from '@/components/ui/states';
import { useSlowFlag } from '@/hooks/useSlowFlag';
import { ApiError } from '@/lib/api-error';
import { deliveryNotice, hasLearnerSession, resendVerification, verifyEmail, verifyErrorMessage, type EmailDelivery } from '@/lib/learner-auth';
import { validateEmail } from '@/lib/validation/password';

const CODE_PATTERN = /^\d{6}$/;

/**
 * Email verification after sign-up: POST /auth/verify-email { email, token }.
 * The backend checks the code against the named account only and clears it after 5 wrong attempts.
 * "Send a new code": POST /auth/resend-verification { email }.
 * Sign-in does not currently require a verified email (backend behaviour), so "Do this later" is offered.
 */
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailForm />
    </Suspense>
  );
}

function VerifyEmailForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get('email') ?? '');
  // Delivery state of the email sent at sign-up (from the backend); drives the first message on this page
  const [delivery, setDelivery] = useState<EmailDelivery>(() => {
    const d = params.get('delivery');
    return d === 'sent' || d === 'pending' || d === 'failed' ? d : 'unknown';
  });
  const [code, setCode] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; code?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [pending, setPending] = useState<'verify' | 'resend' | null>(null);
  const isSlow = useSlowFlag(pending !== null);

  // Decided at click time (localStorage is not available during prerendering)
  const goOn = () => router.replace(hasLearnerSession() ? '/onboarding' : '/auth/login');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pending) return;
    const errors = {
      email: validateEmail(email),
      code: CODE_PATTERN.test(code.trim()) ? undefined : 'Enter the 6-digit code from your email.',
    };
    setFieldErrors(errors);
    if (errors.email || errors.code) return;
    setPending('verify');
    setError(null);
    try {
      await verifyEmail(email, code);
      setVerified(true);
    } catch (err) {
      setError(verifyErrorMessage(err instanceof ApiError ? err : new ApiError('Could not verify.', null, 'unknown')));
    } finally {
      setPending(null);
    }
  };

  const resend = async () => {
    if (pending) return;
    const emailError = validateEmail(email);
    setFieldErrors({ email: emailError });
    if (emailError) return;
    setPending('resend');
    setError(null);
    try {
      const result = await resendVerification(email);
      setDelivery(result);
      setCode('');
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError('Could not send a new code.', null, 'unknown');
      // The backend answers "Email is already verified" with 400
      if (apiError.status === 400 && /already verified/i.test(apiError.message)) {
        setVerified(true);
      } else {
        setError(apiError.kind === 'rate_limited' ? 'Too many requests. Please wait a minute and try again.' : 'Could not send a new code. Please try again.');
      }
    } finally {
      setPending(null);
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-center bg-white dark:bg-[#0B0F19] px-6 py-10 max-w-md mx-auto transition-colors duration-300">
      <div className="mb-8 space-y-2">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Verify your email</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Enter the 6-digit code from your verification email.</p>
      </div>

      {!verified && (
        <div className="mb-4" aria-live="polite">
          <Alert variant={deliveryNotice(delivery).tone}>{deliveryNotice(delivery).text}</Alert>
        </div>
      )}

      {verified ? (
        <div className="space-y-4">
          <Alert variant="success" title="Email verified">
            Your email address is confirmed.
          </Alert>
          <Button type="button" variant="primary" size="lg" className="w-full" onClick={goOn}>
            Continue
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-4">
          <Input
            id="verify-email"
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFieldErrors((f) => ({ ...f, email: undefined }));
            }}
            error={fieldErrors.email}
            disabled={pending !== null}
          />
          <Input
            id="verify-code"
            label="Verification code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="123456"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setFieldErrors((f) => ({ ...f, code: undefined }));
              setError(null);
            }}
            error={fieldErrors.code}
            disabled={pending !== null}
          />

          {isSlow && <SlowNotice />}
          {error && (
            <Alert variant="error" title="Not verified">
              {error}
            </Alert>
          )}

          <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={pending === 'verify'} disabled={pending === 'resend'}>
            Verify email
          </Button>
          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={resend}
              disabled={pending !== null}
              className="font-semibold text-[var(--color-brand-blue)] hover:underline disabled:opacity-50"
            >
              {pending === 'resend' ? 'Sending…' : 'Send a new code'}
            </button>
            <button type="button" onClick={goOn} className="text-gray-500 hover:underline">
              Do this later
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
