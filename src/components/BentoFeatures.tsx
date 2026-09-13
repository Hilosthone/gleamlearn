// "use client";

// import React from "react";
// import { motion, Easing } from "framer-motion";
// import { Bot, Calendar, Flame, Brain, Layers, ShieldCheck, Sparkles, Trophy } from "lucide-react";

// /**
//  * BentoFeatures Component
//  * * Showcases gleamLearn's core ecosystem and capabilities in a modern Bento Grid layout.
//  * Each card features subtle entrance animations via Framer Motion, hover border glows,
//  * and dual light/dark theme support.
//  */
// export default function BentoFeatures() {
//   // Animation variants with properly typed easing to satisfy Framer Motion's strict Variant types
//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.15,
//       },
//     },
//   };

//   const itemVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: { 
//       opacity: 1, 
//       y: 0, 
//       transition: { 
//         duration: 0.5, 
//         ease: "easeOut" as Easing 
//       } 
//     },
//   };

//   return (
//     <section id="features" className="py-24 bg-gray-50 dark:bg-dark-bg relative transition-colors duration-300 overflow-hidden">
      
//       {/* Background Ambient Glows */}
//       <div className="absolute top-1/2 left-10 w-96 h-96 bg-brand-purple/5 rounded-full blur-3xl pointer-events-none"></div>
//       <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl pointer-events-none"></div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
//         {/* Section Header */}
//         <motion.div 
//           initial={{ opacity: 0, y: -20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.6 }}
//           className="text-center max-w-3xl mx-auto mb-16"
//         >
//           <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-purple/10 border border-brand-purple/30 text-brand-purple text-xs font-semibold mb-4 shadow-sm">
//             <Brain className="w-3.5 h-3.5 animate-pulse" />
//             <span>Comprehensive Ecosystem</span>
//           </div>
//           <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
//             Everything You Need to Ace Your Studies in One App
//           </h2>
//           <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">
//             No more switching between notes apps, past question booklets, and isolated AI chatbots. gleamLearn brings them together.
//           </p>
//         </motion.div>

//         {/* Bento Grid Container with Staggered Motion */}
//         <motion.div 
//           variants={containerVariants}
//           initial="hidden"
//           whileInView="visible"
//           viewport={{ once: true }}
//           className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"
//         >
          
//           {/* Card 1: AI Tutor & Classroom (Span 2) */}
//           <motion.div 
//             variants={itemVariants}
//             whileHover={{ y: -4 }}
//             className="md:col-span-2 bg-white/80 dark:bg-[#111827]/75 backdrop-blur-md rounded-3xl p-8 border border-gray-200/80 dark:border-dark-border relative overflow-hidden flex flex-col justify-between group hover:border-brand-purple/50 transition-all shadow-sm"
//           >
//             <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/10 rounded-full blur-3xl group-hover:bg-brand-purple/20 transition-all pointer-events-none"></div>
//             <div>
//               <motion.div 
//                 whileHover={{ scale: 1.05, rotate: 3 }}
//                 className="w-12 h-12 rounded-2xl bg-brand-purple/15 dark:bg-brand-purple/20 text-brand-purple border border-brand-purple/30 flex items-center justify-center mb-6 shadow-sm"
//               >
//                 <Bot className="w-6 h-6" />
//               </motion.div>
//               <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Multimodal AI Teacher & Companion</h3>
//               <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
//                 Not just a passive chatbot. Your personal AI companion teaches, asks questions, pauses for answers, explains mistakes, and even provides step-by-step diagram drawing guidance for Biology, Physics, and Engineering.
//               </p>
//             </div>
//             <div className="bg-gray-50 dark:bg-dark-bg/80 rounded-2xl p-4 border border-gray-200 dark:border-dark-border text-xs text-gray-700 dark:text-gray-300 flex items-center justify-between">
//               <span className="flex items-center gap-2">
//                 <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></span>
//                 AI Tutor Active: Explaining Photosynthesis
//               </span>
//               <span className="text-brand-purple font-semibold flex items-center gap-1">
//                 <Sparkles className="w-3 h-3" /> Voice & Text
//               </span>
//             </div>
//           </motion.div>

//           {/* Card 2: Spaced Repetition (Span 2) */}
//           <motion.div 
//             variants={itemVariants}
//             whileHover={{ y: -4 }}
//             className="md:col-span-1 lg:col-span-2 bg-white/80 dark:bg-[#111827]/75 backdrop-blur-md rounded-3xl p-8 border border-gray-200/80 dark:border-dark-border relative overflow-hidden flex flex-col justify-between group hover:border-brand-blue/50 transition-all shadow-sm"
//           >
//             <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/10 rounded-full blur-3xl group-hover:bg-brand-blue/20 transition-all pointer-events-none"></div>
//             <div>
//               <motion.div 
//                 whileHover={{ scale: 1.05, rotate: -3 }}
//                 className="w-12 h-12 rounded-2xl bg-brand-blue/15 dark:bg-brand-blue/20 text-brand-blue border border-brand-blue/30 flex items-center justify-center mb-6 shadow-sm"
//               >
//                 <Layers className="w-6 h-6" />
//               </motion.div>
//               <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Adaptive Learning & Spaced Repetition</h3>
//               <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
//                 The platform schedules intelligent revisions on Days 1, 3, 7, 14, and 30 based on your quiz performance, ensuring long-term retention without cramming.
//               </p>
//             </div>
//             <div className="flex items-center justify-between text-xs font-semibold text-brand-blue bg-brand-blue/5 p-3 rounded-xl border border-brand-blue/15">
//               <span>Smart Retention Scheduling</span>
//               <span className="font-mono bg-brand-blue/10 px-2 py-0.5 rounded text-[10px]">Active Algorithm</span>
//             </div>
//           </motion.div>

//           {/* Card 3: Gamification & Streaks (Span 1) */}
//           <motion.div 
//             variants={itemVariants}
//             whileHover={{ y: -4 }}
//             className="md:col-span-1 bg-white/80 dark:bg-[#111827]/75 backdrop-blur-md rounded-3xl p-8 border border-gray-200/80 dark:border-dark-border relative overflow-hidden flex flex-col justify-between group hover:border-brand-orange/50 transition-all shadow-sm"
//           >
//             <div>
//               <motion.div 
//                 whileHover={{ scale: 1.1, rotate: 10 }}
//                 className="w-12 h-12 rounded-2xl bg-brand-orange/15 dark:bg-brand-orange/20 text-brand-orange border border-brand-orange/30 flex items-center justify-center mb-6 shadow-sm"
//               >
//                 <Flame className="w-6 h-6 text-brand-orange animate-bounce" />
//               </motion.div>
//               <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Streaks & XP</h3>
//               <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed mb-4">
//                 Earn XP, coins, and maintain daily streaks with motivational challenges designed to build consistent study habits.
//               </p>
//             </div>
//             <motion.div 
//               whileHover={{ scale: 1.02 }}
//               className="p-3 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-200 dark:border-dark-border text-center shadow-sm flex items-center justify-center gap-2"
//             >
//               <Trophy className="w-4 h-4 text-brand-orange" />
//               <span className="text-sm font-extrabold text-brand-orange">30-Day Streak</span>
//             </motion.div>
//           </motion.div>

//           {/* Card 4: Exam Prep - WAEC, JAMB, BSc (Span 2) */}
//           <motion.div 
//             variants={itemVariants}
//             whileHover={{ y: -4 }}
//             className="md:col-span-2 bg-white/80 dark:bg-[#111827]/75 backdrop-blur-md rounded-3xl p-8 border border-gray-200/80 dark:border-dark-border relative overflow-hidden flex flex-col justify-between group hover:border-brand-green/50 transition-all shadow-sm"
//           >
//             <div>
//               <motion.div 
//                 whileHover={{ scale: 1.05 }}
//                 className="w-12 h-12 rounded-2xl bg-brand-green/15 dark:bg-brand-green/20 text-brand-green border border-brand-green/30 flex items-center justify-center mb-6 shadow-sm"
//               >
//                 <ShieldCheck className="w-6 h-6" />
//               </motion.div>
//               <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Nigerian & International Examination Prep</h3>
//               <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
//                 Custom study plans and exam simulation mode built specifically for WAEC, NECO, JAMB, JUPEB, NABTEB, and University semesters with timed tests and detailed score analytics.
//               </p>
//             </div>
//             <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-400">
//               <span className="px-3 py-1 rounded-lg bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border shadow-sm font-medium">JAMB 300+ Roadmap</span>
//               <span className="px-3 py-1 rounded-lg bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border shadow-sm font-medium">WAEC Distinction</span>
//               <span className="px-3 py-1 rounded-lg bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border shadow-sm font-medium">University BSc Courses</span>
//             </div>
//           </motion.div>

//           {/* Card 5: Personalized Study Planner (Span 1) */}
//           <motion.div 
//             variants={itemVariants}
//             whileHover={{ y: -4 }}
//             className="md:col-span-1 bg-white/80 dark:bg-[#111827]/75 backdrop-blur-md rounded-3xl p-8 border border-gray-200/80 dark:border-dark-border relative overflow-hidden flex flex-col justify-between group hover:border-brand-blue/50 transition-all shadow-sm"
//           >
//             <div>
//               <motion.div 
//                 whileHover={{ scale: 1.05, rotate: -5 }}
//                 className="w-12 h-12 rounded-2xl bg-brand-blue/15 dark:bg-brand-blue/20 text-brand-blue border border-brand-blue/30 flex items-center justify-center mb-6 shadow-sm"
//               >
//                 <Calendar className="w-6 h-6" />
//               </motion.div>
//               <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Smart Timetable</h3>
//               <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed mb-4">
//                 Missed a study session? The AI planner automatically rebalances your schedule without stress.
//               </p>
//             </div>
//             <div className="flex items-center gap-1.5 text-xs text-brand-blue font-semibold bg-brand-blue/5 p-2.5 rounded-xl border border-brand-blue/15 text-center justify-center">
//               <span>Dynamic Rebalancing</span>
//             </div>
//           </motion.div>

//         </motion.div>

//       </div>
//     </section>
//   );
// }


"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, Easing } from "framer-motion";
import { Bot, Calendar, Flame, Brain, Layers, ShieldCheck, Sparkles, Trophy, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * BentoFeatures Component
 * Fully functional carousel featuring automatic card-by-card sliding every 1 second,
 * touch/mouse manual dragging, pause on hover/touch, and manual arrow buttons.
 */
export default function BentoFeatures() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const bentoCards = [
    {
      id: 1,
      title: "Multimodal AI Teacher & Companion",
      desc: "Not just a passive chatbot. Your personal AI companion teaches, asks questions, pauses for answers, explains mistakes, and provides step-by-step diagram guidance for Biology, Physics, and Engineering.",
      icon: <Bot className="w-6 h-6" />,
      color: "brand-purple",
      badge: "AI Tutor Active: Explaining Photosynthesis",
      subBadge: "Voice & Text",
      wide: true,
      footerType: "active"
    },
    {
      id: 2,
      title: "Adaptive Learning & Spaced Repetition",
      desc: "The platform schedules intelligent revisions on Days 1, 3, 7, 14, and 30 based on your quiz performance, ensuring long-term retention without cramming.",
      icon: <Layers className="w-6 h-6" />,
      color: "brand-blue",
      badge: "Smart Retention Scheduling",
      subBadge: "Active Algorithm",
      wide: true,
      footerType: "retention"
    },
    {
      id: 3,
      title: "Streaks & XP",
      desc: "Earn XP, coins, and maintain daily streaks with motivational challenges designed to build consistent study habits.",
      icon: <Flame className="w-6 h-6 text-brand-orange animate-bounce" />,
      color: "brand-orange",
      badge: "30-Day Streak",
      wide: false,
      footerType: "streak"
    },
    {
      id: 4,
      title: "Nigerian & International Examination Prep",
      desc: "Custom study plans and exam simulation mode built specifically for WAEC, NECO, JAMB, JUPEB, NABTEB, and University semesters with timed tests and detailed score analytics.",
      icon: <ShieldCheck className="w-6 h-6" />,
      color: "brand-green",
      tags: ["JAMB 300+ Roadmap", "WAEC Distinction", "University BSc Courses"],
      wide: true,
      footerType: "tags"
    },
    {
      id: 5,
      title: "Smart Timetable",
      desc: "Missed a study session? The AI planner automatically rebalances your schedule without stress.",
      icon: <Calendar className="w-6 h-6" />,
      color: "brand-blue",
      badge: "Dynamic Rebalancing",
      wide: false,
      footerType: "calendar"
    }
  ];

  // Tripled dataset for infinite loop effect
  const duplicatedCards = [...bentoCards, ...bentoCards, ...bentoCards];

  // Auto-advance card-by-card every 1 second
  useEffect(() => {
    if (isPaused) return;

    const intervalId = setInterval(() => {
      const container = scrollRef.current;
      if (!container) return;

      const cardWidth = 360 + 24; // Average card width + gap
      
      // If near the end of the duplicated set, seamlessly jump back to the start
      if (container.scrollLeft >= container.scrollWidth / 2) {
        container.scrollTo({ left: 0, behavior: "auto" });
      } else {
        container.scrollBy({ left: cardWidth, behavior: "smooth" });
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isPaused]);

  const scrollByAmount = (amount: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      transition: { 
        duration: 0.5, 
        ease: "easeOut" as Easing 
      } 
    },
  };

  return (
    <section 
      id="features" 
      className="py-24 bg-gray-50 dark:bg-dark-bg relative transition-colors duration-300 overflow-hidden"
    >
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/2 left-10 w-96 h-96 bg-brand-purple/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header & Navigation Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-purple/10 border border-brand-purple/30 text-brand-purple text-xs font-semibold mb-4 shadow-sm">
              <Brain className="w-3.5 h-3.5 animate-pulse" />
              <span>Comprehensive Ecosystem</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
              Everything You Need to Ace Your Studies in One App
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">
              Auto-advances every second. Hover or touch to pause, or use buttons and manual swipe to explore.
            </p>
          </motion.div>

          {/* Manual Control Buttons */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => scrollByAmount(-400)}
              className="p-3 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 shadow-sm hover:border-brand-purple transition-colors cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => scrollByAmount(400)}
              className="p-3 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 shadow-sm hover:border-brand-purple transition-colors cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Horizontal Scroll Track */}
        <div 
          ref={scrollRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="flex gap-6 overflow-x-auto pb-6 pt-2 scrollbar-none snap-x snap-mandatory scroll-smooth cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {duplicatedCards.map((card, index) => (
            <motion.div
              key={`${card.id}-${index}`}
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -6, scale: 1.01 }}
              className={`flex-shrink-0 snap-start rounded-3xl p-8 backdrop-blur-md bg-white/80 dark:bg-[#111827]/80 border border-gray-200/80 dark:border-dark-border shadow-md relative overflow-hidden flex flex-col justify-between transition-all group ${
                card.wide ? "w-[360px] sm:w-[440px]" : "w-[300px] sm:w-[340px]"
              }`}
            >
              <div className={`absolute top-0 right-0 w-64 h-64 bg-${card.color}/10 rounded-full blur-3xl group-hover:bg-${card.color}/20 transition-all pointer-events-none`}></div>
              
              <div>
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-12 h-12 rounded-2xl bg-${card.color}/15 dark:bg-${card.color}/20 text-${card.color} border border-${card.color}/30 flex items-center justify-center mb-6 shadow-sm`}
                >
                  {card.icon}
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{card.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
                  {card.desc}
                </p>
              </div>

              <div>
                {card.footerType === "active" && (
                  <div className="bg-gray-50 dark:bg-dark-bg/80 rounded-2xl p-4 border border-gray-200 dark:border-dark-border text-xs text-gray-700 dark:text-gray-300 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></span>
                      {card.badge}
                    </span>
                    <span className="text-brand-purple font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> {card.subBadge}
                    </span>
                  </div>
                )}

                {card.footerType === "retention" && (
                  <div className="flex items-center justify-between text-xs font-semibold text-brand-blue bg-brand-blue/5 p-3 rounded-xl border border-brand-blue/15">
                    <span>{card.badge}</span>
                    <span className="font-mono bg-brand-blue/10 px-2 py-0.5 rounded text-[10px]">{card.subBadge}</span>
                  </div>
                )}

                {card.footerType === "streak" && (
                  <div className="p-3 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-200 dark:border-dark-border text-center shadow-sm flex items-center justify-center gap-2">
                    <Trophy className="w-4 h-4 text-brand-orange" />
                    <span className="text-sm font-extrabold text-brand-orange">{card.badge}</span>
                  </div>
                )}

                {card.footerType === "tags" && card.tags && (
                  <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-400">
                    {card.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="px-3 py-1 rounded-lg bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border shadow-sm font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {card.footerType === "calendar" && (
                  <div className="flex items-center gap-1.5 text-xs text-brand-blue font-semibold bg-brand-blue/5 p-2.5 rounded-xl border border-brand-blue/15 text-center justify-center">
                    <span>{card.badge}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}