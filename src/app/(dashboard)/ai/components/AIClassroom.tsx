'use client';

import React, { useState } from 'react';
import { ArrowLeft, Send, Mic, Sparkles, CheckCircle2, Bot } from 'lucide-react';

export default function AIClassroom({ onBack }: { onBack: () => void }) {
  const [answer, setAnswer] = useState('');

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Header */}
      <div className="bg-white dark:bg-[#111827] px-6 py-4 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-purple-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200">
              Immersive AI Classroom
            </span>
            <h2 className="text-sm font-extrabold text-gray-900 dark:text-white mt-0.5">Electromagnetic Induction & Faraday&apos;s Law</h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] text-gray-400 font-bold uppercase">Progress</p>
            <p className="text-xs font-extrabold text-purple-600">Step 3 of 5</p>
          </div>
          <button onClick={onBack} className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors">
            Exit Classroom
          </button>
        </div>
      </div>

      {/* Main Split: Teaching Board & AI Teacher */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Teaching Board & Diagrams */}
        <div className="lg:col-span-2 bg-[#111827] text-white p-8 rounded-3xl border border-gray-800 shadow-lg space-y-6 relative overflow-hidden flex flex-col justify-between min-h-[420px]">
          <div className="absolute top-4 right-4 flex items-center gap-1.5 text-xs text-purple-400 font-mono bg-purple-950/40 px-3 py-1 rounded-full border border-purple-900/50">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Whiteboard</span>
          </div>

          <div className="space-y-4">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Core Principle</span>
            <h3 className="text-xl sm:text-2xl font-black">Faraday&apos;s Law of Induction</h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Whenever the magnetic flux linked through a circuit changes, an electromotive force (emf) is induced in the circuit proportional to the rate of change of magnetic flux.
            </p>

            <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 font-mono text-xs text-purple-300">
              {String.raw`$$\mathcal{E} = -N \frac{\Delta \Phi_B}{\Delta t}$$`}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-900/50 space-y-2">
            <p className="text-xs font-bold text-purple-300">Dr. Athena&apos;s Question to You:</p>
            <p className="text-xs text-white">
              &quot;If the number of turns $N$ doubles while keeping the rate of magnetic flux change constant, what happens to the induced emf $\mathcal$?&quot;
            </p>
          </div>
        </div>

        {/* Right 1 Col: AI Teacher Avatar & Student Response */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4 text-center">
            <div className="w-20 h-20 rounded-3xl bg-purple-600 border-4 border-purple-200 flex items-center justify-center mx-auto shadow-md">
              <Bot className="w-10 h-10 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">Dr. Athena</h4>
              <p className="text-[11px] text-purple-600 dark:text-purple-400 font-bold">Physics & Engineering Lead</p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
              &quot;Take your time and type your reasoning below. I am ready to evaluate your answer!&quot;
            </p>
          </div>

          <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-3">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Your Response</label>
            <textarea
              rows={3}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full p-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
            />
            <button className="w-full py-3 rounded-2xl bg-purple-600 text-white font-bold text-xs shadow-md hover:bg-purple-700 transition-all flex items-center justify-center gap-2">
              <span>Submit Answer</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}