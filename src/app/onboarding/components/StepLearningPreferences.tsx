
'use client';

import React from 'react';

interface StepLearningPreferencesProps {
  preferences: {
    speed: string;
    studyTime: string;
    duration: string;
    explanationStyle: string;
  };
  setPreferences: React.Dispatch<React.SetStateAction<any>>;
}

export default function StepLearningPreferences({ preferences, setPreferences }: StepLearningPreferencesProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Learning Preferences</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Customize your study pace, schedule, and quiz formats.
        </p>
      </div>

      <div className="space-y-5">
        {/* Pacing */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">How do you learn best?</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'slow', label: 'Slow & detailed' },
              { id: 'balanced', label: 'Balanced' },
              { id: 'fast', label: 'Fast-paced' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPreferences({ ...preferences, speed: item.id })}
                className={`p-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  preferences.speed === item.id
                    ? 'border-[var(--color-brand-blue)] bg-blue-50 dark:bg-blue-950/30 text-[var(--color-brand-blue)] shadow-sm'
                    : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Preferred Study Time & Duration */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Preferred Study Time</label>
            <select
              value={preferences.studyTime}
              onChange={(e) => setPreferences({ ...preferences, studyTime: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#111827] border border-gray-300 dark:border-[#1F2937] text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)] cursor-pointer"
            >
              <option value="Morning">Morning (8 AM)</option>
              <option value="Afternoon">Afternoon (1 PM)</option>
              <option value="Evening">Evening (8 PM)</option>
              <option value="Night">Late Night (11 PM)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Daily Duration</label>
            <select
              value={preferences.duration}
              onChange={(e) => setPreferences({ ...preferences, duration: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#111827] border border-gray-300 dark:border-[#1F2937] text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)] cursor-pointer"
            >
              <option value="15 mins">15 mins / day</option>
              <option value="30 mins">30 mins / day</option>
              <option value="60 mins">1 hour / day</option>
              <option value="2+ hours">2+ hours / day</option>
            </select>
          </div>
        </div>

        {/* Explanation Style */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Preferred Explanation & Quiz Style</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'objective', label: 'Objective Questions' },
              { id: 'theory', label: 'Theory Questions' },
              { id: 'mixed', label: 'Mixed / Both' },
            ].map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => setPreferences({ ...preferences, explanationStyle: style.id })}
                className={`p-3 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                  preferences.explanationStyle === style.id
                    ? 'border-[var(--color-brand-purple)] bg-purple-50 dark:bg-purple-950/30 text-[var(--color-brand-purple)] shadow-sm'
                    : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}