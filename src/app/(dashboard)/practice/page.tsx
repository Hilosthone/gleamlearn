'use client';

import { PracticeHub } from '@/components/practice/PracticeHub';

/** Real quizzes and tests from the backend, plus AI practice. (Previously a static prototype with invented scores.) */
export default function PracticeMainPage() {
  return <PracticeHub initialTab="quiz" title="Practice" />;
}
