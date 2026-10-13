// src/app/admin/(console)/users/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Users, ChevronLeft, ChevronRight, CheckCircle2, ShieldOff } from 'lucide-react';
import { adminUsersApi, type AdminUser } from '@/lib/admin-api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { QueryState, LoadingState, EmptyState } from '@/components/ui/states';
import { ADMIN_LOGIN_PATH } from '@/components/admin/AdminSessionProvider';
import { RequirePermission } from '@/components/admin/RequirePermission';

const PAGE_SIZE = 20;
const card = 'bg-white dark:bg-[#111827] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs';

function formatDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
}

function StatusBadges({ user }: { user: AdminUser }) {
  return (
    <span className="flex flex-wrap gap-1">
      {user.isEmailVerified ? (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="w-3 h-3" aria-hidden="true" /> Verified
        </span>
      ) : (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500">Unverified</span>
      )}
      {user.isRestricted && (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-700 dark:text-red-300">
          <ShieldOff className="w-3 h-3" aria-hidden="true" /> Restricted
        </span>
      )}
    </span>
  );
}

/** Learner list (GET /api/v1/admin/users?page&limit&search). Requires users.view (enforced by the backend). */
export default function AdminUsersPage() {
  return (
    <RequirePermission permission="users.view">
      <UsersList />
    </RequirePermission>
  );
}

function UsersList() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Debounce typing so each keystroke does not trigger a request
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const users = useApiQuery((signal) => adminUsersApi.list({ page, limit: PAGE_SIZE, search }, { signal }), [page, search]);
  const pagination = users.data?.data.pagination;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Users</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Search and review learner accounts.</p>
        </div>
        <label className="relative w-full sm:w-80">
          <span className="sr-only">Search users by name, username or email</span>
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
            placeholder="Name, username or email"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#111827] border border-gray-300 dark:border-[#1F2937] text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]/20 focus:border-[var(--color-brand-blue)]"
          />
        </label>
      </div>

      <QueryState
        query={users}
        signInHref={ADMIN_LOGIN_PATH}
        loading={<LoadingState layout="table" rows={6} label="Loading users…" />}
        isEmpty={(res) => res.data.users.length === 0}
        empty={
          <EmptyState
            icon={Users}
            title={search ? 'No users match your search' : 'No users yet'}
            description={search ? 'Try a different name, username or email.' : 'Learner accounts will appear here once people sign up.'}
          />
        }
      >
        {(res) => (
          <div className={`${card} overflow-hidden`} aria-busy={users.isRefreshing}>
            {/* Desktop table */}
            <table className="hidden md:table w-full text-sm">
              <caption className="sr-only">Users</caption>
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-5 py-3">Name</th>
                  <th scope="col" className="px-5 py-3">Email</th>
                  <th scope="col" className="px-5 py-3">Status</th>
                  <th scope="col" className="px-5 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {res.data.users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                    <td className="px-5 py-3">
                      <Link href={`/admin/users/${user.id}`} className="font-semibold text-gray-900 dark:text-white hover:text-[var(--color-brand-blue)] focus:outline-none focus-visible:underline">
                        {user.fullName || user.username || 'Unnamed user'}
                      </Link>
                      {user.username && <p className="text-xs text-gray-500">@{user.username}</p>}
                    </td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300 break-all">{user.email}</td>
                    <td className="px-5 py-3"><StatusBadges user={user} /></td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400 tabular-nums">{formatDate(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile list */}
            <ul className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
              {res.data.users.map((user) => (
                <li key={user.id}>
                  <Link href={`/admin/users/${user.id}`} className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/40">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{user.fullName || user.username || 'Unnamed user'}</p>
                    <p className="text-xs text-gray-500 break-all">{user.email}</p>
                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <StatusBadges user={user} />
                      <span className="text-[11px] text-gray-400 tabular-nums">{formatDate(user.createdAt)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </QueryState>

      {pagination && pagination.totalPages > 1 && (
        <nav aria-label="Pagination" className="flex items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span>
            Page {pagination.page} of {pagination.totalPages} · {pagination.total.toLocaleString()} users
          </span>
          <span className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || users.status === 'pending'}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" /> Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= pagination.totalPages || users.status === 'pending'}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Next <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </span>
        </nav>
      )}
    </div>
  );
}
