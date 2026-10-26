'use client';

import { PracticeHub } from '@/components/practice/PracticeHub';

/** Real exams from the backend, graded server-side. (Previously a static prototype with an invented readiness score.) */
export default function ExamMainPage() {
  return <PracticeHub initialTab="exam" title="Exams" />;
}
