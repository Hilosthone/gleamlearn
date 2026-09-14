"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HelpCircle, 
  Search, 
  ChevronRight, 
  MessageSquareQuote, 
  LifeBuoy, 
  BookOpen, 
  CreditCard, 
  ShieldCheck, 
  Sparkles,
  Mail,
  ExternalLink
} from "lucide-react";

/**
 * SupportCenter Component
 * 
 * Interactive knowledge base and FAQ portal featuring live search filtering, 
 * category tabs, smooth Framer Motion list animations, and a direct 
 * support contact ticket trigger for gleamLearn users.
 */
export default function SupportCenter() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [faqCategory, setFaqCategory] = useState<string>("all");

  const faqs = [
    {
      q: "How does Dr. Gleam AI process my uploaded syllabi and lecture notes?",
      category: "ai",
      a: "Dr. Gleam uses advanced retrieval-augmented generation (RAG) combined with secure context isolation. Your materials are parsed locally and vector-indexed to provide personalized tutoring without sharing private data with third parties."
    },
    {
      q: "Can I use gleamLearn for offline study sessions?",
      category: "platform",
      a: "Yes! Our cross-platform mobile apps (built with React Native & Flutter) allow you to download AI-synthesized summaries, flashcards, and audio lectures for offline review."
    },
    {
      q: "What is gleamLearn's policy on academic integrity during AI quizzes?",
      category: "integrity",
      a: "gleamLearn is designed as a learning companion. While we provide step-by-step problem breakdowns and Socratic tutoring, our system adheres to strict honor code guidelines, preventing direct cheating during graded institutional examinations."
    },
    {
      q: "How do I upgrade my account or manage subscription billing?",
      category: "billing",
      a: "You can manage your billing, invoices, and subscription tiers anytime via Account Settings -> Billing Portal. We accept secure multi-currency payments globally."
    },
    {
      q: "How do I switch between Video and Audio call modes with Dr. Gleam?",
      category: "platform",
      a: "Inside the Virtual Classroom studio, use the toggle in the top-right video bar to instantly switch between HD Video streams and low-latency Spatial Audio voice calls."
    },
    {
      q: "How do I invite classmates or students to my virtual classroom?",
      category: "platform",
      a: "Navigate to your instructor dashboard, select your active course or study room, and click 'Share Invite Link' to generate secure access codes for your students."
    }
  ];

  const filteredFaqs = faqs.filter(item => {
    const matchesQuery = item.q.toLowerCase().includes(searchQuery.toLowerCase()) || item.a.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = faqCategory === "all" || item.category === faqCategory;
    return matchesQuery && matchesCat;
  });

  const categoryLabels: Record<string, { label: string; icon: React.ReactNode }> = {
    all: { label: "All Questions", icon: <Sparkles className="w-3.5 h-3.5" /> },
    ai: { label: "AI & Tutors", icon: <BookOpen className="w-3.5 h-3.5" /> },
    platform: { label: "Platform & App", icon: <LifeBuoy className="w-3.5 h-3.5" /> },
    billing: { label: "Billing & Plans", icon: <CreditCard className="w-3.5 h-3.5" /> },
    integrity: { label: "Honor Code", icon: <ShieldCheck className="w-3.5 h-3.5" /> }
  };

  return (
    <section className="py-24 bg-gray-50 dark:bg-dark-bg relative border-t border-gray-200 dark:border-dark-border transition-colors duration-300 overflow-hidden">
      
      {/* Background Decorative Ambient Elements */}
      <div className="absolute top-1/4 left-0 w-80 h-80 bg-brand-blue/5 rounded-full blur-[120px] pointer-events-none"></div>
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
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Knowledge Base & Assistance</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
            Support Center & FAQs
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Find instant answers to common questions about gleamLearn features, mobile offline modes, billing, and Dr. Gleam AI tutoring.
          </p>
        </motion.div>

        {/* Main Content Container */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl p-6 sm:p-10 space-y-8"
        >
          
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search FAQs (e.g., AI syllabus, offline mode, billing)..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-brand-blue transition-colors shadow-xs"
            />
          </div>

          {/* Categories Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2 pt-1">
            {Object.entries(categoryLabels).map(([cat, { label, icon }]) => (
              <button
                key={cat}
                onClick={() => setFaqCategory(cat)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  faqCategory === cat 
                    ? "bg-brand-blue text-white shadow-sm" 
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* FAQ List */}
          <div className="space-y-4 min-h-[220px]">
            <AnimatePresence mode="popLayout">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, idx) => (
                  <motion.div 
                    key={faq.q}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2, delay: idx * 0.04 }}
                    className="p-5 sm:p-6 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-200/85 dark:border-gray-800 space-y-2 hover:border-brand-blue/40 transition-colors shadow-xs"
                  >
                    <h4 className="text-base font-bold text-gray-900 dark:text-white flex items-start sm:items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-brand-blue shrink-0 mt-2 sm:mt-0"></span>
                      <span>{faq.q}</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 pl-4 sm:pl-4.5 leading-relaxed">
                      {faq.a}
                    </p>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 space-y-3"
                >
                  <HelpCircle className="w-10 h-10 text-gray-400 mx-auto opacity-60" />
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">No matching questions found.</p>
                  <p className="text-xs text-gray-500">Try adjusting your search terms or select a different category.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Still Need Help Banner */}
          <div className="p-6 rounded-2xl bg-brand-blue/5 dark:bg-brand-blue/10 border border-brand-blue/20 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="p-3 rounded-2xl bg-brand-blue text-white shadow-sm shrink-0 mx-auto sm:mx-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  Still have questions or need technical support?
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  Our engineering and academic support team is available 24/7 to help you succeed.
                </p>
              </div>
            </div>
            <a 
              href="mailto:gleamlearn.support@gmail.com"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blue text-white text-xs font-semibold hover:bg-brand-blue/90 transition-all shadow-sm shrink-0"
            >
              <span>Submit a Ticket</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </motion.div>

      </div>
    </section>
  );
}