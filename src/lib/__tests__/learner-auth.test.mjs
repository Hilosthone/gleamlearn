import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';

const store = new Map();
globalThis.window = {
  localStorage: { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) },
  dispatchEvent: () => true,
};
const calls = [];
let responder = () => new Response('{}', { status: 200 });
globalThis.fetch = async (url, init) => {
  calls.push({ url, init });
  return responder(url, init);
};

const auth = await import('../learner-auth.ts');
const { ApiError } = await import('../api-error.ts');
const { buildOnboardingRequests } = await import('../onboarding-profile.ts');

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const TOKEN = 'header.payload.signature-long-enough';

beforeEach(() => {
  store.clear();
  calls.length = 0;
});

test('signIn stores the token under the learner key only and returns accountStatus', async () => {
  responder = () => json(201, { accessToken: TOKEN, accountStatus: 'frozen', data: { id: 'u1', email: 'a@x.test' } });
  const res = await auth.signIn(' a@x.test ', 'pw');
  assert.equal(store.get('accessToken'), TOKEN);
  assert.equal(store.has('gleamlearn.adminAccessToken'), false);
  assert.equal(res.accountStatus, 'frozen');
  assert.deepEqual(JSON.parse(calls[0].init.body), { email: 'a@x.test', password: 'pw' });
});

test('signIn without a token in the response is a failure and stores nothing', async () => {
  responder = () => json(201, { data: {} });
  await assert.rejects(auth.signIn('a@x.test', 'pw'));
  assert.equal(store.has('accessToken'), false);
});

test('signUp sends the backend contract (no UI-only fields) and stores the returned token', async () => {
  responder = () => json(201, { accessToken: TOKEN, data: { id: 'u1', email: 'a@x.test' } });
  await auth.signUp({ fullName: ' Ada ', username: 'ada', email: 'a@x.test', password: 'Secret1!', confirmPassword: 'Secret1!', dateOfBirth: '' });
  assert.deepEqual(JSON.parse(calls[0].init.body), { fullName: 'Ada', username: 'ada', email: 'a@x.test', password: 'Secret1!', confirmPassword: 'Secret1!' });
  assert.equal(store.get('accessToken'), TOKEN);
});

test('verifyEmail sends { email, token }', async () => {
  responder = () => json(201, { message: 'ok' });
  await auth.verifyEmail(' a@x.test ', ' 123456 ');
  assert.deepEqual(JSON.parse(calls[0].init.body), { email: 'a@x.test', token: '123456' });
});

test('signOut clears the token even when the logout request fails', async () => {
  store.set('accessToken', TOKEN);
  responder = () => { throw new TypeError('offline'); };
  await auth.signOut();
  assert.equal(store.has('accessToken'), false);
});

test('safeNextPath allows only same-site, non-auth paths', () => {
  assert.equal(auth.safeNextPath('/learn/abc'), '/learn/abc');
  for (const bad of [null, '', 'https://evil.test', '//evil.test', '/\\evil.test', '/auth/login', '/admin/users', 'learn']) {
    assert.equal(auth.safeNextPath(bad), '/dashboard', String(bad));
  }
});

test('sign-in error messages never reveal whether the email exists', () => {
  assert.equal(auth.signInErrorMessage(new ApiError('Invalid email or password', 401, 'unauthorized')), 'Incorrect email or password.');
  assert.match(auth.signInErrorMessage(new ApiError('x', 403, 'forbidden', [], 'ACCOUNT_RESTRICTED')), /restricted/);
  assert.match(auth.signInErrorMessage(new ApiError('x', 503, 'ai_unavailable')), /temporarily unavailable/);
  assert.match(auth.signInErrorMessage(new ApiError('x', 429, 'rate_limited')), /Too many attempts/);
});

test('sign-up and verification error messages', () => {
  assert.equal(auth.signUpErrorMessage(new ApiError('Email or username is already registered', 409, 'conflict')).field, 'email');
  assert.equal(auth.signUpErrorMessage(new ApiError('password must be longer than or equal to 6 characters', 400, 'validation')).field, 'password');
  assert.match(auth.verifyErrorMessage(new ApiError('Too many incorrect codes. Please request a new code.', 400, 'validation')), /Send a new code/);
  assert.match(auth.verifyErrorMessage(new ApiError('Invalid or expired verification code', 400, 'validation')), /incorrect or has expired/);
});

const answers = (o = {}) => ({
  eduType: 'university',
  academic: { institution: 'OAU', facultyOrClass: 'Technology', departmentOrSubject: 'CSE', levelOrTerm: '200 Level', semester: 'First Semester' },
  preferences: { speed: 'balanced', studyTime: 'Evening', duration: '30 mins', explanationStyle: 'mixed' },
  goal: { goal: 'Master my courses', targetScore: 'A', targetDate: 'End of Semester' },
  companion: { name: 'Gleam AI', gender: 'Neutral', personality: 'Encouraging', teachingStyle: 'Socratic', voice: 'Friendly', appearance: 'Hologram' },
  ...o,
});

test('onboarding (university) maps to the stored backend fields and lists what is not stored', () => {
  const r = buildOnboardingRequests(answers());
  assert.deepEqual(r.academicProfile, {
    educationType: 'University', university: 'OAU', faculty: 'Technology', department: 'CSE', levelOrClass: '200 Level',
    examAimOrGoals: 'Master my courses, target A, by End of Semester',
  });
  assert.deepEqual(r.preferences, { preferredStudyTime: 'Evening' });
  assert.equal(r.companion.name, 'Gleam AI');
  assert.ok(r.notStored.includes('Semester') && r.notStored.includes('Learning speed'));
});

test('onboarding (secondary) maps school and class; term and subjects are reported as not stored', () => {
  const r = buildOnboardingRequests(answers({ eduType: 'secondary', academic: { institution: 'FGC', facultyOrClass: 'SS3', departmentOrSubject: 'Maths', levelOrTerm: '2025/2026', semester: '' } }));
  assert.equal(r.academicProfile.secondarySchool, 'FGC');
  assert.equal(r.academicProfile.levelOrClass, 'SS3');
  assert.equal('university' in r.academicProfile, false);
  assert.ok(r.notStored.includes('Core subjects') && r.notStored.includes('Academic session / term'));
});

test('onboarding drops empty answers instead of sending blanks', () => {
  const r = buildOnboardingRequests(answers({ academic: { institution: ' ', facultyOrClass: '', departmentOrSubject: '', levelOrTerm: '', semester: '' } }));
  assert.deepEqual(Object.keys(r.academicProfile).sort(), ['educationType', 'examAimOrGoals']);
});

test('signUp and resendVerification surface the backend delivery state', async () => {
  responder = () => json(201, { accessToken: TOKEN, verificationEmail: 'failed', data: { id: 'u1', email: 'a@x.test' } });
  const res = await auth.signUp({ fullName: 'Ada', username: 'ada', email: 'a@x.test', password: 'Secret1!', confirmPassword: 'Secret1!' });
  assert.equal(res.verificationEmail, 'failed');
  assert.equal(res.user.id, 'u1');
  responder = () => json(201, { message: 'x', verificationEmail: 'pending' });
  assert.equal(await auth.resendVerification('a@x.test'), 'pending');
  responder = () => json(201, { message: 'older backend' });
  assert.equal(await auth.resendVerification('a@x.test'), 'unknown');
});

test('delivery notices never claim an email was sent when it was not', () => {
  assert.equal(auth.deliveryNotice('sent').tone, 'success');
  assert.equal(auth.deliveryNotice('failed').tone, 'warning');
  assert.doesNotMatch(auth.deliveryNotice('failed').text, /we sent/i);
  assert.doesNotMatch(auth.deliveryNotice('pending').text, /we sent/i);
  assert.equal(auth.deliveryOf({ verificationEmail: 'bogus' }), 'unknown');
});
