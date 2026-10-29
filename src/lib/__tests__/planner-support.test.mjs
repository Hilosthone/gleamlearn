import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';

globalThis.window = {
  localStorage: { getItem: () => 'learner-token-for-tests-0123456789', setItem: () => {}, removeItem: () => {} },
  dispatchEvent: () => true,
};
const calls = [];
let responder = () => new Response('{}', { status: 200 });
globalThis.fetch = async (url, init) => {
  calls.push({ url, init });
  return responder(url, init);
};

const P = await import('../planner.ts');
const S = await import('../support.ts');
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const unavailable = () => json(501, { statusCode: 501, error: 'Not Implemented', code: 'FEATURE_UNAVAILABLE', feature: 'X', message: 'X is not available yet.' });

beforeEach(() => {
  calls.length = 0;
});

const item = (id, date, extra = {}) => ({ id, title: id, scheduledDate: date, startTime: '', isCompleted: false, isSkipped: false, ...extra });

test('plan items: state from the flags, sorted by date then time, malformed rows dropped', () => {
  const out = P.toPlanItems({ schedule: [item('b', '2026-10-27', { startTime: '10:00' }), item('a', '2026-10-27', { startTime: '09:00', isCompleted: true }), item('c', '2026-10-20', { isSkipped: true }), { id: 'x', scheduledDate: 'soon' }] });
  assert.deepEqual(out.map((i) => [i.id, i.state]), [['c', 'skipped'], ['a', 'done'], ['b', 'planned']]);
});

test('grouping: overdue only for unfinished past items; upcoming by date', () => {
  const items = P.toPlanItems({ schedule: [item('old-planned', '2026-10-20'), item('old-done', '2026-10-21', { isCompleted: true }), item('now', '2026-10-26'), item('next1', '2026-10-28'), item('next2', '2026-10-28'), item('later', '2026-11-02')] });
  const g = P.groupPlan(items, '2026-10-26');
  assert.deepEqual(g.overdue.map((i) => i.id), ['old-planned']);
  assert.deepEqual(g.past.map((i) => i.id), ['old-done']);
  assert.deepEqual(g.today.map((i) => i.id), ['now']);
  assert.deepEqual(g.upcoming.map((d) => [d.date, d.items.length]), [['2026-10-28', 2], ['2026-11-02', 1]]);
});

test('draft validation and payload (empty times are omitted)', () => {
  const d = { title: ' Cells ', date: '2026-11-02', startTime: '', endTime: '', activityType: 'revision' };
  assert.equal(P.validatePlanDraft(d), null);
  assert.deepEqual(P.planPayload(d), { title: 'Cells', scheduledDate: '2026-11-02', activityType: 'revision' });
  assert.match(P.validatePlanDraft({ ...d, title: ' ' }), /what you will study/);
  assert.match(P.validatePlanDraft({ ...d, date: '' }), /date/);
  assert.match(P.validatePlanDraft({ ...d, startTime: '10:00', endTime: '09:30' }), /after the start/);
});

test('adding a session posts to /planner; moving missed sessions reports the count', async () => {
  responder = (url) => (url.endsWith('/regenerate') ? json(201, { missedSessionsAdjusted: 3 }) : json(201, { item: {} }));
  await P.addPlanItem({ title: 'T', date: '2026-11-02', startTime: '09:00', endTime: '10:00', activityType: 'study' });
  assert.match(calls[0].url, /\/planner$/);
  assert.equal(calls[0].init.method, 'POST');
  assert.deepEqual(JSON.parse(calls[0].init.body), { title: 'T', scheduledDate: '2026-11-02', activityType: 'study', startTime: '09:00', endTime: '10:00' });
  assert.equal(await P.rescheduleMissed(), 3);
});

test('goals: percent from current/target (100 when completed), open goals first; create omits empty fields', async () => {
  const g = P.toGoals({ goals: [{ id: 'g1', title: 'Done', targetValue: 10, currentValue: 2, isCompleted: true }, { id: 'g2', title: 'Half', targetValue: 10, currentValue: 5 }, { id: 'g3', title: 'Zero', targetValue: 0 }] });
  assert.deepEqual(g.map((x) => [x.id, x.percent]), [['g2', 50], ['g3', 0], ['g1', 100]]);
  responder = () => json(201, {});
  await P.createGoal({ title: ' Read ', description: ' ', targetDate: '' });
  assert.deepEqual(JSON.parse(calls[0].init.body), { title: 'Read' });
});

test('reports: available when /reports/me answers; unavailable on 501; other errors propagate', async () => {
  responder = () => json(200, []);
  assert.equal(await S.reportsAvailable(), true);
  responder = unavailable;
  assert.equal(await S.reportsAvailable(), false);
  responder = () => json(500, { message: 'down' });
  await assert.rejects(S.reportsAvailable());
});

test('problem reports and feedback send the backend DTO shapes', async () => {
  responder = () => json(201, {});
  await S.submitProblem('Account or sign-in', '  I cannot sign in  ');
  await S.submitFeedback(4.6, ' Great ');
  assert.deepEqual(JSON.parse(calls[0].init.body), { type: 'OTHER', reason: 'Account or sign-in', details: 'I cannot sign in' });
  assert.deepEqual(JSON.parse(calls[1].init.body), { rating: 5, message: 'Great' });
});

test('mailto fallback encodes subject and body', () => {
  assert.equal(S.mailtoHref('Feedback (5/5)', 'a & b\nc'), 'mailto:gleamlearn.ai@gmail.com?subject=Feedback%20(5%2F5)&body=a%20%26%20b%0Ac');
});

test('subscription status: 501 → unavailable, inactive → none, active → plan name', async () => {
  responder = unavailable;
  assert.deepEqual(await S.loadSubscriptionStatus(), { kind: 'unavailable' });
  responder = () => json(200, { active: false });
  assert.deepEqual(await S.loadSubscriptionStatus(), { kind: 'none' });
  responder = () => json(200, { active: true, subscription: { plan: { name: 'Termly' }, endDate: '2027-01-01' } });
  assert.deepEqual(await S.loadSubscriptionStatus(), { kind: 'active', planName: 'Termly', endsAt: '2027-01-01' });
});

test('my reports: server fields only, status upper-cased; question reports post to /questions/:id/report', async () => {
  const rows = [
    { id: 'r1', type: 'OTHER', target: 'QUESTION', targetId: 'q1', reason: 'Problem with a question', details: 'Key is wrong', status: 'resolved', createdAt: '2026-10-29T10:00:00Z' },
    { reason: 'no id' },
  ];
  assert.deepEqual(S.toMyReports(rows), [{ id: 'r1', reason: 'Problem with a question', details: 'Key is wrong', target: 'QUESTION', status: 'RESOLVED', createdAt: '2026-10-29T10:00:00Z' }]);
  assert.deepEqual(S.toMyReports({ not: 'a list' }), []);
  responder = () => json(201, { id: 'r2' });
  await S.reportQuestion('q 9', '  Option C is missing  ');
  const last = calls.at(-1);
  assert.match(last.url, /\/questions\/q%209\/report$/, 'ids from external providers are encoded');
  assert.deepEqual(JSON.parse(last.init.body), { type: 'OTHER', reason: 'Problem with a question', details: 'Option C is missing' });
});

test('goal edits: only changed fields, progress and target as numbers; invalid drafts are refused', () => {
  const [g] = P.toGoals({ goals: [{ id: 'g1', title: 'Past papers', description: '', targetValue: 10, currentValue: 2, targetDate: '2026-12-01' }] });
  assert.deepEqual([g.current, g.target, g.percent], [2, 10, 20]);
  const d = P.goalDraftOf(g);
  assert.deepEqual(P.goalChanges(g, d), { changes: {} });
  assert.deepEqual(P.goalChanges(g, { ...d, current: '6', title: ' Past papers ' }), { changes: { currentValue: 6 } });
  assert.deepEqual(P.goalChanges(g, { ...d, target: '12.5', targetDate: '2026-12-20' }), { changes: { targetValue: 12.5, targetDate: '2026-12-20' } });
  assert.ok('error' in P.goalChanges(g, { ...d, target: '0' }));
  assert.ok('error' in P.goalChanges(g, { ...d, current: '-1' }));
  assert.ok('error' in P.goalChanges(g, { ...d, current: '' }));
  assert.ok('error' in P.goalChanges(g, { ...d, title: '  ' }));
});
