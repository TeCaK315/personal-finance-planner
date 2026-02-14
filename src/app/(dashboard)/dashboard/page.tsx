'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBudgets } from '@/hooks/useBudgets';
import { BudgetCard } from '@/components/dashboard/BudgetCard';
import { SpendingChart } from '@/components/dashboard/SpendingChart';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Plus, TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';
import Link from 'next/link';
import type { BudgetSummary } from '@/types';

export default function DashboardPage() {
  const { user } = useAuth();
  const { budgets, loading: budgetsLoading } = useBudgets();
  const [summaries, setSummaries] = useState<Record<string, BudgetSummary>>({});
  const [loadingSummaries, setLoadingSummaries] = useState(false);

  useEffect(() => {
    const fetchSummaries = async () => {
      if (!budgets || budgets.length === 0) return;
      
      setLoadingSummaries(true);
      const summaryPromises = budgets.map(async (budget) => {
        try {
          const response = await fetch(`/api/budgets/${budget._id}/summary`);
          const data = await response.json();
          return { id: budget._id, summary: data.data };
        } catch (error) {
          console.error(`Failed to fetch summary for budget ${budget._id}:`, error);
          return { id: budget._id, summary: null };
        }
      });

      const results = await Promise.all(summaryPromises);
      const summariesMap: Record<string, BudgetSummary> = {};
      results.forEach(({ id, summary }) => {
        if (summary) summariesMap[id] = summary;
      });
      setSummaries(summariesMap);
      setLoadingSummaries(false);
    };

    fetchSummaries();
  }, [budgets]);

  const activeBudgets = budgets?.filter(b => {
    const now = new Date();
    return new Date(b.startDate) <= now && new Date(b.endDate) >= now;
  }) || [];

  const totalBudget = activeBudgets.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalSpent = Object.values(summaries).reduce((sum, s) => sum + s.totalSpent, 0);
  const totalIncome = Object.values(summaries).reduce((sum, s) => sum + s.totalIncome, 0);
  const remainingBudget = totalBudget - totalSpent;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-[hsl(var(--text-secondary))]">Here's your financial overview</p>
        </div>
        <Link href="/dashboard/budgets">
          <Button variant="primary" className="gap-2">
            <Plus className="w-5 h-5" />
            New Budget
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <Card className="glass-strong border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[hsl(var(--primary))]/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-[hsl(var(--primary))]" />
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">
              ${totalBudget.toLocaleString()}
            </div>
            <div className="text-sm text-[hsl(var(--text-secondary))]">Total Budget</div>
          </CardContent>
        </Card>

        <Card className="glass-strong border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[hsl(var(--error))]/20 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-[hsl(var(--error))]" />
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">
              ${totalSpent.toLocaleString()}
            </div>
            <div className="text-sm text-[hsl(var(--text-secondary))]">Total Spent</div>
          </CardContent>
        </Card>

        <Card className="glass-strong border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[hsl(var(--success))]/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[hsl(var(--success))]" />
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">
              ${totalIncome.toLocaleString()}
            </div>
            <div className="text-sm text-[hsl(var(--text-secondary))]">Total Income</div>
          </CardContent>
        </Card>

        <Card className="glass-strong border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[hsl(var(--accent))]/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-[hsl(var(--accent))]" />
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">
              ${remainingBudget.toLocaleString()}
            </div>
            <div className="text-sm text-[hsl(var(--text-secondary))]">Remaining</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass-strong border-white/10">
          <CardHeader>
            <h2 className="text-xl font-bold">Active Budgets</h2>
          </CardHeader>
          <CardContent>
            {budgetsLoading || loadingSummaries ? (
              <div className="space-y-4">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </div>
            ) : activeBudgets.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-12 h-12 mx-auto mb-4 text-[hsl(var(--text-secondary))]" />
                <p className="text-[hsl(var(--text-secondary))] mb-4">No active budgets</p>
                <Link href="/dashboard/budgets">
                  <Button variant="primary" size="sm">Create Your First Budget</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {activeBudgets.slice(0, 3).map((budget) => (
                  <BudgetCard 
                    key={budget._id} 
                    budget={budget} 
                    summary={summaries[budget._id]}
                  />
                ))}
                {activeBudgets.length > 3 && (
                  <Link href="/dashboard/budgets">
                    <Button variant="ghost" className="w-full">
                      View All Budgets
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-strong border-white/10">
          <CardHeader>
            <h2 className="text-xl font-bold">Spending Overview</h2>
          </CardHeader>
          <CardContent>
            {loadingSummaries ? (
              <Skeleton className="h-64" />
            ) : Object.keys(summaries).length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-[hsl(var(--text-secondary))]" />
                <p className="text-[hsl(var(--text-secondary))]">No spending data yet</p>
              </div>
            ) : (
              <SpendingChart budgetId={activeBudgets[0]?._id} />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="glass-strong border-white/10">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/dashboard/transactions">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Transaction
                </Button>
              </Link>
              <Link href="/dashboard/budgets">
                <Button variant="outline" className="w-full justify-start">
                  <Target className="w-5 h-5 mr-2" />
                  Manage Budgets
                </Button>
              </Link>
              <Link href="/dashboard/recommendations">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  View Recommendations
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-strong border-white/10">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold mb-4">Financial Health</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[hsl(var(--text-secondary))]">Budget Usage</span>
                  <span className="text-sm font-medium">
                    {totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}%
                  </span>
                </div>
                <div className="h-2 bg-[hsl(var(--surface))] rounded-full overflow-hidden">
                  <div 
                    className="h-full gradient-primary transition-all duration-500"
                    style={{ width: `${totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0}%` }}
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[hsl(var(--text-secondary))]">Active Budgets</span>
                  <span className="font-medium">{activeBudgets.length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}