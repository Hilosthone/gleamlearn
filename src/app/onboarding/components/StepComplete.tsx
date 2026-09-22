'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';

interface StepCompleteProps {
  goalData: { goal: string };
  academicData: { institution: string; departmentOrSubject: string };
  aiCompanion: { name: string };
}

export default function StepComplete({ goalData, academicData, aiCompanion }: StepCompleteProps) {
  return (
    <div className="space-y-6 text-center">
      <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-[var(--color-brand-green)] rounded-2xl mx-auto flex items-center justify-center animate-bounce">
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">You Are All Set!</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
          {aiCompanion.name} has personalized your profile, set your targets, and prepared your initial lesson module.
        </p>
      </div>

      <Card variant="bordered" className="text-left space-y-3 bg-gray-50/50 dark:bg-gray-900/40">
        <div className="flex justify-between text-xs text-gray-500 font-semibold">
          <span>INITIAL GOAL</span>
          <span className="text-[var(--color-brand-blue)]">Active</span>
        </div>
        <p className="text-sm font-bold text-gray-900 dark:text-white">{goalData.goal}</p>
        <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
          <span className="text-[10px] text-gray-400 font-semibold uppercase">Recommended First Activity</span>
          <p className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-0.5">
            Introductory Diagnostic & Core Concept Breakdown
          </p>
        </div>
      </Card>
    </div>
  );
}