'use client';

import Link from 'next/link';
import { ArrowRight, TrendingUp, PieChart, Lightbulb, Shield, Zap, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <nav className="glass-card fixed top-0 left-0 right-0 z-50 mx-4 mt-4 rounded-2xl">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold gradient-text">FinancePlanner</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="secondary">Login</Button>
            </Link>
            <Link href="/register">
              <Button variant="primary">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 animate-fade-in">
            Master Your <span className="gradient-text">Financial Future</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto animate-slide-up">
            AI-powered budget management with personalized recommendations to help you save more, spend wisely, and achieve your financial goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in">
            <Link href="/register">
              <Button variant="primary" className="text-lg px-8 py-4">
                Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="accent" className="text-lg px-8 py-4">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Powerful Features for <span className="gradient-text">Smart Finance</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="glass-card p-8 hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mb-6">
                <PieChart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Budget Tracking</h3>
              <p className="text-gray-300">
                Track your income and expenses with detailed categorization. Get real-time insights into your spending patterns.
              </p>
            </div>

            <div className="glass-card p-8 hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 rounded-full gradient-accent flex items-center justify-center mb-6">
                <Lightbulb className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">AI Recommendations</h3>
              <p className="text-gray-300">
                Get personalized financial advice powered by advanced AI. Discover opportunities to save and invest smarter.
              </p>
            </div>

            <div className="glass-card p-8 hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mb-6">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Analytics Dashboard</h3>
              <p className="text-gray-300">
                Visualize your financial data with beautiful charts and graphs. Track trends and make informed decisions.
              </p>
            </div>

            <div className="glass-card p-8 hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 rounded-full gradient-accent flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Secure & Private</h3>
              <p className="text-gray-300">
                Your financial data is encrypted and secure. We never share your information with third parties.
              </p>
            </div>

            <div className="glass-card p-8 hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Real-time Updates</h3>
              <p className="text-gray-300">
                See your financial status update instantly as you add transactions. Stay on top of your budget 24/7.
              </p>
            </div>

            <div className="glass-card p-8 hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 rounded-full gradient-accent flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Goal Setting</h3>
              <p className="text-gray-300">
                Set financial goals and track your progress. Get motivated with milestone achievements and rewards.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-br from-primary to-secondary">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="text-xl text-gray-200 mb-12 max-w-2xl mx-auto">
            Join thousands of users who are already managing their money smarter with AI-powered insights.
          </p>
          <Link href="/register">
            <Button variant="accent" className="text-lg px-8 py-4">
              Get Started for Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="py-12 px-4 border-t border-gray-800">
        <div className="container mx-auto text-center text-gray-400">
          <p>&copy; 2024 FinancePlanner. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}