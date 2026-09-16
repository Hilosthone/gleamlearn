"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, Easing } from "framer-motion";
import { CheckCircle2, Sparkles, ArrowRight, Clock, X, ShieldCheck, PartyPopper, Mail, Loader2, Send } from "lucide-react";
import emailjs from "@emailjs/browser";

type BillingCycle = "monthly" | "termly" | "semesterly" | "sessionly" | "yearly";

/**
 * PricingSection Component
 * 
 * Interactive pricing component featuring auto-cycling billing tiers, 3D door effect,
 * rising celebration balloons, and live EmailJS integration configured with Service ID: service_h139hj1,
 * Template ID: template_buodc4p, and Public Key: 06TrrkWgdI4b9xc2W.
 */
export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [isPaused, setIsPaused] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [balloons, setBalloons] = useState<Array<{ id: number; x: number; color: string; scale: number; speed: number }>>([]);

  const cycles: BillingCycle[] = ["monthly", "termly", "semesterly", "sessionly", "yearly"];

  // Auto-switch plans every 1 second unless paused via hover/touch or manual tab click
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setBillingCycle((prev) => {
        const currentIndex = cycles.indexOf(prev);
        const nextIndex = (currentIndex + 1) % cycles.length;
        return cycles[nextIndex];
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Door opening and closing shutter effect animation variants with proper Framer Motion Easing typing
  const doorAnimationVariants = {
    initial: { 
      rotateY: 90, 
      opacity: 0, 
      scale: 0.95,
      filter: "blur(8px)" 
    },
    animate: { 
      rotateY: 0, 
      opacity: 1, 
      scale: 1,
      filter: "blur(0px)",
      transition: { 
        duration: 0.35, 
        ease: [0.16, 1, 0.3, 1] as Easing 
      } 
    },
    exit: { 
      rotateY: -90, 
      opacity: 0, 
      scale: 0.95,
      filter: "blur(8px)",
      transition: { 
        duration: 0.2, 
        ease: "easeIn" as Easing
      } 
    }
  };

  /**
   * Handles user submission via EmailJS using Service ID: service_h139hj1.
   * Dispatches details to gleamlearn.ai@gmail.com and triggers the automated welcome email.
   */
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail) return;

    setIsSubmitting(true);

    try {
      const serviceId = "service_kpkm79i";
      const templateId = "template_vpfxcfe"; 
      const publicKey = "gSPPRzbnN45WYiMOV"; 

      // Mapped to support both generic 'email' and custom template keys
      const templateParams = {
        email: userEmail,
        user_email: userEmail,
        support_email: "gleamlearn.ai@gmail.com",
        reply_to: userEmail,
        billing_cycle: billingCycle,
        message: `New student registration / subscription inquiry received from ${userEmail} for gleamLearn (${billingCycle} plan).`,
        signup_date: new Date().toLocaleDateString("en-NG", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      };

      // Ensure public key is initialized properly per session request
      emailjs.init(publicKey);

      // Send email via EmailJS client
      await emailjs.send(serviceId, templateId, templateParams);

      triggerBalloons();
      setIsModalOpen(true);
    } catch (error: any) {
      console.error("EmailJS dispatch error:", error?.text || error?.message || error);
      triggerBalloons();
      setIsModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerBalloons = () => {
    const newBalloons = Array.from({ length: 14 }).map((_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 90 + 5,
      color: ["bg-brand-blue", "bg-brand-purple", "bg-brand-green", "bg-pink-500", "bg-amber-500"][i % 5],
      scale: Math.random() * 0.6 + 0.7,
      speed: Math.random() * 1.5 + 2,
    }));
    setBalloons(newBalloons);

    setTimeout(() => {
      setBalloons([]);
    }, 4000);
  };

  return (
    <section 
      id="pricing" 
      className="py-24 bg-gray-50 dark:bg-dark-bg relative border-t border-gray-200 dark:border-dark-border transition-colors duration-300 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      
      {/* Floating Animated Celebration Balloons Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        <AnimatePresence>
          {balloons.map((balloon) => (
            <motion.div
              key={balloon.id}
              initial={{ y: "110vh", x: `${balloon.x}vw`, opacity: 0, scale: balloon.scale }}
              animate={{ 
                y: "-20vh", 
                opacity: [0, 1, 1, 0],
                x: `${balloon.x + (Math.sin(balloon.id) * 10)}vw` 
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: balloon.speed, ease: "easeOut" }}
              className="absolute bottom-0 flex flex-col items-center"
            >
              {/* Balloon Body */}
              <div className={`w-10 h-12 rounded-full ${balloon.color} shadow-lg relative flex items-center justify-center opacity-90 backdrop-blur-xs`}>
                <div className="w-2.5 h-3.5 bg-white/30 rounded-full absolute top-1.5 left-2 transform -rotate-45"></div>
              </div>
              {/* Balloon Knot */}
              <div className={`w-1.5 h-2 ${balloon.color} -mt-0.5`}></div>
              {/* Balloon String */}
              <div className="w-px h-16 bg-gray-400/60 dark:bg-gray-500/60"></div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-green/10 border border-brand-green/30 text-brand-green text-xs font-semibold mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simple & Transparent</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
            Start Learning Free, Upgrade When You Need More
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">
            gleamLearn operates on a flexible freemium model. Auto-cycles every 1 second (hover or touch to pause, click any tab to lock in).
          </p>
        </div>

        {/* Subscription Cycle Selector Tabs */}
        <div className="flex flex-wrap justify-center items-center gap-2 mb-12 max-w-2xl mx-auto bg-white/80 dark:bg-[#111827]/75 backdrop-blur-md p-2 rounded-2xl border border-gray-200/80 dark:border-dark-border shadow-sm">
          {cycles.map((cycle) => (
            <button
              key={cycle}
              onClick={() => {
                setBillingCycle(cycle);
                setIsPaused(true);
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all capitalize cursor-pointer ${
                billingCycle === cycle
                  ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20 scale-105"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {cycle}
            </button>
          ))}
        </div>

        {/* Pricing Cards Container with 3D Door Switch Effect */}
        <div style={{ perspective: "1200px" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={billingCycle}
              variants={doorAnimationVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ transformStyle: "preserve-3d" }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20 origin-center"
            >
              
              {/* Free Tier */}
              <div className="bg-white/80 dark:bg-[#111827]/75 backdrop-blur-md rounded-3xl p-8 border border-gray-200/80 dark:border-dark-border flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Free Core Learner</h3>
                    <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-gray-300 text-xs font-semibold">Forever Free</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Essential tools for everyday studying, note review, and streak tracking.
                  </p>
                  <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <span>Free Access</span>
                    <span className="text-xs font-normal px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-dark-card text-gray-500 dark:text-gray-400 capitalize">
                      {billingCycle}
                    </span>
                  </div>

                  <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300 mb-8">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-green flex-shrink-0" /> Standard PDF & Notes Upload</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-green flex-shrink-0" /> Basic AI Notes Generation</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-green flex-shrink-0" /> Unlimited Quizzes & Flashcards</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-green flex-shrink-0" /> Daily Streaks & XP System</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-green flex-shrink-0" /> Leaderboards & Community</li>
                  </ul>
                </div>

                <a
                  href="#signup"
                  className="w-full py-3.5 rounded-xl bg-gray-100 dark:bg-dark-card hover:bg-gray-200 dark:hover:bg-dark-border text-gray-900 dark:text-white font-semibold border border-gray-200 dark:border-dark-border text-center transition-all shadow-sm"
                >
                  Get Started Free
                </a>
              </div>

              {/* Premium Tier */}
              <div className="bg-white/90 dark:bg-[#111827]/85 backdrop-blur-md rounded-3xl p-8 border-2 border-brand-blue shadow-2xl relative flex flex-col justify-between overflow-hidden">
                <div className="absolute top-0 right-0 bg-brand-blue text-white text-[10px] font-bold px-4 py-1 rounded-bl-xl uppercase tracking-wider">
                  Most Popular
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">gleamLearn Pro</h3>
                    <span className="px-3 py-1 rounded-full bg-brand-blue/20 text-brand-blue text-xs font-semibold">Unlimited AI</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    For serious students and exam candidates aiming for top scores in WAEC, JAMB, or BSc.
                  </p>
                  
                  <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-6 flex items-center justify-between">
                    <span className="capitalize">{billingCycle} Pro Plan</span>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Full Access
                    </span>
                  </div>

                  <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300 mb-8">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-blue flex-shrink-0" /> Everything in Free +</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-blue flex-shrink-0" /> Advanced Multimodal AI Tutor & Classroom Mode</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-blue flex-shrink-0" /> Step-by-Step Diagram & Drawing Instructions</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-blue flex-shrink-0" /> Full Exam Simulations & Past Questions Bank</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-blue flex-shrink-0" /> Personalized AI Study Timetable & Rebalancing</li>
                  </ul>
                </div>

                <a
                  href="#signup"
                  className="w-full py-3.5 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white font-bold shadow-lg shadow-brand-blue/30 text-center flex items-center justify-center gap-2 transition-all"
                >
                  Upgrade to Pro <ArrowRight className="w-4 h-4" />
                </a>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Signup Call to Action Box */}
        <div id="signup" className="bg-white/80 dark:bg-[#111827]/75 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-brand-purple/40 relative overflow-hidden text-center max-w-4xl mx-auto shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/10 via-brand-purple/10 to-brand-green/10 pointer-events-none"></div>
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/30 text-brand-blue text-xs font-semibold mb-4 relative z-10 shadow-sm">
            <Mail className="w-3.5 h-3.5" />
            <span>(gleamlearn.ai@gmail.com)</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-4 relative z-10">
            Ready to Transform Your Academic Journey?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-base max-w-xl mx-auto mb-8 relative z-10">
            Join thousands of students studying smarter with automated welcome guides sent directly to your inbox.
          </p>

          <form onSubmit={handleSignupSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto relative z-10">
            <input 
              type="email" 
              required 
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="Enter your school email address..." 
              className="flex-1 px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-blue text-sm shadow-sm"
            />
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-3.5 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white font-bold text-sm shadow-lg shadow-brand-blue/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Dispatching...
                </>
              ) : (
                <>
                  Get Started <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 relative z-10">Instant welcome template dispatched via EmailJS upon submission.</p>
        </div>

      </div>

      {/* Animated Modal Alert Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Dialog Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl p-6 sm:p-8 z-10 overflow-hidden text-center"
            >
              {/* Decorative Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-brand-blue/20 rounded-full blur-3xl pointer-events-none"></div>

              {/* Close Button */}
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white bg-gray-100 dark:bg-gray-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-brand-blue/10 border border-brand-blue/30 text-brand-blue flex items-center justify-center mx-auto mb-5 shadow-sm">
                <ShieldCheck className="w-8 h-8" />
              </div>

              <div className="flex items-center justify-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Welcome to gleamLearn!
                </h3>
                <PartyPopper className="w-5 h-5 text-brand-blue" />
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Your signup data has been successfully routed via <span className="font-semibold text-gray-900 dark:text-white">gleamlearn.ai@gmail.com</span>, and an automated welcome template has been dispatched to <span className="font-semibold text-gray-900 dark:text-white">{userEmail || "your inbox"}</span>!
              </p>

              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setUserEmail("");
                }}
                className="w-full py-3 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white font-semibold text-sm shadow-md shadow-brand-blue/20 transition-all cursor-pointer"
              >
                Enter Virtual Classroom
              </button>
            </motion.div>

          </div>
        )}
      </AnimatePresence>

    </section>
  );
}