"use client";

import React from "react";
import { motion, Easing } from "framer-motion";
import { Bot, Calendar, Flame, Brain, Layers, ShieldCheck, Sparkles, Trophy } from "lucide-react";

/**
 * BentoFeatures Component
 * * Showcases gleamLearn's core ecosystem and capabilities in a modern Bento Grid layout.
 * Each card features subtle entrance animations via Framer Motion, hover border glows,
 * and dual light/dark theme support.
 */
export default function BentoFeatures() {
  // Animation variants with properly typed easing to satisfy Framer Motion's strict Variant types
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5, 
        ease: "easeOut" as Easing 
      } 
    },
  };

  return (
    <section id="features" className="py-24 bg-gray-50 dark:bg-dark-bg relative transition-colors duration-300 overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/2 left-10 w-96 h-96 bg-brand-purple/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-purple/10 border border-brand-purple/30 text-brand-purple text-xs font-semibold mb-4 shadow-sm">
            <Brain className="w-3.5 h-3.5 animate-pulse" />
            <span>Comprehensive Ecosystem</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
            Everything You Need to Ace Your Studies in One App
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">
            No more switching between notes apps, past question booklets, and isolated AI chatbots. gleamLearn brings them together.
          </p>
        </motion.div>

        {/* Bento Grid Container with Staggered Motion */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          
          {/* Card 1: AI Tutor & Classroom (Span 2) */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="md:col-span-2 bg-white/80 dark:bg-[#111827]/75 backdrop-blur-md rounded-3xl p-8 border border-gray-200/80 dark:border-dark-border relative overflow-hidden flex flex-col justify-between group hover:border-brand-purple/50 transition-all shadow-sm"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/10 rounded-full blur-3xl group-hover:bg-brand-purple/20 transition-all pointer-events-none"></div>
            <div>
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 3 }}
                className="w-12 h-12 rounded-2xl bg-brand-purple/15 dark:bg-brand-purple/20 text-brand-purple border border-brand-purple/30 flex items-center justify-center mb-6 shadow-sm"
              >
                <Bot className="w-6 h-6" />
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Multimodal AI Teacher & Companion</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
                Not just a passive chatbot. Your personal AI companion teaches, asks questions, pauses for answers, explains mistakes, and even provides step-by-step diagram drawing guidance for Biology, Physics, and Engineering.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-dark-bg/80 rounded-2xl p-4 border border-gray-200 dark:border-dark-border text-xs text-gray-700 dark:text-gray-300 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></span>
                AI Tutor Active: Explaining Photosynthesis
              </span>
              <span className="text-brand-purple font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Voice & Text
              </span>
            </div>
          </motion.div>

          {/* Card 2: Spaced Repetition (Span 2) */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="md:col-span-1 lg:col-span-2 bg-white/80 dark:bg-[#111827]/75 backdrop-blur-md rounded-3xl p-8 border border-gray-200/80 dark:border-dark-border relative overflow-hidden flex flex-col justify-between group hover:border-brand-blue/50 transition-all shadow-sm"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/10 rounded-full blur-3xl group-hover:bg-brand-blue/20 transition-all pointer-events-none"></div>
            <div>
              <motion.div 
                whileHover={{ scale: 1.05, rotate: -3 }}
                className="w-12 h-12 rounded-2xl bg-brand-blue/15 dark:bg-brand-blue/20 text-brand-blue border border-brand-blue/30 flex items-center justify-center mb-6 shadow-sm"
              >
                <Layers className="w-6 h-6" />
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Adaptive Learning & Spaced Repetition</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
                The platform schedules intelligent revisions on Days 1, 3, 7, 14, and 30 based on your quiz performance, ensuring long-term retention without cramming.
              </p>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-brand-blue bg-brand-blue/5 p-3 rounded-xl border border-brand-blue/15">
              <span>Smart Retention Scheduling</span>
              <span className="font-mono bg-brand-blue/10 px-2 py-0.5 rounded text-[10px]">Active Algorithm</span>
            </div>
          </motion.div>

          {/* Card 3: Gamification & Streaks (Span 1) */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="md:col-span-1 bg-white/80 dark:bg-[#111827]/75 backdrop-blur-md rounded-3xl p-8 border border-gray-200/80 dark:border-dark-border relative overflow-hidden flex flex-col justify-between group hover:border-brand-orange/50 transition-all shadow-sm"
          >
            <div>
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="w-12 h-12 rounded-2xl bg-brand-orange/15 dark:bg-brand-orange/20 text-brand-orange border border-brand-orange/30 flex items-center justify-center mb-6 shadow-sm"
              >
                <Flame className="w-6 h-6 text-brand-orange animate-bounce" />
              </motion.div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Streaks & XP</h3>
              <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed mb-4">
                Earn XP, coins, and maintain daily streaks with motivational challenges designed to build consistent study habits.
              </p>
            </div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="p-3 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-200 dark:border-dark-border text-center shadow-sm flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4 text-brand-orange" />
              <span className="text-sm font-extrabold text-brand-orange">30-Day Streak</span>
            </motion.div>
          </motion.div>

          {/* Card 4: Exam Prep - WAEC, JAMB, BSc (Span 2) */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="md:col-span-2 bg-white/80 dark:bg-[#111827]/75 backdrop-blur-md rounded-3xl p-8 border border-gray-200/80 dark:border-dark-border relative overflow-hidden flex flex-col justify-between group hover:border-brand-green/50 transition-all shadow-sm"
          >
            <div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="w-12 h-12 rounded-2xl bg-brand-green/15 dark:bg-brand-green/20 text-brand-green border border-brand-green/30 flex items-center justify-center mb-6 shadow-sm"
              >
                <ShieldCheck className="w-6 h-6" />
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Nigerian & International Examination Prep</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
                Custom study plans and exam simulation mode built specifically for WAEC, NECO, JAMB, JUPEB, NABTEB, and University semesters with timed tests and detailed score analytics.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-400">
              <span className="px-3 py-1 rounded-lg bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border shadow-sm font-medium">JAMB 300+ Roadmap</span>
              <span className="px-3 py-1 rounded-lg bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border shadow-sm font-medium">WAEC Distinction</span>
              <span className="px-3 py-1 rounded-lg bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border shadow-sm font-medium">University BSc Courses</span>
            </div>
          </motion.div>

          {/* Card 5: Personalized Study Planner (Span 1) */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="md:col-span-1 bg-white/80 dark:bg-[#111827]/75 backdrop-blur-md rounded-3xl p-8 border border-gray-200/80 dark:border-dark-border relative overflow-hidden flex flex-col justify-between group hover:border-brand-blue/50 transition-all shadow-sm"
          >
            <div>
              <motion.div 
                whileHover={{ scale: 1.05, rotate: -5 }}
                className="w-12 h-12 rounded-2xl bg-brand-blue/15 dark:bg-brand-blue/20 text-brand-blue border border-brand-blue/30 flex items-center justify-center mb-6 shadow-sm"
              >
                <Calendar className="w-6 h-6" />
              </motion.div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Smart Timetable</h3>
              <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed mb-4">
                Missed a study session? The AI planner automatically rebalances your schedule without stress.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-brand-blue font-semibold bg-brand-blue/5 p-2.5 rounded-xl border border-brand-blue/15 text-center justify-center">
              <span>Dynamic Rebalancing</span>
            </div>
          </motion.div>

        </motion.div>

      </div>
    </section>
  );
}