'use client';

import React, { useState } from 'react';
import { Clock, Flag, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ExamInterface({ onSubmitExam }: { onSubmitExam: () => void }) {
  const [selectedOption, setSelectedOption] = useState<number | null>(1);
  const [isFlagged, setIsFlagged] = useState(false);
  const [currentSection, setCurrentSection] = useState('Mathematics');

  const options = [
    'A. 124.5 cm²',
    'B. 142.8 cm²',
    'C. 156.0 cm²',
    'D. 164.2 cm²'
  ];

  // Dummy answer sheet grid state (40 items)
  const answerSheetGrid = Array.from({ length: 40 }, (_, i) => ({
    number: i + 1,
    status: i === 2 ? 'current' : i < 3 ? 'answered' : i === 5 ? 'flagged' : 'unanswered'
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Serious Exam Bar */}
      <div className="bg-white dark:bg-[#111827] px-6 py-4 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200">
            JAMB UTME • {currentSection}
          </span>
          <span className="text-xs font-bold text-gray-500 font-mono">Question 3 of 40</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 text-xs font-mono font-extrabold">
            <Clock className="w-3.5 h-3.5" />
            <span>057:14 Remaining</span>
          </div>

          <button 
            onClick={onSubmitExam}
            className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors shadow-sm"
          >
            Submit Exam
          </button>
        </div>
      </div>

      {/* Main Grid: Question View & Answer Sheet Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left 3 Cols: Question Card */}
        <div className="lg:col-span-3 bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400 font-mono">ID: MTH-2025-03</span>
            </div>
            <button 
              onClick={() => setIsFlagged(!isFlagged)}
              className={`px-3 py-1.5 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-bold ${
                isFlagged 
                  ? 'bg-rose-500 text-white border-rose-500' 
                  : 'bg-gray-50 dark:bg-gray-900 text-gray-500 border-gray-200 dark:border-gray-800'
              }`}
            >
              <Flag className="w-3.5 h-3.5" />
              <span>{isFlagged ? 'Flagged for Review' : 'Flag Question'}</span>
            </button>
          </div>

          <h3 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white leading-relaxed">
            Calculate the total surface area of a closed right circular cylinder whose base radius is 7 cm and perpendicular height is 14 cm. (Take $\pi = \frac{22}{7}$)
          </h3>

          {/* Options */}
          <div className="space-y-3 pt-2">
            {options.map((opt, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedOption(idx)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                  selectedOption === idx
                    ? 'bg-purple-50/50 dark:bg-purple-950/30 border-purple-600 text-gray-900 dark:text-white shadow-xs'
                    : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                  selectedOption === idx 
                    ? 'bg-purple-600 border-purple-600 text-white' 
                    : 'border-gray-300 dark:border-gray-700'
                }`}>
                  {selectedOption === idx && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
                <span className="text-xs sm:text-sm font-medium">{opt}</span>
              </div>
            ))}
          </div>

          {/* Bottom Nav */}
          <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <button className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-200 transition-colors flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <button className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-md hover:bg-purple-700 transition-all flex items-center gap-1.5">
              <span>Save & Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right 1 Col: Sections & Answer Sheet Navigator */}
        <div className="space-y-6">
          {/* Sections */}
          <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-3">
            <h4 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">Exam Sections</h4>
            <div className="space-y-2">
              {['Mathematics', 'Physics', 'English', 'Chemistry'].map((sec) => (
                <button
                  key={sec}
                  onClick={() => setCurrentSection(sec)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    currentSection === sec
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>
          </div>

          {/* Answer Sheet Grid */}
          <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">Answer Sheet</h4>
              <span className="text-[10px] text-gray-400 font-mono">3 / 40 Answered</span>
            </div>

            <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto pr-1">
              {answerSheetGrid.map((item) => {
                let bgClass = 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
                if (item.status === 'current') bgClass = 'border-2 border-purple-600 text-purple-600 font-extrabold';
                if (item.status === 'answered') bgClass = 'bg-emerald-500 text-white';
                if (item.status === 'flagged') bgClass = 'bg-rose-500 text-white';

                return (
                  <button
                    key={item.number}
                    className={`h-9 rounded-xl text-xs font-bold flex items-center justify-center transition-all ${bgClass}`}
                  >
                    {item.number}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-2 text-[10px] text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Answered</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> Flagged</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-gray-300 inline-block"></span> Unanswered</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full border border-purple-600 inline-block"></span> Current</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}