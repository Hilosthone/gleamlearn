import test from 'node:test';
import assert from 'node:assert/strict';
import { isAiOperation } from '../ai-endpoints.ts';
import { createSingleFlight, toApiError, isCancellation } from '../async-state.ts';
import { ApiError } from '../api-error.ts';

test('AI generation endpoints get the long-timeout, no-retry policy', () => {
  for (const path of [
    '/ai/chat',
    '/ai/explain',
    '/ai/documents/abc/generate-quiz',
    '/ai/documents/abc/analyze',
    '/ai-tutor/teach',
    '/ai-tutor/sessions/s1/message',
    '/quizzes/generate-from-document',
    '/tests/generate',
    '/youtube/r1/process',
    '/recommendations',
    '/recommendations/topics',
  ]) {
    assert.equal(isAiOperation(path), true, path);
  }
});

test('ordinary endpoints keep the default policy', () => {
  for (const path of ['/auth/login', '/users/me', '/quizzes', '/quizzes/q1', '/ai-tutor/sessions', '/ai/documents/abc/analysis', '/youtube']) {
    assert.equal(isAiOperation(path), false, path);
  }
});

test('single-flight ignores duplicate starts until finished', () => {
  const flight = createSingleFlight();
  assert.equal(flight.tryStart(), true);
  assert.equal(flight.tryStart(), false);
  flight.finish();
  assert.equal(flight.tryStart(), true);
});

test('unknown errors are normalized without leaking their message; cancellations are recognised', () => {
  const err = toApiError(new Error('SELECT * FROM users failed: connection string postgres://...'));
  assert.equal(err.kind, 'unknown');
  assert.doesNotMatch(err.message, /postgres|SELECT/);
  assert.equal(isCancellation(new ApiError('x', null, 'aborted')), true);
  assert.equal(isCancellation(new ApiError('x', 500, 'server')), false);
  assert.equal(toApiError(new DOMException('a', 'AbortError')).kind, 'aborted');
});
