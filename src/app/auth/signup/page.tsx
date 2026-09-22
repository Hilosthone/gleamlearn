// // src/app/auth/signup/page.tsx
// 'use client';

// import React, { useState } from 'react';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import { Input } from '@/components/ui/Input';
// import { Button } from '@/components/ui/Button';

// export default function SignUpPage() {
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     fullName: '',
//     username: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//   });

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);

//     // Simulate backend signup validation, then seamlessly redirect to the Onboarding wizard
//     setTimeout(() => {
//       setIsLoading(false);
//       router.push('/onboarding');
//     }, 1200);
//   };

//   return (
//     <main className="min-h-screen flex flex-col justify-center bg-white dark:bg-[#0B0F19] px-6 py-10 max-w-md mx-auto transition-colors duration-300">
      
//       {/* Header */}
//       <div className="mb-8 space-y-2">
//         <Link href="/welcome" className="text-xs font-semibold text-[var(--color-brand-blue)] hover:underline">
//           ← Back
//         </Link>
//         <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Create an Account</h1>
//         <p className="text-sm text-gray-500 dark:text-gray-400">
//           Start your personalized learning journey with gleamLearn.
//         </p>
//       </div>

//       {/* Form */}
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <Input
//           label="Full Name"
//           name="fullName"
//           placeholder="Hilosthone Sulyman"
//           value={formData.fullName}
//           onChange={handleChange}
//           required
//         />

//         <Input
//           label="Username"
//           name="username"
//           placeholder="hilosthone"
//           value={formData.username}
//           onChange={handleChange}
//           required
//         />

//         <Input
//           label="Email Address"
//           type="email"
//           name="email"
//           placeholder="name@example.com"
//           value={formData.email}
//           onChange={handleChange}
//           required
//         />

//         <Input
//           label="Password"
//           type="password"
//           name="password"
//           placeholder="At least 8 characters"
//           value={formData.password}
//           onChange={handleChange}
//           required
//         />

//         <Input
//           label="Confirm Password"
//           type="password"
//           name="confirmPassword"
//           placeholder="Re-enter your password"
//           value={formData.confirmPassword}
//           onChange={handleChange}
//           required
//         />

//         <div className="pt-2">
//           <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
//             Create Account
//           </Button>
//         </div>
//       </form>

//       {/* Footer login redirect */}
//       <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
//         Already have an account?{' '}
//         <Link href="/auth/login" className="font-semibold text-[var(--color-brand-blue)] hover:underline">
//           Log in
//         </Link>
//       </p>

//     </main>
//   );
// }



// src/app/auth/signup/page.tsx
// src/app/auth/signup/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Eye, EyeOff, Check, X, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Custom Modal Alert State
  const [modalAlert, setModalAlert] = useState<{ isOpen: boolean; title: string; message: string }>({
    isOpen: false,
    title: '',
    message: '',
  });

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    dob: '',
    termsAccepted: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  // Real-time Password Strength Checkers
  const password = formData.password;
  const strengthChecks = useMemo(() => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };
  }, [password]);

  const passedChecksCount = Object.values(strengthChecks).filter(Boolean).length;
  const strengthPercentage = (passedChecksCount / 4) * 100;

  const getStrengthLabel = () => {
    if (password.length === 0) return { text: '', color: 'bg-gray-200 dark:bg-gray-800' };
    if (passedChecksCount <= 1) return { text: 'Weak', color: 'bg-red-500' };
    if (passedChecksCount <= 3) return { text: 'Medium', color: 'bg-amber-500' };
    return { text: 'Strong', color: 'bg-brand-green' };
  };

  const strengthInfo = getStrengthLabel();
  const doPasswordsMatch = formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword;

  const showAlert = (title: string, message: string) => {
    setModalAlert({ isOpen: true, title, message });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.termsAccepted) {
      showAlert("Terms Required", "Please accept the terms and conditions to proceed with your registration.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showAlert("Password Mismatch", "Your confirmation password does not match. Please verify and try again.");
      return;
    }
    
    setIsLoading(true);

    // Simulate backend signup validation, then seamlessly redirect to the Onboarding wizard
    setTimeout(() => {
      setIsLoading(false);
      router.push('/onboarding');
    }, 1200);
  };

  return (
    <main className="min-h-screen flex flex-col justify-center bg-gradient-to-b from-white via-gray-50 to-gray-100 dark:from-[#0B0F19] dark:via-[#111827] dark:to-[#0B0F19] px-6 py-10 max-w-md mx-auto transition-colors duration-300 relative">
      
      {/* Custom Modal Alert Dialog */}
      <AnimatePresence>
        {modalAlert.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 p-6 shadow-2xl space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1.5">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{modalAlert.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{modalAlert.message}</p>
              </div>
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => setModalAlert({ isOpen: false, title: '', message: '' })}
              >
                Got It
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 space-y-2"
      >
        <Link href="/welcome" className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-blue hover:underline mb-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Welcome
        </Link>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Create an Account</h1>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Start your personalized AI learning journey with gleamLearn.
        </p>
      </motion.div>

      {/* Form */}
      <motion.form 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit} 
        className="space-y-4"
      >
        <Input
          label="Full Name"
          name="fullName"
          placeholder="firstName lastName"
          value={formData.fullName}
          onChange={handleChange}
          required
        />

        <Input
          label="Username"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />

        <Input
          label="Email Address"
          type="email"
          name="email"
          placeholder="name@example.com"
          value={formData.email}
          onChange={handleChange}
          required
        />

        {/* Date of Birth Selection */}
        <Input
          label="Date of Birth / Age Range"
          type="date"
          name="dob"
          value={formData.dob}
          onChange={handleChange}
          required
        />

        {/* Password Field with Eye Toggle */}
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="At least 8 characters"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
            aria-label="Toggle password visibility"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Password Strength Meter */}
        {password.length > 0 && (
          <div className="space-y-2 pt-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Password Strength:</span>
              <span className={`font-bold ${passedChecksCount >= 4 ? 'text-brand-green' : 'text-amber-500'}`}>
                {strengthInfo.text}
              </span>
            </div>
            
            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${strengthInfo.color}`} 
                style={{ width: `${strengthPercentage}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
              <div className={`flex items-center gap-1 ${strengthChecks.length ? 'text-brand-green font-medium' : 'text-gray-400'}`}>
                {strengthChecks.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                <span>8+ characters</span>
              </div>
              <div className={`flex items-center gap-1 ${strengthChecks.uppercase ? 'text-brand-green font-medium' : 'text-gray-400'}`}>
                {strengthChecks.uppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                <span>Uppercase letter</span>
              </div>
              <div className={`flex items-center gap-1 ${strengthChecks.number ? 'text-brand-green font-medium' : 'text-gray-400'}`}>
                {strengthChecks.number ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                <span>A number</span>
              </div>
              <div className={`flex items-center gap-1 ${strengthChecks.special ? 'text-brand-green font-medium' : 'text-gray-400'}`}>
                {strengthChecks.special ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                <span>Special symbol</span>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Password Field with Match Indicator */}
        <div className="relative pt-1">
          <Input
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
            aria-label="Toggle confirm password visibility"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {formData.confirmPassword.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs pt-0.5">
            {doPasswordsMatch ? (
              <span className="flex items-center gap-1 text-brand-green font-semibold">
                <Check className="w-3.5 h-3.5" /> Passwords match perfectly
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-500 font-semibold">
                <X className="w-3.5 h-3.5" /> Passwords do not match yet
              </span>
            )}
          </div>
        )}

        {/* Terms Acceptance Checkbox */}
        <div className="flex items-start gap-2 pt-2">
          <input
            type="checkbox"
            name="termsAccepted"
            id="termsAccepted"
            checked={formData.termsAccepted}
            onChange={handleChange}
            className="mt-0.5 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
          />
          <label htmlFor="termsAccepted" className="text-xs text-gray-600 dark:text-gray-400 leading-snug">
            I agree to the{' '}
            <Link href="/terms" className="text-brand-blue hover:underline font-semibold">Terms of Service</Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-brand-blue hover:underline font-semibold">Privacy Policy</Link>.
          </label>
        </div>

        <div className="pt-3">
          <Button type="submit" variant="primary" size="lg" className="w-full shadow-lg shadow-brand-blue/25" isLoading={isLoading}>
            Create Account
          </Button>
        </div>
      </motion.form>

      {/* Footer login redirect */}
      <div className="mt-6 text-center space-y-3">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-semibold text-brand-blue hover:underline">
            Log in
          </Link>
        </p>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-green" />
          <span>Encrypted & Secured Registration</span>
        </div>
      </div>

    </main>
  );
}