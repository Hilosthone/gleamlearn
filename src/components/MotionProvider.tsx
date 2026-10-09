'use client';

import React from 'react';
import { MotionConfig } from 'framer-motion';

/**
 * App-wide framer-motion config. `reducedMotion="user"` honours the OS
 * "reduce motion" setting: transform/layout animations are skipped while
 * opacity fades still run. No effect for users without that preference.
 */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
