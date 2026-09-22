// src/components/ui/Badge.tsx
import React from 'react';

interface BadgeProps {
  icon?: React.ReactNode;
  label: string | number;
  variant?: 'xp' | 'coin' | 'streak' | 'default';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  icon,
  label,
  variant = 'default',
  className = '',
}) => {
  const variants = {
    default: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
    xp: 'bg-blue-50 dark:bg-blue-950/40 text-[var(--color-brand-blue)] border border-blue-200 dark:border-blue-800/50',
    coin: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50',
    streak: 'bg-orange-50 dark:bg-orange-950/40 text-[var(--color-brand-orange)] border border-orange-200 dark:border-orange-800/50',
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>
      {icon && <span className="text-sm">{icon}</span>}
      <span>{label}</span>
    </div>
  );
};