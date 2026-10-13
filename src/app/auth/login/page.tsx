// src/app/auth/login/page.tsx
'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { SlowNotice } from '@/components/ui/states';
import { useSlowFlag } from '@/hooks/useSlowFlag';
import { ApiError } from '@/lib/api-error';
import { safeNextPath, signIn, signInErrorMessage } from '@/lib/learner-auth';
import { validateEmail } from '@/lib/validation/password';

/**
 * Real learner sign-in: POST /auth/login { email, password }.
 * The backend signs in by EMAIL only (there is no username sign-in).
 * On success the token is stored under the learner key and the learner continues to ?next= (same-site
 * paths only) or the dashboard; a frozen account goes to /account-state.
 */
export default function LoginPage() {
  // useSearchParams needs a Suspense boundary
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNextPath(params.get('next'));
  const expired = params.get('reason') === 'expired';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSlow = useSlowFlag(isSubmitting);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    const errors = { email: validateEmail(email), password: password ? undefined : 'Enter your password.' };
    setFieldErrors(errors);
    if (errors.email || errors.password) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const { accountStatus } = await signIn(email, password);
      router.replace(accountStatus === 'frozen' ? '/account-state' : next);
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError('Could not sign in.', null, 'unknown');
      setError(signInErrorMessage(apiError));
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-center bg-white dark:bg-[#0B0F19] px-6 py-10 max-w-md mx-auto transition-colors duration-300">
      <div className="mb-8 space-y-2">
        <Link href="/welcome" className="text-xs font-semibold text-[var(--color-brand-blue)] hover:underline">
          ← Back
        </Link>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Welcome Back</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Log in to continue your virtual classes and keep your streak alive.
        </p>
      </div>

      {expired && !error && (
        <div className="mb-4">
          <Alert variant="info">Your session has ended. Please sign in again.</Alert>
        </div>
      )}

      <form onSubmit={handleLogin} noValidate className="space-y-4">
        <Input
          id="login-email"
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setFieldErrors((f) => ({ ...f, email: undefined }));
            setError(null);
          }}
          error={fieldErrors.email}
          disabled={isSubmitting}
        />

        <div className="space-y-1">
          <Input
            id="login-password"
            label="Password"
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFieldErrors((f) => ({ ...f, password: undefined }));
              setError(null);
            }}
            error={fieldErrors.password}
            disabled={isSubmitting}
          />
          <div className="flex justify-end pt-1">
            <Link href="/auth/forgot-password" className="text-xs font-semibold text-[var(--color-brand-blue)] hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>

        {isSlow && <SlowNotice />}
        {error && (
          <Alert variant="error" title="Not signed in">
            {error}
          </Alert>
        )}

        <div className="pt-2">
          <Button type="submit" variant="primary" size="lg" className="w-full shadow-lg shadow-blue-500/25" isLoading={isSubmitting}>
            Log In
          </Button>
        </div>
      </form>

      <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
        Don&apos;t have an account?{' '}
        <Link href="/auth/signup" className="font-semibold text-[var(--color-brand-blue)] hover:underline">
          Sign up
        </Link>
      </p>
    </main>
  );
}
