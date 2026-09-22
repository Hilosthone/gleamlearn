// // src/app/welcome/page.tsx
// 'use client';

// import React from 'react';
// import Link from 'next/link';
// import { Button } from '@/components/ui/Button';
// import { Card } from '@/components/ui/Card';

// export default function WelcomeScreen() {
//   return (
//     <main className="min-h-screen flex flex-col justify-between bg-white dark:bg-[#0B0F19] px-6 py-10 max-w-md mx-auto transition-colors duration-300">
      
//       {/* Top Header Section */}
//       <div className="flex justify-between items-center w-full">
//         <div className="flex items-center gap-2">
//           <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-blue)] flex items-center justify-center text-white font-bold text-sm">
//             g
//           </div>
//           <span className="font-bold text-lg text-gray-900 dark:text-white">gleamLearn</span>
//         </div>
//       </div>

//       {/* Hero Content Section */}
//       <div className="my-auto py-10 space-y-6 text-center">
//         <div className="relative w-full aspect-square max-w-[260px] mx-auto rounded-3xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-emerald-500/10 border border-gray-200 dark:border-gray-800 flex items-center justify-center p-6">
//           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.1)_0,transparent_70%)]" />
//           <div className="relative space-y-3">
//             <span className="text-4xl">🚀</span>
//             <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Virtual Classroom</h2>
//             <p className="text-xs text-gray-500 dark:text-gray-400">
//               Transform notes, past questions, and syllabi into personalized study plans and quizzes instantly.
//             </p>
//           </div>
//         </div>

//         <div className="space-y-2">
//           <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
//             Master Any Subject with AI
//           </h1>
//           <p className="text-sm text-gray-600 dark:text-gray-400">
//             Your personalized learning companion tailored to your curriculum and pace.
//           </p>
//         </div>
//       </div>

//       {/* Bottom Actions Section */}
//       <div className="space-y-3 w-full">
//         <Link href="/auth/signup" className="block w-full">
//           <Button variant="primary" size="lg" className="w-full">
//             Get Started
//           </Button>
//         </Link>
//         <Link href="/auth/login" className="block w-full">
//           <Button variant="outline" size="lg" className="w-full">
//             I already have an account
//           </Button>
//         </Link>
//       </div>

//     </main>
//   );
// }


// src/app/welcome/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Sparkles, Bot, BookOpenCheck, Trophy, ArrowRight, ShieldCheck } from 'lucide-react';

const CAROUSEL_FEATURES = [
  {
    icon: Bot,
    title: "AI Virtual Classroom",
    description: "Transform lecture notes, syllabi, and past questions into custom study plans instantly."
  },
  {
    icon: BookOpenCheck,
    title: "Adaptive Quizzes",
    description: "Test your mastery with AI-generated practice exams tailored precisely to your learning pace."
  },
  {
    icon: Trophy,
    title: "Gamified Progress",
    description: "Earn experience points, maintain streak counts, and unlock achievements as you study."
  }
];

export default function WelcomeScreen() {
  const [activeSlide, setActiveSlide] = useState(0);

  // Auto-rotate feature showcase slides
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % CAROUSEL_FEATURES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-white via-gray-50 to-gray-100 dark:from-[#0B0F19] dark:via-[#111827] dark:to-[#0B0F19] px-6 py-8 max-w-md mx-auto transition-colors duration-300 relative overflow-hidden select-none">
      
      {/* Ambient Glow Backgrounds */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-brand-blue/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-20 w-72 h-72 bg-brand-purple/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center w-full z-10"
      >
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-md border border-brand-blue/20 bg-white dark:bg-dark-card flex items-center justify-center">
            <Image 
              src="/gleamlearn-logo.jpg" 
              alt="gleamLearn Logo" 
              fill 
              sizes="36px"
              className="object-cover"
              priority
            />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-gray-900 dark:text-white">
            gleam<span className="text-brand-blue">Learn</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-brand-purple text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>v1.0 Pro</span>
        </div>
      </motion.div>

      {/* Hero Content Section */}
      <div className="my-auto py-6 space-y-6 text-center z-10">
        
        {/* Interactive Feature Card Display with Framer Motion */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative w-full aspect-square max-w-[280px] mx-auto rounded-3xl bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl border border-gray-200/80 dark:border-white/10 shadow-xl shadow-blue-500/5 flex flex-col items-center justify-center p-8 overflow-hidden"
        >
          {/* Radial Highlight */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.08)_0,transparent_70%)] pointer-events-none" />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="relative flex flex-col items-center text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-blue/20 to-brand-purple/20 border border-brand-blue/30 flex items-center justify-center text-brand-blue dark:text-brand-purple shadow-inner">
                {React.createElement(CAROUSEL_FEATURES[activeSlide].icon, { className: "w-8 h-8" })}
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                  {CAROUSEL_FEATURES[activeSlide].title}
                </h2>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed px-2">
                  {CAROUSEL_FEATURES[activeSlide].description}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Carousel Pagination Dots */}
          <div className="absolute bottom-4 flex items-center gap-1.5">
            {CAROUSEL_FEATURES.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeSlide === index ? 'w-6 bg-brand-blue' : 'w-1.5 bg-gray-300 dark:bg-gray-700'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </motion.div>

        {/* Main Headings */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-2 max-w-xs mx-auto"
        >
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            Master Any Subject with AI
          </h1>
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
            Your personalized autonomous learning companion tailored precisely to your curriculum and pace.
          </p>
        </motion.div>
      </div>

      {/* Bottom Actions Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="space-y-3 w-full z-10"
      >
        <Link href="/auth/signup" className="block w-full">
          <Button variant="primary" size="lg" className="w-full flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/25 group">
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
        <Link href="/auth/login" className="block w-full">
          <Button variant="outline" size="lg" className="w-full">
            I already have an account
          </Button>
        </Link>

        {/* Security badge footer note */}
        <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-green" />
          <span>Secure AES-256 Cloud Sync Enabled</span>
        </div>
      </motion.div>

    </main>
  );
}