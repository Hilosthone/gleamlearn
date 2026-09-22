// src/app/splash/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Cpu, BookOpen, Rocket } from 'lucide-react';

const LOADING_STEPS = [
  "Initializing Neural Engine...",
  "Calibrating AI Tutor Modules...",
  "Loading Interactive Knowledge Base...",
  "Ready to Spark Brilliance!"
];

export default function SplashScreen() {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  // Cycle through loading steps to provide engaging visual feedback
  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < LOADING_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 850);

    return () => clearInterval(stepInterval);
  }, []);

  // Automatic transition to the Welcome screen after 3.6 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      const exitTimer = setTimeout(() => {
        router.push('/welcome');
      }, 500); // Wait for exit animation to finish
      return () => clearTimeout(exitTimer);
    }, 3600);

    return () => clearTimeout(timer);
  }, [router]);

  const handleSkip = () => {
    setIsExiting(true);
    setTimeout(() => router.push('/welcome'), 400);
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.main 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.4 }}
          className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white via-gray-50 to-gray-100 dark:from-[#0B0F19] dark:via-[#111827] dark:to-[#0B0F19] px-4 relative overflow-hidden transition-colors duration-300 select-none"
        >
          {/* Ambient Background Glow Effects */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-blue/15 dark:bg-brand-blue/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-purple/15 dark:bg-brand-purple/10 rounded-full blur-3xl pointer-events-none animate-pulse [animation-delay:1s]" />

          {/* Skip Button */}
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={handleSkip}
            className="absolute top-6 right-6 px-4 py-2 rounded-full text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-200/50 dark:bg-white/5 backdrop-blur-md border border-gray-300/30 dark:border-white/10 transition-all cursor-pointer"
          >
            Skip Intro
          </motion.button>

          <div className="flex flex-col items-center text-center space-y-8 max-w-sm w-full z-10">
            
            {/* Brand Logo Container with Multi-Layered Floating & Glow Animation */}
            <motion.div 
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="relative"
            >
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-brand-blue via-brand-purple to-brand-green opacity-75 blur-lg animate-spin-slow" />
              <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center shadow-2xl shadow-blue-500/40 text-white">
                <span className="text-4xl font-black tracking-wider">g</span>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-1 -right-1 p-1.5 rounded-full bg-white dark:bg-[#111827] shadow-md border border-gray-100 dark:border-gray-800 text-brand-purple"
                >
                  <Sparkles className="w-4 h-4" />
                </motion.div>
              </div>
            </motion.div>

            {/* Brand Name & Tagline */}
            <div className="space-y-3">
              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white"
              >
                gleam<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple">Learn</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-sm font-medium text-gray-500 dark:text-gray-400"
              >
                Your AI-Powered Autonomous Knowledge Hub
              </motion.p>
            </div>

            {/* Feature Pills Preview */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300"
            >
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm">
                <Cpu className="w-3 h-3 text-brand-blue" /> Smart AI
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm">
                <BookOpen className="w-3 h-3 text-brand-purple" /> Instant Sync
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm">
                <Rocket className="w-3 h-3 text-brand-green" /> Fast Track
              </span>
            </motion.div>

            {/* Dynamic Status Text & Animated Loading Bar */}
            <div className="w-full space-y-3 pt-2">
              <div className="h-6 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentStepIndex}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs font-medium text-brand-purple dark:text-brand-purple/90"
                  >
                    {LOADING_STEPS[currentStepIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Smooth Progress Bar */}
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden p-0.5">
                <motion.div
                  className="h-full bg-gradient-to-r from-brand-blue via-brand-purple to-brand-green rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${((currentStepIndex + 1) / LOADING_STEPS.length) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </div>
            </div>

          </div>
        </motion.main>
      )}
    </AnimatePresence>
  );
}