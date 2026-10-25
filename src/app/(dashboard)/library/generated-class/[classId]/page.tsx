'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { FeatureUnavailable } from '@/components/ui/states';

/**
 * Previously showed the same hard-coded class for every id, and "Regenerate" displayed "Class regenerated
 * successfully!" without doing anything. Generated classes are not stored by the backend (saved generated
 * content answers 501 FEATURE_UNAVAILABLE), so there is nothing real to show here yet.
 */
export default function GeneratedClassPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16">
      <div className="flex items-center justify-between">
        <Link
          href="/library"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[var(--color-brand-blue)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Library</span>
        </Link>
      </div>

      <FeatureUnavailable
        title="Generated classes aren't available yet"
        description="Classes generated from your documents are not saved yet, so there is no class to open here."
        action={
          <Link href="/library" className="text-xs font-semibold text-[var(--color-brand-blue)] underline">
            Back to Library
          </Link>
        }
      />
    </div>
  );
}
