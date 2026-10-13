/**
 * ---------------------------------------------------------------------------
 * lib/validation/password.ts — Client-side password form rules
 * ---------------------------------------------------------------------------
 * Mirrors the backend DTOs (mycoursea-backend/src/auth/dto/password.dto.ts):
 *   - newPassword: required, at least 6 characters
 *   - confirmNewPassword: required, must equal newPassword
 *   - reset token: the 6-digit code emailed by POST /auth/forgot-password
 * The backend remains the source of truth; these checks only give faster feedback.
 */

export const PASSWORD_MIN_LENGTH = 6;
export const RESET_CODE_PATTERN = /^\d{6}$/;

export type FieldErrors<K extends string> = Partial<Record<K, string>>;

function checkNewPassword(newPassword: string, confirmNewPassword: string) {
  const errors: FieldErrors<'newPassword' | 'confirmNewPassword'> = {};
  if (!newPassword) {
    errors.newPassword = 'Enter a new password.';
  } else if (newPassword.length < PASSWORD_MIN_LENGTH) {
    errors.newPassword = `Use at least ${PASSWORD_MIN_LENGTH} characters.`;
  }
  if (!confirmNewPassword) {
    errors.confirmNewPassword = 'Confirm your new password.';
  } else if (newPassword && confirmNewPassword !== newPassword) {
    errors.confirmNewPassword = 'Passwords do not match.';
  }
  return errors;
}

export interface ChangePasswordValues {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export function validateChangePassword(values: ChangePasswordValues): FieldErrors<keyof ChangePasswordValues> {
  const errors: FieldErrors<keyof ChangePasswordValues> = {
    ...checkNewPassword(values.newPassword, values.confirmNewPassword),
  };
  if (!values.oldPassword) {
    errors.oldPassword = 'Enter your current password.';
  } else if (values.newPassword && values.newPassword === values.oldPassword) {
    errors.newPassword = 'Choose a password different from your current one.';
  }
  return errors;
}

export interface ResetPasswordValues {
  /** Account the code was sent to: the backend checks the code against this account only. */
  email: string;
  token: string;
  newPassword: string;
  confirmNewPassword: string;
}

export function validateResetPassword(values: ResetPasswordValues): FieldErrors<keyof ResetPasswordValues> {
  const errors: FieldErrors<keyof ResetPasswordValues> = {
    ...checkNewPassword(values.newPassword, values.confirmNewPassword),
  };
  const emailError = validateEmail(values.email);
  if (emailError) errors.email = emailError;
  const token = values.token.trim();
  if (!token) {
    errors.token = 'Enter the 6-digit code from your email.';
  } else if (!RESET_CODE_PATTERN.test(token)) {
    errors.token = 'The code is 6 digits.';
  }
  return errors;
}

export function validateEmail(email: string): string | undefined {
  const value = email.trim();
  if (!value) return 'Enter your email address.';
  // Deliberately simple: the backend performs the authoritative check.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address.';
  return undefined;
}

export function hasErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean);
}
