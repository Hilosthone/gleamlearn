'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  Unlock, 
  Trash2, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';

type AccountState = 'active' | 'frozen' | 'suspended' | 'deleted';

export default function AccountStateHub() {
  // Simulating account state for testing/demo purposes
  // In production, fetch this status from your user session/API (Active | Frozen | Suspended | Deleted)
  const [accountState, setAccountState] = useState<AccountState>('active');
  
  // Modals & form state
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Deletion form fields
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [freezeDate, setFreezeDate] = useState<string | null>(null);

  // Handlers for state transitions
  const handleFreezeAccount = () => {
    setAccountState('frozen');
    setFreezeDate(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
    setShowFreezeModal(false);
  };

  const handleReactivateAccount = () => {
    setAccountState('active');
    setFreezeDate(null);
  };

  const handleDeleteAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmationText !== 'DELETE') return;
    setAccountState('deleted');
    setShowDeleteModal(false);
  };

  return (
    <div className="w-full min-h-screen pb-16 space-y-8">
      
      {/* ========================================================= */}
      {/* STATE 61: FROZEN ACCOUNT PAGE                              */}
      {/* ========================================================= */}
      {accountState === 'frozen' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl mx-auto bg-white dark:bg-[#111827] p-8 sm:p-10 rounded-3xl border border-amber-200 dark:border-amber-900/50 shadow-xl text-center space-y-6 mt-12"
        >
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-200/50">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Your Account is Frozen</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Freezing temporarily disables your learning activity, public leaderboard presence, and notifications.
            </p>
            {freezeDate && (
              <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 pt-1">
                Frozen on: {freezeDate}
              </p>
            )}
          </div>

          <div className="pt-4 space-y-3">
            <button
              onClick={handleReactivateAccount}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold hover:opacity-95 transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>Reactivate Account</span>
            </button>

            <a
              href="mailto:support@gleamlearn.com"
              className="block w-full py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold hover:bg-gray-200 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </motion.div>
      )}

      {/* ========================================================= */}
      {/* STATE: SUSPENDED ACCOUNT PAGE                              */}
      {/* ========================================================= */}
      {accountState === 'suspended' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl mx-auto bg-white dark:bg-[#111827] p-8 sm:p-10 rounded-3xl border border-red-200 dark:border-red-900/50 shadow-xl text-center space-y-6 mt-12"
        >
          <div className="w-16 h-16 rounded-3xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto border border-red-200/50">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Account Suspended</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Your account has been suspended due to a violation of our terms of service or community guidelines. If you believe this is a mistake, please reach out to our trust and safety team.
            </p>
          </div>

          <div className="pt-4">
            <a
              href="mailto:safety@gleamlearn.com"
              className="block w-full py-3.5 rounded-2xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors"
            >
              Appeal Suspension via Support
            </a>
          </div>
        </motion.div>
      )}

      {/* ========================================================= */}
      {/* STATE: DELETED / DEACTIVATED LANDING                       */}
      {/* ========================================================= */}
      {accountState === 'deleted' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl mx-auto bg-white dark:bg-[#111827] p-8 sm:p-10 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl text-center space-y-6 mt-12"
        >
          <div className="w-16 h-16 rounded-3xl bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center mx-auto">
            <Trash2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Account Successfully Deleted</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Your profile, personal data, and custom learning materials have been wiped or scheduled for permanent purging in accordance with our data retention policy.
            </p>
          </div>

          <div className="pt-4">
            <button
              onClick={() => setAccountState('active')}
              className="w-full py-3.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-bold hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Return to Home / Sign Up New
            </button>
          </div>
        </motion.div>
      )}

      {/* ========================================================= */}
      {/* STATE 60 & 62: ACTIVE SETTINGS CONTROLS                    -->
      {/* ========================================================= */}
      {accountState === 'active' && (
        <div className="max-w-3xl mx-auto space-y-6">
          
          <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white">Account State Controls</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Manage your account availability or permanently remove your data.</p>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              
              {/* Option 60: Freeze Account Trigger */}
              <div className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-500" />
                    <span>Freeze Account Temporarily</span>
                  </h3>
                  <p className="text-[11px] text-gray-500 max-w-md">Disables your learning activity, hides your public profile, and pauses notifications without deleting your progress.</p>
                </div>
                <button
                  onClick={() => setShowFreezeModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer shrink-0"
                >
                  Freeze Account
                </button>
              </div>

              {/* Option 62: Delete Account Trigger */}
              <div className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-red-500" />
                    <span>Delete Account Permanently</span>
                  </h3>
                  <p className="text-[11px] text-gray-500 max-w-md">Permanently remove your profile, streaks, uploaded documents, and subscription logs.</p>
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-100 transition-colors cursor-pointer shrink-0"
                >
                  Delete Account
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 60. FREEZE ACCOUNT CONFIRMATION MODAL                      */}
      {/* ========================================================= */}
      {showFreezeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl max-w-md w-full space-y-5 shadow-2xl border border-gray-200 dark:border-gray-800"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-200/50">
              <Lock className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-gray-900 dark:text-white">Freeze your account?</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Freezing your account temporarily disables your learning activity and public presence. You can reactivate anytime by logging back in.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowFreezeModal(false)}
                className="flex-1 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold cursor-pointer hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleFreezeAccount}
                className="flex-1 py-3 rounded-2xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-colors cursor-pointer shadow-md shadow-amber-500/20"
              >
                Freeze Account
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 62. DELETE ACCOUNT MODAL (Strong Confirmation Flow)         */}
      {/* ========================================================= */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl max-w-lg w-full space-y-6 shadow-2xl border border-red-200 dark:border-red-900/50 my-8"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 border border-red-200/50">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white">Delete Account</h3>
                <p className="text-xs text-red-600 dark:text-red-400 font-bold">This action is permanent and irreversible.</p>
              </div>
            </div>

            {/* What will be deleted vs retained */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              <div className="p-3.5 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 space-y-1.5">
                <span className="font-extrabold text-red-700 dark:text-red-400 block">What will be deleted:</span>
                <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                  <li>• Personal profile & leaderboard stats</li>
                  <li>• Custom flashcards & study notes</li>
                  <li>• Uploaded PDF documents & OCR scans</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 space-y-1.5">
                <span className="font-extrabold text-gray-700 dark:text-gray-300 block">What may be retained:</span>
                <ul className="space-y-1 text-gray-500">
                  <li>• Tax & financial transaction logs (legal requirement)</li>
                  <li>• Anonymized telemetry for platform stability</li>
                </ul>
              </div>
            </div>

            {/* Confirmation Form */}
            <form onSubmit={handleDeleteAccount} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                  Type <span className="text-red-600 font-extrabold">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  required
                  placeholder="DELETE"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs font-mono font-bold text-gray-900 dark:text-white focus:outline-hidden focus:border-red-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                  Enter your Password or PIN for verification:
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white focus:outline-hidden focus:border-red-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold cursor-pointer hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteConfirmationText !== 'DELETE' || !passwordInput}
                  className="flex-1 py-3 rounded-2xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-red-500/20"
                >
                  Delete Account
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}