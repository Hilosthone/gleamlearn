'use client';

import React, { useState } from 'react';
import { ArrowLeft, Send, Mic, Paperclip, Volume2, RefreshCw, Bookmark, Sparkles, Bot, User } from 'lucide-react';

export default function AIConversation({ onBack }: { onBack: () => void }) {
  const [messages, setMessages] = useState([
    { sender: 'user', text: 'Explain the concept of Organic Chemistry isomerism in simple terms.' },
    { sender: 'ai', text: 'Isomerism occurs when two or more compounds have the exact same chemical formula (same number of atoms), but different arrangements of those atoms in space. Think of it like having the exact same Lego bricks, but building two entirely different structures!' }
  ]);
  const [input, setInput] = useState('');

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-[#111827] px-6 py-4 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-purple-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white">Organic Chemistry Isomerism Breakdown</h2>
            <p className="text-[10px] text-gray-400">Dr. Athena • Active Session</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold text-xs hover:bg-gray-200 transition-colors flex items-center gap-1.5">
            <Bookmark className="w-3.5 h-3.5" />
            <span>Save Explanation</span>
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              msg.sender === 'user' ? 'bg-[var(--color-brand-blue)] text-white' : 'bg-purple-600 text-white'
            }`}>
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`max-w-xl p-5 rounded-3xl border space-y-3 ${
              msg.sender === 'user'
                ? 'bg-[var(--color-brand-blue)] text-white border-transparent'
                : 'bg-white dark:bg-[#111827] text-gray-900 dark:text-white border-gray-200/80 dark:border-gray-800 shadow-xs'
            }`}>
              <p className="text-xs sm:text-sm leading-relaxed">{msg.text}</p>
              
              {msg.sender === 'ai' && (
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-gray-400 text-xs">
                  <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5" /> Listen
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Bar */}
      <div className="bg-white dark:bg-[#111827] p-4 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs flex items-center gap-3">
        <button className="p-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-purple-600 transition-colors">
          <Paperclip className="w-4 h-4" />
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a follow-up question..."
          className="flex-1 bg-transparent text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none placeholder:text-gray-400"
        />
        <button className="p-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-purple-600 transition-colors">
          <Mic className="w-4 h-4" />
        </button>
        <button 
          onClick={() => {
            if (!input) return;
            setMessages([...messages, { sender: 'user', text: input }, { sender: 'ai', text: 'That is an excellent follow-up question! Let us explore how structural isomers differ in boiling points.' }]);
            setInput('');
          }}
          className="px-5 py-2.5 rounded-2xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-all shadow-sm flex items-center gap-1.5"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}