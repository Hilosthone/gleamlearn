// src/app/auth/login/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate authentication verification, then route directly to the Dashboard
    setTimeout(() => {
      setIsLoading(false);
      router.push('/dashboard');
    }, 1200);
  };

  return (
    <main className="min-h-screen flex flex-col justify-center bg-white dark:bg-[#0B0F19] px-6 py-10 max-w-md mx-auto transition-colors duration-300">
      
      {/* Header */}
      <div className="mb-8 space-y-2">
        <Link href="/welcome" className="text-xs font-semibold text-[var(--color-brand-blue)] hover:underline">
          ← Back
        </Link>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Welcome Back</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Log in to continue your virtual classes and keep your streak alive.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          label="Email or Username"
          name="emailOrUsername"
          placeholder="name@example.com or username"
          value={formData.emailOrUsername}
          onChange={handleChange}
          required
        />

        <div className="space-y-1">
          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <div className="flex justify-end pt-1">
            <a href="#" className="text-xs font-semibold text-[var(--color-brand-blue)] hover:underline">
              Forgot password?
            </a>
          </div>
        </div>

        <div className="pt-2">
          <Button type="submit" variant="primary" size="lg" className="w-full shadow-lg shadow-blue-500/25" isLoading={isLoading}>
            Log In
          </Button>
        </div>
      </form>

      {/* Footer signup redirect */}
      <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
        Don&apos;t have an account?{' '}
        <Link href="/auth/signup" className="font-semibold text-[var(--color-brand-blue)] hover:underline">
          Sign up
        </Link>
      </p>

    </main>
  );
}