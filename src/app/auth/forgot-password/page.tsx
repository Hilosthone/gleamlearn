// src/app/auth/forgot-password/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { authApi, ApiError } from '@/lib/api';
import { errorMessage } from '@/lib/api-error';
import { SlowNotice } from '@/components/ui/states';
import { useSlowFlag } from '@/hooks/useSlowFlag';
import { validateEmail } from '@/lib/validation/password';

/**
 * Step 1 of password reset: POST /auth/forgot-password { email }.
 * The backend responds the same way whether or not the account exists,
 * so this page never reveals which emails are registered.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<ApiError | null>(null);
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSlow = useSlowFlag(isSubmitting);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const error = validateEmail(email);
    setEmailError(error);
    if (error) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await authApi.forgotPassword({ email: email.trim() });
      setSent(true);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err : new ApiError('Could not send the reset code.', null, 'unknown'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-center bg-white dark:bg-[#0B0F19] px-6 py-10 max-w-md mx-auto transition-colors duration-300">
      <div className="mb-8 space-y-2">
        <Link href="/auth/login" className="text-xs font-semibold text-[var(--color-brand-blue)] hover:underline">
          ← Back to sign in
        </Link>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Reset your password</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Enter the email linked to your account and we&apos;ll send you a 6-digit reset code.
        </p>
      </div>

      {sent ? (
        <div className="space-y-4">
          <Alert variant="success" title="Check your email">
            If an account exists for {email.trim()}, a 6-digit code is on its way. The code expires in 10 minutes.
          </Alert>
          <Link href={`/auth/reset-password?email=${encodeURIComponent(email.trim())}`} className="flex w-full items-center justify-center rounded-xl bg-[var(--color-brand-blue)] px-6 py-3.5 text-base font-medium text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:opacity-90 active:scale-[0.98]">
            Enter reset code
          </Link>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="w-full text-center text-xs font-semibold text-[var(--color-brand-blue)] hover:underline"
          >
            Use a different email
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input
            id="forgot-email"
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError(undefined);
              setSubmitError(null);
            }}
            error={emailError}
            disabled={isSubmitting}
          />

          {isSlow && <SlowNotice />}

          {submitError && (
            <Alert variant={submitError.kind === 'network' ? 'offline' : 'error'} title="Code not sent">
              {errorMessage(submitError)}
            </Alert>
          )}

          <div className="pt-2">
            <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isSubmitting}>
              Send reset code
            </Button>
          </div>
        </form>
      )}

      <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
        Already have a code?{' '}
        <Link href="/auth/reset-password" className="font-semibold text-[var(--color-brand-blue)] hover:underline">
          Enter it here
        </Link>
      </p>
    </main>
  );
}
