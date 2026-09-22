// 'use client';

// import React, { useState } from 'react';
// import Link from 'next/link';
// import { 
//   FolderLibrary, 
//   Upload, 
//   FileText, 
//   Sparkles, 
//   Layers, 
//   HelpCircle, 
//   CheckSquare, 
//   Search, 
//   Filter, 
//   ArrowRight,
//   Plus
// } from 'lucide-react';

// export default function LibraryPage() {
//   const [activeTab, setActiveTab] = useState('all');
//   const [searchQuery, setSearchQuery] = useState('');

//   const tabs = [
//     { id: 'all', label: 'All Items', count: 18 },
//     { id: 'uploads', label: 'Uploaded Files', count: 4 },
//     { id: 'classes', label: 'AI Classes', count: 5 },
//     { id: 'notes', label: 'Notes', count: 4 },
//     { id: 'flashcards', label: 'Flashcards', count: 3 },
//     { id: 'quizzes', label: 'Quizzes & Tests', count: 2 },
//   ];

//   const libraryItems = [
//     {
//       id: 'item-1',
//       title: 'Advanced Operating Systems & Kernel Threads',
//       type: 'classes',
//       category: 'AI-Generated Class',
//       badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200',
//       date: 'Sep 20, 2026',
//       details: '12 Topics • 48 Flashcards • 3 Quizzes',
//       href: '/library/generated-class/os-threads',
//     },
//     {
//       id: 'item-2',
//       title: 'CSC301_Lecture_Notes_Chapter_4.pdf',
//       type: 'uploads',
//       category: 'Uploaded File',
//       badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200',
//       date: 'Sep 18, 2026',
//       details: 'PDF • 4.2 MB • Processed Successfully',
//       href: '/library/upload',
//     },
//     {
//       id: 'item-3',
//       title: 'Macroeconomics Fiscal Policy & Inflation Formulas',
//       type: 'notes',
//       category: 'Notes',
//       badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200',
//       date: 'Sep 15, 2026',
//       details: 'Summary notes with key equations',
//       href: '/library/generated-class/macro-notes',
//     },
//     {
//       id: 'item-4',
//       title: 'Data Structures Quick-Recall Flashcards',
//       type: 'flashcards',
//       category: 'Flashcards',
//       badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200',
//       date: 'Sep 12, 2026',
//       details: '35 Cards • High Retention Rate',
//       href: '/library/generated-class/ds-flashcards',
//     },
//   ];

//   const filteredItems = libraryItems.filter(item => {
//     const matchesTab = activeTab === 'all' || item.type === activeTab;
//     const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
//     return matchesTab && matchesSearch;
//   });

//   return (
//     <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      
//       {/* Header & Upload Button */}
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
//             <span>My Library & Uploads</span>
//             <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-[var(--color-brand-blue)] font-bold">
//               Hub
//             </span>
//           </h1>
//           <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//             Manage your uploaded materials, AI-generated courses, flashcards, notes, and saved questions.
//           </p>
//         </div>

//         <Link
//           href="/library/upload"
//           className="px-5 py-3 rounded-2xl bg-[var(--color-brand-blue)] text-white font-bold text-xs shadow-md hover:bg-blue-700 transition-all flex items-center justify-center gap-2 w-fit"
//         >
//           <Upload className="w-4 h-4" />
//           <span>Upload New Material</span>
//         </Link>
//       </div>

//       {/* Search & Filter Bar */}
//       <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-[#111827] p-4 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
//         <div className="relative w-full sm:w-80">
//           <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search library items..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]"
//           />
//         </div>

//         <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 sm:pb-0 scrollbar-none">
//           {tabs.map((tab) => (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id)}
//               className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
//                 activeTab === tab.id
//                   ? 'bg-[var(--color-brand-blue)] text-white shadow-xs'
//                   : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800'
//               }`}
//             >
//               <span>{tab.label}</span>
//               <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-blue-700 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
//                 {tab.count}
//               </span>
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Library Items List */}
//       <div className="space-y-4">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {filteredItems.map((item) => (
//             <div
//               key={item.id}
//               className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
//             >
//               <div className="space-y-3">
//                 <div className="flex items-center justify-between">
//                   <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${item.badgeColor}`}>
//                     {item.category}
//                   </span>
//                   <span className="text-[11px] text-gray-400 font-medium">{item.date}</span>
//                 </div>

//                 <h3 className="text-base font-extrabold text-gray-900 dark:text-white group-hover:text-[var(--color-brand-blue)] transition-colors">
//                   {item.title}
//                 </h3>

//                 <p className="text-xs text-gray-500 dark:text-gray-400">
//                   {item.details}
//                 </p>
//               </div>

//               <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
//                 <span className="text-[11px] text-gray-400 font-mono">ID: {item.id}</span>
//                 <Link
//                   href={item.href}
//                   className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-[var(--color-brand-blue)] hover:text-white transition-colors flex items-center gap-1.5"
//                 >
//                   <span>Open Item</span>
//                   <ArrowRight className="w-3.5 h-3.5" />
//                 </Link>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//     </div>
//   );
// }



'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FolderOpen, 
  Upload, 
  FileText, 
  Sparkles, 
  Layers, 
  HelpCircle, 
  CheckSquare, 
  Search, 
  Filter, 
  ArrowRight,
  Plus
} from 'lucide-react';

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'all', label: 'All Items', count: 18 },
    { id: 'uploads', label: 'Uploaded Files', count: 4 },
    { id: 'classes', label: 'AI Classes', count: 5 },
    { id: 'notes', label: 'Notes', count: 4 },
    { id: 'flashcards', label: 'Flashcards', count: 3 },
    { id: 'quizzes', label: 'Quizzes & Tests', count: 2 },
  ];

  const libraryItems = [
    {
      id: 'item-1',
      title: 'Advanced Operating Systems & Kernel Threads',
      type: 'classes',
      category: 'AI-Generated Class',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200',
      date: 'Sep 20, 2026',
      details: '12 Topics • 48 Flashcards • 3 Quizzes',
      href: '/library/generated-class/os-threads',
    },
    {
      id: 'item-2',
      title: 'CSC301_Lecture_Notes_Chapter_4.pdf',
      type: 'uploads',
      category: 'Uploaded File',
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200',
      date: 'Sep 18, 2026',
      details: 'PDF • 4.2 MB • Processed Successfully',
      href: '/library/upload',
    },
    {
      id: 'item-3',
      title: 'Macroeconomics Fiscal Policy & Inflation Formulas',
      type: 'notes',
      category: 'Notes',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200',
      date: 'Sep 15, 2026',
      details: 'Summary notes with key equations',
      href: '/library/generated-class/macro-notes',
    },
    {
      id: 'item-4',
      title: 'Data Structures Quick-Recall Flashcards',
      type: 'flashcards',
      category: 'Flashcards',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200',
      date: 'Sep 12, 2026',
      details: '35 Cards • High Retention Rate',
      href: '/library/generated-class/ds-flashcards',
    },
  ];

  const filteredItems = libraryItems.filter(item => {
    const matchesTab = activeTab === 'all' || item.type === activeTab;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      
      {/* Header & Upload Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>My Library & Uploads</span>
            <span className="text-xs px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-[var(--color-brand-blue)] font-bold flex items-center gap-1.5 shadow-xs">
              <FolderOpen className="w-3.5 h-3.5" />
              <Layers className="w-3.5 h-3.5" />
              <span>Hub</span>
            </span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your uploaded materials, AI-generated courses, flashcards, notes, and saved questions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            title="Library Help & Guide"
            className="p-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all flex items-center justify-center"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <Link
            href="/library/upload"
            className="px-5 py-3 rounded-2xl bg-[var(--color-brand-blue)] text-white font-bold text-xs shadow-md hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Upload New Material</span>
          </Link>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-[#111827] p-4 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search library items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 sm:pb-0 scrollbar-none">
          <div className="flex items-center gap-1 text-gray-400 px-1">
            <Filter className="w-3.5 h-3.5" />
          </div>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-[var(--color-brand-blue)] text-white shadow-xs'
                  : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-blue-700 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Action Feature Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-[var(--color-brand-blue)]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-white">Generate Notes</h4>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Summarize readings via AI</p>
            </div>
          </div>
          <Plus className="w-4 h-4 text-gray-400 hover:text-[var(--color-brand-blue)] cursor-pointer transition-colors" />
        </div>

        <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-white">AI Flashcards</h4>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Build high-recall decks</p>
            </div>
          </div>
          <Plus className="w-4 h-4 text-gray-400 hover:text-purple-600 cursor-pointer transition-colors" />
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-white">Practice Quiz</h4>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Test your mastery</p>
            </div>
          </div>
          <Plus className="w-4 h-4 text-gray-400 hover:text-amber-600 cursor-pointer transition-colors" />
        </div>
      </div>

      {/* Library Items List */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${item.badgeColor}`}>
                    {item.category}
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium">{item.date}</span>
                </div>

                <h3 className="text-base font-extrabold text-gray-900 dark:text-white group-hover:text-[var(--color-brand-blue)] transition-colors">
                  {item.title}
                </h3>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {item.details}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span className="text-[11px] text-gray-400 font-mono">ID: {item.id}</span>
                <Link
                  href={item.href}
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-[var(--color-brand-blue)] hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span>Open Item</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}