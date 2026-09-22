// src/components/ui/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'orange' | 'purple' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  // Base styling rules for typography, transitions, and accessibility
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  // Variant color mapping utilizing your custom theme tokens
  const variants = {
    primary: 'bg-[var(--color-brand-blue)] text-white hover:opacity-90 shadow-lg shadow-blue-500/25',
    success: 'bg-[var(--color-brand-green)] text-white hover:opacity-90 shadow-lg shadow-emerald-500/25',
    orange: 'bg-[var(--color-brand-orange)] text-white hover:opacity-90 shadow-lg shadow-orange-500/25',
    purple: 'bg-[var(--color-brand-purple)] text-white hover:opacity-90 shadow-lg shadow-purple-500/25',
    danger: 'bg-[var(--color-brand-red)] text-white hover:opacity-90 shadow-lg shadow-red-500/25',
    outline: 'border border-gray-300 dark:border-gray-700 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100',
  };

  // Size variations
  const sizes = {
    sm: 'text-xs px-3 py-2',
    md: 'text-sm px-4 py-2.5',
    lg: 'text-base px-6 py-3.5',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};