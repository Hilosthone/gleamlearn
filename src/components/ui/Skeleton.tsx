// src/components/ui/Skeleton.tsx
import React from 'react';

interface SkeletonProps {
  className?: string;
}

/**
 * Decorative placeholder block with a subtle shimmer.
 * Size and shape come from `className` so it can mirror the real content.
 * Hidden from assistive tech — wrap groups in an element with role="status".
 */
export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div aria-hidden="true" className={`skeleton rounded-xl ${className}`} />
);
