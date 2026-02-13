'use client';

import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { useBudget } from '@/hooks/useBudget';
import { Spinner } from '@/components/ui/Spinner';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export function BudgetCalculator() {
  const { budget, loading, error } = useBudget();

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-12 text-red-500">
          {error}
        </div>
      </Card>
    );
  }

  const savingsRate = budget.totalIncome > 0 
    ? ((budget.balance / budget.totalIncome) * 100).toFixed(1)
    : '0.0';

  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold">Budget Summary</h2>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="p-6 bg-slate-800 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400">Total Income</h3>
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-500">
              ${budget.totalIncome.toFixed(2)}
            </p>
          </div>

          <div className="p-6 bg-slate-800 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400">Total Expenses</h3>
              <TrendingDown className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-red-500">
              ${budget.totalExpenses.toFixed(2)}
            </p>
          </div>

          <div className="p-6 bg-slate-800 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400">Balance</h3>
              <DollarSign className={`w-6 h-6 ${budget.balance >= 0 ? 'text-green-500' : 'text-red-500'}`} />
            </div>
            <p className={`text-3xl font-bold ${budget.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${Math.abs(budget.balance).toFixed(2)}
            </p>
          </div>

          <div className="p-6 bg-slate-800 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400">Savings Rate</h3>
              <TrendingUp className="w-6 h-6 text-accent" />
            </div>
            <p className="text-3xl font-bold text-accent">
              {savingsRate}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}