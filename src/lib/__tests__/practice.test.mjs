import { test } from 'node:test';
import assert from 'node:assert/strict';
import { answersPayload, gradeLocally, parseGeneratedQuiz, toAssessment, toAssessmentList, toSubmitResult } from '../practice.ts';

test('stored assessments map without answers; question positions are kept for grading', () => {
  const a = toAssessment(
    { id: 'q1', title: 'Algebra', durationMinutes: 0, questions: [{ question: '2+2?', options: ['3', '4'] }, { junk: true }, { text: 'Pick', choices: [{ text: 'A' }, { label: 'B' }] }] },
    'quiz',
  );
  assert.equal(a.title, 'Algebra');
  assert.equal(a.durationMinutes, null);
  assert.deepEqual(a.questions, [
    { index: 0, text: '2+2?', options: ['3', '4'] },
    { index: 2, text: 'Pick', options: ['A', 'B'] },
  ]);
  assert.equal(toAssessmentList([{ id: 'x', questions: [] }, { notAnAssessment: 1 }], 'test').length, 1);
});

test('answers are keyed by question index (what the backend grader matches)', () => {
  assert.deepEqual(answersPayload({ 0: '4', 2: 'B', 3: '' }), { 0: '4', 2: 'B' });
});

test('submit results: real server fields only', () => {
  const r = toSubmitResult({ status: 'success', score: 50, totalQuestions: 2, correctAnswers: 1, graded: true, passed: false, xpAwarded: 0, coinsAwarded: 0, message: 'graded' });
  assert.deepEqual(r, { score: 50, totalQuestions: 2, correctAnswers: 1, graded: true, passed: false, xpAwarded: 0, coinsAwarded: 0, message: 'graded', attemptId: null });
  assert.equal(toSubmitResult({ score: 100, testId: 't' }).passed, null, 'tests have no pass/fail');
  // the stored attempt is linked only when the server says it was saved
  assert.equal(toSubmitResult({ score: 100, saved: true, attemptId: 'a1' }).attemptId, 'a1');
  assert.equal(toSubmitResult({ score: 100, saved: false, attemptId: 'a1' }).attemptId, null);
});

test('generated quizzes are parsed from fenced or bare model output; unusable questions are dropped', () => {
  const fenced = 'Here you go:\n```json\n{"questions":[{"question":"Capital of Nigeria?","options":["Lagos","Abuja"],"correctAnswer":"B","explanation":"Since 1991."},{"question":"no options","options":[],"correctAnswer":"x"}]}\n```';
  const qs = parseGeneratedQuiz(fenced);
  assert.deepEqual(qs, [{ index: 0, text: 'Capital of Nigeria?', options: ['Lagos', 'Abuja'], answer: 'Abuja', explanation: 'Since 1991.' }]);
  assert.equal(parseGeneratedQuiz([{ question: 'Q', options: ['a', 'b'], answer: 'a' }]).length, 1);
  assert.deepEqual(parseGeneratedQuiz('not json at all'), []);
  assert.deepEqual(parseGeneratedQuiz('{"questions": [ broken'), []);
});

test('local grading for generated practice', () => {
  const qs = parseGeneratedQuiz('[{"question":"Q1","options":["a","b"],"correctAnswer":"a"},{"question":"Q2","options":["c","d"],"correctAnswer":"d"}]');
  const g = gradeLocally(qs, { 0: 'a', 1: 'c' });
  assert.deepEqual([g.correct, g.total, g.score], [1, 2, 50]);
  assert.deepEqual(g.perQuestion, [{ index: 0, correct: true }, { index: 1, correct: false }]);
});
