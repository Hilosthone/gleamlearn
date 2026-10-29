// src/components/admin/admin-nav.ts
import {
  LayoutDashboard,
  Users,
  Building2,
  BookOpen,
  ClipboardCheck,
  Library,
  ShieldAlert,
  Trophy,
  Wallet,
  BarChart3,
  Lock,
  Server,
  Megaphone,
  Settings,
  UserCircle,
  type LucideIcon,
} from 'lucide-react';
import type { AdminPermissionName } from '@/lib/admin-api';

export interface AdminNavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  /** false = page exists but is not yet connected to a verified backend endpoint */
  connected: boolean;
  /** Permission the backend requires for this section; the item is hidden when the admin lacks it. */
  permission: AdminPermissionName;
}

export interface AdminNavSection {
  title: string;
  items: AdminNavItem[];
}

/** Administrator navigation in ten groups. Intentionally separate from the learner Sidebar/MobileNav. */
export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  { title: 'Overview', items: [{ name: 'Overview', href: '/admin', icon: LayoutDashboard, connected: true, permission: 'admin.self' }] },
  {
    title: 'Users & academics',
    items: [
      { name: 'Users', href: '/admin/users', icon: Users, connected: true, permission: 'users.view' },
      { name: 'School directory', href: '/admin/academic', icon: Building2, connected: true, permission: 'content.manage' },
    ],
  },
  { title: 'Learning content', items: [{ name: 'Courses & lessons', href: '/admin/content', icon: BookOpen, connected: true, permission: 'content.manage' }] },
  {
    title: 'Assessments & questions',
    items: [
      { name: 'Quizzes, tests & exams', href: '/admin/assessments', icon: ClipboardCheck, connected: true, permission: 'content.manage' },
      { name: 'Question bank', href: '/admin/question-bank', icon: Library, connected: true, permission: 'content.manage' },
    ],
  },
  { title: 'AI & moderation', items: [{ name: 'Reports & moderation', href: '/admin/moderation', icon: ShieldAlert, connected: true, permission: 'moderation.manage' }] },
  { title: 'Gamification', items: [{ name: 'Gamification', href: '/admin/gamification', icon: Trophy, connected: true, permission: 'analytics.view' }] },
  { title: 'Subscriptions & finance', items: [{ name: 'Finance', href: '/admin/finance', icon: Wallet, connected: true, permission: 'finance.view' }] },
  { title: 'Reports & analytics', items: [{ name: 'Analytics & exports', href: '/admin/analytics', icon: BarChart3, connected: true, permission: 'analytics.view' }] },
  { title: 'Security & administration', items: [{ name: 'Security & access', href: '/admin/security', icon: Lock, connected: true, permission: 'security.view' }] },
  {
    title: 'System & configuration',
    items: [
      { name: 'System health', href: '/admin/system', icon: Server, connected: true, permission: 'system.view' },
      { name: 'Notifications', href: '/admin/notifications', icon: Megaphone, connected: true, permission: 'notifications.send' },
      { name: 'Platform settings', href: '/admin/settings', icon: Settings, connected: true, permission: 'settings.manage' },
    ],
  },
];

/** Flat list (kept for code that needs every item, e.g. the overview's quick links). */
export const ADMIN_NAV: AdminNavItem[] = ADMIN_NAV_SECTIONS.flatMap((s) => s.items);

export const ADMIN_ACCOUNT_NAV: AdminNavItem[] = [
  { name: 'My admin profile', href: '/admin/profile', icon: UserCircle, connected: true, permission: 'admin.self' },
];

export function isActivePath(pathname: string, href: string): boolean {
  return href === '/admin' ? pathname === '/admin' : pathname === href || pathname.startsWith(`${href}/`);
}

/** Items the admin's role can use (UI only — the backend enforces the same permissions). */
export function visibleNavItems(items: AdminNavItem[], can: (permission: AdminPermissionName) => boolean): AdminNavItem[] {
  return items.filter((item) => can(item.permission));
}

/** Sections with at least one item the admin's role can use. */
export function visibleNavSections(can: (permission: AdminPermissionName) => boolean): AdminNavSection[] {
  return ADMIN_NAV_SECTIONS.map((s) => ({ ...s, items: visibleNavItems(s.items, can) })).filter((s) => s.items.length > 0);
}
