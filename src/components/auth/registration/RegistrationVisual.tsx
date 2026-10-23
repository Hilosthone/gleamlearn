'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Fallback } from './Scene3DFallback';
import type { LearnerPath } from '@/lib/registration/wizard';

// Code-split: three.js / R3F load only when this visual actually renders (large screens with WebGL).
const RegistrationScene3D = dynamic(() => import('./RegistrationScene3D'), { ssr: false, loading: () => <Fallback /> });

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

/**
 * Decides whether to show the 3D accent: only on screens ≥ 1024 px wide with WebGL. Phones and tablets never
 * download the 3D bundle. The decision runs after mount (no hydration mismatch); the form never waits for it.
 */
export function RegistrationVisual({ path, reducedMotion }: { path: LearnerPath | null; reducedMotion: boolean }) {
  const [mode, setMode] = useState<'pending' | '3d' | 'static'>('pending');

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const decide = () => setMode(mq.matches && supportsWebGL() ? '3d' : 'static');
    decide();
    mq.addEventListener('change', decide);
    return () => mq.removeEventListener('change', decide);
  }, []);

  if (mode !== '3d') return <Fallback />;
  return <RegistrationScene3D path={path} reducedMotion={reducedMotion} />;
}
