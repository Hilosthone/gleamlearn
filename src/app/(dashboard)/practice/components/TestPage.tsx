'use client';

import React from 'react';
import { Clock, Award, ArrowRight } from 'lucide-react';

export default function TestPage({ onSubmitTest }: { onSubmitTest: () => void }) {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
      <div className="bg-white dark:bg-[#111827] px-6 py-4 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-extrabold text-gray-900 dark:text-white">Test Mode • Question 12 of 50</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 text-xs font-mono font-bold">
          <Clock className="w-3.5 h-3.5" />
          <span>54:12 Remaining</span>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-6">
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200">
          Advanced Operating Systems Certification
        </span>

        <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
          Explain the deadlock prevention strategy involving mutual exclusion and resource preemption under strict multi-threaded architecture.
        </h3>

        <textarea 
          rows={6}
          placeholder="Type your comprehensive theoretical answer here..."
          className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
        ></textarea>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <span className="text-xs text-gray-400 font-mono">Status: Auto-saving draft</span>
          <button 
            onClick={onSubmitTest}
            className="px-6 py-3 rounded-2xl bg-purple-600 text-white font-bold text-xs shadow-md hover:bg-purple-700 transition-all flex items-center gap-2"
          >
            <span>Finish & Submit Test</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}