import test from 'node:test';
import assert from 'node:assert/strict';
import { createHttpClient, backoffDelay } from '../http-client.ts';
import { ApiError } from '../api-error.ts';

const json = (status, body, headers = {}) =>
  new Response(body === undefined ? '' : JSON.stringify(body), {
    status,
    statusText: status === 200 ? 'OK' : 'ERR',
    headers: { 'Content-Type': 'application/json', ...headers },
  });

function setup(responses, extra = {}) {
  const calls = [];
  const sleeps = [];
  const queue = [...responses];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });
    const next = queue.shift();
    if (typeof next === 'function') return next(url, init);
    if (next instanceof Error) throw next;
    return next;
  };
  const client = createHttpClient({
    baseUrl: 'https://api.example.test/api/v1/',
    fetchImpl,
    sleep: async (ms) => { sleeps.push(ms); },
    random: () => 0.5,
    ...extra,
  });
  return { client, calls, sleeps };
}

test('successful JSON request with bearer token from getToken', async () => {
  const { client, calls } = setup([json(200, { ok: true })], { getToken: () => 'tok-123' });
  const data = await client.request('/users/me');
  assert.deepEqual(data, { ok: true });
  assert.equal(calls[0].url, 'https://api.example.test/api/v1/users/me');
  assert.equal(calls[0].init.headers.Authorization, 'Bearer tok-123');
  assert.equal(calls[0].init.headers['Content-Type'], undefined, 'no JSON content-type without a body');
});

test('JSON body sets Content-Type; FormData does not', async () => {
  const { client, calls } = setup([json(200, {}), json(200, {})]);
  await client.request('/x', { method: 'POST', body: { a: 1 } });
  assert.equal(calls[0].init.headers['Content-Type'], 'application/json');
  assert.equal(calls[0].init.body, '{"a":1}');
  const fd = new FormData();
  fd.append('file', 'x');
  await client.request('/files/upload', { method: 'POST', body: fd });
  assert.equal(calls[1].init.headers['Content-Type'], undefined);
  assert.equal(calls[1].init.body, fd);
});

test('HTTP errors become typed ApiError with the backend message', async () => {
  const { client } = setup([json(400, { statusCode: 400, message: ['email must be an email'] })]);
  await assert.rejects(client.request('/auth/forgot-password', { method: 'POST', body: {} }), (err) => {
    assert.ok(err instanceof ApiError);
    assert.equal(err.status, 400);
    assert.equal(err.kind, 'validation');
    assert.deepEqual(err.details, ['email must be an email']);
    return true;
  });
});

test('no HTTP response becomes kind "network"', async () => {
  const { client } = setup([new TypeError('Failed to fetch')], { retries: 0 });
  await assert.rejects(client.request('/x'), (err) => err.kind === 'network' && err.status === null);
});

test('timeout aborts the request and becomes kind "timeout"', async () => {
  const hang = (_url, init) =>
    new Promise((_, reject) => init.signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError'))));
  const { client } = setup([hang], { retries: 0 });
  await assert.rejects(client.request('/slow', { timeoutMs: 20 }), (err) => err.kind === 'timeout');
});

test('caller cancellation becomes kind "aborted" and is not retried', async () => {
  const controller = new AbortController();
  const hang = (_url, init) =>
    new Promise((_, reject) => init.signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError'))));
  const { client, calls } = setup([hang, hang]);
  const pending = client.request('/x', { signal: controller.signal, timeoutMs: 0 });
  controller.abort();
  await assert.rejects(pending, (err) => err.kind === 'aborted');
  assert.equal(calls.length, 1);
});

test('already-aborted signal never calls fetch', async () => {
  const controller = new AbortController();
  controller.abort();
  const { client, calls } = setup([json(200, {})]);
  await assert.rejects(client.request('/x', { signal: controller.signal }), (err) => err.kind === 'aborted');
  assert.equal(calls.length, 0);
});

test('GET retries transient failures with bounded backoff, then succeeds', async () => {
  const { client, calls, sleeps } = setup([json(503, { message: 'down' }), json(502, {}), json(200, { ok: 1 })]);
  assert.deepEqual(await client.request('/recommendations-like-read'), { ok: 1 });
  assert.equal(calls.length, 3);
  assert.deepEqual(sleeps, [250, 500]); // random 0.5 × 500ms, × 1000ms (full jitter)
});

test('GET gives up after the retry limit', async () => {
  const { client, calls } = setup([json(503, {}), json(503, {}), json(503, {}), json(503, {})]);
  await assert.rejects(client.request('/x'), (err) => err.status === 503);
  assert.equal(calls.length, 3); // 1 + DEFAULT_RETRIES (2)
});

test('POST is never retried by default (non-idempotent)', async () => {
  const { client, calls } = setup([json(503, {}), json(200, {})]);
  await assert.rejects(client.request('/quizzes', { method: 'POST', body: {} }), (err) => err.status === 503);
  assert.equal(calls.length, 1);
});

test('POST can opt in to retries only when marked idempotent', async () => {
  const { client, calls } = setup([json(503, {}), json(200, { ok: true })]);
  assert.deepEqual(await client.request('/search', { method: 'POST', body: {}, idempotent: true }), { ok: true });
  assert.equal(calls.length, 2);
});

test('validation and not-found errors are never retried', async () => {
  const { client, calls } = setup([json(404, {}), json(200, {})]);
  await assert.rejects(client.request('/x'), (err) => err.kind === 'not_found');
  assert.equal(calls.length, 1);
});

test('429 honours Retry-After (capped)', async () => {
  const { client, sleeps } = setup([json(429, {}, { 'Retry-After': '2' }), json(200, {})]);
  await client.request('/x');
  assert.deepEqual(sleeps, [2000]);
});

test('401 notifies onUnauthorized once and is not retried', async () => {
  let notified = 0;
  const { client, calls } = setup([json(401, { message: 'Unauthorized' }), json(200, {})], {
    onUnauthorized: () => { notified++; },
  });
  await assert.rejects(client.request('/users/me'), (err) => err.kind === 'unauthorized');
  assert.equal(notified, 1);
  assert.equal(calls.length, 1);
});

test('empty and non-JSON success bodies resolve to null', async () => {
  const { client } = setup([new Response('', { status: 200 }), new Response('<html>', { status: 200 })]);
  assert.equal(await client.request('/a'), null);
  assert.equal(await client.request('/b'), null);
});

test('backoff delay is capped and jittered', () => {
  assert.equal(backoffDelay(1, () => 1), 500);
  assert.equal(backoffDelay(10, () => 1), 5000);
  assert.equal(backoffDelay(3, () => 0), 0);
  assert.equal(backoffDelay(1, () => 1, 60_000), 5000);
});
