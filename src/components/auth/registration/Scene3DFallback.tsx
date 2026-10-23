import React from 'react';

/** Static stand-in for the 3D accent (no three.js): shown while loading, without WebGL, or on small screens. */
export function Fallback() {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center" aria-hidden="true">
      <div className="w-40 h-40 rounded-[2.5rem] rotate-12 bg-gradient-to-br from-[var(--color-brand-blue)]/25 via-[var(--color-brand-purple)]/20 to-[var(--color-brand-gold)]/25 blur-[2px]" />
    </div>
  );
}
