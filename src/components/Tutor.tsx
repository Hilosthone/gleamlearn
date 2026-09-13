// "use client";

// import React, { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Bot, Play, Pause, RotateCcw, Sparkles, ArrowRight, MessageSquare, Video } from "lucide-react";

// /**
//  * AIClassroomTutorSection Component
//  * 
//  * This component showcases gleamLearn's virtual AI classroom feature. It simulates
//  * an interactive video player where an AI professor ("Dr. Gleam") writes notes on a
//  * dynamic whiteboard, solves equations, draws recursive trees, and interacts with students
//  * in real time through an integrated Q&A transcript sidebar.
//  */
// export default function AIClassroomTutorSection() {
//   const [isPlaying, setIsPlaying] = useState(true);
//   const [lessonStep, setLessonStep] = useState(0);
//   const [playbackProgress, setPlaybackProgress] = useState(25);
//   const [studentQuestion, setStudentQuestion] = useState("");
//   const [chatLog, setChatLog] = useState([
//     { sender: "ai", text: "Welcome to today's interactive masterclass on Data Structures. Let's break down Merge Sort using your uploaded syllabus." },
//   ]);

//   // Simulated lesson timeline stages
//   const lessonStages = [
//     {
//       title: "Stage 1: Syllabus Grounding & Core Concept",
//       duration: "0:00 - 1:15",
//       aiSpeech: "We start by analyzing CSC202 Chapter 2. Merge Sort is a divide-and-conquer algorithm that recursively splits arrays into halves.",
//       whiteboardType: "concept",
//       highlightText: "Divide & Conquer Paradigm",
//     },
//     {
//       title: "Stage 2: Live Step-by-Step Problem Solving",
//       duration: "1:15 - 3:30",
//       aiSpeech: "Watch as the AI writes out the recurrence relation: T(n) = 2T(n/2) + O(n). Let's solve for time complexity step-by-step.",
//       whiteboardType: "solving",
//       highlightText: "T(n) = 2T(n/2) + O(n) ⇒ O(n log n)",
//     },
//     {
//       title: "Stage 3: Interactive Diagram Drawing & Labeling",
//       duration: "3:30 - 5:00",
//       aiSpeech: "Now, let's draw the recursive tree. Notice how each level takes linear time O(n), and there are log n total depth levels.",
//       whiteboardType: "diagram",
//       highlightText: "Recursive Tree & Labeling",
//     },
//     {
//       title: "Stage 4: Real-Time Student Q&A",
//       duration: "5:00 - 7:00",
//       aiSpeech: "You can pause at any time to ask questions. The AI instantly generates custom code implementations or alternate explanations.",
//       whiteboardType: "qa",
//       highlightText: "Live Interactive Assistance",
//     }
//   ];

//   /**
//    * Auto-advance simulation ticker. When isPlaying is true, this interval increments
//    * the playback progress and dynamically syncs the current lessonStep index.
//    */
//   useEffect(() => {
//     let interval: NodeJS.Timeout;
//     if (isPlaying) {
//       interval = setInterval(() => {
//         setPlaybackProgress((prev) => {
//           if (prev >= 100) {
//             setLessonStep(0);
//             return 0;
//           }
//           const next = prev + 1;
//           if (next <= 25) setLessonStep(0);
//           else if (next <= 50) setLessonStep(1);
//           else if (next <= 75) setLessonStep(2);
//           else setLessonStep(3);
//           return next;
//         });
//       }, 150);
//     }
//     return () => clearInterval(interval);
//   }, [isPlaying]);

//   /**
//    * Handles student submission in the live Q&A sidebar. Appends the user message
//    * to the chat log and triggers an automated AI response simulation after 1 second.
//    */
//   const handleAskAI = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!studentQuestion.trim()) return;

//     const newQuestion = studentQuestion;
//     setStudentQuestion("");
//     setChatLog((prev) => [...prev, { sender: "user", text: newQuestion }]);

//     setTimeout(() => {
//       setChatLog((prev) => [
//         ...prev,
//         {
//           sender: "ai",
//           text: `Great question! Based on your notes for "${newQuestion}", the AI virtual tutor instantly computes the step-by-step breakdown and updates the whiteboard with the exact solution.`
//         }
//       ]);
//     }, 1000);
//   };

//   return (
//     <section id="tutor" className="py-24 bg-gray-50 dark:bg-dark-bg relative border-t border-gray-200 dark:border-dark-border transition-colors duration-300">
//       {/* Background radial ambient glow */}
//       <div className="absolute top-1/4 left-1/3 w-[600px] h-[350px] bg-brand-blue/10 rounded-full blur-[150px] pointer-events-none"></div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
//         {/* Section Header */}
//         <div className="text-center max-w-3xl mx-auto mb-16">
//           <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/30 text-brand-blue text-xs font-semibold mb-4 shadow-sm">
//             <Video className="w-3.5 h-3.5" />
//             <span>Virtual AI Classroom Experience</span>
//           </div>
//           <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
//             Watch the AI Teacher Write Notes, Draw & Solve Live
//           </h2>
//           <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">
//             Say goodbye to passive YouTube tutorials. gleamLearn features a live AI virtual instructor that appears on screen, sketches diagrams, labels structures, and solves equations in real time as you study.
//           </p>
//         </div>

//         {/* Main Virtual Classroom Player Container */}
//         <div className="bg-gray-900 dark:bg-[#0b0f19] rounded-3xl border border-gray-800 shadow-2xl overflow-hidden max-w-6xl mx-auto relative">
          
//           {/* Top Video Player Bar */}
//           <div className="px-6 py-3.5 bg-gray-950/90 border-b border-gray-800 flex items-center justify-between text-xs text-gray-400">
//             <div className="flex items-center gap-3">
//               <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
//               <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span>
//               <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
//               <span className="font-mono text-gray-300 ml-2">gleamLearn_Virtual_Classroom // CSC202_Algorithms.live</span>
//             </div>
//             <div className="flex items-center gap-4">
//               <span className="px-3 py-1 rounded-full bg-brand-green/20 text-brand-green font-bold text-[11px] border border-brand-green/30 flex items-center gap-1.5">
//                 <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></span> AI Instructor Active (Dr. Gleam)
//               </span>
//             </div>
//           </div>

//           {/* Virtual Classroom Stage Grid */}
//           <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
            
//             {/* Left/Center: Virtual Whiteboard & AI Instructor Canvas */}
//             <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between relative bg-gradient-to-b from-gray-900 to-gray-950 border-r border-gray-800">
              
//               {/* AI Instructor Head-Up Display (HUD) */}
//               <div className="flex items-center justify-between mb-4">
//                 <div className="flex items-center gap-3">
//                   <div className="relative">
//                     <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-blue to-brand-purple flex items-center justify-center text-white shadow-lg shadow-brand-blue/30 border border-white/20">
//                       <Bot className="w-6 h-6 animate-pulse" />
//                     </div>
//                     <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-brand-green border-2 border-gray-900 flex items-center justify-center text-[9px] font-bold text-white">AI</span>
//                   </div>
//                   <div>
//                     <h4 className="text-sm font-bold text-white">Dr. Gleam <span className="text-xs text-brand-blue font-normal ml-1">(Virtual AI Professor)</span></h4>
//                     <p className="text-xs text-gray-400">Explaining: <strong className="text-gray-200">{lessonStages[lessonStep].title}</strong></p>
//                   </div>
//                 </div>

//                 <div className="hidden sm:flex items-center gap-2">
//                   <span className="px-2.5 py-1 rounded-lg bg-gray-800 text-gray-300 font-mono text-[11px]">HD 1080p</span>
//                   <span className="px-2.5 py-1 rounded-lg bg-brand-blue/20 text-brand-blue font-mono text-[11px] font-bold">Live Sync RAG</span>
//                 </div>
//               </div>

//               {/* Dynamic Live Whiteboard & Sketching Area */}
//               <div className="bg-gray-950/80 rounded-2xl p-6 sm:p-8 border border-gray-800 relative overflow-hidden my-4 min-h-[280px] flex flex-col justify-center items-center text-center shadow-inner">
//                 <div className="absolute inset-0 bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:20px_20px] opacity-25 pointer-events-none"></div>

//                 <AnimatePresence mode="wait">
//                   {lessonStep === 0 && (
//                     <motion.div key="step0" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-4 max-w-md">
//                       <span className="px-3 py-1 rounded-full bg-brand-blue/20 text-brand-blue text-xs font-semibold">Phase 1: Syllabus Extraction</span>
//                       <h3 className="text-xl font-bold text-white">CSC202: Advanced Sorting Algorithms</h3>
//                       <p className="text-xs text-gray-300 font-mono bg-gray-900 p-3 rounded-xl border border-gray-800">
//                         &gt; Loaded source: <span className="text-brand-green">CSC202_Algorithms.pdf</span> (Page 24)<br/>
//                         &gt; Topic: Divide and Conquer paradigm & asymptotic analysis.
//                       </p>
//                     </motion.div>
//                   )}

//                   {lessonStep === 1 && (
//                     <motion.div key="step1" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-4 max-w-md">
//                       <span className="px-3 py-1 rounded-full bg-brand-purple/20 text-brand-purple text-xs font-semibold">Phase 2: Live Equation Solver</span>
//                       <div className="bg-gray-900 p-4 rounded-2xl border border-purple-500/30 text-white font-mono text-sm space-y-2 shadow-lg">
//                         <div className="text-brand-purple font-bold">Recurrence Relation:</div>
//                         <div className="text-gray-200">T(n) = 2T(n/2) + O(n)</div>
//                         <div className="text-xs text-gray-400 pt-2 border-t border-gray-800">
//                           Master Theorem Case 2 Result: O(n log n)
//                         </div>
//                       </div>
//                     </motion.div>
//                   )}

//                   {lessonStep === 2 && (
//                     <motion.div key="step2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-3 max-w-lg w-full">
//                       <span className="px-3 py-1 rounded-full bg-brand-orange/20 text-brand-orange text-xs font-semibold">Phase 3: Diagram & Labeling Engine</span>
//                       <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 text-left font-mono text-xs space-y-2">
//                         <div className="text-brand-blue font-bold flex items-center justify-between">
//                           <span>[Merge Sort Execution Tree]</span>
//                           <span className="text-[10px] text-gray-400">Live AI Vector Rendering</span>
//                         </div>
//                         <div className="text-center py-2 text-gray-300 bg-gray-950 rounded-lg p-3">
//                           <span className="text-brand-purple">[38, 27, 43, 3, 9, 82, 10]</span><br/>
//                           <span className="text-gray-500">↓ Split (Level 0)</span><br/>
//                           <span className="text-brand-blue">[38, 27, 43, 3]</span> &nbsp; | &nbsp; <span className="text-brand-blue">[9, 82, 10]</span>
//                         </div>
//                       </div>
//                     </motion.div>
//                   )}

//                   {lessonStep === 3 && (
//                     <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-4 max-w-md">
//                       <span className="px-3 py-1 rounded-full bg-brand-green/20 text-brand-green text-xs font-semibold">Phase 4: Interactive Student Q&A</span>
//                       <p className="text-sm text-white font-medium">
//                         &quot;Ask me anything about time complexity, edge cases, or request custom code snippets in Python, JavaScript, or Flutter!&quot;
//                       </p>
//                       <div className="flex items-center justify-center gap-2 text-xs text-brand-blue">
//                         <Sparkles className="w-3.5 h-3.5" /> <span>AI Teacher is standing by for your questions</span>
//                       </div>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>

//                 {/* AI Spoken Audio Subtitle Bar */}
//                 <div className="absolute bottom-3 left-4 right-4 bg-gray-900/95 backdrop-blur-md px-4 py-2 rounded-xl border border-gray-800 text-center">
//                   <p className="text-xs text-gray-300 italic">
//                     🎙️ &quot;{lessonStages[lessonStep].aiSpeech}&quot;
//                   </p>
//                 </div>
//               </div>

//               {/* Video Playback Controls Bar */}
//               <div className="space-y-3 pt-2">
//                 <div className="flex items-center gap-3">
//                   <button
//                     onClick={() => setIsPlaying(!isPlaying)}
//                     className="w-10 h-10 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white flex items-center justify-center shadow-md transition-all flex-shrink-0"
//                   >
//                     {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
//                   </button>

//                   {/* Scrubber Timeline */}
//                   <div className="flex-1 relative flex items-center">
//                     <input
//                       type="range"
//                       min="0"
//                       max="100"
//                       value={playbackProgress}
//                       onChange={(e) => setPlaybackProgress(Number(e.target.value))}
//                       className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-brand-blue"
//                     />
//                   </div>

//                   <span className="text-xs font-mono text-gray-400 w-12 text-right">
//                     {Math.floor((playbackProgress / 100) * 7)}:00 min
//                   </span>
//                 </div>

//                 <div className="flex flex-wrap items-center justify-between text-xs text-gray-400 pt-1">
//                   <span>Current Stage: <strong className="text-gray-200">{lessonStages[lessonStep].title}</strong></span>
//                   <div className="flex items-center gap-2">
//                     <button onClick={() => setPlaybackProgress(0)} className="hover:text-white flex items-center gap-1">
//                       <RotateCcw className="w-3 h-3" /> Restart Lesson
//                     </button>
//                   </div>
//                 </div>
//               </div>

//             </div>

//             {/* Right: Interactive Student Transcript & Live Q&A Sidebar */}
//             <div className="lg:col-span-4 p-6 bg-gray-950 flex flex-col justify-between">
              
//               <div>
//                 <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
//                   <div className="flex items-center gap-2">
//                     <MessageSquare className="w-4 h-4 text-brand-green" />
//                     <h3 className="text-xs font-bold text-white uppercase tracking-wider">Classroom Q&A & Transcript</h3>
//                   </div>
//                   <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 text-[10px] font-mono">Live Sync</span>
//                 </div>

//                 {/* Chat Log Container */}
//                 <div className="space-y-3 max-h-[310px] overflow-y-auto pr-1">
//                   {chatLog.map((msg, idx) => (
//                     <div
//                       key={idx}
//                       className={`p-3 rounded-xl text-xs leading-relaxed ${
//                         msg.sender === "user"
//                           ? "bg-brand-blue/20 text-blue-200 border border-brand-blue/30 ml-4"
//                           : "bg-gray-900 text-gray-300 border border-gray-800 mr-4"
//                       }`}
//                     >
//                       <div className="flex items-center gap-1.5 font-bold mb-1 text-[10px] text-gray-400">
//                         {msg.sender === "ai" ? <Bot className="w-3 h-3 text-brand-green" /> : <span className="w-3 h-3 rounded bg-brand-blue text-white flex items-center justify-center text-[8px]">HS</span>}
//                         <span>{msg.sender === "ai" ? "Dr. Gleam (AI)" : "Hilosthone (You)"}</span>
//                       </div>
//                       <p>{msg.text}</p>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Ask AI Input Form */}
//               <form onSubmit={handleAskAI} className="mt-4 pt-4 border-t border-gray-800">
//                 <div className="flex gap-2">
//                   <input
//                     type="text"
//                     value={studentQuestion}
//                     onChange={(e) => setStudentQuestion(e.target.value)}
//                     placeholder="Ask the virtual AI teacher a question..."
//                     className="flex-1 px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue"
//                   />
//                   <button
//                     type="submit"
//                     className="px-4 py-2.5 rounded-xl bg-brand-green hover:bg-brand-green/90 text-white font-bold text-xs flex items-center justify-center shadow-lg shadow-brand-green/20"
//                   >
//                     <ArrowRight className="w-4 h-4" />
//                   </button>
//                 </div>
//                 <p className="text-[10px] text-gray-500 mt-2 text-center">AI responds instantly with notes, code, or diagrams.</p>
//               </form>

//             </div>

//           </div>

//         </div>

//       </div>
//     </section>
//   );
// }


"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, Play, Pause, RotateCcw, Sparkles, ArrowRight, 
  MessageSquare, Video, Mic, PhoneCall, Cpu, Activity 
} from "lucide-react";

interface ChatMessage {
  sender: "ai" | "user";
  text: string;
  name?: string;
}

/**
 * AIClassroomTutorSection Component
 * 
 * Showcase section for gleamLearn's virtual AI classroom feature. It simulates
 * an interactive video player where an AI professor ("Dr. Gleam") writes notes on a
 * dynamic whiteboard, animates engineering and medical diagrams coming together, 
 * solves equations step-by-step, and mimics live video/audio calls with real-time Q&A.
 */
export default function AIClassroomTutorSection() {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackProgress, setPlaybackProgress] = useState<number>(20);
  const [lessonStep, setLessonStep] = useState<number>(0);
  const [studentQuestion, setStudentQuestion] = useState<string>("");
  const [callMode, setCallMode] = useState<"video" | "audio">("video");
  const [chatLog, setChatLog] = useState<ChatMessage[]>([
    { 
      sender: "ai", 
      text: "Welcome to Dr. Gleam's multi-disciplinary masterclass. We'll be synthesizing concepts across Computer Science, Engineering, and Medical Anatomy today." 
    },
  ]);

  // Simulated lesson timeline stages
  const lessonStages = [
    {
      title: "Stage 1: Syllabus Grounding & Core Concept",
      duration: "0:00 - 1:15",
      aiSpeech: "We start by analyzing your uploaded syllabus. Let's observe how complex formulas converge into unified equations.",
      whiteboardType: "formula",
    },
    {
      title: "Stage 2: Engineering Mechanical Assembly",
      duration: "1:15 - 3:30",
      aiSpeech: "Watch as the AI vector engine dynamically assembles mechanical components, linking stress vectors and kinematics live.",
      whiteboardType: "engineering",
    },
    {
      title: "Stage 3: Medical Anatomy & Physiological Labeling",
      duration: "3:30 - 5:00",
      aiSpeech: "Transitioning to human physiology: notice how the neural network automatically traces and labels neural pathways and circulatory loops.",
      whiteboardType: "medical",
    },
    {
      title: "Stage 4: Live Video & Audio Call Q&A",
      duration: "5:00 - 7:00",
      aiSpeech: "You can switch between HD Video call mode and low-latency Audio voice chat at any time. Let's take your live questions!",
      whiteboardType: "qa",
    }
  ];

  /**
   * Auto-advance simulation ticker. When isPlaying is true, this interval increments
   * the playback progress and dynamically syncs the current lessonStep index.
   */
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackProgress((prev) => {
          const next = prev >= 100 ? 0 : prev + 1;
          
          // Sync lesson steps dynamically based on progress percentage
          if (next <= 25) setLessonStep(0);
          else if (next <= 50) setLessonStep(1);
          else if (next <= 75) setLessonStep(2);
          else setLessonStep(3);

          return next;
        });
      }, 160);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  /**
   * Synchronizes lesson step instantly when user manually adjusts the scrubber.
   */
  const handleProgressChange = (val: number) => {
    setPlaybackProgress(val);
    if (val <= 25) setLessonStep(0);
    else if (val <= 50) setLessonStep(1);
    else if (val <= 75) setLessonStep(2);
    else setLessonStep(3);
  };

  /**
   * Handles student submission in the live Q&A sidebar. Appends the user message
   * to the chat log and triggers an automated AI response simulation after 1 second.
   */
  const handleAskAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentQuestion.trim()) return;

    const newQuestion = studentQuestion;
    setStudentQuestion("");
    setChatLog((prev) => [...prev, { sender: "user", text: newQuestion, name: "Student" }]);

    setTimeout(() => {
      setChatLog((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `Dr. Gleam AI: Addressing "${newQuestion}". I've updated the virtual canvas with a custom animated breakdown and synchronized audio response.`
        }
      ]);
    }, 1000);
  };

  return (
    <section id="tutor" className="py-24 bg-gray-50 dark:bg-dark-bg relative border-t border-gray-200 dark:border-dark-border transition-colors duration-300">
      {/* Background radial ambient glow */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[350px] bg-brand-blue/10 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/30 text-brand-blue text-xs font-semibold mb-4 shadow-sm">
            <Video className="w-3.5 h-3.5" />
            <span>Virtual AI Classroom & Live Call Studio</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
            Watch Formulas Converge, Engineering & Medical Diagrams Assemble Live
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">
            Experience fully animated virtual classes where Dr. Gleam constructs multi-variable equations, 3D mechanical assemblies, and physiological anatomical labels in real time through simulated video and voice calls.
          </p>
        </div>

        {/* Main Virtual Classroom Player Container */}
        <div className="bg-gray-900 dark:bg-[#0b0f19] rounded-3xl border border-gray-800 shadow-2xl overflow-hidden max-w-6xl mx-auto relative">
          
          {/* Top Video Player Bar with Call Mode Toggles */}
          <div className="px-6 py-3.5 bg-gray-950/90 border-b border-gray-800 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
              <span className="font-mono text-gray-300 ml-2">gleamLearn_Masterclass // Multi_Disciplinary.live</span>
            </div>

            {/* Virtual Call Mode Selector (Video vs Audio Call) */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCallMode("video")}
                className={`px-3 py-1 rounded-lg flex items-center gap-1.5 font-medium transition-all cursor-pointer ${
                  callMode === "video" 
                    ? "bg-brand-blue text-white shadow-md shadow-brand-blue/30" 
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                <Video className="w-3.5 h-3.5" /> Video Call
              </button>
              <button 
                onClick={() => setCallMode("audio")}
                className={`px-3 py-1 rounded-lg flex items-center gap-1.5 font-medium transition-all cursor-pointer ${
                  callMode === "audio" 
                    ? "bg-brand-green text-white shadow-md shadow-brand-green/30" 
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                <PhoneCall className="w-3.5 h-3.5" /> Audio Call
              </button>
            </div>
          </div>

          {/* Virtual Classroom Stage Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
            
            {/* Left/Center: Dynamic Whiteboard & Animated AI Canvas */}
            <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between relative bg-gradient-to-b from-gray-900 to-gray-950 border-r border-gray-800">
              
              {/* AI Instructor Head-Up Display (HUD) */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-blue to-brand-purple flex items-center justify-center text-white shadow-lg shadow-brand-blue/30 border border-white/20">
                      <Bot className="w-6 h-6 animate-pulse" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-brand-green border-2 border-gray-900 flex items-center justify-center text-[9px] font-bold text-white">AI</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Dr. Gleam <span className="text-xs text-brand-blue font-normal ml-1">(Virtual Professor)</span></h4>
                    <p className="text-xs text-gray-400">Current Focus: <strong className="text-gray-200">{lessonStages[lessonStep].title}</strong></p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {callMode === "video" ? (
                    <span className="px-2.5 py-1 rounded-lg bg-brand-blue/20 text-brand-blue font-mono text-[11px] font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-brand-blue animate-ping"></span> HD Stream Active
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-brand-green/20 text-brand-green font-mono text-[11px] font-bold flex items-center gap-1.5">
                      <Mic className="w-3 h-3 animate-pulse" /> Spatial Audio Live
                    </span>
                  )}
                </div>
              </div>

              {/* Dynamic Animated Whiteboard Canvas Area */}
              <div className="bg-gray-950/90 rounded-2xl p-6 sm:p-8 border border-gray-800 relative overflow-hidden my-4 min-h-[300px] flex flex-col justify-center items-center text-center shadow-inner">
                <div className="absolute inset-0 bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:20px_20px] opacity-25 pointer-events-none"></div>

                {/* Simulated Audio Visualizer Ring when in Audio Call mode */}
                {callMode === "audio" && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <div className="w-64 h-64 rounded-full border border-brand-green animate-ping"></div>
                    <div className="absolute w-48 h-48 rounded-full border border-brand-blue animate-pulse"></div>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {/* Stage 0: Formulas Coming Together Animation */}
                  {lessonStep === 0 && (
                    <motion.div 
                      key="step0" 
                      initial={{ opacity: 0, scale: 0.9 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      exit={{ opacity: 0, scale: 0.9 }} 
                      className="space-y-4 max-w-lg w-full"
                    >
                      <span className="px-3 py-1 rounded-full bg-brand-blue/20 text-brand-blue text-xs font-semibold">Stage 1: Formula Synthesis Engine</span>
                      <h3 className="text-lg font-bold text-white">Watch Split Equations Converge into One</h3>
                      
                      <div className="grid grid-cols-3 gap-2 my-3">
                        <motion.div 
                          animate={{ x: [0, 15, 0], opacity: [0.7, 1, 0.7] }} 
                          transition={{ repeat: Infinity, duration: 3 }}
                          className="bg-gray-900 p-3 rounded-xl border border-gray-800 font-mono text-xs text-brand-purple"
                        >
                          {"f(x) = ∫ e^(-x) dx"}
                        </motion.div>
                        <motion.div 
                          animate={{ y: [0, -10, 0] }} 
                          transition={{ repeat: Infinity, duration: 2.5 }}
                          className="bg-gray-900 p-3 rounded-xl border border-gray-800 font-mono text-xs text-brand-blue"
                        >
                          {"T(n) = 2T(n/2) + O(n)"}
                        </motion.div>
                        <motion.div 
                          animate={{ x: [0, -15, 0], opacity: [0.7, 1, 0.7] }} 
                          transition={{ repeat: Infinity, duration: 3 }}
                          className="bg-gray-900 p-3 rounded-xl border border-gray-800 font-mono text-xs text-brand-green"
                        >
                          {"E = mc² + ΔS"}
                        </motion.div>
                      </div>

                      <div className="bg-gray-900 p-4 rounded-xl border border-brand-blue/40 text-white font-mono text-xs shadow-lg">
                        <span className="text-gray-400">&gt; Synthesizing unified master equation...</span><br/>
                        <span className="text-brand-green font-bold text-sm">{"Grand Unified Theorem Ψ(n) = ∑ ∇ · F"}</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Stage 1: Engineering Drawing & Mechanical Assembly Animation */}
                  {lessonStep === 1 && (
                    <motion.div 
                      key="step1" 
                      initial={{ opacity: 0, scale: 0.9 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      exit={{ opacity: 0, scale: 0.9 }} 
                      className="space-y-4 max-w-lg w-full"
                    >
                      <span className="px-3 py-1 rounded-full bg-brand-orange/20 text-brand-orange text-xs font-semibold">Stage 2: Engineering Kinematics Assembly</span>
                      <div className="bg-gray-900 p-5 rounded-2xl border border-orange-500/30 text-white space-y-3 shadow-lg">
                        <div className="flex items-center justify-between text-xs font-mono text-brand-orange">
                          <span className="flex items-center gap-1.5"><Cpu className="w-4 h-4" /> Mechanical Gear Assembly</span>
                          <span>Stress Analysis: Optimal</span>
                        </div>
                        <div className="flex justify-center items-center gap-3 py-2">
                          <motion.div 
                            animate={{ rotate: 360 }} 
                            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                            className="w-14 h-14 rounded-full border-2 border-dashed border-brand-blue flex items-center justify-center font-mono text-[10px]"
                          >
                            Gear A
                          </motion.div>
                          <motion.div 
                            animate={{ width: ["20px", "50px", "20px"] }} 
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="h-1 bg-brand-orange rounded-full"
                          ></motion.div>
                          <motion.div 
                            animate={{ rotate: -360 }} 
                            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                            className="w-14 h-14 rounded-full border-2 border-dashed border-brand-green flex items-center justify-center font-mono text-[10px]"
                          >
                            Gear B
                          </motion.div>
                        </div>
                        <p className="text-xs text-gray-300 font-mono">
                          &gt; Torque ratio calculated: <span className="text-brand-green">1:2.45</span> with live stress mapping vectors.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Stage 2: Medical Anatomy & Physiological Labeling */}
                  {lessonStep === 2 && (
                    <motion.div 
                      key="step2" 
                      initial={{ opacity: 0, scale: 0.9 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      exit={{ opacity: 0, scale: 0.9 }} 
                      className="space-y-3 max-w-lg w-full"
                    >
                      <span className="px-3 py-1 rounded-full bg-brand-purple/20 text-brand-purple text-xs font-semibold">Stage 3: Medical Anatomy & Labeling Engine</span>
                      <div className="bg-gray-900 p-4 rounded-xl border border-purple-500/30 text-left space-y-3">
                        <div className="flex items-center justify-between text-xs font-mono text-brand-purple">
                          <span className="flex items-center gap-1.5"><Activity className="w-4 h-4" /> Cardiovascular Neural Circuit</span>
                          <span>Auto-Labeling Active</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                          <motion.div 
                            initial={{ x: -10, opacity: 0 }} 
                            animate={{ x: 0, opacity: 1 }} 
                            className="p-2.5 rounded-lg bg-gray-950 border border-gray-800 text-gray-300"
                          >
                            <span className="text-brand-blue font-bold">1. Sinoatrial Node</span><br/>
                            <span className="text-[10px] text-gray-500">Pacemaker depolarization</span>
                          </motion.div>
                          <motion.div 
                            initial={{ x: 10, opacity: 0 }} 
                            animate={{ x: 0, opacity: 1 }} 
                            className="p-2.5 rounded-lg bg-gray-950 border border-gray-800 text-gray-300"
                          >
                            <span className="text-brand-green font-bold">2. Purkinje Fibers</span><br/>
                            <span className="text-[10px] text-gray-500">Ventricle contraction trigger</span>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Stage 3: Live Video / Audio Call Mode Active */}
                  {lessonStep === 3 && (
                    <motion.div 
                      key="step3" 
                      initial={{ opacity: 0, scale: 0.9 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      exit={{ opacity: 0, scale: 0.9 }} 
                      className="space-y-4 max-w-md"
                    >
                      <span className="px-3 py-1 rounded-full bg-brand-green/20 text-brand-green text-xs font-semibold">Stage 4: Live Call Q&A Studio</span>
                      <div className="bg-gray-900 p-4 rounded-2xl border border-brand-green/30 text-center space-y-2">
                        <div className="w-12 h-12 rounded-full bg-brand-green/20 text-brand-green mx-auto flex items-center justify-center animate-bounce">
                          {callMode === "video" ? <Video className="w-6 h-6" /> : <PhoneCall className="w-6 h-6" />}
                        </div>
                        <h4 className="text-sm font-bold text-white">Dr. Gleam is listening in {callMode === "video" ? "Video" : "Audio"} mode</h4>
                        <p className="text-xs text-gray-400">Speak or type your question below for instant AI synthesis and whiteboard illustration.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* AI Spoken Audio Subtitle Bar */}
                <div className="absolute bottom-3 left-4 right-4 bg-gray-900/95 backdrop-blur-md px-4 py-2 rounded-xl border border-gray-800 text-center shadow-lg">
                  <p className="text-xs text-gray-300 italic">
                    🎙️ &quot;{lessonStages[lessonStep].aiSpeech}&quot;
                  </p>
                </div>
              </div>

              {/* Video Playback Controls Bar */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-10 h-10 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white flex items-center justify-center shadow-md transition-all flex-shrink-0 cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>

                  {/* Scrubber Timeline */}
                  <div className="flex-1 relative flex items-center">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={playbackProgress}
                      onChange={(e) => handleProgressChange(Number(e.target.value))}
                      className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-brand-blue"
                    />
                  </div>

                  <span className="text-xs font-mono text-gray-400 w-12 text-right">
                    {Math.floor((playbackProgress / 100) * 7)}:00 min
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs text-gray-400 pt-1">
                  <span>Current Stage: <strong className="text-gray-200">{lessonStages[lessonStep].title}</strong></span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleProgressChange(0)} className="hover:text-white flex items-center gap-1 cursor-pointer">
                      <RotateCcw className="w-3 h-3" /> Restart Lesson
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Right: Interactive Student Transcript & Live Q&A Sidebar */}
            <div className="lg:col-span-4 p-6 bg-gray-950 flex flex-col justify-between">
              
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-brand-green" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Classroom Q&A & Transcript</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 text-[10px] font-mono">Live Sync</span>
                </div>

                {/* Chat Log Container */}
                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                  {chatLog.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl text-xs leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-brand-blue/25 text-blue-200 border border-brand-blue/30 ml-4"
                          : "bg-gray-900 text-gray-300 border border-gray-800 mr-4"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold mb-1 text-[10px] text-gray-400">
                        {msg.sender === "ai" ? (
                          <Bot className="w-3 h-3 text-brand-green" />
                        ) : (
                          <span className="w-3 h-3 rounded bg-brand-blue text-white flex items-center justify-center text-[8px]">ST</span>
                        )}
                        <span>{msg.sender === "ai" ? "Dr. Gleam (AI)" : `${msg.name || "Student"}`}</span>
                      </div>
                      <p>{msg.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ask AI Input Form */}
              <form onSubmit={handleAskAI} className="mt-4 pt-4 border-t border-gray-800">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={studentQuestion}
                    onChange={(e) => setStudentQuestion(e.target.value)}
                    placeholder="Ask Dr. Gleam a question or request a diagram..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-brand-green hover:bg-brand-green/90 text-white font-bold text-xs flex items-center justify-center shadow-lg shadow-brand-green/20 cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10px] text-gray-500 mt-2 text-center">AI responds instantly with animations, formulas, or voice synthesis.</p>
              </form>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}