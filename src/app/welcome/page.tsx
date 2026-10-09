// // src/app/welcome/page.tsx
// 'use client';

// import React, { useState, useEffect } from 'react';
// import Link from 'next/link';
// import Image from 'next/image';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Button } from '@/components/ui/Button';
// import { Sparkles, Bot, BookOpenCheck, Trophy, ArrowRight, ShieldCheck } from 'lucide-react';

// const CAROUSEL_FEATURES = [
//   {
//     icon: Bot,
//     title: "AI Virtual Classroom",
//     description: "Transform lecture notes, syllabi, and past questions into custom study plans instantly."
//   },
//   {
//     icon: BookOpenCheck,
//     title: "Adaptive Quizzes",
//     description: "Test your mastery with AI-generated practice exams tailored precisely to your learning pace."
//   },
//   {
//     icon: Trophy,
//     title: "Gamified Progress",
//     description: "Earn experience points, maintain streak counts, and unlock achievements as you study."
//   }
// ];

// export default function WelcomeScreen() {
//   const [activeSlide, setActiveSlide] = useState(0);

//   // Auto-rotate feature showcase slides
//   useEffect(() => {
//     const timer = setInterval(() => {
//       setActiveSlide((prev) => (prev + 1) % CAROUSEL_FEATURES.length);
//     }, 4500);
//     return () => clearInterval(timer);
//   }, []);

//   return (
//     <main className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-white via-gray-50 to-gray-100 dark:from-[#0B0F19] dark:via-[#111827] dark:to-[#0B0F19] px-6 py-8 max-w-md mx-auto transition-colors duration-300 relative overflow-hidden select-none">
      
//       {/* Ambient Glow Backgrounds */}
//       <div className="absolute -top-20 -left-20 w-72 h-72 bg-brand-blue/10 rounded-full blur-3xl pointer-events-none" />
//       <div className="absolute top-1/2 -right-20 w-72 h-72 bg-brand-purple/10 rounded-full blur-3xl pointer-events-none" />

//       {/* Top Header Section */}
//       <motion.div 
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="flex justify-between items-center w-full z-10"
//       >
//         <div className="flex items-center gap-2.5">
//           <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-md border border-brand-blue/20 bg-white dark:bg-dark-card flex items-center justify-center">
//             <Image 
//               src="/gleamlearn-logo.jpg" 
//               alt="gleamLearn Logo" 
//               fill 
//               sizes="36px"
//               className="object-cover"
//               priority
//             />
//           </div>
//           <span className="font-extrabold text-lg tracking-tight text-gray-900 dark:text-white">
//             Gleam<span className="text-brand-blue">Learn</span>
//           </span>
//         </div>

//         <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-brand-purple text-xs font-semibold">
//           <Sparkles className="w-3.5 h-3.5 animate-pulse" />
//           <span>v1.0 Pro</span>
//         </div>
//       </motion.div>

//       {/* Hero Content Section */}
//       <div className="my-auto py-6 space-y-6 text-center z-10">
        
//         {/* Interactive Feature Card Display with Framer Motion */}
//         <motion.div 
//           initial={{ opacity: 0, scale: 0.9 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 0.5, delay: 0.1 }}
//           className="relative w-full aspect-square max-w-[280px] mx-auto rounded-3xl bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl border border-gray-200/80 dark:border-white/10 shadow-xl shadow-blue-500/5 flex flex-col items-center justify-center p-8 overflow-hidden"
//         >
//           {/* Radial Highlight */}
//           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.08)_0,transparent_70%)] pointer-events-none" />

//           <AnimatePresence mode="wait">
//             <motion.div
//               key={activeSlide}
//               initial={{ opacity: 0, y: 15 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -15 }}
//               transition={{ duration: 0.3 }}
//               className="relative flex flex-col items-center text-center space-y-4"
//             >
//               <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-blue/20 to-brand-purple/20 border border-brand-blue/30 flex items-center justify-center text-brand-blue dark:text-brand-purple shadow-inner">
//                 {React.createElement(CAROUSEL_FEATURES[activeSlide].icon, { className: "w-8 h-8" })}
//               </div>

//               <div className="space-y-2">
//                 <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
//                   {CAROUSEL_FEATURES[activeSlide].title}
//                 </h2>
//                 <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed px-2">
//                   {CAROUSEL_FEATURES[activeSlide].description}
//                 </p>
//               </div>
//             </motion.div>
//           </AnimatePresence>

//           {/* Carousel Pagination Dots */}
//           <div className="absolute bottom-4 flex items-center gap-1.5">
//             {CAROUSEL_FEATURES.map((_, index) => (
//               <button
//                 key={index}
//                 onClick={() => setActiveSlide(index)}
//                 className={`h-1.5 rounded-full transition-all duration-300 ${
//                   activeSlide === index ? 'w-6 bg-brand-blue' : 'w-1.5 bg-gray-300 dark:bg-gray-700'
//                 }`}
//                 aria-label={`Go to slide ${index + 1}`}
//               />
//             ))}
//           </div>
//         </motion.div>

//         {/* Main Headings */}
//         <motion.div 
//           initial={{ opacity: 0, y: 15 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, delay: 0.2 }}
//           className="space-y-2 max-w-xs mx-auto"
//         >
//           <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
//             Master Any Subject with AI
//           </h1>
//           <p className="text-xs font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
//             Your personalized autonomous learning companion tailored precisely to your curriculum and pace.
//           </p>
//         </motion.div>
//       </div>

//       {/* Bottom Actions Section */}
//       <motion.div 
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5, delay: 0.3 }}
//         className="space-y-3 w-full z-10"
//       >
//         <Link href="/auth/signup" className="block w-full">
//           <Button variant="primary" size="lg" className="w-full flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/25 group">
//             <span>Get Started</span>
//             <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
//           </Button>
//         </Link>
//         <Link href="/auth/login" className="block w-full">
//           <Button variant="outline" size="lg" className="w-full">
//             I already have an account
//           </Button>
//         </Link>

//         {/* Security badge footer note */}
//         <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500 font-medium">
//           <ShieldCheck className="w-3.5 h-3.5 text-brand-green" />
//           <span>Secure AES-256 Cloud Sync Enabled</span>
//         </div>
//       </motion.div>

//     </main>
//   );
// }



// src/app/welcome/page.tsx
'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  motion,
  AnimatePresence,
  animate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type AnimationPlaybackControls,
  type PanInfo,
  type Variants,
} from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Sparkles, Bot, BookOpenCheck, Trophy, ArrowRight, ShieldCheck, Zap, Flame, Star } from 'lucide-react';

const SLIDE_DURATION = 4.5; // seconds
const SWIPE_THRESHOLD = 50; // px

const CAROUSEL_FEATURES = [
  {
    icon: Bot,
    badgeIcon: Sparkles,
    title: 'AI Virtual Classroom',
    description: 'Transform lecture notes, syllabi, and past questions into custom study plans instantly.',
    iconBox: 'from-brand-blue/25 to-brand-purple/10 border-brand-blue/30 text-brand-blue',
    glow: 'bg-brand-blue/25',
    dot: 'bg-brand-blue',
  },
  {
    icon: BookOpenCheck,
    badgeIcon: Zap,
    title: 'Adaptive Quizzes',
    description: 'Test your mastery with AI-generated practice exams tailored precisely to your learning pace.',
    iconBox: 'from-brand-purple/25 to-brand-blue/10 border-brand-purple/30 text-brand-purple',
    glow: 'bg-brand-purple/25',
    dot: 'bg-brand-purple',
  },
  {
    icon: Trophy,
    badgeIcon: Flame,
    title: 'Gamified Progress',
    description: 'Earn experience points, maintain streak counts, and unlock achievements as you study.',
    iconBox: 'from-brand-green/25 to-amber-400/10 border-brand-green/30 text-brand-green',
    glow: 'bg-brand-green/25',
    dot: 'bg-brand-green',
  },
];

const HEADLINE = ['Master', 'Any', 'Subject', 'with'];

const slideVariants: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 60 : -60, filter: 'blur(6px)' }),
  center: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 260, damping: 26 },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? -60 : 60,
    filter: 'blur(6px)',
    transition: { duration: 0.2 },
  }),
};

const wordContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.35 } },
};

const word: Variants = {
  hidden: { opacity: 0, y: 18, filter: 'blur(6px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function WelcomeScreen() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const [[activeSlide, direction], setSlide] = useState<[number, number]>([0, 1]);
  const [isPaused, setIsPaused] = useState(false);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  // Autoplay progress for the active slide (0 → 1); also drives the dot fill.
  const slideProgress = useMotionValue(0);
  const dotFill = useTransform(slideProgress, (v) => `${v * 100}%`);
  const controlsRef = useRef<AnimationPlaybackControls | null>(null);

  // Card tilt
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useSpring(useTransform(tiltY, [-0.5, 0.5], [8, -8]), { stiffness: 150, damping: 18 });
  const rotateY = useSpring(useTransform(tiltX, [-0.5, 0.5], [-8, 8]), { stiffness: 150, damping: 18 });

  const goTo = useCallback((index: number, dir?: number) => {
    setSlide(([current]) => {
      const total = CAROUSEL_FEATURES.length;
      const next = ((index % total) + total) % total;
      if (next === current) return [current, dir ?? 1];
      return [next, dir ?? (next > current ? 1 : -1)];
    });
  }, []);

  const next = useCallback(() => setSlide(([c]) => [(c + 1) % CAROUSEL_FEATURES.length, 1]), []);
  const prev = useCallback(
    () => setSlide(([c]) => [(c - 1 + CAROUSEL_FEATURES.length) % CAROUSEL_FEATURES.length, -1]),
    []
  );

  // Restart the autoplay timer every time the slide changes.
  useEffect(() => {
    slideProgress.set(0);
    const controls = animate(slideProgress, 1, {
      duration: SLIDE_DURATION,
      ease: 'linear',
      onComplete: next,
    });
    controlsRef.current = controls;
    return () => controls.stop();
  }, [activeSlide, slideProgress, next]);

  // Pause while hovered / touched / dragged.
  useEffect(() => {
    if (isPaused) controlsRef.current?.pause();
    else controlsRef.current?.play();
  }, [isPaused, activeSlide]);

  // Prefetch auth routes so the CTA transitions feel instant.
  useEffect(() => {
    router.prefetch('/auth/signup');
    router.prefetch('/auth/login');
  }, [router]);

  // Arrow-key navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    setIsPaused(false);
    if (info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -400) next();
    else if (info.offset.x > SWIPE_THRESHOLD || info.velocity.x > 400) prev();
  };

  const handleCardPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || e.pointerType !== 'mouse') return;
    const rect = e.currentTarget.getBoundingClientRect();
    tiltX.set((e.clientX - rect.left) / rect.width - 0.5);
    tiltY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const resetTilt = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  const navigate = (href: string) => {
    if (navigatingTo) return;
    setNavigatingTo(href);
  };

  const feature = CAROUSEL_FEATURES[activeSlide];
  const BadgeIcon = feature.badgeIcon;

  return (
    <AnimatePresence onExitComplete={() => navigatingTo && router.push(navigatingTo)}>
      {!navigatingTo && (
        <motion.main
          key="welcome"
          initial={{ opacity: 0, scale: 0.98, filter: 'blur(8px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-white via-gray-50 to-gray-100 dark:from-[#0B0F19] dark:via-[#111827] dark:to-[#0B0F19] px-6 py-8 max-w-md mx-auto transition-colors duration-300 relative overflow-hidden select-none"
        >
          {/* Ambient glows */}
          <motion.div
            aria-hidden
            animate={reduceMotion ? undefined : { x: [0, 30, 0], y: [0, 20, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-20 -left-20 w-72 h-72 bg-brand-blue/15 rounded-full blur-3xl pointer-events-none"
          />
          <motion.div
            aria-hidden
            animate={reduceMotion ? undefined : { x: [0, -25, 0], y: [0, -30, 0], scale: [1.1, 1, 1.1] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 -right-20 w-72 h-72 bg-brand-purple/15 rounded-full blur-3xl pointer-events-none"
          />
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-[0.12] [background-image:radial-gradient(circle,rgb(148_163_184/0.5)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_65%)]"
          />

          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex justify-between items-center w-full z-10"
          >
            <div className="flex items-center gap-2.5">
              <motion.div
                whileHover={{ rotate: -8, scale: 1.08 }}
                className="relative w-9 h-9 rounded-xl overflow-hidden shadow-md border border-brand-blue/20 bg-white dark:bg-dark-card flex items-center justify-center"
              >
                <Image src="/gleamlearn-logo.jpg" alt="gleamLearn Logo" fill sizes="36px" className="object-cover" priority />
              </motion.div>
              <span className="font-extrabold text-lg tracking-tight text-gray-900 dark:text-white">
                gleam
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple">Learn</span>
              </span>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 400, damping: 18 }}
              className="relative flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-brand-purple text-xs font-semibold overflow-hidden"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>v1.0 Pro</span>
              {!reduceMotion && (
                <motion.span
                  aria-hidden
                  initial={{ x: '-120%' }}
                  animate={{ x: '220%' }}
                  transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
                  className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-20deg]"
                />
              )}
            </motion.div>
          </motion.header>

          {/* Hero */}
          <div className="my-auto py-6 space-y-7 text-center z-10">
            {/* Feature card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.15 }}
              className="[perspective:1000px]"
            >
              <motion.div
                role="region"
                aria-roledescription="carousel"
                aria-label="Feature highlights"
                style={{ rotateX, rotateY }}
                onPointerMove={handleCardPointerMove}
                onPointerEnter={() => setIsPaused(true)}
                onPointerLeave={() => {
                  setIsPaused(false);
                  resetTilt();
                }}
                className="relative w-full aspect-square max-w-[280px] mx-auto rounded-3xl bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl border border-gray-200/80 dark:border-white/10 shadow-xl shadow-blue-500/10 overflow-hidden"
              >
                {/* Per-slide coloured glow */}
                <AnimatePresence>
                  <motion.div
                    key={activeSlide}
                    aria-hidden
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className={`absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full blur-3xl pointer-events-none ${feature.glow}`}
                  />
                </AnimatePresence>

                {/* Swipeable slide */}
                <motion.div
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.25}
                  onDragStart={() => setIsPaused(true)}
                  onDragEnd={handleDragEnd}
                  className="absolute inset-0 flex items-center justify-center p-8 pb-10 cursor-grab active:cursor-grabbing touch-pan-y"
                >
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={activeSlide}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      aria-live="polite"
                      className="relative flex flex-col items-center text-center space-y-4"
                    >
                      {/* Icon with spring pop, float and badge */}
                      <motion.div
                        initial={{ scale: 0.5, rotate: -15 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 14, delay: 0.05 }}
                        className="relative"
                      >
                        <motion.div
                          animate={reduceMotion ? undefined : { y: [0, -5, 0] }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                          className={`w-16 h-16 rounded-2xl bg-gradient-to-br border flex items-center justify-center shadow-inner ${feature.iconBox}`}
                        >
                          {React.createElement(feature.icon, { className: 'w-8 h-8' })}
                        </motion.div>
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.25, type: 'spring', stiffness: 500, damping: 15 }}
                          className="absolute -top-2 -right-2 p-1 rounded-full bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 shadow-md text-amber-500"
                        >
                          <BadgeIcon className="w-3 h-3" />
                        </motion.span>
                      </motion.div>

                      <div className="space-y-2">
                        <motion.h2
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="text-lg font-bold text-gray-900 dark:text-white tracking-tight"
                        >
                          {feature.title}
                        </motion.h2>
                        <motion.p
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.18 }}
                          className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed px-2"
                        >
                          {feature.description}
                        </motion.p>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </motion.div>

                {/* Pagination: active dot fills as the timer runs */}
                <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-1.5 z-10">
                  {CAROUSEL_FEATURES.map((f, index) => {
                    const isActive = activeSlide === index;
                    return (
                      <motion.button
                        key={index}
                        type="button"
                        onClick={() => goTo(index)}
                        animate={{ width: isActive ? 28 : 6 }}
                        whileHover={{ scale: 1.2 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        aria-label={`Go to slide ${index + 1}: ${f.title}`}
                        aria-current={isActive}
                        className="relative h-1.5 rounded-full bg-gray-300 dark:bg-gray-700 overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
                      >
                        {isActive && (
                          <motion.span
                            style={{ width: reduceMotion ? '100%' : dotFill }}
                            className={`absolute inset-y-0 left-0 rounded-full ${f.dot}`}
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>

            {/* Headline */}
            <div className="space-y-2 max-w-xs mx-auto">
              <motion.h1
                variants={wordContainer}
                initial="hidden"
                animate="visible"
                aria-label="Master Any Subject with AI"
                className="text-2xl font-black tracking-tight text-gray-900 dark:text-white"
              >
                {HEADLINE.map((w) => (
                  <motion.span key={w} variants={word} aria-hidden className="inline-block mr-[0.25em]">
                    {w}
                  </motion.span>
                ))}
                <motion.span variants={word} aria-hidden className="relative inline-block">
                  <motion.span
                    animate={reduceMotion ? undefined : { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-brand-purple to-brand-blue bg-[length:200%_auto]"
                  >
                    AI
                  </motion.span>
                  <motion.span
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.9, type: 'spring', stiffness: 400, damping: 12 }}
                    className="absolute -top-2 -right-3 text-amber-400"
                  >
                    <Star className="w-3 h-3 fill-current" />
                  </motion.span>
                </motion.span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.75 }}
                className="text-xs font-medium text-gray-600 dark:text-gray-400 leading-relaxed"
              >
                Your personalized autonomous learning companion tailored precisely to your curriculum and pace.
              </motion.p>
            </div>
          </div>

          {/* Actions */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.9 } } }}
            className="space-y-3 w-full z-10"
          >
            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } } }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="relative"
            >
              {/* Breathing glow behind the primary CTA */}
              {!reduceMotion && (
                <motion.div
                  aria-hidden
                  animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.96, 1.02, 0.96] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-brand-blue via-brand-purple to-brand-blue blur-md pointer-events-none"
                />
              )}
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/auth/signup')}
                className="relative w-full flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/25 group overflow-hidden"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                {!reduceMotion && (
                  <motion.span
                    aria-hidden
                    initial={{ x: '-150%' }}
                    animate={{ x: '250%' }}
                    transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 2.5, ease: 'easeInOut', delay: 1.5 }}
                    className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] pointer-events-none"
                  />
                )}
              </Button>
            </motion.div>

            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } } }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button variant="outline" size="lg" onClick={() => navigate('/auth/login')} className="w-full">
                I already have an account
              </Button>
            </motion.div>

            <motion.div
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
              className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500 font-medium"
            >
              <motion.span
                animate={reduceMotion ? undefined : { scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-brand-green" />
              </motion.span>
              <span>Secure AES-256 Cloud Sync Enabled</span>
            </motion.div>
          </motion.div>
        </motion.main>
      )}
    </AnimatePresence>
  );
}