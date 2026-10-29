// src/app/admin/(console)/system/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { SYSTEM_METRICS, adminSystemApi } from '@/lib/admin-api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { ErrorState, LoadingState } from '@/components/ui/states';
import { ADMIN_LOGIN_PATH, useAdminSession } from '@/components/admin/AdminSessionProvider';
import { RequirePermission } from '@/components/admin/RequirePermission';
import { MetricPanel, PageHeader, StatCard, TabBar, useAdminTabs } from '@/components/admin/ui';

const TITLES: Record<(typeof SYSTEM_METRICS)[number], string> = { queues: 'Background queues', storage: 'Storage', ai: 'AI service usage', errors: 'Errors' };

/** System health (system.view): the live health check, and the other monitors as the server answers them. */
export default function AdminSystemPage() {
  return (
    <RequirePermission permission="system.view">
      <SystemView />
    </RequirePermission>
  );
}

function SystemView() {
  const { can } = useAdminSession();
  const tabs = useAdminTabs([
    { id: 'health', label: 'Health' },
    { id: 'monitors', label: 'Monitors' },
  ]);
  return (
    <div className="space-y-6">
      <PageHeader
        title="System health"
        description={
          <>
            Live server status.{' '}
            {can('settings.manage') && <Link className="underline" href="/admin/settings">Platform settings</Link>}
            {can('notifications.send') && <> · <Link className="underline" href="/admin/notifications">Notifications</Link></>}
          </>
        }
      />
      <TabBar label="System sections" tabs={tabs.visible} active={tabs.active} onSelect={tabs.select} />
      <div role="tabpanel">
        {tabs.active === 'health' ? (
          <Health />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {SYSTEM_METRICS.map((m) => (
              <MetricPanel key={m} title={TITLES[m]} load={(signal) => adminSystemApi.metric(m, { signal })} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** GET /admin/system/health — uptime, database connection and process memory (no credentials or hostnames). */
function Health() {
  const q = useApiQuery((signal) => adminSystemApi.health({ signal }), []);
  if (q.isLoading) return <LoadingState layout="cards" rows={4} label="Checking health…" />;
  if (q.error) return <ErrorState error={q.error} onRetry={q.retry} signInHref={ADMIN_LOGIN_PATH} />;
  const h = q.data!.data;
  const hours = Math.floor(h.uptimeSeconds / 3600);
  const minutes = Math.floor((h.uptimeSeconds % 3600) / 60);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Server" value={h.serverStatus} hint={`Checked ${new Date(h.timestamp).toLocaleTimeString()}`} />
        <StatCard label="Database" value={h.database.connected ? 'Connected' : 'Not connected'} />
        <StatCard label="Uptime" value={`${hours} h ${minutes} min`} />
        <StatCard label="Memory in use" value={`${h.system.heapUsedMb} MB`} hint={`${h.system.freeMemoryMb.toLocaleString()} of ${h.system.totalMemoryMb.toLocaleString()} MB free on the host`} />
      </div>
      <p className="text-[11px] text-gray-500">Runtime {h.system.nodeVersion} on {h.system.platform}/{h.system.cpuArch}.</p>
      <button type="button" onClick={q.retry} className="text-xs font-semibold text-[var(--color-brand-blue)] hover:underline">Check again</button>
    </div>
  );
}
