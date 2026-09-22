// "use client";

// import React, { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
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

//   // Track mouse position smoothly for the floating AI bot assistant on desktop
//   useEffect(() => {
//     const handleMouseMove = (e: MouseEvent) => {
//       setMousePosition({ x: e.clientX, y: e.clientY });
//     };

//     window.addEventListener("mousemove", handleMouseMove, { passive: true });
//     return () => window.removeEventListener("mousemove", handleMouseMove);
//   }, []);

//   // Track scroll position to toggle visibility of the "Go Up" button with passive listener
//   useEffect(() => {
//     const handleScroll = () => {
//       if (window.scrollY > 400) {
//         setShowScrollTop(true);
//       } else {
//         setShowScrollTop(false);
//       }
//     };

//     window.addEventListener("scroll", handleScroll, { passive: true });
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   const scrollToTop = () => {
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   return (
//     <main className={`min-h-screen bg-white dark:bg-dark-bg text-gray-900 dark:text-gray-100 selection:bg-brand-blue selection:text-white transition-colors duration-300 relative overflow-x-hidden ${mobileVibeActive ? "ring-4 ring-brand-purple/40" : ""}`}>
      
//       {/* Floating Cursor-Following AI Bot Companion (Hidden on touch devices) */}
//       <motion.div
//         className="fixed pointer-events-none z-50 hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md border border-brand-purple/30 shadow-lg text-brand-purple text-xs font-semibold"
//         animate={{
//           x: mousePosition.x + 18,
//           y: mousePosition.y + 18,
//         }}
//         transition={{
//           type: "spring",
//           damping: 30,
//           stiffness: 300,
//           mass: 0.1,
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

//       {/* Main Page Sections rendered directly for native fluid scrolling performance */}
//       <Hero />
//       <UploadPipeline />
//       <Tutor />
//       <BentoFeatures />
//       <GamificationSection />
//       <PricingSection />
//       <Footer />

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



// "use client";

// import React, { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Bot, ArrowUp, Sparkles, Smartphone, Zap } from "lucide-react";
// import Navbar from "@/components/Navbar";
// import Hero from "@/components/Hero";
// import UploadPipeline from "@/components/UploadPipeline";
// import Tutor from "@/components/Tutor";
// import BentoFeatures from "@/components/BentoFeatures";
// import Interactive3DShowcase from "@/components/Interactive3DShowcase"; // <-- Imported 3D showcase component
// import GamificationSection from "@/components/GamificationSection";
// import PricingSection from "@/components/PricingSection";
// import Footer from "@/components/Footer";

// export default function Home() {
//   const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
//   const [showScrollTop, setShowScrollTop] = useState(false);
//   const [mobileVibeActive, setMobileVibeActive] = useState(false);

//   // Track mouse position smoothly for the floating AI bot assistant on desktop
//   useEffect(() => {
//     const handleMouseMove = (e: MouseEvent) => {
//       setMousePosition({ x: e.clientX, y: e.clientY });
//     };

//     window.addEventListener("mousemove", handleMouseMove, { passive: true });
//     return () => window.removeEventListener("mousemove", handleMouseMove);
//   }, []);

//   // Track scroll position to toggle visibility of the "Go Up" button with passive listener
//   useEffect(() => {
//     const handleScroll = () => {
//       if (window.scrollY > 400) {
//         setShowScrollTop(true);
//       } else {
//         setShowScrollTop(false);
//       }
//     };

//     window.addEventListener("scroll", handleScroll, { passive: true });
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   const scrollToTop = () => {
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   return (
//     <main className={`min-h-screen bg-white dark:bg-dark-bg text-gray-900 dark:text-gray-100 selection:bg-brand-blue selection:text-white transition-colors duration-300 relative overflow-x-hidden ${mobileVibeActive ? "ring-4 ring-brand-purple/40" : ""}`}>
      
//       {/* Floating Cursor-Following AI Bot Companion (Hidden on touch devices) */}
//       <motion.div
//         className="fixed pointer-events-none z-50 hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md border border-brand-purple/30 shadow-lg text-brand-purple text-xs font-semibold"
//         animate={{
//           x: mousePosition.x + 18,
//           y: mousePosition.y + 18,
//         }}
//         transition={{
//           type: "spring",
//           damping: 30,
//           stiffness: 300,
//           mass: 0.1,
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

//       {/* Main Page Sections rendered directly for native fluid scrolling performance */}
//       <Hero />
//       <UploadPipeline />
//       <Tutor />
//       <BentoFeatures />
      
//       {/* Immersive 3D Interactive Model Showcase */}
//       <Interactive3DShowcase />

//       <GamificationSection />
//       <PricingSection />
//       <Footer />

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
import dynamic from "next/dynamic";
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

// Dynamically import the 3D Showcase component with SSR completely disabled.
// This prevents Next.js from attempting to initialize WebGL and Three.js 
// inside the Node.js server environment during compilation/hydration.
const Interactive3DShowcase = dynamic(
  () => import("@/components/Interactive3DShowcase"),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[500px] flex items-center justify-center bg-gray-50 dark:bg-dark-card/50">
        <div className="text-sm text-brand-purple animate-pulse font-medium">
          Loading 3D Experience...
        </div>
      </div>
    ),
  }
);

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
      
      {/* Immersive 3D Interactive Model Showcase (Client-Side Only via dynamic import) */}
      <Interactive3DShowcase />

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