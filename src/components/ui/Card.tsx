// src/components/ui/Card.tsx
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'bordered';
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  onClick,
}) => {
  const variants = {
    default: 'bg-white dark:bg-[#111827] text-gray-900 dark:text-gray-100 shadow-sm border border-gray-100 dark:border-[#1F2937]',
    glass: 'glass-panel text-gray-900 dark:text-gray-100',
    bordered: 'bg-transparent border-2 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100',
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-5 transition-all duration-200 ${variants[variant]} ${
        onClick ? 'cursor-pointer hover:scale-[1.01] hover:shadow-md' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};