'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { YoutubeWorkspace } from '@/components/ai/YoutubeWorkspace';

export default function YoutubeSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  return (
    <main className="min-h-screen bg-gray-50/50 dark:bg-[#0b0f19] px-4 sm:px-8 py-8">
      <div className="max-w-6xl mx-auto">
        <YoutubeWorkspace id={sessionId} />
      </div>
    </main>
  );
}
