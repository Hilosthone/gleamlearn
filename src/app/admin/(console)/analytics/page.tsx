// src/app/admin/(console)/analytics/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download } from 'lucide-react';
import { ANALYTICS_SECTIONS, EXPORT_KINDS, AdminExportError, adminInsightsApi, downloadAdminExport } from '@/lib/admin-api';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { FeatureUnavailable } from '@/components/ui/states';
import { RequirePermission } from '@/components/admin/RequirePermission';
import { MetricPanel, PageHeader, TabBar, adminCard, useAdminTabs } from '@/components/admin/ui';

const TITLES: Record<(typeof ANALYTICS_SECTIONS)[number], string> = {
  overview: 'Platform overview',
  students: 'Learners',
  courses: 'Courses',
  subjects: 'Subjects',
  exams: 'Exams',
  quizzes: 'Quizzes',
  tests: 'Tests',
  learning: 'Learning engagement',
  retention: 'Retention',
  streaks: 'Streaks',
};

/** Reports & analytics (analytics.view) and the export centre (data.export: Super Admin). */
export default function AdminAnalyticsPage() {
  return (
    <RequirePermission permission="analytics.view">
      <Analytics />
    </RequirePermission>
  );
}

function Analytics() {
  const tabs = useAdminTabs([
    { id: 'platform', label: 'Platform' },
    { id: 'reports', label: 'Detailed reports' },
    { id: 'exports', label: 'Export centre', permission: 'data.export' },
  ]);
  return (
    <div className="space-y-6">
      <PageHeader title="Analytics & exports" description="What the platform measures, and downloadable data." />
      <TabBar label="Analytics sections" tabs={tabs.visible} active={tabs.active} onSelect={tabs.select} />
      <div role="tabpanel" className="space-y-4">
        {tabs.active === 'platform' && (
          <>
            <Alert variant="info">
              Exact counts of learners, courses, assessments, uploads, AI sessions, XP and coins are on the <Link className="underline" href="/admin">Overview</Link>, and
              XP, coin and streak totals under <Link className="underline" href="/admin/gamification">Gamification</Link>. Active-user, engagement and completion figures are
              not measured, so they show as unavailable or &ldquo;—&rdquo;.
            </Alert>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <MetricPanel title="Accounts" load={(signal) => adminInsightsApi.dashboardSection('users', { signal })} />
              <MetricPanel title="Engagement" load={(signal) => adminInsightsApi.dashboardSection('engagement', { signal })} />
              <MetricPanel title="Sign-ins and sessions" load={(signal) => adminInsightsApi.dashboardSection('activity', { signal })} />
              <MetricPanel title="Learning totals" load={(signal) => adminInsightsApi.dashboardSection('learning', { signal })} />
            </div>
          </>
        )}
        {tabs.active === 'reports' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {ANALYTICS_SECTIONS.map((s) => (
              <MetricPanel key={s} title={TITLES[s]} load={(signal) => adminInsightsApi.analytics(s, { signal })} />
            ))}
          </div>
        )}
        {tabs.active === 'exports' && <Exports />}
      </div>
    </div>
  );
}

/** GET /admin/export/:kind?format=csv|json — downloaded with the admin token; contains personal data. */
function Exports() {
  const [done, setDone] = useState<string | null>(null);
  // the export error keeps its HTTP status (useAsyncAction normalises errors), so a 501 reads as "unavailable"
  const [err, setErr] = useState<AdminExportError | Error | null>(null);
  const run = useAsyncAction(async (_signal: AbortSignal, kind: string, format: 'csv' | 'json') => {
    setDone(null);
    setErr(null);
    try {
      const res = await downloadAdminExport(kind, format);
      setDone(`Downloaded ${res.filename} (${res.bytes.toLocaleString()} bytes).`);
    } catch (e) {
      setErr(e as Error);
    }
  });
  return (
    <div className="space-y-4">
      <Alert variant="warning">Exports can contain learners&apos; personal data (names and email addresses). Store and share them only as your data policy allows.</Alert>
      {done && <Alert variant="success">{done}</Alert>}
      {err && (err instanceof AdminExportError && err.status === 501 ? <FeatureUnavailable title="This export isn't available" description={err.message} /> : <Alert variant="error">{err.message}</Alert>)}
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4" aria-label="Exports">
        {EXPORT_KINDS.map(([kind, title, description]) => (
          <li key={kind} className={`${adminCard} p-5 space-y-2`}>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
            <div className="flex gap-2">
              {(['csv', 'json'] as const).map((f) => (
                <Button key={f} type="button" size="sm" variant="outline" disabled={run.isPending} onClick={() => void run.run(kind, f)} aria-label={`Download ${title} as ${f.toUpperCase()}`}>
                  <Download className="w-3.5 h-3.5" aria-hidden="true" /> {f.toUpperCase()}
                </Button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
