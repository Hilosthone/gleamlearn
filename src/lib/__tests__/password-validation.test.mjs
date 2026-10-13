// Run with: npm test   (Node's built-in test runner; imports the TypeScript module directly)
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateChangePassword,
  validateResetPassword,
  validateEmail,
  hasErrors,
  PASSWORD_MIN_LENGTH,
} from '../validation/password.ts';

test('change password: matching passwords are valid', () => {
  const errors = validateChangePassword({ oldPassword: 'OldPass1!', newPassword: 'NewPass1!', confirmNewPassword: 'NewPass1!' });
  assert.equal(hasErrors(errors), false);
});

test('change password: mismatched confirmation is rejected', () => {
  const errors = validateChangePassword({ oldPassword: 'OldPass1!', newPassword: 'NewPass1!', confirmNewPassword: 'Other1!' });
  assert.equal(errors.confirmNewPassword, 'Passwords do not match.');
});

test('change password: missing confirmation is rejected', () => {
  const errors = validateChangePassword({ oldPassword: 'OldPass1!', newPassword: 'NewPass1!', confirmNewPassword: '' });
  assert.equal(errors.confirmNewPassword, 'Confirm your new password.');
});

test('change password: missing current password and short new password are rejected', () => {
  const errors = validateChangePassword({ oldPassword: '', newPassword: 'abc', confirmNewPassword: 'abc' });
  assert.equal(errors.oldPassword, 'Enter your current password.');
  assert.equal(errors.newPassword, `Use at least ${PASSWORD_MIN_LENGTH} characters.`);
});

test('change password: reusing the current password is rejected', () => {
  const errors = validateChangePassword({ oldPassword: 'Same1234', newPassword: 'Same1234', confirmNewPassword: 'Same1234' });
  assert.match(errors.newPassword, /different/);
});

test('reset password: valid code and matching passwords are valid', () => {
  const errors = validateResetPassword({ email: 'ada@example.com', token: ' 123456 ', newPassword: 'NewPass1!', confirmNewPassword: 'NewPass1!' });
  assert.equal(hasErrors(errors), false);
});

test('reset password: mismatched and missing confirmation are rejected', () => {
  assert.equal(
    validateResetPassword({ email: 'ada@example.com', token: '123456', newPassword: 'NewPass1!', confirmNewPassword: 'x' }).confirmNewPassword,
    'Passwords do not match.',
  );
  assert.equal(
    validateResetPassword({ email: 'ada@example.com', token: '123456', newPassword: 'NewPass1!', confirmNewPassword: '' }).confirmNewPassword,
    'Confirm your new password.',
  );
});

test('reset password: code must be exactly 6 digits', () => {
  for (const token of ['', '12345', '1234567', 'abcdef', '12 456']) {
    assert.ok(validateResetPassword({ email: 'ada@example.com', token, newPassword: 'NewPass1!', confirmNewPassword: 'NewPass1!' }).token, token);
  }
});

test('reset password: the email is required (the backend binds the code to one account)', () => {
  for (const email of ['', '  ', 'not-an-email']) {
    assert.ok(validateResetPassword({ email, token: '123456', newPassword: 'NewPass1!', confirmNewPassword: 'NewPass1!' }).email, email);
  }
});

test('email validation', () => {
  assert.equal(validateEmail('ada@example.com'), undefined);
  assert.ok(validateEmail(''));
  assert.ok(validateEmail('not-an-email'));
});
