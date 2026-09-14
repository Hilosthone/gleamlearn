"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  Database, 
  Server, 
  UserCheck, 
  KeyRound, 
  FileLock2, 
  Mail, 
  CheckCircle2,
  GlobeLock
} from "lucide-react";

/**
 * PrivacyPolicy Component
 * 
 * Comprehensive enterprise-grade privacy policy featuring Framer Motion 
 * entry animations, distinct icon styling, structured compliance sections, 
 * and clear user rights governance for gleamLearn.
 */
export default function PrivacyPolicy() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-dark-bg relative border-t border-gray-200 dark:border-dark-border transition-colors duration-300 overflow-hidden">
      
      {/* Background Decorative Ambient Elements */}
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-brand-blue/5 rounded-full blur-[110px] pointer-events-none"></div>
      <div className="absolute bottom-1/3 left-0 w-80 h-80 bg-brand-purple/5 rounded-full blur-[120px] pointer-events-none"></div>

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
            <span>Compliance & Data Protection</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
            Privacy Policy
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Last updated: September 2026. We are deeply committed to safeguarding your personal information, uploaded study resources, and academic telemetry.
          </p>
        </motion.div>

        {/* Main Content Box */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl p-8 sm:p-12 space-y-10 text-gray-700 dark:text-gray-300 text-sm leading-relaxed"
        >
          
          {/* Section 1: Information We Collect */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-blue/10 text-brand-blue">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                1. Information We Collect
              </h3>
            </div>
            <p className="pl-11 text-gray-600 dark:text-gray-400">
              To deliver an exceptional AI-powered tutoring experience, gleamLearn gathers specific categories of data when you register, upload course assets, or interact with Dr. Gleam:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-0 sm:pl-11 pt-1">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-200/85 dark:border-gray-800 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                <div>
                  <strong className="text-gray-900 dark:text-white block text-xs font-semibold mb-0.5">Account Profile Details</strong>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Name, institutional email address, academic level, and affiliation.</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-200/85 dark:border-gray-800 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                <div>
                  <strong className="text-gray-900 dark:text-white block text-xs font-semibold mb-0.5">Educational Materials</strong>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Uploaded syllabi, lecture slides, notes, code repositories, and homework prompts.</p>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Section 2: How We Use Your Data */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-green/10 text-brand-green">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                2. How We Process and Use Your Data
              </h3>
            </div>
            <p className="pl-11 text-gray-600 dark:text-gray-400">
              Your information is utilized strictly for generating contextual AI tutoring sessions, constructing vector embeddings for Retrieval-Augmented Generation (RAG) study guides, and synchronizing your learning streak telemetry across our web platform and mobile application. 
            </p>
            <div className="pl-11">
              <div className="p-4 rounded-2xl bg-brand-green/5 dark:bg-brand-green/10 border border-brand-green/20 text-xs text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2.5">
                <GlobeLock className="w-4 h-4 text-brand-green shrink-0" />
                <span>Strict Privacy Guarantee: We never sell, rent, or monetize personal user data or uploaded study documents to third-party advertisers.</span>
              </div>
            </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Section 3: Security & Encryption */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-purple/10 text-brand-purple">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                3. Enterprise Security & Encryption Standards
              </h3>
            </div>
            <p className="pl-11 text-gray-600 dark:text-gray-400">
              We protect your data using multi-layered defense architectures designed for modern cloud infrastructure:
            </p>
            <div className="grid grid-cols-1 gap-3 pl-0 sm:pl-11">
              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-200/85 dark:border-gray-800">
                <div className="p-2 rounded-lg bg-brand-purple/10 text-brand-purple mt-0.5 shrink-0">
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-gray-900 dark:text-white block text-xs font-semibold mb-0.5">In-Transit & At-Rest Encryption</strong>
                  <p className="text-xs text-gray-600 dark:text-gray-400">All data transmitted between client applications and our FastAPI microservices is secured via TLS 1.3. Persistent database records are fully encrypted using AES-256 standards.</p>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Section 4: Your Privacy Rights */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                4. Your Control & User Privacy Rights
              </h3>
            </div>
            <p className="pl-11 text-gray-600 dark:text-gray-400">
              You maintain total ownership of your files, chat histories, and academic records. You retain full rights to request complete account purging, secure data exports, or revoke AI training permissions on your personal documents at any time directly through your account dashboard settings.
            </p>
          </div>

          {/* Contact Support Callout Box */}
          <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 flex items-center justify-between flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wide">
                  Have privacy questions or data requests?
                </h4>
                <p className="text-xs text-blue-800/80 dark:text-blue-400">
                  Reach out directly to our data protection officer at support@gleamlearn.ai
                </p>
              </div>
            </div>
            <a 
              href="mailto:support@gleamlearn.ai" 
              className="px-4 py-2 rounded-xl bg-brand-blue text-white text-xs font-semibold hover:bg-brand-blue/90 transition-colors shadow-sm shrink-0"
            >
              Contact DPO
            </a>
          </div>

        </motion.div>

      </div>
    </section>
  );
}