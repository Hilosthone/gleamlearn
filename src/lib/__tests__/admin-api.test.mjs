import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Minimal browser globals for lib/session.ts (localStorage + window events)
const store = new Map();
const events = [];
globalThis.window = {
  localStorage: {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  },
  dispatchEvent: (e) => events.push(e),
};

const calls = [];
let responder = () => new Response('{}', { status: 200 });
globalThis.fetch = async (url, init) => {
  calls.push({ url, init });
  return responder(url, init);
};

const { adminAuthApi, adminUsersApi, adminDashboardApi, adminSettingsApi, adminContentApi } = await import('../admin-api.ts');
const { isActivePath, visibleNavItems, ADMIN_NAV } = await import('../../components/admin/admin-nav.ts');

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

beforeEach(() => {
  store.clear();
  events.length = 0;
  calls.length = 0;
});

test('login stores the token under the admin key only, never the learner key', async () => {
  responder = () => json(201, { status: 'success', accessToken: 'admin-tok', data: { id: 'a1', email: 'a@x', role: 'Super Admin', isActive: true } });
  await adminAuthApi.login('a@x', 'pw');
  assert.equal(store.get('gleamlearn.adminAccessToken'), 'admin-tok');
  assert.equal(store.has('accessToken'), false);
  assert.match(calls[0].url, /\/admin\/auth\/login$/);
  assert.equal(calls[0].init.method, 'POST');
});

test('admin requests send the admin token, not a learner token', async () => {
  store.set('accessToken', 'learner-tok');
  store.set('gleamlearn.adminAccessToken', 'admin-tok');
  responder = () => json(200, { status: 'success', data: { users: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } } });
  await adminUsersApi.list({ page: 2, limit: 20, search: '  ada ' });
  assert.equal(calls[0].init.headers.Authorization, 'Bearer admin-tok');
  assert.match(calls[0].url, /\/admin\/users\?page=2&limit=20&search=ada$/);
});

test('a 401 clears the admin token and broadcasts an admin session-expired event', async () => {
  store.set('gleamlearn.adminAccessToken', 'stale');
  store.set('accessToken', 'learner-tok');
  responder = () => json(401, { statusCode: 401, message: 'Admin authentication required' });
  await assert.rejects(adminDashboardApi.overview(), (err) => err.kind === 'unauthorized');
  assert.equal(store.has('gleamlearn.adminAccessToken'), false);
  assert.equal(store.get('accessToken'), 'learner-tok', 'learner session untouched');
  assert.equal(events.length, 1);
  assert.equal(events[0].detail.scope, 'admin');
});

test('503 (admin auth not configured) is reported as an error but keeps the token', async () => {
  store.set('gleamlearn.adminAccessToken', 'tok');
  responder = () => json(503, { statusCode: 503, message: 'Admin authentication is not configured.' });
  await assert.rejects(adminAuthApi.me({ retries: 0 }), (err) => err.status === 503);
  assert.equal(store.get('gleamlearn.adminAccessToken'), 'tok');
});

test('a content delete is a single DELETE request, never retried', async () => {
  store.set('gleamlearn.adminAccessToken', 'tok');
  responder = () => json(503, { statusCode: 503, message: 'down' });
  await assert.rejects(adminContentApi.deleteCourse('c/1'), (err) => err.status === 503);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].init.method, 'DELETE');
  assert.match(calls[0].url, /\/admin\/content\/courses\/c%2F1$/);
});

test('permanent user deletion is not exposed by the client (backend returns 501)', () => {
  assert.equal(adminUsersApi.remove, undefined);
});

test('suspend / restrict use the enforced backend endpoints and are not retried', async () => {
  store.set('gleamlearn.adminAccessToken', 'tok');
  responder = (url) => json(200, { status: 'success', message: 'ok', data: { url } });
  await adminUsersApi.setSuspended('u1', true);
  await adminUsersApi.setSuspended('u1', false);
  await adminUsersApi.setRestricted('u1', true, 'Spam');
  await adminUsersApi.setRestricted('u1', false);
  assert.deepEqual(
    calls.map((c) => [c.init.method, c.url.replace(/^.*\/admin/, '/admin')]),
    [
      ['PATCH', '/admin/users/u1/suspend'],
      ['PATCH', '/admin/users/u1/unsuspend'],
      ['POST', '/admin/users/u1/restrict'],
      ['POST', '/admin/users/u1/unrestrict'],
    ],
  );
  assert.deepEqual(JSON.parse(calls[2].init.body), { reason: 'Spam' });
  assert.equal(calls[3].init.body, undefined);

  calls.length = 0;
  responder = () => json(503, { statusCode: 503, message: 'down' });
  await assert.rejects(adminUsersApi.setSuspended('u1', true));
  assert.equal(calls.length, 1);
});

test('content API uses /admin/content paths, methods and bodies', async () => {
  store.set('gleamlearn.adminAccessToken', 'tok');
  responder = () => json(200, { status: 'success', data: {} });
  await adminContentApi.listCourses({ page: 2, limit: 20, search: ' bio ' });
  await adminContentApi.getCourse('c1');
  await adminContentApi.createCourse({ title: 'Bio', track: 'Secondary' });
  await adminContentApi.updateCourse('c1', { level: 'SS 2' });
  await adminContentApi.createTopic('c1', { title: 'Cells' });
  await adminContentApi.updateTopic('t1', { order: 2 });
  await adminContentApi.deleteTopic('t1');
  await adminContentApi.createLesson('c1', { title: 'L1' });
  await adminContentApi.updateLesson('l1', { title: 'L2' });
  await adminContentApi.deleteLesson('l1');
  assert.deepEqual(
    calls.map((c) => [c.init.method, c.url.replace(/^.*\/admin/, '/admin')]),
    [
      ['GET', '/admin/content/courses?page=2&limit=20&search=bio'],
      ['GET', '/admin/content/courses/c1'],
      ['POST', '/admin/content/courses'],
      ['PATCH', '/admin/content/courses/c1'],
      ['POST', '/admin/content/courses/c1/topics'],
      ['PATCH', '/admin/content/topics/t1'],
      ['DELETE', '/admin/content/topics/t1'],
      ['POST', '/admin/content/courses/c1/lessons'],
      ['PATCH', '/admin/content/lessons/l1'],
      ['DELETE', '/admin/content/lessons/l1'],
    ],
  );
  assert.deepEqual(JSON.parse(calls[2].init.body), { title: 'Bio', track: 'Secondary' });
  assert.deepEqual(JSON.parse(calls[5].init.body), { order: 2 });
});

test('409 from a protected delete is a "conflict" error carrying the backend explanation', async () => {
  store.set('gleamlearn.adminAccessToken', 'tok');
  responder = () => json(409, { statusCode: 409, message: 'This course still has topics, lessons or enrollments.', topicCount: 2 });
  await assert.rejects(adminContentApi.deleteCourse('c1'), (err) => err.kind === 'conflict' && /still has topics/.test(err.message));
});

test('logout clears the admin token even when the request fails', async () => {
  store.set('gleamlearn.adminAccessToken', 'tok');
  responder = () => { throw new TypeError('offline'); };
  await adminAuthApi.logout();
  assert.equal(store.has('gleamlearn.adminAccessToken'), false);
});

test('login without an accessToken in the response is treated as a failure', async () => {
  responder = () => json(201, { status: 'success', data: {} });
  await assert.rejects(adminAuthApi.login('a@x', 'pw'));
  assert.equal(store.has('gleamlearn.adminAccessToken'), false);
});

test('admin navigation active-state matching', () => {
  assert.equal(isActivePath('/admin', '/admin'), true);
  assert.equal(isActivePath('/admin/users', '/admin'), false);
  assert.equal(isActivePath('/admin/users/123', '/admin/users'), true);
  assert.equal(isActivePath('/admin/users-archive', '/admin/users'), false);
});

test('verified counts, settings and verification use the documented admin endpoints', async () => {
  store.set('gleamlearn.adminAccessToken', 'tok');
  responder = (url) => json(200, { status: 'success', data: { url } });
  await adminDashboardApi.counts();
  await adminSettingsApi.get();
  await adminUsersApi.setEmailVerified('u1', true);
  await adminUsersApi.setEmailVerified('u1', false);
  assert.match(calls[0].url, /\/admin\/dashboard\/counts$/);
  assert.match(calls[1].url, /\/admin\/settings$/);
  assert.equal(calls[1].init.method, 'GET');
  assert.match(calls[2].url, /\/admin\/users\/u1\/verify$/);
  assert.equal(calls[2].init.method, 'PATCH');
  assert.match(calls[3].url, /\/admin\/users\/u1\/unverify$/);
});

test('a 403 from the backend is a typed "forbidden" error and keeps the session', async () => {
  store.set('gleamlearn.adminAccessToken', 'tok');
  responder = () => json(403, { statusCode: 403, message: 'Your admin role does not allow this operation.' });
  await assert.rejects(adminUsersApi.setSuspended('u1', true), (err) => err.kind === 'forbidden' && err.status === 403);
  assert.equal(store.get('gleamlearn.adminAccessToken'), 'tok');
  assert.equal(events.length, 0);
});

test('navigation shows only sections the role is permitted to use', () => {
  const contentAdmin = new Set(['admin.self', 'content.manage']);
  const names = visibleNavItems(ADMIN_NAV, (p) => contentAdmin.has(p)).map((i) => i.name);
  assert.deepEqual(names, ['Overview', 'Learning content', 'Assessments']);
  const superAdmin = visibleNavItems(ADMIN_NAV, () => true);
  assert.equal(superAdmin.length, ADMIN_NAV.length);
  assert.deepEqual(visibleNavItems(ADMIN_NAV, () => false), []);
});
