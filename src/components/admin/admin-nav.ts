// src/components/admin/admin-nav.ts
import { LayoutDashboard, Users, BookOpen, ClipboardCheck, ShieldAlert, Settings, UserCircle, type LucideIcon } from 'lucide-react';
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

/** Administrator navigation. Intentionally separate from the learner Sidebar/MobileNav. */
export const ADMIN_NAV: AdminNavItem[] = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard, connected: true, permission: 'admin.self' },
  { name: 'Users', href: '/admin/users', icon: Users, connected: true, permission: 'users.view' },
  { name: 'Learning content', href: '/admin/content', icon: BookOpen, connected: true, permission: 'content.manage' },
  { name: 'Assessments', href: '/admin/assessments', icon: ClipboardCheck, connected: true, permission: 'content.manage' },
  { name: 'Reports & moderation', href: '/admin/moderation', icon: ShieldAlert, connected: true, permission: 'moderation.manage' },
  { name: 'Platform settings', href: '/admin/settings', icon: Settings, connected: true, permission: 'settings.manage' },
];

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
