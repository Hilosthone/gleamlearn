'use client';

import React from 'react';
import { 
  Zap, 
  BookOpen, 
  AlertTriangle, 
  Flame, 
  Shuffle, 
  Sliders, 
  Layers, 
  HelpCircle, 
  ArrowRight,
  Award
} from 'lucide-react';

export default function PracticeHub({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const practiceOptions = [
    {
      id: 'quick',
      title: 'Quick Quiz',
      desc: 'Fast 5-question general assessment to test core retention.',
      icon: Zap,
      badgeColor: 'bg-blue-500/10 text-[var(--color-brand-blue)] border-blue-200',
      action: 'Start Quick Quiz'
    },
    {
      id: 'topic',
      title: 'Topic Practice',
      desc: 'Target specific modules, chapters, or learning objectives.',
      icon: BookOpen,
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200',
      action: 'Select Topic'
    },
    {
      id: 'weak',
      title: 'Weak-Topic Practice',
      desc: 'AI-recommended drills focusing on your historical low-score areas.',
      icon: AlertTriangle,
      badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200',
      action: 'Fix Weaknesses'
    },
    {
      id: 'daily',
      title: 'Daily Challenge',
      desc: 'Fresh curated questions with bonus XP and coin multipliers.',
      icon: Flame,
      badgeColor: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200',
      action: 'Take Challenge'
    },
    {
      id: 'random',
      title: 'Random Practice',
      desc: 'Mixed questions across all enrolled courses and subjects.',
      icon: Shuffle,
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200',
      action: 'Shuffle & Start'
    },
    {
      id: 'custom',
      title: 'Custom Practice',
      desc: 'Configure custom question counts, formats, and time limits.',
      icon: Sliders,
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200',
      action: 'Configure'
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Practice & Assessment Hub</span>
            <span className="text-xs px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-[var(--color-brand-blue)] font-bold flex items-center gap-1.5 shadow-xs">
              <Zap className="w-3.5 h-3.5" />
              <span>Hub</span>
            </span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Boost retention with intelligent quizzes, targeted weak-topic drills, and full certification exams.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('test-setup')}
            className="px-5 py-3 rounded-2xl bg-purple-600 text-white font-bold text-xs shadow-md hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
          >
            <Award className="w-4 h-4" />
            <span>Advanced Test Mode</span>
          </button>
        </div>
      </div>

      {/* Practice Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {practiceOptions.map((opt) => {
          const IconComponent = opt.icon;
          return (
            <div
              key={opt.id}
              onClick={() => onNavigate('quiz-setup')}
              className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs hover:shadow-md hover:border-[var(--color-brand-blue)] transition-all flex flex-col justify-between space-y-6 group cursor-pointer"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-2xl border ${opt.badgeColor}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] text-gray-400 font-mono">Active</span>
                </div>

                <h3 className="text-base font-extrabold text-gray-900 dark:text-white group-hover:text-[var(--color-brand-blue)] transition-colors">
                  {opt.title}
                </h3>

                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {opt.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--color-brand-blue)] group-hover:underline">
                  {opt.action}
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[var(--color-brand-blue)] transition-colors" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}