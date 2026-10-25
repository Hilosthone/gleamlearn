'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { FeatureUnavailable } from '@/components/ui/states';

/**
 * AI teaching mode is not connected to the AI tutor yet. The previous screen showed scripted replies
 * ("Spot on! Exactly." for any input, always about AVL trees whatever the lesson) and a fake voice indicator,
 * which looked like a working AI. It will be built on the backend's AI tutor endpoints in a later batch.
 */
export default function AITeachingModePage() {
  const params = useParams<{ lessonId?: string }>();
  const lessonHref = params?.lessonId ? `/learn/lesson/${encodeURIComponent(params.lessonId)}` : '/learn';

  return (
    <div className="max-w-2xl mx-auto py-12 space-y-6 animate-in fade-in duration-300">
      <Link
        href={lessonHref}
        className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[var(--color-brand-blue)] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to the lesson</span>
      </Link>
      <FeatureUnavailable
        title="AI teaching mode isn't available yet"
        description="The interactive AI teacher for lessons is not connected yet. Your lesson and its progress are still available."
        action={
          <Link href={lessonHref} className="text-xs font-semibold text-[var(--color-brand-blue)] underline">
            Return to the lesson
          </Link>
        }
      />
    </div>
  );
}
