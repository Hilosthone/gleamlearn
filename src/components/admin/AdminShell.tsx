// src/components/admin/AdminShell.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LogOut, Menu, ShieldCheck, X } from 'lucide-react';
import { OfflineBanner } from '@/components/ui/states';
import { useAdminSession } from './AdminSessionProvider';
import { ADMIN_ACCOUNT_NAV, ADMIN_NAV, isActivePath, visibleNavItems, type AdminNavItem } from './admin-nav';

function NavLinks({ items, pathname, onNavigate }: { items: AdminNavItem[]; pathname: string; onNavigate?: () => void }) {
  return (
    <>
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActivePath(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={`flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-blue)] ${
              active
                ? 'bg-blue-50 dark:bg-blue-950/40 text-[var(--color-brand-blue)] dark:text-blue-400 font-semibold shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span className="flex items-center gap-3">
              <Icon className={`w-5 h-5 ${active ? 'text-[var(--color-brand-blue)] dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} aria-hidden="true" />
              {item.name}
            </span>
            {!item.connected && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                Soon
              </span>
            )}
          </Link>
        );
      })}
    </>
  );
}

function Brand() {
  return (
    <Link href="/admin" className="flex items-center gap-2.5">
      <div className="w-9 h-9 relative rounded-xl overflow-hidden shadow-md shadow-blue-500/20 bg-white">
        <Image src="/gleamlearn-logo.jpg" alt="gleamLearn Logo" fill className="object-cover" priority />
      </div>
      <span className="flex flex-col leading-tight">
        <span className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
          gleam<span className="text-[var(--color-brand-blue)]">Learn</span>
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-purple)]">Admin console</span>
      </span>
    </Link>
  );
}

/** Admin console layout: own sidebar, top bar and mobile drawer — no learner navigation. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { admin, can, logout } = useAdminSession();
  const navItems = visibleNavItems(ADMIN_NAV, can);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    await logout();
  };

  const sidebarBody = (onNavigate?: () => void) => (
    <>
      <nav aria-label="Admin" className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
        <p className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Manage</p>
        <NavLinks items={navItems} pathname={pathname} onNavigate={onNavigate} />
      </nav>
      <div className="p-4 border-t border-gray-100 dark:border-gray-800/60 space-y-1">
        <NavLinks items={ADMIN_ACCOUNT_NAV} pathname={pathname} onNavigate={onNavigate} />
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 disabled:opacity-50 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          <LogOut className="w-5 h-5" aria-hidden="true" />
          {loggingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b0f19] flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-[#111827] border-r border-gray-200 dark:border-gray-800 h-screen sticky top-0 z-30">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800/60">
          <Brand />
        </div>
        {sidebarBody()}
      </aside>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="Admin navigation">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <aside className="relative flex flex-col w-72 max-w-[85%] bg-white dark:bg-[#111827] h-full shadow-xl">
            <div className="p-5 flex items-center justify-between border-b border-gray-100 dark:border-gray-800/60">
              <Brand />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            {sidebarBody(() => setMenuOpen(false))}
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <OfflineBanner />
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-[#111827]/80 backdrop-blur border-b border-gray-200 dark:border-gray-800 px-4 sm:px-8 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open admin menu"
              aria-expanded={menuOpen}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-brand-purple)] bg-purple-50 dark:bg-purple-950/30 px-2.5 py-1 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              Administrator
            </span>
          </div>
          <div className="text-right min-w-0">
            <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{admin.fullName || admin.email}</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{admin.role}</p>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
