'use client';

import React from 'react';
import { Award, CheckCircle, XCircle, Clock, Zap, RotateCcw, AlertTriangle, ArrowRight } from 'lucide-react';

export default function QuizResult({ onNavigate }: { onNavigate: (screen: string) => void }) {
  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
      <div className="bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto border border-emerald-200">
          <Award className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200">
            Quiz Completed Successfully
          </span>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-2">
            Great Job, Hilosthone!
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            You successfully completed the Advanced Operating Systems practice assessment.
          </p>
        </div>

        {/* Score Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-gray-100 dark:border-gray-800">
          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
            <p className="text-[10px] text-gray-400 font-bold uppercase">Score</p>
            <p className="text-base font-extrabold text-gray-900 dark:text-white mt-0.5">8 / 10</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
            <p className="text-[10px] text-gray-400 font-bold uppercase">Percentage</p>
            <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">80.0%</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
            <p className="text-[10px] text-gray-400 font-bold uppercase">XP Earned</p>
            <p className="text-base font-extrabold text-[var(--color-brand-blue)] mt-0.5">+120 XP</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
            <p className="text-[10px] text-gray-400 font-bold uppercase">Time Taken</p>
            <p className="text-base font-extrabold text-gray-900 dark:text-white mt-0.5">4m 12s</p>
          </div>
        </div>

        {/* Detailed stats break */}
        <div className="flex items-center justify-around text-xs text-gray-600 dark:text-gray-300 font-medium pt-2">
          <span className="flex items-center gap-1 text-emerald-600"><CheckCircle className="w-4 h-4" /> 8 Correct</span>
          <span className="flex items-center gap-1 text-rose-500"><XCircle className="w-4 h-4" /> 2 Wrong</span>
          <span className="flex items-center gap-1 text-gray-400"><Clock className="w-4 h-4" /> 0 Skipped</span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <button
            onClick={() => onNavigate('review')}
            className="w-full py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <span>Review Answers & AI Explanations</span>
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => onNavigate('quiz-setup')}
              className="py-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Quiz</span>
            </button>
            <button
              onClick={() => onNavigate('hub')}
              className="py-3 rounded-2xl bg-[var(--color-brand-blue)] text-white font-bold text-xs shadow-md hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              <span>Continue Learning</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}