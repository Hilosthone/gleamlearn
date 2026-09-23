'use client';

import React, { useState } from 'react';
import { 
  Trophy, 
  Flame, 
  Coins, 
  Award, 
  TrendingUp, 
  BarChart3, 
  Zap, 
  Star, 
  Globe, 
  GraduationCap, 
  Building2, 
  Users, 
  BookOpen, 
  CheckCircle2, 
  Lock, 
  Clock, 
  ArrowUpRight, 
  ShieldCheck,
  CalendarDays,
  Sparkles
} from 'lucide-react';

type GamificationView = 'dashboard' | 'xp' | 'coins' | 'achievements' | 'streak' | 'leaderboard';

export default function ProgressGamificationHub() {
  const [activeView, setActiveView] = useState<GamificationView>('dashboard');
  
  // Leaderboard state
  const [leaderboardTab, setLeaderboardTab] = useState<'global' | 'school' | 'university' | 'department' | 'course' | 'friends'>('global');
  const [leaderboardFilter, setLeaderboardFilter] = useState<'daily' | 'weekly' | 'monthly' | 'all-time'>('weekly');

  return (
    <div className="w-full min-h-screen pb-16 space-y-8 animate-in fade-in duration-300">
      
      {/* Navigation Sub-Header / View Switcher */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 bg-white dark:bg-[#111827] p-4 sm:px-8 sm:py-5 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-[#F97316] border border-amber-200/50">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white">Progress & Gamification Hub</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Track mastery metrics, XP levels, rewards, streaks, and global rankings.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full xl:w-auto overflow-x-auto pb-1 xl:pb-0">
          {[
            { id: 'dashboard', label: 'Progress Dashboard', icon: TrendingUp },
            { id: 'xp', label: 'XP & Level', icon: Zap },
            { id: 'coins', label: 'Coins', icon: Coins },
            { id: 'achievements', label: 'Achievements', icon: Award },
            { id: 'streak', label: 'Streak', icon: Flame },
            { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
          ].map((v) => {
            const Icon = v.icon;
            const isActive = activeView === v.id;
            return (
              <button
                key={v.id}
                onClick={() => setActiveView(v.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#7C3AED] text-white shadow-md shadow-purple-500/20'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{v.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 47. PROGRESS DASHBOARD PAGE                                */}
      {/* ========================================================= */}
      {activeView === 'dashboard' && (
        <div className="space-y-8">
          {/* Top Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Overall Mastery</span>
              <h3 className="text-2xl sm:text-3xl font-black text-[#10B981]">88.4%</h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> +4.2% from last week
              </p>
            </div>
            <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Total Study Time</span>
              <h3 className="text-2xl sm:text-3xl font-black text-[#2563EB]">142.5 hrs</h3>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-bold">18 hrs this week</p>
            </div>
            <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Quiz & Test Average</span>
              <h3 className="text-2xl sm:text-3xl font-black text-[#7C3AED]">94.1%</h3>
              <p className="text-xs text-purple-600 dark:text-purple-400 font-bold">24 Tests Completed</p>
            </div>
            <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Exam Readiness</span>
              <h3 className="text-2xl sm:text-3xl font-black text-[#F97316]">A+ Grade</h3>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-bold">High probability of distinction</p>
            </div>
          </div>

          {/* Performance Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-6">
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Course & Subject Performance</h3>
              <div className="space-y-4">
                {[
                  { name: 'Physics 401 (Electromagnetism)', score: 92, color: 'bg-[#2563EB]' },
                  { name: 'Advanced Calculus IV', score: 85, color: 'bg-[#7C3AED]' },
                  { name: 'Quantum Mechanics', score: 90, color: 'bg-[#10B981]' },
                  { name: 'Linear Algebra & Matrices', score: 78, color: 'bg-[#F97316]' },
                ].map((c, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-800 dark:text-gray-200">
                      <span>{c.name}</span>
                      <span>{c.score}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
                      <div className={`${c.color} h-full rounded-full`} style={{ width: `${c.score}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-6">
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Weak vs Strong Topics</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                  <span className="text-[10px] font-bold text-[#10B981] uppercase">Strong Topics</span>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">Faraday's Law, Vector Fields, Schrödinger Equation Basics</p>
                </div>
                <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-2">
                  <span className="text-[10px] font-bold text-[#EF4444] uppercase">Topics Needing Practice</span>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">Tensor Transformations, Eigenvalue Multiplicities, Tunneling Probability</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 48. XP & LEVEL PAGE                                      */}
      {/* ========================================================= */}
      {activeView === 'xp' && (
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="bg-gradient-to-r from-purple-950 via-[#111827] to-[#111827] p-8 rounded-3xl border border-purple-900/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center md:text-left">
              <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-700/50">
                Academic Rank
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Level 42 Scholar</h2>
              <p className="text-xs text-purple-200">14,250 XP earned • 750 XP required for Level 43</p>
            </div>
            <div className="w-full md:w-64 space-y-2">
              <div className="flex justify-between text-xs font-bold text-purple-200">
                <span>Progress to Level 43</span>
                <span>95%</span>
              </div>
              <div className="w-full bg-purple-950/80 h-3 rounded-full overflow-hidden border border-purple-800">
                <div className="bg-gradient-to-r from-purple-500 to-amber-400 h-full rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-6">
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white">XP History & Recent Rewards</h3>
            <div className="space-y-3">
              {[
                { action: 'Completed AI Classroom Quiz on Electromagnetism', xp: '+250 XP', time: '2 hours ago', tag: 'Quiz' },
                { action: 'Maintained 14-Day Study Streak', xp: '+500 XP', time: 'Today', tag: 'Streak' },
                { action: 'Solved 10 Vector Calculus Practice Problems', xp: '+180 XP', time: 'Yesterday', tag: 'Practice' },
                { action: 'Mastered Physics 401 Module 2', xp: '+400 XP', time: '2 days ago', tag: 'Mastery' },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">{item.action}</h4>
                      <p className="text-[11px] text-gray-400">{item.time}</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-[#10B981] bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200/50 whitespace-nowrap">
                    {item.xp}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 49. COINS PAGE                                           */}
      {/* ========================================================= */}
      {activeView === 'coins' && (
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="bg-gradient-to-r from-amber-950 via-[#111827] to-[#111827] p-8 rounded-3xl border border-amber-900/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-700/50">
                Wallet Balance
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-amber-400 flex items-center justify-center md:justify-start gap-2">
                <Coins className="w-8 h-8" /> 2,840 Coins
              </h2>
              <p className="text-xs text-amber-200">Redeem coins for premium templates, AI tutor sessions, or scholarship grants.</p>
            </div>
            <button className="px-6 py-3 rounded-2xl bg-[#F97316] text-white font-bold text-xs shadow-lg hover:bg-orange-600 transition-all">
              Spend Coins / Rewards Store
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Ways to Earn Coins</h3>
              <ul className="space-y-3 text-xs text-gray-600 dark:text-gray-300">
                <li className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                  <span>Complete daily study sessions</span>
                  <strong className="text-amber-500">+50 Coins</strong>
                </li>
                <li className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                  <span>Score 90%+ on any quiz</span>
                  <strong className="text-amber-500">+100 Coins</strong>
                </li>
                <li className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                  <span>Maintain a 7-day streak</span>
                  <strong className="text-amber-500">+300 Coins</strong>
                </li>
              </ul>
            </div>

            <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Coin Transaction History</h3>
              <div className="space-y-3">
                {[
                  { desc: 'Daily Login Reward', amount: '+50', time: 'Today' },
                  { desc: 'Quiz Excellence Bonus', amount: '+100', time: 'Yesterday' },
                  { desc: 'Unlocked Theme Skin', amount: '-500', time: '3 days ago' },
                ].map((tx, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{tx.desc}</p>
                      <p className="text-[10px] text-gray-400">{tx.time}</p>
                    </div>
                    <span className={`font-black ${tx.amount.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>{tx.amount} Coins</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 50. ACHIEVEMENTS PAGE                                    */}
      {/* ========================================================= */}
      {activeView === 'achievements' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Achievements & Badges</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Unlock prestigious badges by hitting academic and consistency milestones.</p>
            </div>
            <span className="text-xs font-bold text-[#7C3AED] bg-purple-50 dark:bg-purple-950/40 px-3 py-1.5 rounded-xl border border-purple-200">
              18 / 25 Unlocked
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Quantum Master', desc: 'Score 95%+ in Quantum Mechanics module tests', unlocked: true, progress: 100 },
              { title: 'Streak Titan', desc: 'Maintain an unbroken 30-day study streak', unlocked: true, progress: 100 },
              { title: 'Calculus Wizard', desc: 'Solve 100 advanced calculus problems', unlocked: false, progress: 78 },
              { title: 'Night Owl Scholar', desc: 'Complete 20 late-night study sessions after 10 PM', unlocked: true, progress: 100 },
              { title: 'AI Curriculum Pioneer', desc: 'Generate and complete 5 custom AI study plans', unlocked: false, progress: 60 },
              { title: 'Global Elite', desc: 'Reach the Top 10 on the Global Leaderboard', unlocked: false, progress: 40 },
            ].map((ach, idx) => (
              <div key={idx} className={`p-6 rounded-3xl border space-y-4 ${ach.unlocked ? 'bg-white dark:bg-[#111827] border-purple-500/30 shadow-xs' : 'bg-gray-50/50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800 opacity-80'}`}>
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${ach.unlocked ? 'bg-[#7C3AED] text-white shadow-md shadow-purple-500/30' : 'bg-gray-200 dark:bg-gray-800 text-gray-400'}`}>
                    {ach.unlocked ? <Award className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${ach.unlocked ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'}`}>
                    {ach.unlocked ? 'Unlocked' : `${ach.progress}% Progress`}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">{ach.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{ach.desc}</p>
                </div>
                {!ach.unlocked && (
                  <div className="w-full bg-gray-200 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#7C3AED] h-full rounded-full" style={{ width: `${ach.progress}%` }}></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 51. STREAK PAGE                                          */}
      {/* ========================================================= */}
      {activeView === 'streak' && (
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="bg-gradient-to-br from-[#7C3AED] to-purple-900 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">Streak Shield Active</span>
              <h2 className="text-3xl sm:text-4xl font-black flex items-center justify-center md:justify-start gap-2">
                <Flame className="w-8 h-8 text-amber-300 fill-amber-300" /> 14 Days Streak
              </h2>
              <p className="text-xs text-purple-100">Personal Longest Streak: <strong className="text-white">28 Days</strong></p>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
              <p className="text-xs font-bold text-amber-300">Next Milestone</p>
              <p className="text-sm font-black mt-0.5">21 Days (+300 Coins)</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-6">
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white">September 2026 Streak Calendar</h3>
            <div className="grid grid-cols-7 gap-2 text-center">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <div key={d} className="text-xs font-bold text-gray-400 py-1">{d}</div>
              ))}
              {Array.from({ length: 30 }).map((_, i) => {
                const day = i + 1;
                const active = day <= 23 && day !== 19;
                const missed = day === 19;
                return (
                  <div key={day} className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1 ${
                    active ? 'bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400' :
                    missed ? 'bg-rose-500/10 border-rose-500/40 text-rose-500' : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-400'
                  }`}>
                    <span>{day}</span>
                    {active && <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />}
                    {missed && <span className="text-[9px]">Missed</span>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Streak Recovery Opportunity</h3>
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">Missed session on Sep 19 recovered via Quiz Challenge</p>
                <p className="text-[11px] text-gray-400">Streak shield successfully applied.</p>
              </div>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-200">
                Protected
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 52. LEADERBOARD PAGE ⭐                                  */}
      {/* ========================================================= */}
      {activeView === 'leaderboard' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-[#F97316] border border-amber-200">
                  Global Rankings
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-2">Scholar Leaderboard</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Compare your XP and academic performance across categories.</p>
              </div>

              {/* Time Filters */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
                {[
                  { id: 'daily', label: 'Daily' },
                  { id: 'weekly', label: 'Weekly' },
                  { id: 'monthly', label: 'Monthly' },
                  { id: 'all-time', label: 'All-time' },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setLeaderboardFilter(f.id as any)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      leaderboardFilter === f.id
                        ? 'bg-[#F97316] text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tabs: Global, School, University, Department, Course, Friends */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 dark:border-gray-800">
              {[
                { id: 'global', label: 'Global', icon: Globe },
                { id: 'school', label: 'School', icon: Building2 },
                { id: 'university', label: 'University', icon: GraduationCap },
                { id: 'department', label: 'Department', icon: BookOpen },
                { id: 'course', label: 'Course', icon: Zap },
                { id: 'friends', label: 'Friends', icon: Users },
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = leaderboardTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setLeaderboardTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-amber-500/10 text-[#F97316] border border-amber-200 dark:border-amber-900/50'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Leaderboard Table */}
            <div className="space-y-3">
              {[
                { rank: 1, name: 'Draco Vance', xp: '24,850 XP', level: 'Level 50', badge: '🥇', user: false },
                { rank: 2, name: 'Elena Rostova', xp: '22,400 XP', level: 'Level 48', badge: '🥈', user: false },
                { rank: 3, name: 'Kenshi Takahashi', xp: '20,150 XP', level: 'Level 45', badge: '🥉', user: false },
                { rank: 4, name: 'Aiden Pierce', xp: '18,900 XP', level: 'Level 44', badge: '', user: false },
                { rank: 5, name: 'Hilosthone Sulyman (You)', xp: '14,250 XP', level: 'Level 42', badge: '⭐', user: true },
                { rank: 6, name: 'Sarah Jenkins', xp: '13,100 XP', level: 'Level 39', badge: '', user: false },
              ].map(row => (
                <div 
                  key={row.rank} 
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                    row.user 
                      ? 'bg-purple-500/10 border-purple-500 dark:border-purple-600 shadow-md ring-2 ring-purple-500/30' 
                      : 'bg-gray-50/60 dark:bg-gray-900/40 border-gray-200 dark:border-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                      row.rank === 1 ? 'bg-amber-400 text-white' :
                      row.rank === 2 ? 'bg-gray-300 text-gray-800' :
                      row.rank === 3 ? 'bg-amber-700 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                    }`}>
                      {row.badge || `#${row.rank}`}
                    </span>
                    <div>
                      <h4 className={`text-xs sm:text-sm font-bold ${row.user ? 'text-purple-600 dark:text-purple-400 font-black' : 'text-gray-900 dark:text-white'}`}>
                        {row.name}
                      </h4>
                      <p className="text-[11px] text-gray-400">{row.level}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs sm:text-sm font-black text-gray-900 dark:text-white">{row.xp}</span>
                    {row.user && <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400">Your Current Position</p>}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}