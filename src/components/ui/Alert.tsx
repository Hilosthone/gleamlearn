// src/components/ui/Alert.tsx
import React from 'react';
import { AlertCircle, CheckCircle2, Info, WifiOff, type LucideIcon } from 'lucide-react';

type AlertVariant = 'error' | 'success' | 'info' | 'warning' | 'offline';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

const styles: Record<AlertVariant, string> = {
  error: 'bg-red-500/10 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300',
  success: 'bg-emerald-500/10 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300',
  info: 'bg-blue-500/10 border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-300',
  warning: 'bg-amber-500/10 border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300',
  offline: 'bg-gray-500/10 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300',
};

const icons: Record<AlertVariant, LucideIcon> = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
  warning: AlertCircle,
  offline: WifiOff,
};

/**
 * Inline status message. Errors use role="alert" (announced immediately);
 * other variants use role="status" (announced politely).
 */
export const Alert: React.FC<AlertProps> = ({ variant = 'info', title, children, action, className = '' }) => {
  const Icon = icons[variant];
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-xs ${styles[variant]} ${className}`}
    >
      <Icon className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
      <div className="flex-1 space-y-0.5">
        {title && <p className="font-bold">{title}</p>}
        {children && <div className="leading-relaxed">{children}</div>}
        {action && <div className="pt-1.5">{action}</div>}
      </div>
    </div>
  );
};
