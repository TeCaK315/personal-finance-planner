'use client';

import { useEffect, useState } from 'react';
import { DashboardStats } from '@/types';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { FinancialOverview } from '@/components/dashboard/FinancialOverview';
import { TransactionList } from '@/components/transactions/TransactionList';
import { RecommendationCard } from '@/components/recommendations/RecommendationCard';
import { Card } from '@/components/ui/Card';
import { TrendingUp, TrendingDown, Target, DollarSign } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        } else {
          setError(data.error || 'Failed to fetch stats');
        }
      } catch (err) {
        setError('Failed to fetch dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse-slow text-primary text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card>
          <div className="p-8 text-center">
            <p className="text-red-400">{error || 'Failed to load dashboard'}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-text/70">Overview of your financial health</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Current Balance"
          value={stats.currentBalance}
          icon={DollarSign}
          trend={stats.currentBalance >= 0 ? 'up' : 'down'}
          format="currency"
        />
        <StatsCard
          title="Monthly Income"
          value={stats.monthlyIncome}
          icon={TrendingUp}
          trend="up"
          format="currency"
        />
        <StatsCard
          title="Monthly Expenses"
          value={stats.monthlyExpenses}
          icon={TrendingDown}
          trend="down"
          format="currency"
        />
        <StatsCard
          title="Active Goals"
          value={stats.activeGoals}
          icon={Target}
          trend="neutral"
          format="number"
        />
      </div>

      <FinancialOverview
        balance={stats.currentBalance}
        income={stats.monthlyIncome}
        expenses={stats.monthlyExpenses}
        monthlyTrend={stats.monthlyTrend}
        categoryBreakdown={stats.topCategories}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
            <TransactionList transactions={stats.recentTransactions} compact />
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Insights</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm text-text/80">
                  Your savings rate is <span className="font-semibold text-primary">{stats.savingsRate.toFixed(1)}%</span>
                </p>
              </div>
              <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                <p className="text-sm text-text/80">
                  You have <span className="font-semibold text-accent">{stats.completedGoals}</span> completed goals
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}