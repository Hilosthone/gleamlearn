import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';

globalThis.window = {
  localStorage: { getItem: () => 'learner-token-for-tests-0123456789', setItem: () => {}, removeItem: () => {} },
  dispatchEvent: () => true,
};
const calls = [];
let responder = () => new Response('[]', { status: 200 });
globalThis.fetch = async (url, init) => {
  calls.push({ url, init });
  return responder(url, init);
};

const L = await import('../learning.ts');
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

beforeEach(() => {
  calls.length = 0;
});

const lessons = [
  { id: 'l3', courseId: 'c', title: 'Third', orderIndex: 2 },
  { id: 'l1', courseId: 'c', title: 'First', orderIndex: 0 },
  { id: 'l2', courseId: 'c', title: 'Second', orderIndex: 1 },
];

test('lessons are ordered by orderIndex; neighbours follow that order', () => {
  assert.deepEqual(L.sortLessons(lessons).map((l) => l.id), ['l1', 'l2', 'l3']);
  assert.deepEqual(L.neighbours(lessons, 'l2'), { prev: lessons[1], next: lessons[0] });
  assert.deepEqual(L.neighbours(lessons, 'l1').prev, null);
  assert.deepEqual(L.neighbours(lessons, 'l3').next, null);
  assert.deepEqual(L.neighbours(lessons, 'missing'), { prev: null, next: null });
});

test('completion and "continue" use the backend progress records', () => {
  const progress = { l1: { lessonId: 'l1', isCompleted: true }, l2: { lessonId: 'l2', isCompleted: false, startedAt: 'x' } };
  assert.deepEqual(L.courseCompletion(lessons, progress), { completed: 1, total: 3, percent: 33 });
  assert.equal(L.nextLessonToStudy(lessons, progress).id, 'l2');
  assert.equal(L.nextLessonToStudy(lessons, { l1: { isCompleted: true }, l2: { isCompleted: true }, l3: { isCompleted: true } }), null);
  assert.deepEqual(L.courseCompletion([], {}), { completed: 0, total: 0, percent: 0 });
});

test('lesson content becomes plain-text paragraphs (markup stays text)', () => {
  assert.deepEqual(L.lessonParagraphs('One\r\n\r\nTwo\nlines\n\n\n<script>alert(1)</script>'), ['One', 'Two\nlines', '<script>alert(1)</script>']);
  assert.deepEqual(L.lessonParagraphs(null), []);
});

test('listCourses uses search only when a query or track is given', async () => {
  responder = () => json(200, []);
  await L.listCourses();
  await L.listCourses({ q: ' bio ', track: 'All' });
  await L.listCourses({ track: 'Secondary' });
  assert.match(calls[0].url, /\/courses$/);
  assert.match(calls[1].url, /\/courses\/search\?q=bio$/);
  assert.match(calls[2].url, /\/courses\/search\?track=Secondary$/); // an empty q is omitted; the backend defaults it to ''
});

test('a non-array response is treated as an empty list, not a crash', async () => {
  responder = () => json(200, { unexpected: true });
  assert.deepEqual(await L.listEnrolledCourses(), []);
});

test('learner stats: each failing endpoint becomes null instead of a made-up number', async () => {
  responder = (url) => {
    if (url.endsWith('/xp')) return json(200, { totalXp: 120, level: 2, currentXp: 20, nextLevelXp: 200 });
    if (url.endsWith('/coins')) return json(500, { message: 'down' });
    return json(200, { currentStreak: 3, longestStreak: 5, checkedInToday: true });
  };
  const s = await L.loadLearnerStats();
  assert.deepEqual(s.xp, { totalXp: 120, level: 2, currentXp: 20, nextLevelXp: 200 });
  assert.equal(s.coins, null);
  assert.deepEqual(s.streak, { currentStreak: 3, longestStreak: 5, checkedInToday: true });
});

test('progress normalization never invents completion', () => {
  assert.deepEqual(L.normalizeProgress('l1', {}), { lessonId: 'l1', isCompleted: false, startedAt: null, completedAt: null });
  assert.equal(L.normalizeProgress('l1', { isCompleted: true, completedAt: 'd' }).isCompleted, true);
});

test('greeting by local hour', () => {
  assert.equal(L.greeting(new Date(2026, 0, 1, 8)), 'Good morning');
  assert.equal(L.greeting(new Date(2026, 0, 1, 14)), 'Good afternoon');
  assert.equal(L.greeting(new Date(2026, 0, 1, 21)), 'Good evening');
});
