'use client';

import React, { useState } from 'react';
import { ArrowLeft, Sliders, Bot, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AICompanionProfile({ onBack }: { onBack: () => void }) {
  const [name, setName] = useState('Dr. Athena');
  const [personality, setPersonality] = useState('Encouraging & Academic');
  const [voice, setVoice] = useState('Warm British Female');
  const [outfit, setOutfit] = useState('Professional Academic Blazer');
  const [style, setStyle] = useState('Socratic Questioning');

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
      <button 
        onClick={onBack}
        className="text-xs font-bold text-gray-500 hover:text-[var(--color-brand-blue)] flex items-center gap-1.5 mb-2 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to AI Assistant
      </button>

      <div className="bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
          <div className="w-16 h-16 rounded-3xl bg-purple-600 border-2 border-purple-400 flex items-center justify-center shadow-md">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200">
              Companion Customization
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
              AI Tutor Persona Setup
            </h2>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Companion Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Personality Profile</label>
              <select
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option>Encouraging & Academic</option>
                <option>Strict & Rigorous Coach</option>
                <option>Casual & Friendly Mentor</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Voice Profile</label>
              <select
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option>Warm British Female</option>
                <option>Clear American Male</option>
                <option>Calm Neutral Voice</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Avatar Outfit</label>
              <select
                value={outfit}
                onChange={(e) => setOutfit(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option>Professional Academic Blazer</option>
                <option>Casual Tech Hoodie</option>
                <option>Formal Lab Coat</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Default Teaching Style</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option>Socratic Questioning</option>
              <option>Direct Explanations</option>
              <option>Analogy & Storytelling</option>
            </select>
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={onBack}
            className="w-full py-3.5 rounded-2xl bg-purple-600 text-white font-bold text-xs shadow-md hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save Companion Customization</span>
          </button>
        </div>
      </div>
    </div>
  );
}