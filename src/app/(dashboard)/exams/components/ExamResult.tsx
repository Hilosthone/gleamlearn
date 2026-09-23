'use client';

import React from 'react';
import { Award, CheckCircle, XCircle, Clock, TrendingUp, ArrowRight, RotateCcw } from 'lucide-react';

export default function ExamResult({ onNavigate }: { onNavigate: (screen: string) => void }) {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
      <div className="bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs text-center space-y-6">
        <div className="w-16 h-16 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-3xl flex items-center justify-center mx-auto border border-purple-200">
          <Award className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200">
            Proctored Simulation Graded
          </span>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-2">
            Examination Performance Report
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            JAMB UTME Mock Examination • 2025 Past Questions
          </p>
        </div>

        {/* Score Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-gray-100 dark:border-gray-800">
          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
            <p className="text-[10px] text-gray-400 font-bold uppercase">Overall Score</p>
            <p className="text-base font-extrabold text-gray-900 dark:text-white mt-0.5">312 / 400</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
            <p className="text-[10px] text-gray-400 font-bold uppercase">Percentage</p>
            <p className="text-base font-extrabold text-purple-600 dark:text-purple-400 mt-0.5">78.0%</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
            <p className="text-[10px] text-gray-400 font-bold uppercase">Time Management</p>
            <p className="text-base font-extrabold text-emerald-600 mt-0.5">Optimal (1h 12m)</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
            <p className="text-[10px] text-gray-400 font-bold uppercase">Missed Qs</p>
            <p className="text-base font-extrabold text-rose-500 mt-0.5">9 Questions</p>
          </div>
        </div>

        {/* Topic Breakdown */}
        <div className="text-left space-y-3 bg-gray-50 dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
          <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Topic Performance Breakdown</h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-300">Mathematics & Algebra</span><span className="font-extrabold text-emerald-600">84%</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-300">Use of English & Grammar</span><span className="font-extrabold text-emerald-600">91%</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-300">Physics (Mechanics)</span><span className="font-extrabold text-amber-500">72%</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-300">Chemistry (Organic)</span><span className="font-extrabold text-rose-500">66%</span></div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => onNavigate('readiness')}
            className="py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span>View Readiness Analysis</span>
          </button>
          <button
            onClick={() => onNavigate('hub')}
            className="py-3 rounded-2xl bg-purple-600 text-white font-bold text-xs shadow-md hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
          >
            <span>Return to Exam Hub</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}