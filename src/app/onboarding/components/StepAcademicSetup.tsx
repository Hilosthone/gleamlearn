'use client';

import React from 'react';
import { Input } from '@/components/ui/Input';

interface StepAcademicSetupProps {
  eduType: 'secondary' | 'university' | 'other';
  academicData: {
    institution: string;
    facultyOrClass: string;
    departmentOrSubject: string;
    levelOrTerm: string;
    semester: string;
  };
  setAcademicData: React.Dispatch<React.SetStateAction<any>>;
  onSkipLater: () => void;
}

export default function StepAcademicSetup({
  eduType,
  academicData,
  setAcademicData,
  onSkipLater,
}: StepAcademicSetupProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Academic Details</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {eduType === 'secondary' ? 'Provide your school and class level.' : 'Specify your university and degree specs.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onSkipLater}
          className="text-xs text-[var(--color-brand-blue)] hover:underline font-medium cursor-pointer"
        >
          Set up later
        </button>
      </div>

      <div className="space-y-4">
        {eduType === 'secondary' ? (
          <>
            <Input
              label="School Name"
              placeholder="e.g. Federal Government College"
              value={academicData.institution}
              onChange={(e) => setAcademicData({ ...academicData, institution: e.target.value })}
            />
            <Input
              label="Class / Grade"
              placeholder="e.g. Senior Secondary 3 (SS3)"
              value={academicData.facultyOrClass}
              onChange={(e) => setAcademicData({ ...academicData, facultyOrClass: e.target.value })}
            />
            <Input
              label="Academic Session / Term"
              placeholder="e.g. 2025/2026 - First Term"
              value={academicData.levelOrTerm}
              onChange={(e) => setAcademicData({ ...academicData, levelOrTerm: e.target.value })}
            />
            <Input
              label="Core Subjects"
              placeholder="e.g. Mathematics, Physics, Chemistry, English"
              value={academicData.departmentOrSubject}
              onChange={(e) => setAcademicData({ ...academicData, departmentOrSubject: e.target.value })}
            />
          </>
        ) : (
          <>
            <Input
              label="University / Institution"
              placeholder="e.g. Obafemi Awolowo University"
              value={academicData.institution}
              onChange={(e) => setAcademicData({ ...academicData, institution: e.target.value })}
            />
            <Input
              label="Faculty / College"
              placeholder="e.g. Faculty of Technology"
              value={academicData.facultyOrClass}
              onChange={(e) => setAcademicData({ ...academicData, facultyOrClass: e.target.value })}
            />
            <Input
              label="Department / Course of Study"
              placeholder="e.g. Computer Science and Engineering"
              value={academicData.departmentOrSubject}
              onChange={(e) => setAcademicData({ ...academicData, departmentOrSubject: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Level"
                placeholder="e.g. 200 Level"
                value={academicData.levelOrTerm}
                onChange={(e) => setAcademicData({ ...academicData, levelOrTerm: e.target.value })}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Semester</label>
                <select
                  value={academicData.semester}
                  onChange={(e) => setAcademicData({ ...academicData, semester: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#111827] border border-gray-300 dark:border-[#1F2937] text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)] cursor-pointer"
                >
                  <option value="First Semester">First Semester</option>
                  <option value="Second Semester">Second Semester</option>
                </select>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}