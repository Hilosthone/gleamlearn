// src/app/admin/(console)/settings/page.tsx
'use client';

import React from 'react';
import { Info } from 'lucide-react';
import { adminSettingsApi, type AdminSystemSettings } from '@/lib/admin-api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { QueryState, LoadingState } from '@/components/ui/states';
import { ADMIN_LOGIN_PATH } from '@/components/admin/AdminSessionProvider';
import { RequirePermission } from '@/components/admin/RequirePermission';

const card = 'bg-white dark:bg-[#111827] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs';

function formatValue(value: unknown): string {
  if (typeof value === 'boolean') return value ? 'On' : 'Off';
  if (Array.isArray(value)) return value.join(', ') || '—';
  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => `${k}: ${typeof v === 'boolean' ? (v ? 'on' : 'off') : String(v)}`)
      .join(' · ');
  }
  return value === null || value === undefined || value === '' ? '—' : String(value);
}

const ROWS: Array<[keyof AdminSystemSettings, string]> = [
  ['maintenanceMode', 'Maintenance mode'],
  ['freeAiLimit', 'Free daily AI requests'],
  ['premiumAiLimit', 'Premium daily AI requests'],
  ['maxUploadSizeMb', 'Maximum upload size (MB)'],
  ['supportedFileTypes', 'Supported file types'],
  ['streakRecoveryLimit', 'Streak recoveries'],
  ['xpRewards', 'XP rewards'],
  ['coinRewards', 'Coin rewards'],
  ['notificationSettings', 'Notification channels'],
];

/** GET /api/v1/admin/settings (settings.manage — Super Admin). Read-only; see the notice. */
export default function AdminSettingsPage() {
  return (
    <RequirePermission permission="settings.manage">
      <SettingsView />
    </RequirePermission>
  );
}

function SettingsView() {
  const settings = useApiQuery((signal) => adminSettingsApi.get({ signal }), []);
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Platform settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Values stored on the server.</p>
      </div>
      <div className={`${card} p-5 flex gap-3`} role="note">
        <Info className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" aria-hidden="true" />
        <p className="text-xs text-gray-600 dark:text-gray-300">
          <span className="font-semibold">Stored, not yet applied.</span> The platform does not read these values yet (for
          example, maintenance mode does not block access and AI limits are fixed in code), so editing is disabled here to
          avoid implying a change that would not take effect.
        </p>
      </div>
      <QueryState query={settings} signInHref={ADMIN_LOGIN_PATH} loading={<LoadingState layout="detail" label="Loading settings…" />}>
        {(res) => (
          <dl className={`${card} divide-y divide-gray-100 dark:divide-gray-800`}>
            {ROWS.map(([key, label]) => (
              <div key={key} className="px-5 py-3 grid grid-cols-1 sm:grid-cols-3 gap-1">
                <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</dt>
                <dd className="sm:col-span-2 text-sm text-gray-900 dark:text-gray-100 break-words">{formatValue(res.data[key])}</dd>
              </div>
            ))}
            <div className="px-5 py-3 text-[11px] text-gray-500 dark:text-gray-400">
              Last updated {res.data.updatedAt ? new Date(res.data.updatedAt).toLocaleString() : '—'}
            </div>
          </dl>
        )}
      </QueryState>
    </div>
  );
}
