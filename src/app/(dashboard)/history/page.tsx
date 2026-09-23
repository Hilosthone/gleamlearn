'use client';

import React, { useState } from 'react';
import { 
  History, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  FileText, 
  MessageSquare, 
  HelpCircle, 
  Award, 
  ExternalLink,
  Search,
  Filter,
  BookmarkCheck,
  Layers,
  GraduationCap
} from 'lucide-react';

type HistoryView = 'learning' | 'assessment' | 'ai';

export default function HistoryHub() {
  const [activeView, setActiveView] = useState<HistoryView>('learning');
  
  // Assessment History tabs & Search
  const [assessmentTab, setAssessmentTab] = useState<'quizzes' | 'tests' | 'exams'>('quizzes');
  const [learningSearchQuery, setLearningSearchQuery] = useState('');
  const [aiSearchQuery, setAiSearchQuery] = useState('');

  // Extended mock data for Learning History
  const learningLogs = [
    { id: 1, title: 'Maxwell-Faraday Equation Derivations', course: 'Physics 401', duration: '45 mins', date: 'Today, 2:30 PM', type: 'Lesson', category: 'Electrodynamics' },
    { id: 2, title: 'Eigenvalues and Diagonalization Matrices', course: 'Advanced Calculus IV', duration: '1 hr 15 mins', date: 'Yesterday', type: 'Study Session', category: 'Linear Algebra' },
    { id: 3, title: 'Wave Function Normalization Principles', course: 'Quantum Mechanics', duration: '50 mins', date: 'Sep 21, 2026', type: 'Lesson', category: 'Quantum Physics' },
    { id: 4, title: 'Vector Space Basis Transformations', course: 'Linear Algebra', duration: '1 hr 30 mins', date: 'Sep 20, 2026', type: 'Course Module', category: 'Mathematics' },
    { id: 5, title: 'Asynchronous State Management & Redux Toolkit', course: 'Full-Stack Web Engineering', duration: '2 hrs 00 mins', date: 'Sep 19, 2026', type: 'Study Session', category: 'Frontend Architecture' },
    { id: 6, title: 'RESTful API Rate Limiting & Redis Caching', course: 'Backend Systems', duration: '1 hr 10 mins', date: 'Sep 17, 2026', type: 'Lesson', category: 'Backend Engineering' }
  ];

  const activeCoursesHistory = [
    { title: 'Advanced Electrodynamics', progress: '85%', completedModules: '17 / 20', lastStudied: 'Today', status: 'In Progress' },
    { title: 'Quantum Mechanics II', progress: '62%', completedModules: '10 / 16', lastStudied: 'Sep 21, 2026', status: 'In Progress' },
    { title: 'Full-Stack Mobile App Architecture', progress: '100%', completedModules: '24 / 24', lastStudied: 'Sep 15, 2026', status: 'Mastered' },
    { title: 'Advanced Linear Algebra', progress: '100%', completedModules: '18 / 18', lastStudied: 'Sep 10, 2026', status: 'Mastered' }
  ];

  // Extended mock data for Assessment History
  const assessmentData = {
    quizzes: [
      { name: 'Electromagnetism Mastery Quiz', date: 'Sep 22, 2026', score: '95%', difficulty: 'Advanced', time: '14 mins', status: 'Passed', questionsCount: 15 },
      { name: 'Vector Calculus Quick Check', date: 'Sep 16, 2026', score: '90%', difficulty: 'Intermediate', time: '10 mins', status: 'Passed', questionsCount: 10 },
      { name: 'React Native Navigation Checkpoint', date: 'Sep 12, 2026', score: '100%', difficulty: 'Advanced', time: '12 mins', status: 'Passed', questionsCount: 12 },
      { name: 'Node.js Security Protocols Quiz', date: 'Sep 08, 2026', score: '85%', difficulty: 'Expert', time: '18 mins', status: 'Passed', questionsCount: 20 }
    ],
    tests: [
      { name: 'Vector Calculus Midterm Test', date: 'Sep 18, 2026', score: '88%', difficulty: 'Expert', time: '42 mins', status: 'Passed', questionsCount: 35 },
      { name: 'Quantum Mechanics Unit Assessment', date: 'Sep 14, 2026', score: '92%', difficulty: 'Advanced', time: '28 mins', status: 'Passed', questionsCount: 25 },
      { name: 'Database Schema Normalization Test', date: 'Sep 06, 2026', score: '78%', difficulty: 'Advanced', time: '35 mins', status: 'Passed', questionsCount: 30 }
    ],
    exams: [
      { name: 'Linear Algebra Semester Exam', date: 'Sep 05, 2026', score: '84%', difficulty: 'Master', time: '1 hr 15 mins', status: 'Passed', questionsCount: 50 },
      { name: 'Full-Stack Engineering Certification Exam', date: 'Aug 28, 2026', score: '91%', difficulty: 'Master', time: '1 hr 45 mins', status: 'Passed', questionsCount: 60 }
    ]
  };

  // Extended mock data for AI History
  const aiHistoryItems = [
    { title: 'Previous AI Tutor Chat: Electromagnetic Induction', desc: 'Detailed walkthrough of Lenz\'s law, magnetic flux variations, and induced EMF calculations.', type: 'Chat', count: '14 messages', date: 'Today, 3:15 PM', icon: MessageSquare },
    { title: 'Generated Practice Quiz: Vector Fields & Tensors', desc: 'Custom 15-question practice assessment generated based on weak spots in calculus.', type: 'Quiz', count: '15 questions', date: 'Yesterday', icon: HelpCircle },
    { title: 'AI Generated Study Notes: Quantum State Superposition', desc: 'Comprehensive summary notes breaking down Dirac notation and probabilistic state collapse.', type: 'Notes', count: '3 pages', date: 'Sep 21, 2026', icon: FileText },
    { title: 'Saved AI Explanations: Maxwell\'s Displacement Current', desc: 'Step-by-step simplification of why changing electric fields produce magnetic fields.', type: 'Explanation', count: 'Saved item', date: 'Sep 19, 2026', icon: Sparkles },
    { title: 'Previous AI Tutor Chat: PostgreSQL Indexing Strategies', desc: 'Discussion on B-Tree indexes, query execution plans, and optimization techniques for high-load tables.', type: 'Chat', count: '22 messages', date: 'Sep 17, 2026', icon: MessageSquare },
    { title: 'Generated Practice Quiz: Advanced React Hooks', desc: 'Targeted quiz focusing on useMemo, useCallback, and custom hook lifecycle management.', type: 'Quiz', count: '10 questions', date: 'Sep 15, 2026', icon: HelpCircle }
  ];

  // Filter learning logs based on search query
  const filteredLearningLogs = learningLogs.filter(item => 
    item.title.toLowerCase().includes(learningSearchQuery.toLowerCase()) ||
    item.course.toLowerCase().includes(learningSearchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(learningSearchQuery.toLowerCase())
  );

  // Filter AI items based on search query
  const filteredAiItems = aiHistoryItems.filter(item =>
    item.title.toLowerCase().includes(aiSearchQuery.toLowerCase()) ||
    item.desc.toLowerCase().includes(aiSearchQuery.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen pb-16 space-y-8 animate-in fade-in duration-300">
      
      {/* Navigation Sub-Header / View Switcher */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 bg-white dark:bg-[#111827] p-4 sm:px-8 sm:py-5 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-500/10 text-[#2563EB] border border-blue-200/50">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white">Activity & Archives Hub</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Review past lessons, test performance history, and saved AI interactions.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full xl:w-auto overflow-x-auto pb-1 xl:pb-0">
          {[
            { id: 'learning', label: 'Learning History', icon: BookOpen },
            { id: 'assessment', label: 'Assessment History', icon: CheckCircle2 },
            { id: 'ai', label: 'AI History', icon: Sparkles },
          ].map((v) => {
            const Icon = v.icon;
            const isActive = activeView === v.id;
            return (
              <button
                key={v.id}
                onClick={() => setActiveView(v.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{v.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 53. LEARNING HISTORY                                     */}
      {/* ========================================================= */}
      {activeView === 'learning' && (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Completed Lessons</span>
              <h3 className="text-2xl sm:text-3xl font-black text-[#2563EB]">184</h3>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-bold">+12 completed this week</p>
            </div>
            <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Active Courses</span>
              <h3 className="text-2xl sm:text-3xl font-black text-[#7C3AED]">6 Courses</h3>
              <p className="text-xs text-purple-600 dark:text-purple-400 font-bold">2 fully mastered</p>
            </div>
            <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Total Study Sessions</span>
              <h3 className="text-2xl sm:text-3xl font-black text-[#10B981]">92 Sessions</h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Average 1.5 hrs/session</p>
            </div>
            <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Time Spent Learning</span>
              <h3 className="text-2xl sm:text-3xl font-black text-[#F97316]">142.5 hrs</h3>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-bold">Consistent daily tracking</p>
            </div>
          </div>

          {/* Courses & Study Sessions Overview Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active & Mastered Courses */}
            <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-5 lg:col-span-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#7C3AED]" /> Courses Track
                </h3>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-500/10 text-[#7C3AED]">
                  6 Enrolled
                </span>
              </div>
              <div className="space-y-3">
                {activeCoursesHistory.map((course, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">{course.title}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        course.status === 'Mastered' 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      }`}>
                        {course.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                      <span>Modules: {course.completedModules}</span>
                      <span>{course.progress}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${course.status === 'Mastered' ? 'bg-[#10B981]' : 'bg-[#2563EB]'}`}
                        style={{ width: course.progress }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Learning Log */}
            <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-6 lg:col-span-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#2563EB]" /> Lessons & Study Sessions Log
                </h3>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={learningSearchQuery}
                      onChange={(e) => setLearningSearchQuery(e.target.value)}
                      placeholder="Search past lessons..."
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {filteredLearningLogs.length > 0 ? (
                  filteredLearningLogs.map((item) => (
                    <div key={item.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-500/10 text-[#2563EB]">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">{item.title}</h4>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            {item.course} • <span className="text-blue-600 dark:text-blue-400 font-semibold">{item.type}</span> • <span className="text-purple-600 dark:text-purple-400">{item.category}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-bold text-gray-500 dark:text-gray-400 w-full sm:w-auto justify-between sm:justify-end">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {item.duration}</span>
                        <span className="text-[11px] bg-gray-200 dark:bg-gray-800 px-2.5 py-1 rounded-lg">{item.date}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-xs text-gray-400">
                    No matching learning logs found for "{learningSearchQuery}".
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 54. ASSESSMENT HISTORY                                   */}
      {/* ========================================================= */}
      {activeView === 'assessment' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Assessment History Archive</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Review past scores, difficulty ratings, time elapsed, question totals, and complete item reviews.</p>
              </div>

              {/* Tabs: Quizzes, Tests, Exams */}
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 p-1.5 rounded-2xl w-full sm:w-auto">
                {[
                  { id: 'quizzes', label: 'Quizzes' },
                  { id: 'tests', label: 'Tests' },
                  { id: 'exams', label: 'Exams' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setAssessmentTab(tab.id as any)}
                    className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      assessmentTab === tab.id
                        ? 'bg-white dark:bg-[#111827] text-gray-900 dark:text-white shadow-xs'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.label} ({assessmentData[tab.id as keyof typeof assessmentData].length})
                  </button>
                ))}
              </div>
            </div>

            {/* Assessment Items List */}
            <div className="space-y-3">
              {assessmentData[assessmentTab].map((item, i) => (
                <div key={i} className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-emerald-500/10 text-[#10B981]">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">{item.name}</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {item.date} • Questions: <strong className="text-gray-600 dark:text-gray-300">{item.questionsCount}</strong> • Difficulty: <strong className="text-purple-600 dark:text-purple-400">{item.difficulty}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
                    <div className="text-left lg:text-right">
                      <span className="text-sm font-black text-[#10B981]">{item.score}</span>
                      <p className="text-[10px] text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {item.time}</p>
                    </div>
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400 text-xs font-bold border border-blue-200/50 hover:bg-blue-100 transition-all">
                      <span>Review Details</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 55. AI HISTORY                                           */}
      {/* ========================================================= */}
      {activeView === 'ai' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-500/10 text-[#7C3AED] border border-purple-200">
                  AI Knowledge Vault
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white mt-2">Saved AI Interactions & Generated Content</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Access previous AI tutor conversations, generated study notes, practice quizzes, and explanations.</p>
              </div>

              {/* Search AI History */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={aiSearchQuery}
                  onChange={(e) => setAiSearchQuery(e.target.value)}
                  placeholder="Search AI archive..."
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAiItems.length > 0 ? (
                filteredAiItems.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="p-6 rounded-3xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-4 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="p-3 rounded-2xl bg-[#7C3AED]/10 text-[#7C3AED]">
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-500/10 text-[#7C3AED] border border-purple-200">
                            {item.type}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">{item.title}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.desc}</p>
                        </div>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between text-[11px] text-gray-400">
                          <span>{item.count}</span>
                          <span>{item.date}</span>
                        </div>
                        <button className="w-full py-2.5 rounded-xl bg-[#7C3AED] text-white text-xs font-bold hover:bg-purple-700 transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-purple-500/20">
                          <span>Open Archive</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-12 text-center text-xs text-gray-400">
                  No matching AI archives found for "{aiSearchQuery}".
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}