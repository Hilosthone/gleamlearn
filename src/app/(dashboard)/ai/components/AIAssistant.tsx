'use client';

import React, { useState } from 'react';
import { Sparkles, Send, Mic, Paperclip, BookOpen, HelpCircle, FileText, ArrowRight, Bot } from 'lucide-react';

export default function AIAssistant({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const [prompt, setPrompt] = useState('');

  const suggestedQuestions = [
    { text: 'Explain this topic.', icon: BookOpen },
    { text: 'What should I study today?', icon: HelpCircle },
    { text: 'Test me.', icon: Sparkles },
    { text: 'Create a quiz.', icon: FileText },
    { text: 'Help me understand this PDF.', icon: Paperclip },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Hero / Avatar Banner */}
      <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-[#111827] p-8 rounded-3xl text-white shadow-md relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl"></div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-purple-600 border-2 border-purple-400 flex items-center justify-center shadow-lg">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">Dr. Athena (AI Tutor)</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-purple-200 border border-white/15">Active</span>
            </div>
            <p className="text-xs text-purple-200 mt-1">Your personal academic AI ready to explain concepts, generate quizzes, and guide study sessions.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 relative z-10 shrink-0">
          <button
            onClick={() => onNavigate('tutor')}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition-all flex items-center gap-1.5"
          >
            <span>Launch Tutor Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigate('profile')}
            className="px-4 py-2.5 rounded-2xl bg-white text-gray-900 font-extrabold text-xs shadow-md hover:bg-gray-100 transition-all"
          >
            Customize AI
          </button>
        </div>
      </div>

      {/* Main Input Box */}
      <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
        <div className="relative">
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask Dr. Athena anything about your curriculum, past questions, or upload a study file..."
            className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <button className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-purple-600 transition-colors">
              <Paperclip className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-purple-600 transition-colors">
              <Mic className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onNavigate('chat')}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Suggested Questions */}
        <div className="space-y-2 pt-2">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Suggested Prompts</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((sq, idx) => {
              const Icon = sq.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setPrompt(sq.text);
                    onNavigate('chat');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 hover:border-purple-600 hover:text-purple-600 transition-all flex items-center gap-2"
                >
                  <Icon className="w-3.5 h-3.5 text-purple-600" />
                  <span>{sq.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}