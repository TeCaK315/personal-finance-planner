'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { TrendingUp, PieChart, Sparkles, Shield, Zap, BarChart3 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(220,20%,12%)] to-[hsl(var(--background))]">
      <nav className="glass-strong fixed top-0 left-0 right-0 z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">FinancePlanner</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button variant="primary">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20">
        <section className="max-w-7xl mx-auto px-6 text-center mb-32">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-[hsl(var(--accent))]" />
            <span className="text-sm text-[hsl(var(--text-secondary))]">AI-Powered Financial Intelligence</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 animate-slide-up">
            Take Control of Your
            <br />
            <span className="text-gradient">Financial Future</span>
          </h1>
          
          <p className="text-xl text-[hsl(var(--text-secondary))] max-w-2xl mx-auto mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Smart budget management with AI-powered insights. Track spending, set goals, and get personalized recommendations to achieve financial freedom.
          </p>
          
          <div className="flex items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link href="/register">
              <Button variant="primary" size="lg" className="gap-2">
                Start Free Trial
                <Zap className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </Link>
          </div>

          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] opacity-20 blur-3xl rounded-full"></div>
            <div className="relative glass-strong rounded-2xl p-8 max-w-4xl mx-auto border-2 border-white/10">
              <div className="grid grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gradient mb-2">$50K+</div>
                  <div className="text-sm text-[hsl(var(--text-secondary))]">Money Saved</div>
                </div>
                <div className="text-center border-x border-white/10">
                  <div className="text-4xl font-bold text-gradient mb-2">10K+</div>
                  <div className="text-sm text-[hsl(var(--text-secondary))]">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-gradient mb-2">4.9★</div>
                  <div className="text-sm text-[hsl(var(--text-secondary))]">User Rating</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-lg text-[hsl(var(--text-secondary))]">Everything you need to master your finances</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-strong rounded-2xl p-8 border border-white/10 hover:border-[hsl(var(--primary))]/50 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <PieChart className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Smart Budgeting</h3>
              <p className="text-[hsl(var(--text-secondary))]">
                Create flexible budgets with category allocations. Track spending in real-time and stay on target with visual progress indicators.
              </p>
            </div>

            <div className="glass-strong rounded-2xl p-8 border border-white/10 hover:border-[hsl(var(--secondary))]/50 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-xl gradient-accent flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">AI Recommendations</h3>
              <p className="text-[hsl(var(--text-secondary))]">
                Get personalized financial advice powered by advanced AI. Discover savings opportunities and optimize your spending patterns.
              </p>
            </div>

            <div className="glass-strong rounded-2xl p-8 border border-white/10 hover:border-[hsl(var(--accent))]/50 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(var(--secondary))] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Analytics & Insights</h3>
              <p className="text-[hsl(var(--text-secondary))]">
                Visualize your financial data with interactive charts. Understand spending trends and make data-driven decisions.
              </p>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 mb-32">
          <div className="glass-strong rounded-3xl p-12 border border-white/10 text-center">
            <Shield className="w-16 h-16 mx-auto mb-6 text-[hsl(var(--primary))]" />
            <h2 className="text-3xl font-bold mb-4">Bank-Level Security</h2>
            <p className="text-lg text-[hsl(var(--text-secondary))] max-w-2xl mx-auto mb-8">
              Your financial data is encrypted and protected with industry-standard security measures. We never share your information with third parties.
            </p>
            <div className="flex items-center justify-center gap-8 text-sm text-[hsl(var(--text-secondary))]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--success))]"></div>
                256-bit Encryption
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--success))]"></div>
                Secure Authentication
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--success))]"></div>
                Privacy First
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Finances?</h2>
          <p className="text-xl text-[hsl(var(--text-secondary))] mb-10">
            Join thousands of users who are already taking control of their financial future.
          </p>
          <Link href="/register">
            <Button variant="primary" size="lg" className="gap-2">
              Get Started for Free
              <Zap className="w-5 h-5" />
            </Button>
          </Link>
        </section>
      </main>

      <footer className="border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center text-[hsl(var(--text-secondary))]">
          <p>&copy; 2024 FinancePlanner. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}