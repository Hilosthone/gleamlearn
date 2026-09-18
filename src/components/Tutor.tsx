// //Tutor
// "use client";

// import React, { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { 
//   Bot, Play, Pause, RotateCcw, Sparkles, ArrowRight, 
//   MessageSquare, Video, Mic, PhoneCall, Cpu, Activity 
// } from "lucide-react";

// interface ChatMessage {
//   sender: "ai" | "user";
//   text: string;
//   name?: string;
// }

// /**
//  * AIClassroomTutorSection Component
//  * 
//  * Showcase section for gleamLearn's virtual AI classroom feature. It simulates
//  * an interactive video player where an AI professor ("Dr. Gleam") writes notes on a
//  * dynamic whiteboard, animates engineering and medical diagrams coming together, 
//  * solves equations step-by-step, and mimics live video/audio calls with real-time Q&A.
//  */
// export default function AIClassroomTutorSection() {
//   const [isPlaying, setIsPlaying] = useState<boolean>(true);
//   const [playbackProgress, setPlaybackProgress] = useState<number>(20);
//   const [lessonStep, setLessonStep] = useState<number>(0);
//   const [studentQuestion, setStudentQuestion] = useState<string>("");
//   const [callMode, setCallMode] = useState<"video" | "audio">("video");
//   const [chatLog, setChatLog] = useState<ChatMessage[]>([
//     { 
//       sender: "ai", 
//       text: "Welcome to Dr. Gleam's multi-disciplinary masterclass. We'll be synthesizing concepts across Computer Science, Engineering, and Medical Anatomy today." 
//     },
//   ]);

//   // Simulated lesson timeline stages
//   const lessonStages = [
//     {
//       title: "Stage 1: Syllabus Grounding & Core Concept",
//       duration: "0:00 - 1:15",
//       aiSpeech: "We start by analyzing your uploaded syllabus. Let's observe how complex formulas converge into unified equations.",
//       whiteboardType: "formula",
//     },
//     {
//       title: "Stage 2: Engineering Mechanical Assembly",
//       duration: "1:15 - 3:30",
//       aiSpeech: "Watch as the AI vector engine dynamically assembles mechanical components, linking stress vectors and kinematics live.",
//       whiteboardType: "engineering",
//     },
//     {
//       title: "Stage 3: Medical Anatomy & Physiological Labeling",
//       duration: "3:30 - 5:00",
//       aiSpeech: "Transitioning to human physiology: notice how the neural network automatically traces and labels neural pathways and circulatory loops.",
//       whiteboardType: "medical",
//     },
//     {
//       title: "Stage 4: Live Video & Audio Call Q&A",
//       duration: "5:00 - 7:00",
//       aiSpeech: "You can switch between HD Video call mode and low-latency Audio voice chat at any time. Let's take your live questions!",
//       whiteboardType: "qa",
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
//           const next = prev >= 100 ? 0 : prev + 1;
          
//           // Sync lesson steps dynamically based on progress percentage
//           if (next <= 25) setLessonStep(0);
//           else if (next <= 50) setLessonStep(1);
//           else if (next <= 75) setLessonStep(2);
//           else setLessonStep(3);

//           return next;
//         });
//       }, 160);
//     }
//     return () => clearInterval(interval);
//   }, [isPlaying]);

//   /**
//    * Synchronizes lesson step instantly when user manually adjusts the scrubber.
//    */
//   const handleProgressChange = (val: number) => {
//     setPlaybackProgress(val);
//     if (val <= 25) setLessonStep(0);
//     else if (val <= 50) setLessonStep(1);
//     else if (val <= 75) setLessonStep(2);
//     else setLessonStep(3);
//   };

//   /**
//    * Handles student submission in the live Q&A sidebar. Appends the user message
//    * to the chat log and triggers an automated AI response simulation after 1 second.
//    */
//   const handleAskAI = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!studentQuestion.trim()) return;

//     const newQuestion = studentQuestion;
//     setStudentQuestion("");
//     setChatLog((prev) => [...prev, { sender: "user", text: newQuestion, name: "Student" }]);

//     setTimeout(() => {
//       setChatLog((prev) => [
//         ...prev,
//         {
//           sender: "ai",
//           text: `Dr. Gleam AI: Addressing "${newQuestion}". I've updated the virtual canvas with a custom animated breakdown and synchronized audio response.`
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
//             <span>Virtual AI Classroom & Live Call Studio</span>
//           </div>
//           <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
//             Watch Formulas Converge, Engineering & Medical Diagrams Assemble Live
//           </h2>
//           <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">
//             Experience fully animated virtual classes where Dr. Gleam constructs multi-variable equations, 3D mechanical assemblies, and physiological anatomical labels in real time through simulated video and voice calls.
//           </p>
//         </div>

//         {/* Main Virtual Classroom Player Container */}
//         <div className="bg-gray-900 dark:bg-[#0b0f19] rounded-3xl border border-gray-800 shadow-2xl overflow-hidden max-w-6xl mx-auto relative">
          
//           {/* Top Video Player Bar with Call Mode Toggles */}
//           <div className="px-6 py-3.5 bg-gray-950/90 border-b border-gray-800 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-400">
//             <div className="flex items-center gap-3">
//               <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
//               <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span>
//               <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
//               <span className="font-mono text-gray-300 ml-2">gleamLearn_Masterclass // Multi_Disciplinary.live</span>
//             </div>

//             {/* Virtual Call Mode Selector (Video vs Audio Call) */}
//             <div className="flex items-center gap-2">
//               <button 
//                 onClick={() => setCallMode("video")}
//                 className={`px-3 py-1 rounded-lg flex items-center gap-1.5 font-medium transition-all cursor-pointer ${
//                   callMode === "video" 
//                     ? "bg-brand-blue text-white shadow-md shadow-brand-blue/30" 
//                     : "bg-gray-800 text-gray-300 hover:bg-gray-700"
//                 }`}
//               >
//                 <Video className="w-3.5 h-3.5" /> Video Call
//               </button>
//               <button 
//                 onClick={() => setCallMode("audio")}
//                 className={`px-3 py-1 rounded-lg flex items-center gap-1.5 font-medium transition-all cursor-pointer ${
//                   callMode === "audio" 
//                     ? "bg-brand-green text-white shadow-md shadow-brand-green/30" 
//                     : "bg-gray-800 text-gray-300 hover:bg-gray-700"
//                 }`}
//               >
//                 <PhoneCall className="w-3.5 h-3.5" /> Audio Call
//               </button>
//             </div>
//           </div>

//           {/* Virtual Classroom Stage Grid */}
//           <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
            
//             {/* Left/Center: Dynamic Whiteboard & Animated AI Canvas */}
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
//                     <h4 className="text-sm font-bold text-white">Dr. Gleam <span className="text-xs text-brand-blue font-normal ml-1">(Virtual Professor)</span></h4>
//                     <p className="text-xs text-gray-400">Current Focus: <strong className="text-gray-200">{lessonStages[lessonStep].title}</strong></p>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-2">
//                   {callMode === "video" ? (
//                     <span className="px-2.5 py-1 rounded-lg bg-brand-blue/20 text-brand-blue font-mono text-[11px] font-bold flex items-center gap-1.5">
//                       <span className="w-2 h-2 rounded-full bg-brand-blue animate-ping"></span> HD Stream Active
//                     </span>
//                   ) : (
//                     <span className="px-2.5 py-1 rounded-lg bg-brand-green/20 text-brand-green font-mono text-[11px] font-bold flex items-center gap-1.5">
//                       <Mic className="w-3 h-3 animate-pulse" /> Spatial Audio Live
//                     </span>
//                   )}
//                 </div>
//               </div>

//               {/* Dynamic Animated Whiteboard Canvas Area */}
//               <div className="bg-gray-950/90 rounded-2xl p-6 sm:p-8 border border-gray-800 relative overflow-hidden my-4 min-h-[300px] flex flex-col justify-center items-center text-center shadow-inner">
//                 <div className="absolute inset-0 bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:20px_20px] opacity-25 pointer-events-none"></div>

//                 {/* Simulated Audio Visualizer Ring when in Audio Call mode */}
//                 {callMode === "audio" && (
//                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
//                     <div className="w-64 h-64 rounded-full border border-brand-green animate-ping"></div>
//                     <div className="absolute w-48 h-48 rounded-full border border-brand-blue animate-pulse"></div>
//                   </div>
//                 )}

//                 <AnimatePresence mode="wait">
//                   {/* Stage 0: Formulas Coming Together Animation */}
//                   {lessonStep === 0 && (
//                     <motion.div 
//                       key="step0" 
//                       initial={{ opacity: 0, scale: 0.9 }} 
//                       animate={{ opacity: 1, scale: 1 }} 
//                       exit={{ opacity: 0, scale: 0.9 }} 
//                       className="space-y-4 max-w-lg w-full"
//                     >
//                       <span className="px-3 py-1 rounded-full bg-brand-blue/20 text-brand-blue text-xs font-semibold">Stage 1: Formula Synthesis Engine</span>
//                       <h3 className="text-lg font-bold text-white">Watch Split Equations Converge into One</h3>
                      
//                       <div className="grid grid-cols-3 gap-2 my-3">
//                         <motion.div 
//                           animate={{ x: [0, 15, 0], opacity: [0.7, 1, 0.7] }} 
//                           transition={{ repeat: Infinity, duration: 3 }}
//                           className="bg-gray-900 p-3 rounded-xl border border-gray-800 font-mono text-xs text-brand-purple"
//                         >
//                           {"f(x) = ∫ e^(-x) dx"}
//                         </motion.div>
//                         <motion.div 
//                           animate={{ y: [0, -10, 0] }} 
//                           transition={{ repeat: Infinity, duration: 2.5 }}
//                           className="bg-gray-900 p-3 rounded-xl border border-gray-800 font-mono text-xs text-brand-blue"
//                         >
//                           {"T(n) = 2T(n/2) + O(n)"}
//                         </motion.div>
//                         <motion.div 
//                           animate={{ x: [0, -15, 0], opacity: [0.7, 1, 0.7] }} 
//                           transition={{ repeat: Infinity, duration: 3 }}
//                           className="bg-gray-900 p-3 rounded-xl border border-gray-800 font-mono text-xs text-brand-green"
//                         >
//                           {"E = mc² + ΔS"}
//                         </motion.div>
//                       </div>

//                       <div className="bg-gray-900 p-4 rounded-xl border border-brand-blue/40 text-white font-mono text-xs shadow-lg">
//                         <span className="text-gray-400">&gt; Synthesizing unified master equation...</span><br/>
//                         <span className="text-brand-green font-bold text-sm">{"Grand Unified Theorem Ψ(n) = ∑ ∇ · F"}</span>
//                       </div>
//                     </motion.div>
//                   )}

//                   {/* Stage 1: Engineering Drawing & Mechanical Assembly Animation */}
//                   {lessonStep === 1 && (
//                     <motion.div 
//                       key="step1" 
//                       initial={{ opacity: 0, scale: 0.9 }} 
//                       animate={{ opacity: 1, scale: 1 }} 
//                       exit={{ opacity: 0, scale: 0.9 }} 
//                       className="space-y-4 max-w-lg w-full"
//                     >
//                       <span className="px-3 py-1 rounded-full bg-brand-orange/20 text-brand-orange text-xs font-semibold">Stage 2: Engineering Kinematics Assembly</span>
//                       <div className="bg-gray-900 p-5 rounded-2xl border border-orange-500/30 text-white space-y-3 shadow-lg">
//                         <div className="flex items-center justify-between text-xs font-mono text-brand-orange">
//                           <span className="flex items-center gap-1.5"><Cpu className="w-4 h-4" /> Mechanical Gear Assembly</span>
//                           <span>Stress Analysis: Optimal</span>
//                         </div>
//                         <div className="flex justify-center items-center gap-3 py-2">
//                           <motion.div 
//                             animate={{ rotate: 360 }} 
//                             transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
//                             className="w-14 h-14 rounded-full border-2 border-dashed border-brand-blue flex items-center justify-center font-mono text-[10px]"
//                           >
//                             Gear A
//                           </motion.div>
//                           <motion.div 
//                             animate={{ width: ["20px", "50px", "20px"] }} 
//                             transition={{ repeat: Infinity, duration: 2 }}
//                             className="h-1 bg-brand-orange rounded-full"
//                           ></motion.div>
//                           <motion.div 
//                             animate={{ rotate: -360 }} 
//                             transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
//                             className="w-14 h-14 rounded-full border-2 border-dashed border-brand-green flex items-center justify-center font-mono text-[10px]"
//                           >
//                             Gear B
//                           </motion.div>
//                         </div>
//                         <p className="text-xs text-gray-300 font-mono">
//                           &gt; Torque ratio calculated: <span className="text-brand-green">1:2.45</span> with live stress mapping vectors.
//                         </p>
//                       </div>
//                     </motion.div>
//                   )}

//                   {/* Stage 2: Medical Anatomy & Physiological Labeling */}
//                   {lessonStep === 2 && (
//                     <motion.div 
//                       key="step2" 
//                       initial={{ opacity: 0, scale: 0.9 }} 
//                       animate={{ opacity: 1, scale: 1 }} 
//                       exit={{ opacity: 0, scale: 0.9 }} 
//                       className="space-y-3 max-w-lg w-full"
//                     >
//                       <span className="px-3 py-1 rounded-full bg-brand-purple/20 text-brand-purple text-xs font-semibold">Stage 3: Medical Anatomy & Labeling Engine</span>
//                       <div className="bg-gray-900 p-4 rounded-xl border border-purple-500/30 text-left space-y-3">
//                         <div className="flex items-center justify-between text-xs font-mono text-brand-purple">
//                           <span className="flex items-center gap-1.5"><Activity className="w-4 h-4" /> Cardiovascular Neural Circuit</span>
//                           <span>Auto-Labeling Active</span>
//                         </div>
//                         <div className="grid grid-cols-2 gap-2 text-xs font-mono">
//                           <motion.div 
//                             initial={{ x: -10, opacity: 0 }} 
//                             animate={{ x: 0, opacity: 1 }} 
//                             className="p-2.5 rounded-lg bg-gray-950 border border-gray-800 text-gray-300"
//                           >
//                             <span className="text-brand-blue font-bold">1. Sinoatrial Node</span><br/>
//                             <span className="text-[10px] text-gray-500">Pacemaker depolarization</span>
//                           </motion.div>
//                           <motion.div 
//                             initial={{ x: 10, opacity: 0 }} 
//                             animate={{ x: 0, opacity: 1 }} 
//                             className="p-2.5 rounded-lg bg-gray-950 border border-gray-800 text-gray-300"
//                           >
//                             <span className="text-brand-green font-bold">2. Purkinje Fibers</span><br/>
//                             <span className="text-[10px] text-gray-500">Ventricle contraction trigger</span>
//                           </motion.div>
//                         </div>
//                       </div>
//                     </motion.div>
//                   )}

//                   {/* Stage 3: Live Video / Audio Call Mode Active */}
//                   {lessonStep === 3 && (
//                     <motion.div 
//                       key="step3" 
//                       initial={{ opacity: 0, scale: 0.9 }} 
//                       animate={{ opacity: 1, scale: 1 }} 
//                       exit={{ opacity: 0, scale: 0.9 }} 
//                       className="space-y-4 max-w-md"
//                     >
//                       <span className="px-3 py-1 rounded-full bg-brand-green/20 text-brand-green text-xs font-semibold">Stage 4: Live Call Q&A Studio</span>
//                       <div className="bg-gray-900 p-4 rounded-2xl border border-brand-green/30 text-center space-y-2">
//                         <div className="w-12 h-12 rounded-full bg-brand-green/20 text-brand-green mx-auto flex items-center justify-center animate-bounce">
//                           {callMode === "video" ? <Video className="w-6 h-6" /> : <PhoneCall className="w-6 h-6" />}
//                         </div>
//                         <h4 className="text-sm font-bold text-white">Dr. Gleam is listening in {callMode === "video" ? "Video" : "Audio"} mode</h4>
//                         <p className="text-xs text-gray-400">Speak or type your question below for instant AI synthesis and whiteboard illustration.</p>
//                       </div>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>

//                 {/* AI Spoken Audio Subtitle Bar */}
//                 <div className="absolute bottom-3 left-4 right-4 bg-gray-900/95 backdrop-blur-md px-4 py-2 rounded-xl border border-gray-800 text-center shadow-lg">
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
//                     className="w-10 h-10 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white flex items-center justify-center shadow-md transition-all flex-shrink-0 cursor-pointer"
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
//                       onChange={(e) => handleProgressChange(Number(e.target.value))}
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
//                     <button onClick={() => handleProgressChange(0)} className="hover:text-white flex items-center gap-1 cursor-pointer">
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
//                 <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
//                   {chatLog.map((msg, idx) => (
//                     <div
//                       key={idx}
//                       className={`p-3 rounded-xl text-xs leading-relaxed ${
//                         msg.sender === "user"
//                           ? "bg-brand-blue/25 text-blue-200 border border-brand-blue/30 ml-4"
//                           : "bg-gray-900 text-gray-300 border border-gray-800 mr-4"
//                       }`}
//                     >
//                       <div className="flex items-center gap-1.5 font-bold mb-1 text-[10px] text-gray-400">
//                         {msg.sender === "ai" ? (
//                           <Bot className="w-3 h-3 text-brand-green" />
//                         ) : (
//                           <span className="w-3 h-3 rounded bg-brand-blue text-white flex items-center justify-center text-[8px]">ST</span>
//                         )}
//                         <span>{msg.sender === "ai" ? "Dr. Gleam (AI)" : `${msg.name || "Student"}`}</span>
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
//                     placeholder="Ask Dr. Gleam a question or request a diagram..."
//                     className="flex-1 px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue"
//                   />
//                   <button
//                     type="submit"
//                     className="px-4 py-2.5 rounded-xl bg-brand-green hover:bg-brand-green/90 text-white font-bold text-xs flex items-center justify-center shadow-lg shadow-brand-green/20 cursor-pointer"
//                   >
//                     <ArrowRight className="w-4 h-4" />
//                   </button>
//                 </div>
//                 <p className="text-[10px] text-gray-500 mt-2 text-center">AI responds instantly with animations, formulas, or voice synthesis.</p>
//               </form>

//             </div>

//           </div>

//         </div>

//       </div>
//     </section>
//   );
// }


"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, Play, Pause, RotateCcw, ArrowRight, 
  MessageSquare, Video, Mic, PhoneCall, Cpu, Activity, Atom, Code
} from "lucide-react";

interface ChatMessage {
  sender: "ai" | "user";
  text: string;
  name?: string;
  category?: string;
}

/**
 * AIClassroomTutorSection Component
 * 
 * Showcase section for gleamLearn's virtual AI classroom feature with ultra-fast
 * 10-second multi-disciplinary course transitions (CS, Engineering, Medicine, Physics) and live Q&A.
 */
export default function AIClassroomTutorSection() {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0);
  const [lessonStep, setLessonStep] = useState<number>(0);
  const [studentQuestion, setStudentQuestion] = useState<string>("");
  const [callMode, setCallMode] = useState<"video" | "audio">("video");
  
  // Ref strictly for the inner chat container box, preventing window jumps
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);

  // Multi-disciplinary lesson stages
  const lessonStages = [
    {
      title: "Stage 1: Computer Science & Algorithm Complexity",
      discipline: "Software Engineering",
      icon: Code,
      accentColor: "text-brand-blue",
      bgColor: "bg-brand-blue/20",
      aiSpeech: "Let's analyze asymptotic runtime bounds via Master Theorem.",
    },
    {
      title: "Stage 2: Robotics & Mechatronics Kinematics",
      discipline: "Mechanical Engineering",
      icon: Cpu,
      accentColor: "text-brand-orange",
      bgColor: "bg-brand-orange/20",
      aiSpeech: "Mapping robotic arm torque vectors and thermal dissipation limits.",
    },
    {
      title: "Stage 3: Medical Physiology & Cardiac Circuits",
      discipline: "Health Sciences",
      icon: Activity,
      accentColor: "text-brand-purple",
      bgColor: "bg-brand-purple/20",
      aiSpeech: "Tracking depolarization pathways from SA node to Purkinje fibers.",
    },
    {
      title: "Stage 4: Quantum Physics & Wavefunction Superposition",
      discipline: "Advanced Physics",
      icon: Atom,
      accentColor: "text-brand-green",
      bgColor: "bg-brand-green/20",
      aiSpeech: "Solving the Schrödinger wave equation for probability fields.",
    }
  ];

  // Dynamic transcripts corresponding to each discipline stage
  const stageTranscripts: Record<number, ChatMessage[]> = {
    0: [
      { sender: "ai", text: "Dr. Gleam: Welcome to CS401. How do we optimize recursive tree traversals from O(n²) to O(n log n)?", category: "Computer Science" },
      { sender: "user", text: "Can we use memoization or dynamic programming tables?", name: "Alex (CS Major)" },
      { sender: "ai", text: "Dr. Gleam: Exactly! Memoization caches sub-problem states instantly.", category: "Computer Science" }
    ],
    1: [
      { sender: "ai", text: "Dr. Gleam: Moving to Mechatronics. What happens when torque load exceeds motor threshold?", category: "Engineering" },
      { sender: "user", text: "Does back-EMF spike and cause thermal overload?", name: "Sarah (Robotics)" },
      { sender: "ai", text: "Dr. Gleam: Spot on. Stress vector simulation verified.", category: "Engineering" }
    ],
    2: [
      { sender: "ai", text: "Dr. Gleam: Medical Physiology active. How does vagus nerve stimulation impact heart rate?", category: "Medical" },
      { sender: "user", text: "It triggers parasympathetic response, lowering SA node firing frequency.", name: "David (Med Student)" },
      { sender: "ai", text: "Dr. Gleam: Correct. Notice the neural pulse sequence.", category: "Medical" }
    ],
    3: [
      { sender: "ai", text: "Dr. Gleam: Quantum Physics module. What signifies particle localization?", category: "Physics" },
      { sender: "user", text: "Wavefunction collapse upon observation.", name: "Elena (Physics)" },
      { sender: "ai", text: "Dr. Gleam: Brilliant! Probability density updated.", category: "Physics" }
    ]
  };

  const [chatLog, setChatLog] = useState<ChatMessage[]>(stageTranscripts[0]);

  // Keep chat scrolls contained strictly inside the chat box without scrolling the page window
  useEffect(() => {
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTop = chatScrollContainerRef.current.scrollHeight;
    }
  }, [chatLog]);

  // 10-second fast-paced simulation ticker (100ms interval for 100 steps)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackProgress((prev) => {
          const next = prev >= 100 ? 0 : prev + 1;
          
          let currentStep = 0;
          if (next <= 25) currentStep = 0;
          else if (next <= 50) currentStep = 1;
          else if (next <= 75) currentStep = 2;
          else currentStep = 3;

          if (currentStep !== lessonStep) {
            setLessonStep(currentStep);
            setChatLog(stageTranscripts[currentStep]);
          }

          return next;
        });
      }, 100); // 100ms * 100 steps = exactly 10 seconds per full loop!
    }
    return () => clearInterval(interval);
  }, [isPlaying, lessonStep]);

  const handleProgressChange = (val: number) => {
    setPlaybackProgress(val);
    let newStep = 0;
    if (val <= 25) newStep = 0;
    else if (val <= 50) newStep = 1;
    else if (val <= 75) newStep = 2;
    else newStep = 3;

    setLessonStep(newStep);
    setChatLog(stageTranscripts[newStep]);
  };

  const handleAskAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentQuestion.trim()) return;

    const newQuestion = studentQuestion;
    setStudentQuestion("");
    setChatLog((prev) => [...prev, { sender: "user", text: newQuestion, name: "You" }]);

    setTimeout(() => {
      setChatLog((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `Dr. Gleam AI: Great question regarding "${newQuestion}". Custom solution indexed and mapped onto the whiteboard.`
        }
      ]);
    }, 600);
  };

  const ActiveStageIcon = lessonStages[lessonStep].icon;

  return (
    <section id="tutor" className="py-24 bg-gray-50 dark:bg-dark-bg relative border-t border-gray-200 dark:border-dark-border transition-colors duration-300">
      {/* Background radial ambient glow */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[350px] bg-brand-blue/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/30 text-brand-blue text-xs font-semibold mb-4 shadow-sm">
            <Video className="w-3.5 h-3.5" />
            <span>10-Second Multi-Disciplinary AI Classroom</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
            Rapid Course Transitions: CS, Engineering, Medicine, & Physics
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">
            Experience lightning-fast 10-second rotations as Dr. Gleam dynamically shifts subjects, whiteboards, and transcripts in real time.
          </p>
        </div>

        {/* Main Virtual Classroom Player Container */}
        <div className="bg-gray-900 dark:bg-[#0b0f19] rounded-3xl border border-gray-800 shadow-2xl overflow-hidden max-w-6xl mx-auto relative">
          
          {/* Top Video Player Bar with Call Mode Toggles */}
          <div className="px-6 py-3.5 bg-gray-950/90 border-b border-gray-800 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
              <span className="font-mono text-gray-300 ml-2">gleamLearn_Masterclass // 10s_Cycle.live</span>
            </div>

            {/* Virtual Call Mode Selector */}
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={() => setCallMode("video")}
                aria-label="Switch to Video Call mode"
                className={`px-3 py-1 rounded-lg flex items-center gap-1.5 font-medium transition-all cursor-pointer ${
                  callMode === "video" 
                    ? "bg-brand-blue text-white shadow-md shadow-brand-blue/30" 
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                <Video className="w-3.5 h-3.5" /> Video Call
              </button>
              <button 
                type="button"
                onClick={() => setCallMode("audio")}
                aria-label="Switch to Audio Call mode"
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
                    <p className="text-xs text-gray-400">Field: <strong className={lessonStages[lessonStep].accentColor}>{lessonStages[lessonStep].discipline}</strong></p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg ${lessonStages[lessonStep].bgColor} ${lessonStages[lessonStep].accentColor} font-mono text-[11px] font-bold flex items-center gap-1.5`}>
                    <ActiveStageIcon className="w-3.5 h-3.5 animate-spin" /> {lessonStages[lessonStep].discipline} Live
                  </span>
                </div>
              </div>

              {/* Dynamic Animated Whiteboard Canvas Area */}
              <div className="bg-gray-950/90 rounded-2xl p-6 sm:p-8 border border-gray-800 relative overflow-hidden my-4 min-h-[300px] flex flex-col justify-center items-center text-center shadow-inner">
                <div className="absolute inset-0 bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:20px_20px] opacity-25 pointer-events-none" />

                {/* Simulated Audio Visualizer Ring when in Audio Call mode */}
                {callMode === "audio" && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <div className="w-64 h-64 rounded-full border border-brand-green animate-ping" />
                    <div className="absolute w-48 h-48 rounded-full border border-brand-blue animate-pulse" />
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {lessonStep === 0 && (
                    <motion.div 
                      key="step0" 
                      initial={{ opacity: 0, scale: 0.9 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      exit={{ opacity: 0, scale: 0.9 }} 
                      className="space-y-4 max-w-lg w-full"
                    >
                      <span className="px-3 py-1 rounded-full bg-brand-blue/20 text-brand-blue text-xs font-semibold">Computer Science: Master Theorem</span>
                      <h3 className="text-lg font-bold text-white">Algorithm Complexity & Recurrence</h3>
                      <div className="bg-gray-900 p-4 rounded-xl border border-brand-blue/40 text-white font-mono text-xs shadow-lg space-y-2 text-left">
                        <p className="text-gray-400">&gt; Analyzing divide-and-conquer runtime:</p>
                        <p className="text-brand-blue font-bold text-sm">T(n) = aT(n/b) + f(n)</p>
                        <p className="text-brand-green text-[11px]">Result: Optimal asymptotic bound $\Theta(n \log n)$</p>
                      </div>
                    </motion.div>
                  )}

                  {lessonStep === 1 && (
                    <motion.div 
                      key="step1" 
                      initial={{ opacity: 0, scale: 0.9 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      exit={{ opacity: 0, scale: 0.9 }} 
                      className="space-y-4 max-w-lg w-full"
                    >
                      <span className="px-3 py-1 rounded-full bg-brand-orange/20 text-brand-orange text-xs font-semibold">Mechanical Engineering: Kinematics</span>
                      <div className="bg-gray-900 p-5 rounded-2xl border border-orange-500/30 text-white space-y-3 shadow-lg">
                        <div className="flex items-center justify-between text-xs font-mono text-brand-orange">
                          <span className="flex items-center gap-1.5"><Cpu className="w-4 h-4" /> Robotic Arm Joint Torque</span>
                          <span>Stress: Nominal</span>
                        </div>
                        <div className="flex justify-center items-center gap-3 py-2">
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="w-12 h-12 rounded-full border-2 border-dashed border-brand-orange flex items-center justify-center font-mono text-[10px]">Joint 1</motion.div>
                          <div className="h-1 w-12 bg-brand-blue rounded-full" />
                          <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="w-12 h-12 rounded-full border-2 border-dashed border-brand-blue flex items-center justify-center font-mono text-[10px]">Joint 2</motion.div>
                        </div>
                        <p className="text-xs text-gray-300 font-mono">&gt; Kinematic feedback loop verified.</p>
                      </div>
                    </motion.div>
                  )}

                  {lessonStep === 2 && (
                    <motion.div 
                      key="step2" 
                      initial={{ opacity: 0, scale: 0.9 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      exit={{ opacity: 0, scale: 0.9 }} 
                      className="space-y-3 max-w-lg w-full"
                    >
                      <span className="px-3 py-1 rounded-full bg-brand-purple/20 text-brand-purple text-xs font-semibold">Medical Sciences: Electrophysiology</span>
                      <div className="bg-gray-900 p-4 rounded-xl border border-purple-500/30 text-left space-y-3">
                        <div className="flex items-center justify-between text-xs font-mono text-brand-purple">
                          <span className="flex items-center gap-1.5"><Activity className="w-4 h-4" /> Cardiac Conduction System</span>
                          <span>Live EKG Trace</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                          <div className="p-2.5 rounded-lg bg-gray-950 border border-gray-800 text-gray-300">
                            <span className="text-brand-purple font-bold">Sinoatrial Node</span><br/>
                            <span className="text-[10px] text-gray-500">Action potential triggered</span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-gray-950 border border-gray-800 text-gray-300">
                            <span className="text-brand-blue font-bold">Purkinje Network</span><br/>
                            <span className="text-[10px] text-gray-500">Ventricle depolarization</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {lessonStep === 3 && (
                    <motion.div 
                      key="step3" 
                      initial={{ opacity: 0, scale: 0.9 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      exit={{ opacity: 0, scale: 0.9 }} 
                      className="space-y-4 max-w-md w-full"
                    >
                      <span className="px-3 py-1 rounded-full bg-brand-green/20 text-brand-green text-xs font-semibold">Advanced Physics: Quantum States</span>
                      <div className="bg-gray-900 p-4 rounded-2xl border border-brand-green/30 text-center space-y-2">
                        <div className="w-12 h-12 rounded-full bg-brand-green/20 text-brand-green mx-auto flex items-center justify-center animate-pulse">
                          <Atom className="w-6 h-6 animate-spin" />
                        </div>
                        <h4 className="text-sm font-bold text-white">Schrödinger Wavefunction Field</h4>
                        <p className="text-xs text-gray-400 font-mono text-brand-green">{"iℏ (∂/∂t)|ψ⟩ = Ĥ|ψ⟩"}</p>
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
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    aria-label={isPlaying ? "Pause lesson" : "Play lesson"}
                    className="w-10 h-10 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white flex items-center justify-center shadow-md transition-all flex-shrink-0 cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>

                  <div className="flex-1 relative flex items-center">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={playbackProgress}
                      aria-label="Lesson playback scrubber"
                      onChange={(e) => handleProgressChange(Number(e.target.value))}
                      className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-brand-blue"
                    />
                  </div>

                  <span className="text-xs font-mono text-gray-400 w-16 text-right">
                    0:{Math.floor((playbackProgress / 100) * 10).toString().padStart(2, '0')} / 0:10
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs text-gray-400 pt-1">
                  <span>Current Subject: <strong className={lessonStages[lessonStep].accentColor}>{lessonStages[lessonStep].title}</strong></span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => handleProgressChange(0)} className="hover:text-white flex items-center gap-1 cursor-pointer">
                      <RotateCcw className="w-3 h-3" /> Restart Loop
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
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Live Course Transcript</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-gray-800 text-brand-green text-[10px] font-mono">10s Sync</span>
                </div>

                {/* Chat Log Container with internal scroll ref only */}
                <div 
                  ref={chatScrollContainerRef}
                  className="space-y-3 max-h-[320px] overflow-y-auto pr-1"
                >
                  {chatLog.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl text-xs leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-brand-blue/25 text-blue-200 border border-brand-blue/30 ml-4"
                          : "bg-gray-900 text-gray-300 border border-gray-800 mr-4"
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold mb-1 text-[10px] text-gray-400">
                        <span className="flex items-center gap-1.5">
                          {msg.sender === "ai" ? <Bot className="w-3 h-3 text-brand-green" /> : <span className="w-3 h-3 rounded bg-brand-blue text-white flex items-center justify-center text-[8px]">ST</span>}
                          {msg.sender === "ai" ? "Dr. Gleam" : msg.name}
                        </span>
                        {msg.category && <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800 text-brand-blue font-mono">{msg.category}</span>}
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
                    placeholder="Ask a question across CS, Engineering, Med..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue"
                  />
                  <button
                    type="submit"
                    aria-label="Send question to AI tutor"
                    className="px-4 py-2.5 rounded-xl bg-brand-green hover:bg-brand-green/90 text-white font-bold text-xs flex items-center justify-center shadow-lg shadow-brand-green/20 cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10px] text-gray-500 mt-2 text-center">Dr. Gleam adapts instantly to any course topic you query.</p>
              </form>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}