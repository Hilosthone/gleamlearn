'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';
import { Box, Square } from 'lucide-react';
import { VISUAL_NEEDS_3D, supportsWebGL, type Visual } from '@/lib/visual-lesson';
import { Visual2D } from './Visual2D';

/**
 * The renderer registry: picks the 3D scene (lazy-loaded, client only) or the 2D SVG view for a validated visual.
 * 3D is used only when the type has a 3D renderer, WebGL works, and the learner hasn't chosen 2D; if the scene
 * throws, the 2D view takes over. A text description is always present for screen readers.
 */
const Scene3D = dynamic(() => import('./Scene3D'), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center text-xs text-gray-500">Loading the 3D view…</div>,
});

const motionQuery = '(prefers-reduced-motion: reduce)';
const subscribeMotion = (cb: () => void) => {
  const m = window.matchMedia(motionQuery);
  m.addEventListener('change', cb);
  return () => m.removeEventListener('change', cb);
};
export const usePrefersReducedMotion = () => useSyncExternalStore(subscribeMotion, () => window.matchMedia(motionQuery).matches, () => true);

class SceneBoundary extends React.Component<{ fallback: React.ReactNode; children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/** One sentence describing the visual, for screen readers and as the caption fallback. */
export function describeVisual(v: Visual): string {
  switch (v.type) {
    case 'shape3d':
      return `A ${v.shape}${Object.keys(v.dimensions).length ? ` with ${Object.entries(v.dimensions).map(([k, n]) => `${k} ${n}`).join(', ')}` : ''}.`;
    case 'molecule':
      return `${v.name || 'A molecule'} with ${v.atoms.length} atoms (${v.atoms.map((a) => a.element).join(', ')}) and ${v.bonds.length} bonds.`;
    case 'graph2d':
      return `A graph of a ${v.family} function from x = ${v.xMin} to x = ${v.xMax}.`;
    case 'vectors':
      return `${v.vectors.length} vectors: ${v.vectors.map((a) => `${a.label || 'unnamed'} (${a.x}, ${a.y}, ${a.z})`).join('; ')}${v.showResultant ? ', with their resultant' : ''}.`;
    case 'orbit':
      return `${v.bodies.map((b) => b.label).join(', ')} orbiting ${v.center}.`;
    case 'wave':
      return `A wave with ${v.waves} cycle(s) and amplitude ${v.amplitude}.`;
    case 'flow':
      return `${v.cycle ? 'A cycle' : 'A process'}: ${v.nodes.map((n) => n.label).join(' → ')}.`;
    case 'labeled':
      return `${v.subject || 'A structure'} with parts: ${v.parts.map((p) => p.label).join(', ')}.`;
  }
}

export function VisualView({ visual }: { visual: Visual }) {
  const reducedMotion = usePrefersReducedMotion();
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [mode, setMode] = useState<'3d' | '2d'>('3d');
  useEffect(() => {
    // after mount only (no WebGL probing during render or on the server)
    const ok = supportsWebGL();
    queueMicrotask(() => setWebgl(ok));
  }, []);
  const can3d = VISUAL_NEEDS_3D[visual.type] && webgl === true;
  const show3d = can3d && mode === '3d';
  const fallback = <Visual2D visual={visual} />;

  return (
    <figure className="space-y-2">
      {can3d && (
        <div className="flex justify-end gap-1" role="group" aria-label="View">
          {(['3d', '2d'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 ${mode === m ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
            >
              {m === '3d' ? <Box className="w-3 h-3" aria-hidden="true" /> : <Square className="w-3 h-3" aria-hidden="true" />} {m.toUpperCase()}
            </button>
          ))}
        </div>
      )}
      <div data-visual={visual.type} data-view={show3d ? '3d' : '2d'} className={`rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden ${show3d ? 'h-72 sm:h-80' : 'p-3'}`}>
        {show3d ? <SceneBoundary fallback={<div className="p-3">{fallback}</div>}><Scene3D visual={visual as never} reducedMotion={reducedMotion} /></SceneBoundary> : fallback}
      </div>
      <figcaption className="text-xs text-gray-600 dark:text-gray-300">
        {visual.caption || describeVisual(visual)}
        {show3d && <span className="text-gray-400"> · Drag to rotate, scroll or pinch to zoom.</span>}
        <span className="sr-only"> {describeVisual(visual)}</span>
      </figcaption>
    </figure>
  );
}
