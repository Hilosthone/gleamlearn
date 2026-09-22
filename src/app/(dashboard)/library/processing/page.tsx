'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle2, 
  Loader2, 
  Sparkles, 
  FileText, 
  Cpu, 
  Layers 
} from 'lucide-react';

export default function DocumentProcessingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    'Uploading document securely...',
    'Reading document text & parsing layout...',
    'Identifying key academic topics & concepts...',
    'Synthesizing comprehensive study notes...',
    'Generating practice questions & flashcards...',
    'Building your AI interactive learning class...',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          setTimeout(() => {
            router.push('/library/generated-class/os-threads');
          }, 1000);
          return prev;
        }
      });
    }, 1200);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="max-w-2xl mx-auto py-16 space-y-8 animate-in fade-in duration-300 text-center">
      
      <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-50 dark:bg-blue-950/50 text-[var(--color-brand-blue)] flex items-center justify-center shadow-xl relative">
        <Sparkles className="w-10 h-10 animate-pulse text-[var(--color-brand-blue)]" />
        <div className="absolute inset-0 rounded-3xl border-2 border-[var(--color-brand-blue)] animate-ping opacity-20" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
          Analyzing Your Material... ⚡
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Our AI engine is processing your document to craft a tailored learning experience.
        </p>
      </div>

      {/* Progress Checklist */}
      <div className="bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs text-left space-y-4">
        {steps.map((stepText, index) => {
          const isDone = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div key={index} className="flex items-center gap-3">
              {isDone ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-5 h-5 text-[var(--color-brand-blue)] animate-spin shrink-0" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-700 shrink-0" />
              )}
              <span className={`text-xs sm:text-sm font-bold ${
                isDone ? 'text-gray-900 dark:text-white' : isCurrent ? 'text-[var(--color-brand-blue)]' : 'text-gray-400'
              }`}>
                {stepText}
              </span>
            </div>
          );
        })}
      </div>

    </div>
  );
}