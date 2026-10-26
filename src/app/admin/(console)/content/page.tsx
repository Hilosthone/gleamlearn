// src/app/admin/(console)/content/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';
import { adminContentApi } from '@/lib/admin-api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { QueryState, LoadingState, EmptyState } from '@/components/ui/states';
import { Button } from '@/components/ui/Button';
import { ADMIN_LOGIN_PATH } from '@/components/admin/AdminSessionProvider';
import { RequirePermission } from '@/components/admin/RequirePermission';
import { CourseForm } from '@/components/admin/content/CatalogForms';

const PAGE_SIZE = 20;
const card = 'bg-white dark:bg-[#111827] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs';

/**
 * Learner course catalog (GET /api/v1/admin/content/courses). These are the same `courses` / `topics` /
 * `lessons` records the learner API (/api/v1/courses, /lessons) serves. Requires content.manage.
 * The learner /learn pages read this catalog.
 */
export default function AdminContentPage() {
  return (
    <RequirePermission permission="content.manage">
      <CourseCatalog />
    </RequirePermission>
  );
}

function CourseCatalog() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const courses = useApiQuery((signal) => adminContentApi.listCourses({ page, limit: PAGE_SIZE, search }, { signal }), [page, search]);
  const pagination = courses.data?.data.pagination;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Learning content</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            The learner course catalog served by the API (<code className="text-xs">/api/v1/courses</code>). Changes apply immediately;
            there is no draft or publish step.
          </p>
        </div>
        {!creating && (
          <Button type="button" size="sm" onClick={() => setCreating(true)}>
            <Plus className="w-4 h-4 mr-1.5" aria-hidden="true" /> New course
          </Button>
        )}
      </div>

      {creating && (
        <section className={`${card} p-6 space-y-4`} aria-labelledby="new-course-heading">
          <h2 id="new-course-heading" className="text-sm font-bold text-gray-900 dark:text-white">New course</h2>
          <CourseForm
            submitLabel="Create course"
            onCancel={() => setCreating(false)}
            onSubmit={async (payload, signal) => {
              const res = await adminContentApi.createCourse(payload as Parameters<typeof adminContentApi.createCourse>[0], { signal });
              router.push(`/admin/content/${encodeURIComponent(res.data.id)}?created=1`);
              return res;
            }}
          />
        </section>
      )}

      <label className="relative block w-full sm:w-80">
        <span className="sr-only">Search courses by title</span>
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
        <input
          type="search"
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setPage(1);
          }}
          placeholder="Search by title"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#111827] border border-gray-300 dark:border-[#1F2937] text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]/20 focus:border-[var(--color-brand-blue)]"
        />
      </label>

      <QueryState
        query={courses}
        signInHref={ADMIN_LOGIN_PATH}
        loading={<LoadingState layout="table" rows={6} label="Loading courses…" />}
        isEmpty={(res) => res.data.courses.length === 0}
        empty={
          <EmptyState
            icon={BookOpen}
            title={search ? 'No courses match your search' : 'No courses yet'}
            description={search ? 'Try a different title.' : 'Create the first course with “New course”.'}
          />
        }
      >
        {(res) => (
          <div className={`${card} overflow-hidden`} aria-busy={courses.isRefreshing}>
            <table className="hidden md:table w-full text-sm">
              <caption className="sr-only">Courses</caption>
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-5 py-3">Course</th>
                  <th scope="col" className="px-5 py-3">Track / level</th>
                  <th scope="col" className="px-5 py-3 text-right">Topics</th>
                  <th scope="col" className="px-5 py-3 text-right">Lessons</th>
                  <th scope="col" className="px-5 py-3 text-right">Enrolled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {res.data.courses.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/content/${encodeURIComponent(c.id)}`}
                        className="font-semibold text-gray-900 dark:text-white hover:text-[var(--color-brand-blue)] focus:outline-none focus-visible:underline"
                      >
                        {c.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300">
                      {c.track}
                      {c.level ? ` · ${c.level}` : ''}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">{c.topicCount ?? '—'}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{c.lessonCount ?? '—'}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{c.enrollmentCount ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <ul className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
              {res.data.courses.map((c) => (
                <li key={c.id}>
                  <Link href={`/admin/content/${encodeURIComponent(c.id)}`} className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/40">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{c.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {c.track}
                      {c.level ? ` · ${c.level}` : ''} · {c.topicCount ?? 0} topics · {c.lessonCount ?? 0} lessons ·{' '}
                      {c.enrollmentCount ?? 0} enrolled
                    </p>
                  </Link>
                </li>
              ))}
            </ul>

            {pagination && pagination.totalPages > 1 && (
              <nav aria-label="Course pages" className="flex items-center justify-between gap-3 px-5 py-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500">
                <span>
                  Page {pagination.page} of {pagination.totalPages} · {pagination.total} courses
                </span>
                <span className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" disabled={page <= 1 || courses.isRefreshing} onClick={() => setPage((p) => p - 1)}>
                    <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                    <span className="sr-only">Previous page</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page >= pagination.totalPages || courses.isRefreshing}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                    <span className="sr-only">Next page</span>
                  </Button>
                </span>
              </nav>
            )}
          </div>
        )}
      </QueryState>
    </div>
  );
}
