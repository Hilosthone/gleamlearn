import { test } from 'node:test';
import assert from 'node:assert/strict';
import { percentUsed, toUsage } from '../usage.ts';

test('usage: enforced limits get a remaining count; uncapped ones stay null; malformed quotas are dropped; stable order', () => {
  const q = toUsage({
    plan: null,
    quotas: {
      quizzes: { label: 'Quizzes started today', used: 4, limit: null, remaining: null, period: 'day', resetAt: '2026-10-29T23:00:00.000Z' },
      documents: { label: 'Uploaded materials', used: 190, limit: 200, remaining: 10, period: 'total', resetAt: null },
      broken: { used: 'many' },
      courses: { label: 'Personal courses', used: 50, limit: 50, period: 'total' },
    },
  });
  assert.deepEqual(q.map((x) => x.key), ['documents', 'courses', 'quizzes']);
  assert.equal(q[1].remaining, 0, 'remaining is derived when the server omits it');
  assert.equal(q[2].limit, null);
  assert.equal(q[2].remaining, null);
  assert.equal(q[2].resetAt, '2026-10-29T23:00:00.000Z');
  assert.deepEqual(q.map(percentUsed), [95, 100, null]);
  assert.deepEqual(toUsage(null), []);
});
