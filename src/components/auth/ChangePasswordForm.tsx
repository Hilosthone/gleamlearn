// src/components/auth/ChangePasswordForm.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { authApi, ApiError } from '@/lib/api';
import { recoveryHint } from '@/lib/api-error';
import { SlowNotice } from '@/components/ui/states';
import { useSlowFlag } from '@/hooks/useSlowFlag';
import { hasErrors, validateChangePassword, type ChangePasswordValues, type FieldErrors } from '@/lib/validation/password';

const EMPTY: ChangePasswordValues = { oldPassword: '', newPassword: '', confirmNewPassword: '' };

interface ChangePasswordFormProps {
  onCancel?: () => void;
}

/**
 * Authenticated password change: POST /auth/change-password with
 * { oldPassword, newPassword, confirmNewPassword }.
 * Values are kept on failure so the user does not have to retype them;
 * they are cleared only after the server confirms success.
 */
export function ChangePasswordForm({ onCancel }: ChangePasswordFormProps) {
  const [values, setValues] = useState<ChangePasswordValues>(EMPTY);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<keyof ChangePasswordValues>>({});
  const [submitError, setSubmitError] = useState<ApiError | null>(null);
  const [succeeded, setSucceeded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSlow = useSlowFlag(isSubmitting);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setSubmitError(null);
    setSucceeded(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // ignore double submits

    const errors = validateChangePassword(values);
    setFieldErrors(errors);
    if (hasErrors(errors)) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await authApi.changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
        confirmNewPassword: values.confirmNewPassword,
      });
      setSucceeded(true);
      setValues(EMPTY);
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError('Could not change your password.', null, 'unknown');
      // The backend answers an incorrect current password with 401 "Incorrect old password"
      if (apiError.status === 401 && /old password/i.test(apiError.message)) {
        setFieldErrors({ oldPassword: 'Your current password is incorrect.' });
      } else {
        setSubmitError(apiError);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3" aria-label="Change password">
      <Input
        id="change-old-password"
        label="Current password"
        type="password"
        name="oldPassword"
        autoComplete="current-password"
        value={values.oldPassword}
        onChange={handleChange}
        error={fieldErrors.oldPassword}
        disabled={isSubmitting}
      />
      <Input
        id="change-new-password"
        label="New password"
        type="password"
        name="newPassword"
        autoComplete="new-password"
        value={values.newPassword}
        onChange={handleChange}
        error={fieldErrors.newPassword}
        helperText="At least 6 characters."
        disabled={isSubmitting}
      />
      <Input
        id="change-confirm-password"
        label="Confirm new password"
        type="password"
        name="confirmNewPassword"
        autoComplete="new-password"
        value={values.confirmNewPassword}
        onChange={handleChange}
        error={fieldErrors.confirmNewPassword}
        disabled={isSubmitting}
      />

      {isSlow && <SlowNotice />}

      {succeeded && (
        <Alert variant="success" title="Password updated">
          Your password was changed. A confirmation email has been sent to you.
        </Alert>
      )}

      {submitError && (
        <Alert
          variant={submitError.kind === 'network' ? 'offline' : 'error'}
          title={submitError.kind === 'unauthorized' ? 'Please sign in again' : 'Password not changed'}
          action={
            submitError.kind === 'unauthorized' ? (
              <Link href="/auth/login" className="font-semibold underline">
                Go to sign in
              </Link>
            ) : undefined
          }
        >
          {recoveryHint(submitError.kind) || submitError.message}
        </Alert>
      )}

      <div className="flex items-center justify-end gap-2 pt-1">
        {onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
          Update password
        </Button>
      </div>
    </form>
  );
}
