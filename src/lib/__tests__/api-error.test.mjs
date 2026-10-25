import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError, apiErrorFromResponse, kindFromStatus, recoveryHint } from '../api-error.ts';

test('ApiError stays an Error with the same message', () => {
  const err = apiErrorFromResponse(400, 'Bad Request', { statusCode: 400, message: 'New passwords do not match' });
  assert.ok(err instanceof Error);
  assert.ok(err instanceof ApiError);
  assert.equal(err.message, 'New passwords do not match');
  assert.equal(err.status, 400);
  assert.equal(err.kind, 'validation');
});

test('validation arrays from the NestJS ValidationPipe become details', () => {
  const err = apiErrorFromResponse(400, 'Bad Request', {
    statusCode: 400,
    message: ['confirmNewPassword should not be empty', 'confirmNewPassword must be a string'],
  });
  assert.deepEqual(err.details, ['confirmNewPassword should not be empty', 'confirmNewPassword must be a string']);
  assert.match(err.message, /confirmNewPassword should not be empty; /);
});

test('status codes map to recovery kinds', () => {
  assert.equal(kindFromStatus(401), 'unauthorized');
  assert.equal(kindFromStatus(429), 'rate_limited');
  assert.equal(kindFromStatus(502), 'ai_unavailable');
  assert.equal(kindFromStatus(503), 'ai_unavailable');
  assert.equal(kindFromStatus(504), 'timeout');
  assert.equal(kindFromStatus(500), 'server');
});

test('missing or non-JSON bodies still produce a readable message', () => {
  assert.equal(apiErrorFromResponse(500, 'Internal Server Error', null).message, 'API Error: 500 Internal Server Error');
});

test('transient kinds are flagged for retry; validation is not', () => {
  assert.equal(new ApiError('x', 503, 'ai_unavailable').isTransient, true);
  assert.equal(new ApiError('x', null, 'network').isTransient, true);
  assert.equal(new ApiError('x', 400, 'validation').isTransient, false);
  assert.match(recoveryHint('unauthorized'), /sign in again/);
});

test('a machine-readable code from the backend is kept (account restricted / frozen)', () => {
  const err = apiErrorFromResponse(403, 'Forbidden', { statusCode: 403, code: 'ACCOUNT_RESTRICTED', message: 'This account has been restricted. Please contact support.' });
  assert.equal(err.code, 'ACCOUNT_RESTRICTED');
  assert.equal(err.kind, 'forbidden');
  assert.equal(apiErrorFromResponse(403, 'Forbidden', { message: 'x' }).code, null);
  assert.equal(apiErrorFromResponse(403, 'Forbidden', { code: 42 }).code, null);
});

test('501 FEATURE_UNAVAILABLE is "not available yet": not a server fault, not transient, never "try again later"', () => {
  const err = apiErrorFromResponse(501, 'Not Implemented', {
    statusCode: 501,
    error: 'Not Implemented',
    code: 'FEATURE_UNAVAILABLE',
    feature: 'PDF export',
    message: 'PDF export is not available yet: no PDF is generated or stored.',
  });
  assert.equal(err.kind, 'not_implemented');
  assert.equal(err.code, 'FEATURE_UNAVAILABLE');
  assert.equal(err.isTransient, false);
  assert.equal(err.message, 'PDF export is not available yet: no PDF is generated or stored.');
  assert.equal(recoveryHint('not_implemented'), 'This feature is not available yet.');
  assert.doesNotMatch(recoveryHint('not_implemented'), /try again/i);
});
