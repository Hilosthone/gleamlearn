"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import greenlearnLogo from '../app/gleamlearn-logo.jpg';
import { Mail, Heart } from "lucide-react";

export default function FooterSection() {
  return (
    <footer className="bg-white dark:bg-dark-card border-t border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400 pt-16 pb-12 relative overflow-hidden transition-colors duration-300">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-blue to-transparent opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-purple/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-gray-200 dark:border-dark-border">
          
          {/* Brand & Mission (Span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group inline-flex">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-brand-blue/20 relative border border-gray-200/50 dark:border-white/10 group-hover:scale-105 transition-transform">
                <Image 
                  src={greenlearnLogo} 
                  alt="gleamLearn Logo" 
                  fill 
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-1">
                gleam<span className="text-brand-blue">Learn</span>
                <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></span>
              </span>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm leading-relaxed">
              The AI-powered personalized learning, practice, and examination platform designed for secondary students, university undergraduates, and exam candidates across Nigeria and Africa.
            </p>
            <div className="flex items-center gap-3 pt-2">
              {/* X / Twitter Icon */}
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-brand-blue transition-all shadow-sm" aria-label="Twitter">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* LinkedIn Icon */}
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-brand-blue transition-all shadow-sm" aria-label="LinkedIn">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              {/* GitHub Icon */}
              <a href="https://github.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-brand-blue transition-all shadow-sm" aria-label="GitHub">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
              {/* Mail Icon */}
              <a href="mailto:gleamlearn.ai@gmail.com" className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-brand-blue transition-all shadow-sm" aria-label="Email">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Product</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="#pipeline" className="hover:text-gray-900 dark:hover:text-white transition-colors">Upload-to-Learn</Link></li>
              <li><Link href="#features" className="hover:text-gray-900 dark:hover:text-white transition-colors">AI Tutor & Classroom</Link></li>
              <li><Link href="#gamification" className="hover:text-gray-900 dark:hover:text-white transition-colors">Streaks & Leaderboards</Link></li>
              <li><Link href="#pricing" className="hover:text-gray-900 dark:hover:text-white transition-colors">Freemium Pricing</Link></li>
              <li><Link href="#signup" className="hover:text-gray-900 dark:hover:text-white transition-colors">Mobile App Access</Link></li>
            </ul>
          </div>

          {/* Examinations */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Examinations</h4>
            <ul className="space-y-2.5 text-sm">
              <li><span className="hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">JAMB / UTME Prep</span></li>
              <li><span className="hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">WAEC & NECO GCE</span></li>
              <li><span className="hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">University BSc Courses</span></li>
              <li><span className="hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">JUPEB & NABTEB</span></li>
              <li><span className="hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">SAT & International</span></li>
            </ul>
          </div>

          {/* Legal & Support - Linked directly to their proper folder paths matching your import structure */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Legal & Help</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/Legal&Help/PrivacyPolicy" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/Legal&Help/TermsOfService" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/Legal&Help/AcademyIntegrity" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Academic Integrity
                </Link>
              </li>
              <li>
                <Link href="/Legal&Help/SupportCenter" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Support Center
                </Link>
              </li>
              <li>
                <Link href="/Legal&Help/ContactUs" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} gleamLearn. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
}