// // src/app/splash/page.tsx
// 'use client';

// import React, { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { motion, AnimatePresence } from 'framer-motion';
// import Image from 'next/image';
// import { Sparkles, Cpu, BookOpen, Rocket } from 'lucide-react';

// const LOADING_STEPS = [
//   "Initializing Neural Engine...",
//   "Calibrating AI Tutor Modules...",
//   "Loading Interactive Knowledge Base...",
//   "Ready to Spark Brilliance!"
// ];

// export default function SplashScreen() {
//   const router = useRouter();
//   const [currentStepIndex, setCurrentStepIndex] = useState(0);
//   const [isExiting, setIsExiting] = useState(false);

//   // Cycle through loading steps to provide engaging visual feedback
//   useEffect(() => {
//     const stepInterval = setInterval(() => {
//       setCurrentStepIndex((prev) => {
//         if (prev < LOADING_STEPS.length - 1) {
//           return prev + 1;
//         }
//         return prev;
//       });
//     }, 850);

//     return () => clearInterval(stepInterval);
//   }, []);

//   // Automatic transition to the Welcome screen after 3.6 seconds
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setIsExiting(true);
//       const exitTimer = setTimeout(() => {
//         router.push('/welcome');
//       }, 500); // Wait for exit animation to finish
//       return () => clearTimeout(exitTimer);
//     }, 3600);

//     return () => clearInterval(timer);
//   }, [router]);

//   const handleSkip = () => {
//     setIsExiting(true);
//     setTimeout(() => router.push('/welcome'), 400);
//   };

//   return (
//     <AnimatePresence>
//       {!isExiting && (
//         <motion.main 
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0, scale: 1.05 }}
//           transition={{ duration: 0.4 }}
//           className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white via-gray-50 to-gray-100 dark:from-[#0B0F19] dark:via-[#111827] dark:to-[#0B0F19] px-4 relative overflow-hidden transition-colors duration-300 select-none"
//         >
//           {/* Ambient Background Glow Effects */}
//           <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-blue/15 dark:bg-brand-blue/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
//           <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-purple/15 dark:bg-brand-purple/10 rounded-full blur-3xl pointer-events-none animate-pulse [animation-delay:1s]" />

//           {/* Skip Button */}
//           <motion.button
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.5 }}
//             onClick={handleSkip}
//             className="absolute top-6 right-6 px-4 py-2 rounded-full text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-200/50 dark:bg-white/5 backdrop-blur-md border border-gray-300/30 dark:border-white/10 transition-all cursor-pointer"
//           >
//             Skip Intro
//           </motion.button>

//           <div className="flex flex-col items-center text-center space-y-8 max-w-sm w-full z-10">
            
//             {/* Brand Logo Container with Multi-Layered Floating & Glow Animation */}
//             <motion.div 
//               initial={{ scale: 0, rotate: -20 }}
//               animate={{ scale: 1, rotate: 0 }}
//               transition={{ type: "spring", stiffness: 260, damping: 20 }}
//               className="relative"
//             >
//               <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-brand-blue via-brand-purple to-brand-green opacity-75 blur-lg animate-spin-slow" />
//               <div className="relative w-24 h-24 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center shadow-2xl shadow-blue-500/30 overflow-hidden">
//                 <Image
//                   src="/gleamlearn-logo.jpg"
//                   alt="gleamLearn Logo"
//                   fill
//                   priority
//                   className="object-cover p-1.5 rounded-3xl"
//                 />
//                 <motion.div
//                   animate={{ rotate: 360 }}
//                   transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
//                   className="absolute -top-1 -right-1 p-1.5 rounded-full bg-white dark:bg-[#111827] shadow-md border border-gray-100 dark:border-gray-800 text-brand-purple z-10"
//                 >
//                   <Sparkles className="w-4 h-4" />
//                 </motion.div>
//               </div>
//             </motion.div>

//             {/* Brand Name & Tagline */}
//             <div className="space-y-3">
//               <motion.h1 
//                 initial={{ opacity: 0, y: 15 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.2 }}
//                 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white"
//               >
//                 gleam<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple">Learn</span>
//               </motion.h1>
//               <motion.p 
//                 initial={{ opacity: 0, y: 15 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.3 }}
//                 className="text-sm font-medium text-gray-500 dark:text-gray-400"
//               >
//                 Your AI-Powered Autonomous Knowledge Hub
//               </motion.p>
//             </div>

//             {/* Feature Pills Preview */}
//             <motion.div 
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.4 }}
//               className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300"
//             >
//               <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm">
//                 <Cpu className="w-3 h-3 text-brand-blue" /> Smart AI
//               </span>
//               <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm">
//                 <BookOpen className="w-3 h-3 text-brand-purple" /> Instant Sync
//               </span>
//               <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm">
//                 <Rocket className="w-3 h-3 text-brand-green" /> Fast Track
//               </span>
//             </motion.div>

//             {/* Dynamic Status Text & Animated Loading Bar */}
//             <div className="w-full space-y-3 pt-2">
//               <div className="h-6 flex items-center justify-center">
//                 <AnimatePresence mode="wait">
//                   <motion.p
//                     key={currentStepIndex}
//                     initial={{ opacity: 0, y: 5 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0, y: -5 }}
//                     transition={{ duration: 0.2 }}
//                     className="text-xs font-medium text-brand-purple dark:text-brand-purple/90"
//                   >
//                     {LOADING_STEPS[currentStepIndex]}
//                   </motion.p>
//                 </AnimatePresence>
//               </div>

//               {/* Smooth Progress Bar */}
//               <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden p-0.5">
//                 <motion.div
//                   className="h-full bg-gradient-to-r from-brand-blue via-brand-purple to-brand-green rounded-full"
//                   initial={{ width: "0%" }}
//                   animate={{ width: `${((currentStepIndex + 1) / LOADING_STEPS.length) * 100}%` }}
//                   transition={{ duration: 0.5, ease: "easeInOut" }}
//                 />
//               </div>
//             </div>

//           </div>
//         </motion.main>
//       )}
//     </AnimatePresence>
//   );
// }




// src/app/splash/page.tsx
'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  motion,
  AnimatePresence,
  animate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
  type AnimationPlaybackControls,
  type Variants,
} from 'framer-motion';
import {
  Sparkles,
  Cpu,
  BookOpen,
  Rocket,
  Brain,
  Lightbulb,
  GraduationCap,
  Check,
  ChevronRight,
} from 'lucide-react';

const NEXT_ROUTE = '/welcome';
const SPLASH_DURATION = 3.6; // seconds

const LOADING_STEPS = [
  'Initializing Neural Engine...',
  'Calibrating AI Tutor Modules...',
  'Loading Interactive Knowledge Base...',
  'Ready to Spark Brilliance!',
];

const FEATURES = [
  { icon: Cpu, label: 'Smart AI', color: 'text-brand-blue' },
  { icon: BookOpen, label: 'Instant Sync', color: 'text-brand-purple' },
  { icon: Rocket, label: 'Fast Track', color: 'text-brand-green' },
];

const ORBIT_ICONS = [
  { icon: Brain, color: 'text-brand-blue' },
  { icon: Lightbulb, color: 'text-amber-500' },
  { icon: GraduationCap, color: 'text-brand-purple' },
  { icon: BookOpen, color: 'text-brand-green' },
];

const ORBIT_RADIUS = 92; // px
const ORBIT_DURATION = 14; // seconds per revolution

type Particle = {
  id: number;
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
};

// Generated on mount (not during render) to avoid SSR hydration mismatches.
function makeParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: 2 + Math.random() * 4,
    duration: 4 + Math.random() * 6,
    delay: Math.random() * 3,
    drift: (Math.random() - 0.5) * 40,
  }));
}

const letterContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.35 } },
};

const letter: Variants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 320, damping: 22 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function SplashScreen() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const [stepIndex, setStepIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  const exitingRef = useRef(false);
  const controlsRef = useRef<AnimationPlaybackControls | null>(null);

  // Single source of truth for the whole loading timeline (0 → 100).
  const progress = useMotionValue(0);
  const progressWidth = useTransform(progress, (v) => `${v}%`);
  const progressLabel = useTransform(progress, (v) => `${Math.round(v)}%`);

  // Pointer parallax
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 80, damping: 20, mass: 0.6 });
  const smoothY = useSpring(pointerY, { stiffness: 80, damping: 20, mass: 0.6 });
  const logoRotateX = useTransform(smoothY, [-0.5, 0.5], [12, -12]);
  const logoRotateY = useTransform(smoothX, [-0.5, 0.5], [-12, 12]);
  const glowX = useTransform(smoothX, [-0.5, 0.5], [-40, 40]);
  const glowY = useTransform(smoothY, [-0.5, 0.5], [-40, 40]);
  const glowXInverse = useTransform(glowX, (v) => -v);
  const glowYInverse = useTransform(glowY, (v) => -v);

  const beginExit = useCallback(() => {
    if (exitingRef.current) return;
    exitingRef.current = true;
    setIsExiting(true);
  }, []);

  // Drive the progress bar, then exit when complete.
  useEffect(() => {
    router.prefetch(NEXT_ROUTE);
    if (!reduceMotion) setParticles(makeParticles(28));

    const controls = animate(progress, 100, {
      duration: SPLASH_DURATION,
      ease: [0.65, 0, 0.35, 1],
      onComplete: beginExit,
    });
    controlsRef.current = controls;
    return () => controls.stop();
  }, [router, progress, beginExit, reduceMotion]);

  // Derive the current status message from progress.
  useMotionValueEvent(progress, 'change', (v) => {
    const next = Math.min(LOADING_STEPS.length - 1, Math.floor((v / 100) * LOADING_STEPS.length));
    setStepIndex((prev) => (prev === next ? prev : next));
  });

  // Skip: rush the bar to 100% so the user still sees it "finish".
  const handleSkip = useCallback(() => {
    if (exitingRef.current) return;
    controlsRef.current?.stop();
    controlsRef.current = animate(progress, 100, {
      duration: 0.35,
      ease: 'easeOut',
      onComplete: beginExit,
    });
  }, [progress, beginExit]);

  // Keyboard skip: Esc / Enter / Space
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSkip();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleSkip]);

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    pointerX.set((e.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handlePointerLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <AnimatePresence onExitComplete={() => router.replace(NEXT_ROUTE)}>
      {!isExiting && (
        <motion.main
          key="splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.06, filter: 'blur(10px)' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white via-gray-50 to-gray-100 dark:from-[#0B0F19] dark:via-[#111827] dark:to-[#0B0F19] px-4 relative overflow-hidden transition-colors duration-300 select-none"
        >
          {/* Subtle dotted grid, faded toward the edges */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none opacity-[0.35] dark:opacity-[0.15] [background-image:radial-gradient(circle,rgb(148_163_184/0.5)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]"
          />

          {/* Ambient glows with parallax */}
          <motion.div
            aria-hidden
            style={{ x: glowX, y: glowY }}
            animate={reduceMotion ? undefined : { scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 left-1/2 -ml-48 -mt-48 w-96 h-96 bg-brand-blue/20 dark:bg-brand-blue/15 rounded-full blur-3xl pointer-events-none"
          />
          <motion.div
            aria-hidden
            style={{ x: glowXInverse, y: glowYInverse }}
            animate={reduceMotion ? undefined : { scale: [1.1, 1, 1.1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-purple/20 dark:bg-brand-purple/15 rounded-full blur-3xl pointer-events-none"
          />
          <motion.div
            aria-hidden
            style={{ x: glowXInverse, y: glowY }}
            animate={reduceMotion ? undefined : { scale: [1, 1.2, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-1/3 left-[20%] w-64 h-64 bg-brand-green/15 dark:bg-brand-green/10 rounded-full blur-3xl pointer-events-none"
          />

          {/* Floating particles */}
          <div aria-hidden className="absolute inset-0 pointer-events-none">
            {particles.map((p) => (
              <motion.span
                key={p.id}
                className="absolute rounded-full bg-gradient-to-br from-brand-blue to-brand-purple"
                style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.8, 0], y: [0, -80], x: [0, p.drift] }}
                transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeOut' }}
              />
            ))}
          </div>

          {/* Skip button */}
          <motion.button
            type="button"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSkip}
            className="group absolute top-6 right-6 z-20 flex items-center gap-1 px-4 py-2 rounded-full text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-200/50 dark:bg-white/5 backdrop-blur-md border border-gray-300/30 dark:border-white/10 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple"
          >
            Skip Intro
            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </motion.button>

          <div className="flex flex-col items-center text-center space-y-8 max-w-sm w-full z-10">
            {/* Logo stage: pulse rings, orbiting icons, 3D tilt */}
            <div className="relative w-56 h-56 flex items-center justify-center [perspective:800px]">
              {!reduceMotion &&
                [0, 1].map((i) => (
                  <motion.div
                    key={i}
                    aria-hidden
                    className="absolute w-24 h-24 rounded-3xl border-2 border-brand-purple/40"
                    initial={{ scale: 1, opacity: 0 }}
                    animate={{ scale: [1, 1.9], opacity: [0.5, 0] }}
                    transition={{ duration: 2.4, delay: 0.8 + i * 1.2, repeat: Infinity, ease: 'easeOut' }}
                  />
                ))}

              {/* Orbit track */}
              <motion.div
                aria-hidden
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="absolute rounded-full border border-dashed border-gray-300/70 dark:border-white/10"
                style={{ width: ORBIT_RADIUS * 2, height: ORBIT_RADIUS * 2 }}
              />

              {/* Orbiting icons */}
              {!reduceMotion && (
                <motion.div
                  aria-hidden
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, rotate: 360 }}
                  transition={{
                    opacity: { delay: 0.7, duration: 0.6 },
                    rotate: { duration: ORBIT_DURATION, repeat: Infinity, ease: 'linear' },
                  }}
                >
                  {ORBIT_ICONS.map(({ icon: Icon, color }, i) => {
                    const angle = (i / ORBIT_ICONS.length) * Math.PI * 2;
                    return (
                      <div
                        key={i}
                        className="absolute left-1/2 top-1/2"
                        style={{
                          transform: `translate(-50%, -50%) translate(${Math.cos(angle) * ORBIT_RADIUS}px, ${Math.sin(angle) * ORBIT_RADIUS}px)`,
                        }}
                      >
                        {/* Counter-rotate so icons stay upright */}
                        <motion.div
                          animate={{ rotate: -360 }}
                          transition={{ duration: ORBIT_DURATION, repeat: Infinity, ease: 'linear' }}
                          className={`p-2 rounded-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur border border-gray-100 dark:border-gray-800 shadow-lg ${color}`}
                        >
                          <Icon className="w-4 h-4" />
                        </motion.div>
                      </div>
                    );
                  })}
                </motion.div>
              )}

              {/* Logo */}
              <motion.div
                initial={{ scale: 0, rotate: -25, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 240, damping: 18 }}
                style={{ rotateX: logoRotateX, rotateY: logoRotateY }}
                className="relative"
              >
                <motion.div
                  animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative"
                >
                  {/* Rotating gradient halo */}
                  <motion.div
                    aria-hidden
                    animate={reduceMotion ? undefined : { rotate: 360 }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                    className="absolute -inset-2 rounded-3xl bg-[conic-gradient(from_0deg,var(--tw-gradient-stops))] from-brand-blue via-brand-purple to-brand-green opacity-75 blur-lg"
                  />
                  <div className="relative w-24 h-24 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center shadow-2xl shadow-blue-500/30 overflow-hidden">
                    <Image
                      src="/gleamlearn-logo.jpg"
                      alt="gleamLearn Logo"
                      fill
                      priority
                      sizes="96px"
                      className="object-cover p-1.5 rounded-3xl"
                    />
                    {/* Light sweep across the logo */}
                    {!reduceMotion && (
                      <motion.div
                        aria-hidden
                        initial={{ x: '-150%' }}
                        animate={{ x: '150%' }}
                        transition={{ duration: 1.2, delay: 1, repeat: Infinity, repeatDelay: 2.2, ease: 'easeInOut' }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-[-20deg]"
                      />
                    )}
                  </div>

                  {/* Sparkle badge */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: 360 }}
                    transition={{
                      scale: { delay: 0.5, type: 'spring', stiffness: 400, damping: 15 },
                      rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
                    }}
                    className="absolute -top-2 -right-2 p-1.5 rounded-full bg-white dark:bg-[#111827] shadow-md border border-gray-100 dark:border-gray-800 text-brand-purple z-10"
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>

            {/* Brand name (letter-by-letter) & tagline */}
            <div className="space-y-3 -mt-6">
              <motion.h1
                variants={letterContainer}
                initial="hidden"
                animate="visible"
                aria-label="gleamLearn"
                className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white"
              >
                {'gleam'.split('').map((char, i) => (
                  <motion.span key={i} variants={letter} aria-hidden className="inline-block">
                    {char}
                  </motion.span>
                ))}
                <motion.span variants={letter} aria-hidden className="inline-block">
                  {/* Flowing gradient on "Learn" */}
                  <motion.span
                    animate={reduceMotion ? undefined : { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-brand-purple to-brand-blue bg-[length:200%_auto]"
                  >
                    Learn
                  </motion.span>
                </motion.span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0.75}
                className="text-sm font-medium text-gray-500 dark:text-gray-400"
              >
                Your AI-Powered Autonomous Knowledge Hub
              </motion.p>
            </div>

            {/* Feature pills */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.9 } } }}
              className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300"
            >
              {FEATURES.map(({ icon: Icon, label, color }) => (
                <motion.span
                  key={label}
                  variants={{
                    hidden: { opacity: 0, y: 10, scale: 0.9 },
                    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } },
                  }}
                  whileHover={{ y: -2, scale: 1.05 }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/80 dark:bg-white/5 backdrop-blur border border-gray-200 dark:border-white/10 shadow-sm"
                >
                  <Icon className={`w-3 h-3 ${color}`} /> {label}
                </motion.span>
              ))}
            </motion.div>

            {/* Status text, step dots & progress bar */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1.1}
              className="w-full space-y-3 pt-2"
            >
              <div className="h-6 flex items-center justify-center" role="status" aria-live="polite">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={stepIndex}
                    initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -6, filter: 'blur(4px)' }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center gap-1.5 text-xs font-medium text-brand-purple dark:text-brand-purple/90"
                  >
                    {stepIndex === LOADING_STEPS.length - 1 && (
                      <motion.span
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        className="flex items-center justify-center w-4 h-4 rounded-full bg-brand-green text-white"
                      >
                        <Check className="w-3 h-3" strokeWidth={3} />
                      </motion.span>
                    )}
                    {LOADING_STEPS[stepIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>

              <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden p-0.5">
                <motion.div
                  style={{ width: progressWidth }}
                  className="relative h-full rounded-full bg-gradient-to-r from-brand-blue via-brand-purple to-brand-green shadow-[0_0_12px_rgba(139,92,246,0.6)] overflow-hidden"
                >
                  {!reduceMotion && (
                    <motion.div
                      aria-hidden
                      initial={{ x: '-100%' }}
                      animate={{ x: '200%' }}
                      transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/70 to-transparent"
                    />
                  )}
                </motion.div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                <div className="flex items-center gap-1.5">
                  {LOADING_STEPS.map((_, i) => (
                    <motion.span
                      key={i}
                      animate={{
                        width: i === stepIndex ? 16 : 6,
                        opacity: i <= stepIndex ? 1 : 0.35,
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      className={`h-1.5 rounded-full ${i <= stepIndex ? 'bg-brand-purple' : 'bg-gray-400 dark:bg-gray-600'}`}
                    />
                  ))}
                </div>
                <motion.span className="tabular-nums">{progressLabel}</motion.span>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 }}
              className="text-[10px] text-gray-400 dark:text-gray-600"
            >
              Press <kbd className="px-1 py-0.5 rounded border border-gray-300 dark:border-gray-700 font-sans">Esc</kbd> to skip
            </motion.p>
          </div>
        </motion.main>
      )}
    </AnimatePresence>
  );
}
