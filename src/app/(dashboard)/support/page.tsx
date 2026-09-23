'use client';

import React, { useState } from 'react';
import { 
  HelpCircle, 
  AlertCircle, 
  MessageSquarePlus, 
  Search, 
  BookOpen, 
  User, 
  Sparkles, 
  Target, 
  GraduationCap, 
  Zap, 
  Coins, 
  Flame, 
  CreditCard, 
  Wrench, 
  Paperclip, 
  Send, 
  Star, 
  CheckCircle2, 
  ChevronRight,
  Lightbulb
} from 'lucide-react';

type SupportTab = 'help-center' | 'report' | 'feedback';
type HelpCategory = 'account' | 'courses' | 'ai' | 'quizzes' | 'exams' | 'xp' | 'coins' | 'streak' | 'payments' | 'technical';

export default function HelpSupportHub() {
  const [activeTab, setActiveTab] = useState<SupportTab>('help-center');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory | 'all'>('all');

  // Report Problem State
  const [reportData, setReportData] = useState({
    category: 'Technical issues',
    description: '',
    file: null as File | null,
    submitted: false
  });

  // Feedback State
  const [feedbackData, setFeedbackData] = useState({
    rating: 5,
    feedbackText: '',
    featureRequest: '',
    submitted: false
  });

  // Knowledge base articles dataset
  const helpArticles = [
    { id: 1, category: 'account', title: 'How to update my institutional department or level', summary: 'Navigate to your Profile settings tab to edit your university, department, and current level.' },
    { id: 2, category: 'ai', title: 'Getting the best explanations from your AI Tutor', summary: 'Use the AI personality toggle in settings to switch between Socratic, Detailed, or Concise response styles.' },
    { id: 3, category: 'xp', title: 'How XP and Level progression work', summary: 'Earn XP by completing interactive learning modules, practice quizzes, and sustaining daily study streaks.' },
    { id: 4, category: 'streak', title: 'What happens when I miss a day on my streak?', summary: 'Streaks decay after 24 hours of inactivity unless you use a Streak Freeze item from the shop or settings.' },
    { id: 5, category: 'payments', title: 'Upgrading to Premium and billing issues', summary: 'Manage your subscription billing cycles, receipts, and payment methods securely under account settings.' },
    { id: 6, category: 'technical', title: 'Troubleshooting audio playback or lagging interface', summary: 'Ensure you are running the latest version of your browser, clear your cache, or toggle hardware acceleration.' },
    { id: 7, category: 'exams', title: 'Simulated exam grading criteria and timers', summary: 'Exams mirror real university testing environments with strict automated countdowns and rubric-based AI grading.' },
    { id: 8, category: 'courses', title: 'Downloading offline course modules and notes', summary: 'Access your library courses to download structured PDF reading summaries for offline offline revision.' },
  ];

  const categories = [
    { id: 'all', label: 'All Topics', icon: HelpCircle },
    { id: 'account', label: 'Account', icon: User },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'ai', label: 'AI Tutor', icon: Sparkles },
    { id: 'quizzes', label: 'Quizzes', icon: Target },
    { id: 'exams', label: 'Exams', icon: GraduationCap },
    { id: 'xp', label: 'XP', icon: Zap },
    { id: 'coins', label: 'Coins', icon: Coins },
    { id: 'streak', label: 'Streak', icon: Flame },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'technical', label: 'Technical', icon: Wrench },
  ];

  const filteredArticles = helpArticles.filter(art => {
    const matchesCategory = selectedCategory === 'all' || art.category === selectedCategory;
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) || art.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReportData({ ...reportData, submitted: true });
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackData({ ...feedbackData, submitted: true });
  };

  return (
    <div className="w-full min-h-screen pb-16 space-y-8 animate-in fade-in duration-300">
      
      {/* Navigation Sub-Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-blue-500/10 text-[#2563EB] border border-blue-200/50">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">Help & Support Center</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Find answers, report technical bugs, or send feature feedback.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 p-1.5 rounded-2xl w-full sm:w-auto">
          {[
            { id: 'help-center', label: 'Help Center', icon: HelpCircle },
            { id: 'report', label: 'Report Problem', icon: AlertCircle },
            { id: 'feedback', label: 'Feedback', icon: MessageSquarePlus },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SupportTab)}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-white dark:bg-[#111827] text-gray-900 dark:text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 64. HELP CENTER & KNOWLEDGE BASE                         */}
      {/* ========================================================= */}
      {activeTab === 'help-center' && (
        <div className="space-y-6">
          {/* Search Hero Box */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 sm:p-12 rounded-3xl text-center space-y-4 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">How can we help you today?</h2>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl mx-auto">Search knowledge base articles or pick a category below to explore guides and tutorials.</p>
            
            <div className="max-w-xl mx-auto relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
              <input 
                type="text" 
                placeholder="Search articles (e.g., streak, exams, XP)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 rounded-2xl pl-12 pr-4 py-3.5 text-xs font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-[#2563EB] text-white border-transparent shadow-sm shadow-blue-500/20'
                      : 'bg-white dark:bg-[#111827] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredArticles.length > 0 ? (
              filteredArticles.map((art) => (
                <div 
                  key={art.id}
                  className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs hover:border-blue-500/50 transition-all flex flex-col justify-between space-y-4 group cursor-pointer"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#2563EB]">
                      {art.category}
                    </span>
                    <h3 className="text-sm font-extrabold text-gray-900 dark:text-white group-hover:text-[#2563EB] transition-colors">
                      {art.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      {art.summary}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800 text-xs font-bold text-[#2563EB]">
                    <span>Read complete guide</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-12 space-y-3 bg-white dark:bg-[#111827] rounded-3xl border border-gray-200 dark:border-gray-800">
                <HelpCircle className="w-10 h-10 text-gray-300 mx-auto" />
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">No matching articles found</h4>
                <p className="text-xs text-gray-400">Try refining your search query or selecting a different category.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 65. REPORT PROBLEM                                       */}
      {/* ========================================================= */}
      {activeTab === 'report' && (
        <div className="max-w-2xl mx-auto">
          {reportData.submitted ? (
            <div className="bg-white dark:bg-[#111827] p-10 rounded-3xl border border-gray-200 dark:border-gray-800 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Problem Report Received</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Thank you for helping us improve gleamLearn. Our engineering team has logged your report and will review it shortly.
              </p>
              <button
                onClick={() => setReportData({ category: 'Technical issues', description: '', file: null, submitted: false })}
                className="px-6 py-2.5 rounded-xl bg-[#2563EB] text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-sm"
              >
                Submit Another Report
              </button>
            </div>
          ) : (
            <form onSubmit={handleReportSubmit} className="bg-white dark:bg-[#111827] p-6 sm:p-10 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white">Report a Technical Problem</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Encountered a bug or unexpected behavior? Let us know the details.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Issue Category</label>
                <select
                  value={reportData.category}
                  onChange={(e) => setReportData({ ...reportData, category: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white focus:outline-none"
                >
                  <option>Technical issues / App Bug</option>
                  <option>Account & Authentication</option>
                  <option>AI Tutor Response Error</option>
                  <option>Billing & Payments</option>
                  <option>Course Content Error</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Description of Problem</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Please describe what happened, steps to reproduce, or error messages encountered..."
                  value={reportData.description}
                  onChange={(e) => setReportData({ ...reportData, description: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-xs text-gray-900 dark:text-white focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Screenshot or Log File (Optional)</label>
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-6 text-center space-y-2 hover:border-blue-500 transition-colors bg-gray-50/50 dark:bg-gray-900/50">
                  <Paperclip className="w-6 h-6 text-gray-400 mx-auto" />
                  <p className="text-xs text-gray-600 dark:text-gray-300 font-semibold">
                    {reportData.file ? reportData.file.name : 'Drag & drop screenshot here, or click to browse'}
                  </p>
                  <input 
                    type="file" 
                    onChange={(e) => setReportData({ ...reportData, file: e.target.files?.[0] || null })}
                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-[#2563EB] hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#2563EB] text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Problem Report</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 66. FEEDBACK & FEATURE REQUESTS                          */}
      {/* ========================================================= */}
      {activeTab === 'feedback' && (
        <div className="max-w-2xl mx-auto">
          {feedbackData.submitted ? (
            <div className="bg-white dark:bg-[#111827] p-10 rounded-3xl border border-gray-200 dark:border-gray-800 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 text-[#2563EB] flex items-center justify-center mx-auto border border-blue-200">
                <Lightbulb className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Thank You for Your Feedback!</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Your ratings and feature suggestions directly shape our roadmap and future updates.
              </p>
              <button
                onClick={() => setFeedbackData({ rating: 5, feedbackText: '', featureRequest: '', submitted: false })}
                className="px-6 py-2.5 rounded-xl bg-[#2563EB] text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-sm"
              >
                Submit More Feedback
              </button>
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="bg-white dark:bg-[#111827] p-6 sm:p-10 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white">Feedback & Feature Request</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Rate your experience or suggest new capabilities for gleamLearn.</p>
              </div>

              {/* Star Rating Picker */}
              <div className="space-y-2 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-center">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Overall Experience Rating</label>
                <div className="flex items-center justify-center gap-2 pt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackData({ ...feedbackData, rating: star })}
                      className="p-1 focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star 
                        className={`w-7 h-7 ${
                          star <= feedbackData.rating 
                            ? 'text-amber-400 fill-amber-400' 
                            : 'text-gray-300 dark:text-gray-700'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Your Feedback</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tell us what you love or what we can improve..."
                  value={feedbackData.feedbackText}
                  onChange={(e) => setFeedbackData({ ...feedbackData, feedbackText: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-xs text-gray-900 dark:text-white focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Feature Request (Optional)</label>
                <input 
                  type="text"
                  placeholder="e.g., Dark mode schedule widget, voice chat multiplayer mode..."
                  value={feedbackData.featureRequest}
                  onChange={(e) => setFeedbackData({ ...feedbackData, featureRequest: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#2563EB] text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Feedback</span>
              </button>
            </form>
          )}
        </div>
      )}

    </div>
  );
}