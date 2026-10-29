// src/app/admin/(console)/users/[id]/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, History, Lock, BadgeCheck, BadgeX, ShieldOff, ShieldCheck } from 'lucide-react';
import { adminUsersApi, type AdminUser } from '@/lib/admin-api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { QueryState, LoadingState, EmptyState, ErrorState, SlowNotice } from '@/components/ui/states';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Input } from '@/components/ui/Input';
import { ADMIN_LOGIN_PATH, useAdminSession } from '@/components/admin/AdminSessionProvider';
import { RequirePermission } from '@/components/admin/RequirePermission';
import { UserLearning, UserMoreActions } from '@/components/admin/UserExtras';

const card = 'bg-white dark:bg-[#111827] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs';

const PROFILE_FIELDS: Array<[keyof AdminUser, string]> = [
  ['username', 'Username'],
  ['email', 'Email'],
  ['country', 'Country'],
  ['educationType', 'Education type'],
  ['university', 'University'],
  ['faculty', 'Faculty'],
  ['department', 'Department'],
  ['level', 'Level'],
  ['secondarySchool', 'Secondary school'],
  ['secondaryClass', 'Class'],
];

// The backend answers these with 501. Shown disabled, never as success.
const UNAVAILABLE_ACTIONS: Array<[string, string]> = [
  ['Freeze / unfreeze', 'Controlled by the learner'],
  ['Force logout', 'Use suspend: it ends sessions'],
  ['Delete permanently', 'Disabled pending a data-retention review'],
];

type RestrictionChange = 'suspend' | 'restrict' | 'lift';
const REASON_MAX = 500;

function formatDateTime(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
}

export default function AdminUserDetailPage() {
  return (
    <RequirePermission permission="users.view">
      <UserDetail />
    </RequirePermission>
  );
}

function UserDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { can } = useAdminSession();
  const [change, setChange] = useState<RestrictionChange | null>(null);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [revision, setRevision] = useState(0); // bumped after an action so the learning overview reloads

  const user = useApiQuery((signal) => adminUsersApi.get(id, { signal }), [id], { enabled: Boolean(id) });
  const activity = useApiQuery((signal) => adminUsersApi.activity(id, { signal }), [id], { enabled: Boolean(id) });

  const verification = useAsyncAction(async (signal, verified: boolean) => {
    const res = await adminUsersApi.setEmailVerified(id, verified, { signal });
    user.retry(); // reload the record so the page shows the server's state, not an assumption
    activity.retry();
    return res;
  });

  // Suspend and restrict set the same enforced flag; "lift" uses unrestrict, which clears both and is audit-logged.
  // Each call is idempotent, so trying again after a timeout cannot apply a change twice.
  const restriction = useAsyncAction(async (signal, next: RestrictionChange, why: string) => {
    const res =
      next === 'suspend'
        ? await adminUsersApi.setSuspended(id, true, { signal })
        : next === 'restrict'
          ? await adminUsersApi.setRestricted(id, true, why, { signal })
          : await adminUsersApi.setRestricted(id, false, undefined, { signal });
    user.retry();
    activity.retry();
    return res;
  });

  const openChange = (next: RestrictionChange) => {
    restriction.reset();
    setReason('');
    setReasonError('');
    setChange(next);
  };

  const confirmChange = async () => {
    if (!change) return;
    const why = reason.trim();
    if (change === 'restrict') {
      if (!why) return setReasonError('Enter the reason for this restriction.');
      if (why.length > REASON_MAX) return setReasonError(`Keep the reason under ${REASON_MAX} characters.`);
    }
    setReasonError('');
    const res = await restriction.run(change, why);
    if (res) setChange(null);
  };

  return (
    <div className="space-y-6">
      <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-brand-blue)] hover:underline">
        <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> All users
      </Link>

      <QueryState query={user} signInHref={ADMIN_LOGIN_PATH} loading={<LoadingState layout="detail" label="Loading user…" />}>
        {(res) => {
          const u = res.data;
          return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <section className={`${card} p-6 lg:col-span-2 space-y-5`} aria-labelledby="user-heading">
                <div>
                  <h1 id="user-heading" className="text-xl font-extrabold text-gray-900 dark:text-white">
                    {u.fullName || u.username || 'Unnamed user'}
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {u.isEmailVerified ? 'Email verified' : 'Email not verified'}
                    {u.isRestricted ? ' · Restricted' : ''}
                  </p>
                  {u.isRestricted && (
                    <div className="mt-3">
                      <Alert variant="warning" title="Account restricted">
                        This learner cannot sign in, and requests from existing sessions are refused.
                        {u.restrictionReason ? ` Reason: ${u.restrictionReason}` : ''}
                      </Alert>
                    </div>
                  )}
                </div>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  {PROFILE_FIELDS.map(([key, label]) => (
                    <div key={key}>
                      <dt className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{label}</dt>
                      <dd className="text-gray-900 dark:text-gray-100 break-all">{(u[key] as string) || '—'}</dd>
                    </div>
                  ))}
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Joined</dt>
                    <dd className="text-gray-900 dark:text-gray-100">{formatDateTime(u.createdAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">User ID</dt>
                    <dd className="text-gray-500 font-mono text-xs break-all">{u.id}</dd>
                  </div>
                </dl>
              </section>

              <section className={`${card} p-6 space-y-4`} aria-labelledby="actions-heading">
                <h2 id="actions-heading" className="text-sm font-bold text-gray-900 dark:text-white">Account actions</h2>

                {can('users.manage') ? (
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      isLoading={verification.isPending}
                      onClick={() => verification.run(!u.isEmailVerified)}
                    >
                      {u.isEmailVerified ? (
                        <><BadgeX className="w-4 h-4 mr-1.5" aria-hidden="true" /> Revoke email verification</>
                      ) : (
                        <><BadgeCheck className="w-4 h-4 mr-1.5" aria-hidden="true" /> Mark email as verified</>
                      )}
                    </Button>
                    {verification.isSlow && <SlowNotice />}
                    {verification.status === 'success' && verification.result && (
                      <Alert variant="success">{verification.result.message}</Alert>
                    )}
                    {verification.error && <ErrorState error={verification.error} compact signInHref={ADMIN_LOGIN_PATH} />}
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Changes the recorded verification status. Sign-in does not currently depend on it.
                    </p>

                    <div className="pt-3 mt-1 border-t border-gray-100 dark:border-gray-800 space-y-2">
                      {u.isRestricted ? (
                        <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => openChange('lift')}>
                          <ShieldCheck className="w-4 h-4 mr-1.5" aria-hidden="true" /> Lift restriction
                        </Button>
                      ) : (
                        <>
                          <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => openChange('suspend')}>
                            <ShieldOff className="w-4 h-4 mr-1.5" aria-hidden="true" /> Suspend account
                          </Button>
                          <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => openChange('restrict')}>
                            <ShieldOff className="w-4 h-4 mr-1.5" aria-hidden="true" /> Restrict with a reason
                          </Button>
                        </>
                      )}
                      {restriction.status === 'success' && restriction.result && change === null && (
                        <Alert variant="success">{restriction.result.message}</Alert>
                      )}
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        Enforced: a suspended or restricted learner cannot sign in, and their current sessions stop working on
                        the next request. Their data is kept.
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Your role cannot change accounts.</p>
                )}

                <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                  {UNAVAILABLE_ACTIONS.map(([label, why]) => (
                    <button
                      key={label}
                      type="button"
                      disabled
                      aria-describedby="unavailable-note"
                      className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-sm text-gray-400 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 cursor-not-allowed"
                    >
                      <span>{label}</span>
                      <span className="flex items-center gap-1 text-[10px] text-right">
                        {why}
                        <Lock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      </span>
                    </button>
                  ))}
                  <p id="unavailable-note" className="text-[11px] text-gray-500 dark:text-gray-400">
                    Unavailable: the backend refuses these (501). Permanent deletion would remove some of this learner&apos;s
                    records and leave others orphaned, so it stays disabled until a data-retention plan is approved.
                  </p>
                </div>
              </section>

              {can('users.manage') && (
                <ConfirmDialog
                  open={change !== null}
                  title={
                    change === 'lift'
                      ? 'Lift the restriction on this account?'
                      : change === 'restrict'
                        ? 'Restrict this account?'
                        : 'Suspend this account?'
                  }
                  description={
                    change === 'lift' ? (
                      <>
                        <strong className="text-gray-900 dark:text-white">{u.email}</strong> will be able to sign in again.
                      </>
                    ) : (
                      <span className="block space-y-3">
                        <span className="block">
                          <strong className="text-gray-900 dark:text-white">{u.email}</strong> will be signed out everywhere
                          and unable to sign in until the restriction is lifted. No data is deleted.
                        </span>
                        {change === 'restrict' && (
                          <Input
                            id="restriction-reason"
                            label="Reason (stored and shown to administrators)"
                            value={reason}
                            maxLength={REASON_MAX}
                            onChange={(e) => setReason(e.target.value)}
                            error={reasonError || undefined}
                            disabled={restriction.isPending}
                          />
                        )}
                      </span>
                    )
                  }
                  confirmLabel={change === 'lift' ? 'Lift restriction' : change === 'restrict' ? 'Restrict' : 'Suspend'}
                  isPending={restriction.isPending}
                  error={
                    restriction.error ? (
                      <div className="space-y-2">
                        <ErrorState error={restriction.error} compact signInHref={ADMIN_LOGIN_PATH} />
                        {(restriction.error.kind === 'timeout' || restriction.error.kind === 'network') && (
                          <p className="text-[11px] text-gray-500">
                            The change may already have been applied. Trying again is safe; the account is reloaded afterwards
                            to show its actual state.
                          </p>
                        )}
                      </div>
                    ) : restriction.isSlow ? (
                      <SlowNotice />
                    ) : undefined
                  }
                  onConfirm={confirmChange}
                  onCancel={() => {
                    setChange(null);
                    if (restriction.error) user.retry();
                  }}
                />
              )}
            </div>
          );
        }}
      </QueryState>

      <UserLearning userId={id} version={revision} />
      <UserMoreActions userId={id} onChanged={() => { user.retry(); activity.retry(); setRevision((n) => n + 1); }} />

      <section className={`${card} p-6 space-y-4`} aria-labelledby="history-heading">
        <h2 id="history-heading" className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
          <History className="w-4 h-4 text-gray-400" aria-hidden="true" /> Admin action history
        </h2>
        <QueryState
          query={activity}
          signInHref={ADMIN_LOGIN_PATH}
          loading={<LoadingState layout="list" rows={2} label="Loading history…" />}
          isEmpty={(res) => res.data.actionHistory.length === 0}
          empty={
            <EmptyState icon={History} title="No admin actions recorded" description="Actions taken on this account by administrators will be listed here." />
          }
        >
          {(res) => (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
              {res.data.actionHistory.map((entry) => (
                <li key={entry.id} className="py-2.5 flex items-center justify-between gap-3">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{entry.actionType}</span>
                  <span className="text-xs text-gray-500 tabular-nums">{formatDateTime(entry.performedAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </QueryState>
        <p className="text-[11px] text-gray-500 dark:text-gray-400">
          Entries recorded before these actions were enforced (SUSPEND, FREEZE, VERIFY) did not change the account at the time.
          Restrictions set from this page are recorded in the security audit log.
        </p>
      </section>
    </div>
  );
}
