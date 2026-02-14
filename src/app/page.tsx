'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingUp, Target, Brain, PieChart, ArrowRight, DollarSign, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold text-gradient">FinancePlanner</span>
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
        </div>
      </nav>

      <main className="pt-16">
        <section className="relative overflow-hidden py-20 sm:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center animate-fade-in">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
                <span className="text-gradient">AI-Powered</span>
                <br />
                <span className="text-white">Financial Planning</span>
              </h1>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-10">
                Take control of your finances with intelligent budgeting, goal tracking, and personalized AI recommendations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto">
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
              <div className="glass rounded-2xl p-6 hover:scale-105 transition-transform">
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Smart Budgeting</h3>
                <p className="text-slate-400 text-sm">
                  Track income and expenses with intelligent categorization and real-time insights.
                </p>
              </div>

              <div className="glass rounded-2xl p-6 hover:scale-105 transition-transform">
                <div className="w-12 h-12 rounded-lg gradient-accent flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Goal Tracking</h3>
                <p className="text-slate-400 text-sm">
                  Set financial goals and monitor progress with visual indicators and milestones.
                </p>
              </div>

              <div className="glass rounded-2xl p-6 hover:scale-105 transition-transform">
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">AI Recommendations</h3>
                <p className="text-slate-400 text-sm">
                  Get personalized financial advice powered by advanced AI algorithms.
                </p>
              </div>

              <div className="glass rounded-2xl p-6 hover:scale-105 transition-transform">
                <div className="w-12 h-12 rounded-lg gradient-accent flex items-center justify-center mb-4">
                  <PieChart className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Visual Analytics</h3>
                <p className="text-slate-400 text-sm">
                  Understand your spending patterns with beautiful charts and reports.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Why Choose FinancePlanner?</h2>
              <p className="text-slate-400 text-lg">Everything you need to master your finances</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
                <p className="text-slate-400">
                  Your financial data is encrypted and protected with industry-leading security standards.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full gradient-accent flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Real-time Updates</h3>
                <p className="text-slate-400">
                  See your financial status update instantly as you add transactions and track progress.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI-Powered Insights</h3>
                <p className="text-slate-400">
                  Leverage artificial intelligence to get personalized recommendations and optimize savings.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Finances?</h2>
            <p className="text-xl text-slate-300 mb-10">
              Join thousands of users who are already taking control of their financial future.
            </p>
            <Link href="/register">
              <Button variant="primary" size="lg">
                Get Started for Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-slate-400">
            <p>&copy; 2024 FinancePlanner. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}