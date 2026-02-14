'use client';

import React from 'react';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import { TrendingUp } from 'lucide-react';

export default function LoginPage() {
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
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-[hsl(var(--text-secondary))]">
            Sign in to continue managing your finances
          </p>
        </div>

        <LoginForm />

        <div className="mt-6 text-center text-sm text-[hsl(var(--text-secondary))]">
          Don't have an account?{' '}
          <Link href="/register" className="text-[hsl(var(--primary))] hover:underline font-medium">
            Sign up for free
          </Link>
        </div>
      </div>
    </div>
  );
}