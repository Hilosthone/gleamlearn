"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Award, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  BrainCircuit, 
  AlertTriangle, 
  Lightbulb, 
  FileText, 
  Users 
} from "lucide-react";

/**
 * AcademicIntegrity Component
 * 
 * Enhanced academic integrity policy featuring rich content sections, 
 * engaging Framer Motion entry animations, clear visual structure, and 
 * illustrative Lucide icons.
 */
export default function AcademicIntegrity() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-dark-bg relative border-t border-gray-200 dark:border-dark-border transition-colors duration-300 overflow-hidden">
      
      {/* Background Decorative Ambient Elements */}
      <div className="absolute top-1/4 left-0 w-72 h-72 bg-brand-blue/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-brand-purple/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/30 text-brand-blue text-xs font-semibold mb-4 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Ethics & Honor Code</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
            Academic Integrity Policy
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Empowering true conceptual understanding, mastery, and responsible AI collaboration across secondary schools, universities, and exam boards.
          </p>
        </motion.div>

        {/* Main Content Box */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl p-8 sm:p-12 space-y-10 text-gray-700 dark:text-gray-300 text-sm leading-relaxed"
        >
          
          {/* Section 1: Philosophy */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-blue/10 text-brand-blue">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                1. Our Core Educational Philosophy
              </h3>
            </div>
            <p className="pl-11 text-gray-600 dark:text-gray-400">
              gleamLearn is deliberately engineered to foster deep conceptual mastery through Socratic guidance, step-by-step problem breakdown, and interactive visual simulations. We believe artificial intelligence should act as an infinite, patient personal tutor—never as a tool to bypass critical thinking, authentic effort, or genuine intellectual growth.
            </p>
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Section 2: Code of Honor */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-green/10 text-brand-green">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                2. Code of Honor for AI-Assisted Study
              </h3>
            </div>
            
            <div className="grid grid-cols-1 gap-4 pl-0 sm:pl-11">
              
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="flex items-start gap-4 p-5 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-200/85 dark:border-gray-800 transition-all shadow-xs"
              >
                <div className="p-2 rounded-lg bg-brand-green/10 text-brand-green mt-0.5 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <strong className="text-gray-900 dark:text-white block mb-1 font-semibold">Socratic Guidance over Direct Answers</strong>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    Dr. Gleam and our AI classroom features are programmed to guide students toward discovering solutions independently during active coursework rather than outputting raw exam answers or shortcut homework solutions.
                  </p>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="flex items-start gap-4 p-5 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-200/85 dark:border-gray-800 transition-all shadow-xs"
              >
                <div className="p-2 rounded-lg bg-brand-blue/10 text-brand-blue mt-0.5 shrink-0">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <strong className="text-gray-900 dark:text-white block mb-1 font-semibold">Appropriate AI Attribution & Citation</strong>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    Students and researchers are strongly encouraged to transparently cite AI-assisted code generation, research summaries, and curriculum breakdowns appropriately in institutional submissions, lab reports, and assignments.
                  </p>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="flex items-start gap-4 p-5 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-200/85 dark:border-gray-800 transition-all shadow-xs"
              >
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 mt-0.5 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <strong className="text-gray-900 dark:text-white block mb-1 font-semibold">Authentic Assessments & Practice Exams</strong>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    Mock exams (JAMB, WAEC, University BSc tests) taken on gleamLearn are designed to simulate genuine test environments. External assistance, unauthorized lookup tools, or cheating during timed assessments undermine your diagnostic score report.
                  </p>
                </div>
              </motion.div>

            </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Section 3: Educator & Institutional Standards */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                3. Educator and Institution Responsibilities
              </h3>
            </div>
            <p className="pl-11 text-gray-600 dark:text-gray-400">
              Instructors, academy coordinators, and institution administrators utilizing gleamLearn classrooms agree to promote ethical AI integration. Educators retain full authority over setting assignment guidelines, establishing testing rules, and evaluating student performance within their respective virtual classes.
            </p>
          </div>

          {/* Warning Note Callout Box */}
          <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wide">
                Policy Enforcement Notice
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
                Violation of examination rules or repeated attempts to abuse automated solution generators for academic dishonesty may result in temporary suspension or permanent termination of platform access.
              </p>
            </div>
          </div>

        </motion.div>

      </div>
    </section>
  );
}