'use client';

import React, { useState } from 'react';
import { Award, ArrowLeft } from 'lucide-react';

export default function TestSetup({ onStartTest, onBack }: { onStartTest: () => void; onBack: () => void }) {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
      <button 
        onClick={onBack}
        className="text-xs font-bold text-gray-500 hover:text-[var(--color-brand-blue)] flex items-center gap-1.5 mb-2 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Hub
      </button>

      <div className="bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-6">
        <div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200">
            Advanced Certification Test
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white mt-2">
            Full Test Configuration
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Configure rigorous timed parameters, randomized multi-chapter testing, and strict objective-theory constraints.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Certification / Exam Course</label>
            <select className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600">
              <option>Advanced Operating Systems Final Assessment</option>
              <option>Full-Stack MERN Architecture Board Exam</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Question Pool Size</label>
              <select className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600">
                <option>50 Questions</option>
                <option>100 Questions</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Strict Time Limit</label>
              <select className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600">
                <option>60 Minutes</option>
                <option>120 Minutes</option>
              </select>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-white">Enable Full Question Randomization</h4>
              <p className="text-[10px] text-gray-500">Shuffle both question order and answer choices.</p>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500" />
          </div>
        </div>

        <div className="pt-4">
          <button 
            onClick={onStartTest}
            className="w-full py-3.5 rounded-2xl bg-purple-600 text-white font-bold text-xs shadow-md hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
          >
            <span>Begin Full Test Examination</span>
          </button>
        </div>
      </div>
    </div>
  );
}