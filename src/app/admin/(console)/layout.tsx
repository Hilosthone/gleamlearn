// src/app/admin/(console)/layout.tsx
'use client';

import { AdminSessionProvider } from '@/components/admin/AdminSessionProvider';
import { AdminShell } from '@/components/admin/AdminShell';

/** Every page in this group requires a backend-confirmed admin session. */
export default function AdminConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminSessionProvider>
      <AdminShell>{children}</AdminShell>
    </AdminSessionProvider>
  );
}
