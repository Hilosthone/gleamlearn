'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Crown, 
  Check, 
  X, 
  Zap, 
  CreditCard, 
  Calendar, 
  Receipt, 
  AlertTriangle,
  Clock,
} from 'lucide-react';

type PremiumTab = 'overview' | 'subscription';
type BillingCycle = 'monthly' | 'termly' | 'semesterly' | 'sessionly';

export default function PremiumHub() {
  const [activeTab, setActiveTab] = useState<PremiumTab>('overview');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('sessionly');
  const [isCanceling, setIsCanceling] = useState(false);
  const [cancelConfirmed, setCancelConfirmed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // State for systemic "Coming Soon" modal
  const [comingSoonModal, setComingSoonModal] = useState<{ isOpen: boolean; title: string }>({
    isOpen: false,
    title: '',
  });

  // Updated plan configurations with your exact pricing and descriptions
  const plansConfig = {
    monthly: {
      name: 'Monthly Plan',
      price: '₦2,500',
      period: 'month',
      description: 'Billed monthly. Cancel anytime.',
      savings: null,
    },
    termly: {
      name: 'Termly Plan (3 Months)',
      price: '₦7,000',
      period: '3 months',
      description: 'Billed every 3 months. Save ~8%.',
      savings: 'Save 8%',
    },
    semesterly: {
      name: 'Semesterly Plan (4 Months)',
      price: '₦8,000',
      period: '4 months',
      description: 'Ideal for an academic semester. Save ~12%.',
      savings: 'Save 12%',
    },
    sessionly: {
      name: 'Sessionly / Yearly Plan',
      price: '₦10,800',
      period: 'year',
      description: 'Billed annually (approx. ₦9,000/mo). Best value!',
      savings: 'Save 20%',
    },
  };

  // Automated cycle switcher across the 4 cycles with pause-on-hover capability
  useEffect(() => {
    if (isPaused || activeTab !== 'overview') return;
    const cycles: BillingCycle[] = ['monthly', 'termly', 'semesterly', 'sessionly'];
    const interval = setInterval(() => {
      setBillingCycle((prev) => {
        const currentIndex = cycles.indexOf(prev);
        const nextIndex = (currentIndex + 1) % cycles.length;
        return cycles[nextIndex];
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, activeTab]);

  // Mock billing history records matching sessionly plan
  const billingHistory = [
    { id: 'INV-2026-003', date: 'Aug 29, 2026', amount: '₦10,800', plan: 'gleamLearn Pro (Sessionly / Yearly)', status: 'Paid' },
    { id: 'INV-2025-002', date: 'Aug 29, 2025', amount: '₦10,800', plan: 'gleamLearn Pro (Sessionly / Yearly)', status: 'Paid' },
    { id: 'INV-2024-001', date: 'Aug 29, 2024', amount: '₦2,500', plan: 'gleamLearn Pro (Monthly)', status: 'Paid' },
  ];

  const featuresList = [
    { name: 'AI Tutor Sessions', free: '15 queries / day', premium: 'Unlimited (Socratic & Deep Dive)' },
    { name: 'Document Uploads & OCR', free: 'Up to 3 PDFs (10MB max)', premium: 'Unlimited PDFs & textbook scans' },
    { name: 'Voice Features & Pronunciation', free: 'Basic Text-to-Speech', premium: 'Real-time Voice AI & Audio Notes' },
    { name: 'Advanced Exam Analytics', free: 'Standard score report', premium: 'Predictive pass-rate & weak-spot AI mapping' },
    { name: 'Offline Study Library', free: 'Online access only', premium: 'Downloadable PDF summaries & flashcards' },
    { name: 'Streak Freezes & Custom Themes', free: 'Standard rewards shop', premium: 'Exclusive badges & unlimited streak recovery' },
  ];

  // Helper trigger for systemic coming soon modal
  const handleUpgradeAction = (planName: string) => {
    setComingSoonModal({
      isOpen: true,
      title: planName,
    });
  };

  const currentPlanDetails = plansConfig[billingCycle];

  return (
    <div className="w-full min-h-screen pb-16 space-y-8 relative">
      
      {/* Navigation Sub-Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-amber-500/15 text-amber-500 border border-amber-200/50">
            <Crown className="w-6 h-6 fill-amber-500" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">gleamLearn Premium</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Supercharge your studies with advanced AI limits, voice capabilities, and deep analytics.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 p-1.5 rounded-2xl w-full sm:w-auto">
          {[
            { id: 'overview', label: 'Plans & Features', icon: Sparkles },
            { id: 'subscription', label: 'My Subscription', icon: CreditCard },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as PremiumTab)}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-[#111827] text-gray-900 dark:text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-amber-500" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3D DOOR ANIMATED TAB CONTAINER & COMPARISON MATRIX         */}
      {/* ========================================================= */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, rotateY: -15, scale: 0.98 }}
            animate={{ opacity: 1, rotateY: 0, scale: 1 }}
            exit={{ opacity: 0, rotateY: 15, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformPerspective: 1200 }}
            className="space-y-8 origin-center"
          >
            {/* Hero Banner with Multi-Cycle Selector (Pause-on-Hover enabled) */}
            <div 
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 p-8 sm:p-12 rounded-3xl text-center text-white space-y-6 shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 fill-amber-300" />
                <span>Unlock Your Full Academic Potential {isPaused && '(Paused)'}</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Choose the plan that fits your goals</h2>
              <p className="text-xs sm:text-sm text-blue-100 max-w-xl mx-auto">Get unlimited AI tutor sessions, advanced document analysis, and comprehensive analytics.</p>

              {/* 4-Way Billing Cycle Selector Tabs */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-3 max-w-2xl mx-auto">
                {[
                  { id: 'monthly', label: 'Monthly' },
                  { id: 'termly', label: 'Termly (3 Mo)' },
                  { id: 'semesterly', label: 'Semesterly (4 Mo)' },
                  { id: 'sessionly', label: 'Sessionly / Yearly' },
                ].map((cycle) => {
                  const isSelected = billingCycle === cycle.id;
                  return (
                    <button
                      key={cycle.id}
                      onClick={() => setBillingCycle(cycle.id as BillingCycle)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white text-blue-950 shadow-lg scale-105'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {cycle.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              
              {/* Free Plan Card */}
              <div className="bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-gray-400">Free Starter</span>
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">Current Plan</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">₦0 <span className="text-xs font-normal text-gray-500">/ forever</span></h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Essential tools for casual learners and practice quizzes.</p>
                  </div>
                  
                  <ul className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-300">
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>15 AI Tutor queries per day</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Up to 3 PDF document uploads</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Standard practice quizzes & exams</span>
                    </li>
                    <li className="flex items-center gap-2.5 text-gray-400">
                      <X className="w-4 h-4 text-gray-300 shrink-0" />
                      <span className="line-through">Unlimited AI explanations & voice notes</span>
                    </li>
                  </ul>
                </div>

                <button disabled className="w-full py-3.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 text-xs font-bold cursor-not-allowed">
                  Active Plan
                </button>
              </div>

              {/* Premium Pro Plan Card (Description follows right after price) */}
              <div className="bg-white dark:bg-[#111827] p-8 rounded-3xl border-2 border-blue-600 dark:border-blue-500 shadow-xl relative flex flex-col justify-between space-y-6">
                {currentPlanDetails.savings && (
                  <div className="absolute -top-3.5 right-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                    {currentPlanDetails.savings}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-amber-500 fill-amber-500" />
                      <span className="text-xs font-extrabold uppercase tracking-wider text-[#2563EB]">{currentPlanDetails.name}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                      {currentPlanDetails.price} 
                      <span className="text-xs font-normal text-gray-500"> / {currentPlanDetails.period}</span>
                    </h3>
                    {/* Description following directly after price */}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{currentPlanDetails.description}</p>
                  </div>

                  <ul className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-700 dark:text-gray-200 font-medium">
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="font-bold">Unlimited AI Tutor queries & deep dives</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="font-bold">Unlimited PDF uploads & textbook OCR</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="font-bold">Real-time voice AI & audio pronunciation</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="font-bold">Advanced predictive exam pass-rate analytics</span>
                    </li>
                  </ul>
                </div>

                <button 
                  onClick={() => handleUpgradeAction(`gleamLearn Pro (${currentPlanDetails.name})`)}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold hover:opacity-90 transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>Upgrade to {currentPlanDetails.name}</span>
                </button>
              </div>

            </div>

            {/* Detailed Features Breakdown Matrix */}
            <div className="bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 space-y-6">
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Feature Comparison Matrix</h3>
              
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {featuresList.map((feat, idx) => (
                  <div key={idx} className="py-4 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center text-xs">
                    <span className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-[#2563EB]" />
                      {feat.name}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      <span className="sm:hidden font-bold">Free: </span>{feat.free}
                    </span>
                    <span className="font-extrabold text-[#2563EB] dark:text-blue-400">
                      <span className="sm:hidden font-bold">Pro: </span>{feat.premium}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'subscription' && (
          <motion.div
            key="subscription"
            initial={{ opacity: 0, rotateY: 15, scale: 0.98 }}
            animate={{ opacity: 1, rotateY: 0, scale: 1 }}
            exit={{ opacity: 0, rotateY: -15, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformPerspective: 1200 }}
            className="max-w-3xl mx-auto space-y-6 origin-center"
          >
            {/* Current Plan Status Box */}
            <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-blue-500/10 text-[#2563EB]">
                    <Crown className="w-6 h-6 fill-amber-500 text-amber-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-gray-900 dark:text-white">gleamLearn Pro Plan</h3>
                      <span className="text-[10px] font-extrabold bg-emerald-500/10 text-emerald-500 px-2.5 py-0.5 rounded-full border border-emerald-200">Active</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Sessionly / Yearly billing • Next renewal on August 29, 2027</p>
                  </div>
                </div>

                <button
                  onClick={() => handleUpgradeAction('Plan Modification')}
                  className="px-5 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400 text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  Change Plan
                </button>
              </div>

              {/* Quick Renewal & Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Renewal Date</span>
                  <p className="text-xs font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>August 29, 2027</span>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Payment Method</span>
                  <p className="text-xs font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Mastercard ending in ••42</span>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Billing Amount</span>
                  <p className="text-xs font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>₦10,800 / year</span>
                  </p>
                </div>
              </div>

              {/* Cancel Subscription Section */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">Need to cancel your subscription?</h4>
                  <p className="text-[11px] text-gray-500">You will retain Pro benefits until the end of your current billing cycle.</p>
                </div>
                <button
                  onClick={() => setIsCanceling(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                >
                  Cancel Subscription
                </button>
              </div>
            </div>

            {/* Payment History Table */}
            <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#2563EB]" />
                <span>Billing & Payment History</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold uppercase text-[10px]">
                      <th className="pb-3">Invoice ID</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Plan Description</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {billingHistory.map((inv) => (
                      <tr key={inv.id} className="text-gray-700 dark:text-gray-300">
                        <td className="py-3.5 font-bold text-[#2563EB]">{inv.id}</td>
                        <td className="py-3.5 text-gray-500">{inv.date}</td>
                        <td className="py-3.5 font-medium">{inv.plan}</td>
                        <td className="py-3.5 font-bold">{inv.amount}</td>
                        <td className="py-3.5 text-right">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-extrabold">
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cancel Confirmation Modal Simulation */}
            {isCanceling && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs">
                <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl max-w-md w-full space-y-4 shadow-2xl border border-gray-200 dark:border-gray-800 text-center">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">Are you sure you want to cancel?</h3>
                  <p className="text-xs text-gray-500">You will lose access to unlimited AI queries, offline PDF storage, and advanced exam analytics when your term expires.</p>
                  
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setIsCanceling(false)}
                      className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold cursor-pointer"
                    >
                      Keep Subscription
                    </button>
                    <button
                      onClick={() => {
                        setIsCanceling(false);
                        setCancelConfirmed(true);
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 cursor-pointer"
                    >
                      Confirm Cancellation
                    </button>
                  </div>
                </div>
              </div>
            )}

            {cancelConfirmed && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-200 text-amber-700 dark:text-amber-300 text-xs font-medium flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>Your subscription has been scheduled for cancellation at the end of your billing cycle. You can reactivate anytime before then.</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* SYSTEMIC "COMING SOON" MODAL DIALOG                        */}
      {/* ========================================================= */}
      {comingSoonModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-fadeIn">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl max-w-sm w-full space-y-5 shadow-2xl border border-gray-200 dark:border-gray-800 text-center relative"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-[#2563EB] dark:text-blue-400 flex items-center justify-center mx-auto border border-blue-200/50">
              <Clock className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-gray-900 dark:text-white">Coming Soon!</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Secure payment gateway integration for <span className="font-bold text-gray-800 dark:text-gray-200">{comingSoonModal.title}</span> is currently underway and will be live shortly.
              </p>
            </div>

            <button
              onClick={() => setComingSoonModal({ isOpen: false, title: '' })}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold hover:opacity-90 transition-all shadow-md shadow-blue-500/20 cursor-pointer"
            >
              Got it
            </button>
          </motion.div>
        </div>
      )}

    </div>
  );
}