'use client';

import React from 'react';
import { BudgetSummaryCard } from '@/components/dashboard/BudgetSummaryCard';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { AIRecommendationsWidget } from '@/components/dashboard/AIRecommendationsWidget';
import { useBudget } from '@/hooks/useBudget';
import { useTransactions } from '@/hooks/useTransactions';
import { useRecommendations } from '@/hooks/useRecommendations';
import { TrendingUp, Target, DollarSign } from 'lucide-react';

export default function DashboardPage() {
  const { summary, isLoading: budgetLoading } = useBudget();
  const { transactions, isLoading: transactionsLoading } = useTransactions({ limit: 5 });
  const { recommendations, isLoading: recommendationsLoading } = useRecommendations();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-slate-400">Welcome back! Here's your financial overview.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BudgetSummaryCard summary={summary} isLoading={budgetLoading} />
        </div>
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Quick Stats</h3>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-400">Monthly Income</span>
                <DollarSign className="w-4 h-4 text-success" />
              </div>
              <p className="text-2xl font-bold text-success">
                ${budgetLoading ? '...' : summary?.totalIncome.toFixed(2) || '0.00'}
              </p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-400">Monthly Expenses</span>
                <DollarSign className="w-4 h-4 text-error" />
              </div>
              <p className="text-2xl font-bold text-error">
                ${budgetLoading ? '...' : summary?.totalExpenses.toFixed(2) || '0.00'}
              </p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-400">Balance</span>
                <Target className="w-4 h-4 text-primary" />
              </div>
              <p className="text-2xl font-bold text-primary">
                ${budgetLoading ? '...' : summary?.balance.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTransactions transactions={transactions} isLoading={transactionsLoading} />
        <AIRecommendationsWidget recommendations={recommendations} isLoading={recommendationsLoading} />
      </div>
    </div>
  );
}