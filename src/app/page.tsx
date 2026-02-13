'use client';

import Link from 'next/link';
import { ArrowRight, TrendingUp, Target, Brain, Shield, Zap, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 w-full z-50 glass-card border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold gradient-text">FinancePlanner</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="secondary">Login</Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="primary">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        <section className="relative overflow-hidden py-20 sm:py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 blur-3xl"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center animate-fade-in">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
                <span className="gradient-text">Smart Financial Planning</span>
                <br />
                <span className="text-text">Powered by AI</span>
              </h1>
              <p className="text-xl text-text/80 mb-8 max-w-3xl mx-auto">
                Take control of your finances with AI-powered insights, budget tracking, and personalized recommendations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/register">
                  <Button variant="primary" className="group">
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="accent">View Demo</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-background/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 animate-slide-up">
              <h2 className="text-4xl font-bold mb-4 gradient-text">Powerful Features</h2>
              <p className="text-xl text-text/70">Everything you need to manage your finances effectively</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="animate-scale-in" style={{ animationDelay: '0.1s' }}>
                <div className="p-6">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                    <PieChart className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Budget Tracking</h3>
                  <p className="text-text/70">
                    Track your income and expenses with detailed categorization and real-time balance calculations.
                  </p>
                </div>
              </Card>

              <Card className="animate-scale-in" style={{ animationDelay: '0.2s' }}>
                <div className="p-6">
                  <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center mb-4">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Financial Goals</h3>
                  <p className="text-text/70">
                    Set and track your financial goals with progress visualization and milestone tracking.
                  </p>
                </div>
              </Card>

              <Card className="animate-scale-in" style={{ animationDelay: '0.3s' }}>
                <div className="p-6">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">AI Recommendations</h3>
                  <p className="text-text/70">
                    Get personalized financial advice powered by advanced AI to optimize your spending and savings.
                  </p>
                </div>
              </Card>

              <Card className="animate-scale-in" style={{ animationDelay: '0.4s' }}>
                <div className="p-6">
                  <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Trend Analysis</h3>
                  <p className="text-text/70">
                    Visualize your financial trends over time with interactive charts and insights.
                  </p>
                </div>
              </Card>

              <Card className="animate-scale-in" style={{ animationDelay: '0.5s' }}>
                <div className="p-6">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
                  <p className="text-text/70">
                    Your financial data is encrypted and secure with industry-standard security practices.
                  </p>
                </div>
              </Card>

              <Card className="animate-scale-in" style={{ animationDelay: '0.6s' }}>
                <div className="p-6">
                  <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Real-time Updates</h3>
                  <p className="text-text/70">
                    Get instant updates on your financial status with real-time calculations and notifications.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Card className="p-12 animate-fade-in">
              <h2 className="text-4xl font-bold mb-4 gradient-text">Ready to Take Control?</h2>
              <p className="text-xl text-text/70 mb-8">
                Join thousands of users who are already managing their finances smarter with AI-powered insights.
              </p>
              <Link href="/auth/register">
                <Button variant="primary" className="group">
                  Get Started for Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-text/60">
            <p>&copy; 2024 FinancePlanner. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}