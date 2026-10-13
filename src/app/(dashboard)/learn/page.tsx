'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Search, GraduationCap, ArrowRight, BookMarked } from 'lucide-react';
import { useApiQuery } from '@/hooks/useApiQuery';
import { QueryState, LoadingState, EmptyState } from '@/components/ui/states';
import { listCourses, listEnrolledCourses, TRACKS, type Course, type EnrolledCourse, type TrackFilter } from '@/lib/learning';

const card = 'bg-white dark:bg-[#111827] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs';
const GRADIENTS = ['from-blue-600 to-indigo-700', 'from-purple-600 to-indigo-800', 'from-emerald-600 to-teal-700', 'from-amber-600 to-orange-700'];
const gradientFor = (id: string) => GRADIENTS[[...id].reduce((n, ch) => n + ch.charCodeAt(0), 0) % GRADIENTS.length];

/** Learning hub: the learner's enrolled courses and the course catalog (GET /users/me/courses, GET /courses[/search]). */
export default function LearnPage() {
  const [track, setTrack] = useState<TrackFilter>('All');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const enrolled = useApiQuery(() => listEnrolledCourses(), []);
  const catalog = useApiQuery(() => listCourses({ q: search, track }), [search, track]);
  const enrolledIds = new Set((enrolled.data ?? []).map((c) => c.id));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Learning Hub 📚</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your courses and the full course catalog.</p>
        </div>
        <label className="relative w-full md:w-72">
          <span className="sr-only">Search courses</span>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search courses…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)] shadow-xs"
          />
        </label>
      </div>

      {/* My courses */}
      <section className={`${card} p-6 sm:p-8 space-y-4`} aria-labelledby="my-courses">
        <h2 id="my-courses" className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BookMarked className="w-4 h-4 text-[var(--color-brand-blue)]" aria-hidden="true" /> My courses
        </h2>
        <QueryState
          query={enrolled}
          loading={<LoadingState layout="list" rows={2} label="Loading your courses…" />}
          isEmpty={(list) => list.length === 0}
          empty={<EmptyState icon={GraduationCap} title="You haven't enrolled in a course yet" description="Pick a course from the catalog below to start learning." />}
        >
          {(list: EnrolledCourse[]) => (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {list.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/learn/${encodeURIComponent(c.id)}`}
                    className="block p-5 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-[var(--color-brand-blue)] transition-colors space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{c.title}</p>
                        <p className="text-xs text-gray-500">{[c.track, c.level].filter(Boolean).join(' · ')}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                        <span>Course progress</span>
                        <span className="tabular-nums">{Math.round(c.progressPercentage ?? 0)}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden" role="progressbar" aria-valuenow={Math.round(c.progressPercentage ?? 0)} aria-valuemin={0} aria-valuemax={100} aria-label={`${c.title} progress`}>
                        <div className="h-full bg-[var(--color-brand-blue)]" style={{ width: `${Math.min(100, Math.max(0, c.progressPercentage ?? 0))}%` }} />
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </QueryState>
      </section>

      {/* Catalog */}
      <section className="space-y-4" aria-labelledby="catalog">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 id="catalog" className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[var(--color-brand-blue)]" aria-hidden="true" /> Course catalog
          </h2>
          <div className="flex items-center gap-2" role="group" aria-label="Filter by track">
            {TRACKS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTrack(t)}
                aria-pressed={track === t}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  track === t
                    ? 'bg-[var(--color-brand-blue)] text-white shadow-md shadow-blue-500/20'
                    : 'bg-white dark:bg-[#111827] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <QueryState
          query={catalog}
          loading={<LoadingState layout="cards" rows={4} label="Loading courses…" />}
          isEmpty={(list) => list.length === 0}
          empty={
            <EmptyState
              icon={BookOpen}
              title={search || track !== 'All' ? 'No courses match' : 'No courses are available yet'}
              description={search || track !== 'All' ? 'Try another search or track.' : 'Courses appear here once they are published by GleamLearn.'}
            />
          }
        >
          {(list: Course[]) => (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-busy={catalog.isRefreshing}>
              {list.map((c) => (
                <li key={c.id}>
                  <Link href={`/learn/${encodeURIComponent(c.id)}`} className={`${card} block overflow-hidden hover:shadow-md transition-shadow h-full`}>
                    <div className={`h-20 bg-gradient-to-br ${gradientFor(c.id)} p-4 flex items-end`}>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white/90">{c.track}</span>
                    </div>
                    <div className="p-5 space-y-2">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{c.title}</p>
                      {c.description && <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{c.description}</p>}
                      <p className="text-[11px] text-gray-400">
                        {[c.level, c.topics ? `${c.topics.length} topics` : null].filter(Boolean).join(' · ')}
                        {enrolledIds.has(c.id) && <span className="ml-2 font-semibold text-[var(--color-brand-blue)]">Enrolled</span>}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </QueryState>
      </section>
    </div>
  );
}
