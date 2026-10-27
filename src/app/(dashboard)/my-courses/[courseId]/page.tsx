'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { PersonalCourseView } from '@/components/library/PersonalCourses';

export default function MyCoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  return (
    <div className="animate-in fade-in duration-300 pb-12">
      <PersonalCourseView id={courseId} />
    </div>
  );
}
