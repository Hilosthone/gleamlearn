'use client';

import React from 'react';
import Link from 'next/link';
import { Crown } from 'lucide-react';
import { useApiQuery } from '@/hooks/useApiQuery';
import { ErrorState, FeatureUnavailable, LoadingState } from '@/components/ui/states';
import { loadSubscriptionStatus } from '@/lib/support';

/**
 * Premium status from GET /subscription. Previously: invented prices, a fake active plan, receipts, and cancel/pause
 * buttons that changed nothing. Payments stay disabled until a provider with server-side verification is integrated.
 */
export default function PremiumHub() {
  const status = useApiQuery(() => loadSubscriptionStatus(), []);

  return (
    <div className="max-w-3xl space-y-6 animate-in fade-in duration-300 pb-12">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
          <Crown className="w-6 h-6" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">Premium</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Your plan and billing.</p>
        </div>
      </div>

      {status.isLoading ? (
        <LoadingState layout="detail" label="Checking your plan…" />
      ) : status.error ? (
        <ErrorState error={status.error} onRetry={status.retry} />
      ) : status.data?.kind === 'active' ? (
        <section className="bg-white dark:bg-[#111827] rounded-3xl border border-gray-200/80 dark:border-gray-800 p-6 space-y-1">
          <p className="text-sm font-bold text-gray-900 dark:text-white">You are on {status.data.planName}.</p>
          {status.data.endsAt && <p className="text-xs text-gray-500">Renews or ends on {new Date(status.data.endsAt).toLocaleDateString()}.</p>}
          <p className="text-xs text-gray-500">Changing or cancelling a plan isn&apos;t available in the app yet.</p>
        </section>
      ) : (
        <FeatureUnavailable
          title="Premium isn't available yet"
          description="Paid plans and payments aren't set up, so no payment can be taken. Everything you can use in GleamLearn today is free."
          action={<Link href="/dashboard" className="text-xs font-semibold text-[var(--color-brand-blue)] hover:underline">Back to your dashboard</Link>}
        />
      )}
    </div>
  );
}
