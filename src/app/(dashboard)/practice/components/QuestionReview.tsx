'use client';

import React from 'react';
import { ArrowLeft, CheckCircle2, XCircle, Sparkles } from 'lucide-react';

export default function QuestionReview({ onBack }: { onBack: () => void }) {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
      <button 
        onClick={onBack}
        className="text-xs font-bold text-gray-500 hover:text-[var(--color-brand-blue)] flex items-center gap-1.5 mb-2 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Quiz Results
      </button>

      <div className="bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-6">
        <div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200">
            Question Review & Breakdown (Question 3 of 10)
          </span>
          <h3 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white mt-3">
            Which of the following accurately describes the behavior of kernel-level threads compared to user-level threads?
          </h3>
        </div>

        <div className="space-y-3 pt-2">
          {/* User's incorrect answer */}
          <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide">Your Answer</p>
              <p className="text-xs text-gray-800 dark:text-gray-200 mt-0.5">User-level threads have higher context-switching overhead than kernel threads.</p>
            </div>
          </div>

          {/* Correct answer */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Correct Answer</p>
              <p className="text-xs text-gray-800 dark:text-gray-200 mt-0.5">Kernel threads are managed directly by the operating system scheduler.</p>
            </div>
          </div>
        </div>

        {/* AI Explanation Box */}
        <div className="p-6 rounded-3xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 space-y-3">
          <div className="flex items-center gap-2 text-[var(--color-brand-blue)]">
            <Sparkles className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">AI Tutor Explanation</h4>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            Kernel threads are known to have a higher context-switching overhead because the CPU must transition into kernel mode to manage thread scheduling. User-level threads are managed by user-space runtimes, making switches faster, but they lack direct OS scheduler multi-core awareness.
          </p>
          <div className="pt-2 border-t border-blue-200/50 dark:border-blue-900/40 flex items-center justify-between text-[11px] text-gray-500">
            <span>Related Topic: <strong className="text-gray-900 dark:text-white">OS Scheduling & Concurrency</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}