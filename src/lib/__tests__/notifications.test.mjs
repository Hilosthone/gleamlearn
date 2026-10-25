import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  filterNotifications,
  relativeTime,
  toNotification,
  toNotificationList,
  unreadCount,
} from '../notifications.ts';
import { invalidateLearnerStats, sharedLearnerStats } from '../learning.ts';

const row = (over = {}) => ({
  id: 'n1',
  userId: 'u1',
  title: 'Welcome',
  message: 'Hello',
  type: 'system',
  isRead: false,
  createdAt: '2026-10-25T10:00:00.000Z',
  ...over,
});

test('backend rows map to typed notifications; malformed rows are dropped; unknown types become general', () => {
  assert.deepEqual(toNotification(row()), {
    id: 'n1',
    title: 'Welcome',
    message: 'Hello',
    type: 'system',
    isRead: false,
    createdAt: '2026-10-25T10:00:00.000Z',
  });
  assert.equal(toNotification(row({ type: 'promo' })).type, 'general');
  assert.equal(toNotification({ title: 'no id' }), null);
  assert.equal(toNotification(null), null);
});

test('the list accepts { data } or a bare array and is newest first', () => {
  const res = { status: 'success', data: [row({ id: 'old', createdAt: '2026-10-01T00:00:00Z' }), row({ id: 'new' }), { junk: true }] };
  assert.deepEqual(toNotificationList(res).map((n) => n.id), ['new', 'old']);
  assert.deepEqual(toNotificationList([row()]).map((n) => n.id), ['n1']);
  assert.deepEqual(toNotificationList({ status: 'success' }), []);
});

test('filters and the unread count use the real fields', () => {
  const items = toNotificationList([row({ id: 'a', type: 'ai' }), row({ id: 'b', isRead: true, type: 'reminder' }), row({ id: 'c' })]);
  assert.equal(unreadCount(items), 2);
  assert.deepEqual(filterNotifications(items, 'unread').map((n) => n.id).sort(), ['a', 'c']);
  assert.deepEqual(filterNotifications(items, 'reminder').map((n) => n.id), ['b']);
  assert.equal(filterNotifications(items, 'all').length, 3);
});

test('relative times', () => {
  const now = Date.parse('2026-10-25T12:00:00Z');
  assert.equal(relativeTime('2026-10-25T11:59:30Z', now), 'just now');
  assert.equal(relativeTime('2026-10-25T11:55:00Z', now), '5 min ago');
  assert.equal(relativeTime('2026-10-25T09:00:00Z', now), '3 h ago');
  assert.equal(relativeTime('2026-10-23T12:00:00Z', now), '2 d ago');
  assert.equal(relativeTime('not a date', now), '');
});

test('learner stats: concurrent callers share one load; failures are not cached; invalidation forces a reload', async () => {
  invalidateLearnerStats();
  let loads = 0;
  const load = async () => {
    loads += 1;
    return { xp: null, coins: null, streak: null };
  };
  const t = 1_000_000;
  const [a, b] = await Promise.all([sharedLearnerStats(t, load), sharedLearnerStats(t + 100, load)]);
  assert.equal(loads, 1, 'Navbar and dashboard share one request');
  assert.equal(a, b);
  await sharedLearnerStats(t + 20_000, load);
  assert.equal(loads, 2, 'reloaded after the max age');
  invalidateLearnerStats();
  await sharedLearnerStats(t + 20_100, load);
  assert.equal(loads, 3, 'reloaded after invalidation');

  invalidateLearnerStats();
  let fail = true;
  const flaky = async () => {
    loads += 1;
    if (fail) throw new Error('down');
    return { xp: null, coins: null, streak: null };
  };
  await assert.rejects(sharedLearnerStats(t, flaky));
  fail = false;
  await sharedLearnerStats(t + 1, flaky);
  assert.equal(loads, 5, 'a failed load is retried immediately, not served from cache');
  invalidateLearnerStats();
});
