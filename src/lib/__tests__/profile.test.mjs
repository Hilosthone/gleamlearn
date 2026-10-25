import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  academicChanges,
  academicFormOf,
  achievementCount,
  basicChanges,
  basicFormOf,
  changedFields,
  toCompanion,
  toNotificationSettings,
  toProfile,
  validateBasic,
} from '../profile.ts';

const raw = {
  id: 'u1',
  fullName: 'Ada Lovelace',
  username: 'ada',
  email: 'ada@example.com',
  country: 'Nigeria',
  dateOfBirth: '2008-04-01',
  educationType: 'University',
  university: 'Test University',
  department: 'Physics',
  level: '300 Level',
  isEmailVerified: false,
  createdAt: '2026-10-01T00:00:00Z',
  passwordHash: 'never-mapped',
};

test('GET /users/me maps to a typed profile (missing fields are empty strings; secrets are not carried)', () => {
  const p = toProfile(raw);
  assert.equal(p.fullName, 'Ada Lovelace');
  assert.equal(p.level, '300 Level');
  assert.equal(p.secondarySchool, '');
  assert.equal(p.isEmailVerified, false);
  assert.equal('passwordHash' in p, false);
  assert.deepEqual(toProfile({ data: raw }).id, 'u1');
});

test('only changed basic fields are sent; required fields are never cleared', () => {
  const p = toProfile(raw);
  const form = { ...basicFormOf(p), fullName: ' Ada L. ', country: 'Ghana' };
  assert.deepEqual(basicChanges(p, form), { fullName: 'Ada L.', country: 'Ghana' });
  assert.deepEqual(basicChanges(p, { ...basicFormOf(p), username: '   ' }), {});
  assert.deepEqual(basicChanges(p, basicFormOf(p)), {});
});

test('basic validation mirrors the backend limits', () => {
  assert.deepEqual(validateBasic({ fullName: 'Ada', username: 'ada', country: '', dateOfBirth: '' }), {});
  const e = validateBasic({ fullName: '', username: 'x'.repeat(101), country: 'x'.repeat(101), dateOfBirth: '01/04/2008' });
  assert.deepEqual(Object.keys(e).sort(), ['country', 'dateOfBirth', 'fullName', 'username']);
});

test('academic changes use the backend field names (level is sent as levelOrClass)', () => {
  const p = toProfile(raw);
  const form = { ...academicFormOf(p), level: '400 Level', faculty: 'Science' };
  assert.deepEqual(academicChanges(p, form), { levelOrClass: '400 Level', faculty: 'Science' });
  const exam = toProfile({ ...raw, educationType: null });
  assert.equal(academicFormOf(exam).educationType, '');
  assert.deepEqual(academicChanges(exam, academicFormOf(exam)), {});
});

test('notification settings, companion and achievements map from the backend shapes', () => {
  assert.deepEqual(toNotificationSettings({ status: 'success', data: { emailAlerts: false, pushNotifications: true, aiTutorReminders: true, marketingEmails: false } }), {
    emailAlerts: false,
    pushNotifications: true,
    aiTutorReminders: true,
    marketingEmails: false,
  });
  const c = toCompanion({ status: 'success', data: { name: 'Gleam AI', personality: 'Casual & Friendly', userId: 'u1' } });
  assert.equal(c.name, 'Gleam AI');
  assert.equal(c.voice, '');
  assert.deepEqual(changedFields(c, { ...c, name: 'Nova' }), { name: 'Nova' });
  assert.equal(achievementCount({ status: 'success', unlockedAchievements: [{}, {}] }), 2);
  assert.equal(achievementCount({}), 0);
});
