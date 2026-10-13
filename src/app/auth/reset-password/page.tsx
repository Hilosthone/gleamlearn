// src/app/auth/reset-password/page.tsx
'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { authApi, ApiError } from '@/lib/api';
import { recoveryHint } from '@/lib/api-error';
import { SlowNotice } from '@/components/ui/states';
import { useSlowFlag } from '@/hooks/useSlowFlag';
import { hasErrors, validateResetPassword, type FieldErrors, type ResetPasswordValues } from '@/lib/validation/password';

const EMPTY: ResetPasswordValues = { email: '', token: '', newPassword: '', confirmNewPassword: '' };

/**
 * Step 2 of password reset: POST /auth/reset-password
 * { email, token, newPassword, confirmNewPassword }, where token is the emailed 6-digit code.
 * The backend only accepts the code for the account named by `email` (prefilled from ?email= when the
 * user comes from the forgot-password page).
 */
export default function ResetPasswordPage() {
  // useSearchParams needs a Suspense boundary
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const initialEmail = useSearchParams().get('email') ?? '';
  const [values, setValues] = useState<ResetPasswordValues>({ ...EMPTY, email: initialEmail });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<keyof ResetPasswordValues>>({});
  const [submitError, setSubmitError] = useState<ApiError | null>(null);
  const [done, setDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSlow = useSlowFlag(isSubmitting);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setSubmitError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const errors = validateResetPassword(values);
    setFieldErrors(errors);
    if (hasErrors(errors)) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await authApi.resetPassword({
        email: values.email.trim(),
        token: values.token.trim(),
        newPassword: values.newPassword,
        confirmNewPassword: values.confirmNewPassword,
      });
      setDone(true);
      setValues({ ...EMPTY, email: values.email });
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError('Could not reset your password.', null, 'unknown');
      // The backend answers an unknown or expired code with 400 "Invalid or expired password reset code"
      if (apiError.status === 400 && /reset code/i.test(apiError.message)) {
        setFieldErrors({ token: 'This code is invalid or has expired for this email. Check both, or request a new code.' });
      } else if (apiError.status === 400 && /too many incorrect codes/i.test(apiError.message)) {
        setFieldErrors({ token: 'Too many incorrect codes. Request a new code to continue.' });
      } else {
        setSubmitError(apiError);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-center bg-white dark:bg-[#0B0F19] px-6 py-10 max-w-md mx-auto transition-colors duration-300">
      <div className="mb-8 space-y-2">
        <Link href="/auth/forgot-password" className="text-xs font-semibold text-[var(--color-brand-blue)] hover:underline">
          ← Request a new code
        </Link>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Choose a new password</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Enter your email and the 6-digit code we sent to it, then set your new password.
        </p>
      </div>

      {done ? (
        <div className="space-y-4">
          <Alert variant="success" title="Password reset">
            Your password has been changed. You can now sign in with your new password.
          </Alert>
          <Link href="/auth/login" className="flex w-full items-center justify-center rounded-xl bg-[var(--color-brand-blue)] px-6 py-3.5 text-base font-medium text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:opacity-90 active:scale-[0.98]">
            Go to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input
            id="reset-email"
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            value={values.email}
            onChange={handleChange}
            error={fieldErrors.email}
            disabled={isSubmitting}
          />
          <Input
            id="reset-token"
            label="Reset code"
            name="token"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="123456"
            value={values.token}
            onChange={handleChange}
            error={fieldErrors.token}
            disabled={isSubmitting}
          />
          <Input
            id="reset-new-password"
            label="New password"
            type="password"
            name="newPassword"
            autoComplete="new-password"
            value={values.newPassword}
            onChange={handleChange}
            error={fieldErrors.newPassword}
            helperText="At least 6 characters."
            disabled={isSubmitting}
          />
          <Input
            id="reset-confirm-password"
            label="Confirm new password"
            type="password"
            name="confirmNewPassword"
            autoComplete="new-password"
            value={values.confirmNewPassword}
            onChange={handleChange}
            error={fieldErrors.confirmNewPassword}
            disabled={isSubmitting}
          />

          {isSlow && <SlowNotice />}

          {submitError && (
            <Alert variant={submitError.kind === 'network' ? 'offline' : 'error'} title="Password not reset">
              {recoveryHint(submitError.kind) || submitError.message}
            </Alert>
          )}

          <div className="pt-2">
            <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isSubmitting}>
              Reset password
            </Button>
          </div>
        </form>
      )}
    </main>
  );
}
