'use client';

import React, { useState } from 'react';
import { ArrowLeft, PlayCircle, Sliders } from 'lucide-react';

export default function ExamSetup({ onStartExam, onBack }: { onStartExam: () => void; onBack: () => void }) {
  const [examType, setExamType] = useState('JAMB UTME Simulation');
  const [subject, setSubject] = useState('Mathematics & Physics');
  const [year, setYear] = useState('2025 (Official Past Questions)');
  const [topics, setTopics] = useState('All Syllabus Topics');
  const [questionCount, setQuestionCount] = useState('40 Questions');
  const [difficulty, setDifficulty] = useState('Standard Board Level');
  const [duration, setDuration] = useState('60 Minutes');

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
      <button 
        onClick={onBack}
        className="text-xs font-bold text-gray-500 hover:text-[var(--color-brand-blue)] flex items-center gap-1.5 mb-2 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Exam Hub
      </button>

      <div className="bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-6">
        <div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200">
            Proctored Simulation Setup
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white mt-2">
            Configure Examination Parameters
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Set up timed conditions, subject combinations, and syllabus scopes for your exam simulation.
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Examination Body</label>
              <select 
                value={examType} 
                onChange={(e) => setExamType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option>JAMB UTME Simulation</option>
                <option>WAEC Senior Secondary Certificate</option>
                <option>University Semester Final Exam</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Subject / Module</label>
              <select 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option>Mathematics & Physics</option>
                <option>Chemistry & Biology</option>
                <option>Use of English & General Paper</option>
                <option>Advanced Operating Systems</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Question Year / Bank</label>
              <select 
                value={year} 
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option>2025 (Official Past Questions)</option>
                <option>2024 (Official Past Questions)</option>
                <option>Curated AI Mixed Bank</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Syllabus Topics</label>
              <select 
                value={topics} 
                onChange={(e) => setTopics(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option>All Syllabus Topics</option>
                <option>Algebra & Trigonometry Only</option>
                <option>Mechanics & Thermodynamics</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Number of Questions</label>
              <select 
                value={questionCount} 
                onChange={(e) => setQuestionCount(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option>40 Questions</option>
                <option>60 Questions</option>
                <option>100 Questions</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Difficulty</label>
              <select 
                value={difficulty} 
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option>Standard Board Level</option>
                <option>High Rigor / Expert</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Duration</label>
              <select 
                value={duration} 
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option>60 Minutes</option>
                <option>90 Minutes</option>
                <option>120 Minutes</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button 
            onClick={onStartExam}
            className="w-full py-3.5 rounded-2xl bg-purple-600 text-white font-bold text-xs shadow-md hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Launch Proctored Exam Simulation</span>
          </button>
        </div>
      </div>
    </div>
  );
}