// src/app/admin/(auth)/login/page.tsx
'use client';

import React, { Suspense, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { SlowNotice } from '@/components/ui/states';
import { adminAuthApi } from '@/lib/admin-api';
import { errorMessage as describeError } from '@/lib/api-error';
import { toApiError } from '@/lib/async-state';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { validateEmail } from '@/lib/validation/password';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const expired = searchParams.get('reason') === 'expired';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const login = useAsyncAction((signal, e: string, p: string) => adminAuthApi.login(e, p, { signal }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const errors = { email: validateEmail(email), password: password ? undefined : 'Enter your password.' };
    setFieldErrors(errors);
    if (errors.email || errors.password) return;

    const result = await login.run(email.trim(), password);
    if (result) {
      setPassword('');
      router.replace('/admin');
    }
  };

  const error = login.error ? toApiError(login.error) : null;
  const errorMessage = !error
    ? null
    : error.status === 401
      ? 'Incorrect email or password, or the admin account is disabled.'
      : error.status === 503
        ? 'Admin sign-in is temporarily unavailable because admin authentication is not configured on the server.'
        : describeError(error);

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4" aria-label="Administrator sign in">
      {expired && !error && (
        <Alert variant="info" title="Session ended">
          Your admin session has expired or is no longer valid. Please sign in again.
        </Alert>
      )}
      <Input
        id="admin-email"
        label="Admin email"
        type="email"
        autoComplete="username"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setFieldErrors((f) => ({ ...f, email: undefined }));
        }}
        error={fieldErrors.email}
        disabled={login.isPending}
      />
      <Input
        id="admin-password"
        label="Password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          setFieldErrors((f) => ({ ...f, password: undefined }));
        }}
        error={fieldErrors.password}
        disabled={login.isPending}
      />
      {login.isSlow && <SlowNotice message="Signing in is taking longer than usual (the server may be waking up)." />}
      {errorMessage && (
        <Alert variant={error?.kind === 'network' ? 'offline' : 'error'} title="Sign-in failed">
          {errorMessage}
        </Alert>
      )}
      <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={login.isPending}>
        Sign in to admin console
      </Button>
    </form>
  );
}

/**
 * Administrator sign-in (POST /api/v1/admin/auth/login). Separate from learner sign-in:
 * admin and learner sessions never share a token.
 */
export default function AdminLoginPage() {
  return (
    <main className="min-h-screen flex flex-col justify-center bg-gray-50 dark:bg-[#0B0F19] px-6 py-10">
      <div className="w-full max-w-md mx-auto bg-white dark:bg-[#111827] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs p-8 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 relative rounded-xl overflow-hidden shadow-md shadow-blue-500/20 bg-white">
              <Image src="/gleamlearn-logo.jpg" alt="gleamLearn Logo" fill className="object-cover" priority />
            </div>
            <span className="text-lg font-extrabold text-gray-900 dark:text-white">
              gleam<span className="text-[var(--color-brand-blue)]">Learn</span>
            </span>
          </div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold text-gray-900 dark:text-white">
            <ShieldCheck className="w-6 h-6 text-[var(--color-brand-purple)]" aria-hidden="true" />
            Admin console
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Restricted to GleamLearn administrators.</p>
        </div>
        <Suspense fallback={null}>
          <AdminLoginForm />
        </Suspense>
      </div>
    </main>
  );
}
