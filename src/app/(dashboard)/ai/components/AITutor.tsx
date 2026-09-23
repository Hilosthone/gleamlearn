'use client';

import React, { useState } from 'react';
import { PlayCircle, ArrowLeft, Sparkles } from 'lucide-react';

export default function AITutor({ onStartClassroom, onBack }: { onStartClassroom: () => void; onBack: () => void }) {
  const [course, setCourse] = useState('Advanced Physics & Mechanics');
  const [topic, setTopic] = useState('Electromagnetic Induction & Faraday\'s Law');
  const [style, setStyle] = useState('Socratic Dialogue (Interactive Questioning)');

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
      <button 
        onClick={onBack}
        className="text-xs font-bold text-gray-500 hover:text-[var(--color-brand-blue)] flex items-center gap-1.5 mb-2 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to AI Assistant
      </button>

      <div className="bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-6">
        <div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200">
            Immersive Lesson Setup
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white mt-2">
            Configure AI Tutor Studio
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Choose your course, target topic, and preferred teaching methodology for the live classroom session.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Choose Course</label>
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option>Advanced Physics & Mechanics</option>
              <option>Organic & Inorganic Chemistry</option>
              <option>Full-Stack MERN Architecture</option>
              <option>Linear Algebra & Calculus</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Choose Topic / Focus</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Choose Teaching Style</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option>Socratic Dialogue (Interactive Questioning)</option>
              <option>Direct Lecture & Step-by-Step Breakdown</option>
              <option>Real-World Analogy & Storytelling</option>
              <option>Rigorous Feynman Technique</option>
            </select>
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={onStartClassroom}
            className="w-full py-3.5 rounded-2xl bg-purple-600 text-white font-bold text-xs shadow-md hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Start Live AI Classroom Session</span>
          </button>
        </div>
      </div>
    </div>
  );
}