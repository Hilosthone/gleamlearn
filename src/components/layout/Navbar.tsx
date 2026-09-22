// 'use client';

// import React, { useState } from 'react';
// import { Menu, Bell, Zap, Flame, Coins, User, Settings, LogOut } from 'lucide-react';
// import Link from 'next/link';

// interface NavbarProps {
//   onOpenMobileMenu: () => void;
// }

// export default function Navbar({ onOpenMobileMenu }: NavbarProps) {
//   const [showProfileDropdown, setShowProfileDropdown] = useState(false);

//   return (
//     <header className="h-16 bg-white dark:bg-[#111827] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20 px-4 sm:px-8 flex items-center justify-between">
//       {/* Left side: Hamburger menu trigger for mobile/tablet + Page context */}
//       <div className="flex items-center gap-3">
//         <button
//           onClick={onOpenMobileMenu}
//           className="lg:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
//           aria-label="Open Menu"
//         >
//           <Menu className="w-5 h-5" />
//         </button>

//         {/* Quick welcome text or breadcrumb placeholder */}
//         <div className="hidden sm:block">
//           <h2 className="text-sm font-bold text-gray-900 dark:text-white">Welcome back, Student 👋</h2>
//           <p className="text-xs text-gray-500 dark:text-gray-400">Ready to crush your study goals today?</p>
//         </div>
//       </div>

//       {/* Right side: Gamification stats & Profile */}
//       <div className="flex items-center gap-2 sm:gap-4">
//         {/* Streak Counter Badge */}
//         <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-950/30 border border-orange-200/60 dark:border-orange-900/40 text-orange-600 dark:text-orange-400 text-xs font-bold shadow-2xs">
//           <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
//           <span>5 Days</span>
//         </div>

//         {/* XP Counter Badge */}
//         <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-[var(--color-brand-blue)] dark:text-blue-400 text-xs font-bold shadow-2xs">
//           <Zap className="w-4 h-4 fill-blue-500 text-blue-500" />
//           <span>1,240 XP</span>
//         </div>

//         {/* Coins Counter Badge */}
//         <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-amber-600 dark:text-amber-400 text-xs font-bold shadow-2xs">
//           <Coins className="w-4 h-4 text-amber-500 fill-amber-500" />
//           <span>350</span>
//         </div>

//         {/* Notification Bell */}
//         <button className="relative p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
//           <Bell className="w-5 h-5" />
//           <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#111827]" />
//         </button>

//         {/* Profile Avatar & Dropdown */}
//         <div className="relative">
//           <button
//             onClick={() => setShowProfileDropdown(!showProfileDropdown)}
//             className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-transparent hover:ring-blue-400 transition-all cursor-pointer"
//           >
//             HS
//           </button>

//           {showProfileDropdown && (
//             <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1f2937] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
//               <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
//                 <p className="text-xs font-bold text-gray-900 dark:text-white">Hilosthone Sulyman</p>
//                 <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">Computer Science & Eng.</p>
//               </div>
//               <div className="py-1">
//                 <Link
//                   href="/settings"
//                   onClick={() => setShowProfileDropdown(false)}
//                   className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
//                 >
//                   <User className="w-4 h-4 text-gray-400" />
//                   <span>My Profile</span>
//                 </Link>
//                 <Link
//                   href="/settings"
//                   onClick={() => setShowProfileDropdown(false)}
//                   className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
//                 >
//                   <Settings className="w-4 h-4 text-gray-400" />
//                   <span>Settings</span>
//                 </Link>
//               </div>
//               <div className="border-t border-gray-100 dark:border-gray-700 pt-1">
//                 <Link
//                   href="/onboarding"
//                   className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
//                 >
//                   <LogOut className="w-4 h-4" />
//                   <span>Log out</span>
//                 </Link>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </header>
//   );
// }



'use client';

import React, { useState, useEffect } from 'react';
import { Menu, Bell, Zap, Flame, Coins, User, Settings, LogOut, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  onOpenMobileMenu: () => void;
}

export default function Navbar({ onOpenMobileMenu }: NavbarProps) {
  const router = useRouter();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Sync initial theme state with document class on mount
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark') || 
      localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Toggle Theme Handler
  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const handleLogout = () => {
    setShowProfileDropdown(false);
    router.push('/auth/login');
  };

  return (
    <header className="h-16 bg-white dark:bg-[#111827] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20 px-4 sm:px-8 flex items-center justify-between">
      {/* Left side: Hamburger menu trigger for mobile/tablet + Page context */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Quick welcome text or breadcrumb placeholder */}
        <div className="hidden sm:block">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Welcome back, Student 👋</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Ready to crush your study goals today?</p>
        </div>
      </div>

      {/* Right side: Gamification stats, Theme Toggle, Notification & Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Streak Counter Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-950/30 border border-orange-200/60 dark:border-orange-900/40 text-orange-600 dark:text-orange-400 text-xs font-bold shadow-2xs">
          <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
          <span>5 Days</span>
        </div>

        {/* XP Counter Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-[var(--color-brand-blue)] dark:text-blue-400 text-xs font-bold shadow-2xs">
          <Zap className="w-4 h-4 fill-blue-500 text-blue-500" />
          <span>1,240 XP</span>
        </div>

        {/* Coins Counter Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-amber-600 dark:text-amber-400 text-xs font-bold shadow-2xs">
          <Coins className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>350</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {/* Notification Bell */}
        <button className="relative p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#111827]" />
        </button>

        {/* Profile Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-transparent hover:ring-blue-400 transition-all cursor-pointer"
          >
            HS
          </button>

          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1f2937] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                <p className="text-xs font-bold text-gray-900 dark:text-white">Hilosthone Sulyman</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">Computer Science & Eng.</p>
              </div>
              <div className="py-1">
                <Link
                  href="/settings"
                  onClick={() => setShowProfileDropdown(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <User className="w-4 h-4 text-gray-400" />
                  <span>My Profile</span>
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setShowProfileDropdown(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Settings className="w-4 h-4 text-gray-400" />
                  <span>Settings</span>
                </Link>
              </div>
              <div className="border-t border-gray-100 dark:border-gray-700 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}