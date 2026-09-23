'use client';

import React, { useState } from 'react';
import { Clock, Flag, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function QuizPage({ onSubmitQuiz }: { onSubmitQuiz: () => void }) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isFlagged, setIsFlagged] = useState(false);

  const options = [
    'A race condition occurs when multiple threads access shared data concurrently without synchronization.',
    'Kernel threads are managed directly by the operating system scheduler.',
    'User-level threads have higher context-switching overhead than kernel threads.',
    'Semaphores are strictly used for memory allocation rather than mutual exclusion.'
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Bar: Progress & Timer */}
      <div className="bg-white dark:bg-[#111827] px-6 py-4 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-extrabold text-gray-900 dark:text-white">Question 3 of 10</span>
          <div className="w-32 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden hidden sm:block">
            <div className="w-[30%] h-full bg-[var(--color-brand-blue)]"></div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 text-xs font-mono font-bold">
          <Clock className="w-3.5 h-3.5" />
          <span>04:45</span>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200">
            Advanced Operating Systems • Multiple Choice
          </span>
          <button 
            onClick={() => setIsFlagged(!isFlagged)}
            className={`p-2 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-bold ${
              isFlagged 
                ? 'bg-rose-500 text-white border-rose-500' 
                : 'bg-gray-50 dark:bg-gray-900 text-gray-500 border-gray-200 dark:border-gray-800'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>{isFlagged ? 'Flagged' : 'Flag Question'}</span>
          </button>
        </div>

        <h3 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white leading-snug">
          Which of the following accurately describes the behavior of kernel-level threads compared to user-level threads?
        </h3>

        {/* Options */}
        <div className="space-y-3">
          {options.map((opt, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedOption(idx)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                selectedOption === idx
                  ? 'bg-blue-50/50 dark:bg-blue-950/30 border-[var(--color-brand-blue)] text-gray-900 dark:text-white shadow-xs'
                  : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                selectedOption === idx 
                  ? 'bg-[var(--color-brand-blue)] border-[var(--color-brand-blue)] text-white' 
                  : 'border-gray-300 dark:border-gray-700'
              }`}>
                {selectedOption === idx && <CheckCircle2 className="w-3.5 h-3.5" />}
              </div>
              <span className="text-xs sm:text-sm font-medium leading-relaxed">{opt}</span>
            </div>
          ))}
        </div>

        {/* Navigation Actions */}
        <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <button className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-200 transition-colors flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <button 
            onClick={onSubmitQuiz}
            className="px-6 py-2.5 rounded-xl bg-[var(--color-brand-blue)] text-white font-bold text-xs shadow-md hover:bg-blue-700 transition-all flex items-center gap-1.5"
          >
            <span>Next Question</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}