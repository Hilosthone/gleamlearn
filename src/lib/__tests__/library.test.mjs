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

const L = await import('../library.ts');
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

beforeEach(() => {
  calls.length = 0;
});

test('saved courses are joined with the catalogue; a removed course is marked, not invented', () => {
  const saved = [
    { id: 's1', userId: 'u', courseId: 'c1', savedAt: '2026-10-01T00:00:00Z' },
    { id: 's2', userId: 'u', courseId: 'gone', savedAt: '2026-10-20T00:00:00Z' },
    { id: 's3', userId: 'u' }, // malformed row
  ];
  const out = L.joinSavedCourses(saved, [{ id: 'c1', title: 'Biology', description: 'Cells' }]);
  assert.deepEqual(out.map((c) => [c.courseId, c.title, c.available]), [
    ['gone', 'Course no longer available', false], // newest first
    ['c1', 'Biology', true],
  ]);
  assert.deepEqual(L.joinSavedCourses({ unexpected: true }, []), []);
});

test('loadSavedCourses reads /library/courses and the catalogue', async () => {
  responder = (url) => (url.endsWith('/library/courses') ? json(200, [{ courseId: 'c1', savedAt: '2026-10-01' }]) : json(200, [{ id: 'c1', title: 'Maths' }]));
  const out = await L.loadSavedCourses();
  assert.equal(out[0].title, 'Maths');
  assert.ok(calls.some((c) => c.url.endsWith('/library/courses')));
  assert.ok(calls.some((c) => /\/courses$/.test(c.url)));
});

test('loadCourseSaved: true/false from the saved list, null when it cannot be read', async () => {
  responder = () => json(200, [{ courseId: 'c1' }]);
  assert.equal(await L.loadCourseSaved('c1'), true);
  assert.equal(await L.loadCourseSaved('c2'), false);
  responder = () => json(500, { message: 'down' });
  assert.equal(await L.loadCourseSaved('c1'), null);
});

test('save and remove use the library course routes', async () => {
  responder = () => json(200, {});
  await L.saveCourseToLibrary('c 1');
  await L.removeCourseFromLibrary('c1');
  assert.equal(calls[0].init.method, 'POST');
  assert.match(calls[0].url, /\/library\/courses\/c(%20| )1$/);
  assert.equal(calls[1].init.method, 'DELETE');
});

test('notes: newest first, tags kept as strings, missing fields defaulted', () => {
  const out = L.toNotes([
    { id: 'n1', title: 'Old', content: 'a', tags: ['x', 3], updatedAt: '2026-01-01' },
    { id: 'n2', title: '', content: 'b', tags: null, createdAt: '2026-05-01' },
    { title: 'no id' },
  ]);
  assert.deepEqual(out.map((n) => [n.id, n.title, n.tags]), [
    ['n2', 'Untitled note', []],
    ['n1', 'Old', ['x']],
  ]);
});

test('parseTags trims, de-duplicates and drops empties', () => {
  assert.deepEqual(L.parseTags(' algebra, exam prep ,, algebra '), ['algebra', 'exam prep']);
  assert.deepEqual(L.parseTags(''), []);
});

test('createNote / updateNote send the real body', async () => {
  responder = () => json(200, {});
  await L.createNote({ title: 'T', content: 'C', tags: ['a'] });
  await L.updateNote('n1', { title: 'T2', content: 'C', tags: [] });
  assert.equal(calls[0].init.method, 'POST');
  assert.deepEqual(JSON.parse(calls[0].init.body), { title: 'T', content: 'C', tags: ['a'] });
  assert.equal(calls[1].init.method, 'PATCH');
  assert.match(calls[1].url, /\/notes\/n1$/);
});

test('decks map their cards; due cards carry their deck title', () => {
  const [d] = L.toDecks([{ id: 'd1', title: 'Bio', cards: [{ id: 'k1', question: 'Q', answer: 'A', nextReviewDate: null }, 'junk'] }]);
  assert.equal(d.cards.length, 1);
  assert.deepEqual(d.cards[0], { id: 'k1', deckId: 'd1', deckTitle: 'Bio', question: 'Q', answer: 'A', nextReviewDate: null });
  const due = L.toDueCards([{ id: 'k2', deckId: 'd2', question: 'Q', answer: 'A', deck: { id: 'd2', title: 'Chem' } }]);
  assert.equal(due[0].deckTitle, 'Chem');
  assert.equal(L.toDeck({ title: 'no id' }), null);
});

test('review grades are valid SM-2 qualities and reviewCard posts one', async () => {
  for (const g of L.REVIEW_GRADES) assert.ok(g.quality >= 0 && g.quality <= 5);
  responder = () => json(200, {});
  await L.reviewCard('k1', 4);
  assert.match(calls[0].url, /\/flashcards\/k1\/review$/);
  assert.deepEqual(JSON.parse(calls[0].init.body), { quality: 4 });
  calls.length = 0;
  await L.loadDueCards();
  assert.match(calls[0].url, /\/flashcards\/review\/today$/);
});

test('setCourseSaved returns the confirmed state; 409 on save and 404 on remove mean "already so"', async () => {
  responder = () => json(201, {});
  assert.equal(await L.setCourseSaved('c1', true), true);
  responder = () => json(409, { message: 'Course already saved' });
  assert.equal(await L.setCourseSaved('c1', true), true);
  responder = () => json(404, { message: 'Saved course not found' });
  assert.equal(await L.setCourseSaved('c1', false), false);
  // any other failure is a real error, and a 404 on save is not "already saved"
  responder = () => json(404, { message: 'Course not found' });
  await assert.rejects(L.setCourseSaved('c1', true));
  responder = () => json(500, { message: 'down' });
  await assert.rejects(L.setCourseSaved('c1', false));
});
