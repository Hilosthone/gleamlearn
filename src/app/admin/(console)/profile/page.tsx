// src/app/admin/(console)/profile/page.tsx
'use client';

import { useAdminSession } from '@/components/admin/AdminSessionProvider';

const card = 'bg-white dark:bg-[#111827] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs';

/**
 * Current admin, exactly as returned by GET /api/v1/admin/auth/me. This page only renders inside the
 * console session gate, i.e. after that request succeeded — it never shows unconfirmed data.
 */
export default function AdminProfilePage() {
  const { admin } = useAdminSession();
  const rows: Array<[string, string]> = [
    ['Name', admin.fullName || '—'],
    ['Email', admin.email],
    ['Role', admin.role],
    ['Status', admin.isActive ? 'Active' : 'Inactive'],
    ['Admin since', admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : '—'],
  ];
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">My admin profile</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          As returned by the server (GET /admin/auth/me) when this session was confirmed.
        </p>
      </div>
      <dl className={`${card} p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm`}>
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{label}</dt>
            <dd className="text-gray-900 dark:text-gray-100 break-all">{value}</dd>
          </div>
        ))}
      </dl>
      <section className={`${card} p-6 space-y-2`} aria-labelledby="permissions-heading">
        <h2 id="permissions-heading" className="text-sm font-bold text-gray-900 dark:text-white">
          Permissions for your role
        </h2>
        {admin.permissions && admin.permissions.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5">
            {admin.permissions.map((p) => (
              <li key={p} className="text-[11px] font-mono px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                {p}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-gray-500">The server did not report permissions for this session.</p>
        )}
        <p className="text-[11px] text-gray-500 dark:text-gray-400">Reported by the server and enforced on every admin request.</p>
      </section>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Changing your admin password from the console is not available: the backend has no admin password-change or reset
        flow yet (those endpoints answer &ldquo;not available&rdquo;).
      </p>
    </div>
  );
}
