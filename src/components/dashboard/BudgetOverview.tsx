'use client';

import React from 'react';
import { useBudgets } from '@/hooks/useBudgets';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import Link from 'next/link';

export function BudgetOverview() {
  const { budgets, isLoading } = useBudgets({ active: true });

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  if (budgets.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <TrendingUp className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg mb-4">No active budgets</p>
          <Link href="/budgets" className="text-purple-400 hover:text-purple-300 font-semibold">
            Create your first budget
          </Link>
        </CardContent>
      </Card>
    );
  }

  const activeBudget = budgets[0];
  const totalSpent = activeBudget.categoryLimits.reduce((sum, cat) => sum + cat.spent, 0);
  const percentageUsed = (totalSpent / activeBudget.totalAmount) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Budget Overview</h2>
          <Link href="/budgets" className="text-purple-400 hover:text-purple-300 text-sm font-semibold">
            View All
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">{activeBudget.name}</span>
            <span className="text-white font-semibold">
              {formatCurrency(totalSpent)} / {formatCurrency(activeBudget.totalAmount)}
            </span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${Math.min(percentageUsed, 100)}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-slate-400">{formatPercentage(percentageUsed)} used</span>
            <span className="text-xs text-green-400">
              {formatCurrency(activeBudget.totalAmount - totalSpent)} remaining
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Top Categories</h3>
          {activeBudget.categoryLimits.slice(0, 3).map((category) => {
            const categoryPercentage = (category.spent / category.limit) * 100;
            const isOverspent = categoryPercentage > 100;
            
            return (
              <div key={category.categoryId}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300">{category.categoryName}</span>
                  <span className={`text-sm font-semibold ${isOverspent ? 'text-red-400' : 'text-slate-300'}`}>
                    {formatCurrency(category.spent)} / {formatCurrency(category.limit)}
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOverspent ? 'bg-gradient-to-r from-red-500 to-red-600' : 'gradient-primary'
                    }`}
                    style={{ width: `${Math.min(categoryPercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}