'use client';

import React from 'react';
import { Input } from '@/components/ui/Input';

interface StepAiCompanionProps {
  aiCompanion: {
    name: string;
    gender: string;
    personality: string;
    teachingStyle: string;
    voice: string;
    appearance: string;
  };
  setAiCompanion: React.Dispatch<React.SetStateAction<any>>;
}

export default function StepAiCompanion({ aiCompanion, setAiCompanion }: StepAiCompanionProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Meet Your AI Companion</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Personalize your virtual tutor to guide you through tough modules.
        </p>
      </div>

      <div className="space-y-4">
        <Input
          label="AI Tutor Name"
          value={aiCompanion.name}
          onChange={(e) => setAiCompanion({ ...aiCompanion, name: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Gender / Persona</label>
            <select
              value={aiCompanion.gender}
              onChange={(e) => setAiCompanion({ ...aiCompanion, gender: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#111827] border border-gray-300 dark:border-[#1F2937] text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)] cursor-pointer"
            >
              <option value="Neutral">Neutral</option>
              <option value="Female">Female Voice</option>
              <option value="Male">Male Voice</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tone & Personality</label>
            <select
              value={aiCompanion.personality}
              onChange={(e) => setAiCompanion({ ...aiCompanion, personality: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#111827] border border-gray-300 dark:border-[#1F2937] text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)] cursor-pointer"
            >
              <option value="Encouraging & Detailed">Encouraging & Detailed</option>
              <option value="Strict & Analytical">Strict & Analytical</option>
              <option value="Casual & Friendly">Casual & Friendly</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Teaching Style</label>
            <select
              value={aiCompanion.teachingStyle}
              onChange={(e) => setAiCompanion({ ...aiCompanion, teachingStyle: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#111827] border border-gray-300 dark:border-[#1F2937] text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)] cursor-pointer"
            >
              <option value="Socratic (Question-based)">Socratic (Question-based)</option>
              <option value="Direct Explanations">Direct Explanations</option>
              <option value="Analogy-driven">Analogy-driven</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Avatar Look</label>
            <select
              value={aiCompanion.appearance}
              onChange={(e) => setAiCompanion({ ...aiCompanion, appearance: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#111827] border border-gray-300 dark:border-[#1F2937] text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)] cursor-pointer"
            >
              <option value="Modern Hologram">Modern Hologram</option>
              <option value="Friendly Robot">Friendly Robot</option>
              <option value="Academic Scholar">Academic Scholar</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}