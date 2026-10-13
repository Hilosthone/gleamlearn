// 'use client';

// import React, { useState } from 'react';
// import Sidebar from '@/components/layout/Sidebar';
// import Navbar from '@/components/layout/Navbar';
// import HamburgerMenu from '@/components/layout/HamburgerMenu';

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-[#0b0f19] flex">
//       {/* Desktop Sidebar */}
//       <Sidebar />

//       {/* Mobile Drawer Navigation */}
//       <HamburgerMenu 
//         isOpen={isMobileMenuOpen} 
//         onClose={() => setIsMobileMenuOpen(false)} 
//       />

//       {/* Main Content Area */}
//       <div className="flex-1 flex flex-col min-w-0">
//         <Navbar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />
        
//         <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }




'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import HamburgerMenu from '@/components/layout/HamburgerMenu';
import MobileNav from '@/components/layout/MobileNav'; // <--- Import MobileNav
import { OfflineBanner } from '@/components/ui/states';
import { LearnerSessionProvider } from '@/components/auth/LearnerSessionProvider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Every learner page requires a session confirmed by the backend (GET /auth/me)
  return (
    <LearnerSessionProvider>
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b0f19] flex">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Drawer Navigation (triggered from Navbar hamburger) */}
      <HamburgerMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0"> {/* Padding bottom for mobile nav bar */}
        <OfflineBanner />
        <Navbar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />
        
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav />
    </div>
    </LearnerSessionProvider>
  );
}