'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { FeatureUnavailable } from '@/components/ui/states';

/**
 * Document upload → AI class generation is not connected yet. The previous screen accepted a file, discarded it
 * and played a simulated "processing" sequence ending on a hard-coded class. Until the upload and generation
 * endpoints are integrated (and generated content can be stored), this page says so honestly.
 */
export default function UploadMaterialPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16">
      <div className="flex items-center justify-between">
        <Link
          href="/library"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[var(--color-brand-blue)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Library</span>
        </Link>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Upload Study Material</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Turn lecture notes, textbooks or past questions into notes, quizzes and a class.
        </p>
      </div>

      <FeatureUnavailable
        title="Uploading material isn't available yet"
        description="Uploading a document and generating notes, questions or a class from it is not connected in the app yet, so nothing can be uploaded or processed here."
        action={
          <Link href="/library" className="text-xs font-semibold text-[var(--color-brand-blue)] underline">
            Back to Library
          </Link>
        }
      />
    </div>
  );
}
