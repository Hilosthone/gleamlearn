// 'use client';

// import React from 'react';
// import Link from 'next/link';
// import { ArrowRight, Bell, BookOpen, Clock, Coins, Compass, Flame, FolderPlus, GraduationCap, PenTool, Sparkles, Trophy, Zap } from 'lucide-react';
// import { useApiQuery } from '@/hooks/useApiQuery';
// import { QueryState, LoadingState, EmptyState, ErrorState } from '@/components/ui/states';
// import { useLearnerSession } from '@/components/auth/LearnerSessionProvider';
// import { NextSteps } from '@/components/learning/NextSteps';
// import { greeting, listEnrolledCourses, loadCourseRecommendations, recentNotifications, sharedLearnerStats, studyMinutes, type CourseRecommendations } from '@/lib/learning';

// const card = 'bg-white dark:bg-[#111827] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs';

// function formatMinutes(total: number): string {
//   if (total < 60) return `${total} min`;
//   const h = Math.floor(total / 60);
//   const m = total % 60;
//   return m ? `${h} h ${m} min` : `${h} h`;
// }

// function Stat({ label, value, hint, icon: Icon, tone }: { label: string; value: React.ReactNode; hint?: string; icon: typeof Zap; tone: string }) {
//   return (
//     <div className={`${card} p-5 space-y-3`}>
//       <div className="flex items-center justify-between">
//         <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</span>
//         <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${tone}`}>
//           <Icon className="w-4 h-4" aria-hidden="true" />
//         </span>
//       </div>
//       <p className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">{value}</p>
//       {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
//     </div>
//   );
// }

// /**
//  * Learner dashboard. Every figure comes from the backend for the signed-in learner:
//  * GET /xp, /coins, /streak, /study-sessions/stats, /users/me/courses, /notifications.
//  * A stat whose endpoint fails is shown as "—" instead of a made-up number.
//  */
// export default function DashboardPage() {
//   const { user } = useLearnerSession();
//   const name = (user.fullName || user.username || '').split(' ')[0];

//   const stats = useApiQuery(() => sharedLearnerStats(), []); // shared with the Navbar (one request)
//   const minutes = useApiQuery(() => studyMinutes().catch(() => null), []);
//   const courses = useApiQuery(() => listEnrolledCourses(), []);
//   const notifications = useApiQuery(() => recentNotifications(3), []);
//   const recommended = useApiQuery(() => loadCourseRecommendations(), []);

//   const s = stats.data;
//   const streak = s?.streak?.currentStreak ?? null;

//   return (
//     <div className="space-y-8 animate-in fade-in duration-300">
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
//         <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" aria-hidden="true" />
//         <div className="space-y-2 z-10">
//           <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
//             {greeting()}
//             {name ? `, ${name}` : ''}!
//           </h1>
//           <p className="text-sm text-blue-100 max-w-xl">
//             {streak && streak > 0 ? (
//               <>
//                 You are on a <span className="font-bold text-amber-300 inline-flex items-center gap-1"><Flame className="w-3.5 h-3.5 fill-amber-300 inline" aria-hidden="true" /> {streak}-day streak</span>. Keep it going today.
//               </>
//             ) : (
//               'Pick up where you left off, or start a new course.'
//             )}
//           </p>
//         </div>
//         <Link href="/learn" className="z-10 px-5 py-3 rounded-2xl bg-white text-blue-900 font-bold text-sm hover:bg-blue-50 transition-all shadow-md flex items-center gap-2 group self-start md:self-auto">
//           <span>Go to my courses</span>
//           <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
//         </Link>
//       </div>

//       {stats.isLoading ? (
//         <LoadingState layout="cards" rows={4} label="Loading your stats…" />
//       ) : (
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//           <Stat
//             label="Level & XP"
//             icon={Zap}
//             tone="bg-blue-50 dark:bg-blue-950/40 text-[var(--color-brand-blue)]"
//             value={s?.xp ? <>Lv {s.xp.level} <span className="text-xs font-semibold text-blue-600">{s.xp.totalXp.toLocaleString()} XP</span></> : '—'}
//             hint={s?.xp ? `${s.xp.currentXp.toLocaleString()} / ${s.xp.nextLevelXp.toLocaleString()} XP to the next level` : 'Unavailable right now'}
//           />
//           <Stat label="gleamCoins" icon={Coins} tone="bg-amber-50 dark:bg-amber-950/40 text-amber-500" value={s?.coins ? s.coins.balance.toLocaleString() : '—'} hint={s?.coins ? undefined : 'Unavailable right now'} />
//           <Stat
//             label="Streak"
//             icon={Flame}
//             tone="bg-orange-50 dark:bg-orange-950/40 text-orange-500"
//             value={s?.streak ? `${s.streak.currentStreak} day${s.streak.currentStreak === 1 ? '' : 's'}` : '—'}
//             hint={s?.streak ? `Longest: ${s.streak.longestStreak} · ${s.streak.checkedInToday ? 'today counts' : 'study today to keep it'}` : 'Unavailable right now'}
//           />
//           <Stat
//             label="Study time"
//             icon={Clock}
//             tone="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600"
//             value={typeof minutes.data === 'number' ? formatMinutes(minutes.data) : '—'}
//             hint={typeof minutes.data === 'number' ? 'Completed study sessions' : 'Unavailable right now'}
//           />
//         </div>
//       )}

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <section className={`${card} p-6 lg:col-span-2 space-y-4`} aria-labelledby="continue">
//           <div className="flex items-center justify-between">
//             <h2 id="continue" className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
//               <BookOpen className="w-4 h-4 text-[var(--color-brand-blue)]" aria-hidden="true" /> Continue learning
//             </h2>
//             <Link href="/learn" className="text-xs font-semibold text-[var(--color-brand-blue)] hover:underline">All courses</Link>
//           </div>
//           <QueryState
//             query={courses}
//             loading={<LoadingState layout="list" rows={2} label="Loading your courses…" />}
//             isEmpty={(list) => list.length === 0}
//             empty={<EmptyState icon={GraduationCap} title="No courses yet" description="Enrol in a course from the Learning Hub to see it here." action={<Link href="/learn" className="text-xs font-semibold text-[var(--color-brand-blue)] underline">Browse courses</Link>} />}
//           >
//             {(list) => (
//               <ul className="space-y-3">
//                 {list.slice(0, 3).map((c) => (
//                   <li key={c.id}>
//                     <Link href={`/learn/${encodeURIComponent(c.id)}`} className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-[var(--color-brand-blue)] transition-colors">
//                       <div className="min-w-0">
//                         <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{c.title}</p>
//                         <p className="text-xs text-gray-500">{[c.track, c.level].filter(Boolean).join(' · ')}</p>
//                       </div>
//                       <span className="text-xs font-bold text-[var(--color-brand-blue)] tabular-nums shrink-0">{Math.round(c.progressPercentage ?? 0)}%</span>
//                     </Link>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </QueryState>
//         </section>

//         <section className={`${card} p-6 space-y-4`} aria-labelledby="updates">
//           <div className="flex items-center justify-between">
//             <h2 id="updates" className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
//               <Bell className="w-4 h-4 text-gray-400" aria-hidden="true" /> Updates
//             </h2>
//             <Link href="/notifications" className="text-xs font-semibold text-[var(--color-brand-blue)] hover:underline">All</Link>
//           </div>
//           <QueryState
//             query={notifications}
//             loading={<LoadingState layout="list" rows={2} label="Loading updates…" />}
//             isEmpty={(list) => list.length === 0}
//             empty={<p className="text-xs text-gray-500">No updates yet.</p>}
//           >
//             {(list) => (
//               <ul className="space-y-3">
//                 {list.map((n) => (
//                   <li key={n.id} className="text-sm">
//                     <p className={`font-semibold ${n.isRead ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>{n.title}</p>
//                     <p className="text-xs text-gray-500 line-clamp-2">{n.message}</p>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </QueryState>
//         </section>
//       </div>

//       <NextSteps />
//       <Recommended query={recommended} />

//       <section aria-labelledby="practice" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         <h2 id="practice" className="sr-only">Practice</h2>
//         {[
//           { href: '/practice', title: 'Practice quizzes', icon: PenTool },
//           { href: '/exams', title: 'Exam preparation', icon: Trophy },
//           { href: '/ai', title: 'AI tutor', icon: Sparkles },
//           { href: '/my-courses', title: 'My courses', icon: FolderPlus },
//         ].map((t) => (
//           <Link key={t.href} href={t.href} className={`${card} p-5 flex items-center justify-between gap-3 hover:shadow-md transition-shadow`}>
//             <span className="flex items-center gap-3 text-sm font-bold text-gray-900 dark:text-white">
//               <t.icon className="w-5 h-5 text-[var(--color-brand-blue)]" aria-hidden="true" /> {t.title}
//             </span>
//             <ArrowRight className="w-4 h-4 text-gray-400" aria-hidden="true" />
//           </Link>
//         ))}
//       </section>
//     </div>
//   );
// }

// const PROFILE_HINT: Record<string, string> = { 'education type': 'education type', class: 'class', level: 'level', 'exam goals': 'exam goals', 'course of study': 'course of study' };

// /** Catalogue courses that match the learner's profile, with the reason for each (GET /recommendations/courses). */
// function Recommended({ query }: { query: ReturnType<typeof useApiQuery<CourseRecommendations>> }) {
//   const r = query.data;
//   return (
//     <section className={`${card} p-6 space-y-4`} aria-labelledby="recommended">
//       <div className="flex items-center justify-between">
//         <h2 id="recommended" className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
//           <Compass className="w-4 h-4 text-[var(--color-brand-blue)]" aria-hidden="true" /> Recommended for you
//         </h2>
//         <Link href="/learn" className="text-xs font-semibold text-[var(--color-brand-blue)] hover:underline">Browse and search</Link>
//       </div>
//       {query.isLoading ? (
//         <LoadingState layout="list" rows={2} label="Finding courses for you…" />
//       ) : query.error && !r ? (
//         query.error.kind === 'not_implemented' ? <p className="text-xs text-gray-500">Recommendations aren&apos;t available yet.</p> : <ErrorState error={query.error} onRetry={query.retry} compact />
//       ) : r ? (
//         <>
//           {r.items.length === 0 ? (
//             <p className="text-sm text-gray-600 dark:text-gray-300">
//               {r.catalogueSize === 0 ? 'There are no courses in the catalogue yet.' : 'No catalogue courses match your profile yet.'}
//             </p>
//           ) : (
//             <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
//               {r.items.slice(0, 4).map((c) => (
//                 <li key={c.courseId}>
//                   <Link href={`/learn/${encodeURIComponent(c.courseId)}`} className="block p-4 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-[var(--color-brand-blue)] transition-colors space-y-1">
//                     <p className="text-sm font-bold text-gray-900 dark:text-white">{c.title}</p>
//                     <p className="text-[11px] text-gray-500">{[c.track, c.level].filter(Boolean).join(' · ')}</p>
//                     <ul className="text-[11px] text-emerald-700 dark:text-emerald-400 space-y-0.5">
//                       {c.reasons.map((reason) => (
//                         <li key={reason}>✓ {reason}</li>
//                       ))}
//                     </ul>
//                   </Link>
//                 </li>
//               ))}
//             </ul>
//           )}
//           {r.uncoveredExamGoals.length > 0 && (
//             <p className="text-xs text-gray-600 dark:text-gray-300">
//               No catalogue course covers {r.uncoveredExamGoals.join(', ')} yet.{' '}
//               <Link href="/my-courses" className="font-semibold text-[var(--color-brand-blue)] underline">Create your own course</Link> to organise your preparation.
//             </p>
//           )}
//           {r.missingProfile.length > 0 && (
//             <p className="text-xs text-gray-500">
//               Add your {r.missingProfile.map((m) => PROFILE_HINT[m] ?? m).join(', ')} in{' '}
//               <Link href="/settings" className="font-semibold text-[var(--color-brand-blue)] underline">Settings</Link> for better recommendations.
//             </p>
//           )}
//         </>
//       ) : null}
//     </section>
//   );
// }




'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Bell, BookOpen, Clock, Coins, Compass, Flame, FolderPlus, GraduationCap, PenTool, Sparkles, Trophy, Zap, Bookmark, Calendar, TrendingUp, Settings, HelpCircle, History, MoreHorizontal, X } from 'lucide-react';
import { useApiQuery } from '@/hooks/useApiQuery';
import { QueryState, LoadingState, EmptyState, ErrorState } from '@/components/ui/states';
import { useLearnerSession } from '@/components/auth/LearnerSessionProvider';
import { NextSteps } from '@/components/learning/NextSteps';
import { DailyInspiration } from '@/components/learning/DailyInspiration';
import { greeting, listEnrolledCourses, loadCourseRecommendations, recentNotifications, sharedLearnerStats, studyMinutes, type CourseRecommendations } from '@/lib/learning';

const card = 'bg-white dark:bg-[#111827] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs';

function formatMinutes(total: number): string {
  if (total < 60) return `${total} min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

function Stat({ label, value, hint, icon: Icon, tone }: { label: string; value: React.ReactNode; hint?: string; icon: typeof Zap; tone: string }) {
  return (
    <div className={`${card} p-5 space-y-3`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</span>
        <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${tone}`}>
          <Icon className="w-4 h-4" aria-hidden="true" />
        </span>
      </div>
      <p className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">{value}</p>
      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

const ALL_QUICK_NAV = [
  { href: '/practice', title: 'Practice quizzes', icon: PenTool, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/30' },
  { href: '/exams', title: 'Exam preparation', icon: Trophy, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  { href: '/ai', title: 'AI tutor', icon: Sparkles, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/30' },
  { href: '/my-courses', title: 'My courses', icon: FolderPlus, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  { href: '/library', title: 'Library', icon: Bookmark, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
  { href: '/planner', title: 'Planner', icon: Calendar, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-950/30' },
  { href: '/progress', title: 'Progress', icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  { href: '/settings', title: 'Settings', icon: Settings, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/30' },
  { href: '/support', title: 'Support', icon: HelpCircle, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/30' },
  { href: '/history', title: 'History', icon: History, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950/30' },
];

/**
 * Learner dashboard. Every figure comes from the backend for the signed-in learner:
 * GET /xp, /coins, /streak, /study-sessions/stats, /users/me/courses, /notifications.
 * A stat whose endpoint fails is shown as "—" instead of a made-up number.
 */
export default function DashboardPage() {
  const { user } = useLearnerSession();
  const name = (user.fullName || user.username || '').split(' ')[0];

  const stats = useApiQuery(() => sharedLearnerStats(), []); // shared with the Navbar (one request)
  const minutes = useApiQuery(() => studyMinutes().catch(() => null), []);
  const courses = useApiQuery(() => listEnrolledCourses(), []);
  const notifications = useApiQuery(() => recentNotifications(3), []);
  const recommended = useApiQuery(() => loadCourseRecommendations(), []);

  const s = stats.data;
  const streak = s?.streak?.currentStreak ?? null;

  // State for Quick Nav Modal
  const [isQuickNavModalOpen, setIsQuickNavModalOpen] = useState(false);

  // Typewriter effect state for greeting
  const fullGreetingText = `${greeting()}${name ? `, ${name}` : ''}!`;
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(120);

  useEffect(() => {
    const handleTyping = () => {
      const fullText = fullGreetingText;

      setDisplayedText(
        isDeleting
          ? fullText.substring(0, displayedText.length - 1)
          : fullText.substring(0, displayedText.length + 1)
      );

      if (!isDeleting && displayedText === fullText) {
        setTimeout(() => setIsDeleting(true), 3000);
        setTypingSpeed(60);
      } else if (isDeleting && displayedText === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
        setTypingSpeed(120);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, loopNum, typingSpeed, fullGreetingText]);

  // Display half on screen initially (e.g., first 5 items)
  const displayedQuickNav = ALL_QUICK_NAV.slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" aria-hidden="true" />
        <div className="space-y-3 z-10 max-w-xl">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight min-h-[2rem] inline-flex items-center">
              <span>{displayedText}</span>
              <span className="inline-block w-0.5 h-5 ml-1 bg-white animate-pulse" aria-hidden="true" />
            </h1>
            <p className="text-xs sm:text-sm font-medium text-blue-100 inline">
              {streak && streak > 0 ? (
                <>
                  You are on a <span className="font-bold text-amber-300 inline-flex items-center gap-1"><Flame className="w-3.5 h-3.5 fill-amber-300 inline" aria-hidden="true" /> {streak}-day streak</span>. Keep it going today.
                </>
              ) : (
                'Pick up where you left off, or start a new course.'
              )}
            </p>
          </div>
          <DailyInspiration />
        </div>
        
        {/* Responsive Hero Links Action Group */}
        <div className="z-10 flex flex-wrap items-center gap-2 sm:gap-2.5">
          <Link href="/learn" className="px-3.5 py-2 rounded-2xl bg-white text-blue-900 font-bold text-xs hover:bg-blue-50 transition-all shadow-md flex items-center gap-1.5 group">
            <span>My courses</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </Link>
          <Link href="/practice" className="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/20 flex items-center gap-1.5">
            <PenTool className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Practice</span>
          </Link>
          <Link href="/ai" className="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/20 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>AI Tutor</span>
          </Link>
          <Link href="/exams" className="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/20 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Exams</span>
          </Link>
          <Link href="/planner" className="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/20 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Planner</span>
          </Link>
        </div>
      </div>

      {stats.isLoading ? (
        <LoadingState layout="cards" rows={4} label="Loading your stats…" />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat
            label="Level & XP"
            icon={Zap}
            tone="bg-blue-50 dark:bg-blue-950/40 text-[var(--color-brand-blue)]"
            value={s?.xp ? <>Lv {s.xp.level} <span className="text-xs font-semibold text-blue-600">{s.xp.totalXp.toLocaleString()} XP</span></> : '—'}
            hint={s?.xp ? `${s.xp.currentXp.toLocaleString()} / ${s.xp.nextLevelXp.toLocaleString()} XP to the next level` : 'Unavailable right now'}
          />
          <Stat label="gleamCoins" icon={Coins} tone="bg-amber-50 dark:bg-amber-950/40 text-amber-500" value={s?.coins ? s.coins.balance.toLocaleString() : '—'} hint={s?.coins ? undefined : 'Unavailable right now'} />
          <Stat
            label="Streak"
            icon={Flame}
            tone="bg-orange-50 dark:bg-orange-950/40 text-orange-500"
            value={s?.streak ? `${s.streak.currentStreak} day${s.streak.currentStreak === 1 ? '' : 's'}` : '—'}
            hint={s?.streak ? `Longest: ${s.streak.longestStreak} · ${s.streak.checkedInToday ? 'today counts' : 'study today to keep it'}` : 'Unavailable right now'}
          />
          <Stat
            label="Study time"
            icon={Clock}
            tone="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600"
            value={typeof minutes.data === 'number' ? formatMinutes(minutes.data) : '—'}
            hint={typeof minutes.data === 'number' ? 'Completed study sessions' : 'Unavailable right now'}
          />
        </div>
      )}

      {/* Quick Navigation Toolbar (Displays Half + More Button) */}
      <section aria-labelledby="quick-navigation" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="quick-navigation" className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Quick Navigation</h2>
          <button
            type="button"
            onClick={() => setIsQuickNavModalOpen(true)}
            className="text-xs font-bold text-[var(--color-brand-blue)] hover:underline flex items-center gap-1"
          >
            <span>More ({ALL_QUICK_NAV.length})</span>
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {displayedQuickNav.map((nav) => (
            <Link
              key={nav.title}
              href={nav.href}
              className={`${card} p-4 flex flex-col items-center text-center gap-2 hover:border-[var(--color-brand-blue)] hover:shadow-md transition-all group`}
            >
              <span className={`w-10 h-10 rounded-2xl flex items-center justify-center ${nav.bg} ${nav.color} group-hover:scale-110 transition-transform shrink-0`}>
                <nav.icon className="w-5 h-5" aria-hidden="true" />
              </span>
              <span className="text-xs font-bold text-gray-900 dark:text-white truncate w-full">{nav.title}</span>
            </Link>
          ))}
          {/* Quick "More" Trigger Card */}
          <button
            type="button"
            onClick={() => setIsQuickNavModalOpen(true)}
            className={`${card} p-4 flex flex-col items-center text-center gap-2 hover:border-[var(--color-brand-blue)] hover:shadow-md transition-all group bg-gray-50 dark:bg-gray-800/40 cursor-pointer`}
          >
            <span className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 group-hover:scale-110 transition-transform shrink-0">
              <MoreHorizontal className="w-5 h-5" aria-hidden="true" />
            </span>
            <span className="text-xs font-bold text-gray-900 dark:text-white truncate w-full">View All</span>
          </button>
        </div>
      </section>

      {/* Quick Navigation Modal for All Options */}
      {isQuickNavModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white">All Quick Navigation</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Select any section to jump right in</p>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickNavModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto pr-1">
              {ALL_QUICK_NAV.map((nav) => (
                <Link
                  key={nav.title}
                  href={nav.href}
                  onClick={() => setIsQuickNavModalOpen(false)}
                  className={`${card} p-4 flex flex-col items-center text-center gap-2 hover:border-[var(--color-brand-blue)] hover:shadow-md transition-all group`}
                >
                  <span className={`w-10 h-10 rounded-2xl flex items-center justify-center ${nav.bg} ${nav.color} group-hover:scale-110 transition-transform shrink-0`}>
                    <nav.icon className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white truncate w-full">{nav.title}</span>
                </Link>
              ))}
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsQuickNavModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className={`${card} p-6 lg:col-span-2 space-y-4`} aria-labelledby="continue">
          <div className="flex items-center justify-between">
            <h2 id="continue" className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[var(--color-brand-blue)]" aria-hidden="true" /> Continue learning
            </h2>
            <Link href="/learn" className="text-xs font-semibold text-[var(--color-brand-blue)] hover:underline">All courses</Link>
          </div>
          <QueryState
            query={courses}
            loading={<LoadingState layout="list" rows={2} label="Loading your courses…" />}
            isEmpty={(list) => list.length === 0}
            empty={<EmptyState icon={GraduationCap} title="No courses yet" description="Enrol in a course from the Learning Hub to see it here." action={<Link href="/learn" className="text-xs font-semibold text-[var(--color-brand-blue)] underline">Browse courses</Link>} />}
          >
            {(list) => (
              <ul className="space-y-3">
                {list.slice(0, 3).map((c) => (
                  <li key={c.id}>
                    <Link href={`/learn/${encodeURIComponent(c.id)}`} className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-[var(--color-brand-blue)] transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{c.title}</p>
                        <p className="text-xs text-gray-500">{[c.track, c.level].filter(Boolean).join(' · ')}</p>
                      </div>
                      <span className="text-xs font-bold text-[var(--color-brand-blue)] tabular-nums shrink-0">{Math.round(c.progressPercentage ?? 0)}%</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </QueryState>
        </section>

        <section className={`${card} p-6 space-y-4`} aria-labelledby="updates">
          <div className="flex items-center justify-between">
            <h2 id="updates" className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-gray-400" aria-hidden="true" /> Updates
            </h2>
            <Link href="/notifications" className="text-xs font-semibold text-[var(--color-brand-blue)] hover:underline">All</Link>
          </div>
          <QueryState
            query={notifications}
            loading={<LoadingState layout="list" rows={2} label="Loading updates…" />}
            isEmpty={(list) => list.length === 0}
            empty={<p className="text-xs text-gray-500">No updates yet.</p>}
          >
            {(list) => (
              <ul className="space-y-3">
                {list.map((n) => (
                  <li key={n.id} className="text-sm">
                    <p className={`font-semibold ${n.isRead ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>{n.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-2">{n.message}</p>
                  </li>
                ))}
              </ul>
            )}
          </QueryState>
        </section>
      </div>

      <NextSteps />
      <Recommended query={recommended} />
    </div>
  );
}

const PROFILE_HINT: Record<string, string> = { 'education type': 'education type', class: 'class', level: 'level', 'exam goals': 'exam goals', 'course of study': 'course of study' };

/** Catalogue courses that match the learner's profile, with the reason for each (GET /recommendations/courses). */
function Recommended({ query }: { query: ReturnType<typeof useApiQuery<CourseRecommendations>> }) {
  const r = query.data;
  return (
    <section className={`${card} p-6 space-y-4`} aria-labelledby="recommended">
      <div className="flex items-center justify-between">
        <h2 id="recommended" className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Compass className="w-4 h-4 text-[var(--color-brand-blue)]" aria-hidden="true" /> Recommended for you
        </h2>
        <Link href="/learn" className="text-xs font-semibold text-[var(--color-brand-blue)] hover:underline">Browse and search</Link>
      </div>
      {query.isLoading ? (
        <LoadingState layout="list" rows={2} label="Finding courses for you…" />
      ) : query.error && !r ? (
        query.error.kind === 'not_implemented' ? <p className="text-xs text-gray-500">Recommendations aren&apos;t available yet.</p> : <ErrorState error={query.error} onRetry={query.retry} compact />
      ) : r ? (
        <>
          {r.items.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {r.catalogueSize === 0 ? 'There are no courses in the catalogue yet.' : 'No catalogue courses match your profile yet.'}
            </p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {r.items.slice(0, 4).map((c) => (
                <li key={c.courseId}>
                  <Link href={`/learn/${encodeURIComponent(c.courseId)}`} className="block p-4 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-[var(--color-brand-blue)] transition-colors space-y-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{c.title}</p>
                    <p className="text-[11px] text-gray-500">{[c.track, c.level].filter(Boolean).join(' · ')}</p>
                    <ul className="text-[11px] text-emerald-700 dark:text-emerald-400 space-y-0.5">
                      {c.reasons.map((reason) => (
                        <li key={reason}>✓ {reason}</li>
                      ))}
                    </ul>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {r.uncoveredExamGoals.length > 0 && (
            <p className="text-xs text-gray-600 dark:text-gray-300">
              No catalogue course covers {r.uncoveredExamGoals.join(', ')} yet.{' '}
              <Link href="/my-courses" className="font-semibold text-[var(--color-brand-blue)] underline">Create your own course</Link> to organise your preparation.
            </p>
          )}
          {r.missingProfile.length > 0 && (
            <p className="text-xs text-gray-500">
              Add your {r.missingProfile.map((m) => PROFILE_HINT[m] ?? m).join(', ')} in{' '}
              <Link href="/settings" className="font-semibold text-[var(--color-brand-blue)] underline">Settings</Link> for better recommendations.
            </p>
          )}
        </>
      ) : null}
    </section>
  );
}