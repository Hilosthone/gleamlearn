import test from 'node:test';
import assert from 'node:assert/strict';

const A = await import('../admin-assessments.ts');

test('stored letter answers are shown as the option text; unknown answers are kept as-is', () => {
  assert.equal(A.answerText(['Lagos', 'Abuja'], 'B'), 'Abuja');
  assert.equal(A.answerText(['Lagos', 'Abuja'], 'Abuja'), 'Abuja');
  assert.equal(A.answerText(['3', '4'], 4), '4');
  assert.equal(A.answerText(['x'], 'Z'), 'Z');
});

test('a stored assessment becomes an editable draft (answer, answer or correct_answer keys)', () => {
  const d = A.toDraft({ id: 'q', title: 'Check', durationMinutes: 20, questions: [{ question: 'Capital?', options: ['Lagos', 'Abuja'], correctAnswer: 'B', explanation: 'Since 1991' }, { question: '2+2', options: ['3', '4'], answer: '4' }] });
  assert.equal(d.durationMinutes, '20');
  assert.deepEqual(d.questions[0], { question: 'Capital?', options: 'Lagos\nAbuja', correctAnswer: 'Abuja', explanation: 'Since 1991' });
  assert.equal(d.questions[1].correctAnswer, '4');
  assert.equal(A.toDraft(null).questions.length, 1);
});

test('validation lists every problem by question number', () => {
  const d = { title: ' ', description: '', durationMinutes: '1.5', questions: [{ question: '', options: 'a\na', correctAnswer: 'b', explanation: '' }] };
  assert.deepEqual(A.validateDraft(d, true), [
    'Enter a title.',
    'The duration must be a whole number of minutes.',
    'Question 1: enter the question.',
    'Question 1: options must be different.',
    'Question 1: choose the correct option.',
  ]);
  assert.deepEqual(A.validateDraft({ ...d, durationMinutes: '1.5' }, false).includes('The duration must be a whole number of minutes.'), false); // quizzes have no duration
  const ok = { title: 'T', description: '', durationMinutes: '', questions: [{ question: 'Q', options: ' a \n\nb ', correctAnswer: 'a', explanation: '' }] };
  assert.deepEqual(A.validateDraft(ok, true), []);
});

test('the saved payload trims, drops empty options and omits empty optional fields', () => {
  const d = { title: ' T ', description: ' ', durationMinutes: '30', questions: [{ question: ' Q ', options: ' a \n\nb ', correctAnswer: 'a', explanation: ' ' }] };
  assert.deepEqual(A.toInput(d, true), { title: 'T', durationMinutes: 30, questions: [{ question: 'Q', options: ['a', 'b'], correctAnswer: 'a' }] });
  assert.equal('durationMinutes' in A.toInput(d, false), false);
});
