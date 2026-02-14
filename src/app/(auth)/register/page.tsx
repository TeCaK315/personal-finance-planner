'use client';

import React from 'react';
import { RegisterForm } from '@/components/auth/RegisterForm';
import Link from 'next/link';
import { TrendingUp } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <TrendingUp className="w-10 h-10 text-purple-400" />
            <span className="text-3xl font-bold gradient-text">FinancePlanner</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-slate-400">Start managing your finances smarter</p>
        </div>

        <RegisterForm />

        <div className="mt-6 text-center">
          <p className="text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}