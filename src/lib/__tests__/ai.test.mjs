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

const A = await import('../ai.ts');
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const body = (i) => JSON.parse(calls[i].init.body);

beforeEach(() => {
  calls.length = 0;
});

test('messages: user → learner, ai/tutor → ai, in time order; empty ones dropped', () => {
  const out = A.toMessages([
    { id: 'b', sender: 'ai', content: 'Answer', createdAt: '2026-10-26T10:00:02Z' },
    { id: 'a', sender: 'user', content: 'Question', createdAt: '2026-10-26T10:00:01Z' },
    { id: 'c', sender: 'tutor', content: '', createdAt: '2026-10-26T10:00:03Z' },
  ]);
  assert.deepEqual(out.map((m) => [m.id, m.from]), [['a', 'learner'], ['b', 'ai']]);
  assert.deepEqual(A.toMessages(null), []);
});

test('sendChat starts a conversation without an id and continues one with it', async () => {
  const exchange = { data: { conversationId: 'c1', userMessage: { id: 'u', sender: 'user', content: 'Hi', createdAt: '1' }, aiMessage: { id: 'a', sender: 'ai', content: 'Hello', createdAt: '2' } } };
  responder = () => json(201, exchange);
  const first = await A.sendChat('Hi', null);
  assert.equal(first.conversationId, 'c1');
  assert.deepEqual(first.messages.map((m) => m.text), ['Hi', 'Hello']);
  assert.deepEqual(body(0), { message: 'Hi' });
  await A.sendChat('More', 'c1');
  assert.deepEqual(body(1), { message: 'More', conversationId: 'c1' });
  assert.match(calls[1].url, /\/ai\/chat$/);
});

test('an exchange without the AI message is an error, not a blank answer', async () => {
  responder = () => json(201, { data: { conversationId: 'c1', userMessage: { sender: 'user', content: 'Hi' } } });
  await assert.rejects(A.sendChat('Hi', null), /no answer/);
});

test('conversation and tutor session details map their messages', async () => {
  responder = (url) =>
    url.includes('/ai/conversations/')
      ? json(200, { conversation: { id: 'c1', title: 'Cells', messages: [{ id: 'm', sender: 'user', content: 'Q', createdAt: '1' }] } })
      : json(200, { data: { id: 's1', title: '', status: 'ended', messages: [{ sender: 'tutor', content: 'A', createdAt: '1' }] } });
  const c = await A.loadConversation('c1');
  assert.equal(c.title, 'Cells');
  assert.equal(c.messages[0].from, 'learner');
  const s = await A.loadTutorSession('s1');
  assert.deepEqual([s.title, s.status, s.messages[0].from], ['Tutor session', 'ended', 'ai']);
});

test('tutor session: create returns the id; messages go to the session route', async () => {
  responder = (url) =>
    url.endsWith('/sessions')
      ? json(201, { data: { id: 's9' } })
      : json(201, { data: { userMessage: { sender: 'user', content: 'Q', createdAt: '1' }, tutorMessage: { sender: 'tutor', content: 'A', createdAt: '2' } } });
  assert.equal(await A.createTutorSession('Algebra'), 's9');
  assert.deepEqual(body(0), { title: 'Algebra' });
  const msgs = await A.sendTutorMessage('s9', 'Q');
  assert.match(calls[1].url, /\/ai-tutor\/sessions\/s9\/message$/);
  assert.deepEqual(msgs.map((m) => m.from), ['learner', 'ai']);
});

test('each study tool calls its route and reads its own result field', async () => {
  const replies = {
    '/ai/explain': { explanation: 'E' },
    '/ai/summarize': { summary: 'S' },
    '/ai/generate-example': { example: 'X' },
    '/ai/generate-practice': { practiceQuestion: 'P' },
    '/ai-tutor/teach': { lesson: 'L' },
    '/ai-tutor/generate-diagram': { diagramSpec: { type: 'mermaid', code: 'graph TD; A-->B' } },
    '/ai/explain-mistake': { analysis: 'M' },
  };
  responder = (url) => json(201, Object.entries(replies).find(([k]) => url.endsWith(k))[1]);
  const run = (id) => A.runTool(id, { input: 'photosynthesis', userAnswer: 'wrong' });
  assert.deepEqual(await run('explain'), { kind: 'text', text: 'E' });
  assert.deepEqual(await run('summarize'), { kind: 'text', text: 'S' });
  assert.deepEqual(await run('example'), { kind: 'text', text: 'X' });
  assert.deepEqual(await run('practice'), { kind: 'text', text: 'P' });
  assert.deepEqual(await run('teach'), { kind: 'text', text: 'L' });
  assert.deepEqual(await run('diagram'), { kind: 'code', text: 'graph TD; A-->B' });
  assert.deepEqual(await run('mistake'), { kind: 'text', text: 'M' });
  assert.equal(body(0).input, 'photosynthesis');
  assert.deepEqual(body(6), { question: 'photosynthesis', userAnswer: 'wrong', correctAnswer: '' });
});

test('an empty tool answer is an error', async () => {
  responder = () => json(201, { explanation: '  ' });
  await assert.rejects(A.runTool('explain', { input: 'x' }), /empty answer/);
});

test('evaluation JSON is parsed (even inside a code fence); otherwise the text becomes feedback', () => {
  const fenced = '```json\n{"score": 72.4, "feedback": "Good", "strengths": ["clear"], "improvements": ["units", 5]}\n```';
  assert.deepEqual(A.parseEvaluation(fenced), { score: 72, feedback: 'Good', strengths: ['clear'], improvements: ['units'] });
  assert.deepEqual(A.parseEvaluation('Mostly right.'), { score: null, feedback: 'Mostly right.', strengths: [], improvements: [] });
  assert.equal(A.parseEvaluation('{"score": 140, "feedback": "?"}').score, null); // out of range is not shown as a score
});

test('AI unavailable (502/503) surfaces as an ApiError the UI can explain', async () => {
  responder = () => json(503, { message: 'AI service unavailable' });
  await assert.rejects(A.runTool('explain', { input: 'x' }), (e) => e.kind === 'ai_unavailable');
});
