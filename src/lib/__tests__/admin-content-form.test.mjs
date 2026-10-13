import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCourse, validateTopic, validateLesson, changedFields, toFormString, LIMITS } from '../admin-content-form.ts';

const course = (o = {}) => ({ title: 'Biology', description: '', track: 'Secondary', level: '', departmentId: '', ...o });

test('course: trims, drops empty optional fields, and requires title and track', () => {
  assert.deepEqual(validateCourse(course({ title: '  Biology  ', level: ' SS 2 ' })), {
    ok: true,
    value: { title: 'Biology', track: 'Secondary', level: 'SS 2' },
  });
  const bad = validateCourse(course({ title: '   ', track: '' }));
  assert.equal(bad.ok, false);
  assert.match(bad.errors.title, /required/);
  assert.match(bad.errors.track, /required/);
});

test('course: enforces the backend length limits and department ID format', () => {
  const bad = validateCourse(course({ title: 'x'.repeat(LIMITS.title + 1), level: 'x'.repeat(51), departmentId: 'not-a-uuid' }));
  assert.equal(bad.ok, false);
  assert.match(bad.errors.title, /at most 200/);
  assert.match(bad.errors.level, /at most 50/);
  assert.match(bad.errors.departmentId, /valid ID/);
  assert.equal(validateCourse(course({ title: 'x'.repeat(LIMITS.title) })).ok, true);
  assert.equal(validateCourse(course({ departmentId: '44444444-aaaa-4aaa-8aaa-444444444444' })).ok, true);
});

test('topic and lesson order must be a whole number ≥ 0, or empty', () => {
  assert.deepEqual(validateTopic({ title: 'Cells', description: '', order: '3' }), { ok: true, value: { title: 'Cells', order: 3 } });
  assert.deepEqual(validateTopic({ title: 'Cells', description: '', order: '' }), { ok: true, value: { title: 'Cells' } });
  for (const order of ['-1', '1.5', 'abc', '1e3']) {
    const r = validateTopic({ title: 'Cells', description: '', order });
    assert.equal(r.ok, false, order);
    assert.match(r.errors.order, /whole number/);
  }
  assert.equal(validateLesson({ title: 'L1', content: '', orderIndex: '-2' }).ok, false);
});

test('lesson content keeps its formatting; blank content is not sent', () => {
  const md = '  - indented item\n\n```js\ncode\n```';
  assert.deepEqual(validateLesson({ title: ' L1 ', content: md, orderIndex: '0' }), { ok: true, value: { title: 'L1', content: md, orderIndex: 0 } });
  assert.deepEqual(validateLesson({ title: 'L1', content: '   \n ', orderIndex: '' }), { ok: true, value: { title: 'L1' } });
  assert.equal(validateLesson({ title: '', content: '', orderIndex: '' }).ok, false);
});

test('changedFields sends only edits, and clears clearable text fields with ""', () => {
  const original = { title: 'Biology', description: 'Old', track: 'Secondary', level: 'SS 2', departmentId: null };
  assert.deepEqual(changedFields(original, { title: 'Biology', track: 'Secondary', level: 'SS 2', description: 'Old' }, ['description', 'level']), {});
  assert.deepEqual(changedFields(original, { title: 'Bio II', track: 'Secondary' }, ['description', 'level']), {
    title: 'Bio II',
    description: '',
    level: '',
  });
  // A cleared non-clearable field (e.g. topic order) is not sent
  assert.deepEqual(changedFields({ title: 'T', order: 2 }, { title: 'T' }, ['description']), {});
  assert.deepEqual(changedFields({ title: 'T', order: 2 }, { title: 'T', order: 0 }), { order: 0 });
});

test('toFormString', () => {
  assert.equal(toFormString(null), '');
  assert.equal(toFormString(undefined), '');
  assert.equal(toFormString(0), '0');
  assert.equal(toFormString('x'), 'x');
});
