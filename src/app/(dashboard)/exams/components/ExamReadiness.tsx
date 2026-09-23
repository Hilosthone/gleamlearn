'use client';

import React from 'react';
import { TrendingUp, AlertTriangle, ArrowRight, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';

export default function ExamReadiness({ onBack, onStartRevision }: { onBack: () => void; onStartRevision: () => void }) {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
      <button 
        onClick={onBack}
        className="text-xs font-bold text-gray-500 hover:text-[var(--color-brand-blue)] flex items-center gap-1.5 mb-2 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Exam Hub
      </button>

      <div className="bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200">
              AI Diagnostic Report
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white mt-2">
              JAMB Readiness Score
            </h2>
          </div>
          <div className="flex items-center gap-3 bg-purple-50 dark:bg-purple-950/30 px-5 py-3 rounded-2xl border border-purple-200">
            <span className="text-3xl font-black text-purple-600 dark:text-purple-400">78%</span>
            <span className="text-[10px] text-gray-500 font-bold uppercase leading-tight">Board Exam<br />Ready</span>
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-4">
          <h3 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">Subject Breakdown</h3>
          
          <div className="space-y-3">
            {[
              { subject: 'English', score: '91%', color: 'bg-emerald-500' },
              { subject: 'Mathematics', score: '84%', color: 'bg-emerald-500' },
              { subject: 'Physics', score: '72%', color: 'bg-amber-500' },
              { subject: 'Chemistry', score: '66%', color: 'bg-rose-500' },
            ].map((sub, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-gray-900 dark:text-white">{sub.subject}</span>
                  <span className="text-gray-700 dark:text-gray-300 font-mono">{sub.score}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full ${sub.color}`} style={{ width: sub.score }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weakest Area Alert Box */}
        <div className="p-5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-extrabold text-rose-700 dark:text-rose-400 uppercase">Your Weakest Area Identified</h4>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Organic Chemistry is currently dragging down your overall score. Focused revision in alkanes, functional groups, and isomerism will boost your readiness by ~12%.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={onStartRevision}
            className="w-full py-3.5 rounded-2xl bg-purple-600 text-white font-extrabold text-xs shadow-md hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Start Recommended Revision</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}