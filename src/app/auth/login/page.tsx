'use client';

import Link from 'next/link';
import { TrendingUp } from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';
import { Card } from '@/components/ui/Card';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 blur-3xl"></div>
      <div className="relative w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-4">
            <TrendingUp className="w-10 h-10 text-primary" />
            <span className="text-2xl font-bold gradient-text">FinancePlanner</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-text/70">Sign in to your account to continue</p>
        </div>
        <Card>
          <div className="p-8">
            <LoginForm />
            <div className="mt-6 text-center">
              <p className="text-text/70">
                Don't have an account?{' '}
                <Link href="/auth/register" className="text-primary hover:text-primary/80 font-semibold">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}