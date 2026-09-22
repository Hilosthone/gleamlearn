'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  BookOpen, 
  ArrowLeft, 
  Clock, 
  Award, 
  CheckCircle2, 
  PlayCircle, 
  Target, 
  HelpCircle, 
  Bot, 
  Sparkles,
  BarChart3
} from 'lucide-react';

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params?.courseId || 'csc-201';

  // Mock course data matching the ID
  const courseData: Record<string, any> = {
    'csc-201': {
      title: 'Data Structures & Algorithms',
      code: 'CSC 201',
      category: 'University',
      description: 'Master fundamental data structures including arrays, linked lists, stacks, queues, trees, graphs, and sorting/searching algorithms with practical implementation notes.',
      progress: 72,
      mastery: 85,
      studyTime: '18h 45m',
      quizzesCompleted: 14,
      topics: [
        {
          id: 1,
          name: 'Module 1: Introduction to Asymptotic Analysis & Big-O Notation',
          progress: 100,
          difficulty: 'Intermediate',
          mastery: '92%',
          status: 'Completed',
        },
        {
          id: 2,
          name: 'Module 2: Linear Structures (Stacks, Queues & Linked Lists)',
          progress: 100,
          difficulty: 'Beginner',
          mastery: '88%',
          status: 'Completed',
        },
        {
          id: 3,
          name: 'Module 3: Advanced Tree Traversals & AVL Rebalancing',
          progress: 72,
          difficulty: 'Advanced',
          mastery: '75%',
          status: 'In Progress',
        },
        {
          id: 4,
          name: 'Module 4: Graph Theory & Shortest Path Algorithms (Dijkstra)',
          progress: 15,
          difficulty: 'Advanced',
          mastery: '40%',
          status: 'Not Started',
        },
        {
          id: 5,
          name: 'Module 5: Dynamic Programming & Memoization Strategies',
          progress: 0,
          difficulty: 'Expert',
          mastery: '0%',
          status: 'Locked',
        },
      ]
    }
  };

  const course = courseData[courseId as string] || courseData['csc-201'];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Back Navigation & Breadcrumb */}
      <div>
        <Link 
          href="/learn" 
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[var(--color-brand-blue)] transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Learning Hub</span>
        </Link>

        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/15 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-3 z-10 relative">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-md">
                {course.code}
              </span>
              <span className="text-xs font-semibold text-blue-100">
                {course.category} Curriculum
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {course.title}
            </h1>

            <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
              {course.description}
            </p>
          </div>
        </div>
      </div>

      {/* Course Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Completion Card */}
        <div className="bg-white dark:bg-[#111827] p-5 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-gray-400">Course Completion</span>
          <p className="text-2xl font-black text-gray-900 dark:text-white">{course.progress}%</p>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-[var(--color-brand-blue)] rounded-full" style={{ width: `${course.progress}%` }} />
          </div>
        </div>

        {/* Mastery Card */}
        <div className="bg-white dark:bg-[#111827] p-5 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-gray-400">Concept Mastery</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{course.mastery}%</p>
          <p className="text-[11px] text-emerald-600 font-medium">Distinction level</p>
        </div>

        {/* Study Time Card */}
        <div className="bg-white dark:bg-[#111827] p-5 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-gray-400">Total Study Time</span>
          <p className="text-2xl font-black text-gray-900 dark:text-white">{course.studyTime}</p>
          <p className="text-[11px] text-gray-400">Across 12 active sessions</p>
        </div>

        {/* Quizzes Completed Card */}
        <div className="bg-white dark:bg-[#111827] p-5 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-gray-400">Quizzes Passed</span>
          <p className="text-2xl font-black text-gray-900 dark:text-white">{course.quizzesCompleted}</p>
          <p className="text-[11px] text-[var(--color-brand-blue)] font-medium">Avg score: 88%</p>
        </div>
      </div>

      {/* Topics & Modules Breakdown */}
      <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[var(--color-brand-blue)]" />
            <span>Course Modules & Topics ({course.topics.length})</span>
          </h2>
          <Link href="/ai" className="text-xs font-bold text-[var(--color-brand-blue)] hover:underline flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Generate Custom AI Quiz</span>
          </Link>
        </div>

        <div className="space-y-4">
          {course.topics.map((topic: any, idx: number) => (
            <div 
              key={topic.id}
              className="p-5 rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-200/70 dark:border-gray-800 space-y-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/50 text-[var(--color-brand-blue)]">
                      Module {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-gray-400">
                      Difficulty: <strong className="text-gray-700 dark:text-gray-300">{topic.difficulty}</strong>
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                      Mastery: {topic.mastery}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {topic.name}
                  </h3>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    topic.status === 'Completed' 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400' 
                      : topic.status === 'In Progress' 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400'
                      : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {topic.status}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500 font-medium">
                  <span>Topic Progress</span>
                  <span>{topic.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--color-brand-blue)] rounded-full" style={{ width: `${topic.progress}%` }} />
                </div>
              </div>

              {/* Action Buttons: Continue, Practice, Take test, Generate quiz, Ask AI */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200/60 dark:border-gray-700/60">
                <Link
                  href={`/learn/${courseId}/lesson-${topic.id}`}
                  className="px-4 py-2 rounded-xl bg-[var(--color-brand-blue)] text-white font-bold text-xs shadow-xs hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>Continue</span>
                </Link>

                <Link
                  href="/practice"
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-xs border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                >
                  <Target className="w-3.5 h-3.5 text-blue-500" />
                  <span>Practice</span>
                </Link>

                <Link
                  href="/exams"
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-xs border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Take Test</span>
                </Link>

                <Link
                  href="/ai"
                  className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold text-xs border border-amber-200/60 dark:border-amber-900/40 hover:bg-amber-100 transition-colors flex items-center gap-1.5 ml-auto"
                >
                  <Bot className="w-3.5 h-3.5 text-amber-500" />
                  <span>Ask AI Tutor</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}