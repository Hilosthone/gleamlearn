'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Unlock, Trash2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { usersApi } from '@/lib/api';
import { ApiError } from '@/lib/api-error';
import { signOut } from '@/lib/learner-auth';
import { clearStoredToken } from '@/lib/session';
import { useLearnerSession } from '@/components/auth/LearnerSessionProvider';
import { Alert } from '@/components/ui/Alert';
import { SlowNotice } from '@/components/ui/states';
import { useSlowFlag } from '@/hooks/useSlowFlag';

/**
 * Account state, driven by the backend (GET /auth/me → accountStatus):
 *  - active: freeze (POST /users/me/freeze) or delete (DELETE /users/me { password })
 *  - frozen: the only page a frozen account can use; reactivate with POST /users/me/unfreeze
 * Restricted accounts never reach this page (the session gate shows the restricted screen).
 * Deletion is a SOFT delete on the backend: sign-in is disabled and the data is retained.
 */
export default function AccountStatePage() {
  const router = useRouter();
  const { accountStatus, refresh } = useLearnerSession();
  const [showFreeze, setShowFreeze] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState<'freeze' | 'unfreeze' | 'delete' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleted, setDeleted] = useState(false);
  const isSlow = useSlowFlag(pending !== null);

  const run = async (kind: 'freeze' | 'unfreeze' | 'delete', action: () => Promise<unknown>, onDone: () => void | Promise<void>) => {
    if (pending) return;
    setPending(kind);
    setError(null);
    try {
      await action();
      await onDone();
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError('Something went wrong.', null, 'unknown');
      setError(
        kind === 'delete' && apiError.status === 400
          ? apiError.message // "Enter your password…" / "Incorrect password"
          : apiError.kind === 'rate_limited'
            ? 'Too many attempts. Please wait a moment and try again.'
            : apiError.kind === 'network'
              ? 'We could not reach GleamLearn. Check your connection and try again.'
              : 'The change could not be made. Please try again.',
      );
    } finally {
      setPending(null);
    }
  };

  if (deleted) {
    return (
      <div className="w-full min-h-[60vh] flex items-start justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl w-full bg-white dark:bg-[#111827] p-8 sm:p-10 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl text-center space-y-6 mt-12">
          <div className="w-16 h-16 rounded-3xl bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center mx-auto">
            <Trash2 className="w-8 h-8" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Account deleted</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              You can no longer sign in to this account. Your data is retained by GleamLearn and is not erased automatically; contact support to ask about removal.
            </p>
          </div>
          <button type="button" onClick={() => router.replace('/welcome')} className="w-full py-3.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-bold hover:bg-gray-200 transition-colors">
            Return to home
          </button>
        </motion.div>
      </div>
    );
  }

  if (accountStatus === 'frozen') {
    return (
      <div className="w-full min-h-[60vh] flex items-start justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl w-full bg-white dark:bg-[#111827] p-8 sm:p-10 rounded-3xl border border-amber-200 dark:border-amber-900/50 shadow-xl text-center space-y-6 mt-12">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-200/50">
            <Lock className="w-8 h-8" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Your account is frozen</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">While frozen, the rest of GleamLearn is unavailable to this account. Reactivate it to continue learning.</p>
          </div>
          {isSlow && <SlowNotice />}
          {error && <Alert variant="error">{error}</Alert>}
          <button
            type="button"
            disabled={pending !== null}
            onClick={() => run('unfreeze', () => usersApi.unfreezeAccount(), async () => { await refresh(); router.replace('/dashboard'); })}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold hover:opacity-95 transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Unlock className="w-4 h-4" aria-hidden="true" />
            <span>{pending === 'unfreeze' ? 'Reactivating…' : 'Reactivate account'}</span>
          </button>
          <button type="button" onClick={async () => { await signOut(); router.replace('/auth/login'); }} className="block w-full py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold hover:bg-gray-200 transition-colors">
            Sign out
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full pb-16 space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Account state</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Pause your account, or delete it.</p>
      </div>

      {error && !showDelete && !showFreeze && <Alert variant="error">{error}</Alert>}

      <section className="bg-white dark:bg-[#111827] rounded-3xl border border-gray-200 dark:border-gray-800 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-500" aria-hidden="true" /> Freeze account
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Pauses your account. You can still sign in, but only to reactivate it.</p>
          </div>
          <button type="button" onClick={() => { setError(null); setShowFreeze(true); }} className="px-4 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600">
            Freeze account
          </button>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
              <Trash2 className="w-4 h-4" aria-hidden="true" /> Delete account
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Disables sign-in for good. Your data is retained, not erased.</p>
          </div>
          <button type="button" onClick={() => { setError(null); setConfirmText(''); setPassword(''); setShowDelete(true); }} className="px-4 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700">
            Delete account
          </button>
        </div>
      </section>

      {showFreeze && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60" role="dialog" aria-modal="true" aria-labelledby="freeze-title">
          <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl max-w-md w-full space-y-5 shadow-2xl border border-gray-200 dark:border-gray-800">
            <h3 id="freeze-title" className="text-lg font-black text-gray-900 dark:text-white">Freeze your account?</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">While frozen, everything except reactivating is unavailable. Reactivate any time by signing in.</p>
            {isSlow && <SlowNotice />}
            {error && <Alert variant="error">{error}</Alert>}
            <div className="flex gap-3">
              <button type="button" disabled={pending !== null} onClick={() => setShowFreeze(false)} className="flex-1 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold">
                Cancel
              </button>
              <button
                type="button"
                disabled={pending !== null}
                onClick={() => run('freeze', () => usersApi.freezeAccount(), async () => { setShowFreeze(false); await refresh(); })}
                className="flex-1 py-3 rounded-2xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 disabled:opacity-50"
              >
                {pending === 'freeze' ? 'Freezing…' : 'Freeze account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="delete-title">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (confirmText !== 'DELETE' || !password) return;
              // The deleted account's token is now rejected, so remove it locally (calling logout would answer 401)
              run('delete', () => usersApi.deleteMe(password), () => { setShowDelete(false); clearStoredToken('learner'); setDeleted(true); });
            }}
            className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl max-w-lg w-full space-y-5 shadow-2xl border border-red-200 dark:border-red-900/50 my-8"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" aria-hidden="true" />
              </div>
              <div>
                <h3 id="delete-title" className="text-lg font-black text-gray-900 dark:text-white">Delete account</h3>
                <p className="text-xs text-red-600 dark:text-red-400 font-bold">You will not be able to sign in again.</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Your account is deactivated and sign-in is disabled. Your learning data is <strong>retained</strong> by GleamLearn and is not erased automatically.
            </p>
            <label className="block space-y-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
              <span>Type DELETE to confirm</span>
              <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} autoComplete="off" disabled={pending !== null} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B0F19] text-sm" />
            </label>
            <label className="block space-y-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
              <span>Your password</span>
              <span className="relative block">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" disabled={pending !== null} className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B0F19] text-sm" />
                <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </span>
            </label>
            {isSlow && <SlowNotice />}
            {error && <Alert variant="error">{error}</Alert>}
            <div className="flex gap-3">
              <button type="button" disabled={pending !== null} onClick={() => setShowDelete(false)} className="flex-1 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold">
                Cancel
              </button>
              <button type="submit" disabled={confirmText !== 'DELETE' || !password || pending !== null} className="flex-1 py-3 rounded-2xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed">
                {pending === 'delete' ? 'Deleting…' : 'Delete account'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
