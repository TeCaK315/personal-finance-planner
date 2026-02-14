'use client';

import React from 'react';
import { useBudget, useBudgetStatus } from '@/hooks/useBudgets';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Edit, Trash2, TrendingUp, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatCurrency, formatDate, formatPercentage } from '@/utils/formatters';

export default function BudgetDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { budget, isLoading: budgetLoading } = useBudget(params.id);
  const { status, isLoading: statusLoading } = useBudgetStatus(params.id);

  if (budgetLoading || statusLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!budget || !status) {
    return (
      <div className="glass-card p-12 text-center">
        <p className="text-slate-400 text-lg">Budget not found</p>
        <Button variant="secondary" onClick={() => router.push('/budgets')} className="mt-4">
          Back to Budgets
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.push('/budgets')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">{budget.name}</h1>
            <p className="text-slate-400">
              {formatDate(budget.startDate)} - {formatDate(budget.endDate)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="secondary">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="secondary">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-slate-400 text-sm mb-2">Total Budget</div>
            <div className="text-3xl font-bold text-white">{formatCurrency(status.totalAmount)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-slate-400 text-sm mb-2">Total Spent</div>
            <div className="text-3xl font-bold text-white">{formatCurrency(status.totalSpent)}</div>
            <div className="text-sm text-purple-400 mt-1">{formatPercentage(status.percentageUsed)} used</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-slate-400 text-sm mb-2">Remaining</div>
            <div className="text-3xl font-bold text-green-400">{formatCurrency(status.remainingAmount)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold text-white">Budget Progress</h2>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Overall Progress</span>
              <span className="text-white font-semibold">{formatPercentage(status.percentageUsed)}</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${Math.min(status.percentageUsed, 100)}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {status.overspendingCategories.length > 0 && (
        <Card className="border-red-500/50">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <h2 className="text-2xl font-bold text-red-400">Overspending Alert</h2>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 mb-4">
              You have exceeded the budget limit in {status.overspendingCategories.length} categories
            </p>
            <div className="space-y-2">
              {status.overspendingCategories.map((categoryName) => (
                <div key={categoryName} className="text-red-400 font-semibold">
                  • {categoryName}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold text-white">Category Breakdown</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {status.categoryBreakdown.map((category) => (
              <div key={category.categoryId}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold">{category.categoryName}</span>
                  <span className={`font-semibold ${category.isOverspent ? 'text-red-400' : 'text-slate-300'}`}>
                    {formatCurrency(category.spent)} / {formatCurrency(category.limit)}
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      category.isOverspent ? 'bg-gradient-to-r from-red-500 to-red-600' : 'gradient-primary'
                    }`}
                    style={{ width: `${Math.min(category.percentageUsed, 100)}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between mt-1 text-sm">
                  <span className="text-slate-400">{formatPercentage(category.percentageUsed)} used</span>
                  <span className={category.remaining >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {formatCurrency(Math.abs(category.remaining))} {category.remaining >= 0 ? 'remaining' : 'over'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}