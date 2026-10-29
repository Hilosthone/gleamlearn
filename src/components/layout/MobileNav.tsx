// 'use client';

// import React from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { LayoutDashboard, BookOpen, Target, Bot, FolderKanban, GraduationCap } from 'lucide-react';

// export default function MobileNav() {
//   const pathname = usePathname();

//   // Top 5 primary actions for bottom bar
//   const mobileTabs = [
//     { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
//     { name: 'Learn', href: '/learn', icon: BookOpen },
//     { name: 'My Courses', href: '/my-courses', icon: GraduationCap },
//     { name: 'Library', href: '/library', icon: FolderKanban },
//     { name: 'Practice', href: '/practice', icon: Target },
//     { name: 'AI Tutor', href: '/ai', icon: Bot, badge: 'AI' },
//   ];

//   return (
//     <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#111827] border-t border-gray-200 dark:border-gray-800 z-40 px-2 py-1.5 shadow-lg">
//       <nav className="flex items-center justify-around">
//         {mobileTabs.map((tab) => {
//           const Icon = tab.icon;
//           const isActive = pathname === tab.href || (tab.href !== '/dashboard' && pathname.startsWith(tab.href));

//           return (
//             <Link
//               key={tab.name}
//               href={tab.href}
//               className={`flex flex-col items-center py-1.5 px-3 rounded-xl transition-all duration-200 active:scale-95 relative ${
//                 isActive
//                   ? 'text-[var(--color-brand-blue)] dark:text-blue-400 font-bold'
//                   : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-medium'
//               }`}
//             >
//               <div className="relative">
//                 <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />
//                 {tab.badge && (
//                   <span className="absolute -top-1 -right-2 text-[9px] bg-blue-600 text-white font-extrabold px-1 rounded-full scale-90">
//                     {tab.badge}
//                   </span>
//                 )}
//               </div>
//               <span className="text-[10px] mt-1 tracking-tight">{tab.name}</span>
//             </Link>
//           );
//         })}
//       </nav>
//     </div>
//   );
// }





'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, Target, Bot, FolderKanban, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MobileNav() {
  const pathname = usePathname();

  // Primary actions for bottom bar
  const mobileTabs = [
    { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Learn', href: '/learn', icon: BookOpen },
    { name: 'My Courses', href: '/my-courses', icon: GraduationCap },
    { name: 'Library', href: '/library', icon: FolderKanban },
    { name: 'Practice', href: '/practice', icon: Target },
    { name: 'AI Tutor', href: '/ai', icon: Bot, badge: 'AI' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md border-t border-gray-200/60 dark:border-gray-800/60 z-40 px-2 py-2 shadow-lg">
      <nav className="flex items-center justify-around relative">
        {mobileTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href || (tab.href !== '/dashboard' && pathname.startsWith(tab.href));

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex flex-col items-center py-1.5 px-2.5 rounded-2xl relative transition-colors duration-200 ${
                isActive
                  ? 'text-[var(--color-brand-blue)] dark:text-blue-400 font-bold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-medium'
              }`}
            >
              {/* OPay-style Glassy Pill Background Animation */}
              {isActive && (
                <motion.div
                  layoutId="glassy-pill"
                  className="absolute inset-0 bg-blue-500/10 dark:bg-blue-400/15 backdrop-blur-sm border border-blue-500/20 dark:border-blue-400/30 rounded-2xl shadow-xs"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              <div className="relative z-10">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2.5 text-[9px] bg-blue-600 text-white font-extrabold px-1 rounded-full scale-90 shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight relative z-10">{tab.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}