"use client";

import React, { useState } from "react";
import { CheckCircle2, Sparkles, ArrowRight, Clock } from "lucide-react";

export default function PricingSection() {
  // State to toggle between subscription billing periods
  const [billingCycle, setBillingCycle] = useState<"monthly" | "termly" | "semesterly" | "sessionly" | "yearly">("monthly");

  return (
    <section id="pricing" className="py-24 bg-gray-50 dark:bg-dark-bg relative border-t border-gray-200 dark:border-dark-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
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
            gleamLearn operates on a flexible freemium model. Enjoy robust core learning features for free, with optional advanced AI tutoring tiers tailored to your academic schedule.
          </p>
        </div>

        {/* Subscription Cycle Selector Tabs */}
        <div className="flex flex-wrap justify-center items-center gap-2 mb-12 max-w-2xl mx-auto bg-white/80 dark:bg-[#111827]/75 backdrop-blur-md p-2 rounded-2xl border border-gray-200/80 dark:border-dark-border shadow-sm">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              billingCycle === "monthly"
                ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("termly")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              billingCycle === "termly"
                ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Termly
          </button>
          <button
            onClick={() => setBillingCycle("semesterly")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              billingCycle === "semesterly"
                ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Semesterly
          </button>
          <button
            onClick={() => setBillingCycle("sessionly")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              billingCycle === "sessionly"
                ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Sessionly
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              billingCycle === "yearly"
                ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Yearly
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
          
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
              
              {/* Dynamic Subtitle / Plan Badge without hardcoded monetary values */}
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

        </div>

        {/* Signup Call to Action Box */}
        <div id="signup" className="bg-white/80 dark:bg-[#111827]/75 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-brand-purple/40 relative overflow-hidden text-center max-w-4xl mx-auto shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/10 via-brand-purple/10 to-brand-green/10 pointer-events-none"></div>
          
          <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-4 relative z-10">
            Ready to Transform Your Academic Journey?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-base max-w-xl mx-auto mb-8 relative z-10">
            Join thousands of students across Nigeria and Africa studying smarter, not harder, with gleamLearn.
          </p>

          <form onSubmit={(e) => { e.preventDefault(); alert("Welcome to gleamLearn! Account creation simulated successfully."); }} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto relative z-10">
            <input 
              type="email" 
              required 
              placeholder="Enter your school email address..." 
              className="flex-1 px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-blue text-sm shadow-sm"
            />
            <button 
              type="submit" 
              className="px-6 py-3.5 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white font-bold text-sm shadow-lg shadow-brand-blue/30 transition-all flex items-center justify-center gap-2"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 relative z-10">No credit card required. Free tier available instantly.</p>
        </div>

      </div>
    </section>
  );
}