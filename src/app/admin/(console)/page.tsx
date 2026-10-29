// src/app/admin/(console)/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import {
  Info,
  type LucideIcon,
  Users,
  UserPlus,
  BookOpen,
  ListChecks,
  ClipboardList,
  GraduationCap,
  FileText,
  Video,
  Bot,
  MessageSquare,
  Zap,
  Coins,
} from 'lucide-react';
import { adminDashboardApi, type AdminVerifiedCounts } from '@/lib/admin-api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { QueryState, LoadingState } from '@/components/ui/states';
import { ADMIN_LOGIN_PATH, useAdminSession } from '@/components/admin/AdminSessionProvider';
import { HealthAndActivity, NeedsAttention, QuickAccess } from '@/components/admin/OverviewExtras';

const card = 'bg-white dark:bg-[#111827] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs';

type CountKey = keyof AdminVerifiedCounts['counts'];

const METRICS: Array<{ key: CountKey; label: string; hint: string; icon: LucideIcon }> = [
  { key: 'learners', label: 'Registered learners', hint: 'All learner accounts', icon: Users },
  { key: 'newLearnersLast30Days', label: 'New learners', hint: 'Joined in the last 30 days', icon: UserPlus },
  { key: 'learnerCourses', label: 'Courses', hint: 'In the learner catalog', icon: BookOpen },
  { key: 'quizzes', label: 'Quizzes', hint: 'Stored quizzes', icon: ListChecks },
  { key: 'tests', label: 'Tests', hint: 'Stored tests', icon: ClipboardList },
  { key: 'exams', label: 'Exams', hint: 'Stored exams', icon: GraduationCap },
  { key: 'uploadedFiles', label: 'Uploaded documents', hint: 'Files uploaded for AI study tools', icon: FileText },
  { key: 'youtubeResources', label: 'YouTube resources', hint: 'Videos submitted by learners', icon: Video },
  { key: 'aiTutorSessions', label: 'AI tutor sessions', hint: 'Sessions created', icon: Bot },
  { key: 'aiAssistantConversations', label: 'AI assistant chats', hint: 'Conversations created', icon: MessageSquare },
  { key: 'xpAwarded', label: 'XP awarded', hint: 'Sum of positive XP transactions', icon: Zap },
  { key: 'coinsAwarded', label: 'Coins awarded', hint: 'Sum of positive coin transactions', icon: Coins },
];

function StatCard({ label, value, icon: Icon, hint }: { label: string; value: number | null; icon: LucideIcon; hint: string }) {
  return (
    <div className={`${card} p-5 space-y-2`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</p>
        <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
          <Icon className="w-4 h-4 text-[var(--color-brand-blue)]" aria-hidden="true" />
        </div>
      </div>
      <p className="text-3xl font-extrabold text-gray-900 dark:text-white tabular-nums">
        {value === null ? <span className="text-base font-semibold text-gray-400">Unavailable</span> : value.toLocaleString()}
      </p>
      <p className="text-[11px] text-gray-500 dark:text-gray-400">{hint}</p>
    </div>
  );
}

function VerifiedCounts() {
  const counts = useApiQuery((signal) => adminDashboardApi.counts({ signal }), []);
  return (
    <QueryState
      query={counts}
      signInHref={ADMIN_LOGIN_PATH}
      loading={<LoadingState layout="cards" rows={8} label="Loading platform statistics…" />}
    >
      {(res) => (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {METRICS.map((m) => (
              <StatCard key={m.key} label={m.label} value={res.data.counts[m.key] ?? null} icon={m.icon} hint={m.hint} />
            ))}
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            Exact database counts, generated {new Date(res.data.generatedAt).toLocaleString()}.
            {res.data.unavailable.length > 0 &&
              ` ${res.data.unavailable.length} figure(s) could not be computed and are marked unavailable.`}
          </p>
        </div>
      )}
    </QueryState>
  );
}

/**
 * Admin overview. Figures come only from GET /api/v1/admin/dashboard/counts (exact COUNT/SUM queries).
 * Pending reviews, health and recent admin actions come from their own list endpoints. The detailed analytics,
 * engagement and revenue endpoints answer 501 (they used to return invented figures).
 */
export default function AdminOverviewPage() {
  const { admin, can } = useAdminSession();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Overview</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Signed in as {admin.fullName || admin.email} ({admin.role}).
        </p>
      </div>

      <NeedsAttention />

      {can('analytics.view') ? (
        <VerifiedCounts />
      ) : (
        <div className={`${card} p-5 text-sm text-gray-600 dark:text-gray-300`}>
          Platform statistics are not part of your role. Use the menu to open the sections available to you.
        </div>
      )}

      <HealthAndActivity />

      <QuickAccess />

      <div className={`${card} p-5 flex gap-3`}>
        <Info className="w-5 h-5 shrink-0 text-gray-400 mt-0.5" aria-hidden="true" />
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p className="font-semibold text-gray-700 dark:text-gray-300">What is not shown</p>
          <p>
            Active users, engagement, completion rates, revenue and the detailed analytics reports are not calculated by the
            backend yet. Those endpoints answer &ldquo;not available&rdquo; (they used to return invented figures), so they are left out
            rather than shown as real numbers.
          </p>
          {can('users.view') && (
            <p>
              <Link href="/admin/users" className="font-semibold text-[var(--color-brand-blue)] underline">
                Manage learners
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
