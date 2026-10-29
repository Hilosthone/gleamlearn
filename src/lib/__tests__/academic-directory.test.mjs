import { test } from 'node:test';
import assert from 'node:assert/strict';
import { suggestionsFor, toInstitutions, toLevels } from '../academic-directory.ts';

const dir = toInstitutions([
  { id: '1', name: 'University of Lagos', type: 'University', faculties: [
    { name: 'Science', departments: [{ name: 'Biochemistry' }, { name: 'Zoology' }] },
    { name: 'Engineering', departments: [{ name: 'Mechanical Engineering' }] },
  ] },
  { id: '2', name: 'Yaba College of Technology', type: 'Institute', faculties: [{ name: 'Applied Science', departments: [{ name: 'Food Technology' }] }] },
  { id: '3', name: "King's College", type: 'Secondary', faculties: [] },
  { id: '4', name: '   ', type: 'University' },
  'junk',
]);

test('directory: unnamed and malformed entries are dropped', () => {
  assert.deepEqual(dir.map((i) => i.name), ['University of Lagos', 'Yaba College of Technology', "King's College"]);
});

test('suggestions follow the track and narrow by the chosen university and faculty (case-insensitive)', () => {
  const none = { school: '', university: '', faculty: '' };
  assert.deepEqual(suggestionsFor(dir, 'Secondary', none), { schools: ["King's College"], universities: [], faculties: [], departments: [] });
  const all = suggestionsFor(dir, 'University', none);
  assert.deepEqual(all.universities, ['University of Lagos', 'Yaba College of Technology']);
  assert.deepEqual(all.faculties, ['Applied Science', 'Engineering', 'Science']);
  const unilag = suggestionsFor(dir, 'University', { ...none, university: 'university of lagos ' });
  assert.deepEqual(unilag.faculties, ['Engineering', 'Science']);
  assert.deepEqual(unilag.departments, ['Biochemistry', 'Mechanical Engineering', 'Zoology']);
  assert.deepEqual(suggestionsFor(dir, 'University', { ...none, university: 'University of Lagos', faculty: 'Science' }).departments, ['Biochemistry', 'Zoology']);
  assert.deepEqual(suggestionsFor([], '', none), { schools: [], universities: [], faculties: [], departments: [] });
});

test('levels: string lists only', () => {
  assert.deepEqual(toLevels({ secondaryLevels: ['SS 1', 3, ''], universityLevels: ['100 Level'] }), { secondaryLevels: ['SS 1'], universityLevels: ['100 Level'], secondaryStreams: [] });
});
