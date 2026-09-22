'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Sparkles, 
  BookOpen, 
  FileText, 
  HelpCircle, 
  CheckSquare, 
  Layers, 
  Edit, 
  Trash2, 
  RefreshCw,
  CheckCircle2,
  PlayCircle
} from 'lucide-react';

export default function GeneratedClassPage() {
  const router = useRouter();
  const params = useParams();
  const [activeTab, setActiveTab] = useState('topics');

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/library"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[var(--color-brand-blue)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Library</span>
        </Link>

        {/* Actions (Edit, Regenerate, Delete) */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => alert('Class regenerated successfully!')}
            className="px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Regenerate</span>
          </button>
          <button 
            onClick={() => router.push('/library')}
            className="px-3.5 py-2 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500/20 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Class Header Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-3xl text-white shadow-lg space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-md">
            AI-Generated Class 🎉
          </span>
          <span className="text-xs text-blue-100 font-medium">Derived from: CSC301_Notes.pdf</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
          Advanced Operating Systems & Kernel Threads
        </h1>

        <p className="text-sm text-blue-100 max-w-2xl leading-relaxed">
          Comprehensive masterclass covering process scheduling algorithms, deadlock prevention, memory paging, and kernel thread synchronization models.
        </p>

        <div className="pt-2 flex items-center gap-3">
          <Link
            href="/learn/lesson/lesson-3/ai-mode"
            className="px-6 py-3 rounded-2xl bg-white text-[var(--color-brand-blue)] font-bold text-xs shadow-md hover:bg-blue-50 transition-all flex items-center gap-2"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Start Learning Class</span>
          </Link>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
        {['topics', 'notes', 'questions', 'quizzes', 'flashcards'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
              activeTab === tab 
                ? 'bg-[var(--color-brand-blue)] text-white shadow-xs' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      <div className="bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-6">
        {activeTab === 'topics' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Curriculum Topics (12 Modules)</h3>
            <div className="space-y-3">
              {['Module 1: Introduction to Kernel Architecture', 'Module 2: Multithreading Models & User Space', 'Module 3: CPU Scheduling & Round Robin'].map((topic, i) => (
                <div key={i} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200">{topic}</span>
                  <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded">Ready</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Synthesized Study Notes</h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Kernel threads differ from user threads as they are managed directly by the operating system kernel. Context switching overhead is higher, but multi-processor parallelism is fully supported without user-space scheduler blocking.
            </p>
          </div>
        )}

        {activeTab === 'flashcards' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Generated Flashcards (48 Cards)</h3>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border border-purple-200 dark:border-purple-900/40 text-center space-y-3">
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">Card 1 of 48</span>
              <h4 className="text-base font-extrabold text-gray-900 dark:text-white">What is the primary benefit of Kernel Threads over User Threads?</h4>
              <p className="text-xs text-gray-500">Tap to flip answer</p>
            </div>
          </div>
        )}

        {activeTab !== 'topics' && activeTab !== 'notes' && activeTab !== 'flashcards' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize">{activeTab} Repository</h3>
            <p className="text-xs text-gray-500">AI-generated items loaded and ready for practice.</p>
          </div>
        )}
      </div>

    </div>
  );
}