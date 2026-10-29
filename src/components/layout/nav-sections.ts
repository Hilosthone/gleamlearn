/**
 * The learner navigation, grouped into seven sections. Shared by the desktop Sidebar and the mobile HamburgerMenu so
 * the two never drift apart. The last section (Account) sits at the bottom of the desktop sidebar.
 */
import {
  Bell,
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
  History,
  ClipboardList,
} from 'lucide-react';

export interface NavItem {
  name: string;
  href: string;
  icon: typeof Bell;
  badge?: string;
}
export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  { title: 'Home', items: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Notifications', href: '/notifications', icon: Bell },
  ] },
  { title: 'Learn', items: [
    { name: 'Learn', href: '/learn', icon: BookOpen },
    { name: 'My Courses', href: '/my-courses', icon: GraduationCap },
    { name: 'Library', href: '/library', icon: FolderKanban },
  ] },
  { title: 'AI', items: [{ name: 'AI Assistant', href: '/ai', icon: Bot, badge: 'AI' }] },
  { title: 'Practice & exams', items: [
    { name: 'Practice', href: '/practice', icon: Target },
    { name: 'Exams', href: '/exams', icon: ClipboardList },
  ] },
  { title: 'Plan', items: [{ name: 'Planner', href: '/planner', icon: Calendar }] },
  { title: 'Progress', items: [
    { name: 'Progress', href: '/progress', icon: TrendingUp },
    { name: 'History', href: '/history', icon: History },
  ] },
];

export const ACCOUNT_SECTION: NavSection = {
  title: 'Account',
  items: [
    { name: 'Settings', href: '/settings', icon: SettingsIcon },
    { name: 'Help & Support', href: '/support', icon: HelpCircle },
  ],
};

/** the item's page or one of its sub-pages */
export const isActiveHref = (pathname: string, href: string) => pathname === href || (href !== '/dashboard' && pathname.startsWith(`${href}/`));
