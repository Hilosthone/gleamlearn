'use client';

import React from 'react';
import Link from 'next/link';
import { FeatureUnavailable } from '@/components/ui/states';

/**
 * Previously a timed animation of invented processing steps that always ended on a hard-coded class
 * (/library/generated-class/os-threads). No document was ever processed. Kept as a route so old links land on
 * an honest message.
 */
export default function DocumentProcessingPage() {
  return (
    <div className="max-w-2xl mx-auto py-16 animate-in fade-in duration-300">
      <FeatureUnavailable
        title="Document processing isn't available yet"
        description="No document is being processed. Uploading material and generating a class from it is not connected in the app yet."
        action={
          <Link href="/library" className="text-xs font-semibold text-[var(--color-brand-blue)] underline">
            Back to Library
          </Link>
        }
      />
    </div>
  );
}
