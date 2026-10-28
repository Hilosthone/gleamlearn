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

const V = await import('../visual-lesson.ts');

const lesson = (steps, extra = {}) => JSON.stringify({ title: 'T', summary: 'S', steps, keyTakeaways: ['k'], ...extra });

test('parseVisualLesson keeps registry visuals, drops anything else, needs two steps', () => {
  const l = V.parseVisualLesson(
    lesson([
      { title: 'A', explanation: 'a', visual: { type: 'molecule', atoms: [{ id: 'o', element: 'O' }, { id: 'h', element: 'H' }], bonds: [{ a: 'o', b: 'h' }] } },
      { title: 'B', explanation: 'b', visual: { type: 'iframe', src: 'https://evil.example' } },
      { title: 'C', explanation: 'c', visual: { type: 'graph2d', family: 'eval', expression: 'alert(1)' } },
    ], { basis: 'topic' }),
  );
  assert.deepEqual(l.steps.map((s) => s.visual?.type ?? null), ['molecule', null, null]);
  assert.equal(l.basis, 'topic');
  assert.throws(() => V.parseVisualLesson(lesson([{ title: 'only', explanation: 'one' }])), /could not be read/);
  assert.throws(() => V.parseVisualLesson('<html>'), /could not be read/);
});

test('toVisual clamps numbers and refuses unknown shapes, elements and dangling references', () => {
  assert.equal(V.toVisual({ type: 'wave', amplitude: 1e9, waves: 99 }).amplitude, 5);
  assert.equal(V.toVisual({ type: 'shape3d', shape: 'teapot' }), null);
  assert.equal(V.toVisual({ type: 'molecule', atoms: [{ id: 'x', element: 'Kr' }] }), null);
  const flow = V.toVisual({ type: 'flow', nodes: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }], edges: [{ from: 'a', to: 'zz' }, { from: 'a', to: 'b' }] });
  assert.deepEqual(flow.edges.map((e) => e.to), ['b']);
  assert.equal(V.toVisual({ type: 'graph2d', family: 'linear', xMin: 3, xMax: 1 }).xMin, -10);
});

test('graphs are sampled from fixed formula families (no evaluation of AI text)', () => {
  const g = V.toVisual({ type: 'graph2d', family: 'quadratic', a: 2, b: 1, c: 0, d: 1, xMin: -2, xMax: 2 });
  assert.equal(V.familyValue(g, 3), 19); // 2·3² + 1
  const log = V.toVisual({ type: 'graph2d', family: 'logarithmic', a: 1, b: 1, xMin: -1, xMax: 1 });
  assert.equal(V.familyValue(log, -1), null); // undefined region becomes a gap, not NaN
  const pts = V.samplePath(g, 4);
  assert.deepEqual(pts.map((p) => p.x), [-2, -1, 0, 1, 2]);
});

test('molecule layout is deterministic, centred, and keeps bonded atoms near bond length', () => {
  const m = V.toVisual({ type: 'molecule', atoms: [{ id: 'o', element: 'O' }, { id: 'h1', element: 'H' }, { id: 'h2', element: 'H' }], bonds: [{ a: 'o', b: 'h1' }, { a: 'o', b: 'h2' }] });
  const a = V.layoutMolecule(m);
  assert.deepEqual(a, V.layoutMolecule(m));
  const centre = [0, 1, 2].map((k) => Object.values(a).reduce((s, p) => s + p[k], 0));
  for (const c of centre) assert.ok(Math.abs(c) < 1e-9);
  const d = Math.hypot(...[0, 1, 2].map((k) => a.o[k] - a.h1[k]));
  assert.ok(d > 0.8 && d < 2, `bond length ${d}`);
});

test('askAboutStep sends input + context to POST /ai-tutor/explain (the backend DTO) and returns the explanation', async () => {
  const l = V.parseVisualLesson(lesson([{ title: 'Atoms', explanation: 'Two H, one O.' }, { title: 'B', explanation: 'b' }]));
  responder = () => json(201, { status: 'success', explanation: 'Because of lone pairs.' });
  assert.equal(await V.askAboutStep(l, l.steps[0], ' Why bent? '), 'Because of lone pairs.');
  const body = JSON.parse(calls.at(-1).init.body);
  assert.match(calls.at(-1).url, /\/ai-tutor\/explain$/);
  assert.equal(body.input, 'Why bent?');
  assert.deepEqual(body.context, { lesson: 'T', step: 'Atoms', explanation: 'Two H, one O.' }); // an object, as the AI service expects
  responder = () => json(201, { explanation: '' });
  await assert.rejects(() => V.askAboutStep(l, l.steps[0], 'x'), /empty answer/);
});
