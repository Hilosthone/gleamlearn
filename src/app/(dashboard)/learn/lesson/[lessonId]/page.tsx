'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Bot, 
  Sparkles, 
  BookOpen, 
  Lightbulb, 
  Code2, 
  Check,
  Maximize2
} from 'lucide-react';

export default function LessonPage() {
  const params = useParams();
  const courseId = params?.courseId || 'csc-201';
  const lessonId = params?.lessonId || 'lesson-3';

  const [isCompleted, setIsCompleted] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-in fade-in duration-300">
      
      {/* Top Distraction-Free Navigation Bar */}
      <div className="flex items-center justify-between bg-white dark:bg-[#111827] px-6 py-4 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs sticky top-4 z-20 backdrop-blur-md bg-opacity-90 dark:bg-opacity-90">
        <Link
          href={`/learn/${courseId}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[var(--color-brand-blue)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Course Details</span>
        </Link>

        {/* Progress Tracker */}
        <div className="hidden sm:flex items-center gap-3">
          <span className="text-xs text-gray-400 font-medium">Lesson Progress: 72%</span>
          <div className="w-28 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-[var(--color-brand-blue)] rounded-full" style={{ width: '72%' }} />
          </div>
        </div>

        {/* AI Teaching Mode Shortcut */}
        <Link
          href={`/learn/${courseId}/${lessonId}/ai-mode`}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs shadow-sm hover:opacity-95 transition-all flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Launch AI Teacher</span>
        </Link>
      </div>

      {/* Lesson Header */}
      <div className="space-y-3 px-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/50 text-[var(--color-brand-blue)]">
            Module 3 • Advanced Trees
          </span>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded">
            Estimated read: 12 mins
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
          Binary Search Trees (BST) & AVL Rebalancing Algorithms
        </h1>

        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          Explore tree rotation mechanics, balance factors, and how AVL trees guarantee $O(\log n)$ search time complexity under dynamic workloads.
        </p>
      </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-[#111827] p-6 sm:p-10 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-8 text-gray-800 dark:text-gray-200 leading-relaxed">
        
        {/* Section 1 */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-[var(--color-brand-blue)] text-white text-xs flex items-center justify-center font-black">1</span>
            <span>Why Balanced Trees Matter</span>
          </h2>
          <p className="text-sm">
            In standard Binary Search Trees (BST), insertions performed in sorted order can degrade tree structure into a linear linked list, causing search time complexity to plummet from $O(\log n)$ down to $O(n)$. 
          </p>
          <p className="text-sm">
            Adelson-Velsky and Landis (AVL) trees solve this by enforcing a strict balance invariant: the difference in height between the left and right subtrees of any node cannot exceed 1.
          </p>
        </div>

        {/* Diagram / Code Placeholder Box */}
        <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-[var(--color-brand-blue)]" />
              <span>Balance Factor Calculation Example</span>
            </span>
            <span className="text-[11px] bg-blue-100 dark:bg-blue-950/50 text-[var(--color-brand-blue)] px-2 py-0.5 rounded font-mono">Python / C++</span>
          </div>
          <pre className="p-4 rounded-xl bg-gray-900 text-gray-100 font-mono text-xs overflow-x-auto leading-relaxed">
{`def get_balance(node):
    if not node:
        return 0
    return height(node.left) - height(node.right)
    
# If balance factor > 1 or < -1, tree rotation is triggered.`}</pre>
        </div>

        {/* Section 2 */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-[var(--color-brand-blue)] text-white text-xs flex items-center justify-center font-black">2</span>
            <span>Single & Double Rotations (LL, RR, LR, RL)</span>
          </h2>
          <p className="text-sm">
            When an imbalance occurs during node insertion, the tree applies rotations to restore balance:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li><strong className="text-gray-900 dark:text-white">Left-Left (LL) Case:</strong> Fixed with a single right rotation.</li>
            <li><strong className="text-gray-900 dark:text-white">Right-Right (RR) Case:</strong> Fixed with a single left rotation.</li>
            <li><strong className="text-gray-900 dark:text-white">Left-Right (LR) Case:</strong> Fixed with a left rotation on child followed by a right rotation on parent.</li>
          </ul>
        </div>

        {/* Key Points Takeaway Box */}
        <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 space-y-3">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold text-sm">
            <Lightbulb className="w-4 h-4 text-[var(--color-brand-blue)]" />
            <span>Key Takeaways</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300">
            AVL trees guarantee worst-case logarithmic search, insertion, and deletion times at the minor cost of maintaining balance factor metadata at each node.
          </p>
        </div>

      </div>

      {/* Lesson Footer Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
        <button
          onClick={() => setIsCompleted(!isCompleted)}
          className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm ${
            isCompleted 
              ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'text-white' : 'text-emerald-500'}`} />
          <span>{isCompleted ? 'Lesson Completed ✓' : 'Mark as Complete'}</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <Link
            href={`/learn/${courseId}/lesson-2`}
            className="px-5 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-200 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </Link>
          <Link
            href={`/learn/${courseId}/lesson-4`}
            className="px-6 py-3 rounded-2xl bg-[var(--color-brand-blue)] text-white font-bold text-xs shadow-md hover:bg-blue-700 transition-colors flex items-center gap-1.5"
          >
            <span>Next Lesson</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

    </div>
  );
}