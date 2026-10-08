// "use client";

// import React, { useState } from "react";
// import { motion } from "framer-motion";
// import { Sparkles, UploadCloud, Brain, ArrowRight, CheckCircle2, FileText, Zap } from "lucide-react";
// import HeroBackground from "./HeroBackground";

// export default function Hero() {
//   // Simulated processing state for the interactive widget demo
//   const [activeTab, setActiveTab] = useState<"notes" | "quiz" | "flashcard">("notes");

//   return (
//     <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 bg-gray-50 dark:bg-dark-bg overflow-hidden transition-colors duration-300">
      
//       {/* 3D WebGL Background Canvas Container */}
//       <div className="absolute inset-0 z-0 opacity-60 dark:opacity-100 pointer-events-none">
//         <HeroBackground />
//       </div>

//       {/* Background Glow Gradients */}
//       <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-blue/15 rounded-full blur-[140px] pointer-events-none z-0"></div>
//       <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-brand-purple/15 rounded-full blur-[120px] pointer-events-none z-0"></div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
//           {/* Left Column: Headlines & Actions */}
//           <motion.div 
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6 }}
//             className="lg:col-span-7 text-center lg:text-left"
//           >
//             {/* Pill Badge */}
//             <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-purple/10 border border-brand-purple/30 text-brand-purple text-xs font-semibold mb-6 shadow-sm">
//               <Sparkles className="w-3.5 h-3.5" />
//               <span>Next-Gen AI Virtual Classroom for Africa & Beyond</span>
//             </div>

//             {/* Main Headline */}
//             <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.15] mb-6">
//               Transform Any Exam Syllabus Into <span className="bg-gradient-to-r from-brand-blue via-brand-purple to-brand-green bg-clip-text text-transparent">Live Virtual Classes.</span>
//             </h1>

//             {/* Subheadline */}
//             <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0 mb-8 font-normal leading-relaxed">
//               Send your curriculum, upload course materials, or past questions. gleamLearn AI instantly turns them into a complete virtual classroom featuring interactive video sessions, real-time voice & video calls, downloadable notes, and comprehensive quizzes.
//             </p>

//             {/* Action Buttons */}
//             <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
//               <a
//                 href="#signup"
//                 className="w-full sm:w-auto px-8 py-4 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white font-bold shadow-xl shadow-brand-blue/30 flex items-center justify-center gap-3 transition-all hover:scale-105"
//               >
//                 Start Learning Free <ArrowRight className="w-5 h-5" />
//               </a>
//               <a
//                 href="#pipeline"
//                 className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white dark:bg-dark-card hover:bg-gray-100 dark:hover:bg-dark-border text-gray-800 dark:text-gray-200 font-semibold border border-gray-200 dark:border-dark-border shadow-sm flex items-center justify-center gap-2 transition-all"
//               >
//                 <UploadCloud className="w-5 h-5 text-brand-purple" /> See Virtual Class Demo
//               </a>
//             </div>

//             {/* Exam Coverage Badges */}
//             <div className="pt-6 border-t border-gray-200 dark:border-dark-border flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-gray-500 dark:text-gray-400">
//               <span className="font-semibold text-gray-700 dark:text-gray-300">Supported Exams & Systems:</span>
//               <div className="flex items-center gap-4 flex-wrap">
//                 <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-brand-green" /> WAEC /GCE / NECO</span>
//                 <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-brand-green" /> JAMB / UTME / POST UTME</span>
//                 <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-brand-green" /> University & BSc Courses</span>
//                 <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-brand-green" /> JUPEB & External Exams</span>
//               </div>
//             </div>
//           </motion.div>

//           {/* Right Column: Interactive AI Document & Study Simulator */}
//           <motion.div
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 0.6, delay: 0.2 }}
//             className="lg:col-span-5 relative"
//           >
//             <div className="relative mx-auto max-w-md lg:max-w-none">
              
//               {/* Decorative floating badges */}
//               <div className="absolute -top-6 -left-6 z-25 bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-gray-200/80 dark:border-dark-border flex items-center gap-3 animate-float">
//                 <div className="w-10 h-10 rounded-xl bg-brand-green/20 flex items-center justify-center text-brand-green">
//                   <Brain className="w-5 h-5" />
//                 </div>
//                 <div>
//                   <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Virtual Class AI</p>
//                   <p className="text-sm font-bold text-gray-900 dark:text-white">Voice, Video & Text Live</p>
//                 </div>
//               </div>

//               <div className="absolute -bottom-6 -right-6 z-25 bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-gray-200/80 dark:border-dark-border flex items-center gap-3 animate-float" style={{ animationDelay: "2s" }}>
//                 <div className="w-10 h-10 rounded-xl bg-brand-orange/20 flex items-center justify-center text-brand-orange">
//                   <Zap className="w-5 h-5" />
//                 </div>
//                 <div>
//                   <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Daily Streak</p>
//                   <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1">
//                     <Zap className="w-3.5 h-3.5 text-brand-orange inline" /> 14 Days Active
//                   </p>
//                 </div>
//               </div>

//               {/* Main Interactive Card Container */}
//               <div className="bg-white/80 dark:bg-[#111827]/75 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-gray-200/80 dark:border-dark-border relative overflow-hidden z-10">
//                 <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/10 rounded-full blur-2xl"></div>
                
//                 {/* Header inside Card */}
//                 <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-dark-border mb-4">
//                   <div className="flex items-center gap-3">
//                     <div className="w-9 h-9 rounded-lg bg-brand-blue/20 flex items-center justify-center text-brand-blue">
//                       <FileText className="w-5 h-5" />
//                     </div>
//                     <div>
//                       <h3 className="text-sm font-bold text-gray-900 dark:text-white">JAMB_Physics_Curriculum_2026.pdf</h3>
//                       <p className="text-xs text-gray-500 dark:text-gray-400">Converted to Virtual Classroom & Quizzes</p>
//                     </div>
//                   </div>
//                   <span className="px-2.5 py-1 rounded-full bg-brand-green/20 text-brand-green text-xs font-semibold">Live</span>
//                 </div>

//                 {/* Switcher Tabs */}
//                 <div className="grid grid-cols-3 gap-2 bg-gray-100 dark:bg-dark-bg p-1.5 rounded-xl mb-4 text-xs font-semibold">
//                   <button
//                     onClick={() => setActiveTab("notes")}
//                     className={`py-2 rounded-lg transition-all ${activeTab === "notes" ? "bg-brand-blue text-white shadow-md" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}
//                   >
//                     AI Notes
//                   </button>
//                   <button
//                     onClick={() => setActiveTab("quiz")}
//                     className={`py-2 rounded-lg transition-all ${activeTab === "quiz" ? "bg-brand-blue text-white shadow-md" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}
//                   >
//                     Smart Quiz
//                   </button>
//                   <button
//                     onClick={() => setActiveTab("flashcard")}
//                     className={`py-2 rounded-lg transition-all ${activeTab === "flashcard" ? "bg-brand-blue text-white shadow-md" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}
//                   >
//                     Flashcard
//                   </button>
//                 </div>

//                 {/* Tab Content Display */}
//                 <div className="bg-gray-50 dark:bg-dark-bg/80 rounded-2xl p-4 border border-gray-200 dark:border-dark-border min-h-[180px] flex flex-col justify-between">
//                   {activeTab === "notes" && (
//                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 text-xs">
//                       <div className="text-brand-purple font-semibold">Module 2: Waves &amp; Oscillation Dynamics</div>
//                       <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
//                         Wave propagation describes energy transfer through a medium without permanent displacement of the particles. Governed by the wave equation: v = fλ.
//                       </p>
//                       <div className="flex items-center gap-2 pt-2 text-gray-500 dark:text-gray-400 text-[11px]">
//                         <span className="px-2 py-0.5 rounded bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border">Animated Visuals</span>
//                         <span className="px-2 py-0.5 rounded bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border">Voice Notes</span>
//                         <span className="px-2 py-0.5 rounded bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border">Video Call Ready</span>
//                       </div>
//                     </motion.div>
//                   )}

//                   {activeTab === "quiz" && (
//                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 text-xs">
//                       <p className="text-gray-900 dark:text-white font-medium">Q: What is the velocity of a wave with frequency 50Hz and wavelength 0.4m?</p>
//                       <div className="space-y-1.5">
//                         <div className="p-2 rounded-lg bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:border-brand-blue cursor-pointer transition-colors">A) 12.5 m/s</div>
//                         <div className="p-2 rounded-lg bg-brand-green/15 border border-brand-green text-brand-green font-semibold">B) 20 m/s (Objectives &amp; Theory) ✓</div>
//                         <div className="p-2 rounded-lg bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:border-brand-blue cursor-pointer transition-colors">C) 200 m/s</div>
//                       </div>
//                     </motion.div>
//                   )}

//                   {activeTab === "flashcard" && (
//                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-4 text-center">
//                       <span className="text-[10px] text-brand-orange uppercase tracking-wider font-bold mb-1">Exam Flashcard #9</span>
//                       <p className="text-gray-900 dark:text-white font-semibold text-sm mb-2">&quot;State the principle of superposition of waves.&quot;</p>
//                       <p className="text-gray-500 dark:text-gray-400 text-xs italic">Tap to flip: When two or more waves meet, the total displacement is the vector sum of individual displacements.</p>
//                     </motion.div>
//                   )}

//                   <div className="pt-3 border-t border-gray-200 dark:border-dark-border/60 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
//                     <span>Taught by gleamLearn AI Virtual Class</span>
//                     <span className="text-brand-green font-medium">Mastery: 92%</span>
//                   </div>
//                 </div>

//               </div>
//             </div>
//           </motion.div>

//         </div>
//       </div>
//     </section>
//   );
// }



// "use client";

// import React, { useState } from "react";
// import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
// import {
//   Sparkles,
//   UploadCloud,
//   Brain,
//   ArrowRight,
//   CheckCircle2,
//   FileText,
//   Zap,
// } from "lucide-react";
// import HeroBackground from "./HeroBackground";

// export default function Hero() {
//   const [activeTab, setActiveTab] = useState<"notes" | "quiz" | "flashcard">(
//     "notes"
//   );

//   return (
//     <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 bg-gray-50 dark:bg-dark-bg overflow-hidden transition-colors duration-300">
//       {/* 3D WebGL Background Canvas Container */}
//       <div className="absolute inset-0 z-0 opacity-60 dark:opacity-100 pointer-events-none">
//         <HeroBackground />
//       </div>

//       {/* Background Glow Gradients */}
//       <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-blue/15 rounded-full blur-[140px] pointer-events-none z-0" />
//       <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-brand-purple/15 rounded-full blur-[120px] pointer-events-none z-0" />

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
//           {/* Left Column: Headlines & Actions */}
//           <motion.div
//             initial={{ opacity: 0, y: 24 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
//             className="lg:col-span-7 text-center lg:text-left"
//           >
//             {/* Pill Badge */}
//             <motion.div
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ delay: 0.1, duration: 0.5 }}
//               className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-purple/10 border border-brand-purple/30 text-brand-purple text-xs font-semibold mb-6 shadow-sm"
//             >
//               <Sparkles className="w-3.5 h-3.5" />
//               <span>Next-Gen AI Virtual Classroom for Africa &amp; Beyond</span>
//             </motion.div>

//             {/* Main Headline */}
//             <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.15] mb-6">
//               Turn Any Exam Syllabus Into{" "}
//               <span className="bg-gradient-to-r from-brand-blue via-brand-purple to-brand-green bg-clip-text text-transparent">
//                 Interactive Virtual Classes.
//               </span>
//             </h1>

//             {/* Subheadline */}
//             <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0 mb-8 font-normal leading-relaxed">
//               Upload your syllabus, past questions, YouTube links, or course modules. gleamLearn AI instantly turns them into an interactive virtual classroom complete with live audio lessons, step-by-step notes, flashcards, and practice tests—supporting verbal, objective, theoretical, and diagram-based exams.
//             </p>

//             {/* Action Buttons */}
//             <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
//               <a
//                 href="#signup"
//                 className="w-full sm:w-auto px-8 py-4 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white font-bold shadow-xl shadow-brand-blue/30 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
//               >
//                 Start Learning Free <ArrowRight className="w-5 h-5" />
//               </a>
//               <a
//                 href="#pipeline"
//                 className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white dark:bg-dark-card hover:bg-gray-100 dark:hover:bg-dark-border text-gray-800 dark:text-gray-200 font-semibold border border-gray-200 dark:border-dark-border shadow-sm flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
//               >
//                 <UploadCloud className="w-5 h-5 text-brand-purple" /> See
//                 Virtual Class Demo
//               </a>
//             </div>

//             {/* Exam Coverage Badges */}
//             <div className="pt-6 border-t border-gray-200 dark:border-dark-border flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-gray-500 dark:text-gray-400">
//               <span className="font-semibold text-gray-700 dark:text-gray-300">
//                 Supported Curriculums &amp; Exams:
//               </span>
//               <div className="flex items-center gap-4 flex-wrap">
//                 <span className="flex items-center gap-1.5">
//                   <CheckCircle2 className="w-4 h-4 text-brand-green" /> WAEC / GCE / NECO
//                 </span>
//                 <span className="flex items-center gap-1.5">
//                   <CheckCircle2 className="w-4 h-4 text-brand-green" /> JAMB / UTME / POST-UTME
//                 </span>
//                 <span className="flex items-center gap-1.5">
//                   <CheckCircle2 className="w-4 h-4 text-brand-green" /> University &amp; Degree Courses
//                 </span>
//                 <span className="flex items-center gap-1.5">
//                   <CheckCircle2 className="w-4 h-4 text-brand-green" /> JUPEB &amp; A-Level Exams
//                 </span>
//               </div>
//             </div>
//           </motion.div>

//           {/* Right Column: Interactive AI Document & Study Simulator */}
//           <motion.div
//             initial={{ opacity: 0, scale: 0.96, y: 20 }}
//             animate={{ opacity: 1, scale: 1, y: 0 }}
//             transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
//             className="lg:col-span-5 relative"
//           >
//             <div className="relative mx-auto max-w-md lg:max-w-none">
//               {/* Floating Badge 1 */}
//               <motion.div
//                 animate={{ y: [0, -8, 0] }}
//                 transition={{
//                   duration: 4,
//                   repeat: Infinity,
//                   ease: "easeInOut",
//                 }}
//                 className="absolute -top-6 -left-6 z-25 bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-gray-200/80 dark:border-dark-border flex items-center gap-3"
//               >
//                 <div className="w-10 h-10 rounded-xl bg-brand-green/20 flex items-center justify-center text-brand-green">
//                   <Brain className="w-5 h-5" />
//                 </div>
//                 <div>
//                   <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
//                     Virtual Class AI
//                   </p>
//                   <p className="text-sm font-bold text-gray-900 dark:text-white">
//                     Live Audio, Video &amp; Notes
//                   </p>
//                 </div>
//               </motion.div>

//               {/* Floating Badge 2 */}
//               <motion.div
//                 animate={{ y: [0, 8, 0] }}
//                 transition={{
//                   duration: 4,
//                   repeat: Infinity,
//                   ease: "easeInOut",
//                   delay: 2,
//                 }}
//                 className="absolute -bottom-6 -right-6 z-25 bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-gray-200/80 dark:border-dark-border flex items-center gap-3"
//               >
//                 <div className="w-10 h-10 rounded-xl bg-brand-orange/20 flex items-center justify-center text-brand-orange">
//                   <Zap className="w-5 h-5" />
//                 </div>
//                 <div>
//                   <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
//                     Daily Streak
//                   </p>
//                   <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1">
//                     <Zap className="w-3.5 h-3.5 text-brand-orange inline" /> 14 Days Active
//                   </p>
//                 </div>
//               </motion.div>

//               {/* Main Interactive Card Container */}
//               <div className="bg-white/80 dark:bg-[#111827]/75 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-gray-200/80 dark:border-dark-border relative overflow-hidden z-10">
//                 <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/10 rounded-full blur-2xl pointer-events-none" />

//                 {/* Header inside Card */}
//                 <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-dark-border mb-4">
//                   <div className="flex items-center gap-3">
//                     <div className="w-9 h-9 rounded-lg bg-brand-blue/20 flex items-center justify-center text-brand-blue">
//                       <FileText className="w-5 h-5" />
//                     </div>
//                     <div>
//                       <h3 className="text-sm font-bold text-gray-900 dark:text-white">
//                         JAMB_Physics_Curriculum_2026.pdf
//                       </h3>
//                       <p className="text-xs text-gray-500 dark:text-gray-400">
//                         Converted to Virtual Classroom &amp; Quizzes
//                       </p>
//                     </div>
//                   </div>
//                   <span className="px-2.5 py-1 rounded-full bg-brand-green/20 text-brand-green text-xs font-semibold">
//                     Live
//                   </span>
//                 </div>

//                 {/* Switcher Tabs with Animated Highlight Pill */}
//                 <LayoutGroup>
//                   <div className="grid grid-cols-3 gap-1 bg-gray-100 dark:bg-dark-bg p-1.5 rounded-xl mb-4 text-xs font-semibold relative">
//                     {(
//                       [
//                         { id: "notes", label: "AI Notes" },
//                         { id: "quiz", label: "Smart Quiz" },
//                         { id: "flashcard", label: "Flashcards" },
//                       ] as const
//                     ).map((tab) => (
//                       <button
//                         key={tab.id}
//                         onClick={() => setActiveTab(tab.id)}
//                         className={`relative py-2 rounded-lg transition-colors z-10 ${
//                           activeTab === tab.id
//                             ? "text-white"
//                             : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
//                         }`}
//                       >
//                         {activeTab === tab.id && (
//                           <motion.div
//                             layoutId="activeHeroTab"
//                             className="absolute inset-0 bg-brand-blue rounded-lg shadow-sm -z-10"
//                             transition={{
//                               type: "spring",
//                               stiffness: 400,
//                               damping: 30,
//                             }}
//                           />
//                         )}
//                         {tab.label}
//                       </button>
//                     ))}
//                   </div>
//                 </LayoutGroup>

//                 {/* Animated Tab Content Display */}
//                 <div className="bg-gray-50 dark:bg-dark-bg/80 rounded-2xl p-4 border border-gray-200 dark:border-dark-border min-h-[190px] flex flex-col justify-between overflow-hidden">
//                   <AnimatePresence mode="wait">
//                     {activeTab === "notes" && (
//                       <motion.div
//                         key="notes"
//                         initial={{ opacity: 0, y: 8 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         exit={{ opacity: 0, y: -8 }}
//                         transition={{ duration: 0.25, ease: "easeOut" }}
//                         className="space-y-2.5 text-xs"
//                       >
//                         <div className="text-brand-purple font-bold text-xs uppercase tracking-wider">
//                           Module 2: Waves &amp; Oscillation Dynamics
//                         </div>
//                         <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
//                           Wave motion transfers energy through a medium without permanent displacement of particles. Key equation: <span className="font-semibold text-brand-blue">v = f × λ</span> (Velocity = Frequency × Wavelength).
//                         </p>
//                         <div className="flex items-center gap-2 pt-2 text-gray-500 dark:text-gray-400 text-[11px] flex-wrap">
//                           <span className="px-2 py-0.5 rounded bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border font-medium">
//                             Visual Animations
//                           </span>
//                           <span className="px-2 py-0.5 rounded bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border font-medium">
//                             Voice Explanations
//                           </span>
//                           <span className="px-2 py-0.5 rounded bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border font-medium">
//                             Live Class Ready
//                           </span>
//                         </div>
//                       </motion.div>
//                     )}

//                     {activeTab === "quiz" && (
//                       <motion.div
//                         key="quiz"
//                         initial={{ opacity: 0, y: 8 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         exit={{ opacity: 0, y: -8 }}
//                         transition={{ duration: 0.25, ease: "easeOut" }}
//                         className="space-y-2.5 text-xs"
//                       >
//                         <p className="text-gray-900 dark:text-white font-medium leading-snug">
//                           Q: Find the velocity of a wave with frequency 50 Hz and wavelength 0.4 m.
//                         </p>
//                         <div className="space-y-1.5">
//                           <div className="p-2 rounded-lg bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:border-brand-blue transition-colors cursor-pointer">
//                             A) 12.5 m/s
//                           </div>
//                           <div className="p-2 rounded-lg bg-brand-green/15 border border-brand-green text-brand-green font-semibold flex items-center justify-between">
//                             <span>B) 20 m/s (Correct Answer)</span>
//                             <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" />
//                           </div>
//                           <div className="p-2 rounded-lg bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:border-brand-blue transition-colors cursor-pointer">
//                             C) 200 m/s
//                           </div>
//                         </div>
//                       </motion.div>
//                     )}

//                     {activeTab === "flashcard" && (
//                       <motion.div
//                         key="flashcard"
//                         initial={{ opacity: 0, y: 8 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         exit={{ opacity: 0, y: -8 }}
//                         transition={{ duration: 0.25, ease: "easeOut" }}
//                         className="flex flex-col items-center justify-center py-3 text-center my-auto"
//                       >
//                         <span className="text-[10px] text-brand-orange uppercase tracking-wider font-bold mb-1">
//                           Exam Flashcard #09
//                         </span>
//                         <p className="text-gray-900 dark:text-white font-semibold text-xs sm:text-sm mb-2">
//                           &quot;State the principle of superposition of waves.&quot;
//                         </p>
//                         <p className="text-gray-500 dark:text-gray-400 text-[11px] italic leading-snug">
//                           When two waves overlap, the resulting displacement is the vector sum of their individual displacements.
//                         </p>
//                       </motion.div>
//                     )}
//                   </AnimatePresence>

//                   <div className="pt-3 mt-3 border-t border-gray-200 dark:border-dark-border/60 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
//                     <span>Powered by gleamLearn AI</span>
//                     <span className="text-brand-green font-semibold">
//                       Curriculum Mastery: 92%
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       </div>
//     </section>
//   );
// }






"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  Sparkles,
  UploadCloud,
  Brain,
  ArrowRight,
  CheckCircle2,
  FileText,
  Zap,
} from "lucide-react";
import HeroBackground from "./HeroBackground";

// List of prefix sentences to cycle through
const TYPEWRITER_SENTENCES = [
  "Turn Any Exam Syllabus Into",
  "Transform Past Questions Into",
  "Convert Lecture Notes Into",
  "Turn Complex Course Modules Into",
];

const STATIC_SUFFIX = "Interactive Virtual Classes.";

// Full Headline Typewriter Component
function TypewriterHeadline({
  sentences,
  suffix,
  typingSpeed = 50,
  deletingSpeed = 30,
  pauseDuration = 2400,
}: {
  sentences: string[];
  suffix: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
}) {
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [prefixLength, setPrefixLength] = useState(0);
  const [suffixLength, setSuffixLength] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (sentences.length === 0) return;

    const currentPrefix = sentences[sentenceIndex];

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          // Step 1: Type the dynamic prefix sentence first
          if (prefixLength < currentPrefix.length) {
            setPrefixLength((prev) => prev + 1);
          }
          // Step 2: Once prefix is finished, type out the gradient suffix string
          else if (suffixLength < suffix.length) {
            setSuffixLength((prev) => prev + 1);
          }
          // Step 3: Pause when both prefix and suffix are fully typed
          else {
            setTimeout(() => setIsDeleting(true), pauseDuration);
          }
        } else {
          // Deleting phase: backspace through the prefix sentence to prepare for the next sentence
          if (prefixLength > 0) {
            setPrefixLength((prev) => prev - 1);
          } else {
            // Reset state and switch to the next prefix sentence
            setIsDeleting(false);
            setSentenceIndex((prev) => (prev + 1) % sentences.length);
          }
        }
      },
      isDeleting ? deletingSpeed : typingSpeed
    );

    return () => clearTimeout(timeout);
  }, [
    prefixLength,
    suffixLength,
    isDeleting,
    sentenceIndex,
    sentences,
    suffix,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
  ]);

  const currentPrefixText = sentences[sentenceIndex].substring(0, prefixLength);
  const currentSuffixText = suffix.substring(0, suffixLength);

  return (
    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.18] mb-6 min-h-[140px] sm:min-h-[160px] lg:min-h-[190px] flex flex-wrap items-center justify-center lg:justify-start gap-x-3">
      <span>{currentPrefixText}</span>
      {suffixLength > 0 && (
        <span className="bg-gradient-to-r from-brand-blue via-brand-purple to-brand-green bg-clip-text text-transparent">
          {currentSuffixText}
        </span>
      )}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        className="inline-block w-[3px] h-[0.8em] bg-brand-blue align-middle rounded-full -ml-1"
      />
    </h1>
  );
}

export default function Hero() {
  const [activeTab, setActiveTab] = useState<"notes" | "quiz" | "flashcard">(
    "notes"
  );

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 bg-gray-50 dark:bg-dark-bg overflow-hidden transition-colors duration-300">
      {/* 3D WebGL Background Canvas Container */}
      <div className="absolute inset-0 z-0 opacity-60 dark:opacity-100 pointer-events-none">
        <HeroBackground />
      </div>

      {/* Background Glow Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-blue/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-brand-purple/15 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & Actions */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 text-center lg:text-left"
          >
            {/* Pill Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-purple/10 border border-brand-purple/30 text-brand-purple text-xs font-semibold mb-6 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen AI Virtual Classroom for Africa &amp; Beyond</span>
            </motion.div>

            {/* Dynamic Sequential Typewriter Headline */}
            <TypewriterHeadline
              sentences={TYPEWRITER_SENTENCES}
              suffix={STATIC_SUFFIX}
            />

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0 mb-8 font-normal leading-relaxed">
              Upload your syllabus, past questions, YouTube links, or course
              modules. gleamLearn AI instantly turns them into an interactive
              virtual classroom complete with live audio lessons, step-by-step
              notes, flashcards, and practice tests—supporting verbal, objective,
              theoretical, and diagram-based exams.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
              <a
                href="#signup"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white font-bold shadow-xl shadow-brand-blue/30 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Start Learning Free <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="#pipeline"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white dark:bg-dark-card hover:bg-gray-100 dark:hover:bg-dark-border text-gray-800 dark:text-gray-200 font-semibold border border-gray-200 dark:border-dark-border shadow-sm flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <UploadCloud className="w-5 h-5 text-brand-purple" /> See
                Virtual Class Demo
              </a>
            </div>

            {/* Exam Coverage Badges */}
            <div className="pt-6 border-t border-gray-200 dark:border-dark-border flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                Supported Curriculums &amp; Exams:
              </span>
              <div className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-green" /> WAEC /
                  GCE / NECO
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-green" /> JAMB /
                  UTME / POST-UTME
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-green" />{" "}
                  University &amp; Degree Courses
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-green" /> JUPEB &amp;
                  A-Level Exams
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Interactive AI Document & Study Simulator */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.15,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Floating Badge 1 */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -top-6 -left-6 z-25 bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-gray-200/80 dark:border-dark-border flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-green/20 flex items-center justify-center text-brand-green">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Virtual Class AI
                  </p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    Live Audio, Video &amp; Notes
                  </p>
                </div>
              </motion.div>

              {/* Floating Badge 2 */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2,
                }}
                className="absolute -bottom-6 -right-6 z-25 bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-gray-200/80 dark:border-dark-border flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-orange/20 flex items-center justify-center text-brand-orange">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Daily Streak
                  </p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-brand-orange inline" /> 14
                    Days Active
                  </p>
                </div>
              </motion.div>

              {/* Main Interactive Card Container */}
              <div className="bg-white/80 dark:bg-[#111827]/75 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-gray-200/80 dark:border-dark-border relative overflow-hidden z-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/10 rounded-full blur-2xl pointer-events-none" />

                {/* Header inside Card */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-dark-border mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-brand-blue/20 flex items-center justify-center text-brand-blue">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                        JAMB_Physics_Curriculum_2026.pdf
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Converted to Virtual Classroom &amp; Quizzes
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-brand-green/20 text-brand-green text-xs font-semibold">
                    Live
                  </span>
                </div>

                {/* Switcher Tabs with Animated Highlight Pill */}
                <LayoutGroup>
                  <div className="grid grid-cols-3 gap-1 bg-gray-100 dark:bg-dark-bg p-1.5 rounded-xl mb-4 text-xs font-semibold relative">
                    {(
                      [
                        { id: "notes", label: "AI Notes" },
                        { id: "quiz", label: "Smart Quiz" },
                        { id: "flashcard", label: "Flashcards" },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative py-2 rounded-lg transition-colors z-10 ${
                          activeTab === tab.id
                            ? "text-white"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        {activeTab === tab.id && (
                          <motion.div
                            layoutId="activeHeroTab"
                            className="absolute inset-0 bg-brand-blue rounded-lg shadow-sm -z-10"
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 30,
                            }}
                          />
                        )}
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </LayoutGroup>

                {/* Animated Tab Content Display */}
                <div className="bg-gray-50 dark:bg-dark-bg/80 rounded-2xl p-4 border border-gray-200 dark:border-dark-border min-h-[190px] flex flex-col justify-between overflow-hidden">
                  <AnimatePresence mode="wait">
                    {activeTab === "notes" && (
                      <motion.div
                        key="notes"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="space-y-2.5 text-xs"
                      >
                        <div className="text-brand-purple font-bold text-xs uppercase tracking-wider">
                          Module 2: Waves &amp; Oscillation Dynamics
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          Wave motion transfers energy through a medium without
                          permanent displacement of particles. Key equation:{" "}
                          <span className="font-semibold text-brand-blue">
                            v = f × λ
                          </span>{" "}
                          (Velocity = Frequency × Wavelength).
                        </p>
                        <div className="flex items-center gap-2 pt-2 text-gray-500 dark:text-gray-400 text-[11px] flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border font-medium">
                            Visual Animations
                          </span>
                          <span className="px-2 py-0.5 rounded bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border font-medium">
                            Voice Explanations
                          </span>
                          <span className="px-2 py-0.5 rounded bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border font-medium">
                            Live Class Ready
                          </span>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "quiz" && (
                      <motion.div
                        key="quiz"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="space-y-2.5 text-xs"
                      >
                        <p className="text-gray-900 dark:text-white font-medium leading-snug">
                          Q: Find the velocity of a wave with frequency 50 Hz and
                          wavelength 0.4 m.
                        </p>
                        <div className="space-y-1.5">
                          <div className="p-2 rounded-lg bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:border-brand-blue transition-colors cursor-pointer">
                            A) 12.5 m/s
                          </div>
                          <div className="p-2 rounded-lg bg-brand-green/15 border border-brand-green text-brand-green font-semibold flex items-center justify-between">
                            <span>B) 20 m/s (Correct Answer)</span>
                            <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" />
                          </div>
                          <div className="p-2 rounded-lg bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:border-brand-blue transition-colors cursor-pointer">
                            C) 200 m/s
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "flashcard" && (
                      <motion.div
                        key="flashcard"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="flex flex-col items-center justify-center py-3 text-center my-auto"
                      >
                        <span className="text-[10px] text-brand-orange uppercase tracking-wider font-bold mb-1">
                          Exam Flashcard #09
                        </span>
                        <p className="text-gray-900 dark:text-white font-semibold text-xs sm:text-sm mb-2">
                          &quot;State the principle of superposition of
                          waves.&quot;
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-[11px] italic leading-snug">
                          When two waves overlap, the resulting displacement is the
                          vector sum of their individual displacements.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="pt-3 mt-3 border-t border-gray-200 dark:border-dark-border/60 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                    <span>Powered by gleamLearn AI</span>
                    <span className="text-brand-green font-semibold">
                      Curriculum Mastery: 92%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}