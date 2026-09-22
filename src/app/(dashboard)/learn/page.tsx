//app/(dashboard)/learn/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Sparkles, 
  PlayCircle, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  GraduationCap, 
  BookMarked,
  ArrowRight
} from 'lucide-react';

export default function LearnPage() {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter categories
  const filters = ['All', 'University', 'Secondary', 'Examination', 'Custom'];

  // Mock courses data mapped to user profile interests
  const courses = [
    {
      id: 'csc-201',
      title: 'Data Structures & Algorithms',
      code: 'CSC 201',
      category: 'University',
      progress: 72,
      totalModules: 12,
      completedModules: 9,
      lastAccessed: '2 hours ago',
      imageBg: 'from-blue-600 to-indigo-700',
    },
    {
      id: 'mth-202',
      title: 'Advanced Linear Algebra & Calculus',
      code: 'MTH 202',
      category: 'University',
      progress: 45,
      totalModules: 10,
      completedModules: 4,
      lastAccessed: 'Yesterday',
      imageBg: 'from-purple-600 to-indigo-800',
    },
    {
      id: 'phy-101',
      title: 'General Physics & Mechanics',
      code: 'PHY 101',
      category: 'University',
      progress: 90,
      totalModules: 8,
      completedModules: 7,
      lastAccessed: '3 days ago',
      imageBg: 'from-emerald-600 to-teal-700',
    },
    {
      id: 'waec-chem',
      title: 'Senior Secondary Chemistry Mastery',
      code: 'CHEM 301',
      category: 'Secondary',
      progress: 20,
      totalModules: 15,
      completedModules: 3,
      lastAccessed: '1 week ago',
      imageBg: 'from-amber-600 to-orange-700',
    },
  ];

  // Filtered courses based on selected tab and search query
  const filteredCourses = courses.filter((course) => {
    const matchesFilter = selectedFilter === 'All' || course.category === selectedFilter;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          course.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Learning Hub 📚
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Master your subjects, review weak topics, and track your curriculum progress.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses or codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)] shadow-xs"
          />
        </div>
      </div>

      {/* 2. Filter Tabs (University, Secondary, Examination, Custom) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedFilter === filter
                ? 'bg-[var(--color-brand-blue)] text-white shadow-md shadow-blue-500/20'
                : 'bg-white dark:bg-[#111827] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* 3. Continue Learning / Recently Opened Spotlight */}
      <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--color-brand-blue)]" />
            <span>Recently Opened & Continue</span>
          </h2>
          <span className="text-xs text-gray-400">Last session: 2 hrs ago</span>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/80 to-indigo-50/40 dark:from-blue-950/30 dark:to-indigo-950/10 border border-blue-100 dark:border-blue-900/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-blue-600 text-white">
                CSC 201
              </span>
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                Module 3: Advanced Tree Traversals
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
              Binary Search Trees (BST) & Rebalancing Algorithms
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 max-w-xl leading-relaxed">
              Understand AVL trees, rotations, and time complexity trade-offs during insertion and deletion operations.
            </p>
          </div>

          <Link
            href="/learn/csc-201"
            className="px-6 py-3 rounded-2xl bg-[var(--color-brand-blue)] text-white font-bold text-sm shadow-md hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shrink-0 group"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Resume Lesson</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* 4. Weak Topics Alert Box */}
      <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-200 dark:border-amber-900/40 flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1 flex-1">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center justify-between">
            <span>Weak Topics Identified by AI</span>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">2 topics need attention</span>
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            Based on your recent quizzes, you scored below 60% in <strong className="text-gray-900 dark:text-white">Matrix Eigenvalues (MTH 202)</strong> and <strong className="text-gray-900 dark:text-white">Graph Theory (CSC 201)</strong>.
          </p>
          {/* <div className="pt-2 flex items-center gap-3">
            <Link href="/lesson/ai-mode" className="text-xs font-bold bg-amber-500 text-white px-3.5 py-2 rounded-xl shadow-xs hover:bg-amber-600 transition-colors">
              Launch Targeted AI Revision
            </Link>
          </div> */}
          <div className="pt-2 flex items-center gap-3">
            <Link 
              href="/learn/lesson/lesson-3/ai-mode" 
              className="text-xs font-bold bg-amber-500 text-white px-3.5 py-2 rounded-xl shadow-xs hover:bg-amber-600 transition-colors flex items-center gap-1.5 w-fit"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Targeted AI Revision</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 5. My Courses Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-[var(--color-brand-blue)]" />
            <span>My Courses & Subjects ({filteredCourses.length})</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredCourses.map((course) => (
            <div 
              key={course.id}
              className="bg-white dark:bg-[#111827] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-extrabold px-3 py-1 rounded-full text-white bg-gradient-to-r ${course.imageBg} shadow-xs`}>
                    {course.code}
                  </span>
                  <span className="text-xs font-semibold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-lg">
                    {course.category}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                    {course.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {course.completedModules} of {course.totalModules} modules completed
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                    <span>Course Progress</span>
                    <span className="text-[var(--color-brand-blue)]">{course.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[var(--color-brand-blue)] rounded-full transition-all duration-500" 
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-6 py-3.5 bg-gray-50 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span className="text-[11px] text-gray-400">Accessed {course.lastAccessed}</span>
                <Link
                  href={`/learn/${course.id}`}
                  className="text-xs font-bold text-[var(--color-brand-blue)] hover:underline flex items-center gap-1"
                >
                  <span>Open Course</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Completed Courses Section */}
      <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span>Completed Courses & Badges</span>
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">GST 101: Use of English</h4>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">100% Score • Badge Earned</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">CIT 101: Intro to Computers</h4>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">94% Score • Badge Earned</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}