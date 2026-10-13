// src/app/admin/layout.tsx
import type { Metadata } from 'next';

// Admin pages must never be indexed. Access control itself is enforced by the backend
// (AdminJwtAuthGuard) and by the console session gate, not by this metadata.
export const metadata: Metadata = {
  title: 'GleamLearn Admin',
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
