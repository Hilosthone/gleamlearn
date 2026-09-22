// 'use client';

// import React from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { 
//   LayoutDashboard, 
//   BookOpen, 
//   FolderKanban, 
//   Target, 
//   GraduationCap, 
//   Bot, 
//   Calendar, 
//   TrendingUp, 
//   Settings as SettingsIcon, 
//   HelpCircle,
//   X,
//   Sparkles
// } from 'lucide-react';

// interface HamburgerMenuProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// export default function HamburgerMenu({ isOpen, onClose }: HamburgerMenuProps) {
//   const pathname = usePathname();

//   const navItems = [
//     { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
//     { name: 'Learn', href: '/learn', icon: BookOpen },
//     { name: 'Library', href: '/library', icon: FolderKanban },
//     { name: 'Practice', href: '/practice', icon: Target },
//     { name: 'Exams', href: '/exams', icon: GraduationCap },
//     { name: 'AI Assistant', href: '/ai', icon: Bot, badge: 'AI' },
//     { name: 'Planner', href: '/planner', icon: Calendar },
//     { name: 'Progress', href: '/progress', icon: TrendingUp },
//     { name: 'Settings', href: '/settings', icon: SettingsIcon },
//     { name: 'Help & Support', href: '/support', icon: HelpCircle },
//   ];

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 lg:hidden">
//       {/* Backdrop overlay */}
//       <div 
//         className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs transition-opacity"
//         onClick={onClose}
//       />

//       {/* Drawer Container */}
//       <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#111827] shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-200">
//         {/* Header */}
//         <div className="p-5 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
//           <div className="flex items-center gap-2.5">
//             <div className="w-8 h-8 rounded-xl bg-[var(--color-brand-blue)] flex items-center justify-center text-white font-black">
//               gL
//             </div>
//             <span className="text-lg font-extrabold text-gray-900 dark:text-white">
//               gleam<span className="text-[var(--color-brand-blue)]">Learn</span>
//             </span>
//           </div>
//           <button 
//             onClick={onClose}
//             className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         {/* Links list */}
//         <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
//           {navItems.map((item) => {
//             const Icon = item.icon;
//             const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            
//             return (
//               <Link
//                 key={item.name}
//                 href={item.href}
//                 onClick={onClose}
//                 className={`flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all ${
//                   isActive
//                     ? 'bg-blue-50 dark:bg-blue-950/40 text-[var(--color-brand-blue)] dark:text-blue-400 font-semibold'
//                     : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
//                 }`}
//               >
//                 <div className="flex items-center gap-3">
//                   <Icon className={`w-5 h-5 ${isActive ? 'text-[var(--color-brand-blue)] dark:text-blue-400' : 'text-gray-400'}`} />
//                   <span>{item.name}</span>
//                 </div>
//                 {item.badge && (
//                   <span className="text-[10px] bg-blue-600 text-white font-bold px-1.5 py-0.5 rounded-md">
//                     {item.badge}
//                   </span>
//                 )}
//               </Link>
//             );
//           })}
//         </div>

//         {/* Footer banner */}
//         <div className="p-4 border-t border-gray-100 dark:border-gray-800">
//           <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md">
//             <div className="flex items-center gap-2 mb-1">
//               <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
//               <span className="text-xs font-bold uppercase tracking-wide text-amber-200">Go Premium</span>
//             </div>
//             <p className="text-xs text-blue-100 mb-2">Unlock unlimited AI tutor sessions.</p>
//             <Link
//               href="/support"
//               onClick={onClose}
//               className="block text-center text-xs font-bold bg-white text-blue-900 py-2 rounded-xl"
//             >
//               Upgrade Now
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  FolderKanban, 
  Target, 
  GraduationCap, 
  Bot, 
  Calendar, 
  TrendingUp, 
  Settings as SettingsIcon, 
  HelpCircle,
  X,
  Sparkles,
  LogOut
} from 'lucide-react';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HamburgerMenu({ isOpen, onClose }: HamburgerMenuProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Learn', href: '/learn', icon: BookOpen },
    { name: 'Library', href: '/library', icon: FolderKanban },
    { name: 'Practice', href: '/practice', icon: Target },
    { name: 'Exams', href: '/exams', icon: GraduationCap },
    { name: 'AI Assistant', href: '/ai', icon: Bot, badge: 'AI' },
    { name: 'Planner', href: '/planner', icon: Calendar },
    { name: 'Progress', href: '/progress', icon: TrendingUp },
    { name: 'Settings', href: '/settings', icon: SettingsIcon },
    { name: 'Help & Support', href: '/support', icon: HelpCircle },
  ];

  const handleLogout = () => {
    onClose();
    router.push('/auth/login');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#111827] shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="p-5 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 relative rounded-xl overflow-hidden flex items-center justify-center shadow-md shadow-blue-500/20 bg-white">
              <Image 
                src="/gleamlearn-logo.jpg" 
                alt="gleamLearn Logo" 
                fill
                className="object-cover"
                priority
              />
            </div>
            <span className="text-lg font-extrabold text-gray-900 dark:text-white">
              gleam<span className="text-[var(--color-brand-blue)]">Learn</span>
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Links list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-thin">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-[var(--color-brand-blue)] dark:text-blue-400 font-semibold'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[var(--color-brand-blue)] dark:text-blue-400' : 'text-gray-400'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] bg-blue-600 text-white font-bold px-1.5 py-0.5 rounded-md">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all text-left mt-2"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </button>
        </div>

        {/* Footer banner */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span className="text-xs font-bold uppercase tracking-wide text-amber-200">Go Premium</span>
            </div>
            <p className="text-xs text-blue-100 mb-2">Unlock unlimited AI tutor sessions.</p>
            <Link
              href="/support"
              onClick={onClose}
              className="block text-center text-xs font-bold bg-white text-blue-900 py-2 rounded-xl"
            >
              Upgrade Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}