// src/components/ui/ConfirmDialog.tsx
'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  /** When set, the user must type this exact text before confirming (for irreversible actions). */
  confirmationText?: string;
  isPending?: boolean;
  error?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Accessible confirmation for destructive actions, built on the native <dialog>
 * (focus is moved into the dialog and Escape closes it). Confirm stays disabled
 * while the action is pending and until the typed confirmation matches.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  confirmationText,
  isPending = false,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [typed, setTyped] = useState('');
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const matches = !confirmationText || typed.trim() === confirmationText;

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={descId}
      onCancel={(e) => {
        e.preventDefault();
        if (!isPending) {
          setTyped('');
          onCancel();
        }
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] p-0 text-gray-900 dark:text-gray-100 shadow-2xl backdrop:bg-black/50"
    >
      <form
        method="dialog"
        className="p-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (matches && !isPending) onConfirm();
        }}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 shrink-0 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-[var(--color-brand-red)]" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h2 id={titleId} className="text-base font-extrabold">
              {title}
            </h2>
            <div id={descId} className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              {description}
            </div>
          </div>
        </div>

        {confirmationText && (
          <Input
            label={`Type ${confirmationText} to confirm`}
            id={`${titleId}-confirm`}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            disabled={isPending}
          />
        )}

        {error}

        <div className="flex justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => {
              setTyped('');
              onCancel();
            }}
          >
            Cancel
          </Button>
          <Button type="submit" variant="danger" size="sm" isLoading={isPending} disabled={!matches}>
            {confirmLabel}
          </Button>
        </div>
      </form>
    </dialog>
  );
}
