'use client';

import { RegisterForm } from '@/components/auth/RegisterForm';
import Link from 'next/link';
import { TrendingUp } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <TrendingUp className="w-10 h-10 text-primary" />
            <span className="text-3xl font-bold gradient-text">FinancePlanner</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-gray-400">Start your financial journey today</p>
        </div>

        <RegisterForm />

        <p className="text-center mt-6 text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:text-secondary transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}