// "use client";

// import React, { useState, useEffect } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { BookOpen, Menu, X, ArrowRight, Sun, Moon, Sparkles, Bot } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";


// export default function Navbar() {
//   const [scrolled, setScrolled] = useState(false);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [darkMode, setDarkMode] = useState(true);

//   // Initialize and toggle dark/light mode class on the document root
//   useEffect(() => {
//     const isDark = document.documentElement.classList.contains("dark") || 
//                    localStorage.getItem("theme") === "dark" || 
//                    (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
    
//     setDarkMode(isDark);
//     if (isDark) {
//       document.documentElement.classList.add("dark");
//     } else {
//       document.documentElement.classList.remove("dark");
//     }
//   }, []);

//   const toggleTheme = () => {
//     if (darkMode) {
//       document.documentElement.classList.remove("dark");
//       localStorage.setItem("theme", "light");
//       setDarkMode(false);
//     } else {
//       document.documentElement.classList.add("dark");
//       localStorage.setItem("theme", "dark");
//       setDarkMode(true);
//     }
//   };

//   // Add background blur on window scroll for glassmorphism effect
//   useEffect(() => {
//     const handleScroll = () => {
//       if (window.scrollY > 20) {
//         setScrolled(true);
//       } else {
//         setScrolled(false);
//       }
//     };
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   return (
//     <>
//       <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 sm:px-6 lg:px-8 pt-4 pointer-events-none">
//         <motion.div
//           initial={{ y: -20, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           transition={{ duration: 0.5, ease: "easeOut" }}
//           className={`w-full max-w-7xl pointer-events-auto transition-all duration-300 rounded-2xl ${
//             scrolled
//               ? "bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md shadow-lg shadow-black/5 dark:shadow-black/20 border border-gray-200/80 dark:border-white/10 py-3 px-6"
//               : "bg-white/60 dark:bg-[#0B0F19]/60 backdrop-blur-sm border border-gray-200/50 dark:border-white/5 py-4 px-6"
//           }`}
//         >
//           <div className="flex items-center justify-between">
            
//             {/* Brand Logo */}
//             <Link href="/" className="flex items-center gap-2.5 group">
//               <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-brand-blue/20 group-hover:scale-105 transition-transform relative border border-gray-200/50 dark:border-white/10">
//                 <Image 
//                   src="/gleamlearn-logo.jpg" 
//                   alt="gleamLearn Logo" 
//                   fill 
//                   sizes="40px"
//                   className="object-cover"
//                   priority 
//                 />
//               </div>
//               <div className="flex flex-col">
//                 <span className="text-lg font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-1">
//                   gleam<span className="text-brand-blue">Learn</span>
//                   <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></span>
//                 </span>
//               </div>
//             </Link>

//             {/* Desktop Navigation Links */}
//             <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-gray-600 dark:text-gray-300">
//               <Link href="#features" className="hover:text-brand-blue dark:hover:text-white transition-colors">
//                 Features
//               </Link>
//               <Link href="#pipeline" className="hover:text-brand-blue dark:hover:text-white transition-colors flex items-center gap-1">
//                 <BookOpen className="w-4 h-4 text-brand-purple" /> Upload-to-Learn
//               </Link>
//               <Link href="#tutor" className="hover:text-brand-blue dark:hover:text-white transition-colors">
//                 AI Tutor
//               </Link>
//               <Link href="#gamification" className="hover:text-brand-blue dark:hover:text-white transition-colors">
//                 Streaks & XP
//               </Link>
//               <Link href="#pricing" className="hover:text-brand-blue dark:hover:text-white transition-colors">
//                 Pricing
//               </Link>
//             </nav>

//             {/* Action Buttons & Theme Toggle (Desktop) */}
//             <div className="hidden lg:flex items-center gap-3">
//               <motion.button
//                 whileTap={{ scale: 0.9 }}
//                 whileHover={{ scale: 1.05 }}
//                 onClick={toggleTheme}
//                 className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-dark-card border border-gray-200 dark:border-dark-border flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-brand-blue dark:hover:text-white transition-colors shadow-sm"
//                 aria-label="Toggle Theme"
//               >
//                 {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
//               </motion.button>

//               <Link
//                 href="#signup"
//                 className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 transition-colors"
//               >
//                 Sign In
//               </Link>
//               <Link
//                 href="#signup"
//                 className="relative group overflow-hidden rounded-xl p-[1px] font-semibold text-sm shadow-md shadow-brand-blue/20"
//               >
//                 <span className="absolute inset-0 bg-gradient-to-r from-brand-blue via-brand-purple to-brand-green animate-gradient-shift"></span>
//                 <span className="relative px-4 py-2 rounded-[11px] bg-white dark:bg-dark-bg text-gray-900 dark:text-white flex items-center gap-2 transition-all group-hover:bg-opacity-90 dark:group-hover:bg-opacity-0">
//                   Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
//                 </span>
//               </Link>
//             </div>

//             {/* Mobile & Tablet Right Controls: Theme Toggle & Hamburger Button (Visible on md, sm screens) */}
//             <div className="flex lg:hidden items-center gap-2">
//               <button
//                 onClick={toggleTheme}
//                 className="text-gray-700 dark:text-gray-300 p-2 rounded-xl bg-gray-100 dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm"
//                 aria-label="Toggle Theme"
//               >
//                 {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
//               </button>

//               <motion.button
//                 whileTap={{ scale: 0.9 }}
//                 onClick={() => setMobileMenuOpen(true)}
//                 className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2.5 rounded-xl bg-gray-100 dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm flex items-center justify-center"
//                 aria-label="Open Menu"
//               >
//                 <Menu className="w-6 h-6" />
//               </motion.button>
//             </div>

//           </div>
//         </motion.div>
//       </header>

//       {/* Animated Pro Sidebar & Backdrop Overlay for md, sm screens */}
//       <AnimatePresence>
//         {mobileMenuOpen && (
//           <div className="fixed inset-0 z-50 flex lg:hidden">
            
//             {/* Backdrop with heavy blur and click-to-close */}
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               transition={{ duration: 0.3 }}
//               onClick={() => setMobileMenuOpen(false)}
//               className="fixed inset-0 bg-black/60 backdrop-blur-md"
//             />

//             {/* Sliding Animated Sidebar (Right Side Panel) */}
//             <motion.div
//               initial={{ x: "100%" }}
//               animate={{ x: 0 }}
//               exit={{ x: "100%" }}
//               transition={{ type: "spring", damping: 25, stiffness: 220 }}
//               className="relative ml-auto w-full max-w-sm h-full bg-white dark:bg-[#111827] shadow-2xl border-l border-gray-200 dark:border-dark-border flex flex-col justify-between p-6 z-10 overflow-y-auto"
//               onClick={(e) => e.stopPropagation()}
//             >
              
//               {/* Sidebar Header: Logo & Cancel Button */}
//               <div>
//                 <div className="flex items-center justify-between pb-6 border-b border-gray-200 dark:border-dark-border">
//                   <div className="flex items-center gap-2.5">
//                     <div className="w-9 h-9 rounded-xl overflow-hidden shadow-md shadow-brand-blue/20 relative border border-gray-200/50 dark:border-white/10">
//                       <Image 
//                         src="/gleamlearn-logo.jpg" 
//                         alt="gleamLearn Logo" 
//                         fill 
//                         sizes="36px"
//                         className="object-cover"
//                       />
//                     </div>
//                     <span className="text-lg font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-1">
//                       gleam<span className="text-brand-blue">Learn</span>
//                     </span>
//                   </div>

//                   {/* Cancel / Close Button */}
//                   <motion.button
//                     whileTap={{ scale: 0.9 }}
//                     onClick={() => setMobileMenuOpen(false)}
//                     className="p-2.5 rounded-xl bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-dark-border shadow-sm flex items-center justify-center"
//                     aria-label="Close Menu"
//                   >
//                     <X className="w-5 h-5" />
//                   </motion.button>
//                 </div>

//                 {/* Sidebar Navigation Links */}
//                 <nav className="py-6 flex flex-col space-y-2 font-medium text-gray-700 dark:text-gray-200">
//                   <Link
//                     href="#features"
//                     onClick={() => setMobileMenuOpen(false)}
//                     className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-base font-semibold"
//                   >
//                     <Sparkles className="w-5 h-5 text-brand-purple" />
//                     <span>Features Bento</span>
//                   </Link>
//                   <Link
//                     href="#pipeline"
//                     onClick={() => setMobileMenuOpen(false)}
//                     className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-base font-semibold"
//                   >
//                     <BookOpen className="w-5 h-5 text-brand-blue" />
//                     <span>Upload-to-Learn</span>
//                   </Link>
//                   <Link
//                     href="#tutor"
//                     onClick={() => setMobileMenuOpen(false)}
//                     className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-base font-semibold"
//                   >
//                     <Bot className="w-5 h-5 text-brand-green" />
//                     <span>AI Tutor & Classroom</span>
//                   </Link>
//                   <Link
//                     href="#gamification"
//                     onClick={() => setMobileMenuOpen(false)}
//                     className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-base font-semibold"
//                   >
//                     <span className="w-5 h-5 rounded-full bg-brand-orange/20 text-brand-orange flex items-center justify-center font-bold text-xs">XP</span>
//                     <span>Streaks & Leaderboard</span>
//                   </Link>
//                   <Link
//                     href="#pricing"
//                     onClick={() => setMobileMenuOpen(false)}
//                     className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-base font-semibold"
//                   >
//                     <span className="w-5 h-5 rounded-full bg-brand-blue/20 text-brand-blue flex items-center justify-center font-bold text-xs">₦</span>
//                     <span>Pricing Plans</span>
//                   </Link>
//                 </nav>
//               </div>

//               {/* Sidebar Footer Actions */}
//               <div className="pt-6 border-t border-gray-200 dark:border-dark-border flex flex-col gap-3">
//                 <Link
//                   href="#signup"
//                   onClick={() => setMobileMenuOpen(false)}
//                   className="w-full text-center py-3 rounded-xl bg-gray-100 dark:bg-dark-card text-gray-800 dark:text-white font-semibold border border-gray-200 dark:border-dark-border text-sm shadow-sm"
//                 >
//                   Sign In
//                 </Link>
//                 <Link
//                   href="#signup"
//                   onClick={() => setMobileMenuOpen(false)}
//                   className="w-full text-center py-3.5 rounded-xl bg-brand-blue text-white font-bold shadow-lg shadow-brand-blue/30 text-sm flex items-center justify-center gap-2"
//                 >
//                   Get Started Free <ArrowRight className="w-4 h-4" />
//                 </Link>
//               </div>

//             </motion.div>

//           </div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// }




"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Menu, X, ArrowRight, Sun, Moon, Sparkles, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Initialize and toggle dark/light mode class on the document root (Default to light)
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const isDark = savedTheme === "dark" || 
                   (!savedTheme && document.documentElement.classList.contains("dark"));
    
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDarkMode(true);
    }
  };

  // Add background blur on window scroll for glassmorphism effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 sm:px-6 lg:px-8 pt-4 pointer-events-none">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`w-full max-w-7xl pointer-events-auto transition-all duration-300 rounded-2xl ${
            scrolled
              ? "bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md shadow-lg shadow-black/5 dark:shadow-black/20 border border-gray-200/80 dark:border-white/10 py-3 px-6"
              : "bg-white/60 dark:bg-[#0B0F19]/60 backdrop-blur-sm border border-gray-200/50 dark:border-white/5 py-4 px-6"
          }`}
        >
          <div className="flex items-center justify-between">
            
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-brand-blue/20 group-hover:scale-105 transition-transform relative border border-gray-200/50 dark:border-white/10">
                <Image 
                  src="/gleamlearn-logo.jpg" 
                  alt="gleamLearn Logo" 
                  fill 
                  sizes="40px"
                  className="object-cover"
                  priority 
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-1">
                  gleam<span className="text-brand-blue">Learn</span>
                  <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></span>
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-gray-600 dark:text-gray-300">
              <Link href="#features" className="hover:text-brand-blue dark:hover:text-white transition-colors">
                Features
              </Link>
              <Link href="#pipeline" className="hover:text-brand-blue dark:hover:text-white transition-colors flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-brand-purple" /> Upload-to-Learn
              </Link>
              <Link href="#tutor" className="hover:text-brand-blue dark:hover:text-white transition-colors">
                AI Tutor
              </Link>
              <Link href="#gamification" className="hover:text-brand-blue dark:hover:text-white transition-colors">
                Streaks & XP
              </Link>
              <Link href="#pricing" className="hover:text-brand-blue dark:hover:text-white transition-colors">
                Pricing
              </Link>
            </nav>

            {/* Action Buttons & Theme Toggle (Desktop) */}
            <div className="hidden lg:flex items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                onClick={toggleTheme}
                className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-dark-card border border-gray-200 dark:border-dark-border flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-brand-blue dark:hover:text-white transition-colors shadow-sm"
                aria-label="Toggle Theme"
              >
                {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
              </motion.button>

              <Link
                href="#signup"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="#signup"
                className="relative group overflow-hidden rounded-xl p-[1px] font-semibold text-sm shadow-md shadow-brand-blue/20"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-brand-blue via-brand-purple to-brand-green animate-gradient-shift"></span>
                <span className="relative px-4 py-2 rounded-[11px] bg-white dark:bg-dark-bg text-gray-900 dark:text-white flex items-center gap-2 transition-all group-hover:bg-opacity-90 dark:group-hover:bg-opacity-0">
                  Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>

            {/* Mobile & Tablet Right Controls: Theme Toggle & Hamburger Button */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={toggleTheme}
                className="text-gray-700 dark:text-gray-300 p-2 rounded-xl bg-gray-100 dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm"
                aria-label="Toggle Theme"
              >
                {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
              </button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileMenuOpen(true)}
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2.5 rounded-xl bg-gray-100 dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm flex items-center justify-center"
                aria-label="Open Menu"
              >
                <Menu className="w-6 h-6" />
              </motion.button>
            </div>

          </div>
        </motion.div>
      </header>

      {/* Animated Pro Sidebar & Backdrop Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            
            {/* Backdrop with heavy blur and click-to-close */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Sliding Animated Sidebar (Right Side Panel) */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative ml-auto w-full max-w-sm h-full bg-white dark:bg-[#111827] shadow-2xl border-l border-gray-200 dark:border-dark-border flex flex-col justify-between p-6 z-10 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* Sidebar Header: Logo & Cancel Button */}
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-gray-200 dark:border-dark-border">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl overflow-hidden shadow-md shadow-brand-blue/20 relative border border-gray-200/50 dark:border-white/10">
                      <Image 
                        src="/gleamlearn-logo.jpg" 
                        alt="gleamLearn Logo" 
                        fill 
                        sizes="36px"
                        className="object-cover"
                      />
                    </div>
                    <span className="text-lg font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-1">
                      gleam<span className="text-brand-blue">Learn</span>
                    </span>
                  </div>

                  {/* Cancel / Close Button */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-dark-border shadow-sm flex items-center justify-center"
                    aria-label="Close Menu"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Sidebar Navigation Links */}
                <nav className="py-6 flex flex-col space-y-2 font-medium text-gray-700 dark:text-gray-200">
                  <Link
                    href="#features"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-base font-semibold"
                  >
                    <Sparkles className="w-5 h-5 text-brand-purple" />
                    <span>Features Bento</span>
                  </Link>
                  <Link
                    href="#pipeline"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-base font-semibold"
                  >
                    <BookOpen className="w-5 h-5 text-brand-blue" />
                    <span>Upload-to-Learn</span>
                  </Link>
                  <Link
                    href="#tutor"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-base font-semibold"
                  >
                    <Bot className="w-5 h-5 text-brand-green" />
                    <span>AI Tutor & Classroom</span>
                  </Link>
                  <Link
                    href="#gamification"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-base font-semibold"
                  >
                    <span className="w-5 h-5 rounded-full bg-brand-orange/20 text-brand-orange flex items-center justify-center font-bold text-xs">XP</span>
                    <span>Streaks & Leaderboard</span>
                  </Link>
                  <Link
                    href="#pricing"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-base font-semibold"
                  >
                    <span className="w-5 h-5 rounded-full bg-brand-blue/20 text-brand-blue flex items-center justify-center font-bold text-xs">₦</span>
                    <span>Pricing Plans</span>
                  </Link>
                </nav>
              </div>

              {/* Sidebar Footer Actions */}
              <div className="pt-6 border-t border-gray-200 dark:border-dark-border flex flex-col gap-3">
                <Link
                  href="#signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-xl bg-gray-100 dark:bg-dark-card text-gray-800 dark:text-white font-semibold border border-gray-200 dark:border-dark-border text-sm shadow-sm"
                >
                  Sign In
                </Link>
                <Link
                  href="#signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3.5 rounded-xl bg-brand-blue text-white font-bold shadow-lg shadow-brand-blue/30 text-sm flex items-center justify-center gap-2"
                >
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </motion.div>

          </div>
        )}
      </AnimatePresence>
    </>
  );
}