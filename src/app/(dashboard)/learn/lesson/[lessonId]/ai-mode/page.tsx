'use client';

import React, { useState } from 'react';
import Link from 'next/navigation';
import { useParams, useRouter } from 'next/navigation';
import { 
  Bot, 
  Sparkles, 
  Mic, 
  MicOff, 
  Pause, 
  Play, 
  RotateCcw, 
  Sliders, 
  Send, 
  ArrowLeft, 
  HelpCircle,
  Volume2,
  CheckCircle
} from 'lucide-react';

export default function AITeachingModePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.courseId || 'csc-201';
  const lessonId = params?.lessonId || 'lesson-3';

  const [isSpeaking, setIsSpeaking] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [chatLog, setChatLog] = useState([
    {
      sender: 'ai',
      text: "Hello! I'm your AI Teacher. Today we are unpacking AVL Tree Rebalancing and Rotations. Imagine you have a tower of blocks that is leaning too far to the left. How would you straighten it out?"
    }
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const newMsg = userInput;
    setUserInput('');
    setChatLog(prev => [...prev, { sender: 'user', text: newMsg }]);

    // Simulate AI response
    setTimeout(() => {
      setChatLog(prev => [
        ...prev, 
        { 
          sender: 'ai', 
          text: `Spot on! Exactly. By applying a single rotation in the opposite direction, we restore equilibrium. Let's look at the next step: how does this affect our $O(\log n)$ search time?` 
        }
      ]);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0b0f19] text-white flex flex-col overflow-hidden animate-in fade-in duration-300">
      
      {/* Top Header Bar */}
      <div className="h-16 px-6 border-b border-gray-800 flex items-center justify-between bg-[#111827]/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                AI Interactive Teacher Mode
              </span>
              <span className="text-xs text-gray-400">CSC 201 • Module 3</span>
            </div>
            <h1 className="text-sm font-bold text-white">AVL Tree Rotations & Balance Factors</h1>
          </div>
        </div>

        {/* Action Controls: Pause, Repeat, Simplify, End */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsPaused(!isPaused)}
            className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isPaused ? 'Resume Audio' : 'Pause Lesson'}</span>
          </button>

          <button 
            onClick={() => setChatLog(prev => [...prev, { sender: 'ai', text: "Let's simplify that: Think of an AVL tree as a weighing scale. Whenever one side gets heavier by 2 units, we shift weights to balance it back out." }])}
            className="px-3.5 py-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Simplify Explanation</span>
          </button>

          <button 
            onClick={() => router.back()}
            className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 text-xs font-bold transition-colors"
          >
            End Lesson
          </button>
        </div>
      </div>

      {/* Main Split Screen Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* Left Visual Whiteboard / Diagram Area */}
        <div className="lg:col-span-7 bg-[#0f172a] p-8 flex flex-col justify-between border-r border-gray-800/80 overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Bot className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>AI Teacher Whiteboard</span>
              </span>
              <span className="text-xs text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-3 py-1 rounded-full flex items-center gap-1.5 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Speaking Active
              </span>
            </div>

            {/* Simulated Dynamic Diagram Box */}
            <div className="p-8 rounded-3xl bg-[#111827] border border-gray-800 flex flex-col items-center justify-center min-h-[320px] text-center space-y-6 relative shadow-2xl">
              <div className="absolute top-4 left-4 text-xs text-gray-500 font-mono">Visualizing: Right Rotation (LL Imbalance)</div>
              
              <div className="flex items-center gap-6 pt-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-black flex items-center justify-center shadow-lg text-lg">
                  30
                </div>
              </div>
              <div className="w-0.5 h-8 bg-blue-500/50" />
              <div className="flex items-center gap-12">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black flex items-center justify-center shadow-md">
                  20
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gray-800 text-gray-400 font-bold flex items-center justify-center border border-gray-700">
                  40
                </div>
              </div>
              <p className="text-xs text-gray-400 max-w-md pt-2">
                Node 30 is unbalanced (BF = +2). Right rotation pivots node 20 to the top root position.
              </p>
            </div>
          </div>

          {/* Quick Voice Bar */}
          <div className="pt-6 flex items-center justify-between bg-[#111827]/60 p-4 rounded-2xl border border-gray-800 mt-6">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSpeaking(!isSpeaking)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isSpeaking ? 'bg-amber-500 text-white shadow-md' : 'bg-gray-800 text-gray-400'}`}
              >
                {isSpeaking ? <Volume2 className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
              <div>
                <p className="text-xs font-bold text-white">Voice Companion Mode</p>
                <p className="text-[11px] text-gray-400">Speak naturally to answer questions or ask for help</p>
              </div>
            </div>

            <button 
              onClick={() => setChatLog(prev => [...prev, { sender: 'ai', text: "Let's repeat that concept with another analogy..." }])}
              className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Repeat Explanation</span>
            </button>
          </div>
        </div>

        {/* Right Chat Dialogue & Interactive Question Area */}
        <div className="lg:col-span-5 bg-[#111827] flex flex-col justify-between h-full overflow-hidden">
          
          {/* Chat Messages Log */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {chatLog.map((msg, index) => (
              <div 
                key={index}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md font-bold text-xs">
                    AI
                  </div>
                )}
                <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[85%] ${
                  msg.sender === 'user' 
                    ? 'bg-[var(--color-brand-blue)] text-white rounded-br-xs' 
                    : 'bg-gray-800/80 text-gray-200 border border-gray-700/60 rounded-bl-xs'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Question / Answer Input Form */}
          <div className="p-4 border-t border-gray-800 bg-[#0f172a]">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type your answer or ask AI anything..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="flex-1 px-4 py-3 rounded-2xl bg-[#111827] border border-gray-800 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-2xl bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 transition-colors shadow-md flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}