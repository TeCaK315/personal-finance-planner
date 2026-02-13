'use client';

import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { useBudget } from '@/hooks/useBudget';
import { Spinner } from '@/components/ui/Spinner';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export function BudgetOverview() {
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

  const balanceColor = budget.balance >= 0 ? 'text-green-500' : 'text-red-500';
  const balanceIcon = budget.balance >= 0 ? TrendingUp : TrendingDown;
  const BalanceIcon = balanceIcon;

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Card className="hover:scale-105 transition-transform duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-400">Total Income</h3>
            <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-green-500">
            ${budget.totalIncome.toFixed(2)}
          </p>
        </CardContent>
      </Card>

      <Card className="hover:scale-105 transition-transform duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-400">Total Expenses</h3>
            <div className="w-12 h-12 rounded-full gradient-accent flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-red-500">
            ${budget.totalExpenses.toFixed(2)}
          </p>
        </CardContent>
      </Card>

      <Card className="hover:scale-105 transition-transform duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-400">Balance</h3>
            <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
              <BalanceIcon className={`w-6 h-6 ${balanceColor}`} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className={`text-3xl font-bold ${balanceColor}`}>
            ${Math.abs(budget.balance).toFixed(2)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}