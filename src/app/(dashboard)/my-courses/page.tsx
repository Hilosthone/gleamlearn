'use client';

import React from 'react';
import { PersonalCourseList } from '@/components/library/PersonalCourses';

/** The learner's private, self-made courses. */
export default function MyCoursesPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">My courses</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Courses you create for yourself.</p>
      </div>
      <PersonalCourseList />
    </div>
  );
}
