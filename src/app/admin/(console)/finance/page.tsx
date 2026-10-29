// src/app/admin/(console)/finance/page.tsx
'use client';

import React, { useState } from 'react';
import { Wallet } from 'lucide-react';
import { adminInsightsApi } from '@/lib/admin-api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { Alert } from '@/components/ui/Alert';
import { ADMIN_LOGIN_PATH } from '@/components/admin/AdminSessionProvider';
import { RequirePermission } from '@/components/admin/RequirePermission';
import { MetricPanel, PageHeader, Pager, TabBar, adminCard, useAdminTabs } from '@/components/admin/ui';

/**
 * Subscriptions & finance (finance.view). Payments are not live: the revenue, transaction and refund endpoints answer
 * "not available", and subscription changes are refused by the server, so nothing here can move money.
 */
export default function AdminFinancePage() {
  return (
    <RequirePermission permission="finance.view">
      <Finance />
    </RequirePermission>
  );
}

function Finance() {
  const tabs = useAdminTabs([
    { id: 'revenue', label: 'Revenue' },
    { id: 'subscriptions', label: 'Subscriptions' },
    { id: 'payments', label: 'Payments & refunds' },
  ]);
  return (
    <div className="space-y-6">
      <PageHeader title="Subscriptions & finance" description="Revenue, subscriptions and payment records." />
      <Alert variant="info">
        Payments are not live: no payment provider is integrated and Premium is not on sale, so there is no revenue to report. These sections show the server&apos;s
        own answer, which is &ldquo;not available yet&rdquo;, rather than placeholder figures. Plans, provider settings and billing are not changed from here.
      </Alert>
      <TabBar label="Finance sections" tabs={tabs.visible} active={tabs.active} onSelect={tabs.select} />
      <div role="tabpanel" className="space-y-4">
        {tabs.active === 'revenue' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <MetricPanel title="Overview" load={(signal) => adminInsightsApi.finance('overview', { signal })} />
            <MetricPanel title="Revenue" load={(signal) => adminInsightsApi.finance('revenue', { signal })} />
            <MetricPanel title="Daily revenue" load={(signal) => adminInsightsApi.finance('revenue/daily', { signal })} />
            <MetricPanel title="Monthly revenue" load={(signal) => adminInsightsApi.finance('revenue/monthly', { signal })} />
          </div>
        )}
        {tabs.active === 'subscriptions' && <Subscriptions />}
        {tabs.active === 'payments' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <MetricPanel title="Transactions" load={(signal) => adminInsightsApi.finance('transactions', { signal })} />
            <MetricPanel title="Refunds" load={(signal) => adminInsightsApi.finance('refunds', { signal })} />
            <MetricPanel title="Subscription summary" load={(signal) => adminInsightsApi.finance('subscriptions', { signal })} />
          </div>
        )}
      </div>
    </div>
  );
}

/** GET /admin/subscriptions — the stored subscription records (read-only: changes, cancellations and refunds answer 501). */
function Subscriptions() {
  const [page, setPage] = useState(1);
  const q = useApiQuery((signal) => adminInsightsApi.subscriptions(page, { signal }), [page]);
  if (q.isLoading) return <LoadingState label="Loading subscriptions…" />;
  if (q.error) return <ErrorState error={q.error} onRetry={q.retry} signInHref={ADMIN_LOGIN_PATH} />;
  const rows = q.data!.data.subscriptions;
  if (!rows.length) return <EmptyState icon={Wallet} title="No subscription records" description="Nobody has subscribed: Premium is not on sale yet." />;
  return (
    <div className="space-y-2">
      <ul className="space-y-2" aria-label="Subscriptions">
        {rows.map((s, i) => (
          <li key={String(s.id ?? i)} className={`${adminCard} p-4 text-xs`}>
            <pre className="whitespace-pre-wrap break-words">{JSON.stringify(s, null, 2)}</pre>
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-gray-500">Changing, cancelling or refunding a subscription is refused by the server while no payment provider is live.</p>
      <Pager pagination={q.data!.data.pagination} onPage={setPage} />
    </div>
  );
}
