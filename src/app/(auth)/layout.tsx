import React from 'react';
import Link from 'next/link';
import { DollarSign } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="fixed top-0 w-full z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <DollarSign className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold text-gradient">FinancePlanner</span>
            </Link>
          </div>
        </div>
      </div>
      <main className="pt-16">{children}</main>
    </div>
  );
}