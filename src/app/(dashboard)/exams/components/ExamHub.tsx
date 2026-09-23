'use client';

import React from 'react';
import { 
  FileText, 
  Calendar, 
  BookOpen, 
  History, 
  PlayCircle, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Award,
  Sparkles
} from 'lucide-react';

export default function ExamHub({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const upcomingExams = [
    { title: 'JAMB UTME Mock Examination', date: 'Oct 15, 2026', time: '09:00 AM WAT', duration: '2h 00m', subjects: '4 Subjects' },
    { title: 'Full-Stack MERN Architecture Board Exam', date: 'Oct 22, 2026', time: '02:00 PM WAT', duration: '1h 30m', subjects: 'Advanced Coding & System Design' },
  ];

  const pastQuestions = [
    { title: 'WAEC General Mathematics (2025)', attempts: '3 Attempts', bestScore: '92%' },
    { title: 'JAMB Physics Past Questions (2024)', attempts: '2 Attempts', bestScore: '78%' },
    { title: 'University Advanced Operating Systems (Midterm)', attempts: '1 Attempt', bestScore: '85%' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Examination Hub</span>
            <span className="text-xs px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1.5 border border-purple-200 shadow-xs">
              <Award className="w-3.5 h-3.5" />
              <span>Proctored Mode</span>
            </span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Simulate official board exams, practice verified past questions, and track your overall exam readiness score.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('readiness')}
            className="px-5 py-3 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white font-bold text-xs shadow-xs hover:border-[var(--color-brand-blue)] transition-all flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4 text-[var(--color-brand-blue)]" />
            <span>Check Exam Readiness</span>
          </button>
          <button
            onClick={() => onNavigate('setup')}
            className="px-5 py-3 rounded-2xl bg-purple-600 text-white font-bold text-xs shadow-md hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Start New Simulation</span>
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Upcoming Exams & Quick Setup */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Exams Banner */}
          <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span>Upcoming Scheduled Exams</span>
              </h3>
              <span className="text-[11px] text-gray-400 font-mono">2 Scheduled</span>
            </div>

            <div className="space-y-3">
              {upcomingExams.map((exam, i) => (
                <div key={i} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">{exam.title}</h4>
                    <div className="flex items-center gap-3 text-[11px] text-gray-500 font-mono">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {exam.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {exam.time}</span>
                      <span>• {exam.duration}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => onNavigate('setup')}
                    className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors shrink-0"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Past Questions Vault */}
          <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <History className="w-4 h-4 text-[var(--color-brand-blue)]" />
                <span>Past Questions Vault</span>
              </h3>
              <span className="text-[11px] text-[var(--color-brand-blue)] font-bold cursor-pointer hover:underline">Browse All Vault</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {pastQuestions.map((pq, idx) => (
                <div 
                  key={idx} 
                  onClick={() => onNavigate('setup')}
                  className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 space-y-3 hover:border-[var(--color-brand-blue)] transition-all cursor-pointer group"
                >
                  <div className="p-2 rounded-xl bg-blue-500/10 text-[var(--color-brand-blue)] w-fit">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-gray-900 dark:text-white group-hover:text-[var(--color-brand-blue)] transition-colors line-clamp-1">{pq.title}</h4>
                    <p className="text-[10px] text-gray-400 mt-1">{pq.attempts} • Best: <strong className="text-emerald-600">{pq.bestScore}</strong></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Readiness Widget & Quick Start */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-purple-900 to-indigo-950 p-6 rounded-3xl text-white shadow-md relative overflow-hidden space-y-6">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl"></div>
            
            <div className="flex items-center justify-between relative z-10">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/10 text-purple-200 border border-white/15">
                JAMB / UTME Tracker
              </span>
              <Sparkles className="w-4 h-4 text-purple-300" />
            </div>

            <div className="relative z-10 space-y-2">
              <p className="text-xs text-purple-200 font-medium">Overall Exam Readiness</p>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black tracking-tight">78%</span>
                <span className="text-xs text-emerald-400 font-bold">↑ 4% this week</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="w-[78%] h-full bg-emerald-400"></div>
              </div>
            </div>

            <div className="relative z-10 pt-2">
              <button
                onClick={() => onNavigate('readiness')}
                className="w-full py-3 rounded-2xl bg-white text-gray-900 font-extrabold text-xs shadow-md hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
              >
                <span>View Full Readiness Breakdown</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-500" />
              <span>Exam Simulation Tips</span>
            </h3>
            <ul className="space-y-2.5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Find a quiet environment without distractions to simulate real exam pressure.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Use the question flag tool to mark tricky questions and return before final submission.</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}