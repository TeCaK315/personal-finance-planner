'use client';

import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { useBudget } from '@/hooks/useBudget';
import { Spinner } from '@/components/ui/Spinner';

export function MonthlyTrendChart() {
  const { budget, loading, error } = useBudget();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Monthly Trend</h2>
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
          <h2 className="text-2xl font-bold">Monthly Trend</h2>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-red-500">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (budget.monthlyTrend.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Monthly Trend</h2>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-400">
            No trend data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxValue = Math.max(
    ...budget.monthlyTrend.map(d => Math.max(d.income, d.expenses))
  );

  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold">Monthly Trend</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {budget.monthlyTrend.map((data) => (
            <div key={`${data.month}-${data.year}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{data.month} {data.year}</span>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-gray-400">Income: ${data.income.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-gray-400">Expenses: ${data.expenses.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="relative h-12 bg-slate-800 rounded-lg overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-green-500 opacity-50"
                  style={{ width: `${(data.income / maxValue) * 100}%` }}
                />
                <div
                  className="absolute top-0 left-0 h-full bg-red-500 opacity-50"
                  style={{ width: `${(data.expenses / maxValue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}