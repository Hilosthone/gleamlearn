import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Browser shims for lib/session.ts (token storage) — the HTTP layer is driven by a fetch mock below.
const store = new Map();
globalThis.window = {
  localStorage: { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) },
  dispatchEvent: () => true,
};
const calls = [];
let responder = () => new Response('{}', { status: 200 });
globalThis.fetch = async (url, init) => {
  calls.push({ url: String(url), init });
  return responder(String(url), init);
};
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const W = await import('../registration/wizard.ts');
const D = await import('../registration/draft.ts');
const S = await import('../registration/submit.ts');

beforeEach(() => {
  store.clear();
  calls.length = 0;
});

const TODAY = new Date(2026, 9, 23);
const base = (o = {}) => ({ ...W.EMPTY_VALUES, exams: [], fullName: 'Ada Lovelace', username: 'ada', email: 'ada@example.test', termsAccepted: true, ...o });
const secrets = { password: 'Secret-123', confirmPassword: 'Secret-123' };

// ---------------- wizard: paths, conditional fields, validation ----------------

test('each path requires only its own education fields', () => {
  assert.ok(W.validateStep('education', base({ path: 'secondary' }), secrets, TODAY).secondaryClass);
  assert.equal(W.validateStep('education', base({ path: 'secondary', secondaryClass: 'SS 2' }), secrets, TODAY).university, undefined);
  assert.ok(W.validateStep('education', base({ path: 'university' }), secrets, TODAY).university);
  assert.deepEqual(W.validateStep('education', base({ path: 'university', university: 'OAU' }), secrets, TODAY), {});
  assert.ok(W.validateStep('education', base({ path: 'exam' }), secrets, TODAY).exams);
  assert.deepEqual(W.validateStep('education', base({ path: 'exam', exams: ['WAEC'] }), secrets, TODAY), {});
});

test('personal and security steps mirror the backend contract', () => {
  const e = W.validateStep('personal', base({ fullName: ' ', username: '', email: 'not-an-email' }), secrets, TODAY);
  assert.ok(e.fullName && e.username && e.email);
  assert.ok(W.validateStep('personal', base({ dateOfBirth: '2030-01-01' }), secrets, TODAY).dateOfBirth);
  assert.ok(W.validateStep('personal', base({ dateOfBirth: '2010-02-31' }), secrets, TODAY).dateOfBirth);
  assert.deepEqual(W.validateStep('personal', base({ dateOfBirth: '2009-05-01' }), secrets, TODAY), {});
  assert.ok(W.validateStep('personal', base({ username: 'x'.repeat(101) }), secrets, TODAY).username);
  const sec = W.validateStep('security', base({ termsAccepted: false }), { password: '12345', confirmPassword: '1234' }, TODAY);
  assert.ok(sec.password && sec.confirmPassword && sec.termsAccepted);
  assert.deepEqual(W.validateStep('security', base(), secrets, TODAY), {});
});

test('review validates everything and points at the first invalid step', () => {
  assert.equal(W.firstInvalidStep(base({ path: 'university', university: 'OAU' }), secrets, TODAY), null);
  assert.equal(W.firstInvalidStep(base({ path: 'university' }), secrets, TODAY), 'education');
  assert.equal(W.firstInvalidStep(base({ path: 'university', university: 'OAU' }), { password: 'a', confirmPassword: 'a' }, TODAY), 'security');
  assert.equal(W.firstInvalidStep(base({ path: null }), secrets, TODAY), 'path');
});

// ---------------- payload construction ----------------

test('secondary payload: Secondary + school fields only', () => {
  const v = base({ path: 'secondary', secondarySchool: 'FGC Lagos', secondaryClass: 'SS 2', secondaryStream: 'Science', university: 'STALE', level: 'STALE', exams: ['STALE'], goals: 'Distinction', preferredStudyTime: 'Evening', country: 'Nigeria' });
  assert.deepEqual(W.buildSignupPayload(v, secrets), {
    fullName: 'Ada Lovelace', username: 'ada', email: 'ada@example.test', password: 'Secret-123', confirmPassword: 'Secret-123',
    country: 'Nigeria', preferredStudyTime: 'Evening', examAimOrGoals: 'Goals: Distinction',
    educationType: 'Secondary', secondarySchool: 'FGC Lagos', secondaryClass: 'SS 2', secondaryStream: 'Science',
  });
});

test('university payload: University + university fields only, no stale secondary values', () => {
  const p = W.buildSignupPayload(base({ path: 'university', university: 'OAU', faculty: 'Tech', department: 'CSE', courseOfStudy: 'CS', level: '200 Level', secondaryClass: 'STALE', secondarySchool: 'STALE' }), secrets);
  assert.equal(p.educationType, 'University');
  assert.equal(p.level, '200 Level');
  assert.equal('secondaryClass' in p, false);
  assert.equal('secondarySchool' in p, false);
});

test('exam payload: NOT misclassified (no educationType, no school/university), exams kept in examAimOrGoals', () => {
  const p = W.buildSignupPayload(base({ path: 'exam', exams: ['WAEC', 'jamb/utme', 'WAEC '], examTimeframe: 'May 2027', subjects: 'Maths, Physics', university: 'STALE', secondaryClass: 'STALE', goals: '300+' }), secrets);
  assert.equal('educationType' in p, false);
  for (const k of ['university', 'secondaryClass', 'secondarySchool', 'level']) assert.equal(k in p, false, k);
  assert.equal(p.examAimOrGoals, 'Preparing for: WAEC, jamb/utme · Exam timeframe: May 2027 · Subjects: Maths, Physics · Goals: 300+');
});

test('empty optional fields are omitted, not sent as empty strings or null', () => {
  const p = W.buildSignupPayload(base({ path: 'university', university: 'OAU' }), secrets);
  assert.deepEqual(Object.keys(p).sort(), ['confirmPassword', 'educationType', 'email', 'fullName', 'password', 'university', 'username']);
});

test('review shows only the selected path and never the password', () => {
  const sections = W.reviewSections(base({ path: 'exam', exams: ['NECO'], university: 'STALE' }));
  const text = JSON.stringify(sections);
  assert.match(text, /NECO/);
  assert.doesNotMatch(text, /STALE|Secret-123/);
});

// ---------------- drafts ----------------

const NOW = Date.UTC(2026, 9, 23, 12);
const memStore = () => { const m = new Map(); return { m, getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: (k) => m.delete(k) }; };

test('a draft never contains passwords, tokens or terms consent', () => {
  const v = base({ path: 'secondary', secondaryClass: 'SS 1' });
  const raw = D.serializeDraft({ ...v, password: 'Secret-123', confirmPassword: 'Secret-123', accessToken: 'tok' }, 'security', true, NOW);
  assert.doesNotMatch(raw, /Secret-123|tok|password/i);
  assert.equal(JSON.parse(raw).values.termsAccepted, false);
});

test('round trip restores path, values and step (review resumes at goals)', () => {
  const v = base({ path: 'university', university: 'OAU', exams: ['A'] });
  const parsed = D.parseDraft(D.serializeDraft(v, 'review', false, NOW), NOW + 1000);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.draft.values.path, 'university');
  assert.equal(parsed.draft.values.university, 'OAU');
  assert.equal(parsed.draft.step, 'goals');
  assert.equal(parsed.draft.values.termsAccepted, false);
});

test('expired, malformed, future-version and tampered drafts are rejected safely', () => {
  const good = D.serializeDraft(base({ path: 'exam' }), 'education', true, NOW);
  assert.deepEqual(D.parseDraft(good, NOW + D.DRAFT_TTL_MS + 1), { ok: false, reason: 'expired' });
  assert.deepEqual(D.parseDraft('{not json', NOW), { ok: false, reason: 'malformed' });
  assert.deepEqual(D.parseDraft(JSON.stringify({ version: 99, savedAt: NOW, values: {} }), NOW), { ok: false, reason: 'unsupported-version' });
  assert.deepEqual(D.parseDraft(null, NOW), { ok: false, reason: 'none' });
  const tampered = D.parseDraft(JSON.stringify({ version: 1, savedAt: NOW, step: 'education', values: { path: 'admin', fullName: 42, exams: [1, 'WAEC'] } }), NOW);
  assert.equal(tampered.ok, true);
  assert.equal(tampered.draft.values.path, null);
  assert.equal(tampered.draft.step, 'path'); // no valid path → restart at step 1
  assert.equal(tampered.draft.values.fullName, '');
  assert.deepEqual(tampered.draft.values.exams, ['WAEC']);
});

test('device storage only when opted in; opting out removes the device copy; clear removes both', () => {
  const session = memStore(), local = memStore();
  const raw = D.serializeDraft(base({ path: 'exam' }), 'personal', false, NOW);
  D.saveDraft({ session, local }, raw, false);
  assert.equal(session.m.has(D.DRAFT_KEY), true);
  assert.equal(local.m.has(D.DRAFT_KEY), false);
  D.saveDraft({ session, local }, raw, true);
  assert.equal(local.m.has(D.DRAFT_KEY), true);
  D.saveDraft({ session, local }, raw, false);
  assert.equal(local.m.has(D.DRAFT_KEY), false);
  D.clearDraft({ session, local });
  assert.equal(session.m.size + local.m.size, 0);
});

test('loadDraft prefers this tab, falls back to the device, and deletes broken copies', () => {
  const session = memStore(), local = memStore();
  local.setItem(D.DRAFT_KEY, D.serializeDraft(base({ path: 'university' }), 'education', true, NOW));
  session.setItem(D.DRAFT_KEY, '{broken');
  const parsed = D.loadDraft({ session, local }, NOW);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.draft.values.path, 'university');
  assert.equal(session.m.has(D.DRAFT_KEY), false, 'malformed copy removed');
  assert.equal(D.draftHasContent(W.EMPTY_VALUES), false);
});

test('storage that throws (private mode) never breaks the wizard', () => {
  const broken = { getItem: () => { throw new Error('denied'); }, setItem: () => { throw new Error('denied'); }, removeItem: () => { throw new Error('denied'); } };
  assert.doesNotThrow(() => D.saveDraft({ session: broken, local: broken }, '{}', true));
  assert.deepEqual(D.loadDraft({ session: broken, local: broken }, NOW), { ok: false, reason: 'none' });
  assert.doesNotThrow(() => D.clearDraft({ session: broken, local: broken }));
});

// ---------------- submission & recovery (real client code, mocked HTTP) ----------------

const TOKEN = 'header.payload.signature-long-enough';
const body = () => W.buildSignupPayload(base({ path: 'university', university: 'OAU' }), secrets);

test('one POST /auth/signup with exactly the built payload; 201 → created with delivery state', async () => {
  responder = () => json(201, { accessToken: TOKEN, verificationEmail: 'sent', data: { id: 'u1' } });
  const r = await S.submitRegistration(body());
  assert.deepEqual(r, { kind: 'created', verificationEmail: 'sent' });
  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /\/auth\/signup$/);
  assert.deepEqual(JSON.parse(calls[0].init.body), body());
  assert.equal(store.get('accessToken'), TOKEN);
});

test('400 → field errors mapped to the right step', async () => {
  responder = () => json(400, { statusCode: 400, message: ['email must be an email', 'password must be longer than or equal to 6 characters'] });
  const r = await S.submitRegistration(body());
  assert.equal(r.kind, 'invalid');
  assert.ok(r.fieldErrors.email && r.fieldErrors.password);
  assert.equal(r.step, 'personal');
});

test('409 → exists (no session stored); 429 → rate limited; 503/500 → unavailable', async () => {
  responder = () => json(409, { statusCode: 409, message: 'Email or username is already registered' });
  assert.equal((await S.submitRegistration(body())).kind, 'exists');
  assert.equal(store.has('accessToken'), false);
  responder = () => json(429, { statusCode: 429, message: 'ThrottlerException: Too Many Requests' });
  assert.equal((await S.submitRegistration(body())).kind, 'rate_limited');
  responder = () => json(503, { statusCode: 503, message: 'Learner authentication is not configured.' });
  assert.equal((await S.submitRegistration(body())).kind, 'unavailable');
  responder = () => json(500, { statusCode: 500, message: 'Internal server error' });
  assert.equal((await S.submitRegistration(body())).kind, 'unavailable');
});

test('network failure → uncertain, and the request is NOT retried automatically', async () => {
  responder = () => { throw new TypeError('Failed to fetch'); };
  const r = await S.submitRegistration(body());
  assert.equal(r.kind, 'uncertain');
  assert.equal(calls.length, 1);
});

test('reconcile: sign-in works → the account was created; 401 → not created (safe to retry)', async () => {
  responder = () => json(201, { accessToken: TOKEN, accountStatus: 'active', data: { id: 'u1' } });
  assert.deepEqual(await S.reconcile('ada@example.test', 'Secret-123'), { kind: 'created' });
  assert.match(calls.at(-1).url, /\/auth\/login$/);
  responder = () => json(401, { statusCode: 401, message: 'Invalid email or password' });
  assert.deepEqual(await S.reconcile('ada@example.test', 'Secret-123'), { kind: 'not_created' });
  responder = () => { throw new TypeError('offline'); };
  assert.equal((await S.reconcile('ada@example.test', 'Secret-123')).kind, 'still_unknown');
});

test('unexpected success body without a token is not treated as a session', async () => {
  responder = () => json(201, { message: 'ok' });
  const r = await S.submitRegistration(body());
  assert.notEqual(r.kind, 'created');
  assert.equal(store.has('accessToken'), false);
});

// ---------------- onboarding after registration ----------------
const O = await import('../onboarding-profile.ts');

test('onboarding skips what registration already collected', () => {
  assert.deepEqual(O.onboardingPlan(null), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(O.onboardingPlan({ educationType: 'University', university: 'OAU', preferredStudyTime: 'Evening', examAimOrGoals: 'Goals: first class' }), [5, 6]);
  assert.deepEqual(O.onboardingPlan({ examAimOrGoals: 'Preparing for: WAEC' }), [3, 5, 6]); // exam learner: no educationType, still recognised
  assert.deepEqual(O.onboardingPlan({ educationType: 'Secondary', secondaryClass: 'SS 2' }), [3, 4, 5, 6]);
});

test('answers from skipped steps are never sent (no overwriting registration data with defaults)', () => {
  const req = O.buildOnboardingRequests({
    eduType: 'university',
    academic: { institution: 'DEFAULT', facultyOrClass: '', departmentOrSubject: '', levelOrTerm: '', semester: '' },
    preferences: { speed: 'balanced', studyTime: 'Evening', duration: '30 mins', explanationStyle: 'mixed' },
    goal: { goal: 'Master my courses', targetScore: '', targetDate: '' },
    companion: { name: 'Gleam AI', gender: '', personality: '', teachingStyle: '', voice: '', appearance: '' },
  });
  const onlyCompanion = O.onlyShownAnswers(req, [5, 6]);
  assert.deepEqual(onlyCompanion.academicProfile, {});
  assert.deepEqual(onlyCompanion.preferences, {});
  assert.equal(onlyCompanion.companion.name, 'Gleam AI');
  const withGoal = O.onlyShownAnswers(req, [3, 4, 5, 6]);
  assert.deepEqual(withGoal.academicProfile, { examAimOrGoals: 'Master my courses' });
  assert.equal(withGoal.preferences.preferredStudyTime, 'Evening');
});

test('the "other" onboarding choice no longer sends an undocumented educationType', () => {
  const req = O.buildOnboardingRequests({
    eduType: 'other',
    academic: { institution: '', facultyOrClass: '', departmentOrSubject: '', levelOrTerm: '', semester: '' },
    preferences: { speed: '', studyTime: '', duration: '', explanationStyle: '' },
    goal: { goal: '', targetScore: '', targetDate: '' },
    companion: { name: '', gender: '', personality: '', teachingStyle: '', voice: '', appearance: '' },
  });
  assert.equal('educationType' in req.academicProfile, false);
});

test('409 "Passwords do not match" is a field error on the security step, not "account exists"', async () => {
  responder = () => json(409, { statusCode: 409, message: 'Passwords do not match', error: 'Conflict' });
  const r = await S.submitRegistration(body());
  assert.equal(r.kind, 'invalid');
  assert.equal(r.step, 'security');
  assert.ok(r.fieldErrors.confirmPassword);
});
