'use client';

import React from 'react';
import { Award, CheckCircle, ArrowRight, RotateCcw } from 'lucide-react';

export default function TestResult({ onReset }: { onReset: () => void }) {
  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
      <div className="bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs text-center space-y-6">
        <div className="w-16 h-16 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-3xl flex items-center justify-center mx-auto border border-purple-200">
          <Award className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200">
            Certification Exam Graded
          </span>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-2">
            Exam Performance Report
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Advanced Operating Systems Final Certification
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-gray-100 dark:border-gray-800">
          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
            <p className="text-[10px] text-gray-400 font-bold uppercase">Score</p>
            <p className="text-base font-extrabold text-gray-900 dark:text-white mt-0.5">45 / 50</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
            <p className="text-[10px] text-gray-400 font-bold uppercase">Percentage</p>
            <p className="text-base font-extrabold text-purple-600 dark:text-purple-400 mt-0.5">90.0%</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
            <p className="text-[10px] text-gray-400 font-bold uppercase">XP Reward</p>
            <p className="text-base font-extrabold text-[var(--color-brand-blue)] mt-0.5">+500 XP</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
            <p className="text-[10px] text-gray-400 font-bold uppercase">Coins</p>
            <p className="text-base font-extrabold text-amber-500 mt-0.5">+200 Coins</p>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="text-left space-y-3 bg-gray-50 dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
          <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">AI Diagnostic Breakdown</h4>
          <div className="space-y-2 text-xs">
            <p className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" /> <strong>Strengths:</strong> Kernel Threads, CPU Scheduling, Virtual Memory
            </p>
            <p className="text-rose-500 dark:text-rose-400 font-medium flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" /> <strong>Weaknesses:</strong> Distributed File System consistency models
            </p>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={onReset}
            className="w-full py-3 rounded-2xl bg-[var(--color-brand-blue)] text-white font-bold text-xs shadow-md hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
          >
            <span>Return to Practice Hub</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}