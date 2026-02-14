'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, TrendingUp, Brain, Shield, Zap, PieChart, Bell } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-8 h-8 text-purple-400" />
            <span className="text-2xl font-bold gradient-text">FinancePlanner</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button variant="primary">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 gradient-text slide-up">
            Smart Finance Management
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto slide-up">
            AI-powered personal finance planner that helps you track expenses, manage budgets, and achieve your financial goals with intelligent recommendations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 slide-up">
            <Link href="/register">
              <Button variant="primary" size="lg" className="group">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 gradient-text">
            Powerful Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Brain className="w-12 h-12 text-purple-400" />}
              title="AI-Powered Insights"
              description="Get personalized financial recommendations based on your spending patterns and goals using advanced AI analysis."
            />
            <FeatureCard
              icon={<PieChart className="w-12 h-12 text-pink-400" />}
              title="Smart Budgeting"
              description="Create and manage budgets with category limits, real-time tracking, and overspending alerts."
            />
            <FeatureCard
              icon={<TrendingUp className="w-12 h-12 text-cyan-400" />}
              title="Trend Analysis"
              description="Visualize your spending trends over time with interactive charts and detailed reports."
            />
            <FeatureCard
              icon={<Bell className="w-12 h-12 text-indigo-400" />}
              title="Smart Alerts"
              description="Receive notifications when you're approaching budget limits or unusual spending is detected."
            />
            <FeatureCard
              icon={<Shield className="w-12 h-12 text-green-400" />}
              title="Secure & Private"
              description="Your financial data is encrypted and protected with industry-standard security measures."
            />
            <FeatureCard
              icon={<Zap className="w-12 h-12 text-yellow-400" />}
              title="Quick Import"
              description="Bulk import transactions from CSV files and automatically categorize them with AI."
            />
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="glass-card p-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
              Ready to Take Control?
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already managing their finances smarter with AI-powered insights.
            </p>
            <Link href="/register">
              <Button variant="primary" size="lg" className="group">
                Get Started Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-white/10">
        <div className="container mx-auto text-center text-slate-400">
          <p>&copy; 2024 FinancePlanner. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="glass-card-hover p-8 fade-in">
      <div className="mb-4">{icon}</div>
      <h3 className="text-2xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-slate-300">{description}</p>
    </div>
  );
}