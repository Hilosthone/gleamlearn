// 'use client';

// import React from 'react';
// import Link from 'next/link';
// import { 
//   BookOpen, 
//   Sparkles, 
//   Clock, 
//   Award, 
//   Flame, 
//   ArrowRight, 
//   CheckCircle2, 
//   PlayCircle, 
//   Calendar, 
//   Target,
//   Zap,
//   Coins,
//   AlertCircle
// } from 'lucide-react';

// export default function DashboardPage() {
//   return (
//     <div className="space-y-8 animate-in fade-in duration-300">
      
//       {/* 1. Header / Greeting Banner */}
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
//         {/* Decorative background glow */}
//         <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
//         <div className="space-y-2 z-10">
//           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-blue-100">
//             <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
//             <span>Semester Goal: 85% Distinction Track</span>
//           </div>
//           <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
//             Good morning, Hilosthone! 🚀
//           </h1>
//           <p className="text-sm text-blue-100 max-w-xl">
//             You are on a <span className="font-bold text-amber-300">5-day streak</span>! Complete 2 more tasks today to boost your daily XP multiplier.
//           </p>
//         </div>

//         <div className="flex items-center gap-3 z-10">
//           <Link
//             href="/learn"
//             className="px-5 py-3 rounded-2xl bg-white text-blue-900 font-bold text-sm hover:bg-blue-50 transition-all shadow-md flex items-center gap-2 group"
//           >
//             <span>Resume Studying</span>
//             <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
//           </Link>
//         </div>
//       </div>

//       {/* 2. Learning Summary / Quick Stats Grid */}
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//         {/* Daily Goal Card */}
//         <div className="bg-white dark:bg-[#111827] p-5 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-3">
//           <div className="flex items-center justify-between">
//             <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Today's Goal</span>
//             <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[var(--color-brand-blue)] flex items-center justify-center">
//               <Target className="w-4 h-4" />
//             </div>
//           </div>
//           <div>
//             <div className="flex items-baseline justify-between text-sm font-bold text-gray-900 dark:text-white mb-1">
//               <span>45 mins</span>
//               <span className="text-xs text-gray-400">/ 60 mins</span>
//             </div>
//             <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
//               <div className="w-3/4 h-full bg-[var(--color-brand-blue)] rounded-full" />
//             </div>
//           </div>
//         </div>

//         {/* Total XP Card */}
//         <div className="bg-white dark:bg-[#111827] p-5 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-3">
//           <div className="flex items-center justify-between">
//             <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Earned XP</span>
//             <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
//               <Zap className="w-4 h-4 fill-blue-500 text-blue-500" />
//             </div>
//           </div>
//           <div>
//             <p className="text-2xl font-black text-gray-900 dark:text-white">1,240 <span className="text-xs font-semibold text-blue-600">XP</span></p>
//             <p className="text-[11px] text-gray-400 mt-0.5">Level 4 Scholar</p>
//           </div>
//         </div>

//         {/* Coins Card */}
//         <div className="bg-white dark:bg-[#111827] p-5 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-3">
//           <div className="flex items-center justify-between">
//             <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">gleamCoins</span>
//             <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
//               <Coins className="w-4 h-4 fill-amber-500" />
//             </div>
//           </div>
//           <div>
//             <p className="text-2xl font-black text-gray-900 dark:text-white">350</p>
//             <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">Redeemable in store</p>
//           </div>
//         </div>

//         {/* Streak Card */}
//         <div className="bg-white dark:bg-[#111827] p-5 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-3">
//           <div className="flex items-center justify-between">
//             <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Active Streak</span>
//             <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-500 flex items-center justify-center">
//               <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
//             </div>
//           </div>
//           <div>
//             <p className="text-2xl font-black text-gray-900 dark:text-white">5 <span className="text-xs font-semibold text-orange-500">Days 🔥</span></p>
//             <p className="text-[11px] text-gray-400 mt-0.5">Personal best: 14 days</p>
//           </div>
//         </div>
//       </div>

//       {/* Main Dashboard Two-Column Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
//         {/* Left Column (2 Spans): Continue Learning & Today's Plan */}
//         <div className="lg:col-span-2 space-y-8">
          
//           {/* Continue Learning Card */}
//           <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
//             <div className="flex items-center justify-between">
//               <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
//                 <BookOpen className="w-5 h-5 text-[var(--color-brand-blue)]" />
//                 <span>Continue Learning</span>
//               </h2>
//               <Link href="/learn" className="text-xs font-bold text-[var(--color-brand-blue)] hover:underline">
//                 View all courses →
//               </Link>
//             </div>

//             <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/60 to-indigo-50/40 dark:from-blue-950/20 dark:to-indigo-950/10 border border-blue-100 dark:border-blue-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//               <div className="space-y-2">
//                 <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
//                   CSC 201 • Data Structures
//                 </span>
//                 <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
//                   Module 3: Advanced Tree Traversals & Recursion
//                 </h3>
//                 <div className="flex items-center gap-3">
//                   <div className="w-36 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
//                     <div className="w-[72%] h-full bg-[var(--color-brand-blue)] rounded-full" />
//                   </div>
//                   <span className="text-xs font-bold text-gray-600 dark:text-gray-400">72% Completed</span>
//                 </div>
//               </div>

//               <Link
//                 href="/learn/csc-201"
//                 className="px-5 py-3 rounded-xl bg-[var(--color-brand-blue)] text-white font-bold text-sm shadow-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shrink-0"
//               >
//                 <PlayCircle className="w-4 h-4" />
//                 <span>Continue</span>
//               </Link>
//             </div>
//           </div>

//           {/* AI Recommendation Banner */}
//           <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-200/60 dark:border-amber-900/40 flex items-start gap-4">
//             <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
//               <Sparkles className="w-5 h-5 fill-white" />
//             </div>
//             <div className="space-y-1">
//               <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
//                 <span>AI Study Recommendation</span>
//                 <span className="text-[10px] bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded-md">Smart Tip</span>
//               </h4>
//               <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
//                 “You struggled with recursion yesterday during your practice quiz. Let’s revise it for 15 minutes with an interactive AI explanation before your upcoming exam.”
//               </p>
//               <div className="pt-2">
//                 <Link href="/ai" className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1">
//                   <span>Start recommended 15-min revision</span>
//                   <ArrowRight className="w-3 h-3" />
//                 </Link>
//               </div>
//             </div>
//           </div>

//           {/* Today's Plan Checklist */}
//           <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
//             <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
//               <Calendar className="w-5 h-5 text-[var(--color-brand-blue)]" />
//               <span>Today’s Plan & Schedule</span>
//             </h2>

//             <div className="space-y-2.5">
//               <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
//                 <div className="flex items-center gap-3">
//                   <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/10" />
//                   <div>
//                     <h4 className="text-sm font-bold text-gray-900 dark:text-white line-through opacity-75">Study Session: CSC 201 Trees</h4>
//                     <p className="text-[11px] text-gray-400">Completed at 9:00 AM • 30 mins</p>
//                   </div>
//                 </div>
//                 <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">Done</span>
//               </div>

//               <div className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/30">
//                 <div className="flex items-center gap-3">
//                   <div className="w-5 h-5 rounded-full border-2 border-[var(--color-brand-blue)] flex items-center justify-center" />
//                   <div>
//                     <h4 className="text-sm font-bold text-gray-900 dark:text-white">Quick Quiz: MTH 202 Linear Algebra</h4>
//                     <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">Scheduled for 4:00 PM • 15 questions</p>
//                   </div>
//                 </div>
//                 <Link href="/practice" className="text-xs font-bold bg-[var(--color-brand-blue)] text-white px-3 py-1.5 rounded-xl shadow-xs">
//                   Start Quiz
//                 </Link>
//               </div>

//               <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
//                 <div className="flex items-center gap-3">
//                   <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
//                   <div>
//                     <h4 className="text-sm font-bold text-gray-900 dark:text-white">Revision: Physics Past Questions</h4>
//                     <p className="text-[11px] text-gray-400">Pending • 20 mins</p>
//                   </div>
//                 </div>
//                 <Link href="/exams" className="text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-[var(--color-brand-blue)]">
//                   Begin →
//                 </Link>
//               </div>
//             </div>
//           </div>

//         </div>

//         {/* Right Column (1 Span): Upcoming Exam, Daily Challenge & Calendar Preview */}
//         <div className="space-y-6">
          
//           {/* Upcoming Exam Countdown Card */}
//           <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
//             <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Upcoming Exam</h3>
            
//             <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-500/5 border border-red-200/50 dark:border-red-900/30 space-y-3">
//               <div className="flex items-center justify-between">
//                 <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-100 dark:bg-red-950/50 text-red-600">
//                   Major Exam
//                 </span>
//                 <span className="text-xs font-extrabold text-red-600">⏳ 4 Days Left</span>
//               </div>
              
//               <div>
//                 <h4 className="text-base font-extrabold text-gray-900 dark:text-white">MTH 202 Final Midterm</h4>
//                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Calculus & Matrices</p>
//               </div>

//               <div className="space-y-1.5 pt-2 border-t border-red-100 dark:border-red-900/20">
//                 <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
//                   <span>Readiness Score</span>
//                   <span className="text-emerald-600 font-extrabold">78% Ready</span>
//                 </div>
//                 <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
//                   <div className="w-[78%] h-full bg-emerald-500 rounded-full" />
//                 </div>
//               </div>

//               <Link
//                 href="/exams"
//                 className="block text-center text-xs font-bold bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
//               >
//                 Launch Exam Simulation
//               </Link>
//             </div>
//           </div>

//           {/* Daily Challenge Card */}
//           <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
//             <div className="flex items-center justify-between">
//               <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Daily Challenge</h3>
//               <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/50 text-amber-600">
//                 Active
//               </span>
//             </div>

//             <div className="space-y-3">
//               <p className="text-sm font-bold text-gray-900 dark:text-white">
//                 Answer 10 algorithm questions correctly without hint.
//               </p>

//               <div className="flex items-center gap-3 pt-1">
//                 <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[var(--color-brand-blue)] text-xs font-bold">
//                   <Zap className="w-3.5 h-3.5 fill-blue-500 text-blue-500" />
//                   <span>+150 XP</span>
//                 </div>
//                 <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 text-xs font-bold">
//                   <Coins className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
//                   <span>+50 Coins</span>
//                 </div>
//               </div>

//               <Link
//                 href="/practice"
//                 className="block w-full text-center text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-[var(--color-brand-blue)] dark:text-blue-400 py-2.5 rounded-xl hover:bg-blue-100 transition-colors"
//               >
//                 Accept Challenge
//               </Link>
//             </div>
//           </div>

//           {/* Mini Calendar Preview */}
//           <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-3">
//             <div className="flex items-center justify-between">
//               <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Schedule Preview</h3>
//               <Link href="/planner" className="text-xs font-bold text-[var(--color-brand-blue)] hover:underline">
//                 Full Calendar →
//               </Link>
//             </div>
            
//             <div className="grid grid-cols-7 gap-1 text-center py-2">
//               {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
//                 <span key={idx} className="text-[11px] font-bold text-gray-400">{day}</span>
//               ))}
//               {[21, 22, 23, 24, 25, 26, 27].map((date, idx) => (
//                 <div 
//                   key={idx} 
//                   className={`h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
//                     date === 22 
//                       ? 'bg-[var(--color-brand-blue)] text-white shadow-sm' 
//                       : date < 22 
//                       ? 'text-gray-400 bg-gray-50 dark:bg-gray-800/40' 
//                       : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
//                   }`}
//                 >
//                   {date}
//                 </div>
//               ))}
//             </div>
//             <p className="text-[11px] text-center text-gray-400">Today: Tuesday, Sept 22 • 3 Study sessions planned</p>
//           </div>

//         </div>

//       </div>

//     </div>
//   );
// }



'use client';

import React from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Sparkles, 
  Award, 
  Flame, 
  ArrowRight, 
  CheckCircle2, 
  PlayCircle, 
  Calendar, 
  Target,
  Zap,
  Coins,
  Rocket
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Header / Greeting Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-blue-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>Semester Goal: 85% Distinction Track</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Good morning, Hilosthone!
            </h1>
            <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Rocket className="w-4 h-4 text-amber-300" />
            </div>
          </div>
          <p className="text-sm text-blue-100 max-w-xl">
            You are on a <span className="font-bold text-amber-300 inline-flex items-center gap-1"><Flame className="w-3.5 h-3.5 fill-amber-300 inline" /> 5-day streak</span>! Complete 2 more tasks today to boost your daily XP multiplier.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <Link
            href="/learn"
            className="px-5 py-3 rounded-2xl bg-white text-blue-900 font-bold text-sm hover:bg-blue-50 transition-all shadow-md flex items-center gap-2 group"
          >
            <span>Resume Studying</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* 2. Learning Summary / Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Daily Goal Card */}
        <div className="bg-white dark:bg-[#111827] p-5 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Today&apos;s Goal</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[var(--color-brand-blue)] flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between text-sm font-bold text-gray-900 dark:text-white mb-1">
              <span>45 mins</span>
              <span className="text-xs text-gray-400">/ 60 mins</span>
            </div>
            <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="w-3/4 h-full bg-[var(--color-brand-blue)] rounded-full" />
            </div>
          </div>
        </div>

        {/* Total XP Card */}
        <div className="bg-white dark:bg-[#111827] p-5 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Earned XP</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
              <Zap className="w-4 h-4 fill-blue-500 text-blue-500" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900 dark:text-white">1,240 <span className="text-xs font-semibold text-blue-600">XP</span></p>
            <p className="text-[11px] text-gray-400 mt-0.5">Level 4 Scholar</p>
          </div>
        </div>

        {/* Coins Card */}
        <div className="bg-white dark:bg-[#111827] p-5 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">gleamCoins</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
              <Coins className="w-4 h-4 fill-amber-500" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900 dark:text-white">350</p>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">Redeemable in store</p>
          </div>
        </div>

        {/* Streak Card */}
        <div className="bg-white dark:bg-[#111827] p-5 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Active Streak</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-500 flex items-center justify-center">
              <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-1.5">
              <span>5</span>
              <span className="text-xs font-semibold text-orange-500 uppercase tracking-wide">Days</span>
              <Flame className="w-4 h-4 fill-orange-500 text-orange-500 inline" />
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">Personal best: 14 days</p>
          </div>
        </div>
      </div>

      {/* Main Dashboard Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Spans): Continue Learning & Today's Plan */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Continue Learning Card */}
          <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[var(--color-brand-blue)]" />
                <span>Continue Learning</span>
              </h2>
              <Link href="/learn" className="text-xs font-bold text-[var(--color-brand-blue)] hover:underline flex items-center gap-1">
                <span>View all courses</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/60 to-indigo-50/40 dark:from-blue-950/20 dark:to-indigo-950/10 border border-blue-100 dark:border-blue-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                  CSC 201 • Data Structures
                </span>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                  Module 3: Advanced Tree Traversals & Recursion
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-36 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="w-[72%] h-full bg-[var(--color-brand-blue)] rounded-full" />
                  </div>
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-400">72% Completed</span>
                </div>
              </div>

              <Link
                href="/learn/csc-201"
                className="px-5 py-3 rounded-xl bg-[var(--color-brand-blue)] text-white font-bold text-sm shadow-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shrink-0"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Continue</span>
              </Link>
            </div>
          </div>

          {/* AI Recommendation Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-200/60 dark:border-amber-900/40 flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <Sparkles className="w-5 h-5 fill-white" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>AI Study Recommendation</span>
                <span className="text-[10px] bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded-md">Smart Tip</span>
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                &ldquo;You struggled with recursion yesterday during your practice quiz. Let&apos;s revise it for 15 minutes with an interactive AI explanation before your upcoming exam.&rdquo;
              </p>
              <div className="pt-2">
                <Link href="/ai" className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1">
                  <span>Start recommended 15-min revision</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Today's Plan Checklist */}
          <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[var(--color-brand-blue)]" />
              <span>Today&apos;s Plan & Schedule</span>
            </h2>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/10" />
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white line-through opacity-75">Study Session: CSC 201 Trees</h4>
                    <p className="text-[11px] text-gray-400">Completed at 9:00 AM • 30 mins</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">Done</span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/30">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-[var(--color-brand-blue)] flex items-center justify-center" />
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Quick Quiz: MTH 202 Linear Algebra</h4>
                    <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">Scheduled for 4:00 PM • 15 questions</p>
                  </div>
                </div>
                <Link href="/practice" className="text-xs font-bold bg-[var(--color-brand-blue)] text-white px-3 py-1.5 rounded-xl shadow-xs">
                  Start Quiz
                </Link>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Revision: Physics Past Questions</h4>
                    <p className="text-[11px] text-gray-400">Pending • 20 mins</p>
                  </div>
                </div>
                <Link href="/exams" className="text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-[var(--color-brand-blue)] flex items-center gap-1">
                  <span>Begin</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (1 Span): Upcoming Exam, Daily Challenge & Calendar Preview */}
        <div className="space-y-6">
          
          {/* Upcoming Exam Countdown Card */}
          <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Upcoming Exam</h3>
            
            <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-500/5 border border-red-200/50 dark:border-red-900/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-100 dark:bg-red-950/50 text-red-600">
                  Major Exam
                </span>
                <span className="text-xs font-extrabold text-red-600 flex items-center gap-1">
                  <ClockIcon className="w-3.5 h-3.5" />
                  <span>4 Days Left</span>
                </span>
              </div>
              
              <div>
                <h4 className="text-base font-extrabold text-gray-900 dark:text-white">MTH 202 Final Midterm</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Calculus & Matrices</p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-red-100 dark:border-red-900/20">
                <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                  <span>Readiness Score</span>
                  <span className="text-emerald-600 font-extrabold">78% Ready</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="w-[78%] h-full bg-emerald-500 rounded-full" />
                </div>
              </div>

              <Link
                href="/exams"
                className="block text-center text-xs font-bold bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
              >
                Launch Exam Simulation
              </Link>
            </div>
          </div>

          {/* Daily Challenge Card */}
          <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Daily Challenge</h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/50 text-amber-600">
                Active
              </span>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                Answer 10 algorithm questions correctly without hint.
              </p>

              <div className="flex items-center gap-3 pt-1">
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[var(--color-brand-blue)] text-xs font-bold">
                  <Zap className="w-3.5 h-3.5 fill-blue-500 text-blue-500" />
                  <span>+150 XP</span>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 text-xs font-bold">
                  <Coins className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>+50 Coins</span>
                </div>
              </div>

              <Link
                href="/practice"
                className="block w-full text-center text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-[var(--color-brand-blue)] dark:text-blue-400 py-2.5 rounded-xl hover:bg-blue-100 transition-colors"
              >
                Accept Challenge
              </Link>
            </div>
          </div>

          {/* Mini Calendar Preview */}
          <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Schedule Preview</h3>
              <Link href="/planner" className="text-xs font-bold text-[var(--color-brand-blue)] hover:underline flex items-center gap-1">
                <span>Full Calendar</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center py-2">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                <span key={idx} className="text-[11px] font-bold text-gray-400">{day}</span>
              ))}
              {[21, 22, 23, 24, 25, 26, 27].map((date, idx) => (
                <div 
                  key={idx} 
                  className={`h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                    date === 22 
                      ? 'bg-[var(--color-brand-blue)] text-white shadow-sm' 
                      : date < 22 
                      ? 'text-gray-400 bg-gray-50 dark:bg-gray-800/40' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {date}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-center text-gray-400">Today: Tuesday, Sept 22 • 3 Study sessions planned</p>
          </div>

        </div>

      </div>

    </div>
  );
}

// Helper icon wrapper component for local file usage
function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}