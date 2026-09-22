// src/components/ui/Input.tsx
import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#111827] border ${
            error
              ? 'border-[var(--color-brand-red)] focus:ring-[var(--color-brand-red)]'
              : 'border-gray-300 dark:border-[#1F2937] focus:border-[var(--color-brand-blue)]'
          } text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all text-sm ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-[var(--color-brand-red)] font-medium">{error}</span>}
        {helperText && !error && <span className="text-xs text-gray-500 dark:text-gray-400">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';