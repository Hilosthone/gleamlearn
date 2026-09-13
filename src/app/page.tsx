// import Navbar from "@/components/Navbar";
// import Hero from "@/components/Hero";
// import UploadPipeline from "@/components/UploadPipeline";
// import Tutor from "@/components/Tutor";
// import BentoFeatures from "@/components/BentoFeatures";
// import GamificationSection from "@/components/GamificationSection";
// import PricingSection from "@/components/PricingSection";
// import Footer from "@/components/Footer";

// export default function Home() {
//   return (
//     <main className="min-h-screen bg-white dark:bg-dark-bg text-gray-900 dark:text-gray-100 selection:bg-brand-blue selection:text-white transition-colors duration-300">
//       {/* Navigation Header */}
//       <Navbar />

//       {/* Hero Section */}
//       <Hero />

//       {/* Upload-to-Learn Pipeline Section */}
//       <UploadPipeline />

//       {/* AI Tutor Section */}
//       <Tutor />

//       {/* Bento Grid Features Section */}
//       <BentoFeatures />

//       {/* Gamification & Streaks Section */}
//       <GamificationSection />

//       {/* Pricing & CTA Signup Section */}
//       <PricingSection />

//       {/* Real Footer Section */}
//       <Footer />
//     </main>
//   );
// }


// "use client";

// import React, { useState, useEffect } from "react";
// import { motion, AnimatePresence, useScroll, Easing } from "framer-motion";
// import { Bot, ArrowUp, Sparkles, Smartphone, Zap } from "lucide-react";
// import Navbar from "@/components/Navbar";
// import Hero from "@/components/Hero";
// import UploadPipeline from "@/components/UploadPipeline";
// import Tutor from "@/components/Tutor";
// import BentoFeatures from "@/components/BentoFeatures";
// import GamificationSection from "@/components/GamificationSection";
// import PricingSection from "@/components/PricingSection";
// import Footer from "@/components/Footer";

// export default function Home() {
//   const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
//   const [showScrollTop, setShowScrollTop] = useState(false);
//   const [mobileVibeActive, setMobileVibeActive] = useState(false);
//   const { scrollYProgress } = useScroll();

//   // Track mouse position smoothly for the floating AI bot assistant on desktop
//   useEffect(() => {
//     const handleMouseMove = (e: MouseEvent) => {
//       setMousePosition({ x: e.clientX, y: e.clientY });
//     };

//     window.addEventListener("mousemove", handleMouseMove);
//     return () => window.removeEventListener("mousemove", handleMouseMove);
//   }, []);

//   // Track scroll position to toggle visibility of the "Go Up" button
//   useEffect(() => {
//     const handleScroll = () => {
//       if (window.scrollY > 400) {
//         setShowScrollTop(true);
//       } else {
//         setShowScrollTop(false);
//       }
//     };

//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   const scrollToTop = () => {
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   // Typed section transition properties to satisfy strict Framer Motion types
//   const sectionTransition = {
//     initial: { opacity: 0, y: 30 },
//     whileInView: { opacity: 1, y: 0 },
//     viewport: { once: false, amount: 0.2 },
//     transition: { duration: 0.6, ease: "easeOut" as Easing }
//   };

//   return (
//     <main className={`min-h-screen bg-white dark:bg-dark-bg text-gray-900 dark:text-gray-100 selection:bg-brand-blue selection:text-white transition-colors duration-300 relative overflow-x-hidden ${mobileVibeActive ? "ring-4 ring-brand-purple/40" : ""}`}>
      
//       {/* Scroll Progress Indicator Bar */}
//       <motion.div
//         style={{ scaleX: scrollYProgress }}
//         className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-blue via-brand-purple to-brand-green z-50 origin-left"
//       />

//       {/* Floating Cursor-Following AI Bot Companion (Hidden on touch devices) */}
//       <motion.div
//         className="fixed pointer-events-none z-50 hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md border border-brand-purple/30 shadow-lg text-brand-purple text-xs font-semibold"
//         animate={{
//           x: mousePosition.x + 18,
//           y: mousePosition.y + 18,
//         }}
//         transition={{
//           type: "spring",
//           damping: 25,
//           stiffness: 250,
//           mass: 0.2,
//         }}
//       >
//         <div className="w-5 h-5 rounded-full bg-brand-purple/15 flex items-center justify-center text-brand-purple animate-pulse">
//           <Bot className="w-3.5 h-3.5" />
//         </div>
//         <span>gleamBot Active</span>
//         <Sparkles className="w-3 h-3 text-brand-purple" />
//       </motion.div>

//       {/* Mobile Crazy Feature Floating Bar (Visible on mobile screens) */}
//       <div className="lg:hidden fixed top-4 right-4 z-40">
//         <motion.button
//           whileTap={{ scale: 0.9 }}
//           onClick={() => setMobileVibeActive(!mobileVibeActive)}
//           className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-brand-purple to-brand-blue text-white text-xs font-bold shadow-lg shadow-brand-purple/30 border border-white/20"
//         >
//           <Smartphone className="w-4 h-4 animate-bounce" />
//           <span>{mobileVibeActive ? "Mobile Vibe: Ultra" : "Mobile Vibe"}</span>
//           <Zap className="w-3 h-3 text-yellow-300 animate-pulse" />
//         </motion.button>
//       </div>

//       {/* Navigation Header */}
//       <Navbar />

//       {/* Hero Section */}
//       <motion.div {...sectionTransition}>
//         <Hero />
//       </motion.div>

//       {/* Upload-to-Learn Pipeline Section */}
//       <motion.div {...sectionTransition}>
//         <UploadPipeline />
//       </motion.div>

//       {/* AI Tutor Section */}
//       <motion.div {...sectionTransition}>
//         <Tutor />
//       </motion.div>

//       {/* Bento Grid Features Section */}
//       <motion.div {...sectionTransition}>
//         <BentoFeatures />
//       </motion.div>

//       {/* Gamification & Streaks Section */}
//       <motion.div {...sectionTransition}>
//         <GamificationSection />
//       </motion.div>

//       {/* Pricing & CTA Signup Section */}
//       <motion.div {...sectionTransition}>
//         <PricingSection />
//       </motion.div>

//       {/* Real Footer Section */}
//       <motion.div {...sectionTransition}>
//         <Footer />
//       </motion.div>

//       {/* Go Up / Scroll to Top Floating Action Button */}
//       <AnimatePresence>
//         {showScrollTop && (
//           <motion.button
//             initial={{ opacity: 0, scale: 0.5, y: 20 }}
//             animate={{ opacity: 1, scale: 1, y: 0 }}
//             exit={{ opacity: 0, scale: 0.5, y: 20 }}
//             whileHover={{ scale: 1.1 }}
//             whileTap={{ scale: 0.9 }}
//             onClick={scrollToTop}
//             className="fixed bottom-6 right-6 z-40 p-3.5 rounded-2xl bg-brand-blue text-white shadow-xl shadow-brand-blue/30 flex items-center justify-center border border-white/20 transition-all"
//             aria-label="Scroll to top"
//           >
//             <ArrowUp className="w-5 h-5" />
//           </motion.button>
//         )}
//       </AnimatePresence>

//     </main>
//   );
// }


"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, ArrowUp, Sparkles, Smartphone, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import UploadPipeline from "@/components/UploadPipeline";
import Tutor from "@/components/Tutor";
import BentoFeatures from "@/components/BentoFeatures";
import GamificationSection from "@/components/GamificationSection";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mobileVibeActive, setMobileVibeActive] = useState(false);

  // Track mouse position smoothly for the floating AI bot assistant on desktop
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Track scroll position to toggle visibility of the "Go Up" button with passive listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className={`min-h-screen bg-white dark:bg-dark-bg text-gray-900 dark:text-gray-100 selection:bg-brand-blue selection:text-white transition-colors duration-300 relative overflow-x-hidden ${mobileVibeActive ? "ring-4 ring-brand-purple/40" : ""}`}>
      
      {/* Floating Cursor-Following AI Bot Companion (Hidden on touch devices) */}
      <motion.div
        className="fixed pointer-events-none z-50 hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md border border-brand-purple/30 shadow-lg text-brand-purple text-xs font-semibold"
        animate={{
          x: mousePosition.x + 18,
          y: mousePosition.y + 18,
        }}
        transition={{
          type: "spring",
          damping: 30,
          stiffness: 300,
          mass: 0.1,
        }}
      >
        <div className="w-5 h-5 rounded-full bg-brand-purple/15 flex items-center justify-center text-brand-purple animate-pulse">
          <Bot className="w-3.5 h-3.5" />
        </div>
        <span>gleamBot Active</span>
        <Sparkles className="w-3 h-3 text-brand-purple" />
      </motion.div>

      {/* Mobile Crazy Feature Floating Bar (Visible on mobile screens) */}
      <div className="lg:hidden fixed top-4 right-4 z-40">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setMobileVibeActive(!mobileVibeActive)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-brand-purple to-brand-blue text-white text-xs font-bold shadow-lg shadow-brand-purple/30 border border-white/20"
        >
          <Smartphone className="w-4 h-4 animate-bounce" />
          <span>{mobileVibeActive ? "Mobile Vibe: Ultra" : "Mobile Vibe"}</span>
          <Zap className="w-3 h-3 text-yellow-300 animate-pulse" />
        </motion.button>
      </div>

      {/* Navigation Header */}
      <Navbar />

      {/* Main Page Sections rendered directly for native fluid scrolling performance */}
      <Hero />
      <UploadPipeline />
      <Tutor />
      <BentoFeatures />
      <GamificationSection />
      <PricingSection />
      <Footer />

      {/* Go Up / Scroll to Top Floating Action Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-40 p-3.5 rounded-2xl bg-brand-blue text-white shadow-xl shadow-brand-blue/30 flex items-center justify-center border border-white/20 transition-all"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

    </main>
  );
}