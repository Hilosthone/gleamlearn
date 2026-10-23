// src/app/auth/signup/page.tsx
import type { Metadata } from 'next';
import { RegistrationWizard } from '@/components/auth/registration/RegistrationWizard';

export const metadata: Metadata = {
  title: 'Create your account · GleamLearn',
  description: 'Register as a secondary school student, a university student, or for examination preparation.',
};

/** Adaptive registration (see src/components/auth/registration and docs/REGISTRATION.md). */
export default function SignUpPage() {
  return <RegistrationWizard />;
}
