'use client';

import React from 'react';
import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { TrendingUp } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">FinancePlanner</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Create Your Account</h1>
          <p className="text-[hsl(var(--text-secondary))]">
            Start your journey to financial freedom today
          </p>
        </div>

        <RegisterForm />

        <div className="mt-6 text-center text-sm text-[hsl(var(--text-secondary))]">
          Already have an account?{' '}
          <Link href="/login" className="text-[hsl(var(--primary))] hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}