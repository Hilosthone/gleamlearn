// //src/components/UploadPipeline.tsx
// "use client";

// import React, { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { UploadCloud, FileText, Cpu, Database, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

// export default function UploadPipeline() {
//   const [selectedStep, setSelectedStep] = useState(0);

//   const pipelineSteps = [
//     {
//       title: "1. Document Upload",
//       icon: UploadCloud,
//       color: "text-brand-blue",
//       bgColor: "bg-brand-blue/15",
//       borderColor: "border-brand-blue/30",
//       description: "Students upload lecture slides, PDF textbooks, scanned notes, or DOCX files effortlessly.",
//       detail: "Supports PDF, DOC/DOCX, TXT, PPT/PPTX, and Images with automatic validation."
//     },
//     {
//       title: "2. Text Extraction & OCR",
//       icon: FileText,
//       color: "text-brand-purple",
//       bgColor: "bg-brand-purple/15",
//       borderColor: "border-brand-purple/30",
//       description: "gleamLearn extracts text and runs OCR on handwritten or scanned educational notes.",
//       detail: "Clean layout parsing separates headers, formulas, diagrams, and body paragraphs."
//     },
//     {
//       title: "3. RAG Knowledge Indexing",
//       icon: Database,
//       color: "text-brand-orange",
//       bgColor: "bg-brand-orange/15",
//       borderColor: "border-brand-orange/30",
//       description: "Documents are chunked and vectorized, creating a personalized academic knowledge base.",
//       detail: "Retrieval-Augmented Generation (RAG) ensures zero hallucinations and exact source grounding."
//     },
//     {
//       title: "4. AI Content Generation",
//       icon: Sparkles,
//       color: "text-brand-green",
//       bgColor: "bg-brand-green/15",
//       borderColor: "border-brand-green/30",
//       description: "Instantly transforms raw notes into structured modules, summaries, quizzes, and flashcards.",
//       detail: "Generates Quick Notes, Standard Notes, Exam Notes, and custom practice questions."
//     }
//   ];

//   return (
//     <section id="pipeline" className="py-24 bg-white dark:bg-dark-bg relative overflow-hidden border-t border-gray-200 dark:border-dark-border transition-colors duration-300">
//       {/* Background radial glow */}
//       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-brand-purple/10 rounded-full blur-[150px] pointer-events-none"></div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
//         {/* Section Header */}
//         <motion.div 
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.5 }}
//           className="text-center max-w-3xl mx-auto mb-16"
//         >
//           <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/30 text-brand-blue text-xs font-semibold mb-4">
//             <Cpu className="w-3.5 h-3.5" />
//             <span>The Magic Engine</span>
//           </div>
//           <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
//             From Raw PDF to Structured Mastery in Seconds
//           </h2>
//           <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">
//             No more tedious summarization. Watch how gleamLearn turns heavy course materials into your personal interactive syllabus.
//           </p>
//         </motion.div>

//         {/* Pipeline Grid & Interactive Preview */}
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
//           {/* Left: Interactive Step Selectors */}
//           <div className="lg:col-span-6 space-y-4">
//             {pipelineSteps.map((step, index) => {
//               const IconComponent = step.icon;
//               const isSelected = selectedStep === index;
//               return (
//                 <motion.div
//                   key={index}
//                   onClick={() => setSelectedStep(index)}
//                   initial={{ opacity: 0, x: -20 }}
//                   whileInView={{ opacity: 1, x: 0 }}
//                   viewport={{ once: true }}
//                   transition={{ duration: 0.4, delay: index * 0.1 }}
//                   whileHover={{ scale: 1.01 }}
//                   whileTap={{ scale: 0.99 }}
//                   className={`p-5 rounded-2xl cursor-pointer transition-all border ${
//                     isSelected
//                       ? "bg-white dark:bg-dark-card/90 border-brand-blue shadow-xl shadow-brand-blue/10 ring-2 ring-brand-blue/20"
//                       : "bg-gray-50/80 dark:bg-dark-card/40 border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-700"
//                   }`}
//                 >
//                   <div className="flex items-start gap-4">
//                     <div className={`w-12 h-12 rounded-xl ${step.bgColor} ${step.color} border ${step.borderColor} flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${isSelected ? "scale-110" : ""}`}>
//                       <IconComponent className="w-6 h-6" />
//                     </div>
//                     <div className="flex-1">
//                       <div className="flex items-center justify-between mb-1">
//                         <h3 className="text-base font-bold text-gray-900 dark:text-white">{step.title}</h3>
//                         {isSelected && (
//                           <motion.span 
//                             initial={{ scale: 0 }}
//                             animate={{ scale: 1 }}
//                             className="text-xs text-brand-blue font-semibold flex items-center gap-1"
//                           >
//                             Active <CheckCircle2 className="w-3.5 h-3.5" />
//                           </motion.span>
//                         )}
//                       </div>
//                       <p className="text-sm text-gray-600 dark:text-gray-300 font-normal mb-2">{step.description}</p>
                      
//                       {/* Fixed height animation container preventing TypeScript/Framer Motion type mismatches */}
//                       <AnimatePresence>
//                         {isSelected && (
//                           <motion.div
//                             initial={{ opacity: 0, height: 0 }}
//                             animate={{ opacity: 1, height: "auto" }}
//                             exit={{ opacity: 0, height: 0 }}
//                             transition={{ duration: 0.25 }}
//                             style={{ overflow: "hidden" }}
//                           >
//                             <p className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-dark-border/60">
//                               {step.detail}
//                             </p>
//                           </motion.div>
//                         )}
//                       </AnimatePresence>
//                     </div>
//                   </div>
//                 </motion.div>
//               );
//             })}
//           </div>

//           {/* Right: Visual Step Simulation Showcase */}
//           <div className="lg:col-span-6">
//             <motion.div 
//               initial={{ opacity: 0, scale: 0.95 }}
//               whileInView={{ opacity: 1, scale: 1 }}
//               viewport={{ once: true }}
//               transition={{ duration: 0.5 }}
//               className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-dark-border shadow-2xl relative overflow-hidden"
//             >
//               <div className="absolute top-0 right-0 w-40 h-40 bg-brand-blue/10 rounded-full blur-2xl pointer-events-none"></div>

//               <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-dark-border mb-6">
//                 <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pipeline Stage 0{selectedStep + 1}</span>
//                 <span className="px-3 py-1 rounded-full bg-brand-green/20 text-brand-green text-xs font-semibold animate-pulse">Automated</span>
//               </div>

//               <AnimatePresence mode="wait">
//                 {selectedStep === 0 && (
//                   <motion.div 
//                     key="step0"
//                     initial={{ opacity: 0, y: 10 }} 
//                     animate={{ opacity: 1, y: 0 }} 
//                     exit={{ opacity: 0, y: -10 }}
//                     transition={{ duration: 0.3 }}
//                     className="space-y-4"
//                   >
//                     <div className="border-2 border-dashed border-gray-300 dark:border-dark-border rounded-2xl p-8 text-center bg-gray-50 dark:bg-dark-bg/50">
//                       <UploadCloud className="w-12 h-12 text-brand-blue mx-auto mb-3 animate-bounce" />
//                       <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">Drop your lecture file here</p>
//                       <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Supports PDF, DOCX, PPTX, or Scanned Images</p>
//                       <span className="px-4 py-2 rounded-xl bg-brand-blue text-white text-xs font-semibold shadow-md shadow-brand-blue/20 inline-block">Browse Files</span>
//                     </div>
//                     <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
//                       <span>File: <strong className="text-gray-800 dark:text-gray-200">CSC202_Algorithms.pdf</strong></span>
//                       <span>Size: 4.2 MB</span>
//                     </div>
//                   </motion.div>
//                 )}

//                 {selectedStep === 1 && (
//                   <motion.div 
//                     key="step1"
//                     initial={{ opacity: 0, y: 10 }} 
//                     animate={{ opacity: 1, y: 0 }} 
//                     exit={{ opacity: 0, y: -10 }}
//                     transition={{ duration: 0.3 }}
//                     className="space-y-3 font-mono text-xs bg-gray-900 text-gray-100 p-4 rounded-xl border border-gray-800 shadow-inner"
//                   >
//                     <div className="text-brand-purple font-bold"># OCR & Parsing Engine Output</div>
//                     <p className="text-gray-400">&gt; Scanning page 1 to 45...</p>
//                     <p className="text-gray-300">&gt; Detected headers: &quot;Chapter 2: Sorting and Searching&quot;</p>
//                     <p className="text-emerald-400">&gt; Extracted 14,230 words, 8 formulas, 3 charts successfully.</p>
//                     <div className="p-3 bg-gray-950 rounded-lg border border-gray-800 text-gray-300 mt-2">
//                       &quot;Merge Sort is an efficient, comparison-based, divide and conquer sorting algorithm...&quot;
//                     </div>
//                   </motion.div>
//                 )}

//                 {selectedStep === 2 && (
//                   <motion.div 
//                     key="step2"
//                     initial={{ opacity: 0, y: 10 }} 
//                     animate={{ opacity: 1, y: 0 }} 
//                     exit={{ opacity: 0, y: -10 }}
//                     transition={{ duration: 0.3 }}
//                     className="space-y-3 text-xs"
//                   >
//                     <div className="p-3 rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border flex items-center justify-between">
//                       <span className="text-gray-700 dark:text-gray-300">Vector Embeddings Model</span>
//                       <span className="text-brand-orange font-bold">OpenAI / Local RAG</span>
//                     </div>
//                     <div className="p-3 rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border flex items-center justify-between">
//                       <span className="text-gray-700 dark:text-gray-300">Vector Database Indexing</span>
//                       <span className="text-brand-green font-bold">Complete (512 Chunks)</span>
//                     </div>
//                     <div className="p-3 rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border flex items-center justify-between">
//                       <span className="text-gray-700 dark:text-gray-300">Source Grounding Accuracy</span>
//                       <span className="text-brand-blue font-bold">99.8% Precision</span>
//                     </div>
//                   </motion.div>
//                 )}

//                 {selectedStep === 3 && (
//                   <motion.div 
//                     key="step3"
//                     initial={{ opacity: 0, y: 10 }} 
//                     animate={{ opacity: 1, y: 0 }} 
//                     exit={{ opacity: 0, y: -10 }}
//                     transition={{ duration: 0.3 }}
//                     className="space-y-3 text-xs"
//                   >
//                     <p className="text-gray-900 dark:text-white font-bold mb-2">Generated Syllabus & Materials:</p>
//                     <div className="grid grid-cols-2 gap-2">
//                       <div className="p-3 rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border flex items-center gap-2">
//                         <span className="w-2 h-2 rounded-full bg-brand-blue"></span>
//                         <span className="text-gray-700 dark:text-gray-300">5 Structured Topics</span>
//                       </div>
//                       <div className="p-3 rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border flex items-center gap-2">
//                         <span className="w-2 h-2 rounded-full bg-brand-purple"></span>
//                         <span className="text-gray-700 dark:text-gray-300">24 Flashcards</span>
//                       </div>
//                       <div className="p-3 rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border flex items-center gap-2">
//                         <span className="w-2 h-2 rounded-full bg-brand-green"></span>
//                         <span className="text-gray-700 dark:text-gray-300">10 Practice Quizzes</span>
//                       </div>
//                       <div className="p-3 rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border flex items-center gap-2">
//                         <span className="w-2 h-2 rounded-full bg-brand-orange"></span>
//                         <span className="text-gray-700 dark:text-gray-300">Exam Revision Notes</span>
//                       </div>
//                     </div>
//                   </motion.div>
//                 )}
//               </AnimatePresence>

//               <div className="mt-6 pt-4 border-t border-gray-200 dark:border-dark-border flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
//                 <span>Step {selectedStep + 1} of 4</span>
//                 <button 
//                   onClick={() => setSelectedStep((prev) => (prev + 1) % 4)}
//                   className="text-brand-blue hover:text-brand-blue/80 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
//                 >
//                   Next Stage <ArrowRight className="w-3.5 h-3.5" />
//                 </button>
//               </div>

//             </motion.div>
//           </div>

//         </div>

//       </div>
//     </section>
//   );
// }



"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, Cpu, Database, Sparkles, CheckCircle2, BookOpen, Atom, Stethoscope, TrendingUp, Compass } from "lucide-react";
import EducationalCanvas3D from "./EducationalCanvas3D";

export default function UploadPipeline() {
  const [selectedStep, setSelectedStep] = useState(0);
  const [currentStreamIndex, setCurrentStreamIndex] = useState(0);

  // Independent autonomous stream text ticker simulating multi-disciplinary teaching
  const academicStreams = [
    { title: "Engineering & Mechanics", icon: Atom, desc: "Transforming CAD blueprints and complex physics notes into interactive modules." },
    { title: "Medical & Health Sciences", icon: Stethoscope, desc: "Turning dense pharmacology lectures and anatomy notes into high-yield flashcards." },
    { title: "Commercial & FinTech", icon: TrendingUp, desc: "Condensing corporate finance reports and market analytics into precise summaries." },
    { title: "Arts & Humanities", icon: Compass, desc: "Synthesizing historical texts and literature essays into structured student guides." }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStreamIndex((prev) => (prev + 1) % academicStreams.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [academicStreams.length]);

  const pipelineSteps = [
    {
      title: "1. Document Upload",
      icon: UploadCloud,
      color: "text-brand-blue",
      bgColor: "bg-brand-blue/15",
      borderColor: "border-brand-blue/30",
      description: "Students upload lecture slides, PDF textbooks, scanned notes, or DOCX files effortlessly.",
      detail: "Supports PDF, DOC/DOCX, TXT, PPT/PPTX, and Images with automatic validation.",
    },
    {
      title: "2. Text Extraction & OCR",
      icon: FileText,
      color: "text-brand-purple",
      bgColor: "bg-brand-purple/15",
      borderColor: "border-brand-purple/30",
      description: "gleamLearn extracts text and runs OCR on handwritten or scanned educational notes.",
      detail: "Clean layout parsing separates headers, formulas, diagrams, and body paragraphs.",
    },
    {
      title: "3. RAG Knowledge Indexing",
      icon: Database,
      color: "text-brand-orange",
      bgColor: "bg-brand-orange/15",
      borderColor: "border-brand-orange/30",
      description: "Documents are chunked and vectorized, creating a personalized academic knowledge base.",
      detail: "Retrieval-Augmented Generation (RAG) ensures zero hallucinations and exact source grounding.",
    },
    {
      title: "4. AI Content Generation",
      icon: Sparkles,
      color: "text-brand-green",
      bgColor: "bg-brand-green/15",
      borderColor: "border-brand-green/30",
      description: "Instantly transforms raw notes into structured modules, summaries, quizzes, and flashcards.",
      detail: "Generates Quick Notes, Standard Notes, Exam Notes, and custom practice questions.",
    }
  ];

  const CurrentStreamIcon = academicStreams[currentStreamIndex].icon;

  return (
    <section id="pipeline" className="py-24 bg-white dark:bg-dark-bg relative overflow-hidden border-t border-gray-200 dark:border-dark-border transition-colors duration-300">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-brand-purple/10 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/30 text-brand-blue text-xs font-semibold mb-4">
            <Cpu className="w-3.5 h-3.5" />
            <span>The Magic Engine</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
            From Raw PDF to Structured Mastery in Seconds
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">
            No more tedious summarization. Watch how gleamLearn turns heavy course materials into your personal interactive syllabus.
          </p>
        </motion.div>

        {/* Pipeline Grid & Autonomous 3D Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Pipeline Interactive Steps */}
          <div className="lg:col-span-6 space-y-4">
            {pipelineSteps.map((step, index) => {
              const IconComponent = step.icon;
              const isSelected = selectedStep === index;
              return (
                <motion.div
                  key={index}
                  onClick={() => setSelectedStep(index)}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`p-5 rounded-2xl cursor-pointer transition-all border ${
                    isSelected
                      ? "bg-white dark:bg-dark-card/90 border-brand-blue shadow-xl shadow-brand-blue/10 ring-2 ring-brand-blue/20"
                      : "bg-gray-50/80 dark:bg-dark-card/40 border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-700"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${step.bgColor} ${step.color} border ${step.borderColor} flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${isSelected ? "scale-110" : ""}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">{step.title}</h3>
                        {isSelected && (
                          <motion.span 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-xs text-brand-blue font-semibold flex items-center gap-1"
                          >
                            Active <CheckCircle2 className="w-3.5 h-3.5" />
                          </motion.span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 font-normal mb-2">{step.description}</p>
                      
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                            style={{ overflow: "hidden" }}
                          >
                            <p className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-dark-border/60">
                              {step.detail}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right: Autonomous Multi-Disciplinary 3D Display Showcase */}
          <div className="lg:col-span-6 sticky top-28">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl rounded-3xl p-1 border border-gray-200 dark:border-dark-border shadow-2xl relative overflow-hidden aspect-[4/3] flex flex-col"
            >
              <EducationalCanvas3D />

              {/* Autonomous Ticker Overlay showing multi-disciplinary simulation in action */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-blue/20 border border-brand-blue/40 flex items-center justify-center flex-shrink-0 text-brand-blue">
                  <CurrentStreamIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand-blue">Live Teaching Stream</p>
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStreamIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="text-sm font-bold text-white truncate">{academicStreams[currentStreamIndex].title}</p>
                      <p className="text-xs text-gray-300 truncate">{academicStreams[currentStreamIndex].desc}</p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>

        </div>

      </div>
    </section>
  );
}