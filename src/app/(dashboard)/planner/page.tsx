'use client';

import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Target, 
  Sparkles, 
  Plus, 
  Clock, 
  CheckCircle2, 
  BookOpen, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw, 
  Edit3, 
  Check, 
  ChevronRight,
  Flame,
  Layers,
  CalendarDays,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

type ViewMode = 'planner' | 'create-goal' | 'ai-plan' | 'calendar';

export default function StudyPlanningHub() {
  const [activeView, setActiveView] = useState<ViewMode>('planner');
  const [plannerTab, setPlannerTab] = useState<'today' | 'weekly' | 'monthly' | 'sessions' | 'goals' | 'exams'>('today');
  
  // Calendar state
  const [calendarFilter, setCalendarFilter] = useState<'all' | 'sessions' | 'exams' | 'missed'>('all');

  // Create Goal State
  const [goalName, setGoalName] = useState('');
  const [courseSubject, setCourseSubject] = useState('');
  const [targetScore, setTargetScore] = useState('');
  const [deadline, setDeadline] = useState('');
  const [dailyDuration, setDailyDuration] = useState('2 hours');

  // AI Plan State
  const [aiGoal, setAiGoal] = useState('Master Quantum Mechanics & Advanced Electrodynamics');
  const [aiDuration, setAiDuration] = useState('4 Weeks');
  const [aiDailyTime, setAiDailyTime] = useState('3 Hours / Day');
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleGenerateAIPlan = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveView('ai-plan');
  };

  const handleRegenerate = () => {
    setIsRegenerating(true);
    setTimeout(() => setIsRegenerating(false), 1200);
  };

  return (
    <div className="w-full min-h-screen pb-16 space-y-8 animate-in fade-in duration-300">
      
      {/* Navigation Sub-Header / View Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-[#111827] p-4 sm:px-8 sm:py-5 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200/50">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white">Study Planning & Strategy</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Organize your academic milestones, daily sessions, and AI curricula.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveView('planner')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeView === 'planner'
                ? 'bg-[#7C3AED] text-white shadow-md shadow-purple-500/20'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Planner Dashboard
          </button>
          <button
            onClick={() => setActiveView('calendar')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeView === 'calendar'
                ? 'bg-[#7C3AED] text-white shadow-md shadow-purple-500/20'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            Calendar
          </button>
          <button
            onClick={() => setActiveView('create-goal')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeView === 'create-goal'
                ? 'bg-[#7C3AED] text-white shadow-md shadow-purple-500/20'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Create Goal
          </button>
          <button
            onClick={() => setActiveView('ai-plan')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeView === 'ai-plan'
                ? 'bg-[#7C3AED] text-white shadow-md shadow-purple-500/20'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            AI Study Plan
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 43. PLANNER PAGE                                         */}
      {/* ========================================================= */}
      {activeView === 'planner' && (
        <div className="space-y-6">
          {/* Planner Tab Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 dark:border-gray-800">
            {[
              { id: 'today', label: "Today's Plan", icon: CalendarIcon },
              { id: 'weekly', label: 'Weekly Plan', icon: Layers },
              { id: 'monthly', label: 'Monthly Plan', icon: CalendarDays },
              { id: 'sessions', label: 'Study Sessions', icon: Clock },
              { id: 'goals', label: 'Goals', icon: Target },
              { id: 'exams', label: 'Upcoming Exams', icon: AlertCircle },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = plannerTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setPlannerTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900/50'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Today's Plan View */}
          {plannerTab === 'today' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200">
                        Active Schedule
                      </span>
                      <h2 className="text-lg font-extrabold text-gray-900 dark:text-white mt-2">Today's Focus: Electromagnetism & Calculus</h2>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 font-bold uppercase">Progress</p>
                      <p className="text-sm font-extrabold text-[#10B981]">3 of 5 Tasks Completed</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { title: 'Review Faraday’s Law & Induction Equations', time: '09:00 AM - 10:30 AM', done: true, tag: 'Physics' },
                      { title: 'Solve 10 Vector Calculus Practice Problems', time: '11:00 AM - 12:30 PM', done: true, tag: 'Mathematics' },
                      { title: 'Interactive AI Classroom Quiz on Maxwell’s Equations', time: '02:00 PM - 03:00 PM', done: true, tag: 'AI Session' },
                      { title: 'Flashcard Revision for Solid State Physics', time: '04:00 PM - 05:00 PM', done: false, tag: 'Revision' },
                      { title: 'Draft Research Summary on Quantum Dots', time: '07:00 PM - 08:30 PM', done: false, tag: 'Research' },
                    ].map((task, idx) => (
                      <div 
                        key={idx} 
                        className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                          task.done 
                            ? 'bg-gray-50/60 dark:bg-gray-900/40 border-gray-200 dark:border-gray-800/60 opacity-75' 
                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-xs'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <button className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${
                            task.done 
                              ? 'bg-[#10B981] border-[#10B981] text-white' 
                              : 'border-gray-300 dark:border-gray-700 hover:border-[#7C3AED]'
                          }`}>
                            {task.done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>
                          <div>
                            <h4 className={`text-xs sm:text-sm font-bold ${task.done ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                              {task.title}
                            </h4>
                            <p className="text-[11px] text-gray-400 font-medium mt-0.5">{task.time}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                          {task.tag}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar Widgets */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-[#7C3AED] to-purple-800 text-white p-6 rounded-3xl shadow-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">Streak Guard</span>
                    <Flame className="w-5 h-5 text-amber-300 fill-amber-300" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black">14 Days Streak!</h3>
                    <p className="text-xs text-purple-100 mt-1 leading-relaxed">You're on fire! Complete today's remaining tasks to keep your streak active.</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
                  <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">Quick Actions</h3>
                  <div className="space-y-2">
                    <button 
                      onClick={() => setActiveView('calendar')}
                      className="w-full py-3 px-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 font-bold text-xs hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all flex items-center justify-between"
                    >
                      <span>Open Calendar Master View</span>
                      <CalendarIcon className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setActiveView('create-goal')}
                      className="w-full py-3 px-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900/50 font-bold text-xs hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-all flex items-center justify-between"
                    >
                      <span>Create New Study Goal</span>
                      <Plus className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setActiveView('ai-plan')}
                      className="w-full py-3 px-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 font-bold text-xs hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-all flex items-center justify-between"
                    >
                      <span>Generate AI Study Plan</span>
                      <Sparkles className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Weekly Plan View */}
          {plannerTab === 'weekly' && (
            <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Weekly Roadmap (Sep 21 - Sep 27)</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Overview of major learning milestones scheduled for this week.</p>
                </div>
                <span className="text-xs font-bold text-[#2563EB] bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-900/50">
                  Week 4 of 12
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                  <div key={day} className={`p-4 rounded-2xl border space-y-3 ${idx === 2 ? 'bg-purple-500/5 border-purple-500/40 dark:border-purple-900/60' : 'bg-gray-50/50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-800'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-gray-900 dark:text-white">{day}</span>
                      <span className="text-[10px] text-gray-400 font-bold">Sep {21 + idx}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80 text-[11px] space-y-1">
                        <p className="font-bold text-gray-800 dark:text-gray-200">Quantum Physics</p>
                        <p className="text-[10px] text-gray-400">2 hrs session</p>
                      </div>
                      {idx % 2 === 0 && (
                        <div className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80 text-[11px] space-y-1">
                          <p className="font-bold text-gray-800 dark:text-gray-200">Calculus IV</p>
                          <p className="text-[10px] text-gray-400">1.5 hrs quiz</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Monthly Plan View */}
          {plannerTab === 'monthly' && (
            <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">September 2026 Academic Calendar</h2>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">3 Exams Scheduled</span>
              </div>
              <div className="p-8 rounded-3xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-center space-y-3">
                <CalendarDays className="w-12 h-12 text-[#7C3AED] mx-auto opacity-80" />
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">Full Month Matrix Synchronized</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  Your monthly milestone pacing is optimized for 22 active study days with adaptive review breaks.
                </p>
              </div>
            </div>
          )}

          {/* Study Sessions View */}
          {plannerTab === 'sessions' && (
            <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-6">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Recorded Study Sessions</h2>
              <div className="space-y-3">
                {[
                  { title: 'Advanced Electromagnetism Lecture & Derivations', date: 'Yesterday, 4:00 PM', duration: '2h 15m', status: 'Completed' },
                  { title: 'Linear Algebra Eigenvalues Practice', date: 'Sep 21, 2026', duration: '1h 45m', status: 'Completed' },
                  { title: 'Thermodynamics Entropy Problem Set', date: 'Sep 20, 2026', duration: '3h 00m', status: 'Completed' },
                ].map((session, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">{session.title}</h4>
                        <p className="text-[11px] text-gray-400">{session.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-[#10B981]">{session.duration}</span>
                      <p className="text-[10px] text-gray-400">{session.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Goals View */}
          {plannerTab === 'goals' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Active Academic Goals</h2>
                <button 
                  onClick={() => setActiveView('create-goal')}
                  className="px-4 py-2.5 rounded-xl bg-[#7C3AED] text-white font-bold text-xs shadow-md hover:bg-purple-700 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Goal</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { goal: 'Distinction in Physics 401', course: 'Physics 401', target: '95%', deadline: 'Oct 30, 2026', duration: '2.5 hrs/day', progress: 78 },
                  { goal: 'Master Multi-variable Calculus', course: 'Mathematics', target: 'Grade A', deadline: 'Nov 15, 2026', duration: '2 hrs/day', progress: 45 },
                ].map((g, idx) => (
                  <div key={idx} className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200">
                        {g.course}
                      </span>
                      <span className="text-xs font-extrabold text-[#10B981]">{g.progress}% Done</span>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-gray-900 dark:text-white">{g.goal}</h3>
                      <p className="text-xs text-gray-400 mt-1">Target: <strong className="text-gray-700 dark:text-gray-300">{g.target}</strong> by {g.deadline}</p>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#7C3AED] h-full rounded-full" style={{ width: `${g.progress}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Exams View */}
          {plannerTab === 'exams' && (
            <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-6">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Upcoming Examinations</h2>
              <div className="space-y-4">
                {[
                  { exam: 'Advanced Electromagnetism Mid-Term', date: 'October 14, 2026', time: '10:00 AM WAT', venue: 'Hall B / Online Proctor', countdown: '21 Days Left' },
                  { exam: 'Quantum Mechanics Final Assessment', date: 'November 02, 2026', time: '02:00 PM WAT', venue: 'Auditorium 3', countdown: '40 Days Left' },
                ].map((ex, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200/50">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">{ex.exam}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{ex.date} at {ex.time} • {ex.venue}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-200/60 whitespace-nowrap">
                      {ex.countdown}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 46. CALENDAR PAGE                                        */}
      {/* ========================================================= */}
      {activeView === 'calendar' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-[#2563EB] border border-blue-200">
                  Master Schedule Matrix
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-2">September 2026 Calendar</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Tracking sessions, streaks, tests, exams, goals, and completed activities.</p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: 'all', label: 'All Items' },
                  { id: 'sessions', label: 'Study Sessions' },
                  { id: 'exams', label: 'Tests & Exams' },
                  { id: 'missed', label: 'Missed Sessions' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setCalendarFilter(f.id as any)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      calendarFilter === f.id
                        ? 'bg-[#2563EB] text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar Grid Representation */}
            <div className="grid grid-cols-7 gap-2 sm:gap-3 text-center pt-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-xs font-bold text-gray-400 py-2">{d}</div>
              ))}
              
              {/* Sample days of September 2026 */}
              {Array.from({ length: 30 }).map((_, index) => {
                const dayNum = index + 1;
                const isToday = dayNum === 23;
                const hasExam = dayNum === 14 || dayNum === 28;
                const hasSession = dayNum % 2 === 0 || isToday;
                const isMissed = dayNum === 19;
                const isGoalMilestone = dayNum === 10 || dayNum === 25;

                return (
                  <div
                    key={dayNum}
                    className={`min-h-[85px] sm:min-h-[100px] p-2 sm:p-3 rounded-2xl border flex flex-col justify-between transition-all ${
                      isToday 
                        ? 'bg-purple-500/10 border-purple-500 dark:border-purple-600 shadow-sm ring-2 ring-purple-500/30' 
                        : isMissed 
                        ? 'bg-rose-500/5 border-rose-200 dark:border-rose-900/50' 
                        : 'bg-gray-50/60 dark:bg-gray-900/40 border-gray-200 dark:border-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-extrabold ${isToday ? 'text-purple-600 dark:text-purple-400' : 'text-gray-800 dark:text-gray-200'}`}>
                        {dayNum}
                      </span>
                      {isToday && <span className="text-[9px] font-bold bg-[#7C3AED] text-white px-1.5 py-0.5 rounded">Today</span>}
                    </div>

                    <div className="space-y-1 text-left overflow-hidden">
                      {hasSession && (calendarFilter === 'all' || calendarFilter === 'sessions') && (
                        <div className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 truncate">
                          ✓ Session 2h
                        </div>
                      )}
                      {hasExam && (calendarFilter === 'all' || calendarFilter === 'exams') && (
                        <div className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 truncate">
                          ★ Exam / Test
                        </div>
                      )}
                      {isGoalMilestone && calendarFilter === 'all' && (
                        <div className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 truncate">
                          🎯 Goal Check
                        </div>
                      )}
                      {isMissed && (calendarFilter === 'all' || calendarFilter === 'missed') && (
                        <div className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 truncate">
                          ⚠ Missed
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Missed Sessions Recovery Panel */}
          <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">Missed Sessions & Recovery Queue</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Reschedule or auto-catch up on sessions you missed due to schedule conflicts.</p>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-200">
                1 Pending Recovery
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">Thermodynamics Entropy Problem Set (Sep 19)</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Duration: 2 hours • Course: Physics 401</p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all">
                  Reschedule Today
                </button>
                <button className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-300 dark:hover:bg-gray-700 transition-all">
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 44. CREATE GOAL PAGE                                     */}
      {/* ========================================================= */}
      {activeView === 'create-goal' && (
        <div className="max-w-3xl mx-auto bg-white dark:bg-[#111827] p-6 sm:p-10 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-lg space-y-8">
          <div className="border-b border-gray-200 dark:border-gray-800 pb-5">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200">
              Goal Setup Wizard
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-2">Create New Study Goal</h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Define your target objective and let gleamLearn structure your daily curriculum.
            </p>
          </div>

          <form onSubmit={handleGenerateAIPlan} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Goal Title / Objective</label>
              <input
                type="text"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                placeholder="e.g., Master Quantum Mechanics & Electrodynamics"
                required
                className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Course / Subject</label>
                <input
                  type="text"
                  value={courseSubject}
                  onChange={(e) => setCourseSubject(e.target.value)}
                  placeholder="e.g., Physics 401"
                  required
                  className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Target Score / Outcome</label>
                <input
                  type="text"
                  value={targetScore}
                  onChange={(e) => setTargetScore(e.target.value)}
                  placeholder="e.g., 90% or Grade A"
                  required
                  className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Deadline Date</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                  className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Daily Study Duration</label>
                <select
                  value={dailyDuration}
                  onChange={(e) => setDailyDuration(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                >
                  <option value="1 hour">1 Hour / Day</option>
                  <option value="2 hours">2 Hours / Day</option>
                  <option value="3 hours">3 Hours / Day</option>
                  <option value="4+ hours">4+ Hours / Day (Intensive)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveView('planner')}
                className="px-6 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-[#7C3AED] text-white font-bold text-xs shadow-md hover:bg-purple-700 transition-all flex items-center gap-2"
              >
                <span>Generate AI Study Plan</span>
                <Sparkles className="w-4 h-4 text-amber-300" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* 45. AI STUDY PLAN PAGE                                   */}
      {/* ========================================================= */}
      {activeView === 'ai-plan' && (
        <div className="space-y-8">
          <div className="bg-gradient-to-r from-purple-950/60 via-[#111827] to-[#111827] p-6 sm:p-8 rounded-3xl border border-purple-900/40 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-700/50 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  AI Generated Curriculum
                </span>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-700/50">
                  Optimized for Success
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">{aiGoal}</h2>
              <p className="text-xs sm:text-sm text-gray-300">
                Duration: <strong className="text-white">{aiDuration}</strong> • Daily Commitment: <strong className="text-white">{aiDailyTime}</strong>
              </p>
            </div>

            {/* Actions: Accept plan, Edit, Regenerate */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-200 hover:bg-gray-700 font-bold text-xs border border-gray-700 transition-all flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                <span>Regenerate</span>
              </button>
              <button
                onClick={() => setActiveView('create-goal')}
                className="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-200 hover:bg-gray-700 font-bold text-xs border border-gray-700 transition-all flex items-center gap-2"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Parameters</span>
              </button>
              <button
                onClick={() => setActiveView('planner')}
                className="px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Accept Plan</span>
              </button>
            </div>
          </div>

          {/* AI-Generated Schedule Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { week: 'Week 1', title: 'Foundations & Wave Functions', topics: ['Schrödinger Equation Basics', 'Probability Densities', 'Operator Formalism'], status: 'Ready' },
              { week: 'Week 2', title: 'Potentials & Boundary Conditions', topics: ['Infinite Square Well', 'Harmonic Oscillator', 'Tunneling Effect'], status: 'Upcoming' },
              { week: 'Week 3', title: 'Electrodynamics & Maxwell Laws', topics: ['Displacement Current', 'Poynting Vector', 'Electromagnetic Waves'], status: 'Upcoming' },
              { week: 'Week 4', title: 'Advanced Synthesis & Mock Exams', topics: ['Full Curriculum Review', 'Timed Practice Exams', 'AI Remedial Coaching'], status: 'Upcoming' },
            ].map((wk, idx) => (
              <div key={idx} className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200">
                      {wk.week}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">{wk.status}</span>
                  </div>
                  <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">{wk.title}</h3>
                  <ul className="space-y-2 pt-1">
                    {wk.topics.map((top, tIdx) => (
                      <li key={tIdx} className="text-xs text-gray-600 dark:text-gray-300 flex items-start gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-[#7C3AED] shrink-0 mt-0.5" />
                        <span>{top}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] font-bold text-purple-600 dark:text-purple-400">
                  <span>5 Sessions</span>
                  <span>15 Hours Total</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}