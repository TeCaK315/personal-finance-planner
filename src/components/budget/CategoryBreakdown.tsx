'use client';

import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { useBudget } from '@/hooks/useBudget';
import { Spinner } from '@/components/ui/Spinner';

export function CategoryBreakdown() {
  const { budget, loading, error } = useBudget();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Category Breakdown</h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Category Breakdown</h2>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-red-500">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  const expenseCategories = budget.categoryBreakdown.filter(cat => cat.amount > 0);

  if (expenseCategories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Category Breakdown</h2>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-400">
            No expense data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const colors = [
    'bg-primary',
    'bg-secondary',
    'bg-accent',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-pink-500',
    'bg-purple-500',
  ];

  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold">Category Breakdown</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {expenseCategories.map((category, index) => (
            <div key={category.category}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded-full ${colors[index % colors.length]}`} />
                  <span className="capitalize font-medium">{category.category}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold">${category.amount.toFixed(2)}</p>
                  <p className="text-sm text-gray-400">{category.percentage.toFixed(1)}%</p>
                </div>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${colors[index % colors.length]}`}
                  style={{ width: `${category.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}