// src/components/admin/RequirePermission.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import type { AdminPermissionName } from '@/lib/admin-api';
import { EmptyState } from '@/components/ui/states';
import { useAdminSession } from './AdminSessionProvider';

/**
 * Hides a section the admin's role does not include (e.g. when opened by direct URL).
 * This only avoids pointless requests and confusing errors: the BACKEND enforces the
 * permission on every endpoint and returns 403 regardless of what the UI shows.
 */
export function RequirePermission({ permission, children }: { permission: AdminPermissionName; children: React.ReactNode }) {
  const { can, admin } = useAdminSession();
  if (can(permission)) return <>{children}</>;
  return (
    <EmptyState
      icon={ShieldAlert}
      title="Not available for your role"
      description={`Your role (${admin.role}) does not include access to this section. Ask a Super Admin if you need it.`}
      action={
        <Link href="/admin" className="text-xs font-semibold text-[var(--color-brand-blue)] underline">
          Back to overview
        </Link>
      }
    />
  );
}
