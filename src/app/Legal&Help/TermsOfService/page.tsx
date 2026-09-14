"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  FileText, 
  CheckCircle, 
  ShieldAlert, 
  Cpu, 
  Scale, 
  Ban, 
  RefreshCcw, 
  Mail, 
  ExternalLink 
} from "lucide-react";

/**
 * TermsOfService Component
 * 
 * Professional Terms of Service document featuring Framer Motion entry animations,
 * structured legal sections, expanded usage guidelines, and clear support contact pathways
 * for gleamLearn users.
 */
export default function TermsOfService() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-dark-bg relative border-t border-gray-200 dark:border-dark-border transition-colors duration-300 overflow-hidden">
      
      {/* Background Decorative Ambient Elements */}
      <div className="absolute top-1/4 right-0 w-80 h-80 bg-brand-blue/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-brand-purple/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/30 text-brand-blue text-xs font-semibold mb-4 shadow-sm">
            <FileText className="w-3.5 h-3.5" />
            <span>User Agreement & Legal</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
            Terms of Service
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Effective Date: September 2026. Please read these terms carefully before accessing or using gleamLearn web and mobile platforms.
          </p>
        </motion.div>

        {/* Main Content Box */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl p-8 sm:p-12 space-y-10 text-gray-700 dark:text-gray-300 text-sm leading-relaxed"
        >
          
          {/* Section 1: Acceptance of Terms */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-blue/10 text-brand-blue">
                <CheckCircle className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                1. Acceptance of Terms & Conditions
              </h3>
            </div>
            <p className="pl-11 text-gray-600 dark:text-gray-400">
              By accessing, registering for, or utilizing gleamLearn (including our virtual classroom studios, cross-platform mobile applications, and Dr. Gleam AI tutoring microservices), you acknowledge that you have read, understood, and agree to be legally bound by these Terms of Service and our accompanying Privacy Policy.
            </p>
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Section 2: User Accounts & Responsibilities */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-orange/10 text-brand-orange">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                2. User Accounts, Security & Responsibilities
              </h3>
            </div>
            <p className="pl-11 text-gray-600 dark:text-gray-400">
              You are entirely responsible for safeguarding your login credentials, password complexity, and 2FA authentication tokens. You accept full liability for all activities and transactions conducted under your registered user account. You must notify our security team immediately upon discovering any unauthorized account access or security breach.
            </p>
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Section 3: Intellectual Property & AI Models */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-purple/10 text-brand-purple">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                3. Intellectual Property & AI Model Rights
              </h3>
            </div>
            <p className="pl-11 text-gray-600 dark:text-gray-400">
              All platform software infrastructure, virtual classroom UI layouts, Dr. Gleam AI models, vector embeddings, and proprietary curriculum modules are protected under international copyright, trademark, and intellectual property laws. While users retain full ownership of their original uploaded documents and code submissions, gleamLearn retains all rights to the underlying platform architecture.
            </p>
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Section 4: Acceptable Use Policy */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-500/10 text-red-500">
                <Ban className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                4. Acceptable Use & Prohibited Conduct
              </h3>
            </div>
            <p className="pl-11 text-gray-600 dark:text-gray-400">
              Users agree not to misuse platform services. Prohibited actions include attempting to reverse engineer AI models, scraping system databases, uploading malicious code or malware, bypassing institutional examination honor codes, or harassing fellow students and educators within virtual classrooms.
            </p>
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Section 5: Modifications & Termination */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                <RefreshCcw className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                5. Modifications & Account Termination
              </h3>
            </div>
            <p className="pl-11 text-gray-600 dark:text-gray-400">
              We reserve the right to modify, update, or suspend these Terms of Service at any time. Continued use of gleamLearn following published updates constitutes your formal acceptance of the revised terms. We may suspend or terminate accounts that violate our terms or academic integrity policies without prior notice.
            </p>
          </div>

          {/* Contact Legal Team Callout Box */}
          <div className="p-6 rounded-2xl bg-brand-blue/5 dark:bg-brand-blue/10 border border-brand-blue/20 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="p-3 rounded-2xl bg-brand-blue text-white shadow-sm shrink-0 mx-auto sm:mx-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  Have questions regarding our legal agreements?
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  Reach out to our compliance and legal department anytime at legal@gleamlearn.ai
                </p>
              </div>
            </div>
            <a 
              href="mailto:legal@gleamlearn.ai"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blue text-white text-xs font-semibold hover:bg-brand-blue/90 transition-all shadow-sm shrink-0"
            >
              <span>Contact Legal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </motion.div>

      </div>
    </section>
  );
}