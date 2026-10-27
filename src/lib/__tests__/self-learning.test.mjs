import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.window = {
  localStorage: { getItem: () => 'learner-token-for-tests-0123456789', setItem: () => {}, removeItem: () => {} },
  dispatchEvent: () => true,
};
const calls = [];
let responder = () => new Response('{}', { status: 200 });
globalThis.fetch = async (url, init) => {
  calls.push({ url: String(url), init });
  return responder(String(url), init);
};
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const S = await import('../self-learning.ts');

test('newRequestId returns distinct UUID-shaped ids', () => {
  const a = S.newRequestId();
  const b = S.newRequestId();
  assert.match(a, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.notEqual(a, b);
});

test('toGenerateResult rejects unknown result types and hrefFor routes each type', () => {
  assert.throws(() => S.toGenerateResult({ type: 'other', id: 'x' }));
  assert.throws(() => S.toGenerateResult({ type: 'resource' }));
  const r = S.toGenerateResult({ type: 'assessment', id: 'a 1', kind: 'quiz', title: 'Q', reused: true });
  assert.equal(r.reused, true);
  assert.equal(S.hrefFor(r), '/practice/a%201');
  assert.equal(S.hrefFor({ type: 'resource', id: 'r' }), '/learn/resources/r');
  assert.equal(S.hrefFor({ type: 'course', id: 'c' }), '/my-courses/c');
  assert.equal(S.hrefFor({ type: 'deck', id: 'd' }), '/library?tab=flashcards');
});

test('parseBlocks turns the Markdown subset into text blocks (no HTML passes through as markup)', () => {
  const blocks = S.parseBlocks('# Title\r\nIntro **bold** line\ncontinues\n\n- one\n- `two`\n1. first\n2) second\n### Sub\n<script>x</script>');
  assert.deepEqual(blocks, [
    { type: 'h2', text: 'Title' },
    { type: 'p', text: 'Intro bold line continues' },
    { type: 'ul', items: ['one', 'two'] },
    { type: 'ol', items: ['first', 'second'] },
    { type: 'h3', text: 'Sub' },
    { type: 'p', text: '<script>x</script>' },
  ]);
  assert.deepEqual(S.parseBlocks(''), []);
});

test('toAttemptView reads a submitted attempt with review, and refuses a missing id', () => {
  const v = S.toAttemptView({
    attempt: { id: 't1', assessmentId: 'a1', status: 'submitted', score: 50, correctCount: 1, totalQuestions: 2, deadlineAt: null, autoSubmitted: true },
    assessment: { id: 'a1', kind: 'exam', title: 'Mock', questions: [{ index: 0, question: 'Q?', options: ['A', 'B'] }] },
    answers: { 0: 'A', 1: 5 },
    review: {
      questions: [{ index: 0, question: 'Q?', options: ['A', 'B'], chosen: 'A', answer: 'A', correct: true, explanation: 'E', topic: 'T' }],
      topics: [{ topic: 'T', correct: 1, total: 2, percent: 50 }],
      strengths: [],
      toRevise: ['T'],
    },
  });
  assert.equal(v.attempt.status, 'submitted');
  assert.equal(v.attempt.autoSubmitted, true);
  assert.equal(v.assessment.kind, 'exam');
  assert.deepEqual(v.answers, { 0: 'A' }); // non-string answers dropped
  assert.deepEqual(v.review.toRevise, ['T']);
  assert.throws(() => S.toAttemptView({ attempt: {} }));
});

test('secondsLeft and formatClock', () => {
  const now = Date.parse('2026-10-27T10:00:00Z');
  assert.equal(S.secondsLeft(null, now), null);
  assert.equal(S.secondsLeft('nonsense', now), null);
  assert.equal(S.secondsLeft('2026-10-27T10:01:30Z', now), 90);
  assert.equal(S.secondsLeft('2026-10-27T09:00:00Z', now), 0);
  assert.equal(S.formatClock(5), '0:05');
  assert.equal(S.formatClock(754), '12:34');
  assert.equal(S.formatClock(3725), '1:02:05');
});

test('sourceLinks links back to every source the assessment came from', () => {
  assert.deepEqual(
    S.sourceLinks({ resourceId: 'r', materialId: null, personalCourseId: 'c', youtubeSessionId: 'y' }).map((l) => l.href),
    ['/learn/resources/r', '/ai/youtube/y', '/my-courses/c'],
  );
  assert.deepEqual(S.sourceLinks({ resourceId: null, materialId: null, personalCourseId: null, youtubeSessionId: null }), []);
});

test('youtubeIdFrom accepts the usual link shapes and rejects others', () => {
  const id = 'dQw4w9WgXcQ';
  for (const u of [
    `https://www.youtube.com/watch?v=${id}&t=10`,
    `https://youtu.be/${id}?si=abc`,
    `https://m.youtube.com/watch?v=${id}`,
    `https://youtube.com/shorts/${id}`,
    `https://www.youtube.com/embed/${id}`,
    `https://www.youtube-nocookie.com/embed/${id}`,
  ])
    assert.equal(S.youtubeIdFrom(u), id, u);
  for (const u of ['', 'dQw4w9WgXcQ', 'https://vimeo.com/123', `https://evil.com/watch?v=${id}`, 'https://youtube.com/watch?v=short', 'https://youtube.com/channel/x'])
    assert.equal(S.youtubeIdFrom(u), null, u);
});

test('embedUrl uses the privacy-enhanced host and seeks only when asked', () => {
  assert.equal(S.embedUrl('abc'), 'https://www.youtube-nocookie.com/embed/abc?rel=0');
  assert.equal(S.embedUrl('abc', 61.9), 'https://www.youtube-nocookie.com/embed/abc?rel=0&start=61&autoplay=1');
});

test('answerParts links only the timestamps the server verified', () => {
  const parts = S.answerParts('See [01:05] and [99:59], then [1:00:02].', [65, 3602]);
  assert.deepEqual(parts, [
    { text: 'See ' },
    { seconds: 65, label: '01:05' },
    { text: ' and [99:59], then ' },
    { seconds: 3602, label: '1:00:02' },
    { text: '.' },
  ]);
  assert.deepEqual(S.answerParts('No stamps', []), [{ text: 'No stamps' }]);
});

test('searchEverything keeps only app-internal links and reports unavailable sections', async () => {
  responder = () =>
    json(200, {
      results: [
        { type: 'resource', id: '1', title: 'Cells', href: '/learn/resources/1' },
        { type: 'resource', id: '2', title: 'Bad', href: 'https://evil.example/' },
        { type: 'resource', id: '3', title: 'Bad', href: '//evil.example/' },
        { type: 'resource', id: '4', title: 'Bad', href: '/\\evil.example/' },
        { type: 'note', title: 'No id', href: '/library?tab=notes' },
      ],
      unavailableTypes: ['youtube'],
    });
  const r = await S.searchEverything('cel');
  assert.deepEqual(r.results.map((x) => x.id), ['1']);
  assert.deepEqual(r.unavailableTypes, ['youtube']);
  assert.match(calls.at(-1).url, /\/search\/everything\?q=cel/);
});

test('waitForMaterial resolves when extraction finishes and reports a failure honestly', async () => {
  let n = 0;
  responder = () => json(200, { id: 'm', status: ++n < 2 ? 'PROCESSING' : 'READY', textChars: 400 });
  const m = await S.waitForMaterial('m', { intervalMs: 1 });
  assert.equal(m.status, 'READY');
  responder = () => json(200, { id: 'm', status: 'FAILED', processingError: 'No text found' });
  const f = await S.waitForMaterial('m', { intervalMs: 1 });
  assert.equal(f.status, 'FAILED');
});
