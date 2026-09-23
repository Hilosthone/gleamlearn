'use client';

import React, { useState } from 'react';
import { BookOpen, CheckSquare, Clock, Sliders, ArrowLeft } from 'lucide-react';

export default function QuizSetup({ onStartQuiz, onBack }: { onStartQuiz: () => void; onBack: () => void }) {
  const [course, setCourse] = useState('Advanced Operating Systems');
  const [topic, setTopic] = useState('Kernel Threads & Synchronization');
  const [questionCount, setQuestionCount] = useState('10');
  const [questionType, setQuestionType] = useState('objective');
  const [difficulty, setDifficulty] = useState('medium');
  const [timeLimit, setTimeLimit] = useState('15 mins');

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
      <button 
        onClick={onBack}
        className="text-xs font-bold text-gray-500 hover:text-[var(--color-brand-blue)] flex items-center gap-1.5 mb-2 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Practice Hub
      </button>

      <div className="bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-6">
        <div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-blue-500/10 text-[var(--color-brand-blue)] border-blue-200">
            Quiz Configuration
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white mt-2">
            Customize Your Practice Quiz
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Choose your parameters to generate an adaptive AI session tailored to your goals.
          </p>
        </div>

        <div className="space-y-4">
          {/* Course Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Select Course</label>
            <select 
              value={course} 
              onChange={(e) => setCourse(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]"
            >
              <option>Advanced Operating Systems</option>
              <option>Macroeconomics Fiscal Policy</option>
              <option>Data Structures & Algorithms</option>
            </select>
          </div>

          {/* Topic Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Topic / Module</label>
            <input 
              type="text" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Number of Questions */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Number of Questions</label>
              <select 
                value={questionCount} 
                onChange={(e) => setQuestionCount(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]"
              >
                <option value="5">5 Questions (Quick)</option>
                <option value="10">10 Questions (Standard)</option>
                <option value="20">20 Questions (Deep Dive)</option>
              </select>
            </div>

            {/* Objective / Theory */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Format</label>
              <select 
                value={questionType} 
                onChange={(e) => setQuestionType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]"
              >
                <option value="objective">Objective (Multiple Choice)</option>
                <option value="theory">Theory / Open Response</option>
                <option value="mixed">Mixed Format</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Difficulty */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Difficulty Level</label>
              <select 
                value={difficulty} 
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]"
              >
                <option value="easy">Easy / Beginner</option>
                <option value="medium">Medium / Intermediate</option>
                <option value="hard">Hard / Expert</option>
              </select>
            </div>

            {/* Time Limit */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Time Limit</label>
              <select 
                value={timeLimit} 
                onChange={(e) => setTimeLimit(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]"
              >
                <option value="5 mins">5 Minutes</option>
                <option value="15 mins">15 Minutes</option>
                <option value="30 mins">30 Minutes</option>
                <option value="unlimited">Untimed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button 
            onClick={onStartQuiz}
            className="w-full py-3.5 rounded-2xl bg-[var(--color-brand-blue)] text-white font-bold text-xs shadow-md hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
          >
            <span>Start Quiz Session</span>
          </button>
        </div>
      </div>
    </div>
  );
}