'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { signOut } from '@/lib/learner-auth';
import { Sparkles, LogOut } from 'lucide-react';
import { ACCOUNT_SECTION, NAV_SECTIONS, isActiveHref } from './nav-sections';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  // Seven sections (nav-sections.ts); the Account section sits at the bottom
  const bottomNavItems = ACCOUNT_SECTION.items;

  const handleLogout = async () => {
    await signOut(); // deletes the learner token (the backend logout is stateless)
    router.replace('/auth/login');
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-[#111827] border-r border-gray-200 dark:border-gray-800 h-screen sticky top-0 z-30">
      {/* Brand Logo Header */}
      <div className="p-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-800/60">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 relative rounded-xl overflow-hidden flex items-center justify-center shadow-md shadow-blue-500/20 bg-white">
            <Image
              src="/gleamlearn-logo.jpg"
              alt="GleamLearn Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <span className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Gleam<span className="text-[var(--color-brand-blue)]">Learn</span>
          </span>
        </Link>
      </div>

      {/* Main Navigation Links */}
      <nav aria-label="Main" className="flex-1 overflow-y-auto px-4 py-5 space-y-4 scrollbar-thin">
        {NAV_SECTIONS.map((section) => (
        <div key={section.title} className="space-y-1">
        <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
          {section.title}
        </p>
        {section.items.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveHref(pathname, item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 active:scale-[0.98] ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-[var(--color-brand-blue)] dark:text-blue-400 font-semibold shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-[var(--color-brand-blue)] dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold px-1.5 py-0.5 rounded-md shadow-2xs">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
        </div>
        ))}
      </nav>

      {/* Bottom Section: Support, Settings & Logout */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800/60 space-y-1">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveHref(pathname, item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 active:scale-[0.98] ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-[var(--color-brand-blue)] dark:text-blue-400 font-semibold'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <span>{item.name}</span>
            </Link>
          );
        })}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 active:scale-[0.98] text-left"
        >
          <LogOut className="w-5 h-5" />
          <span>Log Out</span>
        </button>

        {/* Premium Upgrade Banner Card inside sidebar footer */}
        <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/10 rounded-full blur-xs pointer-events-none" />
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span className="text-xs font-bold uppercase tracking-wide text-amber-200">Go Premium</span>
          </div>
          <p className="text-xs text-blue-100 mb-2 leading-relaxed">
            Unlock unlimited AI tutor sessions & advanced exam prep.
          </p>
          <Link
            href="/premium"
            className="block text-center text-xs font-bold bg-white text-blue-900 py-1.5 rounded-xl hover:bg-blue-50 transition-colors shadow-xs"
          >
            Upgrade Now
          </Link>
        </div>
      </div>
    </aside>
  );
}